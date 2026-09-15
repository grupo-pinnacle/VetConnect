import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useAuthStore } from '../src/lib/authStore';

export default function RootLayout() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <Slot />;
}
