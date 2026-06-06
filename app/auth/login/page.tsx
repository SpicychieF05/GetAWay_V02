"use client";

/**
 * app/auth/login/page.tsx
 * Recruiter login page.
 *
 * PRD §6: "Email/password login, Session persistence"
 * FTL AUTH-001 + AUTH-002: Login UI wired to Firebase Auth.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { authService, getAuthErrorMessage } from '@/services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      router.push('/recruiter');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows — matches root page.tsx */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex items-center space-x-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
            <span className="text-black font-black font-display text-lg">GW</span>
          </div>
          <span className="text-2xl font-display font-semibold text-text-primary tracking-tight">
            GetAWay
          </span>
        </div>

        <div className="bg-surface-base border border-border rounded-xl p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-display font-medium text-text-primary tracking-tight">
              Recruiter Sign In
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Access your interview monitoring dashboard.
            </p>
          </div>

          {/* Inline error — FSD: "Error states are inline, not separate screens" */}
          {error && (
            <div className="flex items-start space-x-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-[10px] uppercase font-medium text-text-muted tracking-widest"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="recruiter@company.com"
                  className="w-full bg-background border border-border-strong rounded-md pl-10 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors placeholder:text-text-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-[10px] uppercase font-medium text-text-muted tracking-widest"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-background border border-border-strong rounded-md pl-10 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary transition-colors placeholder:text-text-muted"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-brand-primary text-black font-bold hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="text-sm text-text-secondary text-center">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-brand-accent hover:text-text-primary transition-colors font-medium"
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-text-muted mt-6 font-mono">
          © 2026 GetAWay Inc. — Secure Interview Platform
        </p>
      </div>
    </div>
  );
}
