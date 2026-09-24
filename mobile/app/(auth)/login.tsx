import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';
import { getApiErrorMessage } from '../../src/lib/api';
import { colors } from '../../src/theme/tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Credenciales inválidas'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>VetConnect Mobile</Text>

      {error && (
        <View style={styles.errorBox} testID="login-error">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="ejemplo@vetconnect.com"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(null); }}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="login-email"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(null); }}
        secureTextEntry
        testID="login-password"
      />

      <TouchableOpacity
        style={[styles.btn, isSubmitting && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={isSubmitting}
        testID="login-submit"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.btnText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity testID="login-go-register">
          <Text style={styles.link}>¿Sin cuenta? Crear cuenta</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.ink },
  errorBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 14, textAlign: 'center' },
  label: { marginBottom: 5, color: colors.body },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 15 },
  btn: { backgroundColor: colors.primary, borderRadius: 8, padding: 15, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  link: { color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
