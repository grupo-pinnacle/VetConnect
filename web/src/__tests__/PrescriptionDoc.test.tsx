import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrescriptionDoc } from '../components/ui/PrescriptionDoc';

describe('PrescriptionDoc Component', () => {
  const mockPrescription = {
    id: 'rx-test-001',
    consultationId: 'cons-test-100',
    vetId: 'vet-123',
    medication: 'Amoxicilina + Clavulánico 250mg',
    dosage: '1 comprimido',
    frequency: 'Cada 12 hs',
    durationDays: 7,
    indications: 'Administrar con las comidas para proteger la mucosa gástrica.',
    createdAt: '2026-09-22T12:00:00.000Z',
    qrCodeDataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
    vet: {
      firstName: 'Sofía',
      lastName: 'Valenzuela',
      licenseNumber: 'MP-10492',
    },
  };

  const mockPet = {
    id: 'pet-123',
    ownerId: 'client-123',
    name: 'Milo',
    species: 'Canino',
    breed: 'Golden Retriever',
    weightKg: 32,
    microchip: '032-984-721-001-AR',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-09-22T00:00:00.000Z',
  };

  it('should render veterinarian name, license number, official date, and pet clinical data', () => {
    render(<PrescriptionDoc prescription={mockPrescription} pet={mockPet} />);

    // Header & Prescriber
    expect(screen.getByTestId('prescription-header-title')).toBeDefined();
    expect(screen.getByTestId('prescription-vet-name').textContent).toContain('Sofía Valenzuela');
    expect(screen.getByText(/MP-10492/)).toBeDefined();

    // Pet Clinical Data
    expect(screen.getByTestId('prescription-pet-name').textContent).toBe('Milo');
    expect(screen.getByText(/Golden Retriever/)).toBeDefined();
    expect(screen.getByText(/032-984-721-001-AR/)).toBeDefined();
  });

  it('should render Rp/ pharmacological block, QR code, and handle print button click', () => {
    const handlePrint = vi.fn();
    render(<PrescriptionDoc prescription={mockPrescription} onPrint={handlePrint} />);

    // Pharmacological block
    expect(screen.getByTestId('rx-medication').textContent).toBe('Amoxicilina + Clavulánico 250mg');
    expect(screen.getByTestId('rx-dosage-frequency').textContent).toContain('1 comprimido (Cada 12 hs)');
    expect(screen.getByTestId('rx-duration').textContent).toBe('7 días');
    expect(screen.getByTestId('rx-indications').textContent).toContain('Administrar con las comidas');

    // QR Code
    expect(screen.getByTestId('prescription-qr-code')).toBeDefined();

    // Print Action
    const printButton = screen.getByTestId('print-prescription-button');
    expect(printButton).toBeDefined();
    fireEvent.click(printButton);
    expect(handlePrint).toHaveBeenCalledTimes(1);
  });
});
