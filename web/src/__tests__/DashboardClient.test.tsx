import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardClient } from '../pages/DashboardClient';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  it('should render pet cards with details and allow submitting a triage consultation', async () => {
    const mockPets = [
      {
        id: 'pet-123',
        name: 'Luna',
        species: 'Canine',
        breed: 'Border Collie',
        weightKg: 18.5,
        microchip: '981098123456789',
      },
    ];
    const mockConsultations = [
      {
        id: 'cons-456',
        clientId: 'u1',
        petId: 'pet-123',
        status: 'ACTIVE',
        notes: '[Prioridad: VERDE] Control de vacunas anual',
        pet: { name: 'Luna' },
      },
    ];

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/pets') {
        return Promise.resolve({ data: { success: true, data: mockPets } } as any);
      }
      if (url === '/api/consultations/mine') {
        return Promise.resolve({ data: { success: true, data: mockConsultations } } as any);
      }
      return Promise.reject(new Error('Not found'));
    });

    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: { id: 'new-cons-789', petId: 'pet-123', status: 'WAITING' },
      },
    } as any);

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pet-card-pet-123')).toBeDefined();
      expect(screen.getByTestId('pet-name-pet-123').textContent).toBe('Luna');
      expect(screen.getByTestId('pet-microchip-pet-123')).toBeDefined();
      expect(screen.getByTestId('consultation-card-cons-456')).toBeDefined();
      expect(screen.getByTestId('join-call-button-cons-456')).toBeDefined();
    });

    // Test joining active call
    fireEvent.click(screen.getByTestId('join-call-button-cons-456'));
    expect(mockNavigate).toHaveBeenCalledWith('/call/cons-456');

    // Test Triage Form submission
    fireEvent.change(screen.getByTestId('select-pet-dropdown'), { target: { value: 'pet-123' } });
    fireEvent.change(screen.getByTestId('select-triage-priority'), { target: { value: 'ROJO' } });
    fireEvent.change(screen.getByTestId('input-consultation-notes'), {
      target: { value: 'Tiene dificultad para respirar' },
    });

    fireEvent.click(screen.getByTestId('submit-triage-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/consultations', {
        petId: 'pet-123',
        notes: '[Prioridad: ROJO] Tiene dificultad para respirar',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/call/new-cons-789');
    });
  });
});
