import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardVet } from '../pages/DashboardVet';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'v1', firstName: 'Carlos', lastName: 'Mendoza', role: 'VET', vetStatus: 'APPROVED', licenseNumber: 'MP-8921', isOnline: true },
    logout: vi.fn(),
  }),
}));

describe('DashboardVet Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render vet header, license info, and waiting room', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);

    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('header-vet-title')).toBeDefined();
      expect(screen.getByTestId('vet-license-info')).toBeDefined();
      expect(screen.getByTestId('presence-toggle-switch')).toBeDefined();
    });
  });

  it('should toggle online presence switch', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);

    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('presence-toggle-switch')).toBeDefined();
    });

    const toggle = screen.getByTestId('presence-toggle-switch') as HTMLInputElement;
    expect(toggle.checked).toBe(true);

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
  });
});
