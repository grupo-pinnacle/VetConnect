import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { completeConsultation } from '../services/consultations.service';
import { ErrorBox } from './ScreenState';
import { PrimaryButton } from './PrimaryButton';
import { Field } from './Field';

/**
 * Acciones del veterinario asignado sobre una consulta ACTIVE.
 * Cohesión: cierre con diagnóstico + emisión de receta en un solo bloque.
 */
export function VetConsultationActions({
  consultationId,
  onClosed,
}: {
  consultationId: string;
  onClosed: () => void;
}) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doClose = async () => {
    setBusy(true);
    setError(null);
    try {
      await completeConsultation(consultationId, diagnosis.trim());
      setClosing(false);
      setDiagnosis('');
      onClosed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar la consulta');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap} testID="vet-actions">
      {!!error && <ErrorBox message={error} testID="vet-actions-error" />}

      {!closing ? (
        <>
          <PrimaryButton
            title="Emitir receta"
            variant="secondary"
            onPress={() => router.push(`/consultation/${consultationId}/prescribe`)}
            testID="vet-actions-prescribe"
          />
          <PrimaryButton
            title="Cerrar con diagnóstico"
            onPress={() => setClosing(true)}
            testID="vet-actions-close-open"
          />
        </>
      ) : (
        <>
          <Field
            label="Evolución / Diagnóstico *"
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="Hallazgos, diagnóstico y plan…"
            multiline
            testID="vet-actions-diagnosis"
          />
          <PrimaryButton
            title="Confirmar cierre"
            onPress={doClose}
            loading={busy}
            testID="vet-actions-close-confirm"
          />
          <PrimaryButton
            title="Volver"
            variant="secondary"
            onPress={() => setClosing(false)}
            testID="vet-actions-close-back"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 16 },
});
