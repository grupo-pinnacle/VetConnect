import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';
import { colors } from '../../src/theme/tokens';
import socketManager from '../../src/lib/socket';
import callSignalingService from '../../src/services/callSignaling.service';
import { IncomingCallModal } from '../../src/components/IncomingCallModal';
import MobileNotificationService from '../../src/services/notifications.service';
import { checkVetAccess, resolveUserNavTabs } from '../../src/lib/navGuards';

/**
 * Zona autenticada con Tabs + bloqueo SENASA (ADR-013).
 * VET con vetStatus !== APPROVED ve pantalla de espera, sin acceso a salas.
 */
function VetPendingBlock() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <View style={styles.block} testID="vet-pending-block">
      <Text style={styles.blockTitle}>Cuenta en revisión SENASA</Text>
      <Text style={styles.blockBody}>
        Tu matrícula profesional está pendiente de validación. Te avisaremos cuando tu cuenta sea
        aprobada para operar.
      </Text>
      <TouchableOpacity style={styles.blockBtn} onPress={logout} testID="vet-pending-logout">
        <Text style={styles.blockBtnText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppLayout() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!accessToken) return;
    socketManager.connect(accessToken);
    const unsubscribeCall = callSignalingService.initListener();

    MobileNotificationService.registerPushToken().catch((err) => {
      console.warn('Failed registering push token:', err);
    });

    const unsubscribePush = MobileNotificationService.setupNotificationListeners((href) => {
      router.push(href as any);
    });

    return () => {
      unsubscribeCall();
      unsubscribePush();
    };
  }, [accessToken, router]);

  // A deep link lands straight on this layout (`vetconnect://call/:id` resolves
  // to `/(app)/call/[consultationId]`), bypassing `app/index.tsx`. Without the
  // auth gate here, `initAuth()` would still be running and the screen would
  // mount with `user === null`.
  if (isLoading) {
    return (
      <View style={styles.block} testID="app-auth-splash">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  if (checkVetAccess(user) === 'BLOCKED_SENASA') {
    return <VetPendingBlock />;
  }

  const { homeTitle, consultationHref, petsHref } = resolveUserNavTabs(user);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: homeTitle }}
        />
        <Tabs.Screen
          name="consultation/new"
          options={{
            title: 'Consulta',
            href: consultationHref,
          }}
        />
        <Tabs.Screen
          name="pets/new"
          options={{
            title: 'Mascota',
            href: petsHref,
          }}
        />
        <Tabs.Screen name="pets/[id]" options={{ href: null, title: 'Mascota' }} />
        <Tabs.Screen name="notifications" options={{ title: 'Alertas' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
        <Tabs.Screen name="history" options={{ href: null, title: 'Historial' }} />
        <Tabs.Screen
          name="chat/[consultationId]"
          options={{ href: null, title: 'Chat' }}
        />
        <Tabs.Screen name="call/[consultationId]" options={{ href: null, title: 'Llamada' }} />
        <Tabs.Screen
          name="consultation/[id]"
          options={{ href: null, title: 'Detalle' }}
        />
        <Tabs.Screen
          name="consultation/[id]/prescribe"
          options={{ href: null, title: 'Receta' }}
        />
        <Tabs.Screen name="prescriptions/[id]" options={{ href: null, title: 'Receta' }} />
        <Tabs.Screen name="review/[consultationId]" options={{ href: null, title: 'Calificar' }} />
      </Tabs>
      <IncomingCallModal />
    </>
  );
}

const styles = StyleSheet.create({
  block: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFF' },
  blockTitle: { fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 8, textAlign: 'center' },
  blockBody: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  blockBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  blockBtnText: { color: '#FFF', fontWeight: 'bold' },
});
