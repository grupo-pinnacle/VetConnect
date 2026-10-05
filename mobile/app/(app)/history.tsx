import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useConsultations } from '../../src/hooks/useConsultations';
import { cancelConsultation } from '../../src/services/consultations.service';
import { parseTriagePriority } from '../../src/lib/triage';
import { LoadingView, ErrorBox, EmptyView } from '../../src/components/ScreenState';
import { StatusBadge, TriageBadge } from '../../src/components/StatusBadge';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Field } from '../../src/components/Field';
import { Ionicons } from '@expo/vector-icons';
import { Consultation, ConsultationStatus } from '../../src/types';
import { colors, radius } from '../../src/theme/tokens';

const FILTERS: Array<'ALL' | ConsultationStatus> = ['ALL', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  ALL: 'Todas',
  WAITING: 'En espera',
  ACTIVE: 'Activas',
  COMPLETED: 'Cerradas',
  CANCELLED: 'Canceladas',
};

function HistoryCard({
  item,
  onOpen,
  onCancelled,
}: {
  item: Consultation;
  onOpen: () => void;
  onCancelled: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const priority = parseTriagePriority(item.notes);
  const cancellable = item.status === 'WAITING' || item.status === 'ACTIVE';

  const doCancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancelConsultation(item.id, reason.trim() || undefined);
      onCancelled();
      setConfirming(false);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card} testID={`history-card-${item.id}`}>
      <TouchableOpacity onPress={onOpen}>
        <View style={styles.cardHeader}>
          <StatusBadge status={item.status} />
          {!!priority && <TriageBadge priority={priority} />}
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.pet}>{item.pet?.name || 'Mascota'}</Text>
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      </TouchableOpacity>

      {!!error && <ErrorBox message={error} testID={`history-cancel-error-${item.id}`} />}

      {cancellable && !confirming && (
        <TouchableOpacity
          style={styles.cancelLinkRow}
          onPress={() => setConfirming(true)}
          testID={`history-cancel-${item.id}`}
        >
          <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
          <Text style={styles.cancelLink}>Cancelar consulta</Text>
        </TouchableOpacity>
      )}
      {cancellable && confirming && (
        <View testID={`history-cancel-form-${item.id}`}>
          <Field
            label="Motivo (opcional)"
            value={reason}
            onChangeText={setReason}
            placeholder="Ej. Duplicada, ya se resolvió…"
            testID={`history-cancel-reason-${item.id}`}
          />
          <View style={styles.confirmRow}>
            <View style={styles.confirmBtn}>
              <PrimaryButton
                title="Confirmar"
                variant="danger"
                onPress={doCancel}
                loading={busy}
                testID={`history-cancel-confirm-${item.id}`}
              />
            </View>
            <View style={styles.confirmBtn}>
              <PrimaryButton
                title="Volver"
                variant="secondary"
                onPress={() => setConfirming(false)}
                testID={`history-cancel-back-${item.id}`}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { consultations, loading, refreshing, error, refresh, setRefreshing } = useConsultations();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');

  const visible = (filter === 'ALL' ? consultations : consultations.filter((c) => c.status === filter)).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  // Tras cancelar se refresca la lista desde el servidor
  const handleCancelled = () => {
    refresh();
  };

  if (loading) return <LoadingView testID="history-loading" />;

  return (
    <View style={styles.container} testID="history-screen">
      <Text style={styles.title}>Historial de consultas</Text>
      {!!error && <ErrorBox message={error} onRetry={refresh} testID="history-error" />}

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
            testID={`history-filter-${f}`}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {FILTER_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} />
        }
        ListEmptyComponent={<EmptyView message="Sin consultas en este estado" testID="history-empty" />}
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            onOpen={() => router.push(`/consultation/${item.id}`)}
            onCancelled={handleCancelled}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 16, marginTop: 40 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  chipTextActive: { color: '#FFF' },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: radius.lg, marginBottom: 12, borderWidth: 1, borderColor: colors.line },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  date: { fontSize: 12, color: colors.faint, marginLeft: 'auto' },
  pet: { fontSize: 17, fontWeight: '800', color: colors.ink },
  notes: { fontSize: 14, color: colors.body, marginTop: 4 },
  cancelLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  cancelLink: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  confirmRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  confirmBtn: { flex: 1 },
});
