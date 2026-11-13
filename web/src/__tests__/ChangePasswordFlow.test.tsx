import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthExperience from '../pages/AuthExperience';
import api from '../services/api';

const mockNavigate = vi.fn();
const mockAuthState = {
  user: {
    id: 'user-1',
    email: 'tobias@gmail.com',
    firstName: 'Tobias',
    lastName: 'Vera',
    role: 'CLIENT' as 'CLIENT' | 'VET' | 'ADMIN',
  },
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  clearSession: vi.fn(),
  sessionTerminated: null,
  dismissSessionTerminated: vi.fn(),
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
      patch: vi.fn(),
    },
    setAccessToken: vi.fn(),
  };
});

describe('Authenticated Password Change & /forgot-password Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.user.role = 'CLIENT';
    mockAuthState.user.email = 'tobias@gmail.com';
    window.history.pushState({}, '', '/forgot-password');
  });

  it('keeps authenticated CLIENT user on /forgot-password without bouncing to /client/dashboard', () => {
    render(
      <MemoryRouter>
        <AuthExperience />
      </MemoryRouter>
    );

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText(/Recuperá tu acceso/i)).toBeDefined();
    const emailInput = screen.getByLabelText(/^Email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe('tobias@gmail.com');
  });

  it('keeps authenticated VET user on /forgot-password without bouncing to /vet/dashboard', () => {
    mockAuthState.user.role = 'VET';
    mockAuthState.user.email = 'vet@huellicam.com';

    render(
      <MemoryRouter>
        <AuthExperience />
      </MemoryRouter>
    );

    expect(mockNavigate).not.toHaveBeenCalled();
    const emailInput = screen.getByLabelText(/^Email$/i) as HTMLInputElement;
    expect(emailInput.value).toBe('vet@huellicam.com');
  });

  it('submits ChangePasswordModal to PATCH /api/users/password cleanly', async () => {
    const { ChangePasswordModal } = await import('../components/common/ChangePasswordModal');
    const onClose = vi.fn();
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'fresh-token-123' } },
    } as any);

    render(
      <MemoryRouter>
        <ChangePasswordModal open={true} onClose={onClose} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Contraseña actual$/i), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText(/^Nueva contraseña$/i), { target: { value: 'NewPass456!' } });
    fireEvent.change(screen.getByLabelText(/^Confirmar nueva contraseña$/i), { target: { value: 'NewPass456!' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar contraseña/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/api/users/password', {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
      });
    });
  });
});
