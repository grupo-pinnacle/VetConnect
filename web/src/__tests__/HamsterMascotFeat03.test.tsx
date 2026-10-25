import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HamsterMascot from '../components/ui/HamsterMascot';
import ConsultationRoom from '../pages/ConsultationRoom';
import ClientApp from '../pages/ClientApp';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes('/consultations/cons-123')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              id: 'cons-123',
              status: 'WAITING',
              clientId: 'u1',
              pet: { id: 'p1', name: 'Milo', species: 'Canino' },
              vet: null,
            },
          },
        });
      }
      return Promise.resolve({
        data: {
          success: true,
          data: [],
        },
      });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    patch: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
  getAccessToken: vi.fn(() => 'mock-token'),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', firstName: 'Lara', lastName: 'Bouso', role: 'CLIENT', email: 'lara@vetconnect.com.ar' },
    refreshSession: vi.fn(),
    logout: vi.fn(() => Promise.resolve()),
  }),
}));

describe('FEAT-03: Animated Hamster Mascot (HamsterMascot.tsx)', () => {
  it('renders HamsterMascot with correct vector markup and size variants', () => {
    const { rerender } = render(<HamsterMascot size="sm" />);
    const mascot = screen.getByTestId('hamster-mascot');
    const svg = screen.getByTestId('hamster-mascot-svg');

    expect(mascot).toBeDefined();
    expect(svg.getAttribute('viewBox')).toBe('0 0 140 130');
    expect(svg.getAttribute('class')).toContain('w-14');

    // Rerender with size="xs"
    rerender(<HamsterMascot size="xs" />);
    expect(screen.getByTestId('hamster-mascot-svg').getAttribute('class')).toContain('w-10');

    // Rerender with size="lg"
    rerender(<HamsterMascot size="lg" />);
    expect(screen.getByTestId('hamster-mascot-svg').getAttribute('class')).toContain('w-28');
  });

  it('renders "¡No miro!" bubble when isCoveringEyes is true', () => {
    const { rerender } = render(<HamsterMascot isCoveringEyes={false} />);
    expect(screen.getByText('¡No miro!').parentElement?.parentElement?.className).toContain('opacity-0');

    rerender(<HamsterMascot isCoveringEyes={true} />);
    expect(screen.getByText('¡No miro!').parentElement?.parentElement?.className).toContain('opacity-100');
  });

  it('renders HamsterMascot in ConsultationRoom during the WAITING phase', async () => {
    render(
      <MemoryRouter initialEntries={['/call/cons-123']}>
        <Routes>
          <Route path="/call/:id" element={<ConsultationRoom />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sala de Espera Virtual')).toBeDefined();
    });

    const waitingHamster = screen.getByTestId('waiting-room-hamster');
    expect(waitingHamster).toBeDefined();
    expect(waitingHamster.querySelector('[data-testid="hamster-mascot"]')).toBeDefined();
  });

  it('renders HamsterMascot in the ClientApp attention banner', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ClientApp />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-hamster-mascot')).toBeDefined();
    });

    const mascotContainer = screen.getByTestId('dashboard-hamster-mascot');
    expect(mascotContainer.querySelector('svg')).toBeDefined();
  });
});
