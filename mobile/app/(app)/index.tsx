import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';
import api, { getApiErrorMessage } from '../../src/lib/api';
import { Pet, Consultation, ApiResponse } from '../../src/types';
import { colors } from '../../src/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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

  if (loading) {
    return (
      <View style={styles.center} testID="home-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="home-screen">
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>VetConnect Mobile</Text>
          <Text style={styles.headerSub}>Bienvenido, {user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} testID="home-logout">
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox} testID="home-error">
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetchData(); }} testID="home-retry">
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.species} - {item.breed}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Consultas ({consultations.length})</Text>
        <TouchableOpacity onPress={() => router.push('/history')} testID="home-go-history">
          <Text style={styles.sectionLink}>Historial →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={consultations}
        keyExtractor={(item) => item.id}
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
              <Text style={styles.consStatus}>{item.status}</Text>
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
  container: { flex: 1, backgroundColor: colors.canvas, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.ink },
  headerSub: { fontSize: 14, color: '#475569' },
  logoutBtn: { backgroundColor: colors.line, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  logoutText: { color: colors.body, fontWeight: 'bold', fontSize: 12 },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 6 },
  retryText: { color: colors.primary, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 16, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionLink: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },
  petCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginRight: 12, width: 140, borderWidth: 1, borderColor: colors.lineDark },
  petName: { fontSize: 16, fontWeight: 'bold', color: colors.ink },
  petBreed: { fontSize: 12, color: colors.muted, marginTop: 4 },
  consCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.lineDark },
  consHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  consStatus: { fontWeight: 'bold', color: colors.primary },
  consDate: { fontSize: 12, color: colors.faint },
  consNotes: { fontSize: 14, color: colors.body, marginTop: 6 },
  empty: { color: colors.faint, fontSize: 14, marginVertical: 8 },
});
