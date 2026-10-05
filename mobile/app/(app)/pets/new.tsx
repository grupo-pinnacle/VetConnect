import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiErrorMessage } from '../../../src/lib/api';
import { createPet } from '../../../src/services/pets.service';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { colors, radius } from '../../../src/theme/tokens';

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
      await createPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        microchip: microchip.trim() ? microchip.trim() : null,
      });

      Alert.alert('Éxito', 'Mascota registrada correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert('Error', getApiErrorMessage(err, 'Error al registrar mascota'));
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
          <Ionicons name="paw" size={18} color={species === 'Canine' ? '#FFF' : colors.primary} />
          <Text style={[styles.speciesText, species === 'Canine' && styles.speciesTextActive]}>Canino</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.speciesBtn, species === 'Feline' && styles.speciesBtnActive]}
          onPress={() => setSpecies('Feline')}
        >
          <Ionicons name="paw-outline" size={18} color={species === 'Feline' ? '#FFF' : colors.primary} />
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

      <PrimaryButton
        title="Guardar Mascota"
        icon="paw"
        onPress={handleSubmit}
        loading={isSubmitting}
        testID="newpet-submit"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 20, marginTop: 20 },
  label: { fontSize: 13, fontWeight: '700', color: colors.body, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, marginBottom: 16, backgroundColor: colors.card, fontSize: 14, color: colors.ink },
  speciesRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  speciesBtn: { flex: 1, flexDirection: 'row', gap: 8, padding: 12, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  speciesBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  speciesText: { color: colors.body, fontWeight: '700', fontSize: 14 },
  speciesTextActive: { color: '#FFF' },
});
