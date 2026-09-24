import type { TriagePriority } from '../types';

export const TRIAGE_PRIORITIES: TriagePriority[] = ['ROJO', 'AMARILLO', 'VERDE'];

export const TRIAGE_LABELS: Record<TriagePriority, string> = {
  ROJO: 'Rojo — Urgencia',
  AMARILLO: 'Amarillo — Prioritario',
  VERDE: 'Verde — Rutina',
};

/** Convención UI canónica: la prioridad se antepone en `notes` (TECH_REFERENCE §2.3). */
export function buildTriageNotes(priority: TriagePriority, notes: string): string {
  return `[Prioridad: ${priority}] ${notes.trim()}`;
}

export function parseTriagePriority(notes: string | null | undefined): TriagePriority | null {
  if (!notes) return null;
  const match = notes.match(/\[Prioridad:\s*(ROJO|AMARILLO|VERDE)\]/);
  return match ? (match[1] as TriagePriority) : null;
}
