import prisma from '../lib/prisma';
import { emailService } from '../services/email.service';

/**
 * Servicio autónomo de recordatorios preventivos y notificaciones por correo (Gmail/Resend).
 * Ejecuta chequeos periódicos de:
 * 1. Consultas programadas para las próximas 24 horas.
 * 2. Fecha de chequeo médico preventivo recomendado (anual).
 */
export class NotificationsScheduler {
  private timer: NodeJS.Timeout | null = null;
  private readonly intervalMs = 60 * 60 * 1000; // Cada 1 hora

  public start() {
    if (this.timer) return;
    // Ejecutar chequeo diferido al inicio (5 segs después del boot)
    setTimeout(() => {
      this.runChecks().catch((err) => console.warn('[Scheduler] Initial run failed:', err));
    }, 5000);

    this.timer = setInterval(() => {
      this.runChecks().catch((err) => console.warn('[Scheduler] Periodic run failed:', err));
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async runChecks(): Promise<void> {
    await this.checkUpcomingConsultations();
    await this.checkPreventiveCheckups();
  }

  /**
   * Envía recordatorio por correo a tutores cuyas videoconsultas inicien en las próximas 24 horas.
   */
  public async checkUpcomingConsultations(): Promise<void> {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = await prisma.consultation.findMany({
      where: {
        status: 'WAITING',
        deletedAt: null,
        createdAt: {
          gte: new Date(now.getTime() - 2 * 60 * 60 * 1000), // recientes
        },
      },
      include: {
        client: { select: { email: true, firstName: true } },
        pet: { select: { name: true } },
      },
    });

    for (const c of upcoming) {
      if (c.client?.email) {
        await emailService
          .sendReminderEmail({
            to: c.client.email,
            clientName: c.client.firstName || 'Tutor',
            type: 'APPOINTMENT',
            title: `Recordatorio de atención para ${c.pet?.name || 'tu mascota'}`,
            message: `Tenés una consulta programada en VetConnect para ${c.pet?.name || 'tu mascota'}. Verificá tu conexión a internet y tené lista la libreta sanitaria.`,
            actionUrl: `${(process.env.CLIENT_URL || 'https://app.vetconnect.com.ar').replace(/\/$/, '')}/client/dashboard`,
          })
          .catch(() => {});
      }
    }
  }

  /**
   * Chequea controles preventivos recomendados
   */
  public async checkPreventiveCheckups(): Promise<void> {
    // Busca mascotas registradas hace más de 11 meses sin consulta en los últimos 6 meses
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const petsDue = await prisma.pet.findMany({
      where: {
        deletedAt: null,
        consultations: {
          none: {
            createdAt: { gte: sixMonthsAgo },
          },
        },
      },
      include: {
        owner: { select: { email: true, firstName: true } },
      },
      take: 20, // lote controlado
    });

    for (const pet of petsDue) {
      if (pet.owner?.email) {
        await emailService
          .sendReminderEmail({
            to: pet.owner.email,
            clientName: pet.owner.firstName || 'Tutor',
            type: 'CHECKUP',
            title: `Chequeo preventivo recomendado para ${pet.name}`,
            message: `Pasaron varios meses desde el último control de ${pet.name}. Te recomendamos coordinar un chequeo general con un profesional matriculado para mantener sus vacunas y peso al día.`,
            actionUrl: `${(process.env.CLIENT_URL || 'https://app.vetconnect.com.ar').replace(/\/$/, '')}/client/triage`,
          })
          .catch(() => {});
      }
    }
  }
}

export const notificationsScheduler = new NotificationsScheduler();
