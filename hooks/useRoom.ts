import { useEffect, useState } from 'react';
import { Room } from '@/types';
import { roomService } from '@/services/firebase.client';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;
    
    const unsubscribe = roomService.subscribeToRoom(roomId, (data) => {
      setRoom(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { room, loading, error };
}
