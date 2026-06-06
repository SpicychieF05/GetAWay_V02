import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { roomId, token, candidateUid } = await req.json();

    if (!roomId || !token || !candidateUid) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const docSnap = await roomRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    const roomData = docSnap.data()!;

    // ── Token validation ──────────────────────────────────────────────────────
    if (roomData.candidateToken !== token) {
      return NextResponse.json({ error: 'Invalid candidate token.' }, { status: 403 });
    }

    // ── Room status check — reject ended rooms before any write ───────────────
    if (roomData.status === 'ended') {
      return NextResponse.json(
        { error: 'This interview session has already ended.' },
        { status: 403 }
      );
    }

    // ── Attach candidateUid and record joinedAt (first join only) ─────────────
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      candidateUid,
      updatedAt: now,
    };

    // Only write joinedAt on the first join (idempotent re-joins keep original)
    if (!roomData.joinedAt) {
      updatePayload.joinedAt = now;
    }

    await roomRef.update(updatePayload);

    return NextResponse.json({
      success: true,
      roomStatus: roomData.status as string,
      // Return the candidate profile set flag so the page knows whether
      // the onboarding form needs to be shown or can be skipped.
      candidateProfileSet: roomData.candidateProfileSet ?? false,
    });

  } catch (error) {
    console.error('[POST /api/room/join] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}

