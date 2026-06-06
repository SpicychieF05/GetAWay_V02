/**
 * middleware.ts
 * Next.js Edge Middleware — first line of defense for route protection.
 *
 * Security Architecture §5 (FTL AUTH-003):
 * "Implement Next.js middleware to protect all routes under /recruiter/*"
 *
 * HOW IT WORKS
 * ─────────────
 * After a recruiter signs in, the client calls POST /api/auth/session which
 * verifies the Firebase ID token server-side and sets an httpOnly cookie
 * named __session. This middleware checks for that cookie on every request.
 *
 * WHY NOT VERIFY THE TOKEN HERE?
 * ────────────────────────────────
 * Next.js middleware runs on the Edge runtime. The firebase-admin package
 * is Node.js-only and cannot run on Edge. Full cryptographic token verification
 * happens at the API route layer (via adminAuth.verifyIdToken / verifySessionCookie).
 * The middleware provides fast redirection; the API layer provides true security.
 *
 * LAYERS OF PROTECTION
 * ─────────────────────
 *   Layer 1 → This middleware (fast, cookie presence check)
 *   Layer 2 → Client-side onAuthStateChanged in app/recruiter/layout.tsx
 *   Layer 3 → Firestore rules (isRoomOwner = request.auth.uid == recruiterId)
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = '__session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  // ── Protect recruiter dashboard routes ─────────────────────────────────────
  if (pathname.startsWith('/recruiter')) {
    if (!sessionCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      // Preserve the original destination so we can redirect back after login (future).
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Prevent authenticated users from seeing auth pages ─────────────────────
  // If a user with a valid session cookie navigates to /auth/login or /auth/signup,
  // redirect them straight to the dashboard.
  if (pathname.startsWith('/auth')) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/recruiter', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all recruiter and auth routes.
    // Exclude Next.js internals and static assets.
    '/recruiter/:path*',
    '/auth/:path*',
  ],
};

