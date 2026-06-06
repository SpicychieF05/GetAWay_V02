import { db } from '@/lib/firebase';
import {
  collection, doc, getDoc, getDocs, onSnapshot,
  query, where, updateDoc, setDoc, addDoc
} from 'firebase/firestore';
import { Room, WebRTCNode, ICECandidate } from '@/types';

const ROOMS_COLLECTION = 'rooms';

export const roomService = {
  subscribeToRoom(roomId: string, callback: (room: Room | null) => void) {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Room);
      } else {
        callback(null);
      }
    });
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snapshot = await getDoc(roomRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Room;
    }
    return null;
  },

  async updateRoom(roomId: string, data: Partial<Room>) {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  async getRecruiterRooms(recruiterId: string): Promise<Room[]> {
    const q = query(collection(db, ROOMS_COLLECTION), where("recruiterId", "==", recruiterId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
  }
};

export const webrtcService = {
  // Signaling (Offer/Answer)
  subscribeToSignalingNode(roomId: string, nodeId: 'offer' | 'answer', callback: (data: WebRTCNode | null) => void) {
    const nodeRef = doc(db, `rooms/${roomId}/webrtc/${nodeId}`);
    return onSnapshot(nodeRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as WebRTCNode);
      } else {
        callback(null);
      }
    });
  },

  async setSignalingNode(roomId: string, nodeId: 'offer' | 'answer', data: WebRTCNode) {
    const nodeRef = doc(db, `rooms/${roomId}/webrtc/${nodeId}`);
    await setDoc(nodeRef, data);
  },

  // ICE Candidates
  subscribeToCandidates(roomId: string, collectionName: 'callerCandidates' | 'calleeCandidates', callback: (candidate: ICECandidate) => void) {
    const candidatesRef = collection(db, `rooms/${roomId}/${collectionName}`);
    return onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback(change.doc.data() as ICECandidate);
        }
      });
    });
  },

  async addCandidate(roomId: string, collectionName: 'callerCandidates' | 'calleeCandidates', candidate: ICECandidate) {
    const candidatesRef = collection(db, `rooms/${roomId}/${collectionName}`);
    await addDoc(candidatesRef, candidate);
  }
};
