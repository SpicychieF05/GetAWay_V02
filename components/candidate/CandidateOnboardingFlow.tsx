"use client";

/**
 * components/candidate/CandidateOnboardingFlow.tsx
 * Phase 1 — Multi-step Candidate Onboarding Wizard
 *
 * Flow (PRD §8 Candidate Flow / FSD §14 Page 7):
 *   Step 0 — OnboardingStep   (name / email / role)
 *   Step 1 — ConsentStep      (interview rules + explicit consent)
 *   Step 2 — [API call]       POST /api/candidate/profile (profile + consent persisted)
 *   Step 3 — DeviceCheckStep  (camera / mic pre-flight)
 *   Step 4 — InterviewRoom    (live WebRTC session)
 *
 * Security (Security Architecture §10):
 *   The API call happens AFTER consent is accepted so that
 *   consentGiven:true and a consentTimestamp are always recorded together.
 *   If the API call fails, the candidate is shown an error and cannot proceed.
 */
import { useState } from 'react';
import { OnboardingStep } from './OnboardingStep';
import { ConsentStep } from './ConsentStep';
import { DeviceCheckStep } from './DeviceCheckStep';
import { InterviewRoom } from '@/components/room/InterviewRoom';
import { CandidateProfile } from '@/types';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

type Step = 'onboarding' | 'consent' | 'saving' | 'device-check' | 'live';

interface CandidateOnboardingFlowProps {
  roomId: string;
  candidateUid: string;
  candidateToken: string;
  /** If the profile was already saved in a previous page load, skip to device check */
  skipToDeviceCheck?: boolean;
}

export function CandidateOnboardingFlow({
  roomId,
  candidateUid,
  candidateToken,
  skipToDeviceCheck = false,
}: CandidateOnboardingFlowProps) {
  const [step, setStep] = useState<Step>(skipToDeviceCheck ? 'device-check' : 'onboarding');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [preAcquiredStream, setPreAcquiredStream] = useState<MediaStream | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isConsenting, setIsConsenting] = useState(false);

  // ── Step 0 → Step 1: Candidate filled in the form ──────────────────────────
  function handleProfileContinue(candidateProfile: CandidateProfile) {
    setProfile(candidateProfile);
    setStep('consent');
  }

  // ── Step 1 → Step 2: Candidate accepted consent ────────────────────────────
  async function handleConsentAccept(consentTimestamp: string) {
    if (!profile) return;
    setSaveError(null);
    setIsConsenting(true);
    setStep('saving');

    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          candidateToken,
          candidateUid,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          consentGiven: true,
          consentTimestamp,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to save profile. Please try again.');
      }

      // Profile and consent persisted — proceed to device check
      setStep('device-check');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSaveError(msg);
      // Roll back to consent step so the candidate can retry
      setStep('consent');
    } finally {
      setIsConsenting(false);
    }
  }

  // ── Step 3 → Step 4: Devices checked ──────────────────────────────────────
  function handleDevicesReady(stream: MediaStream | null) {
    setPreAcquiredStream(stream);
    setStep('live');
  }

  // ── Render steps ───────────────────────────────────────────────────────────

  if (step === 'onboarding') {
    return <OnboardingStep onContinue={handleProfileContinue} />;
  }

  if (step === 'consent') {
    return (
      <ConsentStep
        candidateName={profile?.name ?? 'Candidate'}
        onAccept={handleConsentAccept}
        isSubmitting={isConsenting}
        saveError={saveError ?? undefined}
      />
    );
  }

  if (step === 'saving') {
    return <SavingScreen />;
  }

  if (step === 'device-check') {
    return <DeviceCheckStep onDevicesReady={handleDevicesReady} />;
  }

  // step === 'live'
  return (
    <InterviewRoom
      roomId={roomId}
      role="candidate"
      preAcquiredStream={preAcquiredStream}
    />
  );
}

// ── Internal: Saving / Persisting Screen ──────────────────────────────────────

function SavingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
      <div className="text-center">
        <p className="text-sm font-medium text-text-primary">Securing your session…</p>
        <p className="text-xs text-text-secondary mt-1">
          Recording consent and initializing session.
        </p>
      </div>
    </div>
  );
}
