// app/api/links/[id]/click/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const db = await initDB();
    
    // Update click count for the specific link
    await db.run(
      `UPDATE links 
       SET click_count = click_count + 1 
       WHERE backend_id = ?`,
      [params.id]
    );

    // Get updated link with new click count
    const updatedLink = await db.get('SELECT * FROM links WHERE backend_id = ?', [params.id]);
    
    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating click count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}