import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthCallback — handles the OAuth redirect from Google via Supabase.
 *
 * After Google OAuth, Supabase redirects back to:
 *   https://sihastra.vercel.app/auth/callback#access_token=...
 *
 * The Supabase JS SDK (v2.116+) begins parsing the URL hash and exchanging
 * the access_token immediately when the client is constructed (initialize()).
 * That initialization is async and involves a network call to /auth/v1/user.
 *
 * getSession() correctly awaits initializePromise, so calling it here is the
 * reliable way to know whether the session was established — no guessing,
 * no arbitrary timeouts, no duplicate onAuthStateChange listeners.
 *
 * This component:
 *  1. Calls getSession() which waits for the SDK to finish processing the hash.
 *  2. If a session exists  → navigates to the dashboard.
 *  3. If no session exists → logs the failure and navigates to /login.
 *
 * It is a PUBLIC route — no ProtectedRoute wrapper.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      console.log('[AuthCallback] mounted, awaiting session…');

      try {
        // getSession() awaits the SDK's initializePromise internally.
        // By the time it resolves, the SDK has either:
        //   (a) successfully parsed #access_token, called /auth/v1/user,
        //       saved the session to localStorage, and returned it, OR
        //   (b) encountered an error and returned session: null.
        // No race condition — this is the authoritative result.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          console.error('[AuthCallback] getSession error:', error.message);
          setStatus('Authentication error. Redirecting…');
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          console.log('[AuthCallback] session exists: true — navigating to dashboard');
          navigate('/', { replace: true });
        } else {
          console.warn('[AuthCallback] session exists: false — navigating to login');
          setStatus('Session not found. Redirecting…');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[AuthCallback] unexpected error:', err);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
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
        <p className="text-brand-muted font-semibold text-sm">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
