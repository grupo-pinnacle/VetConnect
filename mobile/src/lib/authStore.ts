import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api, { SECURE_STORE_REFRESH_KEY } from './api';
import { User, ApiResponse, AuthPayload } from '../types';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../validation/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

function applySession(accessToken: string, user: User, set: (s: Partial<AuthState>) => void) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  set({ user, accessToken, isLoading: false });
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

      const res = await api.post<ApiResponse<AuthPayload>>('/api/auth/refresh', {
        refreshToken: storedRefreshToken,
      });

      if (res.data.success && res.data.data) {
        const { accessToken, refreshToken: newRefreshToken, user } = res.data.data;
        if (newRefreshToken) {
          await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, newRefreshToken);
        }
        applySession(accessToken, user, set);
      } else {
        await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY);
        set({ user: null, accessToken: null, isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY).catch(() => {});
      set({ user: null, accessToken: null, isLoading: false });
    }
  },

  login: async (credentials) => {
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || 'Credenciales inválidas');
    }

    const res = await api.post<ApiResponse<AuthPayload>>('/api/auth/login', parsed.data);

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error iniciando sesion');
    }

    const { accessToken, refreshToken, user } = res.data.data;
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, refreshToken);
    }
    applySession(accessToken, user, set);
    return user;
  },

  register: async (data) => {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || 'Datos de registro inválidos');
    }
    if (parsed.data.role === 'VET' && !parsed.data.licenseNumber?.trim()) {
      throw new Error('La matrícula profesional es requerida para veterinarios');
    }

    const res = await api.post<ApiResponse<AuthPayload>>('/api/auth/register', parsed.data);

    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error en registro');
    }

    const { accessToken, refreshToken, user } = res.data.data;
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, refreshToken);
    }
    applySession(accessToken, user, set);
    return user;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY).catch(() => {});
      delete api.defaults.headers.common.Authorization;
      set({ user: null, accessToken: null, isLoading: false });
    }
  },
}));
