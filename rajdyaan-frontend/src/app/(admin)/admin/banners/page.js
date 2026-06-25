'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    section: 'general',
    altText: '',
    link: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/banners`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(data.data?.banners || data.data || []);
      } else {
        toast.error('Failed to load banners');
      }
    } catch (err) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (banner) => {
    setFormData({
      key: banner.key,
      label: banner.label,
      section: banner.section || 'general',
      altText: banner.altText || '',
      link: banner.link || '',
      isActive: banner.isActive,
    });
    setImagePreview(banner.image?.url || '');
    setImageFile(null);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (key) => {
    if (!window.confirm(`Are you sure you want to delete the banner slot "${key}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/banners/${key}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        toast.error(data.message || 'Failed to delete banner');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      section: 'general',
      altText: '',
      link: '',
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.key) {
      toast.error('Banner key is required');
      return;
    }
    if (!formData.label) {
      toast.error('Banner label is required');
      return;
    }

    setSubmitLoading(true);

    const data = new FormData();
    data.append('label', formData.label);
    data.append('section', formData.section || 'general');
    data.append('altText', formData.altText || '');
    data.append('link', formData.link || '');
    data.append('isActive', formData.isActive);

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const res = await fetch(`${API_URL}/banners/${formData.key}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });

      const resData = await res.json();
      if (res.ok) {
        toast.success(isEditing ? 'Banner slot updated!' : 'Banner slot created!');
        resetForm();
        fetchBanners();
      } else {
        toast.error(resData.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Group banners dynamically by section
  const groupedBanners = banners.reduce((acc, banner) => {
    const sec = banner.section || 'general';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(banner);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">Dynamic Banners</h1>
          <p className="text-sm text-primary/60 mt-1">
            Replace homepage slideshow, B2B page banners, and branding assets instantly without code changes.
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-accent text-secondary hover:bg-accent-hover font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 self-start"
        >
          {showForm ? '✕ Close Form' : '➕ Create Banner Slot'}
        </button>
      </div>

      {/* Editor Form Card */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-primary/5 p-6 md:p-8 shadow-md transition-all duration-300">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            {isEditing ? `Edit Slot: ${formData.key}` : 'Create New Banner Slot'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-primary/80 mb-2">Unique Slot Key</label>
                  <input
                    type="text"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    placeholder="e.g. about-hero"
                    className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all disabled:opacity-50"
                  />
                  <p className="text-xs text-primary/40 mt-1">Unique name used inside the React code integration.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary/80 mb-2">Display Label</label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g. About Page Hero Banner"
                    className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary/80 mb-2">Page Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="e.g. homepage, b2b, about, general"
                    className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                  <p className="text-xs text-primary/40 mt-1">Groups related banners dynamically on this dashboard.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary/80 mb-2">Link Click URL (Optional)</label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="e.g. /products"
                      className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary/80 mb-2">SEO Alt Text</label>
                    <input
                      type="text"
                      name="altText"
                      value={formData.altText}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium pure forest honey jar"
                      className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-secondary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-primary/10 text-accent focus:ring-accent cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-primary/80 cursor-pointer">
                    Enable Banner (Active on Website)
                  </label>
                </div>
              </div>

              {/* Right Side: Image Upload & Preview */}
              <div className="flex flex-col justify-between border border-dashed border-primary/20 rounded-2xl p-6 bg-secondary/10">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-primary/80">Banner Image File</label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-primary/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-secondary hover:file:bg-accent/80 file:cursor-pointer"
                  />
                </div>

                <div className="mt-4 flex-1 flex items-center justify-center bg-white rounded-xl overflow-hidden border border-primary/5 min-h-[200px] relative shadow-inner">
                  {imagePreview ? (
                    <div className="relative w-full h-full min-h-[200px]">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="text-center text-primary/30 text-xs flex flex-col gap-2 items-center">
                      <span className="text-3xl">🖼️</span>
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-primary/5">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl border border-primary/10 text-primary hover:bg-secondary/40 font-semibold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-primary text-secondary hover:bg-primary/95 px-8 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots Grouped Listing */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-primary/5 shadow-sm text-primary/60">
          <span className="text-4xl block mb-3">🖼️</span>
          <p className="font-medium text-lg">No banner slots found.</p>
          <p className="text-xs text-primary/40 mt-1">Seed banners or create a slot to get started.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedBanners).map(([section, items]) => (
            <div key={section} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-accent">{section}</h3>
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'slot' : 'slots'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((banner) => (
                  <div
                    key={banner.key}
                    className="bg-white border border-primary/5 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/10 transition-all duration-300"
                  >
                    {/* Image Header */}
                    <div className="relative aspect-[16/9] w-full bg-secondary/20 border-b border-primary/5 overflow-hidden group">
                      {banner.image?.url ? (
                        <Image
                          src={banner.image.url}
                          alt={banner.altText || banner.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary/30 text-xs">
                          No Image Uploaded
                        </div>
                      )}
                      
                      {/* Active Status Badge */}
                      <span
                        className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {banner.isActive ? '● Active' : '○ Disabled'}
                      </span>

                      {/* Section Overlay */}
                      <span className="absolute bottom-3 left-3 text-[10px] uppercase font-bold tracking-widest bg-black/40 text-white backdrop-blur-sm px-2 py-0.5 rounded">
                        {banner.key}
                      </span>
                    </div>

                    {/* Banner Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-primary leading-snug">{banner.label}</h4>
                        {banner.link && (
                          <p className="text-xs text-[#B5922A] font-medium truncate">
                            🔗 Links to: <code className="bg-secondary/50 px-1 py-0.5 rounded">{banner.link}</code>
                          </p>
                        )}
                        {banner.altText && (
                          <p className="text-xs text-primary/60 italic truncate">
                            &quot;{banner.altText}&quot;
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-3 border-t border-primary/5">
                        <button
                          onClick={() => handleEditClick(banner)}
                          className="flex-1 text-center bg-primary text-secondary hover:bg-primary/95 text-sm font-semibold py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                        >
                          ✏️ Edit Banner
                        </button>
                        <button
                          onClick={() => handleDeleteClick(banner.key)}
                          className="px-3 text-center border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold py-2 rounded-xl transition-all active:scale-95"
                          title="Delete slot"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
