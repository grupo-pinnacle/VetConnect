import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/lib/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT',
    licenseNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      Alert.alert('Éxito', 'Cuenta creada exitosamente');
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error de Registro', err.message || 'Error al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 40 }}>
        Crear Cuenta en VetConnect
      </Text>

      <Text style={{ marginBottom: 5 }}>Nombre *</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 15 }}
        placeholder="Juan"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />

      <Text style={{ marginBottom: 5 }}>Apellido *</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 15 }}
        placeholder="Perez"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

      <Text style={{ marginBottom: 5 }}>Correo Electrónico *</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 15 }}
        placeholder="ejemplo@vetconnect.com"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={{ marginBottom: 5 }}>Contraseña *</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 20 }}
        placeholder="******** (Mínimo 8 caracteres)"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
      />

      <TouchableOpacity
        style={{ backgroundColor: '#0284C7', borderRadius: 8, padding: 15, alignItems: 'center' }}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Registrarse</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
