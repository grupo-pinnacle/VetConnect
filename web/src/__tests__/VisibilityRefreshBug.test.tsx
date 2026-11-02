import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import api, * as apiModule from '../services/api';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
      post: vi.fn(),
    },
    getAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
  };
});

describe('Bugfix: Silent Refresh on VisibilityChange for Unauthenticated Users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  it('NO debe disparar GET /auth/me en visibilitychange si el usuario no está autenticado ni tiene accessToken', async () => {
    vi.mocked(apiModule.getAccessToken).mockReturnValue(null);
    vi.mocked(api.get).mockRejectedValueOnce({ response: { status: 401 } });

    render(
      <AuthProvider>
        <div>Anon Landing</div>
      </AuthProvider>
    );

    // Esperar que termine el chequeo inicial de montaje (si aplica) y limpiar historial
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
    vi.mocked(api.get).mockClear();

    // Simular cambio de pestaña / foco de ventana en usuario anónimo
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(api.get).not.toHaveBeenCalled();
  });

  it('SÍ debe disparar GET /auth/me silencioso en visibilitychange cuando existe sesión activa o accessToken', async () => {
    vi.mocked(apiModule.getAccessToken).mockReturnValue('valid-jwt-token');
    vi.mocked(api.get).mockResolvedValue({
      data: { data: { user: { id: 'u1', email: 'vet@test.com', role: 'VET' } } },
    });

    render(
      <AuthProvider>
        <div>Authenticated App</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
    vi.mocked(api.get).mockClear();

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
