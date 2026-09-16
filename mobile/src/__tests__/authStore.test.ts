import { useAuthStore } from '../lib/authStore';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-refresh-token'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    defaults: {
      headers: {
        common: {},
      },
    },
    post: jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-new-refresh-token',
          user: {
            id: 'user-1',
            email: 'test@vetconnect.com',
            firstName: 'Juan',
            lastName: 'Perez',
            role: 'CLIENT',
          },
        },
      },
    }),
  },
  SECURE_STORE_REFRESH_KEY: 'vetconnect_refresh_token',
}));

describe('Mobile AuthStore (Zustand + SecureStore)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize auth by fetching refresh token from secure store', async () => {
    const initAuth = useAuthStore.getState().initAuth;
    await initAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeDefined();
    expect(state.user?.email).toBe('test@vetconnect.com');
    expect(state.accessToken).toBe('mock-access-token');
    expect(state.isLoading).toBe(false);
  });

  it('should perform login and persist refreshToken in SecureStore', async () => {
    const login = useAuthStore.getState().login;
    const user = await login({ email: 'test@vetconnect.com', password: 'Password123!' });

    expect(user.email).toBe('test@vetconnect.com');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('vetconnect_refresh_token', 'mock-new-refresh-token');
  });

  it('should clear tokens and user state on logout', async () => {
    const logout = useAuthStore.getState().logout;
    await logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('vetconnect_refresh_token');
  });
});
