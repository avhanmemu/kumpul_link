// components/LinkCard.js
'use client';

import { useState, useRef } from 'react';

export default function LinkCard({ link, adSettings, clickedLinks, setClickedLinks, refreshLinks }) {
  const [showAdModal, setShowAdModal] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(!clickedLinks.has(link.backend_id));

  // Cek apakah modal sudah ditutup sebelumnya dari localStorage
  const closedModals = JSON.parse(localStorage.getItem('closedAdModals') || '[]');
  const [modalClosed, setModalClosed] = useState(closedModals.includes(link.backend_id));

  // Gunakan useRef untuk melacak apakah modal pernah ditutup
  const modalClosedRef = useRef(closedModals.includes(link.backend_id));
  const [clickCount, setClickCount] = useState(link.click_count || 0);

  const handleLinkClick = async (e) => {
    // Prevent default behavior only if it's the card that was clicked, not the link inside
    if (e.target.tagName !== 'A' && !e.target.closest('a')) {
      e.preventDefault();

      // Don't process if modal is currently open to prevent conflicts
      if (showAdModal) {
        return;
      }

      // Check if ads are enabled, this is the first click, and modal hasn't been closed before
      if (adSettings.enabled && isFirstClick && !modalClosedRef.current && !modalClosed) {
        // Show ad modal
        setShowAdModal(true);

        // Add Adstera script if zoneId is available
        if (adSettings.zoneId && !document.querySelector(`script[data-zone="${adSettings.zoneId}"]`)) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.src = `https://www.effectivegatecpm.com/zone/${adSettings.zoneId}.js`;
          script.setAttribute('data-zone', adSettings.zoneId);
          document.head.appendChild(script);
        }

        // Mark as clicked
        const newClickedLinks = new Set(clickedLinks);
        newClickedLinks.add(link.backend_id);
        setClickedLinks(newClickedLinks);
        localStorage.setItem('clickedLinks', JSON.stringify([...newClickedLinks]));
        setIsFirstClick(false);
      } else {
        // Only track click via API if this device hasn't clicked this link before
        if (!clickedLinks.has(link.backend_id)) {
          try {
            const response = await fetch(`/api/links/${link.backend_id}/click`, {
              method: 'POST',
            });

            if (response.ok) {
              const updatedLink = await response.json();
              setClickCount(updatedLink.click_count || 0);
              // Refresh links if a parent refresh function is provided
              if (refreshLinks) {
                setTimeout(() => refreshLinks(), 1000); // Delay refresh to see the change
              }
            }
          } catch (error) {
            console.error('Error tracking click:', error);
          }

          // Mark this link as clicked on this device
          const newClickedLinks = new Set(clickedLinks);
          newClickedLinks.add(link.backend_id);
          setClickedLinks(newClickedLinks);
          localStorage.setItem('clickedLinks', JSON.stringify([...newClickedLinks]));
        }

        // Open the link
        window.open(link.link_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleImageClick = async (e) => {
    // Prevent the card's default click behavior
    e.preventDefault();
    e.stopPropagation();

    // Only track click via API if this device hasn't clicked this link before
    if (!clickedLinks.has(link.backend_id)) {
      try {
        const response = await fetch(`/api/links/${link.backend_id}/click`, {
          method: 'POST',
        });

        if (response.ok) {
          const updatedLink = await response.json();
          setClickCount(updatedLink.click_count || 0);
          // Refresh links if a parent refresh function is provided
          if (refreshLinks) {
            setTimeout(() => refreshLinks(), 1000); // Delay refresh to see the change
          }
        }
      } catch (error) {
        console.error('Error tracking click:', error);
      }

      // Mark this link as clicked on this device
      const newClickedLinks = new Set(clickedLinks);
      newClickedLinks.add(link.backend_id);
      setClickedLinks(newClickedLinks);
      localStorage.setItem('clickedLinks', JSON.stringify([...newClickedLinks]));
    }

    // Redirect to the link's ad URL if it exists, otherwise to the normal link
    const redirectUrl = link.ad_url && link.ad_url.trim() ? link.ad_url : link.link_url;
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAdSkip = async () => {
    // Only track click via API if this device hasn't clicked this link before
    if (!clickedLinks.has(link.backend_id)) {
      try {
        const response = await fetch(`/api/links/${link.backend_id}/click`, {
          method: 'POST',
        });

        if (response.ok) {
          const updatedLink = await response.json();
          setClickCount(updatedLink.click_count || 0);
          // Refresh links if a parent refresh function is provided
          if (refreshLinks) {
            setTimeout(() => refreshLinks(), 1000); // Delay refresh to see the change
          }
        }
      } catch (error) {
        console.error('Error tracking click:', error);
      }

      // Mark this link as clicked on this device
      const newClickedLinks = new Set(clickedLinks);
      newClickedLinks.add(link.backend_id);
      setClickedLinks(newClickedLinks);
      localStorage.setItem('clickedLinks', JSON.stringify([...newClickedLinks]));
    }

    // Permanently mark this link as clicked to prevent modal from showing again
    setIsFirstClick(false);
    // Mark that modal has been closed to prevent it from showing again
    modalClosedRef.current = true;
    // Update state to indicate modal is closed
    setModalClosed(true);
    // Save to localStorage to persist across page refreshes
    const closedModals = JSON.parse(localStorage.getItem('closedAdModals') || '[]');
    if (!closedModals.includes(link.backend_id)) {
      closedModals.push(link.backend_id);
      localStorage.setItem('closedAdModals', JSON.stringify(closedModals));
    }

    setShowAdModal(false);

    // Delay opening the link to ensure modal closes properly
    setTimeout(() => {
      window.open(link.link_url, '_blank', 'noopener,noreferrer');
    }, 100);
  };

  const getIconElement = () => {
    if (link.icon_image) {
      return (
        <img
          src={link.icon_image}
          alt={`${link.title} icon`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik00IDE2bDQuNTg2LTQuNTg2YTIgMiAwIDAwMi44MjggMEwxNiAxNm0tMi0yTDEzLjU4NiAxMi40MTRhMiAyIDAgMDAyLjgyOCAwTDE5IDE0bS02LTZoLjAxTTUuOTc0IDE5aDEyYTIgMiAwIDAxMi0yVjZhMiAyIDAgMDEtMi0yaC0xMmEyIDIgMCAwMS0yIDJ2MTJhMiAyIDAgMDEyIDJ6Ij48L3BhdGg+PC9zdmc+`;
          }}
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
          <svg className="w-full h-full text-white p-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </div>
      );
    }
  };

  return (
    <article
      className="public-card flex flex-col rounded-2xl overflow-hidden shadow-xl transition-transform duration-200 hover:scale-105 cursor-pointer"
      onClick={handleLinkClick}
    >
      <div
        className="w-full h-48 flex items-center justify-center overflow-hidden rounded-xl cursor-pointer"
        onClick={handleImageClick}
      >
        {getIconElement()}
      </div>
      <div className="card-content p-5 flex-1 flex flex-col justify-between">
        <h3 className="card-title font-semibold text-slate-100 mb-3">{link.title}</h3>
        <div className="flex justify-between items-center">
          <a
            href={link.link_url}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Prevent event from bubbling to parent
              handleLinkClick(e);
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link inline-flex items-center gap-2 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 rounded px-1 py-1"
          >
            {link.link_label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
          <div className="flex items-center text-sm text-slate-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            {clickCount} kali
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      {showAdModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // only close modal if the overlay is clicked, not the content
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setShowAdModal(false);

              // Mark that modal has been closed to prevent it from showing again
              modalClosedRef.current = true;
              setModalClosed(true);

              // Save to localStorage
              const closedModals = JSON.parse(localStorage.getItem('closedAdModals') || '[]');
              if (!closedModals.includes(link.backend_id)) {
                closedModals.push(link.backend_id);
                localStorage.setItem('closedAdModals', JSON.stringify(closedModals));
              }
            }
          }}
        >
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                // Permanently mark this link as clicked to prevent modal from showing again
                const newClickedLinks = new Set(clickedLinks);
                newClickedLinks.add(link.backend_id);
                setClickedLinks(newClickedLinks);
                localStorage.setItem('clickedLinks', JSON.stringify([...newClickedLinks]));
                setIsFirstClick(false);
                // Mark that modal has been closed to prevent it from showing again
                modalClosedRef.current = true;

                // Update state to indicate modal is closed
                setModalClosed(true);
                setShowAdModal(false);

                // Save to localStorage to persist across page refreshes
                const closedModals = JSON.parse(localStorage.getItem('closedAdModals') || '[]');
                if (!closedModals.includes(link.backend_id)) {
                  closedModals.push(link.backend_id);
                  localStorage.setItem('closedAdModals', JSON.stringify(closedModals));
                }
              }}
            >
              &times;
            </button>
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Iklan</h3>
                <p className="text-gray-600">Terima kasih telah mendukung kami</p>
              </div>
              <div className="ad-content-container h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                {adSettings.adCode ? (
                  <div dangerouslySetInnerHTML={{ __html: adSettings.adCode }} />
                ) : adSettings.zoneId ? (
                  <div id={`nasi_zone_${adSettings.zoneId}`} className="w-full h-full">
                    {/* Ad container for Adstera script - will be populated by Adstera script */}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Iklan sedang dimuat...
                  </div>
                )}
              </div>
              <div className="text-center">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={handleAdSkip}
                >
                  Lanjut ke Tautan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}