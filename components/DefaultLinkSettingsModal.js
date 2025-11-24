// components/DefaultLinkSettingsModal.js
import { useState, useEffect } from 'react';

export default function DefaultLinkSettingsModal({ onSave, onClose }) {
  const [settings, setSettings] = useState({
    enabled: false,
    url: 'https://www.effectivegatecpm.com/zytghygc92?key=5ef907689fc7159e78acea2afefbd020',
    title: 'Default Link',
    description: 'First time visitor redirect link'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.defaultLink || {
            enabled: false,
            url: 'https://www.effectivegatecpm.com/zytghygc92?key=5ef907689fc7159e78acea2afefbd020',
            title: 'Default Link',
            description: 'First time visitor redirect link'
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onSave(settings);
    if (success) {
      // Clear the local storage flag so the redirect will trigger again for users who haven't seen it
      localStorage.removeItem('hasClickedDefaultLink');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto relative">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Pengaturan Link Default</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enabled"
                id="enable-default-link"
                checked={settings.enabled}
                onChange={handleChange}
                className="w-4 h-4 text-sky-500 bg-slate-900 border-slate-700 rounded focus:ring-sky-400 focus:ring-2"
              />
              <label htmlFor="enable-default-link" className="ml-2 text-sm font-medium text-slate-300">
                Aktifkan Link Default (Pengalihan Pengunjung Baru)
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">URL Link Default</label>
              <input
                type="url"
                name="url"
                value={settings.url}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Judul Link</label>
              <input
                type="text"
                name="title"
                value={settings.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Judul link default"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Deskripsi</label>
              <textarea
                name="description"
                value={settings.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Deskripsi link default"
              ></textarea>
            </div>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
              <p className="font-medium mb-1">Info:</p>
              <p>Link default akan digunakan untuk mengalihkan pengunjung baru ke URL yang ditentukan saat pertama kali mengakses situs. Pengalihan hanya terjadi sekali per perangkat.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-slate-500"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}