import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AdminExecutiveMetrics } from '../components/admin/AdminExecutiveMetrics';
import { AdminFeatureFlagsModal } from '../components/admin/AdminFeatureFlagsModal';

describe('FEATURE-ADMIN-OPS-01: UI Executive Metrics & Kill Switches Modal', () => {
  it('AdminExecutiveMetrics debe mostrar GMV, Comisión Neta, No-Shows y Conversión de Triage', () => {
    render(
      <AdminExecutiveMetrics
        metrics={{
          gmvTotal: 45000,
          netCommission: 9000,
          noShowLostRevenue: 15000,
          triageToPaidConversionRate: 66.67,
          counts: {
            totalConsultations: 3,
            completed: 2,
            cancelledOrNoShow: 1,
            waitingOrActive: 0,
          },
        }}
      />
    );

    expect(screen.getByText(/45[\.,]?000/)).toBeDefined();
    expect(screen.getByText(/9[\.,]?000/)).toBeDefined();
    expect(screen.getByText(/15[\.,]?000/)).toBeDefined();
    expect(screen.getByText(/66\.67%/)).toBeDefined();
  });

  it('AdminFeatureFlagsModal debe listar banderas operativas y disparar onToggleFlag al conmutar', async () => {
    const onToggleMock = vi.fn().mockResolvedValue(undefined);
    render(
      <AdminFeatureFlagsModal
        isOpen={true}
        onClose={() => {}}
        flags={[
          {
            key: 'PAYMENTS_ENABLED',
            enabled: true,
            description: 'Habilita el cobro y pasarela de pagos',
            updatedAt: new Date().toISOString(),
          },
          {
            key: 'TRIAGE_ACTIVE',
            enabled: true,
            description: 'Habilita el ingreso de urgencias y triage',
            updatedAt: new Date().toISOString(),
          },
        ]}
        onToggleFlag={onToggleMock}
      />
    );

    expect(screen.getByText(/PAYMENTS_ENABLED/i)).toBeDefined();
    expect(screen.getByText(/TRIAGE_ACTIVE/i)).toBeDefined();

    const toggleButtons = screen.getAllByRole('button', { name: /desactivar|conmutar|toggle|estado/i });
    fireEvent.click(toggleButtons[0]);
    expect(onToggleMock).toHaveBeenCalledWith('PAYMENTS_ENABLED', false, expect.any(String));
  });

  it('AdminApp.tsx debe conectar AdminExecutiveMetrics, AdminFeatureFlagsModal y el endpoint /revoke-sessions', () => {
    const adminAppPath = path.resolve(__dirname, '../pages/AdminApp.tsx');
    const adminAppCode = fs.readFileSync(adminAppPath, 'utf-8');

    expect(adminAppCode).toMatch(/AdminExecutiveMetrics/);
    expect(adminAppCode).toMatch(/AdminFeatureFlagsModal/);
    expect(adminAppCode).toMatch(/revoke-sessions/);
  });
});
