import { AppError } from '../../middlewares/errorHandler';
import prisma from '../../lib/prisma';
import { FeatureFlagKey, UpdateFeatureFlagDTO, FEATURE_FLAG_KEYS } from './admin.schemas';

export interface FeatureFlagItem {
  key: FeatureFlagKey;
  enabled: boolean;
  description: string;
  updatedAt: string;
  updatedBy?: string | null;
}

const DEFAULT_FLAG_DESCRIPTIONS: Record<FeatureFlagKey, string> = {
  PAYMENTS_ENABLED: 'Pasarela de pagos y cobro de consultas',
  TRIAGE_ACTIVE: 'Flujo de triage y pre-diagnóstico clínico asistido',
  VIDEOCALLS_ENABLED: 'Salas de videollamadas y telemedicina en vivo',
  NEW_REGISTRATIONS_ENABLED: 'Registro de nuevos usuarios y profesionales veterinarios',
};

export class FeatureFlagsService {
  private flags = new Map<FeatureFlagKey, FeatureFlagItem>();

  constructor() {
    this.resetForTests();
  }

  public resetForTests(): void {
    this.flags.clear();
    const now = new Date().toISOString();
    for (const key of FEATURE_FLAG_KEYS) {
      this.flags.set(key, {
        key,
        enabled: true,
        description: DEFAULT_FLAG_DESCRIPTIONS[key],
        updatedAt: now,
        updatedBy: null,
      });
    }
  }

  public getAllFlags(): FeatureFlagItem[] {
    return Array.from(this.flags.values());
  }

  public isEnabled(key: FeatureFlagKey): boolean {
    const flag = this.flags.get(key);
    return flag ? flag.enabled : true;
  }

  public assertEnabled(key: FeatureFlagKey): void {
    if (!this.isEnabled(key)) {
      throw new AppError(
        `Operación rechazada temporalmente: el módulo ${key} se encuentra deshabilitado por mantenimiento operativo.`,
        503,
        'SERVICE_UNAVAILABLE'
      );
    }
  }

  public async toggleFlag(adminId: string, dto: UpdateFeatureFlagDTO): Promise<FeatureFlagItem> {
    const existing = this.flags.get(dto.key);
    const updated: FeatureFlagItem = {
      key: dto.key,
      enabled: dto.enabled,
      description: existing?.description || DEFAULT_FLAG_DESCRIPTIONS[dto.key],
      updatedAt: new Date().toISOString(),
      updatedBy: adminId,
    };

    this.flags.set(dto.key, updated);

    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action: 'FEATURE_FLAG_TOGGLED',
          targetId: dto.key,
          details: {
            key: dto.key,
            enabled: dto.enabled,
            reason: dto.reason || null,
          },
        },
      });
    } catch {
      // Non-blocking persistence for test / environment resilience
    }

    return updated;
  }
}

export const featureFlagsService = new FeatureFlagsService();
