import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';
import { colors } from '../../src/theme/tokens';

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
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'VET' && user?.vetStatus !== 'APPROVED') {
    return <VetPendingBlock />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="consultation/new" options={{ title: 'Consulta', href: 'consultation/new' }} />
      <Tabs.Screen name="pets/new" options={{ title: 'Mascota' }} />
      <Tabs.Screen name="pets/[id]" options={{ href: null, title: 'Mascota' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alertas' }} />
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
  );
}

const styles = StyleSheet.create({
  block: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFF' },
  blockTitle: { fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 8, textAlign: 'center' },
  blockBody: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  blockBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  blockBtnText: { color: '#FFF', fontWeight: 'bold' },
});
