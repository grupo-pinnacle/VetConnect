import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let consultationData: Record<string, unknown> = {};
const postMock = vi.fn().mockResolvedValue({ data: { success: false } });

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(async (url: string) =>
      /\/api\/consultations\/c1$/.test(url)
        ? { data: { success: true, data: consultationData } }
        : { data: { success: true, data: [] } }
    ),
    post: (...args: unknown[]) => postMock(...args),
    patch: vi.fn().mockResolvedValue({ data: { success: true } }),
    defaults: { baseURL: '' },
  },
  getAccessToken: () => 'tok',
  getDeviceId: () => 'dev',
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', role: 'CLIENT', firstName: 'Tobias', lastName: 'Vera' } }),
}));
vi.mock('socket.io-client', () => ({
  io: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() }),
}));
vi.mock('@livekit/components-react', () => ({
  LiveKitRoom: () => null,
  VideoConference: () => null,
  useLocalParticipant: () => ({ localParticipant: null }),
}));
vi.mock('@livekit/components-styles', () => ({}));
vi.mock('../components/ui/ReviewModal', () => ({ ReviewModal: () => null }));
vi.mock('../vet/Consultations', () => ({
  EvolutionEditor: () => null,
  FichaClinica: () => null,
}));

import CallRoom from '../vet/CallRoom';

const base = {
  id: 'c1',
  petId: 'p1',
  pet: { id: 'p1', name: 'Rocko', species: 'Perro' },
  client: { firstName: 'Tobias', lastName: 'Vera' },
  notes: '[Prioridad: ROJO] Dificultad para respirar / Asfixia',
};

function renderRoom() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <CallRoom id="c1" />
    </QueryClientProvider>
  );
}

describe('CallRoom WAITING vs ACTIVE gate (FEAT-07 / BUG-08)', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    postMock.mockClear();
    window.history.pushState({}, '', '/call/c1?from=client');
  });

  it('WAITING renders the waiting room, no call controls and no token request', async () => {
    consultationData = { ...base, status: 'WAITING', vetId: null, vet: null };
    renderRoom();
    expect(await screen.findByTestId('waiting-room-experience')).toBeTruthy();
    expect(screen.queryByLabelText('Silenciar micrófono')).toBeNull();
    expect(screen.queryByText('Conexión estable')).toBeNull();
    expect(screen.getByText('Cancelar solicitud de consulta')).toBeTruthy();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('ACTIVE renders the split layout (no flex override) and a clean subtitle', async () => {
    consultationData = {
      ...base,
      status: 'ACTIVE',
      vetId: 'v1',
      vet: { firstName: 'Ana', lastName: 'Gomez' },
    };
    const { container } = renderRoom();
    expect(await screen.findByText('Dificultad para respirar / Asfixia')).toBeTruthy();
    expect(screen.getByText('Conexión estable')).toBeTruthy();
    const root = container.querySelector('.v-call') as HTMLElement;
    expect(root.className).not.toMatch(/\bflex\b/);
    expect(container.textContent).not.toContain('[Prioridad');
    expect(screen.queryByTestId('waiting-room-experience')).toBeNull();
  });
});
