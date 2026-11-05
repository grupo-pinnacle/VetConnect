import { featureFlagsService } from '../modules/admin/feature-flags.service';
import { AdminService } from '../modules/admin/admin.service';
import { AdminController } from '../modules/admin/admin.controller';
import adminRouter from '../modules/admin/admin.routes';
import { updateFeatureFlagSchema, revokeUserSessionsSchema } from '../modules/admin/admin.schemas';
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
  });
});
