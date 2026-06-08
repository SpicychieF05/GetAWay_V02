import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
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

  async signUp(email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const now = new Date().toISOString();

    await setDoc(doc(db, 'recruiters', user.uid), {
      uid: user.uid,
      email: user.email,
      role: 'recruiter',
      provider: 'password',
      createdAt: now,
      lastLoginAt: now,
      settings: {
        aiThreshold: 70,
      },
    });

    const idToken = await user.getIdToken();
    await setSessionCookie(idToken);

    return user;
  },

  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, 'recruiters', user.uid), {
      lastLoginAt: new Date().toISOString(),
    }, { merge: true });

    const idToken = await user.getIdToken(true);
    await setSessionCookie(idToken);

    return user;
  },

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const additionalInfo = getAdditionalUserInfo(result);
    const now = new Date().toISOString();

    if (additionalInfo?.isNewUser) {
      await setDoc(doc(db, 'recruiters', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'recruiter',
        provider: 'google',
        createdAt: now,
        lastLoginAt: now,
        settings: {
          aiThreshold: 70,
        },
      });
    } else {
      await setDoc(doc(db, 'recruiters', user.uid), {
        lastLoginAt: now,
      }, { merge: true });
    }

    const idToken = await user.getIdToken(true);
    await setSessionCookie(idToken);

    return user;
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
    await clearSessionCookie();
  },


  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },


  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};


export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && !('code' in error)) {
    return error.message;
  }
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
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
