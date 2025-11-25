'use client';

import { useState, useEffect } from 'react';
import LinkCard from '../components/LinkCard';

export default function Home() {
  const [links, setLinks] = useState([]);
  const [adSettings, setAdSettings] = useState({ enabled: false });
  const [clickedLinks, setClickedLinks] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLinks = async (page = 1) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await fetch(`/api/links/paginated?page=${page}&limit=10`);
      if (!res.ok) {
        throw new Error('Gagal mengambil data link');
      }
      const data = await res.json();

      if (page === 1) {
        setLinks(data.links);
      } else {
        setLinks(prev => [...prev, ...data.links]);
      }

      setHasMore(data.hasNextPage);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
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
      await Promise.all([fetchLinks(1), fetchAdSettings()]);
    };

    loadInitialData();

    // Load clicked links from localStorage
    const storedClickedLinks = localStorage.getItem('clickedLinks');
    if (storedClickedLinks) {
      setClickedLinks(new Set(JSON.parse(storedClickedLinks)));
    }
  }, []);

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    await fetchLinks(nextPage);
  };

  const refreshLinks = () => {
    fetchLinks(1);
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {links.map((link) => (
                <LinkCard
                  key={link.backend_id || link.id}
                  link={link}
                  adSettings={adSettings}
                  clickedLinks={clickedLinks}
                  setClickedLinks={setClickedLinks}
                  refreshLinks={refreshLinks}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className={`px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200 ${
                    isLoadingMore ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoadingMore ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Memuat...
                    </span>
                  ) : (
                    'Muat Lebih Banyak'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
