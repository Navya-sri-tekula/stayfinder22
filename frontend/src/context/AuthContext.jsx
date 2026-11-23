import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stayfinder_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('stayfinder_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('stayfinder_token');
      if (savedToken) {
        try {
          const res = await authService.getProfile();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('stayfinder_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid.');
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const { token: jwtToken, ...userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('stayfinder_token', jwtToken);
      localStorage.setItem('stayfinder_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res.success && res.data) {
      const { token: jwtToken, ...userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('stayfinder_token', jwtToken);
      localStorage.setItem('stayfinder_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('stayfinder_token');
    localStorage.removeItem('stayfinder_user');
  };

  const updateProfile = async (formData) => {
    const res = await authService.updateProfile(formData);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('stayfinder_user', JSON.stringify(res.data));
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const isAuthenticated = Boolean(user && token);
  const isOwner = user?.role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isOwner,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
