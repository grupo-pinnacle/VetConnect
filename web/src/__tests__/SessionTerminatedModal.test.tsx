import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionTerminatedModal } from '../components/common/SessionTerminatedModal';

const mockDismiss = vi.fn();
let mockSessionTerminated: { reason: string; message: string } | null = null;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    sessionTerminated: mockSessionTerminated,
    dismissSessionTerminated: mockDismiss,
  }),
}));

describe('SessionTerminatedModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionTerminated = null;
  });

  it('should not render anything when sessionTerminated is null', () => {
    const { container } = render(
      <MemoryRouter>
        <SessionTerminatedModal />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render dialog with informative alert when sessionTerminated is set', () => {
    mockSessionTerminated = {
      reason: 'CONCURRENT_LOGIN',
      message: 'Se ha iniciado sesión desde otro dispositivo.',
    };

    render(
      <MemoryRouter>
        <SessionTerminatedModal />
      </MemoryRouter>
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Sesión cerrada en este dispositivo')).toBeDefined();
    expect(screen.getByText('Se ha iniciado sesión desde otro dispositivo.')).toBeDefined();
    expect(screen.getByText('Volver a iniciar sesión')).toBeDefined();
  });

  it('should call dismissSessionTerminated when user clicks the login button', () => {
    mockSessionTerminated = {
      reason: 'CONCURRENT_LOGIN',
      message: 'Tu sesión fue revocada.',
    };

    render(
      <MemoryRouter>
        <SessionTerminatedModal />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /volver a iniciar sesión/i });
    fireEvent.click(button);

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });
});
