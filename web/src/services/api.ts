import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const envApi = import.meta.env.VITE_API_URL;
    if (envApi && !envApi.includes('localhost') && !envApi.includes('127.0.0.1')) {
      return envApi;
    }
    // If accessed through Dev Tunnels or custom host, use current origin so Vite proxy forwards /api
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

let currentAccessToken: string | null = null;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    currentAccessToken = window.localStorage.getItem('vetconnect_token');
  }
} catch {
  currentAccessToken = null;
}

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('vetconnect_token', token);
      } else {
        window.localStorage.removeItem('vetconnect_token');
      }
    }
  } catch {}
};

export const getAccessToken = () => currentAccessToken;

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server';
  let deviceId = window.localStorage.getItem('vetconnect_device_id');
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    window.localStorage.setItem('vetconnect_device_id', deviceId);
  }
  return deviceId;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (currentAccessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  config.headers['x-device-id'] = getDeviceId();
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
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

      const errorCode = (error.response?.data as ApiResponse)?.error?.code;
      if (errorCode === 'SESSION_REVOKED') {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('vetconnect:session_terminated', {
              detail: {
                reason: 'CONCURRENT_LOGIN',
                message:
                  (error.response?.data as ApiResponse)?.error?.message ||
                  'Se ha iniciado sesión desde otro dispositivo. Tu sesión ha sido finalizada.',
              },
            })
          );
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            if (currentAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh');
        if (refreshRes.data.success && refreshRes.data.data?.accessToken) {
          const newAccessToken = refreshRes.data.data.accessToken;
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        setAccessToken(null);
        processQueue(refreshError as AxiosError);
        const refreshErrorCode = (refreshError as AxiosError<ApiResponse>)?.response?.data?.error?.code;
        if (refreshErrorCode === 'SESSION_REVOKED' && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('vetconnect:session_terminated', {
              detail: {
                reason: 'CONCURRENT_LOGIN',
                message: 'Se ha iniciado sesión desde otro dispositivo. Tu sesión ha sido finalizada.',
              },
            })
          );
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
