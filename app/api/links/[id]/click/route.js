// app/api/links/[id]/click/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const db = await initDB();

    // Get the device ID from the request headers
    const deviceId = request.headers.get('x-device-id') || 'unknown_device';

    // Check if this device has already clicked this link
    const existingClick = await db.get(`
      SELECT id FROM link_clicks
      WHERE link_backend_id = ? AND device_id = ?`, [id, deviceId]);

    if (existingClick) {
      // Device has already clicked this link, don't increment the global count
      // Just return the current link info without incrementing
      const currentLink = await db.get(`
        SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, ad_shown, created_at
        FROM links
        WHERE backend_id = ?`, [id]);

      return NextResponse.json({
        ...currentLink,
        shouldShowAd: false // Don't show ad again to this device
      });
    }

    // Get the current state of the link to check if ad has been shown to anyone before
    const currentLink = await db.get(`
      SELECT backend_id, ad_url, ad_shown
      FROM links
      WHERE backend_id = ?`, [id]);

    let shouldShowAd = false;

    // Check if this is the first time ANYONE is clicking and there's an ad URL
    // OR if the ad has never been shown and this is the first click from this device
    if (currentLink && currentLink.ad_url && currentLink.ad_url.trim() && !currentLink.ad_shown) {
      // This is the first click from any device, mark that the ad has been shown globally
      await db.run(`
        UPDATE links
        SET click_count = click_count + 1, ad_shown = 1
        WHERE backend_id = ?`, [id]);
      shouldShowAd = true;
    } else {
      // Increment click count for a returning device
      await db.run(`
        UPDATE links
        SET click_count = click_count + 1
        WHERE backend_id = ?`, [id]);
    }

    // Record this click for this specific device to prevent future increments from this device
    await db.run(`
      INSERT INTO link_clicks (link_backend_id, device_id)
      VALUES (?, ?)`, [id, deviceId]);

    // Get updated link with new click count
    const updatedLink = await db.get(`
      SELECT id, backend_id, title, link_label, link_url, ad_url, icon_image, click_count, ad_shown, created_at
      FROM links
      WHERE backend_id = ?`, [id]);

    // Return whether the ad should be shown
    return NextResponse.json({ ...updatedLink, shouldShowAd });
  } catch (error) {
    console.error('Error updating click count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}