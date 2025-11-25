'use client';

import { useState, useEffect } from 'react';
import LinkCard from '../components/LinkCard';

export default function Home() {
  const [links, setLinks] = useState([]);
  const [adSettings, setAdSettings] = useState({ enabled: false });
  const [clickedLinks, setClickedLinks] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (!res.ok) {
        throw new Error('Gagal mengambil data link');
      }
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAdSettings = async () => {
    try {
      const res = await fetch('/api/ad-settings');
      if (!res.ok) {
        throw new Error('Gagal mengambil pengaturan iklan');
      }
      const data = await res.json();
      setAdSettings(data);
    } catch (err) {
      console.error(err.message); // Log error but don't block UI
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLinks(), fetchAdSettings()]);
      setIsLoading(false);
    };

    loadInitialData();

    // Load clicked links from localStorage
    const storedClickedLinks = localStorage.getItem('clickedLinks');
    if (storedClickedLinks) {
      setClickedLinks(new Set(JSON.parse(storedClickedLinks)));
    }
  }, []);

  const refreshLinks = () => {
    fetchLinks();
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-400 mb-2">KumpulLink</h1>
          <p className="text-slate-400">Kumpulan tautan penting untuk Anda.</p>
        </header>

        {isLoading && (
          <div className="text-center">
            <p>Memuat tautan...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                adSettings={adSettings}
                clickedLinks={clickedLinks}
                setClickedLinks={setClickedLinks}
                refreshLinks={refreshLinks}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
