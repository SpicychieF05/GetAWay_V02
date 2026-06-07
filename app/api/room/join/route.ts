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

    if (roomData.candidateToken !== token) {
      return NextResponse.json({ error: 'Invalid candidate token.' }, { status: 403 });
    }

    if (roomData.status === 'ended') {
      return NextResponse.json(
        { error: 'This interview session has already ended.' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = { candidateUid, updatedAt: now };

    // Preserve original joinedAt across re-joins
    if (!roomData.joinedAt) {
      updatePayload.joinedAt = now;
    }

    await roomRef.update(updatePayload);

    return NextResponse.json({
      success: true,
      roomStatus: roomData.status as string,
      candidateProfileSet: roomData.candidateProfileSet ?? false,
    });

  } catch (error) {
    console.error('[POST /api/room/join]', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
