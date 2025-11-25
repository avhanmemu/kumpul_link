// app/api/links/[id]/click/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const db = await initDB();

    // Update click count for the specific link
    await db.run(
      `UPDATE links
       SET click_count = click_count + 1
       WHERE backend_id = ?`,
      [id]
    );

    // Get updated link with new click count
    const updatedLink = await db.get(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, created_at
      FROM links
      WHERE backend_id = ?`, [id]);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating click count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}