/**
 * services/auth.service.ts
 * Firebase Authentication operations for recruiter sign-up, sign-in, and sign-out.
 *
 * Pattern:
 *   1. Perform Firebase Auth operation (client SDK).
 *   2. Get a fresh ID token.
 *   3. POST to /api/auth/session → server verifies token and sets httpOnly cookie.
 *
 * The httpOnly cookie (__session) is what Next.js middleware reads to protect routes.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ─── Internal helpers ────────────────────────────────────────────────────────

async function setSessionCookie(idToken: string): Promise<void> {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? 'Failed to establish session. Please try again.');
  }
}

async function clearSessionCookie(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Creates a new recruiter account.
   * Writes a recruiters/{uid} profile document on first sign-up.
   */
  async signUp(email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Persist recruiter profile — will be blocked by Firestore rules if uid mismatch
    await setDoc(doc(db, 'recruiters', user.uid), {
      email: user.email,
      createdAt: new Date().toISOString(),
      settings: {
        aiThreshold: 70, // PRD §19: default trust alert threshold
      },
    });

    // Set server-side session cookie
    const idToken = await user.getIdToken();
    await setSessionCookie(idToken);

    return user;
  },

  /**
   * Signs in an existing recruiter and establishes an httpOnly session cookie.
   */
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Force-refresh to ensure a fresh token (<5 min) for createSessionCookie.
    const idToken = await user.getIdToken(true);
    await setSessionCookie(idToken);

    return user;
  },

  /**
   * Signs out the current user and clears the session cookie.
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
    await clearSessionCookie();
  },

  /**
   * Subscribes to Firebase auth state changes.
   * Returns the unsubscribe function.
   */
  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Returns the currently authenticated user synchronously.
   * May be null if the auth state hasn't loaded yet — use onAuthChange for reactive access.
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};

/**
 * Translates Firebase Auth error codes into user-friendly messages.
 */
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as AuthError)?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
