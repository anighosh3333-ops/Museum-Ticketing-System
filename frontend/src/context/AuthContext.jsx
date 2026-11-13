import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('aurum_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('aurum_token');
      const savedUser = localStorage.getItem('aurum_user');
      if (savedToken && savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Validate or synchronize user session with backend
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Token expired or invalid');
        return res.json();
      })
      .then(json => {
        if (json && json.success && json.data) {
          const apiUser = json.data;
          setUser(prev => {
            const updated = {
              ...(prev || {}),
              id: apiUser.id,
              name: apiUser.name,
              email: apiUser.email,
              role: apiUser.role,
              phone: apiUser.phone || '',
              country: apiUser.country || '',
              profile_image: apiUser.profile_image || null,
              avatar: apiUser.profile_image || (prev && prev.avatar) || (apiUser.role === 'admin' 
                ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
              memberSince: (prev && prev.memberSince) || (apiUser.created_at ? apiUser.created_at.split('-')[0] : '2026'),
              membershipTier: apiUser.role === 'admin' ? 'Museum Curator Access' : 'Gold Heritage Pass'
            };
            localStorage.setItem('aurum_user', JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(err => {
        console.warn('Session verification failed, signing out:', err.message);
        setToken(null);
        setUser(null);
        localStorage.removeItem('aurum_token');
        localStorage.removeItem('aurum_user');
      });
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Invalid email or password.');
    }

    const { token: receivedToken, user: apiUser } = json.data;
    const fullUser = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      phone: apiUser.phone || '',
      country: apiUser.country || '',
      profile_image: apiUser.profile_image || null,
      avatar: apiUser.profile_image || (apiUser.role === 'admin'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
      memberSince: apiUser.created_at ? apiUser.created_at.split('-')[0] : '2026',
      membershipTier: apiUser.role === 'admin' ? 'Museum Curator Access' : 'Gold Heritage Pass'
    };

    setToken(receivedToken);
    setUser(fullUser);
    localStorage.setItem('aurum_token', receivedToken);
    localStorage.setItem('aurum_user', JSON.stringify(fullUser));
    setAuthModalOpen(false);
    return fullUser;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Registration failed.');
    }

    const receivedToken = json.token;
    const apiUser = json.data;

    if (receivedToken && apiUser) {
      const fullUser = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role || 'user',
        phone: '',
        country: '',
        profile_image: null,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        memberSince: '2026',
        membershipTier: 'Standard Heritage Pass'
      };
      setToken(receivedToken);
      setUser(fullUser);
      localStorage.setItem('aurum_token', receivedToken);
      localStorage.setItem('aurum_user', JSON.stringify(fullUser));
      setAuthModalOpen(false);
      return fullUser;
    } else {
      // Auto-login fallback
      return await login(email, password);
    }
  };

  const updateProfile = async ({ name, email, phone, country, profile_image }) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, phone, country, profile_image })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update profile.');
    }

    const apiUser = json.data;
    const updatedUser = {
      ...(user || {}),
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      phone: apiUser.phone || '',
      country: apiUser.country || '',
      profile_image: apiUser.profile_image || null,
      avatar: apiUser.profile_image || (user && user.avatar) || (apiUser.role === 'admin' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
      memberSince: (user && user.memberSince) || (apiUser.created_at ? apiUser.created_at.split('-')[0] : '2026'),
      membershipTier: apiUser.role === 'admin' ? 'Museum Curator Access' : ((user && user.membershipTier) || 'Gold Heritage Pass')
    };

    setUser(updatedUser);
    localStorage.setItem('aurum_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to change password.');
    }

    return json;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aurum_token');
    localStorage.removeItem('aurum_user');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
      authModalOpen,
      authMode,
      setAuthMode,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
