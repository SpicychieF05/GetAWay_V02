/**
 * app/api/candidate/profile/route.ts
 * POST /api/candidate/profile
 *
 * Phase 1 — Candidate Onboarding: Persist candidate profile and consent.
 *
 * Security model (PRD §23 / Security Architecture §10):
 *   - No Firebase Auth token required (candidate is unauthenticated by design).
 *   - Room ID acts as the namespace; candidateToken is the access credential.
 *   - All writes go through Firebase Admin SDK — never directly from the client.
 *   - consentGiven must be literally `true` (z.literal) — enforced by schema.
 *   - candidateProfileSet guard prevents overwrite after first submission.
 *
 * Firestore writes:
 *   1. rooms/{roomId}  → { candidate, candidateProfileSet: true, updatedAt }
 *   2. rooms/{roomId}/candidateSessions/{candidateUid} → consent audit record
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// ─── Zod schema ───────────────────────────────────────────────────────────────

const CandidateProfileSchema = z.object({
  roomId:           z.string().min(1),
  candidateToken:   z.string().min(1),
  candidateUid:     z.string().min(1),     // Firebase anonymous UID
  name:             z.string().min(1).max(100).trim(),
  email:            z.string().email().trim().toLowerCase(),
  role:             z.string().min(1).max(100).trim(),
  consentGiven:     z.literal(true),       // Must be exactly `true`
  consentTimestamp: z.string().datetime(), // ISO 8601 datetime
});

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;

  // ── 1. Parse body ────────────────────────────────────────────────────────────
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // ── 2. Validate with Zod ─────────────────────────────────────────────────────
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

    // ── 3. Room existence check ──────────────────────────────────────────────
    if (!roomSnap.exists) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    const room = roomSnap.data()!;

    // ── 4. Token validation ──────────────────────────────────────────────────
    if (room.candidateToken !== candidateToken) {
      return NextResponse.json({ error: 'Invalid candidate token.' }, { status: 403 });
    }

    // ── 5. Room status check — reject ended rooms ────────────────────────────
    if (room.status === 'ended') {
      return NextResponse.json(
        { error: 'This interview session has already ended.' },
        { status: 403 }
      );
    }

    // ── 6. Idempotency guard — prevent profile overwrite ─────────────────────
    if (room.candidateProfileSet === true) {
      // Treat as success — allows page re-renders without double-writing
      return NextResponse.json({ success: true, alreadySet: true });
    }

    // ── 7. UID match guard — ensure token caller matches the joined candidate ──
    // candidateUid was written by /api/room/join; cross-check to prevent
    // a different anonymous user from submitting for this room.
    if (room.candidateUid && room.candidateUid !== candidateUid) {
      return NextResponse.json(
        { error: 'Candidate session mismatch.' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // ── 8. Batch write: room candidate field + consent subcollection ──────────
    const batch = adminDb.batch();

    // Update room document with candidate profile
    batch.update(roomRef, {
      candidate: { name, email, role },
      candidateProfileSet: true,
      updatedAt: now,
    });

    // Create immutable consent audit record in candidateSessions subcollection
    const sessionRef = roomRef.collection('candidateSessions').doc(candidateUid);
    batch.set(sessionRef, {
      name,
      email,
      role,
      consentGiven,               // true
      consentTimestamp,           // Client-captured ISO timestamp (when checkbox ticked)
      sessionInitializedAt: now,  // Server-verified timestamp
      status: 'pending',
    });

    await batch.commit();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[POST /api/candidate/profile] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
