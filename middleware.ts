import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = '__session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith('/recruiter')) {
    if (!sessionCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/auth')) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/recruiter', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/recruiter/:path*',
    '/auth/:path*',
  ],
};

