"use client";

import { InterviewRoom } from '@/components/room/InterviewRoom';
import { use } from 'react';

export default function RecruiterRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);

  // Note: For MVP, we assume the recruiter is already logged in and authenticated
  // via Firebase Auth, so Firestore rules will pass.
  
  return <InterviewRoom roomId={roomId} role="recruiter" />;
}
