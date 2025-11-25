// components/LinkCard.js
'use client';

import { useState, useEffect } from 'react';

export default function LinkCard({ link, adSettings, clickedLinks, setClickedLinks, refreshLinks }) {
  const [showAdModal, setShowAdModal] = useState(false);
  const [modalClosed, setModalClosed] = useState(true); // Default to true, check on mount
  const [clickCount, setClickCount] = useState(link.click_count || 0);

  useEffect(() => {
    // On component mount, check localStorage to set the definitive state
    const closedModals = JSON.parse(localStorage.getItem('closedAdModals') || '[]');
    if (!closedModals.includes(link.backend_id)) {
      setModalClosed(false); // If not in localStorage, modal is not "permanently" closed
    }
  }, [link.backend_id]);

  const proceedToLink = async (isImageClick = false) => {
    try {
      // Track click via API
      const response = await fetch(`/api/links/${link.backend_id}/click`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedLink = await response.json();
        setClickCount(updatedLink.click_count || 0);

        // Check if this is the first click and ad should be shown
        if (updatedLink.shouldShowAd && link.ad_url && link.ad_url.trim()) {
          // Open the ad URL for the first click
          window.open(link.ad_url, '_blank', 'noopener,noreferrer');
        } else {
          // For subsequent clicks, open the main link URL
          window.open(link.link_url, '_blank', 'noopener,noreferrer');
        }

        if (refreshLinks) {
          setTimeout(() => refreshLinks(), 1000);
        }
      } else {
        // If API call fails, just open the main link as fallback
        window.open(link.link_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
      // If API call fails, just open the main link as fallback
      window.open(link.link_url, '_blank', 'noopener,noreferrer');
    }

    // Mark this link as clicked on this device for UI state
    if (!clickedLinks.has(link.backend_id)) {
      const newClickedLinks = new Set(clickedLinks);
      newClickedLinks.add(link.backend_id);
      setClickedLinks(newClickedLinks);
      localStorage.setItem('clickedLinks', JSON.stringify([...newClickedLinks]));
    }
  };

  const handleCardClick = (e) => {
    // Prevent clicks on interactive elements (like the link itself) from triggering the logic
    if (e.target.closest('a')) {
      return;
    }
    e.preventDefault();

    // If ads are on and this card's ad has never been closed, show the modal.
    if (adSettings.enabled && !modalClosed) {
      setShowAdModal(true);
    } else {
      // Otherwise, proceed directly to the link.
      proceedToLink(false);
    }
  };

  const handleImageClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    proceedToLink(true); // Call the centralized function, indicating it's an image click
  };

  const markModalAsPermanentlyClosed = () => {
    // Hide the modal from view
    setShowAdModal(false);
    // Set state to prevent it from showing again in this session
    setModalClosed(true);

    // Persist this choice in localStorage
    const closedModals = JSON.parse(localStorage.getItem('closedAdModals') || '[]');
    if (!closedModals.includes(link.backend_id)) {
      closedModals.push(link.backend_id);
      localStorage.setItem('closedAdModals', JSON.stringify(closedModals));
    }
  };

  const handleAdSkip = () => {
    markModalAsPermanentlyClosed();
    setTimeout(() => proceedToLink(false), 100); // Proceed to link after a short delay
  };

  const handleCloseModal = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling to the card
    markModalAsPermanentlyClosed();
  };

  const handleOverlayClick = (e) => {
    // If the click is on the overlay itself, not the content inside
    if (e.target === e.currentTarget) {
      handleCloseModal(e);
    }
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
            e.target.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDINCIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik00IDE2bDQuNTg2LTQuNTg2YTIgMiAwIDAwMi44MjggMEwxNiAxNm0tMi0yTDEzLjU4NiAxMi40MTRhMiAyIDAgMDAyLjgyOCAwTDE5IDE0bS02LTZoLjAxTTUuOTc0IDE5aDEyYTIgMiAwIDAxMi0yVjZhMiAyIDAgMDEtMi0yaC0xMmEyIDIgMCAwMS0yIDJ2MTJhMiAyIDAgMDEyIDJ6Ij48L3BhdGg+PC9zdmc+`;
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
    <>
      <article
        className="public-card flex flex-col rounded-2xl overflow-hidden shadow-xl transition-transform duration-200 hover:scale-105 cursor-pointer"
        onClick={handleCardClick}
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
                e.preventDefault(); // Prevent default link navigation
                e.stopPropagation(); // Prevent card click handler from firing
                proceedToLink(false); // Go to link directly
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
      </article>

      {/* Ad Modal */}
      {showAdModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={handleCloseModal}
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
                    {/* Ad container for Adstera script will be populated */}
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
    </>
  );
}