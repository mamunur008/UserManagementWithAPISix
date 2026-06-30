import React, { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../../services/authApi.js';
import { setAuthSnapshot } from '../../services/httpClient.js';

const STORAGE_KEY = 'um.auth';
const AuthContext = createContext(null);

function readStoredAuth() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [booting] = useState(false);

  setAuthSnapshot(auth);

  async function login(payload) {
    const data = await authApi.login(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
    setAuthSnapshot(data);
    return data;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* local logout must still happen */ }
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
    setAuthSnapshot(null);
  }

  const value = useMemo(() => ({ auth, booting, login, logout }), [auth, booting]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
