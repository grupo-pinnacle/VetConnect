import axios, {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { api, SECURE_STORE_REFRESH_KEY } from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import { ApiError, ApiResponse, AuthPayload, User } from '../types';

/**
 * These tests drive the REAL api.ts interceptor and the REAL authStore.
 * Only the boundaries are stubbed: the keychain (expo-secure-store), the router
 * (expo-router, resolved lazily by the store) and the HTTP transport (a custom
 * axios adapter installed on both the instance and the default axios client,
 * because the refresh call goes through `axios.post`).
 */

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

const STORED_REFRESH_TOKEN = 'stored-refresh-token';

const getItemAsyncMock = SecureStore.getItemAsync as unknown as jest.Mock<Promise<string | null>, [string]>;
const setItemAsyncMock = SecureStore.setItemAsync as unknown as jest.Mock<Promise<void>, [string, string]>;
const deleteItemAsyncMock = SecureStore.deleteItemAsync as unknown as jest.Mock<Promise<void>, [string]>;
const replaceMock = router.replace as unknown as jest.Mock<void, [string]>;

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const waitFor = async (predicate: () => boolean, label: string): Promise<void> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await tick();
  }
  throw new Error(`Timed out waiting for: ${label}`);
};

const errorBody = (message: string): ApiResponse<never> => ({
  success: false,
  error: { code: 'UNAUTHORIZED', message, timestamp: new Date(0).toISOString() },
});

const buildUser = (): User => ({
  id: 'user-1',
  email: 'vet@vetconnect.com',
  firstName: 'Ana',
  lastName: 'Ruiz',
  phone: null,
  role: 'VET',
  vetStatus: 'APPROVED',
  licenseNumber: 'MAT-1234',
  bio: null,
  photoUrl: null,
  ratingAvg: 0,
  ratingCount: 0,
  isOnline: true,
  lastSeen: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
});

const authPayload = (): AuthPayload => ({
  accessToken: 'fresh-access-token',
  refreshToken: 'fresh-refresh-token',
  user: buildUser(),
});

const okResponse = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config,
});

const httpError = (config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosError => {
  const response: AxiosResponse = {
    data,
    status,
    statusText: 'Unauthorized',
    headers: new AxiosHeaders(),
    config,
  };
  return new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    config,
    undefined,
    response
  );
};

interface Transport {
  refreshCalls: () => number;
}

interface TransportOptions {
  refreshShouldFail: boolean;
  /** When present, the refresh endpoint parks on it until the test resolves it. */
  refreshGate?: Promise<void>;
  /** Records the Authorization header the adapter observed, per request. */
  onRequest?: (url: string, authorization: unknown) => void;
}

const installTransport = (options: TransportOptions): Transport => {
  let refreshCalls = 0;
  const gate = options.refreshGate;
  const onRequest = options.onRequest;

  const adapter: AxiosAdapter = async (config) => {
    const url = config.url ?? '';
    onRequest?.(url, config.headers?.Authorization);

    if (url.includes('/api/auth/login')) {
      return okResponse(config, { success: true, data: authPayload() } satisfies ApiResponse<AuthPayload>);
    }

    if (url.includes('/api/auth/logout')) {
      return okResponse(config, { success: true } satisfies ApiResponse<never>);
    }

    if (url.includes('/api/auth/refresh')) {
      refreshCalls += 1;
      if (gate) await gate;
      if (options.refreshShouldFail) {
        throw httpError(config, 401, errorBody('Refresh token revocado'));
      }
      return okResponse(config, { success: true, data: authPayload() } satisfies ApiResponse<AuthPayload>);
    }

    throw httpError(config, 401, errorBody('Sesion expirada'));
  };

  // The refresh call is made through the default axios client, so both need it.
  axios.defaults.adapter = adapter;
  api.defaults.adapter = adapter;

  return { refreshCalls: () => refreshCalls };
};

describe('Mobile API session expiry handling (debt D-07)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    delete api.defaults.headers.common.Authorization;

    getItemAsyncMock.mockResolvedValue(STORED_REFRESH_TOKEN);
    setItemAsyncMock.mockResolvedValue(undefined);
    deleteItemAsyncMock.mockResolvedValue(undefined);
    replaceMock.mockImplementation(() => undefined);

    // A clean module state: the previous test may have latched an expired session.
    const { resetRefreshState } = await import('../lib/api');
    resetRefreshState();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const signIn = (): Promise<unknown> =>
    useAuthStore.getState().login({ email: 'vet@vetconnect.com', password: 'Password123!' });

  it('clears the authenticated user, the keychain token and routes to login when the refresh attempt fails', async () => {
    installTransport({ refreshShouldFail: true });

    await signIn();
    expect(useAuthStore.getState().user).not.toBeNull();

    await expect(api.get('/api/consultations/abc/messages')).rejects.toBeDefined();

    expect(deleteItemAsyncMock).toHaveBeenCalledWith(SECURE_STORE_REFRESH_KEY);
    expect(api.defaults.headers.common.Authorization).toBeUndefined();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isLoading).toBe(false);

    await waitFor(() => replaceMock.mock.calls.length > 0, 'router.replace to be called');
    expect(replaceMock).toHaveBeenCalledWith('/(auth)/login');
  });

  it('never starts a second refresh attempt after the refresh definitively failed', async () => {
    const transport = installTransport({ refreshShouldFail: true });

    await signIn();

    await expect(api.get('/api/consultations/abc/messages')).rejects.toBeDefined();
    expect(transport.refreshCalls()).toBe(1);

    // Subsequent requests must short-circuit instead of cascading refreshes.
    await expect(api.get('/api/consultations/def/messages')).rejects.toBeDefined();
    await expect(api.get('/api/consultations/ghi/messages')).rejects.toBeDefined();

    expect(transport.refreshCalls()).toBe(1);
  });

  it('recovers the refresh flow after a fresh login re-arms the module state', async () => {
    const transport = installTransport({ refreshShouldFail: true });

    await signIn();
    await expect(api.get('/api/consultations/abc/messages')).rejects.toBeDefined();
    expect(transport.refreshCalls()).toBe(1);

    // A brand new session must not inherit the "already expired" latch.
    await signIn();
    await expect(api.get('/api/consultations/abc/messages')).rejects.toBeDefined();

    expect(transport.refreshCalls()).toBe(2);
  });

  it('logout drains the requests parked in the refresh queue and releases the in-flight flag', async () => {
    let releaseRefresh: () => void = () => undefined;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    const transport = installTransport({ refreshShouldFail: true, refreshGate });
    await signIn();

    // First 401 becomes the refresher and parks on the gate.
    const refreshing = api.get('/api/consultations/abc/messages').catch(() => 'rejected');
    await waitFor(() => transport.refreshCalls() === 1, 'the first request to start a refresh');

    // Second 401 has nowhere to go: it parks in the queue behind the refresher.
    const parked = api.get('/api/consultations/abc/messages').catch(() => 'rejected');
    await tick();
    expect(transport.refreshCalls()).toBe(1);

    await useAuthStore.getState().logout();

    // The parked request must be settled by the reset, not left hanging.
    await expect(parked).resolves.toBe('rejected');

    // A request issued after logout must start its own refresh rather than
    // queue behind a dead one, which proves `isRefreshing` was reset.
    const afterLogout = api.get('/api/consultations/def/messages').catch(() => 'rejected');
    await waitFor(() => transport.refreshCalls() === 2, 'a new refresh attempt after logout');

    releaseRefresh();
    await expect(refreshing).resolves.toBe('rejected');
    await expect(afterLogout).resolves.toBe('rejected');
  });

  it('promotes the rotated access token to the instance default so later requests never reuse the stale one', async () => {
    const seen: Array<{ url: string; authorization: unknown }> = [];

    // The happy path: every protected call 401s exactly once, the refresh
    // succeeds, and the retried call carries the rotated token.
    const adapter: AxiosAdapter = async (config) => {
      const url = config.url ?? '';
      seen.push({ url, authorization: config.headers?.Authorization });
      if (url.includes('/api/auth/login')) {
        return okResponse(config, { success: true, data: authPayload() } satisfies ApiResponse<AuthPayload>);
      }
      if (url.includes('/api/auth/refresh')) {
        return okResponse(config, { success: true, data: authPayload() } satisfies ApiResponse<AuthPayload>);
      }
      if (config.headers?.Authorization === 'Bearer fresh-access-token') {
        return okResponse(config, { success: true, data: [] } satisfies ApiResponse<unknown>);
      }
      throw httpError(config, 401, errorBody('Sesion expirada'));
    };
    axios.defaults.adapter = adapter;
    api.defaults.adapter = adapter;

    await signIn();
    // Simulate the state after a first rotation: the instance still holds the
    // previous token, which is exactly what the refresh path used to leave behind.
    api.defaults.headers.common.Authorization = 'Bearer stale-access-token';

    const first = await api.get('/api/consultations/abc');
    expect(first.data.success).toBe(true);
    expect(api.defaults.headers.common.Authorization).toBe('Bearer fresh-access-token');

    // A later, unrelated request must ride the rotated default and never be
    // pushed back through the refresh branch.
    const refreshesBefore = seen.filter((r) => r.url.includes('/api/auth/refresh')).length;
    await api.get('/api/consultations/def');
    const refreshesAfter = seen.filter((r) => r.url.includes('/api/auth/refresh')).length;

    expect(refreshesAfter).toBe(refreshesBefore);
    expect(seen[seen.length - 1].authorization).toBe('Bearer fresh-access-token');
  });
});
