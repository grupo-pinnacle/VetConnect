import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminVets } from '../pages/AdminVets';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('AdminVets Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pending vets table', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-pending-1',
            email: 'vet.pending@vetconnect.com',
            firstName: 'Ana',
            lastName: 'Gomez',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-9942',
            bio: 'Dermatología',
            createdAt: '2026-09-15T00:00:00.000Z',
          },
        ],
      },
    } as any);

    render(
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-title')).toBeDefined();
      expect(screen.getByTestId('vet-row-vet-pending-1')).toBeDefined();
      expect(screen.getByTestId('vet-speciality-vet-pending-1')).toBeDefined();
      expect(screen.getByTestId('approve-vet-button-vet-pending-1')).toBeDefined();
    });
  });

  it('should trigger approve API call when clicking Aprobar Matrícula', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-pending-1',
            email: 'vet.pending@vetconnect.com',
            firstName: 'Ana',
            lastName: 'Gomez',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-9942',
            createdAt: '2026-09-15T00:00:00.000Z',
          },
        ],
      },
    } as any);

    vi.mocked(api.patch).mockResolvedValue({ data: { success: true } } as any);

    render(
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('approve-vet-button-vet-pending-1')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('approve-vet-button-vet-pending-1'));
    });

    expect(api.patch).toHaveBeenCalledWith('/api/admin/vets/vet-pending-1/approve');
  });

  it('should trigger reject API call with reason prompt when clicking Rechazar', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-pending-2',
            email: 'vet.reject@vetconnect.com',
            firstName: 'Roberto',
            lastName: 'Diaz',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-1100',
            createdAt: '2026-09-15T00:00:00.000Z',
          },
        ],
      },
    } as any);

    vi.mocked(api.patch).mockResolvedValue({ data: { success: true } } as any);

    render(
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('reject-vet-button-vet-pending-2')).toBeDefined();
    });

    fireEvent.change(screen.getByTestId('input-reject-reason-vet-pending-2'), {
      target: { value: 'Matrícula caducada en SENASA' },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('reject-vet-button-vet-pending-2'));
    });

    expect(api.patch).toHaveBeenCalledWith('/api/admin/vets/vet-pending-2/reject', {
      reason: 'Matrícula caducada en SENASA',
    });
  });

  it('should filter pending vets by search term', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-pending-a',
            email: 'carlos@vetconnect.com',
            firstName: 'Carlos',
            lastName: 'Tevez',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-5555',
            bio: 'Cirugía',
            createdAt: '2026-09-15T00:00:00.000Z',
          },
          {
            id: 'vet-pending-b',
            email: 'sofia@vetconnect.com',
            firstName: 'Sofia',
            lastName: 'Loren',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-7777',
            bio: 'Medicina Felina',
            createdAt: '2026-09-15T00:00:00.000Z',
          },
        ],
      },
    } as any);

    render(
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('vet-row-vet-pending-a')).toBeDefined();
      expect(screen.getByTestId('vet-row-vet-pending-b')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre profesional/i);
    fireEvent.change(searchInput, { target: { value: 'Sofia' } });

    expect(screen.queryByTestId('vet-row-vet-pending-a')).toBeNull();
    expect(screen.getByTestId('vet-row-vet-pending-b')).toBeDefined();
  });
});
