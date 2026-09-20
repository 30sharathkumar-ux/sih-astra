import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('[Sidebar] Sign-out error:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', exact: true, icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="7" rx="2" width="7" x="3" y="3"></rect>
        <rect height="7" rx="2" width="7" x="14" y="3"></rect>
        <rect height="7" rx="2" width="7" x="14" y="14"></rect>
        <rect height="7" rx="2" width="7" x="3" y="14"></rect>
      </svg>
    )},
    { name: 'Farm Monitoring', path: '/monitoring', exact: false, icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    )},
    { name: 'Disease Detection', path: '/disease-detection', exact: false, icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    )},
    { name: 'Weather', path: '/weather', exact: false, icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    )},
    { name: 'Alerts', path: '/alerts', exact: false, icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    )},
    { name: 'Settings', path: '/settings', exact: false, icon: (
      <svg className="w-5 h-5 stroke-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    )}
  ];

  return (
    <aside className="w-full lg:w-[260px] xl:w-[270px] bg-brand-dark text-white flex flex-col justify-between p-6 shrink-0 lg:min-h-screen">
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-lime">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5l4.5 2.5-4.5 2.5z" opacity="0"></path>
              <path d="M21 3v2c0 6.075-4.925 11-11 11H8v5H5V8c0-2.76 2.24-5 5-5h11z"></path>
              <path className="text-white fill-current opacity-80" d="M12 12a5 5 0 0 1-5-5H3c0 4.97 4.03 9 9 9v-4z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider text-white">HARVEST</span>
        </div>
        
        <nav aria-label="Main Navigation" className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-4 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800/10 text-brand-lime font-medium text-sm transition-colors group"
                  : "flex items-center gap-4 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white dark:bg-gray-800/5 font-medium text-sm transition-colors group"
              }
            >
              {({ isActive }) => (
                <>
                  <div className={isActive ? "" : "text-white/60 group-hover:text-white"}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-6 pt-6">
        <div className="bg-brand-limeBg rounded-3xl p-4 text-center relative overflow-hidden flex flex-col items-center shadow-inner">
          <div className="w-full h-36 relative flex items-center justify-center">
            <svg className="w-32 h-32" fill="none" viewBox="0 0 120 120">
              <ellipse cx="60" cy="115" fill="#95C854" opacity="0.6" rx="55" ry="12"></ellipse>
              <circle cx="28" cy="85" fill="#112f23" r="18"></circle>
              <path d="M15 95 C15 70, 30 65, 30 95" fill="#3D7B54"></path>
              <path d="M92 95 C92 70, 105 70, 105 95" fill="#295D3B"></path>
              <circle cx="95" cy="85" fill="#6EA651" r="14"></circle>
              <circle cx="60" cy="38" fill="#F4A261" r="14"></circle>
              <path d="M52 28 C52 25, 68 25, 68 28 L66 32 L54 32 Z" fill="#264653"></path>
              <path d="M44 65 C44 50, 76 50, 76 65 L76 95 L44 95 Z" fill="#112f23"></path>
              <path d="M49 66 L71 66 L68 95 L52 95 Z" fill="#FDFBF7"></path>
              <rect fill="#E76F51" height="12" rx="2" width="16" x="52" y="70"></rect>
              <path d="M60 62 C57 65, 57 70, 60 70 C63 70, 63 65, 60 62 Z" fill="#2A9D8F"></path>
              <path d="M56 65 C52 65, 52 68, 56 70 Z" fill="#2A9D8F"></path>
              <path d="M64 65 C68 65, 68 68, 64 70 Z" fill="#2A9D8F"></path>
            </svg>
          </div>
          <button className="w-full py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs rounded-full shadow hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-1" type="button">
            <span className="text-sm font-semibold">+</span> Add farm
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white font-semibold text-xs tracking-wider uppercase transition group w-full text-left"
        >
          <svg className="w-4 h-4 stroke-current transform rotate-180 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span>LOG OUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
