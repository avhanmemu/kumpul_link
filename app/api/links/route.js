// app/api/links/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function GET() {
  try {
    const db = await initDB();
    const links = await db.all(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, created_at
      FROM links
      ORDER BY created_at DESC
    `);
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, link_label, link_url, ad_url, icon_image } = await request.json();

    const backend_id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const db = await initDB();
    await db.run(
      'INSERT INTO links (backend_id, title, link_label, link_url, ad_url, icon_image, click_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [backend_id, title, link_label, link_url, ad_url || null, icon_image, 0]
    );

    const newLink = await db.get(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, created_at
      FROM links
      WHERE backend_id = ?`, [backend_id]);
    return NextResponse.json(newLink);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}