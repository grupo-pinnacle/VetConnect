import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrescriptionView } from '../pages/PrescriptionView';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('PrescriptionView Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render prescription document details and QR code', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'rx-100',
          medication: 'Amoxicilina 250mg',
          dosage: '1 comprimido',
          frequency: 'Cada 12 hs',
          durationDays: 7,
          indications: 'Con alimento',
          createdAt: new Date().toISOString(),
          qrCodeDataUrl: 'data:image/png;base64,fakeqr',
          vet: { firstName: 'Carlos', lastName: 'Mendoza', licenseNumber: 'MP-8921' },
        },
      },
    } as any);

    render(
      <MemoryRouter initialEntries={['/prescriptions/rx-100']}>
        <Routes>
          <Route path="/prescriptions/:id" element={<PrescriptionView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('prescription-header-title')).toBeDefined();
      expect(screen.getByTestId('rx-medication')).toBeDefined();
      expect(screen.getByTestId('prescription-qr-code')).toBeDefined();
      expect(screen.getByTestId('print-prescription-button')).toBeDefined();
    });
  });
});
