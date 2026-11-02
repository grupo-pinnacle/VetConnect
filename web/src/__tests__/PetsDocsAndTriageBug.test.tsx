import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Subsistema Mascotas (Adjuntar Documento + Trim en Selector Triage)', () => {
  const clientAppPath = path.resolve(__dirname, '../pages/ClientApp.tsx');
  const clientAppCode = fs.readFileSync(clientAppPath, 'utf-8');

  it('Bug A: el modal de agregar documento en ClientApp.tsx debe incluir un <input type="file"> conectado al estado y persistir vía API', () => {
    // Verifica que exista un input type="file" para adjuntar el documento de la mascota
    expect(clientAppCode).toMatch(/<input[^>]*type=["']file["'][^>]*>/);
    // Verifica que el handler de subida invoque la ruta de documentos de la mascota
    expect(clientAppCode).toMatch(/\/pets\/.*\/documents/);
  });

  it('Bug B: el selector/cards de mascotas en Triage debe aplicar .trim() al nombre y no concatenar espacios iniciales', () => {
    // No debe haber interpolaciones con espacio inicial antes de pet.name en options/labels
    expect(clientAppCode).not.toMatch(/>\s+\$\{.*pet\.name.*\}\s*</);
    expect(clientAppCode).toMatch(/pet\.name\.trim\(\)/);
  });
});
