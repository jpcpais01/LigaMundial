'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';

const LS_KEY = 'ligamundial_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: User) => void;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  isAdmin: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: () => {}, logout: () => {}, updateUser: () => {},
  isAdmin: false, showAuthModal: false, setShowAuthModal: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = (u: User) => {
    setUser(u); localStorage.setItem(LS_KEY, JSON.stringify(u));
  };
  const logout = () => {
    setUser(null); localStorage.removeItem(LS_KEY);
  };
  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next); localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const admins = (process.env.NEXT_PUBLIC_ADMIN_USERNAMES || 'admin').split(',').map(a => a.trim().toLowerCase());
  const isAdmin = !!user && admins.includes(user.username.toLowerCase());

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
