import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Carga de manifest.json con credenciales en Dev Tunnels (web/index.html)', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../index.html');
  const manifestJsonPath = path.resolve(__dirname, '../../public/manifest.json');
  const indexHtmlCode = fs.readFileSync(indexHtmlPath, 'utf-8');

  it('debe incluir crossorigin="use-credentials" en el <link rel="manifest"> para evitar redirect 302 y bloqueo CORS en Dev Tunnels', () => {
    const manifestLinkMatch = indexHtmlCode.match(/<link[^>]*rel=["']manifest["'][^>]*>/i);
    expect(manifestLinkMatch).not.toBeNull();

    const linkTag = manifestLinkMatch![0];
    expect(linkTag).toMatch(/href=["']\/manifest\.json["']/i);
    expect(linkTag).toMatch(/crossorigin=["']use-credentials["']/i);
  });

  it('debe mantener intacto y parseable el archivo web/public/manifest.json', () => {
    expect(fs.existsSync(manifestJsonPath)).toBe(true);
    const rawManifest = fs.readFileSync(manifestJsonPath, 'utf-8');
    expect(() => JSON.parse(rawManifest)).not.toThrow();
  });
});
