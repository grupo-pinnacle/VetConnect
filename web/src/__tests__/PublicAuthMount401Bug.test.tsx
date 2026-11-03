import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
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

function AuthStatusProbe() {
  const { loading, user } = useAuth();
  return <div data-testid="auth-state">{loading ? 'loading' : user ? 'auth' : 'anon'}</div>;
}

describe('Bugfix: Prevención de ráfaga 401 en rutas públicas de autenticación al montar AuthProvider', () => {
  const originalPathname = window.location.pathname;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.history.pushState({}, '', originalPathname);
  });

  it.each([
    '/login',
    '/register',
    '/register/tutor',
    '/register/veterinarian',
    '/forgot-password',
  ])('NO debe disparar GET /api/auth/me al montar en %s cuando no existe accessToken', async (publicPath) => {
    window.history.pushState({}, '', publicPath);
    vi.mocked(apiModule.getAccessToken).mockReturnValue(null);

    const { getByTestId } = render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('auth-state').textContent).toBe('anon');
    });

    expect(api.get).not.toHaveBeenCalled();
  });

  it('SÍ debe disparar GET /api/auth/me al montar fuera de rutas de login/register (compatibilidad con VisibilityRefreshBug)', async () => {
    window.history.pushState({}, '', '/');
    vi.mocked(apiModule.getAccessToken).mockReturnValue(null);
    vi.mocked(api.get).mockRejectedValueOnce({ response: { status: 401 } });

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
