import React from 'react';

const Header = ({ farmData }) => {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Input Bar */}
      <div className="relative w-full sm:w-80 md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <input 
          type="text" 
          className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-transparent rounded-full placeholder-gray-400 focus:outline-none focus:border-brand-dark/20 focus:ring-2 focus:ring-brand-lime shadow-sm transition-all" 
          placeholder="Search plant here..." 
        />
      </div>

      {/* Right Utilities & Profile */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        <button aria-label="Messages" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 btn-interactive" type="button">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
        
        <button aria-label="Notifications" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 btn-interactive" type="button">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center ring-2 ring-brand-lime">
            <svg className="w-10 h-10" viewBox="0 0 40 40">
              <circle cx="20" cy="20" fill="#FCD5CE" r="20"></circle>
              <path d="M12 36 C12 28, 28 28, 28 36" fill="#112f23"></path>
              <circle cx="20" cy="18" fill="#F4A261" r="8"></circle>
              <path d="M16 12 C16 10, 24 10, 24 12 L24 16 L16 16 Z" fill="#E76F51"></path>
            </svg>
          </div>
          <div className="hidden md:block leading-tight">
            <h4 className="font-bold text-sm text-gray-900">Stanton</h4>
            <p className="text-[11px] font-medium text-gray-400">{farmData?.name || 'Green House'} / {farmData?.location || 'Europe'}</p>
          </div>
          <button aria-label="User menu" className="w-6 h-6 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center hover:opacity-90 ml-1" type="button">
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
