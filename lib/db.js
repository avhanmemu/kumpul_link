// lib/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database
export default async function initDB() {
  const db = await open({
    filename: process.env.NODE_ENV === 'production' ? '/tmp/kumpullink.db' : 'kumpullink.db',
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      backend_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      link_label TEXT NOT NULL,
      link_url TEXT NOT NULL,
      icon_image TEXT,
      click_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_name TEXT,
      zone_id TEXT,
      ad_code TEXT,
      enabled BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}