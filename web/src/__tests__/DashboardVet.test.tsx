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
    user: {
      id: 'v1',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      role: 'VET',
      vetStatus: 'APPROVED',
      licenseNumber: 'MP-8921',
      isOnline: true,
      ratingAvg: 0,
      ratingCount: 0,
    },
    logout: vi.fn(),
    refreshSession: vi.fn(),
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

  it('should render waiting FIFO queue and assign patient on clicking "Atender Paciente"', async () => {
    const mockWaitingConsultation = {
      id: 'c1',
      clientId: 'u1',
      petId: 'p1',
      status: 'WAITING',
      notes: 'AMARILLO — Fiebre leve',
      createdAt: new Date().toISOString(),
      pet: { name: 'Firulais', species: 'CANINE' },
    };

    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: [mockWaitingConsultation] },
    } as any);

    vi.mocked(api.patch).mockResolvedValue({
      data: { success: true, data: { ...mockWaitingConsultation, status: 'ACTIVE', vetId: 'v1' } },
    } as any);

    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('waiting-card-c1')).toBeDefined();
      expect(screen.getByTestId('assign-patient-button-c1')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('assign-patient-button-c1'));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/api/consultations/c1/assign');
    });
  });

  it('should open prescription modal and submit prescription form to create digital prescription with QR', async () => {
    const mockAssignedConsultation = {
      id: 'c2',
      clientId: 'u1',
      vetId: 'v1',
      petId: 'p1',
      status: 'ACTIVE',
      notes: 'Consulta activa',
      createdAt: new Date().toISOString(),
      pet: { name: 'Max', breed: 'Labrador' },
    };

    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: [mockAssignedConsultation] },
    } as any);

    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'rx1',
          medication: 'Amoxicilina 250mg',
          dosage: '1 comprimido',
          frequency: 'Cada 12 hs',
          durationDays: 7,
          indications: 'Junto con alimento',
          qrCodeDataUrl: 'data:image/png;base64,fakeqr',
        },
      },
    } as any);

    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('emit-prescription-button-c2')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('emit-prescription-button-c2'));

    expect(screen.getByTestId('prescription-modal')).toBeDefined();

    fireEvent.change(screen.getByTestId('input-prescription-medication'), { target: { value: 'Amoxicilina 250mg' } });
    fireEvent.change(screen.getByTestId('input-prescription-dosage'), { target: { value: '1 comprimido' } });
    fireEvent.change(screen.getByTestId('input-prescription-frequency'), { target: { value: 'Cada 12 hs' } });
    fireEvent.change(screen.getByTestId('input-prescription-duration'), { target: { value: '7' } });
    fireEvent.change(screen.getByTestId('input-prescription-indications'), { target: { value: 'Junto con alimento' } });

    fireEvent.click(screen.getByTestId('save-prescription-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/consultations/c2/prescriptions', {
        medication: 'Amoxicilina 250mg',
        dosage: '1 comprimido',
        frequency: 'Cada 12 hs',
        durationDays: 7,
        indications: 'Junto con alimento',
      });
      expect(screen.getByTestId('prescription-qr-image')).toBeDefined();
    });
  });

  it('should display "—" and "Sin valoraciones aún" when vet has 0 reviews', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);

    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>
    );

    await waitFor(() => {
      const scoreElement = screen.getByTestId('vet-rating-score');
      expect(scoreElement.textContent).toBe('—');
      expect(screen.getByText('Sin valoraciones aún • 0 consultas calificadas')).toBeDefined();
      expect(screen.getByText('Nuevo')).toBeDefined();
    });
  });

  it('should render tutor review with rating and comment on assigned consultation when reviewed', async () => {
    const mockAssignedWithReview = {
      id: 'c-reviewed',
      clientId: 'u1',
      petId: 'p1',
      vetId: 'v1',
      status: 'COMPLETED',
      notes: 'Consulta de control dermatológico',
      createdAt: new Date().toISOString(),
      pet: { name: 'Luna', species: 'CANINE', breed: 'Caniche' },
      review: {
        id: 'rev-1',
        rating: 5,
        comment: 'Excelente atención de la doctora, muy atenta y clara.',
      },
    };

    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: [mockAssignedWithReview] },
    } as any);

    render(
      <MemoryRouter>
        <DashboardVet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Valoración del tutor:')).toBeDefined();
      expect(screen.getByText('"Excelente atención de la doctora, muy atenta y clara."')).toBeDefined();
    });
  });
});
