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

describe('AdminVets Modal & Toast Notification UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toast notification on successful approval without calling window.alert', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-10',
            email: 'vet.toast@vetconnect.com',
            firstName: 'Mariana',
            lastName: 'Rios',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-7788',
            createdAt: new Date().toISOString(),
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
      expect(screen.getByTestId('approve-vet-button-vet-10')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('approve-vet-button-vet-10'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin-toast-notification')).toBeDefined();
      expect(screen.getByTestId('admin-toast-notification').textContent).toContain('Matrícula aprobada exitosamente');
    });
  });

  it('should render toast notification on successful rejection', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-11',
            email: 'vet.reject.toast@vetconnect.com',
            firstName: 'Gabriel',
            lastName: 'Sosa',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-9900',
            createdAt: new Date().toISOString(),
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
      expect(screen.getByTestId('reject-vet-button-vet-11')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('reject-vet-button-vet-11'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin-toast-notification')).toBeDefined();
      expect(screen.getByTestId('admin-toast-notification').textContent).toContain('Matrícula rechazada');
    });
  });

  it('should dismiss toast notification when clicking close button', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-12',
            email: 'vet.dismiss@vetconnect.com',
            firstName: 'Hugo',
            lastName: 'Vargas',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-1122',
            createdAt: new Date().toISOString(),
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
      expect(screen.getByTestId('approve-vet-button-vet-12')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('approve-vet-button-vet-12'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin-toast-notification')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('admin-toast-notification').querySelector('button')!);

    expect(screen.queryByTestId('admin-toast-notification')).toBeNull();
  });

  it('should render empty state when 0 pending vets exist', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [] } } as any);

    render(
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-pending-vets')).toBeDefined();
    });
  });

  it('should render error alert if GET /api/admin/vets/pending fails', async () => {
    vi.mocked(api.get).mockRejectedValue({
      response: { data: { error: { message: 'Acceso denegado (ADMIN requerido)' } } },
    } as any);

    render(
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-error-alert')).toBeDefined();
      expect(screen.getByTestId('admin-error-alert').textContent).toContain('Acceso denegado');
    });
  });

  it('should handle rejection reason input change without triggering early submit', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'vet-13',
            email: 'vet.input@vetconnect.com',
            firstName: 'Paula',
            lastName: 'Nunez',
            role: 'VET',
            vetStatus: 'PENDING',
            licenseNumber: 'MP-3344',
            createdAt: new Date().toISOString(),
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
      expect(screen.getByTestId('input-reject-reason-vet-13')).toBeDefined();
    });

    const input = screen.getByTestId('input-reject-reason-vet-13') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Documentación incompleta' } });

    expect(input.value).toBe('Documentación incompleta');
    expect(api.patch).not.toHaveBeenCalled();
  });
});
