// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
    response.cookies.set('admin_logged_in', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Hapus cookie
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan' }, { status: 500 });
  }
}