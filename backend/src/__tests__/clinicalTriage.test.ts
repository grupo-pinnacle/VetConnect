import { evaluateClinicalTriage } from '../modules/consultations/clinicalTriage.engine';

describe('Clinical Triage Engine (ADR-028 AI-First Triage)', () => {
  it('should classify critical respiratory distress as ROJO with red flags', () => {
    const result = evaluateClinicalTriage({
      pet: { species: 'Canine', breed: 'Bulldog Francés' },
      symptoms: ['respiratory_distress'],
      notes: 'No puede respirar bien y tiene la lengua morada',
    });

    expect(result.priority).toBe('ROJO');
    expect(result.isEmergency).toBe(true);
    expect(result.severityScore).toBeGreaterThanOrEqual(8);
    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.formattedNotes).toContain('[Prioridad: ROJO]');
  });

  it('should detect seizure keywords in text and classify as ROJO', () => {
    const result = evaluateClinicalTriage({
      pet: { species: 'Canine', breed: 'Labrador' },
      notes: 'Está teniendo una convulsión y no responde',
    });

    expect(result.priority).toBe('ROJO');
    expect(result.isEmergency).toBe(true);
    expect(result.formattedNotes).toContain('[Prioridad: ROJO]');
  });

  it('should classify moderate vomiting as AMARILLO', () => {
    const result = evaluateClinicalTriage({
      pet: { species: 'Feline', breed: 'Siamés' },
      symptoms: ['persistent_vomiting'],
      duration: 'HOURS_2_TO_12',
      notes: 'Vomitó dos veces hoy pero está alerta',
    });

    expect(result.priority).toBe('AMARILLO');
    expect(result.isEmergency).toBe(false);
    expect(result.severityScore).toBe(5);
    expect(result.formattedNotes).toContain('[Prioridad: AMARILLO]');
  });

  it('should escalate moderate symptoms with extended duration (>2 days) to severity 7', () => {
    const result = evaluateClinicalTriage({
      pet: { species: 'Canine', breed: 'Mestizo' },
      symptoms: ['lethargy'],
      duration: 'MORE_THAN_2_DAYS',
      notes: 'Está muy decaído y no quiere comer hace varios días',
    });

    expect(result.priority).toBe('AMARILLO');
    expect(result.severityScore).toBe(7);
    expect(result.formattedNotes).toContain('[Prioridad: AMARILLO]');
  });

  it('should classify routine checkup as VERDE with low severity score', () => {
    const result = evaluateClinicalTriage({
      pet: { species: 'Canine', breed: 'Golden' },
      symptoms: ['routine_checkup'],
      notes: 'Consulta de control y dudas sobre vacunación anual',
    });

    expect(result.priority).toBe('VERDE');
    expect(result.isEmergency).toBe(false);
    expect(result.severityScore).toBe(2);
    expect(result.formattedNotes).toContain('[Prioridad: VERDE]');
  });

  it('should preserve legacy explicit priority if already formatted', () => {
    const legacyNotes = '[Prioridad: ROJO] Emergencia manual previa';
    const result = evaluateClinicalTriage({
      notes: legacyNotes,
    });

    expect(result.priority).toBe('ROJO');
    expect(result.formattedNotes).toBe(legacyNotes);
  });
});
