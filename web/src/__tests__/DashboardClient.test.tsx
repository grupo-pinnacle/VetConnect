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
    patch: vi.fn(),
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

  it('should submit pet registration form and post to /api/pets with clinical history fields', async () => {
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
    fireEvent.change(screen.getByTestId('input-pet-allergies'), { target: { value: 'Penicilina' } });
    fireEvent.change(screen.getByTestId('input-pet-chronic-conditions'), { target: { value: 'Cardiopatía leve' } });

    fireEvent.click(screen.getByTestId('save-pet-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/pets',
        expect.objectContaining({
          name: 'Max',
          breed: 'Labrador',
          allergies: 'Penicilina',
          chronicConditions: 'Cardiopatía leve',
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

    // Test Clinical Intake Form submission (ADR-028)
    fireEvent.change(screen.getByTestId('intake-pet-select'), { target: { value: 'pet-123' } });
    fireEvent.click(screen.getByTestId('symptom-chip-respiratory_distress'));
    fireEvent.change(screen.getByTestId('intake-notes-textarea'), {
      target: { value: 'Tiene dificultad para respirar' },
    });

    // Check emergency warning banner appears when selecting critical symptom
    expect(screen.getByTestId('intake-emergency-banner')).toBeDefined();

    fireEvent.click(screen.getByTestId('intake-submit-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/consultations', {
        petId: 'pet-123',
        notes: 'Tiene dificultad para respirar',
        symptoms: ['respiratory_distress'],
        duration: 'HOURS_2_TO_12',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/call/new-cons-789');
    });
  });

  it('should open Edit Pet modal with pre-populated data and submit updates via PATCH /api/pets/:id (ADR-029)', async () => {
    const mockPets = [
      {
        id: 'pet-edit-1',
        name: 'Milo',
        species: 'Feline',
        breed: 'Siamés',
        weightKg: 4.2,
        sex: 'Macho',
        microchip: '981098123456789',
        allergies: 'Polen',
        chronicConditions: 'Asma felina',
      },
    ];

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/pets') {
        return Promise.resolve({ data: { success: true, data: mockPets } } as any);
      }
      if (url === '/api/consultations/mine') {
        return Promise.resolve({ data: { success: true, data: [] } } as any);
      }
      return Promise.reject(new Error('Not found'));
    });

    vi.mocked(api.patch).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'pet-edit-1',
          name: 'Milo Updated',
          species: 'Feline',
          breed: 'Siamés',
          weightKg: 4.5,
          sex: 'Macho',
          microchip: '981098123456789',
          allergies: 'Polen, Penicilina',
          chronicConditions: 'Asma felina controlada',
        },
      },
    } as any);

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pet-card-pet-edit-1')).toBeDefined();
      expect(screen.getByTestId('pet-edit-btn-pet-edit-1')).toBeDefined();
    });

    // Verify sex, allergies and chronic badges rendered on card
    expect(screen.getByTestId('pet-sex-pet-edit-1').textContent).toBe('Macho');
    expect(screen.getByTestId('pet-allergies-pet-edit-1')).toBeDefined();
    expect(screen.getByTestId('pet-chronic-pet-edit-1')).toBeDefined();

    // Click Edit button
    fireEvent.click(screen.getByTestId('pet-edit-btn-pet-edit-1'));

    expect(screen.getByTestId('add-pet-modal')).toBeDefined();
    expect(screen.getByTestId('pet-modal-title').textContent).toBe('Editar Mascota');

    const nameInput = screen.getByTestId('input-pet-name') as HTMLInputElement;
    expect(nameInput.value).toBe('Milo');

    const allergiesInput = screen.getByTestId('input-pet-allergies') as HTMLInputElement;
    expect(allergiesInput.value).toBe('Polen');

    // Update weight and allergies
    fireEvent.change(nameInput, { target: { value: 'Milo Updated' } });
    fireEvent.change(screen.getByTestId('input-pet-weight'), { target: { value: '4.5' } });
    fireEvent.change(allergiesInput, { target: { value: 'Polen, Penicilina' } });

    fireEvent.click(screen.getByTestId('save-pet-button'));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/api/pets/pet-edit-1',
        expect.objectContaining({
          name: 'Milo Updated',
          weightKg: 4.5,
          allergies: 'Polen, Penicilina',
        })
      );
    });
  });

  it('should render clean consultation notes and friendly cancellation reason without system tags (ADR-030)', async () => {
    const mockConsultations = [
      {
        id: 'cons-cancelled-1',
        clientId: 'u1',
        petId: 'pet-123',
        status: 'CANCELLED',
        notes: '[Prioridad: ROJO] tiene vacunas [CANCELLED_TIMEOUT_NO_VET_AVAILABLE]',
        pet: { name: 'Firulais' },
      },
    ];

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/pets') {
        return Promise.resolve({ data: { success: true, data: [] } } as any);
      }
      if (url === '/api/consultations/mine') {
        return Promise.resolve({ data: { success: true, data: mockConsultations } } as any);
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('consultation-card-cons-cancelled-1')).toBeDefined();
    });

    // Notes must be clean without technical tags
    const notesElem = screen.getByTestId('consultation-notes-cons-cancelled-1');
    expect(notesElem.textContent).toBe('tiene vacunas');
    expect(notesElem.textContent).not.toContain('[Prioridad: ROJO]');
    expect(notesElem.textContent).not.toContain('CANCELLED_TIMEOUT_NO_VET_AVAILABLE');

    // Friendly cancellation reason
    expect(
      screen.getByTestId('consultation-cancel-reason-cons-cancelled-1').textContent
    ).toBe('Tiempo de espera agotado: sin veterinarios disponibles en guardia.');
  });

  it('should render accessible inline error banner inside Pet modal when POST /api/pets fails without window.alert', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { error: { message: 'El microchip ingresado ya está registrado' } } },
    });

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('add-pet-button')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('add-pet-button'));

    const nameInput = screen.getByTestId('input-pet-name');
    fireEvent.change(nameInput, { target: { value: 'Bobby' } });
    const breedInput = screen.getByTestId('input-pet-breed');
    fireEvent.change(breedInput, { target: { value: 'Labrador' } });

    fireEvent.click(screen.getByTestId('save-pet-button'));

    await waitFor(() => {
      const errorBanner = screen.getByTestId('pet-modal-error');
      expect(errorBanner).toBeDefined();
      expect(errorBanner.getAttribute('role')).toBe('alert');
      expect(errorBanner.textContent).toContain('El microchip ingresado ya está registrado');
    });
  });

  it('should render accessible inline error banner when consultation intake submission fails without window.alert', async () => {
    const mockPets = [{ id: 'p1', name: 'Milo', species: 'Canine', breed: 'Golden' }];
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/pets') return Promise.resolve({ data: { success: true, data: mockPets } } as any);
      if (url === '/api/consultations/mine') return Promise.resolve({ data: { success: true, data: [] } } as any);
      return Promise.reject(new Error('Not found'));
    });
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { error: { message: 'Capacidad de guardia al límite. Intente en minutos.' } } },
    });

    render(
      <MemoryRouter>
        <DashboardClient />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('triage-section')).toBeDefined();
    });

    // Select the pet in intake form
    const petSelect = screen.getByTestId('intake-pet-select');
    fireEvent.change(petSelect, { target: { value: 'p1' } });

    // Fill notes in triage
    const notesInput = screen.getByTestId('intake-notes-textarea');
    fireEvent.change(notesInput, { target: { value: 'Vómitos frecuentes desde anoche' } });

    // Submit triage
    fireEvent.click(screen.getByTestId('intake-submit-button'));

    await waitFor(() => {
      const errorAlert = screen.getByTestId('triage-submit-error');
      expect(errorAlert).toBeDefined();
      expect(errorAlert.getAttribute('role')).toBe('alert');
      expect(errorAlert.textContent).toContain('Capacidad de guardia al límite');
    });
  });
});
