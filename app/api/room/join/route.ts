import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { roomId, token, candidateUid } = await req.json();

    if (!roomId || !token || !candidateUid) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const docSnap = await roomRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const roomData = docSnap.data();

    // Validate the token
    if (roomData?.candidateToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    if (roomData?.status === 'ended') {
      return NextResponse.json({ error: 'Room has ended' }, { status: 403 });
    }

    // Assign the uid so Firestore rules allow candidate access
    await roomRef.update({
      candidateUid,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
