import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
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

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    try {
      window.localStorage.removeItem('vetconnect_user');
    } catch {}
  };

  /**
   * Restores the session on mount.
   *
   * The existing access token is probed FIRST with `GET /api/auth/me`. On a 401
   * the shared response interceptor (`services/api.ts`) already performs the
   * single refresh attempt and replays the request, so no second refresh is
   * issued here — the fallback is centralised, not duplicated.
   *
   * The previous order called `POST /api/auth/refresh` unconditionally and wiped
   * the token on any failure, which destroyed a valid token that had just been
   * injected into storage before the bundle's module-load read. A WebView
   * embedding (the mobile call screen) carries no refresh cookie, so that token
   * was the only credential and the page always bounced to /login.
   */
  const refreshSession = async () => {
    try {
      const res = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
      if (res.data.success && res.data.data?.user) {
        setUser(res.data.data.user);
        try {
          window.localStorage.setItem('vetconnect_user', JSON.stringify(res.data.data.user));
        } catch {}
        return;
      }

      // A non-error response without a user is a protocol violation, not a
      // session problem: keep the cached user rather than logging them out.
      if (res.status < 400) return;

      clearSession();
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      if (status === 401 || status === 403) {
        clearSession();
        return;
      }

      // Offline or network error: keep the cached user so a transient failure
      // does not disrupt navigation.
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
