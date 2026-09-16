import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
            speciality: 'Dermatología',
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

    fireEvent.click(screen.getByTestId('approve-vet-button-vet-pending-1'));

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

    fireEvent.click(screen.getByTestId('reject-vet-button-vet-pending-2'));

    expect(api.patch).toHaveBeenCalledWith('/api/admin/vets/vet-pending-2/reject', {
      reason: 'Matrícula caducada en SENASA',
    });
  });
});
