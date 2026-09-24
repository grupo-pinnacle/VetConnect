import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/lib/authStore';

/**
 * Root index: redirección por rol (docs/mobile/02_*).
 * - Sin sesión → /(auth)/login
 * - VET no aprobado → /(auth)/login con bloqueo (la app mobile es del tutor;
 *   el vet opera en web hasta aprobación SENASA)
 * - Resto → /(app)
 */
export default function Index() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(app)" />;
}
