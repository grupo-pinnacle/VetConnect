import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Settings } from 'lucide-react';

export const CookiePolicy: React.FC = () => {
  const handleResetConsent = () => {
    localStorage.removeItem('vetconnect_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header Accesible */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg px-2 py-1 transition-colors"
            aria-label="Volver a la portada de VetConnect"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">VetConnect Legal</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full" id="main-content">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Cookie className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Política de Cookies y Tecnologías de Almacenamiento
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Transparencia sobre el uso de cookies y telemetría • Última actualización: Septiembre 2026
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                1. ¿Qué son las cookies y para qué las utilizamos?
              </h2>
              <p className="text-slate-600">
                Una cookie es un pequeño archivo de texto enviado por el servidor web y almacenado en su navegador. En <strong>VetConnect</strong> (operado por <strong>Pinnacle Group S.A.</strong>) empleamos cookies y almacenamiento local estrictamente para garantizar la seguridad de su sesión médica, la operatividad del sistema de llamadas y la mejora continua del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                2. Categorías de Cookies Empleadas
              </h2>

              <div className="space-y-4 mt-3">
                {/* Categoría 1 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Cookies Técnicas y Estrictamente Necesarias
                    </span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Obligatorias
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    Son esenciales para la autenticación, prevención de ataques CSRF y persistencia de sesión segura mediante tokens JWT. No requieren consentimiento previo conforme a la ley, pero son completamente divulgadas.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600 border border-slate-200 rounded-lg">
                      <thead className="bg-slate-100 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2 border-b">Nombre</th>
                          <th className="p-2 border-b">Tipo</th>
                          <th className="p-2 border-b">Duración</th>
                          <th className="p-2 border-b">Propósito</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border-b font-mono font-bold text-emerald-800">refreshToken</td>
                          <td className="p-2 border-b">HttpOnly, Secure Cookie</td>
                          <td className="p-2 border-b">7 días</td>
                          <td className="p-2 border-b">Renovación de token de sesión con rotación criptográfica. Inaccesible vía JavaScript.</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono font-bold text-emerald-800">vetconnect_cookie_consent</td>
                          <td className="p-2">LocalStorage</td>
                          <td className="p-2">1 año</td>
                          <td className="p-2">Registro de la decisión de consentimiento del usuario.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Categoría 2 */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-sky-600" />
                      Cookies de Analíticas y Telemetría de Errores
                    </span>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Opcionales (Requieren Consentimiento)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    Nos permiten monitorear fallos técnicos, excepciones de frontend y calidad de conexión WebRTC sin recolectar datos personales identificables (cero PII). Solo se activan si usted da su consentimiento expreso en el banner.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600 border border-slate-200 rounded-lg">
                      <thead className="bg-slate-100 text-slate-700 font-semibold">
                        <tr>
                          <th className="p-2 border-b">Proveedor</th>
                          <th className="p-2 border-b">Tipo</th>
                          <th className="p-2 border-b">Propósito</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-bold text-slate-800">Sentry Error Tracking</td>
                          <td className="p-2">Telemetría anónima</td>
                          <td className="p-2">Detección de errores en tiempo de ejecución para evitar interrupciones en consultas clínicas.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                3. ¿Cómo configurar o revocar sus preferencias?
              </h2>
              <p className="text-slate-600">
                Usted puede modificar o restablecer su decisión respecto a las cookies opcionales en cualquier momento haciendo clic en el siguiente botón:
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetConsent}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs rounded-xl shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
                >
                  Restablecer Preferencias de Cookies
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                4. Canales de Contacto
              </h2>
              <p className="text-slate-600">
                Para dudas sobre esta política, comuníquese con el oficial de privacidad de Pinnacle Group S.A. a <a href="mailto:privacidad@vetconnect.com.ar" className="text-emerald-700 font-semibold underline">privacidad@vetconnect.com.ar</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer Legal */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Pinnacle Group S.A. • CUIT 30-71234567-8 • Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default CookiePolicy;
