import { AppError } from '../middlewares/errorHandler';
import { createPetSchema } from '../modules/pets/pets.schemas';
import { createConsultationSchema } from '../modules/consultations/consultations.schemas';
import { createPrescriptionSchema } from '../modules/prescriptions/prescriptions.schemas';
import { registerSchema, loginSchema } from '../modules/auth/auth.schemas';

describe('Utility, Error & DTO Validation Suite', () => {
  describe('AppError Exception Class', () => {
    it('should correctly set default statusCode 400 and BAD_REQUEST code', () => {
      const err = new AppError('Custom error message');
      expect(err.message).toBe('Custom error message');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('BAD_REQUEST');
      expect(err.details).toBeNull();
    });

    it('should support custom statusCode, error code, and details payload', () => {
      const detailsObj = { field: 'email', reason: 'duplicate' };
      const err = new AppError('Conflict', 409, 'CONFLICT_CODE', detailsObj);
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('CONFLICT_CODE');
      expect(err.details).toEqual(detailsObj);
    });
  });

  describe('Zod Schema Validations', () => {
    it('registerSchema: should validate correct registration DTO', () => {
      const valid = registerSchema.safeParse({
        email: 'tutor@test.com',
        password: 'Password123!',
        firstName: 'Lucia',
        lastName: 'Perez',
      });
      expect(valid.success).toBe(true);
    });

    it('registerSchema: should reject invalid email format', () => {
      const invalid = registerSchema.safeParse({
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Lucia',
        lastName: 'Perez',
      });
      expect(invalid.success).toBe(false);
    });

    it('registerSchema: should reject short password (< 8 chars)', () => {
      const invalid = registerSchema.safeParse({
        email: 'tutor@test.com',
        password: 'short',
        firstName: 'Lucia',
        lastName: 'Perez',
      });
      expect(invalid.success).toBe(false);
    });

    it('loginSchema: should validate valid login credentials', () => {
      const valid = loginSchema.safeParse({
        email: 'user@test.com',
        password: 'SecretPassword',
      });
      expect(valid.success).toBe(true);
    });

    it('createPetSchema: should accept valid pet payload with null microchip', () => {
      const valid = createPetSchema.safeParse({
        name: 'Mishi',
        species: 'Feline',
        breed: 'Siamese',
        microchip: null,
      });
      expect(valid.success).toBe(true);
    });

    it('createPetSchema: should accept valid 15-digit ISO microchip string', () => {
      const valid = createPetSchema.safeParse({
        name: 'Rex',
        species: 'Canine',
        breed: 'German Shepherd',
        microchip: '985123456789012',
      });
      expect(valid.success).toBe(true);
    });

    it('createPetSchema: should reject non-numeric or wrong length microchips', () => {
      const invalidLength = createPetSchema.safeParse({
        name: 'Rex',
        species: 'Canine',
        breed: 'German Shepherd',
        microchip: '12345',
      });
      expect(invalidLength.success).toBe(false);

      const invalidChars = createPetSchema.safeParse({
        name: 'Rex',
        species: 'Canine',
        breed: 'German Shepherd',
        microchip: '1234567890abcde',
      });
      expect(invalidChars.success).toBe(false);
    });

    it('createConsultationSchema: should validate petId and notes', () => {
      const valid = createConsultationSchema.safeParse({
        petId: 'pet-uuid-1',
        notes: 'Fiebre persistente de 38.5C y inapetencia',
      });
      expect(valid.success).toBe(true);
    });

    it('createPrescriptionSchema: should validate medication, dosage, duration, and indications', () => {
      const valid = createPrescriptionSchema.safeParse({
        medication: 'Cefalexina 500mg',
        dosage: '1 comprimido cada 12 horas',
        frequency: 'Cada 12 hs',
        durationDays: 10,
        indications: 'Suministrar despues del alimento por 10 dias seguidos.',
      });
      expect(valid.success).toBe(true);
    });

    it('createPrescriptionSchema: should reject negative or zero durationDays', () => {
      const invalid = createPrescriptionSchema.safeParse({
        medication: 'Cefalexina 500mg',
        dosage: '1 comprimido cada 12 horas',
        frequency: 'Cada 12 hs',
        durationDays: 0,
        indications: 'Suministrar despues del alimento.',
      });
      expect(invalid.success).toBe(false);
    });
  });
});
