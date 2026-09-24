import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../src/lib/api';
import { ApiResponse, Pet } from '../../../src/types';

export default function NewPetScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Canine');
  const [breed, setBreed] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !breed) {
      Alert.alert('Error', 'Por favor ingrese el nombre y la raza de la mascota');
      return;
    }

    if (microchip.trim() && !/^\d{15}$/.test(microchip.trim())) {
      Alert.alert('Error', 'El microchip debe poseer exactamente 15 dígitos numéricos ISO');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<ApiResponse<Pet>>('/api/pets', {
        name: name.trim(),
        species,
        breed: breed.trim(),
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        microchip: microchip.trim() ? microchip.trim() : undefined,
      });

      if (res.data.success) {
        Alert.alert('Éxito', 'Mascota registrada correctamente', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Error al registrar mascota');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} testID="newpet-screen">
      <Text style={styles.title}>Registrar Nueva Mascota</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput style={styles.input} placeholder="Ej. Firulais" value={name} onChangeText={setName} />

      <Text style={styles.label}>Especie *</Text>
      <View style={styles.speciesRow}>
        <TouchableOpacity
          style={[styles.speciesBtn, species === 'Canine' && styles.speciesBtnActive]}
          onPress={() => setSpecies('Canine')}
        >
          <Text style={[styles.speciesText, species === 'Canine' && styles.speciesTextActive]}>Canino</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.speciesBtn, species === 'Feline' && styles.speciesBtnActive]}
          onPress={() => setSpecies('Feline')}
        >
          <Text style={[styles.speciesText, species === 'Feline' && styles.speciesTextActive]}>Felino</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Raza *</Text>
      <TextInput style={styles.input} placeholder="Ej. Labrador" value={breed} onChangeText={setBreed} />

      <Text style={styles.label}>Peso en Kg (Opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 12.5"
        keyboardType="numeric"
        value={weightKg}
        onChangeText={setWeightKg}
      />

      <Text style={styles.label}>Microchip ISO (15 dígitos, Opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="123456789012345"
        keyboardType="numeric"
        maxLength={15}
        value={microchip}
        onChangeText={setMicrochip}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting} testID="newpet-submit">
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Guardar Mascota</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 20, marginTop: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, marginBottom: 16 },
  speciesRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  speciesBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, alignItems: 'center' },
  speciesBtnActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  speciesText: { color: '#334155', fontWeight: 'bold' },
  speciesTextActive: { color: '#FFF' },
  submitBtn: { backgroundColor: '#0284C7', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
