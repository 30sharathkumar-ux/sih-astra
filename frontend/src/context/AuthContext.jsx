import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  // loading = true until we know definitively whether a session exists
  const [loading, setLoading] = useState(true);
  // Ref to prevent calling setLoading(false) more than once
  const initializedRef = useRef(false);

  // ─── Fetch profile from Supabase ─────────────────────────────────────────
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows returned" — expected on first login
      console.error('[Auth] Error fetching profile:', error);
    }
    return data || null;
  };

  // ─── Create profile on first login ───────────────────────────────────────
  const createProfileIfMissing = async (authUser) => {
    const existing = await fetchProfile(authUser.id);
    if (existing) {
      setProfile(existing);
      return existing;
    }

    const meta = authUser.user_metadata || {};
    const newProfile = {
      id: authUser.id,
      full_name: meta.full_name || meta.name || '',
      avatar_url: meta.avatar_url || meta.picture || '',
      farm_name: '',
      farm_location: '',
      crop: '',
      farm_size: null,
      preferred_language: 'English',
      phone: '',
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) {
      console.error('[Auth] Error creating profile:', error);
      return null;
    }

    setProfile(data);
    return data;
  };

  // ─── Bootstrap: subscribe first, then check session ──────────────────────
  // IMPORTANT ORDER: register onAuthStateChange BEFORE calling getSession().
  // Supabase v2 fires INITIAL_SESSION via the listener when the page loads
  // with a hash fragment (#access_token=...) from OAuth redirect.
  // If we call getSession() first, we miss that event.
  useEffect(() => {
    // 1. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] onAuthStateChange event:', event, 'session:', !!newSession);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Don't await profile creation here — let it run in background
          // so ProtectedRoute gets unblocked immediately
          createProfileIfMissing(newSession.user);
        } else {
          setProfile(null);
        }

        // Mark initialization done on the first event (INITIAL_SESSION or SIGNED_IN)
        if (!initializedRef.current) {
          initializedRef.current = true;
          setLoading(false);
        }
      }
    );

    // 2. Manually call getSession() as a fallback for pages that load
    //    without a hash fragment (e.g. normal refresh with stored session).
    //    If onAuthStateChange fires first with INITIAL_SESSION, the
    //    initializedRef guard prevents double-calling setLoading(false).
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('[Auth] getSession error:', error);
      }
      console.log('[Auth] getSession result:', !!currentSession);

      // If the listener hasn't fired yet, settle state from getSession
      if (!initializedRef.current) {
        initializedRef.current = true;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (currentSession?.user) {
          createProfileIfMissing(currentSession.user);
        }
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auth actions ─────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    // redirectTo must be in Supabase → Authentication → URL Configuration → Redirect URLs
    // Use /auth/callback so a dedicated public route handles the token exchange
    // before ProtectedRoute sees the user.
    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log('[Auth] signInWithGoogle redirectTo:', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  // ─── Update profile helper exposed to Profile page ───────────────────────
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id).then(setProfile),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
