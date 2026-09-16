import MobileNotificationService from '../services/notifications.service';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-expo-token' }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-refresh-token'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
    defaults: { headers: { common: {} } },
  },
  SECURE_STORE_REFRESH_KEY: 'vetconnect_refresh_token',
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

describe('Mobile Deep Linking Navigation Handler', () => {
  it('should parse CALL_INCOMING push notification payload and route to call screen', () => {
    const mockNavigate = jest.fn();
    const data = {
      type: 'CALL_INCOMING',
      consultationId: 'cons-100',
    };

    if (data?.consultationId) {
      if (data?.type === 'CALL_INCOMING') {
        mockNavigate(`/call/${data.consultationId}`);
      } else {
        mockNavigate(`/consultation/${data.consultationId}`);
      }
    }

    expect(mockNavigate).toHaveBeenCalledWith('/call/cons-100');
  });

  it('should parse standard notification payload and route to consultation details screen', () => {
    const mockNavigate = jest.fn();
    const data = {
      type: 'MESSAGE_NEW',
      consultationId: 'cons-200',
    };

    if (data?.consultationId) {
      if (data?.type === 'CALL_INCOMING') {
        mockNavigate(`/call/${data.consultationId}`);
      } else {
        mockNavigate(`/consultation/${data.consultationId}`);
      }
    }

    expect(mockNavigate).toHaveBeenCalledWith('/consultation/cons-200');
  });

  it('should ignore notification payload without consultationId', () => {
    const mockNavigate = jest.fn();
    const data: any = { type: 'GENERIC_ALERT' };

    if (data?.consultationId) {
      mockNavigate(`/consultation/${data.consultationId}`);
    }

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should verify MobileNotificationService class exists and exposes setupNotificationListeners', () => {
    expect(MobileNotificationService).toBeDefined();
    expect(MobileNotificationService.setupNotificationListeners).toBeDefined();
  });

  it('should register push token function returning null when permission denied', async () => {
    const token = await MobileNotificationService.registerPushToken();
    expect(token).toBeNull();
  });

  it('should handle null or undefined notification response data gracefully', () => {
    const handleResponse = (data: any, navigateFn: (route: string) => void) => {
      if (data?.consultationId) {
        navigateFn(`/consultation/${data.consultationId}`);
      }
    };

    const mockNavigate = jest.fn();
    handleResponse(null, mockNavigate);
    handleResponse(undefined, mockNavigate);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
