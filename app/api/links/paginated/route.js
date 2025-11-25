// app/api/links/paginated/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Calculate offset
    const offset = (page - 1) * limit;

    const db = await initDB();
    
    // Get total count
    const totalCountResult = await db.get('SELECT COUNT(*) as count FROM links');
    const totalCount = totalCountResult.count;
    
    // Get paginated links
    const links = await db.all(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, ad_shown, created_at
      FROM links
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    return NextResponse.json({
      links,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching paginated links:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}