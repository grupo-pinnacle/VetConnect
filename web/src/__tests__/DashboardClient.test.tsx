import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardClient } from '../pages/DashboardClient';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', firstName: 'Lucia', lastName: 'Perez', role: 'CLIENT' },
    logout: vi.fn(),
  }),
}));

describe('DashboardClient Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header and empty states when 0 pets and 0 consultations', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/pets') {
        return Promise.resolve({ data: { success: true, data: [] } } as any);
      }
      if (url === '/api/consultations/mine') {
        return Promise.resolve({ data: { success: true, data: [] } } as any);
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('header-title')).toBeDefined();
      expect(screen.getByTestId('empty-pets-state')).toBeDefined();
      expect(screen.getByTestId('empty-consultations-state')).toBeDefined();
    });
  });

  it('should open Add Pet modal when clicking "+ Nueva Mascota" button', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('add-pet-button')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('add-pet-button'));

    expect(screen.getByTestId('add-pet-modal')).toBeDefined();
    expect(screen.getByTestId('input-pet-name')).toBeDefined();
  });
});
