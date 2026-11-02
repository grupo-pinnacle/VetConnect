import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Landing Header Responsive Collision (920px-1023px) & 404 Route', () => {
  const landingPath = path.resolve(__dirname, '../pages/Landing.tsx');
  const appPath = path.resolve(__dirname, '../App.tsx');
  const landingCode = fs.readFileSync(landingPath, 'utf-8');
  const appCode = fs.readFileSync(appPath, 'utf-8');

  it('Bug A: Landing.tsx debe cubrir el rango 920px-1023px con @media (max-width: 1023px) o 1024px para el header/menú móvil evitando superposición', () => {
    // Verifica que exista cobertura responsive en el umbral de 1023px/1024px para el header/nav
    expect(landingCode).toMatch(/@media\s*\(\s*max-width:\s*102[34]px\s*\)/);
  });

  it('Bug B: App.tsx debe renderizar una vista 404 ("Página no encontrada") en path="*" en lugar de redirigir silenciosamente a "/"', () => {
    // No debe redirigir path="*" directamente a "/" con Navigate
    expect(appCode).not.toMatch(/path=["']\*["']\s+element=\{\s*<Navigate\s+to=["']\/["']/);
    expect(appCode).toMatch(/404/);
    expect(appCode).toMatch(/P[áa]gina no encontrada/i);
  });
});
