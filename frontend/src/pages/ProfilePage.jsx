import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, MapPin, Loader2 } from 'lucide-react';

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
  'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi',
];

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    farm_name: '',
    farm_location: '',
    crop: '',
    farm_size: '',
    preferred_language: 'English',
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  // Hydrate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        farm_name: profile.farm_name || '',
        farm_location: profile.farm_location || '',
        crop: profile.crop || '',
        farm_size: profile.farm_size ?? '',
        preferred_language: profile.preferred_language || 'English',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await updateProfile({
        ...form,
        farm_size: form.farm_size !== '' ? parseFloat(form.farm_size) : null,
      });
      setSuccess(true);
    } catch (err) {
      console.error('[Profile] Save error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Explicit user-initiated geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setForm(prev => ({ ...prev, farm_location: coords }));
        setLocating(false);
      },
      () => {
        setError('Unable to get location. Please enter it manually.');
        setLocating(false);
      }
    );
  };

  // Derive display name and avatar from Google metadata
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Farmer';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
  const email = user?.email || '';

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-3xl w-full mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">My Profile</h1>

      {/* ── Profile identity card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-card flex items-center gap-5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-lime"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center ring-4 ring-brand-lime text-brand-lime text-2xl font-black">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
          <p className="text-sm text-gray-400 font-medium">{email}</p>
          <span className="inline-flex items-center gap-1 mt-1 bg-brand-limeBg text-brand-dark text-xs font-bold px-2.5 py-0.5 rounded-full">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M21 3v2c0 6.075-4.925 11-11 11H8v5H5V8c0-2.76 2.24-5 5-5h11z" />
            </svg>
            Harvest Farmer
          </span>
        </div>
      </div>

      {/* ── Editable farm profile form ── */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-card space-y-6">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3">
          Farm Information
        </h3>

        {/* Success / Error banners */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800 text-sm font-semibold">Profile updated successfully ✓</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="full_name">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition"
            />
          </div>

          {/* Email (read-only) */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Email (Google — read-only)
            </label>
            <div className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 text-sm text-gray-400 font-medium select-all">
              {email}
            </div>
          </div>

          {/* Farm Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="farm_name">
              Farm Name
            </label>
            <input
              id="farm_name"
              name="farm_name"
              type="text"
              value={form.farm_name}
              onChange={handleChange}
              placeholder="e.g. My Green Farm"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition"
            />
          </div>

          {/* Farm Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="farm_size">
              Farm Size (acres)
            </label>
            <input
              id="farm_size"
              name="farm_size"
              type="number"
              step="0.1"
              min="0"
              value={form.farm_size}
              onChange={handleChange}
              placeholder="e.g. 2.5"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition"
            />
          </div>

          {/* Farm Location */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="farm_location">
              Farm Location
            </label>
            <div className="flex gap-2">
              <input
                id="farm_location"
                name="farm_location"
                type="text"
                value={form.farm_location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru, Karnataka"
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="flex items-center gap-2 px-4 py-3 bg-brand-softGray border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-brand-lime hover:border-brand-lime hover:text-brand-dark transition shrink-0 disabled:opacity-50"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {locating ? 'Locating…' : 'Use GPS'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              GPS coordinates will be used for weather integration. Permission is only requested when you click "Use GPS".
            </p>
          </div>

          {/* Crop */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="crop">
              Primary Crop
            </label>
            <input
              id="crop"
              name="crop"
              type="text"
              value={form.crop}
              onChange={handleChange}
              placeholder="e.g. Tomato, Onion, Rice"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="preferred_language">
              Preferred Language
            </label>
            <select
              id="preferred_language"
              name="preferred_language"
              value={form.preferred_language}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition bg-white dark:bg-gray-800"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="phone">
              Phone Number <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Weather integration info */}
        <div className="bg-brand-softGray rounded-2xl p-4 border border-brand-lime/20">
          <p className="text-xs text-brand-muted font-medium leading-relaxed">
            <span className="font-bold text-brand-dark">🌤 Weather Integration:</span> Your farm location will be used by the FastAPI backend to fetch real-time weather from Open-Meteo for your farm zone.
          </p>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 bg-brand-dark text-brand-lime font-bold text-sm rounded-2xl hover:bg-brand-darker transition-all duration-200 disabled:opacity-70 active:scale-[0.98]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
