import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';
import api from '../../src/lib/api';
import { Pet, Consultation, ApiResponse } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, consRes] = await Promise.all([
          api.get<ApiResponse<Pet[]>>('/api/pets'),
          api.get<ApiResponse<Consultation[]>>('/api/consultations/mine'),
        ]);

        if (petsRes.data.success && petsRes.data.data) {
          setPets(petsRes.data.data);
        }
        if (consRes.data.success && consRes.data.data) {
          setConsultations(consRes.data.data);
        }
      } catch (err) {
        console.warn('Error cargando inicio mobile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>VetConnect Mobile</Text>
          <Text style={styles.headerSub}>Bienvenido, {user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Mis Mascotas ({pets.length})</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No tienes mascotas registradas</Text>}
        renderItem={({ item }) => (
          <View style={styles.petCard}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.species} - {item.breed}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Consultas ({consultations.length})</Text>
      <FlatList
        data={consultations}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No tienes consultas registradas</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.consCard}
            onPress={() => router.push(`/call/${item.id}`)}
          >
            <View style={styles.consHeader}>
              <Text style={styles.consStatus}>{item.status}</Text>
              <Text style={styles.consDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.consNotes}>{item.notes}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  headerSub: { fontSize: 14, color: '#475569' },
  logoutBtn: { backgroundColor: '#E2E8F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  logoutText: { color: '#334155', fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 16, marginBottom: 8 },
  petCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginRight: 12, width: 140, borderWidth: 1, borderColor: '#CBD5E1' },
  petName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  petBreed: { fontSize: 12, color: '#64748B', marginTop: 4 },
  consCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  consHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  consStatus: { fontWeight: 'bold', color: '#0284C7' },
  consDate: { fontSize: 12, color: '#94A3B8' },
  consNotes: { fontSize: 14, color: '#334155', marginTop: 6 },
  empty: { color: '#94A3B8', fontSize: 14, marginVertical: 8 },
});
