// components/LinkForm.js
'use client';

import { useState, useRef } from 'react';

export default function LinkForm({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    link_label: item?.link_label || '',
    link_url: item?.link_url || '',
    ad_url: item?.ad_url || '',  // Menambahkan field ad_url
    icon_image: item?.icon_image || null
  });

  const [previewImage, setPreviewImage] = useState(item?.icon_image || null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file
      if (file.size > 2 * 1024 * 1024) { // 2MB
        setErrors(prev => ({ ...prev, icon_image: 'Ukuran file terlalu besar. Maksimal 2MB.' }));
        return;
      }
      
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, icon_image: 'File harus berupa gambar (JPG, PNG, GIF)' }));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setFormData(prev => ({
          ...prev,
          icon_image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev,
      icon_image: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul konten wajib diisi';
    }

    if (!formData.link_label.trim()) {
      newErrors.link_label = 'Label link wajib diisi';
    }

    if (!formData.link_url.trim()) {
      newErrors.link_url = 'URL link wajib diisi';
    } else if (!/^(https?:\/\/)/.test(formData.link_url)) {
      newErrors.link_url = 'URL harus dimulai dengan http:// atau https://';
    }

    // Validasi untuk ad_url hanya jika diisi
    if (formData.ad_url && formData.ad_url.trim() && !/^(https?:\/\/)/.test(formData.ad_url.trim())) {
      newErrors.ad_url = 'URL iklan harus dimulai dengan http:// atau https://';
    }

    if (!previewImage && !item?.icon_image) {
      newErrors.icon_image = 'Silakan pilih gambar ikon';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } catch (error) {
        console.error('Error saving link:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
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
          <h2 className="text-2xl font-bold mb-6 text-slate-100">
            {item ? 'Edit Konten' : 'Tambah Konten Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-slate-300">Judul Konten</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.title ? 'border-red-500' : 'border-slate-700'} text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                placeholder="Contoh: Dokumentasi Proyek"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="link_label" className="block text-sm font-medium mb-2 text-slate-300">Label Link</label>
              <input
                type="text"
                id="link_label"
                name="link_label"
                value={formData.link_label}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.link_label ? 'border-red-500' : 'border-slate-700'} text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                placeholder="Contoh: Buka dokumentasi"
              />
              {errors.link_label && <p className="text-red-400 text-sm mt-1">{errors.link_label}</p>}
            </div>
            
            <div>
              <label htmlFor="link_url" className="block text-sm font-medium mb-2 text-slate-300">URL Link</label>
              <input
                type="url"
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.link_url ? 'border-red-500' : 'border-slate-700'} text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                placeholder="https://example.com"
              />
              {errors.link_url && <p className="text-red-400 text-sm mt-1">{errors.link_url}</p>}
            </div>

            <div>
              <label htmlFor="ad_url" className="block text-sm font-medium mb-2 text-slate-300">URL Iklan (Opsional)</label>
              <input
                type="url"
                id="ad_url"
                name="ad_url"
                value={formData.ad_url}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.ad_url ? 'border-red-500' : 'border-slate-700'} text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400`}
                placeholder="https://example-iklan.com"
              />
              <p className="text-xs text-slate-500 mt-1">Jika diisi, klik pada gambar akan mengarah ke URL iklan ini</p>
              {errors.ad_url && <p className="text-red-400 text-sm mt-1">{errors.ad_url}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Upload Ikon/Gambar</label>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">Format: JPG, PNG, GIF (maks. 2MB)</p>
                  {errors.icon_image && <p className="text-red-400 text-sm mt-1">{errors.icon_image}</p>}
                </div>
              </div>
              {previewImage && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Hapus gambar
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {item ? 'Memperbarui...' : 'Menambahkan...'}
                  </span>
                ) : (
                  item ? 'Perbarui' : 'Tambah'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
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