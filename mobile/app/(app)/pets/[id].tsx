import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchPet, updatePet, removePet } from '../../../src/services/pets.service';
import { Pet } from '../../../src/types';
import { PetUpdateInput } from '../../../src/validation/pet';
import { LoadingView, ErrorBox, EmptyView } from '../../../src/components/ScreenState';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { Field } from '../../../src/components/Field';
import { colors } from '../../../src/theme/tokens';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<PetUpdateInput>({});

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await fetchPet(id);
      setPet(data);
      setForm({
        name: data.name,
        species: data.species,
        breed: data.breed,
        weightKg: data.weightKg,
        sex: data.sex,
        microchip: data.microchip,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando mascota');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k: keyof PetUpdateInput, v: string) => {
    setForm((p) => ({ ...p, [k]: k === 'weightKg' ? (v.trim() === '' ? null : Number(v)) : v || null }));
    setError(null);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePet(id, form);
      setPet(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Eliminar mascota',
      `¿Dar de baja a ${pet?.name}? Podrás consultar su historial pero no crear nuevas consultas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await removePet(id);
              router.back();
            } catch (err) {
              setDeleting(false);
              setError(err instanceof Error ? err.message : 'Error eliminando mascota');
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingView testID="petdetail-loading" />;
  if (error && !pet) {
    return (
      <View style={styles.center}>
        <ErrorBox message={error} onRetry={() => { setLoading(true); load(); }} testID="petdetail-error" />
      </View>
    );
  }
  if (!pet) return <EmptyView message="Mascota no disponible" testID="petdetail-empty" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} testID="petdetail-screen">
      <Text style={styles.title}>{pet.name}</Text>
      {!!error && <ErrorBox message={error} testID="petdetail-error" />}

      {!editing ? (
        <View style={styles.card} testID="petdetail-info">
          <InfoRow label="Especie" value={pet.species} />
          <InfoRow label="Raza" value={pet.breed} />
          <InfoRow label="Peso" value={pet.weightKg != null ? `${pet.weightKg} kg` : '—'} />
          <InfoRow label="Sexo" value={pet.sex || '—'} />
          <InfoRow label="Microchip" value={pet.microchip || '—'} />
          <InfoRow label="Alergias" value={pet.allergies || '—'} />
          <InfoRow label="Crónicas" value={pet.chronicConditions || '—'} />
        </View>
      ) : (
        <View testID="petdetail-form">
          <Field label="Nombre *" value={form.name || ''} onChangeText={(t) => set('name', t)} testID="petdetail-name" />
          <Field label="Especie *" value={form.species || ''} onChangeText={(t) => set('species', t)} testID="petdetail-species" />
          <Field label="Raza *" value={form.breed || ''} onChangeText={(t) => set('breed', t)} testID="petdetail-breed" />
          <Field label="Peso (kg)" value={form.weightKg != null ? String(form.weightKg) : ''} onChangeText={(t) => set('weightKg', t)} keyboardType="decimal-pad" testID="petdetail-weight" />
          <Field label="Sexo" value={(form.sex as string) || ''} onChangeText={(t) => set('sex', t)} testID="petdetail-sex" />
          <Field label="Microchip (15 dígitos)" value={(form.microchip as string) || ''} onChangeText={(t) => set('microchip', t)} keyboardType="number-pad" testID="petdetail-microchip" />
          <Field label="Alergias" value={(form.allergies as string) || ''} onChangeText={(t) => set('allergies', t)} testID="petdetail-allergies" />
          <Field label="Condiciones crónicas" value={(form.chronicConditions as string) || ''} onChangeText={(t) => set('chronicConditions', t)} testID="petdetail-chronic" />
        </View>
      )}

      <View style={styles.actions}>
        {!editing ? (
          <>
            <PrimaryButton title="Editar" onPress={() => setEditing(true)} testID="petdetail-edit" />
            <PrimaryButton title={deleting ? 'Eliminando…' : 'Eliminar'} variant="danger" onPress={handleDelete} loading={deleting} testID="petdetail-delete" />
          </>
        ) : (
          <>
            <PrimaryButton title="Guardar cambios" onPress={handleSave} loading={saving} testID="petdetail-save" />
            <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setEditing(false)} testID="petdetail-cancel-edit" />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.ink, marginBottom: 16, marginTop: 20 },
  card: { backgroundColor: colors.canvas, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 13, color: colors.muted, flex: 1 },
  value: { fontSize: 14, fontWeight: '600', color: colors.ink, flex: 1, textAlign: 'right' },
  actions: { gap: 10, marginTop: 16, marginBottom: 32 },
});
