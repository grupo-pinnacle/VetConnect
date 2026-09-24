import { buildTriageNotes, parseTriagePriority } from '../lib/triage';

describe('Mobile triage helpers (TECH_REFERENCE §2.3)', () => {
  it('should prefix notes with priority tag', () => {
    expect(buildTriageNotes('ROJO', 'Vómitos')).toBe('[Prioridad: ROJO] Vómitos');
    expect(buildTriageNotes('VERDE', '  Control  ')).toBe('[Prioridad: VERDE] Control');
  });

  it('should parse priority back from notes', () => {
    expect(parseTriagePriority('[Prioridad: AMARILLO] Tos')).toBe('AMARILLO');
    expect(parseTriagePriority('Sin tag')).toBeNull();
    expect(parseTriagePriority(null)).toBeNull();
  });
});
