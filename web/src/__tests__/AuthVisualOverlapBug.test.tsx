import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Auth Visual Copy & Connection Card Overlap in Desktop', () => {
  const cssPath = path.resolve(__dirname, '../styles/auth.css');
  const authCss = fs.readFileSync(cssPath, 'utf-8');

  it('debe acotar el margen superior y el tamaño tipográfico de .auth-visual__copy para evitar invasión vertical', () => {
    // El margin-top original de 9vh + clamp(52px, 5.3vw, 78px) empujaba el subtítulo hacia abajo
    expect(authCss).not.toContain('margin-top: 9vh;');
    expect(authCss).toMatch(/\.auth-visual__copy\s*\{[^}]*margin-top:\s*clamp\(20px,\s*4vh,\s*48px\)/s);
    expect(authCss).toMatch(/\.auth-visual__copy\s+h1\s*\{[^}]*font-size:\s*clamp\(42px,\s*4\.4vw,\s*64px\)/s);
  });

  it('debe reubicar .auth-visual__connection y .auth-visual__photo en el cuadrante inferior dejando aire al subtítulo', () => {
    // .auth-visual__connection en bottom: 31% colisionaba con el subtítulo (<p>)
    expect(authCss).not.toMatch(/\.auth-visual__connection\s*\{[^}]*bottom:\s*31%/s);
    expect(authCss).toMatch(/\.auth-visual__connection\s*\{[^}]*bottom:\s*20%/s);
    expect(authCss).toMatch(/\.auth-visual__photo\s*\{[^}]*height:\s*45%/s);
  });

  it('debe preservar intactos los media queries de responsividad móvil (@media (max-width: 820px) y 560px)', () => {
    expect(authCss).toContain('@media (max-width: 820px)');
    expect(authCss).toContain('@media (max-width: 560px)');
  });
});
