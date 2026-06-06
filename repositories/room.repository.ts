/**
 * repositories/room.repository.ts
 * Thin repository adapter over the Firebase client service.
 *
 * Why this exists:
 *   app/recruiter/sessions/page.tsx imports roomRepository from this path.
 *   The repository pattern keeps pages decoupled from the data source so
 *   the underlying service can change without touching every consumer.
 */
import { roomService } from '@/services/firebase.client';
import { Room } from '@/types';

export const roomRepository = {
  /**
   * Fetches all interview rooms owned by the given recruiter.
   * Requires the caller to be authenticated — Firestore rules enforce isRoomOwner().
   */
  async getRecruiterRooms(recruiterId: string): Promise<Room[]> {
    return roomService.getRecruiterRooms(recruiterId);
  },

  /**
   * Fetches a single room by ID.
   * Returns null if not found or the caller doesn't own the room.
   */
  async getRoom(roomId: string): Promise<Room | null> {
    return roomService.getRoom(roomId);
  },
};
