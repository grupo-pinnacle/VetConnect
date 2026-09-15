import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../src/lib/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      Alert.alert('Éxito', 'Sesión iniciada correctamente');
    } catch (err: any) {
      Alert.alert('Error de Autenticación', err.message || 'Credenciales inválidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        VetConnect Mobile
      </Text>

      <Text style={{ marginBottom: 5 }}>Correo Electrónico</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#CCC',
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
        }}
        placeholder="ejemplo@vetconnect.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={{ marginBottom: 5 }}>Contraseña</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#CCC',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
        placeholder="********"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={{
          backgroundColor: '#0284C7',
          borderRadius: 8,
          padding: 15,
          alignItems: 'center',
        }}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
