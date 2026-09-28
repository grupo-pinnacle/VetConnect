import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/lib/authStore';
import MobileNotificationService from '../src/services/notifications.service';

/**
 * The root layout is a navigator and must stay one.
 *
 * It previously replaced the `<Stack>` with a bare spinner while `initAuth()`
 * ran. expo-router resolves `linking.getInitialURL()` into a one-shot
 * `initialState` during the very first render of its own `NavigationContainer`
 * (`expo-router/build/global-state/router-store.js`), which is *before* this
 * component renders; when no navigator is mounted that state is dropped on the
 * floor, so a cold-start `vetconnect://call/:id` silently landed on `/` instead
 * of the call screen. Rendering the `<Stack>` unconditionally hands the initial
 * state to a navigator that actually exists.
 *
 * The auth gate moved down to the screens that consume auth state:
 * `app/index.tsx` and `app/(app)/_layout.tsx` render the splash while
 * `isLoading`, so a link into `(app)` still waits for the session instead of
 * flashing the login screen.
 */
export default function RootLayout() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const router = useRouter();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  // WU4 / D-01: both calls were unreachable from production code, so no token
  // was ever registered and no tap listener was ever installed. Gated on a real
  // session — registering before auth resolves would bind the token to no user.
  useEffect(() => {
    if (!userId) return undefined;

    void MobileNotificationService.registerPushToken();

    const unsubscribe = MobileNotificationService.setupNotificationListeners((href) => {
      router.replace(href);
    });

    return unsubscribe;
  }, [userId, router]);

  // A tap that cold-started the process is drained by the listener above. It can
  // only resolve once a session exists, which is strictly after the navigator
  // mounted, so `router.replace` always lands on a mounted navigator.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
