import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Profile, Shop, AppRole } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  shop: Shop | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setProfile: (p: Profile) => void;
  setShop: (s: Shop) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo data for development without Supabase
const DEMO_PROFILES: Record<string, Profile> = {
  'owner@demo.com': { id: '1', full_name: 'Rajesh Kumar', phone: '+919876543210', role: 'owner', shop_id: 'shop-1', created_at: new Date().toISOString() },
  'admin@demo.com': { id: '2', full_name: 'Priya Sharma', phone: '+919876543211', role: 'admin', shop_id: 'shop-1', created_at: new Date().toISOString() },
  'vendor@demo.com': { id: '3', full_name: 'Sunil Goldworks', phone: '+919876543212', role: 'vendor', shop_id: 'shop-1', created_at: new Date().toISOString() },
};

const DEMO_SHOP: Shop = {
  id: 'shop-1',
  name: 'Krishna Gold & Jewels',
  phone: '+919876543200',
  address: '123 Jewellers Street, Mumbai',
  created_by: '1',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored demo session
    const stored = localStorage.getItem('goldshop_demo_user');
    if (stored) {
      const email = stored;
      const p = DEMO_PROFILES[email];
      if (p) {
        setUser({ email, id: p.id });
        setProfile(p);
        setShop(DEMO_SHOP);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, _password: string) => {
    // Demo mode - accept any demo email with any password
    const p = DEMO_PROFILES[email.toLowerCase()];
    if (p) {
      localStorage.setItem('goldshop_demo_user', email.toLowerCase());
      setUser({ email: email.toLowerCase(), id: p.id });
      setProfile(p);
      setShop(DEMO_SHOP);
    } else {
      throw new Error('Invalid credentials. Try owner@demo.com, admin@demo.com, or vendor@demo.com');
    }
  };

  const signUp = async (email: string, _password: string, fullName: string) => {
    // Demo mode
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      full_name: fullName,
      phone: null,
      role: 'owner',
      shop_id: null,
      created_at: new Date().toISOString(),
    };
    setUser({ email, id: newProfile.id });
    setProfile(newProfile);
    localStorage.setItem('goldshop_demo_user', email);
  };

  const signOut = async () => {
    localStorage.removeItem('goldshop_demo_user');
    setUser(null);
    setProfile(null);
    setShop(null);
  };

  const role = profile?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, profile, shop, role, loading, signIn, signUp, signOut, setProfile, setShop }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
