import { z } from 'zod';

const petSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().min(1),
  microchip: z.string().regex(/^\d{15}$/).optional().nullable(),
});

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
});
