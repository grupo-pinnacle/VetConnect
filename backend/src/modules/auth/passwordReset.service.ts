import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../lib/prisma';
import { AppError } from '../../middlewares/errorHandler';
import { emailService } from '../../services/email.service';

export class PasswordResetService {
  /**
   * Genera un código de 6 dígitos seguro, lo guarda hasheado y envía el correo con Resend.
   */
  public async requestReset(emailInput: string): Promise<boolean> {
    const email = String(emailInput).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // OWASP: No revelar si el correo existe o no al cliente, pero solo enviar si existe
    if (!user || user.deletedAt) {
      return true;
    }

    // Invalida tokens previos pendientes para este email
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generar código numérico criptográfico de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.passwordResetToken.create({
      data: {
        email,
        codeHash,
        expiresAt,
      },
    });

    // Enviar correo vía Resend
    await emailService.sendPasswordResetCode(email, user.firstName, code);
    return true;
  }

  /**
   * Valida el código de 6 dígitos ingresado por el usuario.
   */
  public async verifyCode(emailInput: string, codeInput: string): Promise<boolean> {
    const email = String(emailInput).toLowerCase().trim();
    const code = String(codeInput).trim();

    const activeToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeToken) {
      throw new AppError('El código es inválido o ha expirado', 400, 'INVALID_RESET_CODE');
    }

    const isMatch = await bcrypt.compare(code, activeToken.codeHash);
    if (!isMatch) {
      throw new AppError('El código ingresado es incorrecto', 400, 'INVALID_RESET_CODE');
    }

    return true;
  }

  /**
   * Restablece la contraseña tras verificar el código, e incrementa tokenVersion para revocar sesiones antiguas.
   */
  public async resetPassword(emailInput: string, codeInput: string, newPasswordInput: string): Promise<boolean> {
    const email = String(emailInput).toLowerCase().trim();
    const code = String(codeInput).trim();

    await this.verifyCode(email, code);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const hashedPassword = await bcrypt.hash(newPasswordInput, 12);

    // Marcar token como utilizado
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Actualizar contraseña e incrementar tokenVersion para forzar re-autenticación limpia
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    });

    return true;
  }
}

export const passwordResetService = new PasswordResetService();
