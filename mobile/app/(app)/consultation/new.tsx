import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../src/lib/api';
import { ApiResponse, Pet, Consultation } from '../../../src/types';

export default function NewConsultationScreen() {
  const router = useRouter();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get<ApiResponse<Pet[]>>('/api/pets');
        if (res.data.success && res.data.data) {
          setPets(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedPetId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.warn('Error fetching pets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPetId || !notes.trim()) {
      Alert.alert('Error', 'Por favor seleccione una mascota e ingrese el motivo de consulta');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<ApiResponse<Consultation>>('/api/consultations', {
        petId: selectedPetId,
        notes: notes.trim(),
      });

      if (res.data.success && res.data.data) {
        const consId = res.data.data.id;
        Alert.alert('Consulta Solicitada', 'Ingresado a cola de triage telemático', [
          { text: 'Ir a Sala', onPress: () => router.push(`/call/${consId}`) },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Error al solicitar consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Solicitar Teleconsulta Médica</Text>

      <Text style={styles.label}>Seleccionar Mascota *</Text>
      <View style={styles.petList}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[styles.petBtn, selectedPetId === pet.id && styles.petBtnActive]}
            onPress={() => setSelectedPetId(pet.id)}
          >
            <Text style={[styles.petBtnText, selectedPetId === pet.id && styles.petBtnTextActive]}>
              {pet.name} ({pet.species})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Motivo de Consulta / Síntomas *</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describa el estado de salud o consulta de su mascota..."
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Solicitar Triage</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 20, marginTop: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  petList: { gap: 8, marginBottom: 16 },
  petBtn: { padding: 12, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8 },
  petBtnActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  petBtnText: { color: '#334155', fontWeight: 'bold' },
  petBtnTextActive: { color: '#FFF' },
  textArea: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  submitBtn: { backgroundColor: '#0284C7', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
