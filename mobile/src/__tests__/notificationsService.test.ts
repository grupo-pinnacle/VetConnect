const post = jest.fn();
const get = jest.fn();
const patch = jest.fn();
const getPermissionsAsync = jest.fn();
const requestPermissionsAsync = jest.fn();
const getExpoPushTokenAsync = jest.fn();
const getLastNotificationResponse = jest.fn();
const addNotificationResponseReceivedListener = jest.fn();
const setNotificationHandler = jest.fn();
const responseSubscription = { remove: jest.fn() };

jest.mock('expo-notifications', () => ({
  setNotificationHandler,
  getPermissionsAsync,
  requestPermissionsAsync,
  getExpoPushTokenAsync,
  getLastNotificationResponse,
  addNotificationResponseReceivedListener,
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: { post, get, patch, defaults: { headers: { common: {} } } },
  SECURE_STORE_REFRESH_KEY: 'vetconnect_refresh_token',
  resetRefreshState: jest.fn(),
  setSessionExpiredHandler: jest.fn(),
}));

/**
 * `Platform.OS` is a module-level import in the service, so each platform has to
 * be exercised in its own module registry.
 */
type ServiceModule = typeof import('../services/notifications.service');

function loadService(platformOs: string): {
  service: ServiceModule['default'];
  toBackendPlatform: ServiceModule['toBackendPlatform'];
} {
  let loaded!: { service: ServiceModule['default']; toBackendPlatform: ServiceModule['toBackendPlatform'] };

  jest.isolateModules(() => {
    jest.doMock('react-native', () => ({ Platform: { OS: platformOs } }));
    const mod = require('../services/notifications.service') as ServiceModule;
    loaded = { service: mod.default, toBackendPlatform: mod.toBackendPlatform };
  });

  return loaded;
}

beforeEach(() => {
  jest.clearAllMocks();
  addNotificationResponseReceivedListener.mockReturnValue(responseSubscription);
  getLastNotificationResponse.mockReturnValue(null);
  getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[abc]' });
  post.mockResolvedValue({ data: { success: true } });
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('backend platform enum gate', () => {
  it.each(['ios', 'android', 'web'])('accepts %s', (os) => {
    const { toBackendPlatform } = loadService(os);
    expect(toBackendPlatform(os)).toBe(os);
  });

  // Platform.OS yields these under Expo Go / desktop, and the backend enum is
  // `z.enum(['ios', 'android', 'web'])` -> 400 for anything else.
  it.each(['macos', 'windows', 'webos', 'native', 'IOS', ''])('rejects %s', (os) => {
    const { toBackendPlatform } = loadService(os);
    expect(toBackendPlatform(os)).toBeNull();
  });
});

describe('registerPushToken', () => {
  it('registers the token on a supported platform', async () => {
    const { service } = loadService('android');

    const token = await service.registerPushToken();

    expect(token).toBe('ExponentPushToken[abc]');
    expect(post).toHaveBeenCalledWith('/api/notifications/register-token', {
      token: 'ExponentPushToken[abc]',
      platform: 'android',
    });
  });

  it('does NOT post when Platform.OS is outside the backend enum', async () => {
    const { service } = loadService('macos');

    const token = await service.registerPushToken();

    expect(token).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  it('does NOT prompt for a permission it could not use', async () => {
    const { service } = loadService('windows');

    await service.registerPushToken();

    expect(getPermissionsAsync).not.toHaveBeenCalled();
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('returns null when permission is denied', async () => {
    getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { service } = loadService('ios');

    expect(await service.registerPushToken()).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  it('returns null instead of throwing when token acquisition fails (no FCM credentials)', async () => {
    // app.json has no android.googleServicesFile, so getExpoPushTokenAsync
    // cannot succeed on a production Android build. That must not surface.
    getExpoPushTokenAsync.mockRejectedValue(new Error('No Firebase App'));
    const { service } = loadService('android');

    await expect(service.registerPushToken()).resolves.toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  it('returns null instead of throwing when the registration POST fails', async () => {
    post.mockRejectedValue(new Error('Network Error'));
    const { service } = loadService('ios');

    await expect(service.registerPushToken()).resolves.toBeNull();
  });

  it('returns null when the token comes back empty', async () => {
    getExpoPushTokenAsync.mockResolvedValue({ data: '' });
    const { service } = loadService('ios');

    expect(await service.registerPushToken()).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });
});

describe('setupNotificationListeners', () => {
  it('navigates a warm tap to the call screen', () => {
    const { service } = loadService('ios');
    const onNavigate = jest.fn();
    getLastNotificationResponse.mockReturnValue(null);

    service.setupNotificationListeners(onNavigate);
    const listener = addNotificationResponseReceivedListener.mock.calls[0][0];
    listener({ notification: { request: { identifier: 'r1', content: { data: { type: 'CALL_INCOMING', consultationId: 'cons-1' } } } } });

    expect(onNavigate).toHaveBeenCalledWith('/(app)/call/cons-1');
  });

  it('navigates a cold-start tap, which never reaches the response listener', () => {
    const { service } = loadService('ios');
    const onNavigate = jest.fn();
    getLastNotificationResponse.mockReturnValue({
      notification: {
        request: { identifier: 'r-cold', content: { data: { type: 'MESSAGE_NEW', consultationId: 'cons-2' } } },
      },
    });

    service.setupNotificationListeners(onNavigate);

    expect(onNavigate).toHaveBeenCalledWith('/(app)/consultation/cons-2');
  });

  it('deduplicates a tap delivered by both the cold-start drain and the listener', () => {
    const { service } = loadService('ios');
    const onNavigate = jest.fn();
    const response = {
      notification: { request: { identifier: 'r1', content: { data: { type: 'CALL_INCOMING', consultationId: 'cons-1' } } } },
    };
    getLastNotificationResponse.mockReturnValue(response);

    service.setupNotificationListeners(onNavigate);
    addNotificationResponseReceivedListener.mock.calls[0][0](response);

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('ignores a tap with no routable payload', () => {
    const { service } = loadService('ios');
    const onNavigate = jest.fn();
    getLastNotificationResponse.mockReturnValue({
      notification: { request: { identifier: 'r1', content: { data: { type: 'SYSTEM' } } } },
    });

    service.setupNotificationListeners(onNavigate);

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('removes the subscription on teardown', () => {
    const { service } = loadService('ios');

    const teardown = service.setupNotificationListeners(jest.fn());
    teardown();

    expect(responseSubscription.remove).toHaveBeenCalled();
  });
});

describe('SDK 54 notification handler keys', () => {
  it('uses only keys valid in expo-notifications 0.32 and omits the deprecated one', () => {
    loadService('ios');

    expect(setNotificationHandler).toHaveBeenCalledTimes(1);
    const handler = setNotificationHandler.mock.calls[0][0].handleNotification;

    return handler().then((behavior: Record<string, unknown>) => {
      expect(behavior).toEqual({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      });
      // `shouldShowAlert` is @deprecated in favour of banner/list in SDK 54.
      expect(behavior).not.toHaveProperty('shouldShowAlert');
    });
  });
});

describe('fetchNotifications, markAsRead and markAllAsRead', () => {
  it('fetches notifications from GET /api/notifications', async () => {
    const { service } = loadService('android');
    get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'n1', title: 'Alerta', body: 'Mensaje', isRead: false }],
      },
    });

    const result = await service.fetchNotifications();

    expect(get).toHaveBeenCalledWith('/api/notifications');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('n1');
  });

  it('marks a single notification as read with PATCH /api/notifications/:id/read', async () => {
    const { service } = loadService('android');
    patch.mockResolvedValueOnce({ data: { success: true } });

    await service.markAsRead('n1');

    expect(patch).toHaveBeenCalledWith('/api/notifications/n1/read');
  });

  it('marks all notifications as read with PATCH /api/notifications/read-all', async () => {
    const { service } = loadService('android');
    patch.mockResolvedValueOnce({ data: { success: true } });

    await service.markAllAsRead();

    expect(patch).toHaveBeenCalledWith('/api/notifications/read-all');
  });
});
