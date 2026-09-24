import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';
import { getApiErrorMessage } from '../../src/lib/api';
import { colors } from '../../src/theme/tokens';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT' as 'CLIENT' | 'VET',
    licenseNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k: keyof typeof formData, v: string) => {
    setFormData((p) => ({ ...p, [k]: v }));
    setError(null);
  };

  const handleRegister = async () => {
    if (!formData.email.trim() || !formData.password || !formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        licenseNumber: formData.licenseNumber.trim() || undefined,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al registrar usuario'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.container} testID="register-screen">
      <Text style={styles.title}>Crear Cuenta en VetConnect</Text>

      {error && (
        <View style={styles.errorBox} testID="register-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Nombre *</Text>
      <TextInput style={styles.input} placeholder="Juan" value={formData.firstName} onChangeText={(t) => set('firstName', t)} testID="register-firstName" />

      <Text style={styles.label}>Apellido *</Text>
      <TextInput style={styles.input} placeholder="Perez" value={formData.lastName} onChangeText={(t) => set('lastName', t)} testID="register-lastName" />

      <Text style={styles.label}>Correo Electrónico *</Text>
      <TextInput
        style={styles.input}
        placeholder="ejemplo@vetconnect.com"
        value={formData.email}
        onChangeText={(t) => set('email', t)}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="register-email"
      />

      <Text style={styles.label}>Contraseña *</Text>
      <TextInput
        style={styles.input}
        placeholder="******** (Mínimo 8 caracteres)"
        value={formData.password}
        onChangeText={(t) => set('password', t)}
        secureTextEntry
        testID="register-password"
      />

      <Text style={styles.label}>Teléfono (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="+54 ..."
        value={formData.phone}
        onChangeText={(t) => set('phone', t)}
        keyboardType="phone-pad"
        testID="register-phone"
      />

      <Text style={styles.label}>Soy *</Text>
      <View style={styles.row}>
        {(['CLIENT', 'VET'] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.pick, formData.role === r && styles.pickActive]}
            onPress={() => set('role', r)}
            testID={`register-role-${r}`}
          >
            <Text style={[styles.pickText, formData.role === r && styles.pickTextActive]}>
              {r === 'CLIENT' ? 'Tutor' : 'Veterinario'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.role === 'VET' && (
        <>
          <Text style={styles.label}>Matrícula profesional *</Text>
          <TextInput
            style={styles.input}
            placeholder="MP-1234"
            value={formData.licenseNumber}
            onChangeText={(t) => set('licenseNumber', t)}
            testID="register-license"
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.btn, isSubmitting && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={isSubmitting}
        testID="register-submit"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.btnText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity testID="register-go-login">
          <Text style={styles.link}>¿Ya tiene cuenta? Iniciar sesión</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 40, color: colors.ink },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 14, textAlign: 'center' },
  label: { marginBottom: 5, color: colors.body },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 15 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pick: { flex: 1, padding: 12, borderWidth: 1, borderColor: colors.lineDark, borderRadius: 8, alignItems: 'center' },
  pickActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickText: { color: colors.body, fontWeight: 'bold' },
  pickTextActive: { color: '#FFF' },
  btn: { backgroundColor: colors.primary, borderRadius: 8, padding: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 16, marginBottom: 32, fontWeight: '600' },
});
