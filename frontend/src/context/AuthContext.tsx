import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoRole: (role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS = {
  STUDENT: { email: 'student@college.edu', password: 'password123' },
  FACULTY: { email: 'faculty@college.edu', password: 'password123' },
  HOD: { email: 'hod@college.edu', password: 'password123' },
  OFFICE: { email: 'office@college.edu', password: 'password123' },
  ADMIN: { email: 'admin@college.edu', password: 'password123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('certiflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('certiflow_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('certiflow_token', newToken);
    localStorage.setItem('certiflow_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('certiflow_token');
    localStorage.removeItem('certiflow_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('certiflow_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  const switchDemoRole = async (role: 'STUDENT' | 'FACULTY' | 'HOD' | 'OFFICE' | 'ADMIN') => {
    try {
      const creds = DEMO_CREDENTIALS[role];
      const res = await api.post('/auth/login', { ...creds, expectedRole: role });
      login(res.data.token, res.data.user);
    } catch (err) {
      console.error('Error switching demo role:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
