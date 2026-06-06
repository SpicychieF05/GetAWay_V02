/**
 * app/api/auth/session/route.ts
 * Server-side session cookie management.
 *
 * POST /api/auth/session
 *   Accepts a Firebase ID token from the client.
 *   Verifies it with Firebase Admin SDK.
 *   Creates a Firebase session cookie and sets it as httpOnly.
 *
 * DELETE /api/auth/session
 *   Clears the session cookie on sign-out.
 *
 * Why cookies instead of localStorage?
 *   - httpOnly cookies cannot be read by client-side JavaScript (XSS protection).
 *   - Cookies are sent with every request, allowing server-side middleware to check them.
 *   - Firebase ID tokens expire in 1 hour; session cookies can be valid for days.
 *
 * Security Architecture §5: "Create an API route that accepts an ID token and sets a
 * secure session cookie. Have the middleware verify this cookie."
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

// 5 days in seconds — a reasonable session duration for a recruiter workflow.
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

    // Verify the ID token and create a long-lived Firebase session cookie.
    // createSessionCookie validates the token is fresh (< 5 minutes old).
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

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

  // Expire the cookie immediately by setting maxAge to 0.
  response.cookies.set(COOKIE_NAME, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
