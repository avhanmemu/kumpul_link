// app/api/settings/route.js
import { NextResponse } from 'next/server';
import initDB from '@/lib/db';

export async function GET() {
  try {
    const db = await initDB();
    
    // Get all app settings
    const settings = await db.all('SELECT setting_key, setting_value FROM app_settings');
    
    // Convert to object format
    const settingsObj = {};
    settings.forEach(setting => {
      try {
        // Try to parse as JSON, fallback to string if it fails
        settingsObj[setting.setting_key] = JSON.parse(setting.setting_value);
      } catch (e) {
        // If JSON parsing fails, treat as string
        settingsObj[setting.setting_key] = setting.setting_value;
      }
    });
    
    // Set default values if not exist
    if (!settingsObj.hasOwnProperty('defaultLink')) {
      settingsObj.defaultLink = {
        enabled: false,
        url: '',
        title: '',
        description: ''
      };
    }

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { setting_key, setting_value } = await request.json();

    const db = await initDB();
    
    // Check if setting already exists
    const existing = await db.get('SELECT id FROM app_settings WHERE setting_key = ?', [setting_key]);

    if (existing) {
      // Update existing setting
      await db.run(`
        UPDATE app_settings
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE setting_key = ?
      `, [JSON.stringify(setting_value), setting_key]);
    } else {
      // Insert new setting
      await db.run(`
        INSERT INTO app_settings (setting_key, setting_value)
        VALUES (?, ?)
      `, [setting_key, JSON.stringify(setting_value)]);
    }

    // Return the updated setting
    return NextResponse.json({ [setting_key]: setting_value });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}