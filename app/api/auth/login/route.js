// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const db = await initDB();
    const admin = await db.get('SELECT id, password FROM admin LIMIT 1');

    if (!admin || admin.password !== password) {
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
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan' }, { status: 500 });
  }
}