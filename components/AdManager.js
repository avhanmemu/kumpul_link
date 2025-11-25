// components/AdManager.js
'use client';

import { useEffect, useRef } from 'react';

export default function AdManager({ adSettings, position = 'top' }) {
  // If ads are not enabled, don't render anything
  if (!adSettings.enabled) return null;

  // If no ad code and no zone ID, don't render anything
  if (!adSettings.adCode && !adSettings.zoneId) return null;

  const adRef = useRef(null);

  useEffect(() => {
    // Jika adCode disediakan, tidak perlu menambahkan script Adstera
    if (adSettings.adCode) return;

    // Jika zoneId tidak disediakan, tidak perlu menambahkan script
    if (!adSettings.zoneId) return;

    // Hapus script sebelumnya jika ada
    const existingScript = document.querySelector(`script[data-zone="${adSettings.zoneId}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Tambahkan script Adstera
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://www.effectivegatecpm.com/zone/${adSettings.zoneId}.js`;
    script.setAttribute('data-zone', adSettings.zoneId);

    const zoneDiv = document.createElement('div');
    zoneDiv.id = `nasi_zone_${adSettings.zoneId}`;
    zoneDiv.setAttribute('data-zone', adSettings.zoneId);

    if (adRef.current) {
      adRef.current.appendChild(zoneDiv);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (zoneDiv && adRef.current.contains(zoneDiv)) {
        adRef.current.removeChild(zoneDiv);
      }
    };
  }, [adSettings.zoneId, adSettings.adCode]);

  const adContent = adSettings.adCode ? (
    <div dangerouslySetInnerHTML={{ __html: adSettings.adCode }} />
  ) : adSettings.zoneId ? (
    <div ref={adRef} className="w-full h-full"></div>
  ) : null;

  return adContent ? (
    <div className="ad-container my-6">
      <div className="ad-content h-64">
        {adContent}
      </div>
    </div>
  ) : null;
}