import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Asignación WAITING -> ACTIVE al atender videollamada (GlobalCallListener & CallRoom)', () => {
  const listenerPath = path.resolve(__dirname, '../components/call/GlobalCallListener.tsx');
  const callRoomPath = path.resolve(__dirname, '../vet/CallRoom.tsx');
  const listenerCode = fs.readFileSync(listenerPath, 'utf-8');
  const callRoomCode = fs.readFileSync(callRoomPath, 'utf-8');

  it('GlobalCallListener.tsx debe invocar PATCH /api/consultations/:id/assign en handleAccept antes de navegar', () => {
    expect(listenerCode).toMatch(/const\s+handleAccept\s*=\s*async\s*\(\s*\)\s*=>/);
    expect(listenerCode).toMatch(/api\.patch\([^)]*\/api\/consultations\/\$\{cid\}\/assign/);
  });

  it('CallRoom.tsx debe auto-asignar defensivamente la consulta si ingresa un VET y el estado sigue en WAITING', () => {
    expect(callRoomCode).toMatch(/\/api\/consultations\/\$\{id\}\/assign/);
    expect(callRoomCode).toMatch(/status\s*===\s*["']WAITING["']/);
  });
});
