import { describe, it, expect } from 'vitest';
import { parseConsultationNotes } from '../lib/consultationNotes';

describe('parseConsultationNotes (ADR-030)', () => {
  it('should clean raw notes with priority and cancellation tags', () => {
    const raw = '[Prioridad: ROJO] tiene vacunas [CANCELLED_TIMEOUT_NO_VET_AVAILABLE]';
    const result = parseConsultationNotes(raw);

    expect(result.cleanNotes).toBe('tiene vacunas');
    expect(result.priority).toBe('ROJO');
    expect(result.cancellationReason).toBe(
      'Tiempo de espera agotado: sin veterinarios disponibles en guardia.'
    );
  });

  it('should remove AI triage score tags', () => {
    const raw = '[Prioridad: AMARILLO] [Triage IA: 6/10] Vómitos recurrentes y letargo';
    const result = parseConsultationNotes(raw);

    expect(result.cleanNotes).toBe('Vómitos recurrentes y letargo');
    expect(result.priority).toBe('AMARILLO');
    expect(result.cancellationReason).toBeNull();
  });

  it('should handle null or empty notes gracefully', () => {
    expect(parseConsultationNotes(null).cleanNotes).toBe('Consulta médica general');
    expect(parseConsultationNotes('').cleanNotes).toBe('Consulta médica general');
    expect(parseConsultationNotes('   ').cleanNotes).toBe('Consulta médica general');
  });

  it('should preserve user notes without tags untouched', () => {
    const raw = 'Control preventivo y dudas sobre alimentación';
    const result = parseConsultationNotes(raw);

    expect(result.cleanNotes).toBe('Control preventivo y dudas sobre alimentación');
    expect(result.priority).toBeNull();
    expect(result.cancellationReason).toBeNull();
  });
});
