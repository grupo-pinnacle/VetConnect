import { Resend } from 'resend';
import { config } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor() {
    this.fromEmail = config.EMAIL_FROM || 'VetConnect <notificaciones@vetconnect.com.ar>';
    if (config.RESEND_API_KEY) {
      this.resend = new Resend(config.RESEND_API_KEY);
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    if (!this.resend) {
      // Entorno local de desarrollo o sin API KEY: logging claro y seguro
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 [MOCK EMAIL DISPATCHER - RESEND NOT CONFIGURED]');
      console.log(`Para: ${to}`);
      console.log(`Asunto: ${subject}`);
      console.log('Contenido (HTML):');
      console.log(html);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || subject,
      });

      if (response.error) {
        console.warn(`[EmailService] Resend error delivering to ${to}:`, response.error);
        return false;
      }

      console.log(`[EmailService] Email sent successfully to ${to} (ID: ${response.data?.id})`);
      return true;
    } catch (err) {
      console.error(`[EmailService] Fatal exception sending email to ${to}:`, err);
      return false;
    }
  }

  public async sendPasswordResetCode(to: string, userName: string, code: string): Promise<boolean> {
    const subject = `${code} es tu código de recuperación de VetConnect`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f8; margin: 0; padding: 24px; color: #183c3a; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #d9e5e3; padding: 32px; box-shadow: 0 4px 12px rgba(24, 60, 58, 0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #183c3a; margin-bottom: 24px; display: inline-block; }
          .code-box { background: #eaf3f1; border: 2px dashed #315f5d; border-radius: 12px; padding: 18px; text-align: center; margin: 28px 0; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #183c3a; }
          .footer { margin-top: 32px; font-size: 12px; color: #648482; border-top: 1px solid #eef3f2; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🐾 VetConnect</div>
          <h2>Recuperación de contraseña</h2>
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Ingresá este código de 6 dígitos en la aplicación:</p>
          <div class="code-box">${code}</div>
          <p>Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, podés ignorar este correo; tu cuenta sigue segura.</p>
          <div class="footer">
            © ${new Date().getFullYear()} VetConnect · Telemedicina y Cuidado Veterinario Integral
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({ to, subject, html, text: `Tu código de recuperación es: ${code}` });
  }

  public async sendPrescriptionEmail(params: {
    to: string;
    clientName: string;
    petName: string;
    vetName: string;
    medication: string;
    dosage: string;
    frequency: string;
    licenseNumber?: string;
    durationDays: number;
    indications: string;
    verifyUrl: string;
  }): Promise<boolean> {
    const { to, clientName, petName, vetName, medication, dosage, frequency, durationDays, licenseNumber, indications, verifyUrl } = params;
    const subject = `Receta médica emitida para ${petName} - VetConnect`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9f8; margin: 0; padding: 24px; color: #183c3a; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #d9e5e3; padding: 32px; }
          .badge { display: inline-block; background: #eaf3f1; color: #315f5d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 16px; }
          .rx-card { background: #fbfdfc; border: 1px solid #c7dcda; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .rx-row { margin-bottom: 12px; }
          .rx-row strong { display: block; font-size: 12px; text-transform: uppercase; color: #648482; }
          .rx-row span { font-size: 15px; font-weight: 600; color: #183c3a; }
          .btn { display: inline-block; background-color: #183c3a; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">Receta Médica Digital</span>
          <h2>Indicaciones de tratamiento para ${petName}</h2>
          <p>Hola <strong>${clientName}</strong>, el profesional <strong>${vetName}</strong> ${licenseNumber ? ` (Matrícula: <strong>${licenseNumber}</strong>)` : ''} ha emitido una receta médica oficial para tu mascota.</p>
          
          <div class="rx-card">${licenseNumber ? `
            <div class="rx-row">
              <strong>Profesional Emisor</strong>
              <span>${vetName} · M.P. ${licenseNumber}</span>
            </div>` : ''}
            <div class="rx-row">
              <strong>Medicamento</strong>
              <span>${medication}</span>
            </div>
            <div class="rx-row">
              <strong>Dosis y Frecuencia</strong>
              <span>${dosage} · Cada ${frequency}</span>
            </div>
            <div class="rx-row">
              <strong>Duración del tratamiento</strong>
              <span>${durationDays} días</span>
            </div>
            <div class="rx-row">
              <strong>Indicaciones y Cuidados</strong>
              <span>${indications}</span>
            </div>
          </div>

          <p>Podés ver la receta firmada con código QR de verificación haciendo clic en el siguiente botón:</p>
          <a class="btn" href="${verifyUrl}" target="_blank">Ver Receta y QR Oficial</a>

          <p style="margin-top: 28px; font-size: 12px; color: #648482;">
            Esta receta electrónica cuenta con trazabilidad y firma profesional verificable conforme a la normativa vigente de telemedicina veterinaria (SENASA / Res. 1442/2021).
          </p>
        </div>
      </body>
      </html>
    `;
    const text = `Receta médica para ${petName} emitida por ${vetName}${licenseNumber ? ` (M.P. ${licenseNumber})` : ''}. Medicamento: ${medication}, Dosis: ${dosage}, Frecuencia: Cada ${frequency}, Duración: ${durationDays} días. Indicaciones: ${indications}. Verificación: ${verifyUrl}`;
    return this.sendEmail({ to, subject, html, text });
  }

  public async sendReminderEmail(params: {
    to: string;
    clientName: string;
    type: 'APPOINTMENT' | 'CHECKUP' | 'BIRTHDAY';
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<boolean> {
    const { to, clientName, title, message, actionUrl } = params;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9f8; margin: 0; padding: 24px; color: #183c3a; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #d9e5e3; padding: 32px; }
          .btn { display: inline-block; background-color: #183c3a; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="font-size: 20px; font-weight: 800; color: #183c3a; margin-bottom: 20px;">🐾 VetConnect</div>
          <h2>${title}</h2>
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>${message}</p>
          ${actionUrl ? `<a class="btn" href="${actionUrl}">Ingresar a VetConnect</a>` : ''}
          <div style="margin-top: 32px; font-size: 12px; color: #648482; border-top: 1px solid #eef3f2; padding-top: 16px;">
            © ${new Date().getFullYear()} VetConnect · Recordatorios automáticos de salud y bienestar
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({ to, subject: title, html });
  }
}

export const emailService = new EmailService();
