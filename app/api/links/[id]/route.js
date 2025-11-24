// app/api/links/[id]/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

// GET a single link by ID
export async function GET(request, { params }) {
  try {
    const db = await initDB();
    const link = await db.get('SELECT * FROM links WHERE backend_id = ?', [params.id]);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE a link by ID
export async function PUT(request, { params }) {
  try {
    const { title, link_label, link_url, icon_image } = await request.json();

    const db = await initDB();
    const result = await db.run(
      `UPDATE links
       SET title = ?, link_label = ?, link_url = ?, icon_image = ?
       WHERE backend_id = ?`,
      [title, link_label, link_url, icon_image, params.id]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Get the updated link including click count
    const updatedLink = await db.get(`
      SELECT backend_id, title, link_label, link_url, icon_image, click_count, created_at
      FROM links
      WHERE backend_id = ?`,
      [params.id]
    );
    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a link by ID
export async function DELETE(request, { params }) {
  try {
    const db = await initDB();
    const result = await db.run('DELETE FROM links WHERE backend_id = ?', [params.id]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}