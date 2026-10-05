import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { postReview } from '../../../src/services/consultations.service';
import { getApiErrorMessage } from '../../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { colors, radius } from '../../../src/theme/tokens';

export default function ReviewScreen() {
  const { consultationId } = useLocalSearchParams<{ consultationId: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!consultationId) return;
    setError(null);
    setSubmitting(true);
    try {
      await postReview(consultationId, rating, comment.trim() || undefined);
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al calificar'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={styles.center} testID="review-done">
        <Text style={styles.title}>¡Gracias por calificar!</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(app)')} testID="review-done-back">
          <Text style={styles.btnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="review-screen">
      <Text style={styles.title}>Calificar atención</Text>

      {error && (
        <View style={styles.errorBox} testID="review-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Estrellas (1 a 5) *</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.star, s <= rating && styles.starActive]}
            onPress={() => setRating(s)}
            testID={`review-star-${s}`}
          >
            <Ionicons
              name={s <= rating ? 'star' : 'star-outline'}
              size={22}
              color={s <= rating ? '#FFF' : colors.faint}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Comentario (opcional)</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={3}
        maxLength={1000}
        value={comment}
        onChangeText={setComment}
        placeholder="Cuéntenos cómo fue la atención..."
        testID="review-comment"
      />

      <PrimaryButton
        title="Enviar calificación"
        icon="star"
        onPress={submit}
        loading={submitting}
        testID="review-submit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.canvas },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 20, marginTop: 40, textAlign: 'center' },
  errorBox: { backgroundColor: colors.dangerTint, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: colors.body, marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  star: { flex: 1, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.card },
  starActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  textArea: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, height: 90, textAlignVertical: 'top', marginBottom: 24, backgroundColor: colors.card },
  btn: { backgroundColor: colors.primary, padding: 15, borderRadius: radius.md, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
