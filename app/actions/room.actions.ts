"use server";

import { adminDb } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

export async function createRoom(recruiterId: string) {
  // Use cryptographically secure identifiers
  const roomId = 'GW-' + randomBytes(8).toString('hex');
  const candidateToken = randomBytes(16).toString('hex');

  await adminDb.collection('rooms').doc(roomId).set({
    recruiterId,
    status: 'waiting',
    trustScore: 100, // starting score
    candidateToken,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return { roomId, candidateToken };
}
