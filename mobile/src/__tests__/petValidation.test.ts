import { z } from 'zod';

const petSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().min(1),
  microchip: z.string().regex(/^\d{15}$/).optional().nullable(),
});

function getTriageBadgeColor(priority: 'ROJO' | 'AMARILLO' | 'VERDE') {
  switch (priority) {
    case 'ROJO':
      return '#EF4444'; // Red-500
    case 'AMARILLO':
      return '#F59E0B'; // Amber-500
    case 'VERDE':
      return '#10B981'; // Emerald-500
    default:
      return '#6B7280'; // Slate-500
  }
}

describe('Mobile Pet Validation Schemas & Helpers', () => {
  it('should validate valid 15-digit ISO microchip', () => {
    const valid = petSchema.safeParse({
      name: 'Firulais',
      species: 'Canine',
      breed: 'Labrador',
      microchip: '123456789012345',
    });
    expect(valid.success).toBe(true);
  });

  it('should reject invalid microchip formats', () => {
    const invalid = petSchema.safeParse({
      name: 'Firulais',
      species: 'Canine',
      breed: 'Labrador',
      microchip: '1234567890',
    });
    expect(invalid.success).toBe(false);
  });

  it('should return correct color hex code for triage priorities', () => {
    expect(getTriageBadgeColor('ROJO')).toBe('#EF4444');
    expect(getTriageBadgeColor('AMARILLO')).toBe('#F59E0B');
    expect(getTriageBadgeColor('VERDE')).toBe('#10B981');
  });
});
