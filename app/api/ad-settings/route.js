// app/api/ad-settings/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function GET() {
  try {
    const db = await initDB();
    // Get the first (and typically only) ad settings record
    const settings = await db.get('SELECT * FROM ad_settings LIMIT 1');

    // If no settings exist, return default
    if (!settings) {
      return NextResponse.json({
        id: null,
        zone_name: '',
        zone_id: '',
        ad_code: '',
        enabled: 0
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { zone_name, zone_id, ad_code, enabled } = await request.json();

    const db = await initDB();
    // First, check if settings already exist
    const existing = await db.get('SELECT id FROM ad_settings LIMIT 1');

    if (existing) {
      // Update existing settings
      await db.run(`
        UPDATE ad_settings
        SET zone_name = ?, zone_id = ?, ad_code = ?, enabled = ?
        WHERE id = ?
      `, [zone_name, zone_id, ad_code, enabled ? 1 : 0, existing.id]);

      const updatedSettings = await db.get('SELECT * FROM ad_settings WHERE id = ?', [existing.id]);
      return NextResponse.json(updatedSettings);
    } else {
      // Insert new settings
      await db.run(`
        INSERT INTO ad_settings (zone_name, zone_id, ad_code, enabled)
        VALUES (?, ?, ?, ?)
      `, [zone_name, zone_id, ad_code, enabled ? 1 : 0]);

      const newSettings = await db.get('SELECT * FROM ad_settings ORDER BY id DESC LIMIT 1');
      return NextResponse.json(newSettings);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}