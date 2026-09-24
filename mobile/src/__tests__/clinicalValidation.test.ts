import { petCreateSchema, petUpdateSchema } from '../validation/pet';
import {
  prescriptionCreateSchema,
  completeConsultationSchema,
  cancelConsultationSchema,
} from '../validation/clinical';
import { profileUpdateSchema } from '../validation/profile';

describe('Mobile clinical validation (espejo backend)', () => {
  it('should validate pet create payloads', () => {
    expect(
      petCreateSchema.safeParse({ name: 'Firulais', species: 'Canino', breed: 'Labrador' }).success
    ).toBe(true);
    expect(
      petCreateSchema.safeParse({ name: '', species: 'Canino', breed: 'Labrador' }).success
    ).toBe(false);
    expect(
      petCreateSchema.safeParse({
        name: 'Firulais',
        species: 'Canino',
        breed: 'Labrador',
        microchip: '123',
      }).success
    ).toBe(false);
  });

  it('should accept partial pet updates', () => {
    expect(petUpdateSchema.safeParse({ weightKg: 12.5 }).success).toBe(true);
    expect(petUpdateSchema.safeParse({ weightKg: -3 }).success).toBe(false);
    expect(petUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('should validate prescription payloads', () => {
    const valid = {
      medication: 'Amoxicilina 250mg',
      dosage: '1 comprimido',
      frequency: 'Cada 12h',
      durationDays: 7,
      indications: 'Con alimento durante una semana',
    };
    expect(prescriptionCreateSchema.safeParse(valid).success).toBe(true);
    expect(
      prescriptionCreateSchema.safeParse({ ...valid, durationDays: 0 }).success
    ).toBe(false);
    expect(
      prescriptionCreateSchema.safeParse({ ...valid, durationDays: 2.5 }).success
    ).toBe(false);
    expect(prescriptionCreateSchema.safeParse({ ...valid, indications: 'abc' }).success).toBe(false);
  });

  it('should require diagnosis notes with min length', () => {
    expect(completeConsultationSchema.safeParse({ diagnosisNotes: 'Otitis externa' }).success).toBe(true);
    expect(completeConsultationSchema.safeParse({ diagnosisNotes: 'x' }).success).toBe(false);
    expect(cancelConsultationSchema.safeParse({}).success).toBe(true);
    expect(cancelConsultationSchema.safeParse({ reason: 'Duplicada' }).success).toBe(true);
  });

  it('should bound profile updates (servidor sin Zod)', () => {
    expect(profileUpdateSchema.safeParse({ isOnline: true }).success).toBe(true);
    expect(profileUpdateSchema.safeParse({ bio: 'a'.repeat(501) }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ photoUrl: 'not-a-url' }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ photoUrl: 'https://x.com/foto.jpg' }).success).toBe(true);
  });
});
