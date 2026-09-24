import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../lib/api';
import { ApiResponse } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class MobileNotificationService {
  public static async registerPushToken(): Promise<string | null> {
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

      // Register with backend
      await api.post<ApiResponse>('/api/notifications/register-token', {
        token,
        platform: Platform.OS,
      });

      return token;
    } catch (err) {
      console.warn('Failed to register push token with backend:', err);
      return null;
    }
  }

  public static setupNotificationListeners(onNavigate: (route: string) => void) {
    // Response listener (when user taps on notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.consultationId) {
        if (data?.type === 'CALL_INCOMING') {
          onNavigate(`/call/${data.consultationId}`);
        } else {
          onNavigate(`/consultation/${data.consultationId}`);
        }
      }
    });

    return () => {
      responseListener.remove();
    };
  }
}

export default MobileNotificationService;
