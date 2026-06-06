/**
 * lib/firebase-admin.ts
 * Firebase Admin SDK initialization for server-side use only.
 *
 * Credential resolution order:
 *   1. Explicit service account (FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL)
 *      → Used on Vercel and in local dev with a downloaded service account JSON.
 *   2. Application Default Credentials (ADC)
 *      → Used automatically in AI Studio / Google Cloud environments.
 */
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0521483214';
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (privateKey && clientEmail) {
    // Explicit service account credentials (Vercel / local dev)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        // Escape sequence in env vars: newline characters are stored as \n literal strings.
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });
  } else {
    // Application Default Credentials (AI Studio / Google Cloud Run)
    admin.initializeApp({ projectId });
  }
}

// Firestore — use FIREBASE_ADMIN_DATABASE_ID if set, otherwise fall back to the
// project-specific database used during AI Studio development.
const databaseId =
  process.env.FIREBASE_ADMIN_DATABASE_ID ||
  'ai-studio-24585cb4-b4e0-4510-9a4c-7dc7008f0412';

export const adminDb = admin.firestore();
adminDb.settings({ databaseId });

export const adminAuth = admin.auth();

