import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useConsultations } from '../hooks/useConsultations';
import { useProfile } from '../hooks/useProfile';
import { assignConsultation } from '../services/consultations.service';
import { parseTriagePriority } from '../lib/triage';
import { LoadingView, ErrorBox, EmptyView } from './ScreenState';
import { TriageBadge } from './StatusBadge';
import { PrimaryButton } from './PrimaryButton';
import { Consultation } from '../types';
import { colors } from '../theme/tokens';

/**
 * Guardia veterinaria (rol VET aprobado). Alta cohesión: cola WAITING para
 * tomar + activas propias + toggle de disponibilidad en un solo lugar.
 */
export function VetWorkspace() {
  const router = useRouter();
  const { user, setOnline } = useProfile();
  const { consultations, loading, refreshing, error, refresh, setRefreshing } = useConsultations();
  const [actionError, setActionError] = useState<string | null>(null);
  const [takingId, setTakingId] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const waiting = consultations
    .filter((c) => c.status === 'WAITING')
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const mine = consultations.filter(
    (c) => c.status === 'ACTIVE' && c.vetId === user?.id
  );

  const handleToggle = async (value: boolean) => {
    setToggling(true);
    setActionError(null);
    try {
      await setOnline(value);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo cambiar disponibilidad');
    } finally {
      setToggling(false);
    }
  };

  const handleTake = async (item: Consultation) => {
    setTakingId(item.id);
    setActionError(null);
    try {
      await assignConsultation(item.id);
      router.push(`/chat/${item.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo tomar la consulta');
    } finally {
      setTakingId(null);
    }
  };

  if (loading) return <LoadingView testID="vet-loading" />;

  return (
    <View style={styles.container} testID="vet-workspace">
      <Text style={styles.title}>Guardia veterinaria</Text>
      {!!(error || actionError) && (
        <ErrorBox message={actionError || error || ''} onRetry={refresh} testID="vet-error" />
      )}

      <View style={styles.onlineCard} testID="vet-online-card">
        <View>
          <Text style={styles.onlineTitle}>Disponible para triage</Text>
          <Text style={styles.onlineSub}>
            {user?.isOnline ? 'Recibiendo casos de la cola' : 'En pausa — actívate para atender'}
          </Text>
        </View>
        <Switch
          value={!!user?.isOnline}
          onValueChange={handleToggle}
          disabled={toggling}
          testID="vet-online-switch"
        />
      </View>

      <Text style={styles.section}>En espera ({waiting.length})</Text>
      <FlatList
        data={waiting}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyView message="Sin casos en espera" testID="vet-waiting-empty" />}
        renderItem={({ item }) => {
          const priority = parseTriagePriority(item.notes);
          return (
            <View style={styles.card} testID={`vet-waiting-${item.id}`}>
              <View style={styles.cardHeader}>
                {!!priority && <TriageBadge priority={priority} />}
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
              </View>
              <Text style={styles.pet}>{item.pet?.name || 'Mascota'}</Text>
              <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
              <View style={styles.takeBtn}>
                <PrimaryButton
                  title="Tomar caso"
                  onPress={() => handleTake(item)}
                  loading={takingId === item.id}
                  testID={`vet-take-${item.id}`}
                />
              </View>
            </View>
          );
        }}
      />

      <Text style={styles.section}>Mis activas ({mine.length})</Text>
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} />
        }
        ListEmptyComponent={<EmptyView message="Sin consultas activas" testID="vet-active-empty" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/consultation/${item.id}`)}
            testID={`vet-active-${item.id}`}
          >
            <Text style={styles.pet}>{item.pet?.name || 'Mascota'}</Text>
            <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.ink, marginBottom: 12, marginTop: 40 },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  onlineTitle: { fontSize: 15, fontWeight: 'bold', color: colors.ink },
  onlineSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  section: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 14, marginBottom: 8 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.lineDark },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  date: { fontSize: 11, color: colors.faint, marginLeft: 'auto' },
  pet: { fontSize: 15, fontWeight: 'bold', color: colors.ink },
  notes: { fontSize: 13, color: colors.body, marginTop: 2 },
  takeBtn: { marginTop: 10 },
});
