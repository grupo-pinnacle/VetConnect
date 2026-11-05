import { featureFlagsService } from '../modules/admin/feature-flags.service';
import { AdminService } from '../modules/admin/admin.service';
import { AdminController } from '../modules/admin/admin.controller';
import adminRouter from '../modules/admin/admin.routes';
import {
  updateFeatureFlagSchema,
  revokeUserSessionsSchema,
  updatePricingSettingsSchema,
} from '../modules/admin/admin.schemas';
import prisma from '../lib/prisma';

// Ensure mockable refreshToken container on prisma client if not defined in generated schema
if (!(prisma as any).refreshToken) {
  (prisma as any).refreshToken = {
    deleteMany: jest.fn(),
  };
}

describe('FEATURE-ADMIN-OPS-01: Kill Switches, Session Revocation & Executive Metrics', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    featureFlagsService.resetForTests();
  });

  it('Scenario 1 (Kill Switch): debe desactivar PAYMENTS_ENABLED en tiempo real, registrar AuditLog y rechazar con 503', async () => {
    const auditSpy = jest.spyOn(prisma.auditLog, 'create').mockResolvedValueOnce({ id: 'audit-1' } as any);

    const parsed = updateFeatureFlagSchema.parse({
      key: 'PAYMENTS_ENABLED',
      enabled: false,
      reason: 'Mantenimiento preventivo de pasarela',
    });

    const updated = await featureFlagsService.toggleFlag('admin-id-1', parsed);
    expect(updated.key).toBe('PAYMENTS_ENABLED');
    expect(updated.enabled).toBe(false);
    expect(featureFlagsService.isEnabled('PAYMENTS_ENABLED')).toBe(false);
    expect(auditSpy).toHaveBeenCalled();

    expect(() => featureFlagsService.assertEnabled('PAYMENTS_ENABLED')).toThrowError(
      expect.objectContaining({
        statusCode: 503,
      })
    );
  });

  it('Scenario 2 (Revocación de sesión): debe suspender la cuenta, revocar refresh tokens y guardar motivo en AuditLog', async () => {
    const service = new AdminService();
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'user-target-1',
      email: 'vet@test.com',
      role: 'VET',
      status: 'ACTIVE',
    } as any);
    const updateSpy = jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({
      id: 'user-target-1',
      deletedAt: new Date(),
    } as any);
    const deleteTokensSpy = jest.spyOn((prisma as any).refreshToken, 'deleteMany').mockResolvedValueOnce({ count: 3 } as any);
    const auditSpy = jest.spyOn(prisma.auditLog, 'create').mockResolvedValueOnce({ id: 'audit-2' } as any);

    const dto = revokeUserSessionsSchema.parse({
      reason: 'Incumplimiento grave de protocolo clínico',
      suspendAccount: true,
    });

    const result = await service.revokeUserSessionsAndSuspend('admin-1', 'user-target-1', dto);

    expect(updateSpy).toHaveBeenCalled();
    expect(deleteTokensSpy).toHaveBeenCalledWith({ where: { userId: 'user-target-1' } });
    expect(auditSpy).toHaveBeenCalled();
    expect(result.revokedCount).toBe(3);
  });

  it('Scenario 3 (Métricas CEO): debe calcular GMV, comisión neta, pérdida por no-shows y conversión de triage', async () => {
    const service = new AdminService();
    jest.spyOn(prisma.consultation, 'findMany').mockResolvedValueOnce([
      { id: 'c1', status: 'COMPLETED', price: 15000 },
      { id: 'c2', status: 'COMPLETED', price: 15000 },
      { id: 'c3', status: 'CANCELLED', price: 15000 },
      { id: 'c4', status: 'WAITING', price: 15000 },
    ] as any);

    const metrics = await service.getExecutiveMetrics(15000, 0.2);

    expect(metrics.gmvTotal).toBe(30000);
    expect(metrics.netCommission).toBe(6000);
    expect(metrics.noShowLostRevenue).toBe(15000);
    expect(metrics.triageToPaidConversionRate).toBe(50);
    expect(metrics.counts.totalConsultations).toBe(4);
  });
});

describe('AdminController & Routes - FEATURE-ADMIN-OPS-01', () => {
  it('AdminController debe exponer los métodos getFeatureFlags, toggleFeatureFlag, revokeUserSessions y getExecutiveMetrics', () => {
    const controller = new AdminController();
    expect(typeof (controller as any).getFeatureFlags).toBe('function');
    expect(typeof (controller as any).toggleFeatureFlag).toBe('function');
    expect(typeof (controller as any).revokeUserSessions).toBe('function');
    expect(typeof (controller as any).getExecutiveMetrics).toBe('function');
    expect(typeof (controller as any).getPricingSettings).toBe('function');
    expect(typeof (controller as any).updatePricingSettings).toBe('function');
  });

  it('admin.routes.ts debe registrar las rutas /feature-flags, /users/:id/revoke-sessions y /executive-metrics', () => {
    const routePaths = adminRouter.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    expect(routePaths.some((r: any) => r.path === '/feature-flags' && r.methods.includes('get'))).toBe(true);
    expect(routePaths.some((r: any) => r.path === '/feature-flags' && r.methods.includes('patch'))).toBe(true);
    expect(routePaths.some((r: any) => r.path === '/users/:id/revoke-sessions' && r.methods.includes('post'))).toBe(true);
    expect(routePaths.some((r: any) => r.path === '/executive-metrics' && r.methods.includes('get'))).toBe(true);
    expect(routePaths.some((r: any) => r.path === '/pricing-settings' && r.methods.includes('get'))).toBe(true);
    expect(routePaths.some((r: any) => r.path === '/pricing-settings' && r.methods.includes('patch'))).toBe(true);
  });
});

describe('FEATURE-WHITE-LABEL-PRICING-01: White-Label Tariff Settings & Dynamic Unit Economics', () => {
  it('debe actualizar PricingSettings, registrar AuditLog y recalcular getExecutiveMetrics con la nueva tarifa cuando no se pasan overrides', async () => {
    const service = new AdminService();
    (service as any).resetPricingForTests?.();
    const auditSpy = jest.spyOn(prisma.auditLog, 'create').mockResolvedValueOnce({ id: 'audit-pricing-1' } as any);

    const dto = updatePricingSettingsSchema.parse({
      baseConsultationFee: 25000,
      platformTakeRate: 0.15,
      currency: 'ARS',
      reason: 'Actualización arancel ético colegio veterinario Q4',
    });

    const updatedPricing = await (service as any).updatePricingSettings('admin-ceo-1', dto);
    expect(updatedPricing.baseConsultationFee).toBe(25000);
    expect(updatedPricing.platformTakeRate).toBe(0.15);
    expect(updatedPricing.currency).toBe('ARS');
    expect(auditSpy).toHaveBeenCalled();

    jest.spyOn(prisma.consultation, 'findMany').mockResolvedValueOnce([
      { id: 'c1', status: 'COMPLETED' },
      { id: 'c2', status: 'COMPLETED' },
      { id: 'c3', status: 'CANCELLED' },
    ] as any);

    // Llamada sin parámetros: debe tomar los 25.000 y 15% configurados en el tenant
    const metrics = await service.getExecutiveMetrics();
    expect(metrics.gmvTotal).toBe(50000);
    expect(metrics.netCommission).toBe(7500);
    expect(metrics.noShowLostRevenue).toBe(25000);
    expect(metrics.pricing?.baseConsultationFee).toBe(25000);
    expect(metrics.pricing?.platformTakeRate).toBe(0.15);
  });

  it('debe permitir platformTakeRate = 0 (Tier 1 SaaS B2B) y rechazar valores fuera de rango [0, 1] o arancel <= 0', () => {
    const tier1Valid = updatePricingSettingsSchema.parse({
      baseConsultationFee: 40,
      platformTakeRate: 0,
      currency: 'USD',
    });
    expect(tier1Valid.platformTakeRate).toBe(0);
    expect(tier1Valid.currency).toBe('USD');

    expect(() =>
      updatePricingSettingsSchema.parse({
        baseConsultationFee: -100,
        platformTakeRate: 0.2,
      })
    ).toThrow();

    expect(() =>
      updatePricingSettingsSchema.parse({
        baseConsultationFee: 15000,
        platformTakeRate: 1.25,
      })
    ).toThrow();
  });
});
