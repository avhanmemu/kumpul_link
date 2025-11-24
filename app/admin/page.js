// app/admin/page.js
'use client';
import { useState, useEffect } from 'react';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const [links, setLinks] = useState([]);
  const [adSettings, setAdSettings] = useState({ enabled: false });

  useEffect(() => {
    // Load data from API
    const fetchData = async () => {
      try {
        // Fetch links
        const linksResponse = await fetch('/api/links');
        if (linksResponse.ok) {
          const linksData = await linksResponse.json();
          setLinks(linksData);
        }

        // Fetch ad settings
        const adSettingsResponse = await fetch('/api/ad-settings');
        if (adSettingsResponse.ok) {
          const adSettingsData = await adSettingsResponse.json();
          setAdSettings({
            ...adSettingsData,
            enabled: Boolean(adSettingsData.enabled)
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full min-h-screen px-4 py-6 bg-slate-900 text-slate-100">
      <div className="w-full max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-100">Panel Administrasi</h1>
          <p className="text-slate-300 mt-2">Kelola konten dan pengaturan iklan Anda</p>
        </header>
        
        <AdminPanel
          links={links}
          setLinks={setLinks}
          adSettings={adSettings}
          setAdSettings={setAdSettings}
        />
      </div>
    </div>
  );
}