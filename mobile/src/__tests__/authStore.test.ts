import { useAuthStore } from '../lib/authStore';

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
  it('should initialize auth by fetching refresh token from secure store', async () => {
    const initAuth = useAuthStore.getState().initAuth;
    await initAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeDefined();
    expect(state.user?.email).toBe('test@vetconnect.com');
    expect(state.accessToken).toBe('mock-access-token');
    expect(state.isLoading).toBe(false);
  });
});
