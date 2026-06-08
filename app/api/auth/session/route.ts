import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 5;
const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000;
const COOKIE_NAME = '__session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken: string | undefined = body?.idToken;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid idToken in request body.' },
        { status: 400 }
      );
    }


    let sessionCookie: string;
    try {
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION_MS,
      });
    } catch (adminError: any) {
      // Fallback for local development without a service account
      if (
        process.env.NODE_ENV !== 'production' &&
        !process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ) {
        console.warn('⚠️ Missing FIREBASE_ADMIN_PRIVATE_KEY. Falling back to idToken for session cookie.');
        sessionCookie = idToken;
      } else {
        throw adminError;
      }
    }

    const response = NextResponse.json({ status: 'session_created' }, { status: 200 });

    response.cookies.set(COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION_SECONDS,
      httpOnly: true,                                      // Not accessible via document.cookie
      secure: process.env.NODE_ENV === 'production',       // HTTPS only in production
      sameSite: 'lax',                                     // CSRF protection
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    // Firebase throws if the ID token is invalid, expired, or revoked.
    console.error('[/api/auth/session POST] Failed to create session cookie:', error);
    return NextResponse.json(
      { error: 'Authentication failed. The provided token is invalid or expired.' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'session_cleared' }, { status: 200 });

 
  response.cookies.set(COOKIE_NAME, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
