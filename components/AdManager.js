// components/AdManager.js
'use client';

export default function AdManager({ adSettings, position = 'top' }) {
  // If ads are not enabled, don't render anything
  if (!adSettings.enabled) return null;

  const adContent = adSettings.adCode ? (
    <div dangerouslySetInnerHTML={{ __html: adSettings.adCode }} />
  ) : adSettings.zoneId ? (
    <div className="text-center p-4">
      <div className="text-slate-400 text-sm mb-2">Iklan dari Adstera</div>
      <div className="text-slate-500 text-xs">Zona: {adSettings.zoneName || adSettings.zoneId}</div>
    </div>
  ) : (
    <div className="text-center p-4">
      <div className="text-slate-500 text-sm">Iklan Adstera</div>
      <div className="text-slate-600 text-xs mt-1">Silakan atur zona iklan di panel admin</div>
    </div>
  );

  return (
    <div className="ad-container my-6 p-4 rounded-xl bg-slate-800 border border-slate-700">
      <div className="ad-content flex items-center justify-center h-64 bg-slate-700 rounded-lg">
        {adContent}
      </div>
    </div>
  );
}