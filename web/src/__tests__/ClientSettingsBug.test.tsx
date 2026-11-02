import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Client Settings Page (Notification persistence, Action buttons & Fast logout)', () => {
  const clientAppPath = path.resolve(__dirname, '../pages/ClientApp.tsx');
  const clientAppCode = fs.readFileSync(clientAppPath, 'utf-8');

  it('Bug-03: SettingsPage debe persistir las preferencias de notificaciones en localStorage ("vetconnect_notification_preferences")', () => {
    // Debe buscar y persistir en localStorage las preferencias de notificaciones
    expect(clientAppCode).toMatch(/localStorage\.getItem\(['"]vetconnect_notification_preferences['"]\)/);
    expect(clientAppCode).toMatch(/localStorage\.setItem\(['"]vetconnect_notification_preferences['"]/);
  });

  it('Bug-02: Los botones de "Cambiar contraseña" y "Privacidad" en SettingsPage no deben ser botones muertos; deben tener onClick/navegación', () => {
    // Extrae la sección completa de SettingsPage de ClientApp
    const settingsIndex = clientAppCode.indexOf('function SettingsPage');
    expect(settingsIndex).toBeGreaterThan(-1);
    const endIndex = clientAppCode.indexOf('function SkeletonPage', settingsIndex);
    const settingsSnippet = clientAppCode.slice(settingsIndex, endIndex > -1 ? endIndex : settingsIndex + 5000);

    // Debe contener handlers de clic para cambiar contraseña y privacidad
    expect(settingsSnippet).toMatch(/Cambiar contrase[ñn]a[\s\S]{0,250}onClick|onClick[\s\S]{0,250}Cambiar contrase[ñn]a/);
    expect(settingsSnippet).toMatch(/Privacidad[\s\S]{0,250}onClick|onClick[\s\S]{0,250}Privacidad/);
  });

  it('Bug-01: El botón de cerrar sesión en SettingsPage debe tener protección de timeout o loading state para evitar congelamiento de ~5 segundos', () => {
    const settingsIndex = clientAppCode.indexOf('function SettingsPage');
    const endIndex = clientAppCode.indexOf('function SkeletonPage', settingsIndex);
    const settingsSnippet = clientAppCode.slice(settingsIndex, endIndex > -1 ? endIndex : settingsIndex + 5000);

    // Debe manejar estado de carga/deshabilitación o límite de espera al cerrar sesión
    const hasLoadingOrRace = settingsSnippet.includes('Promise.race') || settingsSnippet.includes('loggingOut') || settingsSnippet.includes('isLoggingOut');
    expect(hasLoadingOrRace).toBe(true);
  });
});
