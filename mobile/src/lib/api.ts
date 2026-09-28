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

/**
 * Callback invoked when the refresh flow fails terminally (revoked, expired or
 * missing refresh token).
 *
 * It is injected by the auth store instead of being imported here: `authStore`
 * already depends on this module, so importing it back would close an import
 * cycle and leave the store holding a partially initialised binding.
 */
export type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

let isRefreshing = false;
let isSessionExpired = false;
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

/**
 * Resets every module-level singleton that outlives a single request.
 *
 * Called on logout and after a successful login so a brand new session never
 * inherits a stuck in-flight flag, a stale queue or an "already expired" latch
 * from the previous one. Queued requests are rejected instead of dropped so no
 * caller is left hanging forever.
 */
export function resetRefreshState(): void {
  isRefreshing = false;
  isSessionExpired = false;
  processQueue(new Error('Refresh state reset'));
}

/**
 * Latches the terminal failure: drops the cached Authorization header and hands
 * control to the injected handler exactly once. The latch is what guarantees a
 * failed refresh never triggers another refresh attempt.
 */
function expireSession(): void {
  if (isSessionExpired) return;
  isSessionExpired = true;
  delete api.defaults.headers.common.Authorization;
  sessionExpiredHandler?.();
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Latched terminal failure: never start a second refresh for the same
      // dead session, otherwise every subsequent request would cascade.
      if (isSessionExpired) {
        return Promise.reject(error);
      }

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
          // The rotated token must also become the instance default. Setting it
          // only on the retried request would leave every later request carrying
          // the stale token, sending it back through this interceptor on every
          // call. `authStore.applySession` establishes the same invariant.
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

          if (newRefreshToken) {
            await SecureStore.setItemAsync(SECURE_STORE_REFRESH_KEY, newRefreshToken);
          }

          isSessionExpired = false;
          processQueue(null);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_KEY).catch(() => {});
        processQueue(refreshError);
        // Terminal failure: clear the session and route to login so the user is
        // not stranded on a screen that only ever receives 401s.
        expireSession();
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
