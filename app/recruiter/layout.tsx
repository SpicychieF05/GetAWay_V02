"use client";

/**
 * app/recruiter/layout.tsx
 * Shared layout for all recruiter dashboard pages.
 *
 * Auth layer 2 of 3 (see middleware.ts for layer 1):
 *   - Listens to Firebase onAuthStateChanged.
 *   - If the auth state resolves to null (signed out or token expired),
 *     redirect to /auth/login as a client-side backup to the middleware.
 *   - Passes the user's email to the Sidebar for display.
 *   - Wires the Sign Out button to authService.signOut().
 */
import { Sidebar } from '@/components/layout/Sidebar';
import { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  // undefined = loading (auth state not yet determined)
  // null      = definitively signed out → will redirect
  // User      = authenticated → render dashboard
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.push('/auth/login');
      }
    });
    return () => unsub();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } finally {
      // Always redirect after sign-out attempt, even if cookie clear fails.
      router.push('/auth/login');
    }
  };

  // Auth state is still loading — show spinner, prevent content flash.
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <span className="text-text-secondary font-display tracking-wide uppercase text-sm">
          Authenticating...
        </span>
      </div>
    );
  }

  // User is null (signed out) — redirect is in flight, render nothing.
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userEmail={user.email ?? undefined} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-surface-base flex items-center px-6 shrink-0 justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-black border border-border-strong rounded-full text-[10px] font-mono text-brand-accent tracking-widest uppercase">
              <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></div>
              <span>Signaling_UP_01</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                id="recruiter-sign-out"
                onClick={handleSignOut}
                className="text-[11px] font-mono font-medium text-text-secondary hover:text-text-primary uppercase tracking-widest px-3 py-1.5 rounded-md bg-surface-hover transition-colors border border-border"
              >
                Sign Out
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-surface-elevated to-surface-hover border border-border flex items-center justify-center text-xs font-mono text-brand-accent font-bold">
                {user.email ? user.email[0].toUpperCase() : 'R'}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}

