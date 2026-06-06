export type RoomStatus = 'waiting' | 'active' | 'ended';

export interface Room {
  id: string; // Secure ID like GW-a3f9e2b1c4d7f8a
  recruiterId: string;
  candidateUid?: string; // Set when candidate joins anonymously
  status: RoomStatus;
  trustScore: number;
  candidateToken: string;
  createdAt: string; // ISO string
  updatedAt: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert {
  id?: string;
  roomId: string;
  type: string; // e.g. 'multi_face', 'audio_anomalous'
  severity: AlertSeverity;
  timestamp: string; // ISO string
}

export interface WebRTCNode {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface ICECandidate {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
}
