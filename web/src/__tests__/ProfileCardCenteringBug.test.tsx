import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Profile Card Vertical Centering in ClientApp ProfilePage', () => {
  const clientAppPath = path.resolve(__dirname, '../pages/ClientApp.tsx');
  const clientAppCode = fs.readFileSync(clientAppPath, 'utf-8');

  it('ProfilePage debe centrar verticalmente la tarjeta lateral izquierda (.profile-card) con justifyContent o align-items center', () => {
    const profilePageIdx = clientAppCode.indexOf('function ProfilePage');
    expect(profilePageIdx).toBeGreaterThan(-1);

    const profileSnippet = clientAppCode.slice(profilePageIdx, profilePageIdx + 4500);

    // Debe contener centrado vertical explícito para la tarjeta de perfil
    const hasCentering =
      profileSnippet.includes('justifyContent: "center"') ||
      profileSnippet.includes("justify-content: center") ||
      profileSnippet.includes('alignSelf: "center"') ||
      profileSnippet.includes('alignItems: "center"');

    expect(hasCentering).toBe(true);
  });
});
