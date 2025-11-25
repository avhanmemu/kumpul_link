// app/api/links/[id]/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { title, link_label, link_url, ad_url, icon_image } = await request.json();

    const db = await initDB();

    // Update link
    await db.run(
      `UPDATE links
       SET title = ?, link_label = ?, link_url = ?, ad_url = ?, icon_image = ?
       WHERE backend_id = ?`,
      [title, link_label, link_url, ad_url || null, icon_image, id]
    );

    // Get updated link
    const updatedLink = await db.get(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, ad_shown, created_at
      FROM links
      WHERE backend_id = ?`, [id]);

    if (!updatedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const db = await initDB();

    // Delete link
    await db.run('DELETE FROM links WHERE backend_id = ?', [id]);

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const db = await initDB();

    // Get specific link
    const link = await db.get(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, ad_shown, created_at
      FROM links
      WHERE backend_id = ?`, [id]);

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}