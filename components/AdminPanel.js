// components/AdminPanel.js
'use client';

import { useState, useEffect } from 'react';
import LinkForm from './LinkForm';
import DefaultLinkSettingsModal from './DefaultLinkSettingsModal';

export default function AdminPanel({ links, setLinks, adSettings, setAdSettings }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAdSettings, setShowAdSettings] = useState(false);

  const handleAddClick = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
      try {
        const response = await fetch(`/api/links/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Update local state
          const updatedLinks = links.filter(link => link.backend_id !== id);
          setLinks(updatedLinks);
        } else {
          alert('Gagal menghapus konten');
        }
      } catch (error) {
        console.error('Error deleting link:', error);
        alert('Gagal menghapus konten');
      }
    }
  };

  const handleSave = async (itemData) => {
    try {
      let response;

      if (editingItem) {
        // Update existing item
        response = await fetch(`/api/links/${editingItem.backend_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
      } else {
        // Add new item
        response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
      }

      if (response.ok) {
        const updatedItem = await response.json();

        if (editingItem) {
          // Update existing item in state
          const updatedLinks = links.map(link =>
            link.backend_id === updatedItem.backend_id ? updatedItem : link
          );
          setLinks(updatedLinks);
        } else {
          // Add new item to state
          setLinks([updatedItem, ...links]);
        }

        setShowForm(false);
      } else {
        alert('Gagal menyimpan konten');
      }
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Gagal menyimpan konten');
    }
  };

  const handleAdSettingsChange = async (newAdSettings) => {
    try {
      const response = await fetch('/api/ad-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdSettings),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setAdSettings({
          ...updatedSettings,
          enabled: Boolean(updatedSettings.enabled)
        });
        setShowAdSettings(false);
      } else {
        alert('Gagal menyimpan pengaturan iklan');
      }
    } catch (error) {
      console.error('Error saving ad settings:', error);
      alert('Gagal menyimpan pengaturan iklan');
    }
  };

  const handleClearAll = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        // Delete all links
        const linksToDelete = [...links];
        for (const link of linksToDelete) {
          await fetch(`/api/links/${link.backend_id}`, {
            method: 'DELETE'
          });
        }

        // Reset ad settings
        await fetch('/api/ad-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zone_name: '',
            zone_id: '',
            ad_code: '',
            enabled: false
          }),
        });

        // Update local state
        setLinks([]);
        setAdSettings({ enabled: false });

        // Clear localStorage
        localStorage.removeItem('clickedLinks');
      } catch (error) {
        console.error('Error clearing all data:', error);
        alert('Gagal menghapus semua data');
      }
    }
  };

  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect ke halaman login
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Terjadi kesalahan saat logout');
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Password berhasil diubah!');
        setShowChangePassword(false);
        return true;
      } else {
        alert(data.message || 'Gagal mengganti password');
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Terjadi kesalahan saat mengganti password');
      return false;
    }
  };

  const [showDefaultLinkSettings, setShowDefaultLinkSettings] = useState(false);

  const handleSaveDefaultLink = async (defaultLinkData) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: 'defaultLink',
          setting_value: defaultLinkData
        }),
      });

      if (response.ok) {
        alert('Pengaturan link default berhasil disimpan!');
        setShowDefaultLinkSettings(false);
        return true;
      } else {
        alert('Gagal menyimpan pengaturan link default');
        return false;
      }
    } catch (error) {
      console.error('Error saving default link settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan link default');
      return false;
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-bold tracking-tight text-slate-100 text-2xl">Kelola Konten</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Tambah Konten Baru
          </button>
          <button
            onClick={() => setShowDefaultLinkSettings(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            Link Default
          </button>
          <button
            onClick={() => setShowAdSettings(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Pengaturan Iklan
          </button>
          <button
            onClick={() => setShowChangePassword(true)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Ganti Password
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Keluar
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onChangePassword={handleChangePassword}
        />
      )}

      {adSettings.enabled ? (
        <div className="admin-card rounded-xl p-5 border border-green-700 bg-green-900/20 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-800 flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM11.536 4.464a2 2 0 00-2.828 0l-6.5 6.5a2 2 0 000 2.828l6.5 6.5a2 2 0 002.828 0l6.5-6.5a2 2 0 000-2.828l-6.5-6.5z"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-300">Iklan Aktif</h3>
              <p className="text-sm text-green-200">Zona iklan: {adSettings.zone_name || adSettings.zone_id}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-card rounded-xl p-5 border border-yellow-700 bg-yellow-900/20 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-800 flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-yellow-300">Iklan Nonaktif</h3>
              <p className="text-sm text-yellow-200">Aktifkan iklan dari menu Pengaturan Iklan</p>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Summary Cards */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="admin-card rounded-xl p-5 border border-slate-700 bg-slate-800/50">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Konten</h3>
            <p className="text-2xl font-bold text-slate-100">{links.length}</p>
          </div>
          <div className="admin-card rounded-xl p-5 border border-slate-700 bg-slate-800/50">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Traffic</h3>
            <p className="text-2xl font-bold text-slate-100">
              {links.reduce((sum, link) => sum + (link.click_count || 0), 0)}
            </p>
          </div>
          <div className="admin-card rounded-xl p-5 border border-slate-700 bg-slate-800/50">
            <h3 className="text-slate-400 text-sm font-medium mb-1">Rata-rata per Konten</h3>
            <p className="text-2xl font-bold text-slate-100">
              {links.length > 0
                ? Math.round((links.reduce((sum, link) => sum + (link.click_count || 0), 0) / links.length) * 100) / 100
                : 0}
            </p>
          </div>
        </div>
      )}

      {/* Traffic Visualization */}
      {links.length > 0 && (
        <div className="admin-card rounded-xl p-5 border border-slate-700 mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Traffic Teratas</h2>
          <div className="space-y-3">
            {links
              .filter(link => link.click_count > 0)
              .sort((a, b) => b.click_count - a.click_count)
              .slice(0, 5)
              .map((link, index) => (
                <div key={link.backend_id} className="flex items-center">
                  <div className="w-8 text-slate-400 font-medium text-sm">#{index + 1}</div>
                  <div className="flex-1 min-w-0 ml-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate text-slate-200">{link.title}</span>
                      <span className="text-slate-400 ml-2">{link.click_count} kali</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-sky-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (link.click_count / Math.max(...links.map(l => l.click_count || 0))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            {links.filter(link => link.click_count > 0).length === 0 && (
              <p className="text-slate-400 text-center py-4">Belum ada data traffic</p>
            )}
          </div>
        </div>
      )}

      <section>
        {links.length === 0 ? (
          <div style={{display: 'block'}} className="text-center py-16">
            <svg className="w-24 h-24 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p className="text-slate-400">Belum ada konten. Klik tombol di atas untuk menambah konten pertama Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {links.map((link) => (
              <div key={link.backend_id} className="admin-card rounded-xl p-5 border border-slate-700 transition-all duration-200 hover:border-sky-400">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                    {link.icon_image ? (
                      <img
                        src={link.icon_image}
                        alt={`${link.title} icon`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik00IDE2bDQuNTg2LTQuNTg2YTIgMiAwIDAwMi44MjggMEwxNiAxNm0tMi0yTDEzLjU4NiAxMi40MTRhMiAyIDAgMDAyLjgyOCAwTDE5IDE0bS02LTZoLjAxTTUuOTc0IDE5aDEyYTIgMiAwIDAxMi0yVjZhMiAyIDAgMDEtMi0yaC0xMmEyIDIgMCAwMS0yIDJ2MTJhMiAyIDAgMDEyIDJ6Ij48L3BhdGg+PC9zdmc+`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 text-slate-100">{link.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{link.link_label}</p>
                    <a
                      href={link.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-400 hover:text-sky-300 break-all"
                    >
                      {link.link_url}
                    </a>
                    <div className="flex items-center mt-2">
                      <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span className="text-sm text-slate-500">
                        {link.click_count || 0} kali dilihat/diklik
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(link)}
                      className="edit-btn px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 bg-sky-500 text-slate-900 hover:bg-sky-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(link.backend_id)}
                      className="delete-btn px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 bg-slate-600 text-slate-100 hover:bg-slate-500"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Link Form Modal */}
      {showForm && (
        <LinkForm
          item={editingItem}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Ad Settings Modal */}
      {showAdSettings && (
        <AdSettingsModal
          adSettings={adSettings}
          onSave={handleAdSettingsChange}
          onClose={() => setShowAdSettings(false)}
        />
      )}

      {/* Default Link Settings Modal */}
      {showDefaultLinkSettings && (
        <DefaultLinkSettingsModal
          onSave={handleSaveDefaultLink}
          onClose={() => setShowDefaultLinkSettings(false)}
        />
      )}

      {/* Clear All Data Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
        >
          Hapus Semua Data
        </button>
      </div>
    </main>
  );
}

// Ad Settings Modal Component
function AdSettingsModal({ adSettings, onSave, onClose }) {
  const [formData, setFormData] = useState({
    zone_name: adSettings.zone_name || '',
    zone_id: adSettings.zone_id || '',
    ad_code: adSettings.ad_code || '',
    enabled: adSettings.enabled || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
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
          <h2 className="text-xl font-bold text-slate-100 mb-6">Pengelolaan Iklan Adstera</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Nama Zona Iklan Adstera</label>
              <input
                type="text"
                name="zone_name"
                value={formData.zone_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Contoh: Sidebar_Leaderboard_728x90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">ID Zona Iklan Adstera</label>
              <input
                type="text"
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Contoh: 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Kode Iklan Adstera (opsional)</label>
              <textarea
                name="ad_code"
                value={formData.ad_code}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Tempelkan kode iklan Adstera Anda di sini jika menggunakan metode manual"
              ></textarea>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enabled"
                id="enable-ads"
                checked={formData.enabled}
                onChange={handleChange}
                className="w-4 h-4 text-sky-500 bg-slate-900 border-slate-700 rounded focus:ring-sky-400 focus:ring-2"
              />
              <label htmlFor="enable-ads" className="ml-2 text-sm font-medium text-slate-300">Aktifkan Iklan</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Simpan Pengaturan
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
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

// Change Password Modal Component
function ChangePasswordModal({ onClose, onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Semua field harus diisi');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru harus memiliki minimal 6 karakter');
      return;
    }

    setLoading(true);
    const success = await onChangePassword(currentPassword, newPassword);
    if (success) {
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md overflow-auto relative">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Ganti Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Masukkan password saat ini"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Masukkan password baru"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Ulangi password baru"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="rounded-md bg-red-500/20 p-4 text-red-400 text-sm">
                <p>{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Ganti Password'}
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