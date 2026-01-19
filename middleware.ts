import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('userRole')?.value;

  // Only run middleware for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!role) {
      // Not logged in or no role cookie, redirect to login
      return NextResponse.redirect(new URL('/register', request.url));
    }
    if (
      role === 'admin' &&
      !pathname.startsWith('/dashboard/admin') &&
      pathname !== '/dashboard/settings' &&
      pathname !== '/dashboard/analytics'
    ) {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    if (role === 'student' && !pathname.startsWith('/dashboard/student')) {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }
    if (role === 'staff' && !pathname.startsWith('/dashboard/staff')) {
      return NextResponse.redirect(new URL('/dashboard/staff', request.url));
    }
  }
  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
