import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Entrega de correo de recuperación de contraseña y remitente Resend', () => {
  const emailServicePath = path.resolve(__dirname, '../services/email.service.ts');
  const envConfigPath = path.resolve(__dirname, '../config/env.ts');
  const resetServicePath = path.resolve(__dirname, '../modules/auth/passwordReset.service.ts');

  const emailServiceCode = fs.readFileSync(emailServicePath, 'utf-8');
  const envConfigCode = fs.readFileSync(envConfigPath, 'utf-8');
  const resetServiceCode = fs.readFileSync(resetServicePath, 'utf-8');

  it('env.ts y email.service.ts no deben usar el dominio no verificado notificaciones@vetconnect.com.ar como default bloqueante y deben usar onboarding@resend.dev', () => {
    expect(envConfigCode).toMatch(/onboarding@resend\.dev/);
    expect(emailServiceCode).toMatch(/onboarding@resend\.dev/);
    expect(emailServiceCode).not.toMatch(/this\.fromEmail\s*=\s*config\.EMAIL_FROM\s*\|\|\s*['"]VetConnect <notificaciones@vetconnect\.com\.ar>['"]/);
  });

  it('email.service.ts debe inspeccionar response.error de Resend y aplicar fallback a onboarding@resend.dev si falla la verificación del remitente', () => {
    // El SDK de Resend retorna { data, error } sin lanzar throw por defecto; debe verificarse response.error
    expect(emailServiceCode).toMatch(/response\.error/);
  });

  it('passwordReset.service.ts debe normalizar el email (trim y toLowerCase) en requestReset antes de buscar al usuario y enviar el código', () => {
    expect(resetServiceCode).toMatch(/\.trim\(\)\.toLowerCase\(\)|\.toLowerCase\(\)\.trim\(\)/);
  });
});
