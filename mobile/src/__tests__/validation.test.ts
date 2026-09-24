import { loginSchema, registerSchema, reviewSchema } from '../validation/auth';

describe('Mobile input validation (Zod, espejo backend)', () => {
  it('should reject invalid login payloads', () => {
    expect(loginSchema.safeParse({ email: 'no-mail', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('should require license for VET at store level but accept shape', () => {
    const parsed = registerSchema.safeParse({
      email: 'vet@vetconnect.com',
      password: 'Password123!',
      firstName: 'Ana',
      lastName: 'Vet',
      role: 'VET',
    });
    expect(parsed.success).toBe(true);
  });

  it('should enforce rating 1-5 integers', () => {
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 2.5 }).success).toBe(false);
  });
});
