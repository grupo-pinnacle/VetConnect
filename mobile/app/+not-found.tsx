import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors, spacing, radius } from '../src/theme/tokens';

/**
 * Catch-all for URLs that do not address a known screen.
 *
 * expo-router maps `+not-found` to the `*not-found` path pattern
 * (`expo-router/build/getReactNavigationConfig.js`), so any unmatched incoming
 * `vetconnect://` link renders here instead of a blank screen.
 *
 * Rendered inside the root `<Stack>`, so it deliberately carries no auth gate:
 * an unrecognised link must be reported even when there is no session.
 */
export default function NotFoundScreen() {
  const router = useRouter();
  // The wildcard segments arrive as route params, not as a ready-made href, so
  // the current pathname is what actually reflects the attempted address.
  const attempted = usePathname();

  return (
    <View style={styles.container} testID="not-found-screen">
      <Text style={styles.title}>Enlace no reconocido</Text>
      <Text style={styles.body}>
        VetConnect no puede abrir esta dirección dentro de la aplicación.
      </Text>
      {attempted && attempted !== '/' ? (
        <View style={styles.linkBox} testID="not-found-url">
          <Text style={styles.linkText}>{attempted}</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
        testID="not-found-home-button"
      >
        <Text style={styles.buttonText}>Ir al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    padding: spacing.xl,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.ink, marginBottom: spacing.sm },
  body: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  linkBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  linkText: { fontSize: 13, color: colors.body },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
