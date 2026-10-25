import { describe, it, expect } from 'vitest';
import { parseConsultationNotes, formatConsultationNotes } from '../lib/consultationNotes';

describe('parseConsultationNotes (ADR-030 & BUG-03)', () => {
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

  it('BUG-03: should strip accidental or legacy timeframe duration suffix from routine checkups', () => {
    const rawWithHour = '[Prioridad: VERDE] Control preventivo o consulta de rutina (Hace menos de una hora)';
    const resultHour = parseConsultationNotes(rawWithHour);
    expect(resultHour.cleanNotes).toBe('Control preventivo o consulta de rutina');
    expect(resultHour.priority).toBe('VERDE');

    const rawWithDays = '[Prioridad: VERDE] Consulta de rutina (Hace varios días)';
    const resultDays = parseConsultationNotes(rawWithDays);
    expect(resultDays.cleanNotes).toBe('Consulta de rutina');
  });
});

describe('formatConsultationNotes (BUG-03)', () => {
  it('should format routine checkups with priority VERDE and omit timeframe duration', () => {
    const routineNote = formatConsultationNotes({
      tier: 'AMARILLO', // Routine must enforce VERDE regardless
      symptom: 'Control preventivo o consulta de rutina',
      timeframe: 'Hace menos de una hora',
      isRoutine: true,
    });

    expect(routineNote).toBe('[Prioridad: VERDE] Control preventivo o consulta de rutina');
    expect(routineNote).not.toContain('Hace menos de una hora');
    expect(routineNote).not.toContain('(');
  });

  it('should retain timeframe duration for acute non-routine symptoms', () => {
    const acuteNote = formatConsultationNotes({
      tier: 'ROJO',
      symptom: 'Dificultad para respirar / Asfixia',
      timeframe: 'Hace menos de una hora',
      isRoutine: false,
    });

    expect(acuteNote).toBe('[Prioridad: ROJO] Dificultad para respirar / Asfixia (Hace menos de una hora)');
  });
});
