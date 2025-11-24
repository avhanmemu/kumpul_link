// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Verify password against environment variable or default
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== expectedPassword) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    // Buat response dengan cookie
    const response = NextResponse.json({ success: true, message: 'Login berhasil' });
    response.cookies.set('admin_logged_in', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 jam
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan' }, { status: 500 });
  }
}