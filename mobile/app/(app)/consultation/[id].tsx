import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchConsultation } from '../../../src/services/consultations.service';
import { parseTriagePriority } from '../../../src/lib/triage';
import { useAuthStore } from '../../../src/lib/authStore';
import { VetConsultationActions } from '../../../src/components/VetConsultationActions';
import { Consultation } from '../../../src/types';
import { triageColors, colors } from '../../../src/theme/tokens';

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
        <Text style={styles.status} testID="consdetail-status">{consultation.status}</Text>
        {priority && (
          <Text style={[styles.badge, { backgroundColor: triageColors[priority] }]} testID="consdetail-priority">
            {priority}
          </Text>
        )}
      </View>

      {isWaiting && (
        <View style={styles.infoBox} testID="consdetail-waiting">
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
              <Text
                key={s}
                style={[
                  styles.starText,
                  s <= consultation.review!.rating ? styles.starFilled : styles.starEmpty,
                ]}
              >
                ★
              </Text>
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
            <TouchableOpacity style={styles.btn} onPress={() => router.push(`/chat/${consultation.id}`)} testID="consdetail-go-chat">
              <Text style={styles.btnText}>Abrir Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push(`/call/${consultation.id}`)} testID="consdetail-go-call">
              <Text style={styles.btnText}>Videollamada</Text>
            </TouchableOpacity>
          </>
        )}
        {isDone && !consultation.review && user?.role === 'CLIENT' && (
          <TouchableOpacity style={styles.btn} onPress={() => router.push(`/review/${consultation.id}`)} testID="consdetail-go-review">
            <Text style={styles.btnText}>Calificar atención (1-5)</Text>
          </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFF' },
  errorText: { color: colors.danger, marginBottom: 16, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 20 },
  status: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  badge: { color: '#FFF', fontWeight: 'bold', fontSize: 12, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, overflow: 'hidden' },
  infoBox: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 16 },
  infoText: { color: colors.body, fontSize: 13 },
  label: { fontSize: 13, fontWeight: 'bold', color: colors.muted, marginTop: 12 },
  value: { fontSize: 15, color: colors.ink, marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.ink, marginBottom: 10 },
  prescriptionCard: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  prescriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prescriptionMedication: { fontSize: 15, fontWeight: 'bold', color: colors.ink },
  prescriptionDuration: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  prescriptionDose: { fontSize: 13, color: colors.body, marginTop: 4 },
  prescriptionIndications: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginTop: 4 },
  reviewCard: {
    marginTop: 20,
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: 8,
    padding: 14,
  },
  reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  starText: { fontSize: 18 },
  starFilled: { color: colors.amber },
  starEmpty: { color: colors.faint },
  reviewScore: { fontSize: 14, fontWeight: 'bold', color: colors.ink, marginLeft: 6 },
  reviewComment: { fontSize: 13, color: colors.body, fontStyle: 'italic' },
  reviewCommentMuted: { fontSize: 12, color: colors.muted },
  actions: { gap: 10, marginTop: 24, marginBottom: 20 },
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecondary: { backgroundColor: colors.primaryDark, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  link: { color: colors.primary, marginTop: 12, fontWeight: '600' },
});
