import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse, AuthPayload } from '../types';

export const SECURE_STORE_REFRESH_KEY = 'vetconnect_refresh_token';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'mobile',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await SecureStore.getItemAsync(SECURE_STORE_REFRESH_KEY);
        if (!storedRefreshToken) {
          throw new Error('No refresh token in secure store');
        }

        const refreshRes = await axios.post<ApiResponse<AuthPayload>>(
          `${API_URL}/api/auth/refresh`,
          { refreshToken: storedRefreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Client-Platform': 'mobile',
            },
          }
        );

        if (refreshRes.data.success && refreshRes.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          if (newRefreshToken) {
            await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, newRefreshToken);
          }

          processQueue(null);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY).catch(() => {});
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse>(err)) {
    return err.response?.data?.error?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export default api;
