'use client';
import { useState, useEffect } from 'react';
import type { User } from '@/types';

const LS_KEY = 'ligamundial_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem(LS_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem(LS_KEY, JSON.stringify(newUser));
  };

  const isAdmin = () => {
    if (!user) return false;
    const admins = (process.env.NEXT_PUBLIC_ADMIN_USERNAMES || 'admin').split(',').map(a => a.trim().toLowerCase());
    return admins.includes(user.username.toLowerCase());
  };

  return { user, loading, login, logout, updateUser, isAdmin };
}
