import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { completeConsultation } from '../services/consultations.service';
import { ErrorBox } from './ScreenState';
import { PrimaryButton } from './PrimaryButton';
import { Field } from './Field';

export interface VetConsultationActionsViewProps {
  consultationId: string;
  closing: boolean;
  diagnosis: string;
  busy: boolean;
  error: string | null;
  onOpenPrescribe: () => void;
  onOpenClose: () => void;
  onCancelClose: () => void;
  onChangeDiagnosis: (text: string) => void;
  onConfirmClose: () => void;
}

export function VetConsultationActionsView({
  closing,
  diagnosis,
  busy,
  error,
  onOpenPrescribe,
  onOpenClose,
  onCancelClose,
  onChangeDiagnosis,
  onConfirmClose,
}: VetConsultationActionsViewProps) {
  return (
    <View style={styles.wrap} testID="vet-actions">
      {!!error && <ErrorBox message={error} testID="vet-actions-error" />}

      {!closing ? (
        <>
          <PrimaryButton
            title="Emitir receta"
            variant="secondary"
            onPress={onOpenPrescribe}
            testID="vet-actions-prescribe"
          />
          <PrimaryButton
            title="Cerrar con diagnóstico"
            onPress={onOpenClose}
            testID="vet-actions-close-open"
          />
        </>
      ) : (
        <>
          <Field
            label="Evolución / Diagnóstico *"
            value={diagnosis}
            onChangeText={onChangeDiagnosis}
            placeholder="Hallazgos, diagnóstico y plan…"
            multiline
            testID="vet-actions-diagnosis"
          />
          <PrimaryButton
            title="Confirmar cierre"
            onPress={onConfirmClose}
            loading={busy}
            testID="vet-actions-close-confirm"
          />
          <PrimaryButton
            title="Volver"
            variant="secondary"
            onPress={onCancelClose}
            testID="vet-actions-close-back"
          />
        </>
      )}
    </View>
  );
}

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
    <VetConsultationActionsView
      consultationId={consultationId}
      closing={closing}
      diagnosis={diagnosis}
      busy={busy}
      error={error}
      onOpenPrescribe={() => router.push(`/consultation/${consultationId}/prescribe`)}
      onOpenClose={() => setClosing(true)}
      onCancelClose={() => setClosing(false)}
      onChangeDiagnosis={setDiagnosis}
      onConfirmClose={doClose}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 16 },
});
