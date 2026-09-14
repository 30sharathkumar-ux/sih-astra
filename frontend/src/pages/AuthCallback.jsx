import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthCallback — handles the OAuth redirect from Google via Supabase.
 *
 * After Google login, Supabase redirects back to:
 *   http://localhost:5175/auth/callback#access_token=...
 *
 * Supabase JS SDK automatically parses the hash fragment and stores the
 * session in localStorage. onAuthStateChange in AuthContext fires with
 * SIGNED_IN, which updates the session state and clears loading.
 *
 * This page just waits briefly, then navigates to the dashboard.
 * It is a PUBLIC route — no ProtectedRoute wrapper.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase SDK handles the token automatically from the URL hash.
    // We just need to wait for onAuthStateChange to fire in AuthContext,
    // then redirect. A short delay ensures the session is stored.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthCallback] event:', event, 'session:', !!session);
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();
          navigate('/', { replace: true });
        }
      }
    );

    // Safety fallback: if for some reason the event doesn't fire within
    // 3 seconds, check the session manually and redirect.
    const fallback = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/', { replace: true });
      } else {
        console.warn('[AuthCallback] No session after timeout. Redirecting to /login.');
        navigate('/login', { replace: true });
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center animate-spin">
          <svg className="w-8 h-8 text-brand-lime fill-current" viewBox="0 0 24 24">
            <path d="M21 3v2c0 6.075-4.925 11-11 11H8v5H5V8c0-2.76 2.24-5 5-5h11z" />
          </svg>
        </div>
        <p className="text-brand-muted font-semibold text-sm">Signing you in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
