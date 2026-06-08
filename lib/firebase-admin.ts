import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'getaway-v02';
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (privateKey && clientEmail) {

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,

        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });
  } else {
    admin.initializeApp({ projectId });
  }
}
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

