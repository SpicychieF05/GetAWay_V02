import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';

const CandidateProfileSchema = z.object({
  roomId:           z.string().min(1),
  candidateToken:   z.string().min(1),
  candidateUid:     z.string().min(1),
  name:             z.string().min(1).max(100).trim(),
  email:            z.string().email().trim().toLowerCase(),
  role:             z.string().min(1).max(100).trim(),
  consentGiven:     z.literal(true),
  consentTimestamp: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = CandidateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { roomId, candidateToken, candidateUid, name, email, role, consentGiven, consentTimestamp } = parsed.data;

  try {
    const roomRef = adminDb.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    const room = roomSnap.data()!;

    if (room.candidateToken !== candidateToken) {
      return NextResponse.json({ error: 'Invalid candidate token.' }, { status: 403 });
    }

    if (room.status === 'ended') {
      return NextResponse.json(
        { error: 'This interview session has already ended.' },
        { status: 403 }
      );
    }

    // Idempotent — allows page re-renders without double-writing
    if (room.candidateProfileSet === true) {
      return NextResponse.json({ success: true, alreadySet: true });
    }

    // Security: cross-check UID so a different anonymous user can't submit for this room
    if (room.candidateUid && room.candidateUid !== candidateUid) {
      return NextResponse.json({ error: 'Candidate session mismatch.' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const batch = adminDb.batch();

    batch.update(roomRef, {
      candidate: { name, email, role },
      candidateProfileSet: true,
      updatedAt: now,
    });

    batch.set(roomRef.collection('candidateSessions').doc(candidateUid), {
      name,
      email,
      role,
      consentGiven,
      consentTimestamp,
      sessionInitializedAt: now,
      status: 'pending',
    });

    await batch.commit();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[POST /api/candidate/profile]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
