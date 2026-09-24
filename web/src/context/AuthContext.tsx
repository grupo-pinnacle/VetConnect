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
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = window.localStorage.getItem('vetconnect_user');
        return cached ? JSON.parse(cached) : null;
      }
    } catch {
      return null;
    }
    return null;
  });
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
        try {
          window.localStorage.setItem('vetconnect_user', JSON.stringify(res.data.data.user));
        } catch {}
      } else {
        setUser(null);
        setAccessToken(null);
        try {
          window.localStorage.removeItem('vetconnect_user');
        } catch {}
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setUser(null);
        setAccessToken(null);
        try {
          window.localStorage.removeItem('vetconnect_user');
        } catch {}
      }
      // If offline or network error, keep cached user so navigation doesn't disrupt session
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
    try {
      window.localStorage.setItem('vetconnect_user', JSON.stringify(loggedUser));
    } catch {}
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
    try {
      window.localStorage.setItem('vetconnect_user', JSON.stringify(registeredUser));
    } catch {}
    return registeredUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
      try {
        window.localStorage.removeItem('vetconnect_user');
      } catch {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => {
        throw new Error('useAuth must be used within an AuthProvider');
      },
      register: async () => {
        throw new Error('useAuth must be used within an AuthProvider');
      },
      logout: async () => {},
      refreshSession: async () => {},
    };
  }
  return context;
};
