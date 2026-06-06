export type RoomStatus = 'waiting' | 'active' | 'ended';

// ─── Candidate Onboarding (Phase 1) ──────────────────────────────────────────

/**
 * Candidate profile collected during the onboarding form (OnboardingStep).
 * Stored in rooms/{roomId}.candidate after API validation.
 */
export interface CandidateProfile {
  name: string;
  email: string;
  role: string;
}

/**
 * Candidate session document stored in rooms/{roomId}/candidateSessions/{candidateUid}.
 * Immutable consent audit record created server-side after the candidate accepts
 * the interview guidelines.
 */
export interface CandidateSession {
  name: string;
  email: string;
  role: string;
  consentGiven: true;           // Always literally true — required for schema
  consentTimestamp: string;     // ISO 8601 — when the checkbox was ticked
  sessionInitializedAt: string; // ISO 8601 server timestamp
  status: 'pending' | 'active' | 'ended';
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;                    // Secure ID like GW-a3f9e2b1c4d7f8a
  recruiterId: string;
  candidateUid?: string;         // Set when candidate joins anonymously (Phase 0)
  candidate?: CandidateProfile;  // Set after onboarding form submitted (Phase 1)
  candidateProfileSet?: boolean; // Guard against re-submission (Phase 1)
  joinedAt?: string;             // ISO — timestamp of first candidate join (Phase 1)
  status: RoomStatus;
  trustScore: number;
  candidateToken: string;
  createdAt: string;             // ISO string
  updatedAt: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert {
  id?: string;
  roomId: string;
  type: string; // e.g. 'multi_face', 'audio_anomalous'
  severity: AlertSeverity;
  timestamp: string; // ISO string
}

// ─── WebRTC ───────────────────────────────────────────────────────────────────

export interface WebRTCNode {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface ICECandidate {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
}
