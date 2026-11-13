import React from 'react';
import { Cookie, ShieldCheck, Settings } from 'lucide-react';
import { LegalLayout } from '../components/legal/LegalLayout';

export const CookiePolicy: React.FC = () => {
  const handleResetConsent = () => {
    try {
      localStorage.removeItem('vetconnect_cookie_consent');
    } catch {
      // Storage blocked
    }
    window.location.reload();
  };

  return (
    <LegalLayout
      icon={<Cookie className="w-6 h-6" aria-hidden="true" />}
      title="Política de Cookies y Tecnologías de Almacenamiento"
      subtitle="Transparencia sobre el uso de cookies y telemetría • Última actualización: Septiembre 2026"
    >
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          1. ¿Qué son las cookies y para qué las utilizamos?
        </h2>
        <p className="text-[#454e4e]">
          Una cookie es un pequeño archivo de texto enviado por el servidor web y almacenado en su navegador. En <strong>Huellicam</strong> (operado por <strong>Pinnacle Group S.A.</strong>) empleamos cookies y almacenamiento local estrictamente para garantizar la seguridad de su sesión médica, la operatividad del sistema de llamadas y la mejora continua del servicio.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          2. Categorías de Cookies Empleadas
        </h2>

        <div className="space-y-4 mt-3">
          <div className="p-4 rounded-2xl border border-[#e4dfd2] bg-[#fffbef]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-[#183c3a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#315f5d]" />
                Cookies Técnicas y Estrictamente Necesarias
              </span>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#d9e8e4] text-[#183c3a]">
                Obligatorias
              </span>
            </div>
            <p className="text-xs text-[#454e4e] mb-2">
              Son esenciales para la autenticación, prevención de ataques CSRF y persistencia de sesión segura mediante tokens JWT. No requieren consentimiento previo conforme a la ley, pero son completamente divulgadas.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#454e4e] border border-[#e4dfd2] rounded-xl bg-white">
                <thead className="bg-[#f2eddd] text-[#183c3a] font-bold">
                  <tr>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Nombre</th>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Tipo</th>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Duración</th>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Propósito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border-b border-[#e4dfd2] font-mono font-bold text-[#315f5d]">refreshToken</td>
                    <td className="p-2.5 border-b border-[#e4dfd2]">HttpOnly, Secure Cookie</td>
                    <td className="p-2.5 border-b border-[#e4dfd2]">7 días</td>
                    <td className="p-2.5 border-b border-[#e4dfd2]">Renovación de token de sesión con rotación criptográfica. Inaccesible vía JavaScript.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-bold text-[#315f5d]">vetconnect_cookie_consent</td>
                    <td className="p-2.5">LocalStorage</td>
                    <td className="p-2.5">1 año</td>
                    <td className="p-2.5">Registro de la decisión de consentimiento del usuario.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[#e4dfd2] bg-[#fffbef]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-[#183c3a] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#609f9c]" />
                Cookies de Analíticas y Telemetría de Errores
              </span>
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#f2eddd] text-[#315f5d]">
                Opcionales (Requieren Consentimiento)
              </span>
            </div>
            <p className="text-xs text-[#454e4e] mb-2">
              Nos permiten monitorear fallos técnicos, excepciones de frontend y calidad de conexión WebRTC sin recolectar datos personales identificables (cero PII). Solo se activan si usted da su consentimiento expreso en el banner.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#454e4e] border border-[#e4dfd2] rounded-xl bg-white">
                <thead className="bg-[#f2eddd] text-[#183c3a] font-bold">
                  <tr>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Proveedor</th>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Tipo</th>
                    <th className="p-2.5 border-b border-[#e4dfd2]">Propósito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 font-bold text-[#183c3a]">Sentry Error Tracking</td>
                    <td className="p-2.5">Telemetría anónima</td>
                    <td className="p-2.5">Detección de errores en tiempo de ejecución para evitar interrupciones en consultas clínicas.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          3. ¿Cómo configurar o revocar sus preferencias?
        </h2>
        <p className="text-[#454e4e]">
          Podés modificar o restablecer tu decisión respecto a las cookies opcionales en cualquier momento haciendo clic en el siguiente botón:
        </p>
        <div className="pt-3">
          <button
            type="button"
            onClick={handleResetConsent}
            className="px-6 py-3 bg-[#609f9c] hover:bg-[#4d8d89] active:bg-[#315f5d] text-white font-bold text-xs rounded-full shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] cursor-pointer"
          >
            Restablecer Preferencias de Cookies
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-[#183c3a] mb-2">
          4. Canales de Contacto
        </h2>
        <p className="text-[#454e4e]">
          Para dudas sobre esta política, comuníquese con el oficial de privacidad de Pinnacle Group S.A. a{' '}
          <a href="mailto:privacidad@huellicam.com.ar" className="text-[#315f5d] font-bold underline">
            privacidad@huellicam.com.ar
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;
