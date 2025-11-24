// app/api/auth/password/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function PUT(request) {
  try {
    // Hanya diperbolehkan jika sudah login sebagai admin
    const cookie = request.headers.get('cookie');
    const isLoggedIn = cookie && cookie.includes('admin_logged_in=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' }, { status: 401 });
    }
    
    const db = await initDB();
    const { currentPassword, newPassword } = await request.json();

    // Ambil password saat ini dari database
    const admin = await db.get('SELECT id, password FROM admin LIMIT 1');
    
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin tidak ditemukan.' }, { status: 404 });
    }

    // Cocokkan password saat ini
    if (admin.password !== currentPassword) {
      return NextResponse.json({ success: false, message: 'Password saat ini salah.' }, { status: 400 });
    }

    // Update password
    await db.run(
      'UPDATE admin SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPassword, admin.id]
    );
    
    return NextResponse.json({ success: true, message: 'Password berhasil diubah.' });
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
    
    const db = await initDB();
    
    // Ambil informasi admin (hanya tanggal update, bukan password)
    const admin = await db.get('SELECT updated_at FROM admin LIMIT 1');
    
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin tidak ditemukan.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, lastUpdated: admin.updated_at });
  } catch (error) {
    console.error('Error fetching admin info:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan saat mengambil informasi admin.' }, { status: 500 });
  }
}