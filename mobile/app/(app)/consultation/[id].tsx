import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchConsultation } from '../../../src/services/consultations.service';
import { parseTriagePriority } from '../../../src/lib/triage';
import { useAuthStore } from '../../../src/lib/authStore';
import { VetConsultationActions } from '../../../src/components/VetConsultationActions';
import { StatusBadge, TriageBadge } from '../../../src/components/StatusBadge';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { Consultation } from '../../../src/types';
import { triageColors, colors, radius } from '../../../src/theme/tokens';

/** Detalle de consulta — destino de push no-CALL y de Home (corrige ruta faltante). */
export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setConsultation(await fetchConsultation(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar consulta');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center} testID="consdetail-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !consultation) {
    return (
      <View style={styles.center} testID="consdetail-error">
        <Text style={styles.errorText}>{error || 'Consulta no disponible'}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setLoading(true); load(); }} testID="consdetail-retry">
          <Text style={styles.btnText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} testID="consdetail-back">
          <Text style={styles.link}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priority = parseTriagePriority(consultation.notes);
  const isActive = consultation.status === 'ACTIVE';
  const isWaiting = consultation.status === 'WAITING';
  const isDone = consultation.status === 'COMPLETED';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      testID="consdetail-screen"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={styles.statusRow}>
        <View style={styles.statusLeft}>
          <StatusBadge status={consultation.status} testID="consdetail-status" />
          {priority && (
            <TriageBadge priority={priority} testID="consdetail-priority" />
          )}
        </View>
        <Text style={styles.date}>{new Date(consultation.createdAt).toLocaleDateString()}</Text>
      </View>

      {isWaiting && (
        <View style={styles.infoBox} testID="consdetail-waiting">
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>En cola de triage. Si no hay veterinarios en 15 min la consulta se cancela automáticamente.</Text>
        </View>
      )}

      <Text style={styles.label}>Motivo</Text>
      <Text style={styles.value}>{consultation.notes || '—'}</Text>

      {consultation.diagnosisNotes && (
        <>
          <Text style={styles.label}>Evolución / Diagnóstico</Text>
          <Text style={styles.value}>{consultation.diagnosisNotes}</Text>
        </>
      )}

      <Text style={styles.label}>Mascota</Text>
      <Text style={styles.value}>{consultation.pet?.name || consultation.petId}</Text>

      <Text style={styles.label}>Veterinario</Text>
      <Text style={styles.value}>
        {consultation.vet ? `${consultation.vet.firstName || ''} ${consultation.vet.lastName || ''}`.trim() : 'Aún no asignado'}
      </Text>

      {consultation.prescriptions && consultation.prescriptions.length > 0 && (
        <View style={styles.section} testID="consdetail-prescriptions">
          <Text style={styles.sectionTitle}>Recetas Médicas ({consultation.prescriptions.length})</Text>
          {consultation.prescriptions.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.prescriptionCard}
              onPress={() => router.push(`/prescriptions/${p.id}`)}
              testID={`consdetail-prescription-${p.id}`}
            >
              <View style={styles.prescriptionHeader}>
                <Text style={styles.prescriptionMedication}>{p.medication}</Text>
                <Text style={styles.prescriptionDuration}>{p.durationDays} días</Text>
              </View>
              <Text style={styles.prescriptionDose}>{p.dosage} • {p.frequency}</Text>
              {p.indications ? <Text style={styles.prescriptionIndications}>{p.indications}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {consultation.review && (
        <View style={styles.reviewCard} testID="consdetail-review">
          <Text style={styles.sectionTitle}>Calificación del Tutor</Text>
          <View style={styles.reviewStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= consultation.review!.rating ? 'star' : 'star-outline'}
                size={18}
                color={s <= consultation.review!.rating ? colors.amber : colors.faint}
              />
            ))}
            <Text style={styles.reviewScore}>{consultation.review.rating} / 5</Text>
          </View>
          {consultation.review.comment ? (
            <Text style={styles.reviewComment}>"{consultation.review.comment}"</Text>
          ) : (
            <Text style={styles.reviewCommentMuted}>Sin comentario adicional</Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {(isActive || isWaiting) && (
          <>
            <PrimaryButton
              title="Abrir Chat"
              icon="chatbubble-ellipses"
              onPress={() => router.push(`/chat/${consultation.id}`)}
              testID="consdetail-go-chat"
            />
            <PrimaryButton
              title="Videollamada"
              icon="videocam"
              variant="secondary"
              onPress={() => router.push(`/call/${consultation.id}`)}
              testID="consdetail-go-call"
            />
          </>
        )}
        {isDone && !consultation.review && user?.role === 'CLIENT' && (
          <PrimaryButton
            title="Calificar atención (1-5)"
            icon="star"
            onPress={() => router.push(`/review/${consultation.id}`)}
            testID="consdetail-go-review"
          />
        )}
        {user?.role === 'VET' && isActive && consultation.vetId === user.id && (
          <VetConsultationActions
            consultationId={consultation.id}
            onClosed={() => { setLoading(true); load(); }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.canvas },
  errorText: { color: colors.danger, marginBottom: 16, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 20 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 12, color: colors.faint },
  status: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  badge: { color: '#FFF', fontWeight: 'bold', fontSize: 12, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, overflow: 'hidden' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.unreadBg, borderWidth: 1, borderColor: colors.unreadLine, borderRadius: radius.md, padding: 12, marginBottom: 16 },
  infoText: { color: colors.body, fontSize: 13, flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14 },
  value: { fontSize: 15, fontWeight: '600', color: colors.ink, marginTop: 4 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  prescriptionCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  prescriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prescriptionMedication: { fontSize: 16, fontWeight: '800', color: colors.ink },
  prescriptionDuration: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  prescriptionDose: { fontSize: 13, color: colors.body, marginTop: 4 },
  prescriptionIndications: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 4 },
  reviewCard: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 16,
  },
  reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  reviewScore: { fontSize: 14, fontWeight: 'bold', color: colors.ink, marginLeft: 6 },
  reviewComment: { fontSize: 13, color: colors.body, fontStyle: 'italic' },
  reviewCommentMuted: { fontSize: 12, color: colors.muted },
  actions: { gap: 12, marginTop: 24, marginBottom: 32 },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { backgroundColor: colors.primaryDark, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  link: { color: colors.primary, marginTop: 12, fontWeight: '600' },
});
