import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app.
 * It:
 *   - Listens for Supabase auth state changes
 *   - Exposes session, user, profile, loading state
 *   - Provides signInWithGoogle() and signOut()
 *   - Auto-creates a profile row on first login
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch profile from Supabase ─────────────────────────────────────────
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows returned" — that's expected on first login
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

  // ─── Bootstrap: check existing session on mount ──────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await createProfileIfMissing(currentSession.user);
      }
      setLoading(false);
    };

    bootstrap();

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await createProfileIfMissing(newSession.user);
        } else {
          setProfile(null);
        }

        // Only clear loading after initial check
        if (loading) setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auth actions ─────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
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

/**
 * useAuth — import this in any component to access auth state.
 * Never call supabase.auth.* directly from components.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
