import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAccessToken } from '../services/api';
import { User, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: Record<string, any>) => Promise<User>;
  register: (data: Record<string, any>) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      const refreshRes = await api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh');
      if (refreshRes.data.success && refreshRes.data.data?.accessToken) {
        setAccessToken(refreshRes.data.data.accessToken);
      }

      const res = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
      if (res.data.success && res.data.data?.user) {
        setUser(res.data.data.user);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (credentials: Record<string, any>): Promise<User> => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/auth/login',
      credentials
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error iniciando sesion');
    }
    const { user: loggedUser, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: Record<string, any>): Promise<User> => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/auth/register',
      data
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error registrando usuario');
    }
    const { user: registeredUser, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshSession }}>
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
