import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, Shop, AppRole } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  shop: Shop | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhonePassword: (phone: string, password: string) => Promise<void>;
  sendOtp: (phone: string, fullName?: string) => Promise<void>;
  verifyOtpOnly: (phone: string, otp: string) => Promise<void>;
  signUpWithDetails: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile(profileData as unknown as Profile);

      if (profileData.shop_id) {
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('id', profileData.shop_id)
          .single();
        if (shopData) setShop(shopData as unknown as Shop);
      } else {
        setShop(null);
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        } else {
          setProfile(null);
          setShop(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithPhonePassword = async (phone: string, password: string) => {
    const { data, error } = await supabase.functions.invoke('sign-in-with-phone', {
      body: { phone, password },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    if (data?.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }
  };

  const sendOtp = async (phone: string, fullName?: string) => {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { phone, fullName },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  };

  const verifyOtpOnly = async (phone: string, otp: string) => {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { phone, otp },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  };

  const signUpWithDetails = async (email: string, password: string, fullName: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;

    // Update profile with phone number after signup
    if (data.user) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
    setShop(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const role = profile?.role ?? null;

  return (
    <AuthContext.Provider value={{
      user, session, profile, shop, role, loading,
      signIn, signInWithPhonePassword, sendOtp, verifyOtpOnly, signUpWithDetails,
      signOut, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
