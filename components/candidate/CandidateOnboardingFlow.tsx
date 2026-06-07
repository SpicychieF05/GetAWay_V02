"use client";

import { useState } from 'react';
import { OnboardingStep } from './OnboardingStep';
import { ConsentStep } from './ConsentStep';
import { DeviceCheckStep } from './DeviceCheckStep';
import { InterviewRoom } from '@/components/room/InterviewRoom';
import { CandidateProfile } from '@/types';

type Step = 'onboarding' | 'consent' | 'saving' | 'device-check' | 'live';

interface CandidateOnboardingFlowProps {
  roomId: string;
  candidateUid: string;
  candidateToken: string;
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

  function handleProfileContinue(candidateProfile: CandidateProfile) {
    setProfile(candidateProfile);
    setStep('consent');
  }

  // Security: API call runs only after consent is accepted so consentGiven:true
  // and consentTimestamp are always recorded together as an atomic unit.
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

      setStep('device-check');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStep('consent');
    } finally {
      setIsConsenting(false);
    }
  }

  function handleDevicesReady(stream: MediaStream | null) {
    setPreAcquiredStream(stream);
    setStep('live');
  }

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

  return (
    <InterviewRoom
      roomId={roomId}
      role="candidate"
      preAcquiredStream={preAcquiredStream}
    />
  );
}

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
