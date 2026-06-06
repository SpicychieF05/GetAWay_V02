"use client";

import { CandidateOnboardingFlow } from '@/components/candidate/CandidateOnboardingFlow';
import { useSearchParams, useParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AlertTriangle, Loader2, Clock } from 'lucide-react';

type PageState = 'loading' | 'ready' | 'error-ended' | 'error-invalid' | 'error-generic';

interface JoinResult {
  candidateUid: string;
  candidateProfileSet: boolean;
}

export default function CandidateRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [joinResult, setJoinResult] = useState<JoinResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function authorizeCandidate() {
      if (!roomId || !token) {
        setErrorMessage('This invitation link is incomplete or invalid.');
        setPageState('error-invalid');
        return;
      }

      try {
        // ── Step 1: Sign in anonymously ─────────────────────────────────────
        const userCred = await signInAnonymously(auth);
        const candidateUid = userCred.user.uid;

        // ── Step 2: Validate token + attach candidateUid ────────────────────
        const res = await fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, token, candidateUid }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));

          if (res.status === 403 && body?.error?.toLowerCase().includes('ended')) {
            setPageState('error-ended');
          } else if (res.status === 403 || res.status === 404) {
            setErrorMessage(body?.error ?? 'Invalid or expired invitation link.');
            setPageState('error-invalid');
          } else {
            setErrorMessage(body?.error ?? 'Unable to join the room. Please try again.');
            setPageState('error-generic');
          }
          return;
        }

        const data = await res.json();
        setJoinResult({
          candidateUid,
          candidateProfileSet: data.candidateProfileSet ?? false,
        });
        setPageState('ready');

      } catch {
        setErrorMessage('A network error occurred. Please check your connection and try again.');
        setPageState('error-generic');
      }
    }

    authorizeCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, token]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">Preparing secure environment…</p>
          <p className="text-xs text-text-secondary mt-1">Validating your invitation link.</p>
        </div>
      </div>
    );
  }

  // ── Room Ended ────────────────────────────────────────────────────────────
  if (pageState === 'error-ended') {
    return (
      <ErrorScreen
        icon={<Clock className="w-8 h-8 text-amber-400" />}
        iconBg="bg-amber-500/10 border-amber-500/20"
        title="Interview Session Ended"
        message="This interview session has already concluded. The link is no longer valid."
      />
    );
  }

  // ── Invalid / Not Found ───────────────────────────────────────────────────
  if (pageState === 'error-invalid') {
    return (
      <ErrorScreen
        icon={<AlertTriangle className="w-8 h-8 text-rose-400" />}
        iconBg="bg-rose-500/10 border-rose-500/20"
        title="Invalid Invitation Link"
        message={errorMessage ?? 'This invitation link is invalid or has expired.'}
      />
    );
  }

  // ── Generic Error ─────────────────────────────────────────────────────────
  if (pageState === 'error-generic') {
    return (
      <ErrorScreen
        icon={<AlertTriangle className="w-8 h-8 text-rose-400" />}
        iconBg="bg-rose-500/10 border-rose-500/20"
        title="Unable to Join"
        message={errorMessage ?? 'An unexpected error occurred. Please try again.'}
        showRetry
      />
    );
  }

  // ── Ready: Render Onboarding Flow ────────────────────────────────────────
  if (pageState === 'ready' && joinResult) {
    return (
      <CandidateOnboardingFlow
        roomId={roomId}
        candidateUid={joinResult.candidateUid}
        candidateToken={token!}
        // If profile was already saved (e.g., page refresh after consent),
        // skip straight to device check to avoid losing state.
        skipToDeviceCheck={joinResult.candidateProfileSet}
      />
    );
  }

  return null;
}

// ── Error Screen Component ────────────────────────────────────────────────────

interface ErrorScreenProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
  showRetry?: boolean;
}

function ErrorScreen({ icon, iconBg, title, message, showRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-black text-sm">
            GW
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-text-primary">
            GetAWay
          </span>
        </div>

        <div className="bg-surface-base border border-border-strong rounded-2xl p-8 shadow-2xl">
          <div
            className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4 ${iconBg}`}
          >
            {icon}
          </div>
          <h1 className="text-lg font-display font-semibold text-text-primary mb-2">{title}</h1>
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>

          {showRetry && (
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full h-9 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-surface-hover hover:text-text-primary transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

