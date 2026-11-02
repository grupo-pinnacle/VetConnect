import { updateProfileSchema } from '../modules/users/users.schemas';

describe('Bugfix: User Profile Phone Validation (updateProfileSchema)', () => {
  it('debe rechazar números de teléfono con letras, símbolos inválidos o exceso de dígitos', () => {
    const invalidInputs = [
      '1123456767657657567567a',
      'abc1234567',
      '12345', // menos de 7 dígitos
      '+5491155551234567890123', // exceso de dígitos
      '11234567@!',
    ];

    for (const phone of invalidInputs) {
      const result = updateProfileSchema.safeParse({ phone });
      expect(result.success).toBe(false);
    }
  });

  it('debe aceptar teléfonos válidos en formato E.164 / nacional y transformar strings vacíos a null', () => {
    expect(updateProfileSchema.parse({ phone: '+5491155551234' }).phone).toBe('+5491155551234');
    expect(updateProfileSchema.parse({ phone: '+54 9 11 5555-1234' }).phone).toBe('+54 9 11 5555-1234');
    expect(updateProfileSchema.parse({ phone: '(011) 4444-5555' }).phone).toBe('(011) 4444-5555');
    expect(updateProfileSchema.parse({ phone: '' }).phone).toBeNull();
    expect(updateProfileSchema.parse({ phone: '   ' }).phone).toBeNull();
    expect(updateProfileSchema.parse({ phone: null }).phone).toBeNull();
    expect(updateProfileSchema.parse({}).phone).toBeUndefined();
  });
});
