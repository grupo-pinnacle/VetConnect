import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api, { SECURE_STORE_REFRESH_KEY } from './api';
import { User, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (credentials: Record<string, any>) => Promise<User>;
  register: (data: Record<string, any>) => Promise<User>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  initAuth: async () => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(SECURE_STORE_REFRESH_KEY);
      if (!storedRefreshToken) {
        set({ user: null, accessToken: null, isLoading: false });
        return;
      }

      const res = await api.post<ApiResponse<{ accessToken: string; refreshToken?: string; user: User }>>(
        '/api/auth/refresh',
        { refreshToken: storedRefreshToken }
      );

      if (res.data.success && res.data.data) {
        const { accessToken, refreshToken: newRefreshToken, user } = res.data.data;
        if (newRefreshToken) {
          await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, newRefreshToken);
        }
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        set({ user, accessToken, isLoading: false });
      } else {
        await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY);
        set({ user: null, accessToken: null, isLoading: false });
      }
    } catch (err) {
      await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY).catch(() => {});
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  login: async (credentials) => {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken?: string; user: User }>>(
      '/api/auth/login',
      credentials
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error iniciando sesion');
    }

    const { accessToken, refreshToken, user } = res.data.data;
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, refreshToken);
    }
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
    return user;
  },

  register: async (data) => {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken?: string; user: User }>>(
      '/api/auth/register',
      data
    );

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error en registro');
    }

    const { accessToken, refreshToken, user } = res.data.data;
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, refreshToken);
    }
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    set({ user, accessToken, isLoading: false });
    return user;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY).catch(() => {});
      delete api.defaults.headers.common.Authorization;
      set({ user: null, accessToken: null, isLoading: false });
    }
  },
}));
