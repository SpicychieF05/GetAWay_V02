export type RoomStatus = 'waiting' | 'active' | 'ended';

export interface CandidateProfile {
  name: string;
  email: string;
  role: string;
}

export interface CandidateSession {
  name: string;
  email: string;
  role: string;
  consentGiven: true;
  consentTimestamp: string;
  sessionInitializedAt: string;
  status: 'pending' | 'active' | 'ended';
}

export interface Room {
  id: string;
  recruiterId: string;
  candidateUid?: string;
  candidate?: CandidateProfile;
  candidateProfileSet?: boolean;
  joinedAt?: string;
  status: RoomStatus;
  trustScore: number;
  candidateToken: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert {
  id?: string;
  roomId: string;
  type: string;
  severity: AlertSeverity;
  timestamp: string;
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
