import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/lib/authStore';
import { colors } from '../src/theme/tokens';

/**
 * Root index: redirección por rol (docs/mobile/02_*).
 * - Sesión en curso → splash. El layout raíz ya no bloquea el mounting del
 *   `<Stack>` (eso descartaba el `initialState` de un deep link en frío), así
 *   que esta pantalla es la que debe sostener la espera: sin este guarda,
 *   `user` es `null` mientras `initAuth()` corre y cada arranque expulsaría al
 *   usuario al login.
 * - Sin sesión → /(auth)/login
 * - VET no aprobado → /(auth)/login con bloqueo (la app mobile es del tutor;
 *   el vet opera en web hasta aprobación SENASA)
 * - Resto → /(app)
 */
export default function Index() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View style={styles.splash} testID="auth-splash">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(app)" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
});
