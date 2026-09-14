import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { session, loading, signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
      // Page will redirect to Google — no further action needed here
    } catch (err) {
      console.error('[Login] Google sign-in error:', err);
      setError('Failed to start Google Sign-In. Please try again.');
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* ── Left panel: branding / illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5"></div>
        <div className="absolute top-1/3 -right-16 w-60 h-60 rounded-full bg-brand-lime/10"></div>
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full bg-white/5"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-lime flex items-center justify-center">
            <svg className="w-6 h-6 fill-current text-brand-dark" viewBox="0 0 24 24">
              <path d="M21 3v2c0 6.075-4.925 11-11 11H8v5H5V8c0-2.76 2.24-5 5-5h11z" />
              <path className="opacity-60" d="M12 12a5 5 0 0 1-5-5H3c0 4.97 4.03 9 9 9v-4z" />
            </svg>
          </div>
          <span className="text-white text-2xl font-black tracking-wider">HARVEST</span>
        </div>

        {/* Central illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-10">
          <svg viewBox="0 0 300 260" className="w-full max-w-sm" fill="none">
            {/* Ground */}
            <ellipse cx="150" cy="240" rx="130" ry="18" fill="#1a4d30" opacity="0.5" />
            {/* Large tree */}
            <rect x="145" y="140" width="10" height="100" fill="#5a3e28" rx="4" />
            <circle cx="150" cy="100" r="60" fill="#2d6a4f" />
            <circle cx="120" cy="110" r="40" fill="#40916c" />
            <circle cx="180" cy="105" r="45" fill="#52b788" />
            <circle cx="150" cy="80" r="50" fill="#74c69d" />
            {/* Decorative fruits */}
            <circle cx="130" cy="95" r="6" fill="#B7F143" opacity="0.9" />
            <circle cx="165" cy="88" r="5" fill="#B7F143" opacity="0.9" />
            <circle cx="148" cy="110" r="7" fill="#B7F143" opacity="0.9" />
            {/* Farmer figure */}
            <circle cx="95" cy="185" r="12" fill="#f4a261" />
            <path d="M82 192 C82 178, 108 178, 108 192 L110 230 L80 230 Z" fill="#112f23" />
            <path d="M85 195 L70 210" stroke="#f4a261" strokeWidth="5" strokeLinecap="round" />
            <path d="M105 195 L118 208" stroke="#f4a261" strokeWidth="5" strokeLinecap="round" />
            {/* Basket */}
            <rect x="112" y="200" width="20" height="16" rx="3" fill="#B7F143" />
            {/* Small plant pot */}
            <rect x="195" y="210" width="28" height="20" rx="4" fill="#e76f51" />
            <circle cx="209" cy="205" r="12" fill="#52b788" />
            <path d="M209 200 C205 192, 215 192, 209 200 Z" fill="#2d6a4f" />
            {/* Data dots / telemetry */}
            <circle cx="240" cy="80" r="6" fill="#B7F143" opacity="0.9" />
            <circle cx="260" cy="100" r="4" fill="#B7F143" opacity="0.6" />
            <circle cx="230" cy="110" r="3" fill="#B7F143" opacity="0.4" />
            <path d="M240 80 L260 100 L230 110" stroke="#B7F143" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          </svg>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 space-y-2">
          <p className="text-brand-lime font-bold text-lg leading-tight">
            AI-Powered Farm Intelligence
          </p>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Monitor soil, detect crop diseases with Edge AI, and get real-time weather insights — all in one place.
          </p>
          {/* Architecture mini-flow */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {['ESP32 Sensors', '→', 'Edge AI', '→', 'Dashboard', '→', 'Farmer'].map((item, i) => (
              <span
                key={i}
                className={item === '→'
                  ? 'text-brand-lime/50 font-bold'
                  : 'bg-white/10 text-white/80 text-[11px] font-semibold px-2.5 py-1 rounded-full'
                }
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center">
            <svg className="w-6 h-6 fill-current text-brand-lime" viewBox="0 0 24 24">
              <path d="M21 3v2c0 6.075-4.925 11-11 11H8v5H5V8c0-2.76 2.24-5 5-5h11z" />
            </svg>
          </div>
          <span className="text-brand-dark text-2xl font-black tracking-wider">HARVEST</span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back 🌱</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Monitor your farm smarter with AI-powered insights.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold text-sm hover:border-brand-lime hover:shadow-pop transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-lime rounded-full animate-spin"></div>
                <span>Connecting to Google…</span>
              </>
            ) : (
              <>
                {/* Google SVG logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center gap-2 text-center justify-center">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xs text-gray-400">
              Secured by Supabase Auth. We never store your Google password.
            </p>
          </div>

          {/* Mock data notice for development */}
          <div className="bg-brand-softGray rounded-2xl p-4 border border-brand-lime/30">
            <p className="text-xs text-brand-muted font-medium text-center leading-relaxed">
              <span className="font-bold text-brand-dark">🌱 Demo Mode:</span> Dashboard uses mock sensor data until ESP32 + FastAPI backend is connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
