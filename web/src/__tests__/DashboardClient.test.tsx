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

  it('should submit pet registration form and post to /api/pets', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);
    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: { id: 'p1', name: 'Max', species: 'CANINE', breed: 'Labrador' },
      },
    } as any);

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('add-pet-button')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('add-pet-button'));

    fireEvent.change(screen.getByTestId('input-pet-name'), { target: { value: 'Max' } });
    fireEvent.change(screen.getByTestId('input-pet-breed'), { target: { value: 'Labrador' } });

    fireEvent.click(screen.getByTestId('save-pet-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/pets',
        expect.objectContaining({
          name: 'Max',
          breed: 'Labrador',
        })
      );
    });
  });
});
