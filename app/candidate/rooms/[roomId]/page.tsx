"use client";

import { InterviewRoom } from '@/components/room/InterviewRoom';
import { useSearchParams, useParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function CandidateRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function authorizeCandidate() {
      if (!roomId || !token) {
        setError('Invalid entry link.');
        return;
      }

      try {
        // 1. Sign in anonymously
        const userCred = await signInAnonymously(auth);
        const candidateUid = userCred.user.uid;

        // 2. Validate token (In a real app, this should be done purely server-side 
        // to prevent token leaking, but since rules aren't completely restricting read yet
        // or we need to update the uid directly).
        // Wait, if candidate reads without uid, rules will block it.
        // We MUST use a server action to attach the UID to the room.
        const res = await fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, token, candidateUid })
        });

        if (!res.ok) throw new Error('Failed to authorize');

        setAuthorized(true);
      } catch (err) {
        setError('Unauthorized access. The link may be expired.');
      }
    }
    authorizeCandidate();
  }, [roomId, token]);

  if (error) return <div className="text-rose-500 font-display p-6">{error}</div>;
  if (!authorized) return <div className="text-text-secondary font-display p-6">Preparing secure environment...</div>;

  return <InterviewRoom roomId={roomId} role="candidate" />;
}
