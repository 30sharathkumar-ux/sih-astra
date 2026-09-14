import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ farmData }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Derive display values from Google metadata or profile
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'Farmer';

  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    '';

  const farmLabel =
    profile?.farm_name
      ? `${profile.farm_name}${profile.farm_location ? ' · ' + profile.farm_location : ''}`
      : farmData?.name || 'My Farm';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('[Header] Sign-out error:', err);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Input Bar */}
      <div className="relative w-full sm:w-80 md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-transparent rounded-full placeholder-gray-400 focus:outline-none focus:border-brand-dark/20 focus:ring-2 focus:ring-brand-lime shadow-sm transition-all"
          placeholder="Search plant here..."
        />
      </div>

      {/* Right: Utilities + Profile */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {/* Messages */}
        <button aria-label="Messages" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 btn-interactive" type="button">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Notifications */}
        <button aria-label="Notifications" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 btn-interactive" type="button">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Profile Menu */}
        <div className="relative pl-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="flex items-center gap-3 focus:outline-none group"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-limeBg ring-2 ring-brand-lime flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-brand-dark font-black text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name + Farm label */}
            <div className="hidden md:block leading-tight text-left">
              <h4 className="font-bold text-sm text-gray-900 truncate max-w-[120px]">{displayName}</h4>
              <p className="text-[11px] font-medium text-gray-400 truncate max-w-[120px]">{farmLabel}</p>
            </div>

            {/* Chevron */}
            <div className={`w-6 h-6 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-pop border border-gray-100 py-2 z-50">
              {/* User info row at top of dropdown */}
              <div className="px-4 py-3 border-b border-gray-100 mb-1">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-softGray transition-colors rounded-xl mx-0.5"
              >
                <User className="w-4 h-4 text-gray-500" />
                Profile
              </button>

              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-softGray transition-colors rounded-xl mx-0.5"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                Settings
              </button>

              <div className="my-1 border-t border-gray-100"></div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-xl mx-0.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
