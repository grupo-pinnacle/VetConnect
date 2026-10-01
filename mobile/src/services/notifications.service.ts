import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../lib/api';
import { ApiResponse, Notification } from '../types';
import { resolveNotificationHref } from '../lib/deepLinks';

/**
 * SDK 54 (expo-notifications 0.32.x) `NotificationBehavior` requires
 * `shouldShowBanner` / `shouldShowList` / `shouldPlaySound` / `shouldSetBadge`.
 * `shouldShowAlert` is still in the type but is already flagged
 * `@deprecated instead, specify shouldShowBanner and / or shouldShowList`, and
 * it is not part of the SDK 54 documented handler. It is deliberately omitted.
 *
 * Android computes `shouldPresentAlert = shouldShowBanner || shouldShowList ||
 * shouldShowAlert`, so the banner/list pair alone still presents the
 * notification.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * The backend enum is closed: `z.enum(['ios', 'android', 'web'])`
 * (`backend/src/modules/notifications/notifications.schemas.ts:5`). Anything
 * outside it is rejected with 400, so it is filtered out before the POST.
 */
export type BackendPlatform = 'ios' | 'android' | 'web';

const BACKEND_PLATFORMS: readonly BackendPlatform[] = ['ios', 'android', 'web'];

/**
 * Narrows a `Platform.OS` value to the backend enum.
 *
 * `Platform.OS` also yields `macos`, `windows` and `web`-adjacent values under
 * Expo Go, none of which the backend accepts.
 */
export function toBackendPlatform(os: string): BackendPlatform | null {
  return (BACKEND_PLATFORMS as readonly string[]).includes(os) ? (os as BackendPlatform) : null;
}

export class MobileNotificationService {
  /**
   * Requests notification permission, acquires an Expo push token and registers
   * it against the current session.
   *
   * Every failure mode degrades to `null` instead of throwing: a denied
   * permission, a missing FCM credential (`app.json` has no
   * `android.googleServicesFile`, so `getExpoPushTokenAsync` cannot succeed on
   * a production Android build until one exists) and a rejected registration
   * must never surface as an error or an unhandled rejection in the UI.
   */
  public static async registerPushToken(): Promise<string | null> {
    // Checked first: no point prompting for a permission we could not use, and
    // no request that is guaranteed to fail validation.
    const platform = toBackendPlatform(Platform.OS);
    if (!platform) {
      console.warn(
        `Push token registration skipped: Platform.OS "${Platform.OS}" is not in the backend enum`
      );
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission denied by user');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      if (!token) {
        console.warn('Expo push token acquisition returned an empty token');
        return null;
      }

      await api.post<ApiResponse>('/api/notifications/register-token', { token, platform });

      return token;
    } catch (err) {
      console.warn('Failed to register push token with backend:', err);
      return null;
    }
  }

  /**
   * Installs the notification-tap listener and returns a teardown function.
   *
   * `onNavigate` receives a ready-to-use expo-router href, not a raw path, so
   * the caller can `router.replace` it directly.
   *
   * Cold start: `getLastNotificationResponse()` is drained synchronously on
   * subscribe, because a tap that launched the process never reaches
   * `addNotificationResponseReceivedListener`. Taps are deduplicated by request
   * identifier so a warm tap handled by the listener is not replayed.
   */
  public static setupNotificationListeners(onNavigate: (href: string) => void): () => void {
    const handled = new Set<string>();

    const dispatch = (response: Notifications.NotificationResponse | null): void => {
      if (!response) return;

      const identifier = response.notification.request.identifier;
      if (handled.has(identifier)) return;
      handled.add(identifier);

      const href = resolveNotificationHref(response.notification.request.content.data);
      if (href) onNavigate(href);
    };

    // Launch tap (process started by the notification).
    dispatch(Notifications.getLastNotificationResponse());

    const responseListener = Notifications.addNotificationResponseReceivedListener(dispatch);

    return () => {
      responseListener.remove();
      handled.clear();
    };
  }

  public static async fetchNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/api/notifications');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error cargando notificaciones');
    }
    return res.data.data;
  }

  public static async markAsRead(id: string): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`);
  }

  public static async markAllAsRead(): Promise<void> {
    await api.patch('/api/notifications/read-all');
  }
}

export default MobileNotificationService;
