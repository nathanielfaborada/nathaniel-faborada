import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.checkAuth();
        if (response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        // Token invalid or backend offline
        console.warn('Session verification skipped or failed:', err.message);
        // If token exists, keep basic offline user or clean up
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  // Global Keyboard Shortcut: Ctrl + Shift + L to open Admin Login Modal
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLoginModalOpen((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Login Handler
  const login = useCallback(async (username, password) => {
    try {
      const response = await api.auth.login({ username, password });
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        setIsLoginModalOpen(false);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Login failed.' };
    } catch (err) {
      const msg = err.data?.message || err.message || 'Unable to connect to server.';
      return { success: false, message: msg };
    }
  }, []);

  // Logout Handler
  const logout = useCallback(async () => {
    try {
      await api.auth.logout().catch(() => {});
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const value = {
    user,
    token,
    isLoggedIn: Boolean(token && user),
    isLoading,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
