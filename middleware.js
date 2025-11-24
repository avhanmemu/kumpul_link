// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Jika pathnya adalah /admin (tapi bukan /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Cek apakah user sudah login (dengan cek cookie)
    const cookie = request.headers.get('cookie');
    const isLoggedIn = cookie && cookie.includes('admin_logged_in=true');

    // Jika belum login, redirect ke halaman login
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin']
};