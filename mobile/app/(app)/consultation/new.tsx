import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { getApiErrorMessage } from '../../../src/lib/api';
import { ApiResponse, Pet, Consultation, TriagePriority } from '../../../src/types';
import { TRIAGE_PRIORITIES, TRIAGE_LABELS, buildTriageNotes } from '../../../src/lib/triage';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { triageColors, colors } from '../../../src/theme/tokens';

export default function NewConsultationScreen() {
  const router = useRouter();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [priority, setPriority] = useState<TriagePriority>('VERDE');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get<ApiResponse<Pet[]>>('/api/pets');
        if (res.data.success && res.data.data) {
          setPets(res.data.data);
          if (res.data.data.length > 0) setSelectedPetId(res.data.data[0].id);
        }
      } catch (err) {
        setLoadError(getApiErrorMessage(err, 'Error cargando mascotas'));
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPetId || !notes.trim()) {
      setLoadError('Por favor seleccione una mascota e ingrese el motivo de consulta');
      return;
    }
    setLoadError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post<ApiResponse<Consultation>>('/api/consultations', {
        petId: selectedPetId,
        notes: buildTriageNotes(priority, notes),
      });

      if (res.data.success && res.data.data) {
        const created = res.data.data;
        // Deuda D-B01: puede nacer ACTIVE directo si hay vet online
        if (created.status === 'ACTIVE') {
          router.push(`/chat/${created.id}`);
        } else {
          router.push(`/consultation/${created.id}`);
        }
      }
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Error al solicitar consulta'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center} testID="triage-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} testID="triage-screen">
      <Text style={styles.title}>Solicitar Teleconsulta Médica</Text>

      {loadError && (
        <View style={styles.errorBox} testID="triage-error">
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      )}

      <Text style={styles.label}>Seleccionar Mascota *</Text>
      {pets.length === 0 ? (
        <Text style={styles.empty}>No tienes mascotas. Registre una primero.</Text>
      ) : (
        <View style={styles.petList}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petBtn, selectedPetId === pet.id && styles.petBtnActive]}
              onPress={() => setSelectedPetId(pet.id)}
              testID={`triage-pet-${pet.id}`}
            >
              <Text style={[styles.petBtnText, selectedPetId === pet.id && styles.petBtnTextActive]}>
                {pet.name} ({pet.species})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Prioridad (Triage) *</Text>
      <View style={styles.priorityRow}>
        {TRIAGE_PRIORITIES.map((p) => {
          const active = priority === p;
          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityBtn,
                active && { backgroundColor: triageColors[p], borderColor: triageColors[p] },
              ]}
              onPress={() => setPriority(p)}
              testID={`triage-priority-${p}`}
            >
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={active ? '#FFF' : triageColors[p]}
              />
              <Text style={[styles.priorityText, active && styles.priorityTextActive]}>
                {TRIAGE_LABELS[p]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Motivo de Consulta / Síntomas *</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describa el estado de salud o consulta de su mascota..."
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
        testID="triage-notes"
      />

      <PrimaryButton
        title="Solicitar Triage"
        icon="medkit"
        onPress={handleSubmit}
        loading={isSubmitting}
        testID="triage-submit"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.ink, marginBottom: 20, marginTop: 20 },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 14 },
  empty: { color: colors.faint, fontSize: 14, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.body, marginBottom: 8 },
  petList: { gap: 8, marginBottom: 16 },
  petBtn: { padding: 12, borderWidth: 1, borderColor: colors.lineDark, borderRadius: 8 },
  petBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  petBtnText: { color: colors.body, fontWeight: 'bold' },
  petBtnTextActive: { color: '#FFF' },
  priorityRow: { gap: 8, marginBottom: 16 },
  priorityBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.card },
  priorityText: { color: colors.body, fontWeight: '700', fontSize: 14, flex: 1 },
  priorityTextActive: { color: '#FFF' },
  textArea: { borderWidth: 1, borderColor: colors.lineDark, borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', marginBottom: 20, backgroundColor: colors.card },
});
