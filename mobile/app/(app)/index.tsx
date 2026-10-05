import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/lib/authStore';
import api, { getApiErrorMessage } from '../../src/lib/api';
import { Pet, Consultation, ApiResponse } from '../../src/types';
import { VetWorkspace } from '../../src/components/VetWorkspace';
import { StatusBadge } from '../../src/components/StatusBadge';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, radius } from '../../src/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [petsRes, consRes] = await Promise.all([
        api.get<ApiResponse<Pet[]>>('/api/pets'),
        api.get<ApiResponse<Consultation[]>>('/api/consultations/mine'),
      ]);

      if (petsRes.data.success && petsRes.data.data) setPets(petsRes.data.data);
      if (consRes.data.success && consRes.data.data) setConsultations(consRes.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error cargando inicio. Verifique su conexión.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (user?.role === 'VET') {
    return <VetWorkspace />;
  }

  if (loading) {
    return (
      <View style={styles.center} testID="home-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const featuredPet = pets[0];

  const header = (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>VetConnect</Text>
          <Text style={styles.headerSub}>Bienvenido, {user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => router.push('/profile')}
          testID="home-go-profile"
        >
          <Text style={styles.avatarText}>{(user?.firstName?.[0] || '?').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox} testID="home-error">
          <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
          <View style={styles.errorBody}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => { setLoading(true); fetchData(); }} testID="home-retry">
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {featuredPet ? (
        <TouchableOpacity
          style={styles.passport}
          onPress={() => router.push(`/pets/${featuredPet.id}`)}
          testID="home-passport"
        >
          <View style={styles.passportTop}>
            <Text style={styles.passportLabel}>PASAPORTE SANITARIO</Text>
            <Ionicons name="shield-checkmark" size={20} color={colors.okLight} />
          </View>
          <Text style={styles.passportName}>{featuredPet.name}</Text>
          <Text style={styles.passportMeta}>{featuredPet.species} - {featuredPet.breed}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.passportEmpty} testID="home-passport-empty">
          <Ionicons name="paw-outline" size={28} color={colors.muted} />
          <Text style={styles.passportEmptyText}>Registra a tu mascota para crear su pasaporte sanitario</Text>
        </View>
      )}

      <View style={styles.cta}>
        <PrimaryButton
          title="Solicitar consulta"
          icon="medkit"
          variant="danger"
          onPress={() => router.push('/consultation/new')}
          testID="home-new-consultation"
        />
      </View>

      <Text style={styles.sectionTitle}>Mis Mascotas ({pets.length})</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No tienes mascotas registradas</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.petCard}
            onPress={() => router.push(`/pets/${item.id}`)}
            testID={`home-pet-${item.id}`}
          >
            <Ionicons name="paw" size={20} color={colors.primary} />
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.species} - {item.breed}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Consultas ({consultations.length})</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/history')} testID="home-go-history">
          <Text style={styles.sectionLink}>Historial</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container} testID="home-screen">
      <FlatList
        data={consultations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No tienes consultas registradas</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.consCard}
            onPress={() => router.push(`/consultation/${item.id}`)}
            testID={`home-cons-${item.id}`}
          >
            <View style={styles.consHeader}>
              <StatusBadge status={item.status} />
              <Text style={styles.consDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.consNotes} numberOfLines={2}>{item.notes}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  headerSub: { fontSize: 14, color: colors.muted },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorBox: { flexDirection: 'row', backgroundColor: colors.dangerTint, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, padding: 12, marginBottom: 12 },
  errorBody: { flex: 1, marginLeft: 8 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 6 },
  retryText: { color: colors.primary, fontWeight: 'bold' },
  passport: { backgroundColor: colors.passport, borderRadius: radius.pass, padding: 20, marginBottom: 16 },
  passportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passportLabel: { color: colors.faint, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  passportName: { color: '#FFF', fontSize: 26, fontWeight: '800', marginTop: 16 },
  passportMeta: { color: colors.lineDark, fontSize: 14, marginTop: 4 },
  passportEmpty: { alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.pass, borderWidth: 1, borderColor: colors.line, padding: 20, marginBottom: 16 },
  passportEmptyText: { color: colors.muted, textAlign: 'center', marginTop: 8, fontSize: 13 },
  cta: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 16, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  sectionLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  petCard: { backgroundColor: colors.card, padding: 16, borderRadius: radius.lg, marginRight: 12, width: 140, borderWidth: 1, borderColor: colors.line },
  petName: { fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 8 },
  petBreed: { fontSize: 12, color: colors.muted, marginTop: 4 },
  consCard: { backgroundColor: colors.card, padding: 16, borderRadius: radius.lg, marginBottom: 10, borderWidth: 1, borderColor: colors.line },
  consHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  consDate: { fontSize: 12, color: colors.faint },
  consNotes: { fontSize: 14, color: colors.body, marginTop: 8 },
  empty: { color: colors.faint, fontSize: 14, marginVertical: 8 },
});
