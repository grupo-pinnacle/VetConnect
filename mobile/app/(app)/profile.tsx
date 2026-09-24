import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/lib/authStore';
import { useProfile } from '../../src/hooks/useProfile';
import { LoadingView, ErrorBox } from '../../src/components/ScreenState';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Field } from '../../src/components/Field';
import { colors } from '../../src/theme/tokens';

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Tutor',
  VET: 'Veterinario',
  ADMIN: 'Administrador',
};

export default function ProfileScreen() {
  const { user, saving, error, save, setOnline } = useProfile();
  const logout = useAuthStore((s) => s.logout);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  if (!user) return <LoadingView testID="profile-loading" />;

  const startEdit = () => {
    setBio(user.bio || '');
    setPhotoUrl(user.photoUrl || '');
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await save({
        bio: (bio || '').trim() ? (bio || '').trim() : null,
        photoUrl: (photoUrl || '').trim() ? (photoUrl || '').trim() : null,
      });
      setEditing(false);
    } catch {
      // error visible vía ErrorBox
    }
  };

  const handleToggle = async (value: boolean) => {
    setToggling(true);
    try {
      await setOnline(value);
    } catch {
      // error visible vía ErrorBox
    } finally {
      setToggling(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} testID="profile-screen">
      <View style={styles.avatar} testID="profile-avatar">
        <Text style={styles.avatarText}>
          {(user.firstName?.[0] || '?').toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>
        {user.firstName} {user.lastName}
      </Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role} testID="profile-role">
        {ROLE_LABELS[user.role] || user.role}
        {user.role === 'VET' && user.vetStatus ? ` · ${user.vetStatus}` : ''}
      </Text>

      {!!error && <ErrorBox message={error} testID="profile-error" />}

      <View style={styles.card} testID="profile-info">
        {user.role === 'VET' && !!user.licenseNumber && (
          <View style={styles.row}>
            <Text style={styles.label}>Matrícula</Text>
            <Text style={styles.value}>{user.licenseNumber}</Text>
          </View>
        )}
        {user.role === 'VET' && user.ratingCount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Calificación</Text>
            <Text style={styles.value} testID="profile-rating">
              ★ {user.ratingAvg.toFixed(1)} ({user.ratingCount})
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Teléfono</Text>
          <Text style={styles.value}>{user.phone || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Presentación</Text>
          <Text style={styles.value}>{user.bio || '—'}</Text>
        </View>
      </View>

      {user.role === 'VET' && (
        <View style={styles.onlineCard} testID="profile-online-card">
          <Text style={styles.label}>Disponible para triage</Text>
          <Switch
            value={!!user.isOnline}
            onValueChange={handleToggle}
            disabled={toggling}
            testID="profile-online-switch"
          />
        </View>
      )}

      {editing ? (
        <View testID="profile-form">
          <Field
            label="Presentación (máx. 500)"
            value={bio || ''}
            onChangeText={setBio}
            multiline
            testID="profile-bio"
          />
          <Field
            label="Foto (URL https)"
            value={photoUrl || ''}
            onChangeText={setPhotoUrl}
            autoCapitalize="none"
            keyboardType="url"
            testID="profile-photo"
          />
          <PrimaryButton title="Guardar" onPress={handleSave} loading={saving} testID="profile-save" />
          <PrimaryButton title="Cancelar" variant="secondary" onPress={() => setEditing(false)} testID="profile-cancel" />
        </View>
      ) : (
        <PrimaryButton title="Editar perfil" onPress={startEdit} testID="profile-edit" />
      )}

      <View style={styles.logout}>
        <PrimaryButton title="Cerrar sesión" variant="danger" onPress={logout} testID="profile-logout" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
  },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: colors.ink, textAlign: 'center', marginTop: 12 },
  email: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  role: { fontSize: 13, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: colors.canvas, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 13, color: colors.muted, flex: 1 },
  value: { fontSize: 14, fontWeight: '600', color: colors.ink, flex: 1, textAlign: 'right' },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  logout: { marginTop: 16, marginBottom: 32 },
});
