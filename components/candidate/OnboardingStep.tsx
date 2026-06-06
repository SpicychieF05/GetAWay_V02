"use client";

import { useState } from 'react';
import { ArrowRight, Loader2, UserCircle2 } from 'lucide-react';
import { CandidateProfile } from '@/types';

interface OnboardingStepProps {
  onContinue: (profile: CandidateProfile) => void;
}

export function OnboardingStep({ onContinue }: OnboardingStepProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!role.trim()) return 'Please enter the role you are applying for.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      onContinue({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-brand-primary/3 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-in zoom-in-95 duration-500 relative z-10">
        {/* Logo strip */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-black text-sm">
            GW
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-text-primary">
            GetAWay
          </span>
        </div>

        {/* Card */}
        <div className="bg-surface-base border border-border-strong rounded-2xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-4">
              <UserCircle2 className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-xl font-display font-semibold text-text-primary tracking-tight">
              Welcome
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Please provide your details to begin the interview process.
            </p>
          </div>

          {/* Card Content */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-8 py-6 space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="candidate-name"
                  className="text-sm font-medium text-text-primary"
                >
                  Full Name
                </label>
                <input
                  id="candidate-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-lg border border-border bg-surface-hover text-text-primary placeholder:text-text-muted px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label
                  htmlFor="candidate-email"
                  className="text-sm font-medium text-text-primary"
                >
                  Email Address
                </label>
                <input
                  id="candidate-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-lg border border-border bg-surface-hover text-text-primary placeholder:text-text-muted px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Role Applying For */}
              <div className="space-y-2">
                <label
                  htmlFor="candidate-role"
                  className="text-sm font-medium text-text-primary"
                >
                  Role Applying For
                </label>
                <input
                  id="candidate-role"
                  type="text"
                  autoComplete="organization-title"
                  placeholder="e.g. Senior Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-lg border border-border bg-surface-hover text-text-primary placeholder:text-text-muted px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Inline validation error */}
              {error && (
                <p className="text-sm text-rose-400 font-medium" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-8 pb-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-lg bg-brand-primary text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors shadow-[0_0_20px_rgba(20,184,166,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Your information is used solely for this interview session.
        </p>
      </div>
    </div>
  );
}
