// app/api/auth/password/route.js
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    // Hanya diperbolehkan jika sudah login sebagai admin
    const cookie = request.headers.get('cookie');
    const isLoggedIn = cookie && cookie.includes('admin_logged_in=true');

    if (!isLoggedIn) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Cek currentPassword terhadap environment variable
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (currentPassword !== expectedPassword) {
      return NextResponse.json({ success: false, message: 'Password saat ini salah.' }, { status: 400 });
    }

    // Update password in environment variable would require Vercel deployment configuration
    // For now, we'll return a message that password change is not supported in serverless environment
    // since environment variables need to be set at deployment time
    return NextResponse.json({
      success: false,
      message: 'Mengganti password melalui API tidak didukung dalam lingkungan serverless. Harap set melalui environment variable di Vercel.'
    }, { status: 400 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan saat mengganti password.' }, { status: 500 });
  }
}

// Endpoint untuk mendapatkan informasi admin (untuk keperluan tampilan)
export async function GET(request) {
  try {
    // Hanya diperbolehkan jika sudah login sebagai admin
    const cookie = request.headers.get('cookie');
    const isLoggedIn = cookie && cookie.includes('admin_logged_in=true');

    if (!isLoggedIn) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    // Return basic admin info without sensitive data
    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      message: 'Serverless environment - password managed via environment variables'
    });
  } catch (error) {
    console.error('Error fetching admin info:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan saat mengambil informasi admin.' }, { status: 500 });
  }
}