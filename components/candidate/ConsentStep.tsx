"use client";

import { useState } from 'react';
import { ArrowRight, Camera, Mic, ShieldCheck, AlertCircle, Loader2, Check } from 'lucide-react';

interface ConsentStepProps {
  candidateName: string;
  onAccept: (consentTimestamp: string) => void;
  isSubmitting?: boolean;
  saveError?: string;
}

const INTERVIEW_RULES = [
  {
    icon: Camera,
    title: 'Camera Required',
    description:
      'Your camera must remain active for the duration of the interview. Ensure you are clearly visible.',
  },
  {
    icon: Mic,
    title: 'Microphone Access',
    description:
      'Your microphone must be enabled. Ensure you are in a quiet environment free from background noise.',
  },
  {
    icon: AlertCircle,
    title: 'AI Proctoring Active',
    description:
      'This interview is monitored by an AI proctoring system that detects anomalies such as multiple faces, background activity, and tab switching.',
  },
  {
    icon: ShieldCheck,
    title: 'Full Attention Required',
    description:
      'Switching browser tabs or windows during the interview will be flagged. Please keep this tab in focus at all times.',
  },
];

export function ConsentStep({ candidateName, onAccept, isSubmitting = false, saveError }: ConsentStepProps) {
  const [consented, setConsented] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);

  function handleConsentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setConsented(checked);
    // Security: capture the client-side timestamp at the exact moment of consent
    setConsentTimestamp(checked ? new Date().toISOString() : null);
  }

  function handleSubmit() {
    if (!consented || !consentTimestamp) return;
    onAccept(consentTimestamp);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-brand-primary/3 blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-in slide-in-from-right-8 duration-500 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-black text-sm">
            GW
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-text-primary">
            GetAWay
          </span>
        </div>

        <div className="bg-surface-base border border-border-strong rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-8 pt-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h1 className="text-lg font-display font-semibold text-text-primary tracking-tight">
                  Interview Guidelines
                </h1>
                <p className="text-xs text-text-secondary mt-0.5">
                  Hi {candidateName} — please review the rules before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 pt-6">
            <div className="h-52 overflow-y-auto rounded-xl border border-border bg-black/20 p-1 scrollbar-thin">
              <div className="space-y-1 p-3">
                {INTERVIEW_RULES.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            <label
              htmlFor="consent-checkbox"
              className="flex items-start gap-3 p-4 rounded-xl bg-brand-surface border border-brand-primary/20 cursor-pointer hover:bg-brand-primary/[0.08] transition-colors group"
            >
              <div className="relative mt-0.5 shrink-0">
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={consented}
                  onChange={handleConsentChange}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${consented
                      ? 'bg-brand-primary border-brand-primary'
                      : 'bg-transparent border-brand-primary/40 group-hover:border-brand-primary/70'
                    }`}
                >
                  {consented && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-text-primary">
                  I agree to the interview terms and conditions
                </p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  I consent to being monitored by the AI proctoring system and agree to
                  follow all guidelines listed above. I understand that violations will be
                  flagged in the post-session report.
                </p>
              </div>
            </label>
          </div>

          <div className="px-8 pb-8">
            <button
              id="enter-live-room-btn"
              type="button"
              onClick={handleSubmit}
              disabled={!consented || isSubmitting}
              className="w-full h-10 rounded-lg bg-brand-primary text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors shadow-[0_0_20px_rgba(20,184,166,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Enter Interview
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {saveError && (
              <p className="text-sm text-rose-400 font-medium mt-3 text-center" role="alert">
                {saveError}
              </p>
            )}
            {!consented && !saveError && (
              <p className="text-center text-xs text-text-muted mt-3">
                Please read and accept the guidelines to continue.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 px-4 py-3 rounded-xl border border-border bg-surface-elevated text-center">
          <p className="text-xs text-text-muted">
            <span className="text-brand-primary font-medium">Privacy: </span>
            We do not collect keystrokes, browser history, or local files. Only
            video, audio, and behavioral signals are monitored during the session.
          </p>
        </div>
      </div>
    </div>
  );
}
