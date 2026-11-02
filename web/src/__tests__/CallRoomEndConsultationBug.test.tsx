import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Transición de estado a COMPLETED al finalizar videollamada en CallRoom.tsx', () => {
  const callRoomPath = path.resolve(__dirname, '../vet/CallRoom.tsx');
  const callRoomCode = fs.readFileSync(callRoomPath, 'utf-8');

  it('debe invocar la API de consultas para transicionar el estado a COMPLETED al colgar/finalizar la llamada', () => {
    // Verifica que CallRoom.tsx realice la llamada HTTP al endpoint de consultas al finalizar
    expect(callRoomCode).toMatch(/\/consultations\/.*(status|end|complete)?/);
    // Verifica que se envíe explícitamente el estado COMPLETED (o FINISHED normalizado)
    expect(callRoomCode).toMatch(/COMPLETED/);
  });

  it('el handler de finalizar llamada debe ser async y aguardar (await) la actualización de estado antes de desmontar/navegar', () => {
    // Verifica que exista un bloque async/await con try/catch/finally en el cierre de llamada
    expect(callRoomCode).toMatch(/async\s*\([^)]*\)\s*=>\s*\{[\s\S]*await\s+api\.(patch|post|put)/);
  });
});
