// app/page.js
'use client';
import { useState, useEffect } from 'react';
import LinkCard from '@/components/LinkCard';
import AdManager from '@/components/AdManager';

export default function Home() {
  const [links, setLinks] = useState([]);
  const [adSettings, setAdSettings] = useState({ enabled: false });
  const [clickedLinks, setClickedLinks] = useState(new Set());
  const [defaultLink, setDefaultLink] = useState(null);

  useEffect(() => {
    // Load data from API
    const fetchData = async () => {
      try {
        // Fetch settings first to check for default link
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const defaultLinkSetting = settingsData.defaultLink || {
            enabled: false,
            url: '',
            title: '',
            description: ''
          };

          // Check if default link is enabled and redirect if needed
          if (defaultLinkSetting.enabled && defaultLinkSetting.url) {
            setDefaultLink(defaultLinkSetting);

            // Check if user has already clicked the default link before
            const hasClickedBefore = localStorage.getItem('hasClickedDefaultLink');
            if (!hasClickedBefore) {
              // Redirect to default link
              window.location.href = defaultLinkSetting.url;
              return; // Stop further execution since we're redirecting
            }
          }
        }

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

        // Load clicked links from localStorage
        const savedClickedLinks = localStorage.getItem('clickedLinks');
        if (savedClickedLinks) {
          setClickedLinks(new Set(JSON.parse(savedClickedLinks)));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // If default link is enabled and user has clicked before, show the normal page
  return (
    <div className="w-full min-h-screen px-4 py-6 bg-slate-900 text-slate-100">
      <div className="w-full max-w-5xl mx-auto">
        <header className="mb-8" aria-label="Judul Daftar Konten">
          <h1 className="text-center font-bold tracking-tight mb-2 text-slate-100 text-3xl">Daftar Konten Pilihan</h1>
          <p className="text-center text-slate-300 max-w-2xl mx-auto">Kumpulkan link penting Anda dalam satu tampilan rapi dan mudah diakses.</p>
        </header>
        <section>
          <h2 className="sr-only">Daftar Konten</h2>
          {adSettings.enabled && (
            <AdManager adSettings={adSettings} />
          )}
          {links.length === 0 ? (
            <div style={{display: 'block'}} className="text-center py-16">
              <svg className="w-24 h-24 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <p className="text-slate-400">Belum ada konten. Silakan hubungi admin untuk menambahkan konten pertama.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {links.map((link, index) => (
                <LinkCard
                  key={link.backend_id}
                  link={link}
                  adSettings={adSettings}
                  clickedLinks={clickedLinks}
                  setClickedLinks={setClickedLinks}
                />
              ))}
            </div>
          )}
          {adSettings.enabled && links.length > 3 && (
            <AdManager adSettings={adSettings} position="bottom" />
          )}
        </section>
        <footer className="mt-8 text-center">
          <p className="text-slate-400">Sesuaikan teks dan warna dari panel edit di Canva.</p>
        </footer>
      </div>
    </div>
  );
}