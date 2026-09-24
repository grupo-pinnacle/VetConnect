import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createPrescription } from '../../../../src/services/prescriptions.service';
import { ErrorBox } from '../../../../src/components/ScreenState';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { Field } from '../../../../src/components/Field';
import { Prescription } from '../../../../src/types';
import { colors } from '../../../../src/theme/tokens';

export default function PrescribeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [indications, setIndications] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Prescription | null>(null);

  const submit = async () => {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const rx = await createPrescription(id, {
        medication: medication.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        durationDays: Number(duration),
        indications: indications.trim(),
      });
      setCreated(rx);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error emitiendo receta');
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} testID="prescribe-done">
        <Text style={styles.title}>Receta emitida ✅</Text>
        <Text style={styles.sub}>
          {created.medication} — {created.dosage} ({created.frequency}), {created.durationDays} días.
        </Text>
        <PrimaryButton
          title="Ver receta digital"
          onPress={() => router.replace(`/prescriptions/${created.id}`)}
          testID="prescribe-view"
        />
        <PrimaryButton
          title="Volver a la consulta"
          variant="secondary"
          onPress={() => router.back()}
          testID="prescribe-back"
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} testID="prescribe-screen">
      <Text style={styles.title}>Emitir receta digital</Text>
      {!!error && <ErrorBox message={error} testID="prescribe-error" />}

      <Field label="Medicamento *" value={medication} onChangeText={setMedication} placeholder="Ej. Amoxicilina 250mg" testID="prescribe-medication" />
      <Field label="Dosis *" value={dosage} onChangeText={setDosage} placeholder="Ej. 1 comprimido" testID="prescribe-dosage" />
      <Field label="Frecuencia *" value={frequency} onChangeText={setFrequency} placeholder="Ej. Cada 12 horas" testID="prescribe-frequency" />
      <Field label="Duración (días) *" value={duration} onChangeText={setDuration} placeholder="Ej. 7" keyboardType="number-pad" testID="prescribe-duration" />
      <Field label="Indicaciones *" value={indications} onChangeText={setIndications} placeholder="Ej. Administrar con alimento…" multiline testID="prescribe-indications" />

      <PrimaryButton title="Firmar y emitir" onPress={submit} loading={busy} testID="prescribe-submit" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.ink, marginBottom: 8, marginTop: 40 },
  sub: { fontSize: 14, color: colors.body, marginBottom: 20 },
});
