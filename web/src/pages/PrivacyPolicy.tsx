import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
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
            <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">VetConnect Legal</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full" id="main-content">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Política de Privacidad y Protección de Datos
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Conforme a la Ley Nacional N° 25.326 de la República Argentina • Última actualización: Septiembre 2026
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                1. Identidad y Domicilio del Responsable del Tratamiento
              </h2>
              <p className="text-slate-600">
                La plataforma <strong>VetConnect</strong> es desarrollada y operada por <strong>Pinnacle Group S.A.</strong> (CUIT: 30-71234567-8), con domicilio legal en Av. Santa Fe 1234, Ciudad Autónoma de Buenos Aires, República Argentina. Correo electrónico de privacidad: <a href="mailto:privacidad@vetconnect.com.ar" className="text-emerald-700 font-semibold underline">privacidad@vetconnect.com.ar</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                2. Principio de Minimización de Datos
              </h2>
              <p className="text-slate-600">
                En cumplimiento estricto del principio de minimización de datos (Art. 4, Ley 25.326), únicamente recolectamos la información indispensable para prestar el servicio de teleorientación veterinaria y emisión de recetas digitales:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 mt-2">
                <li><strong>Datos del Tutor:</strong> Nombre, apellido, correo electrónico y número telefónico de contacto.</li>
                <li><strong>Datos Clínicos del Paciente:</strong> Nombre de la mascota, especie, raza, peso estimado, número de microchip (opcional) e historial de consultas.</li>
                <li><strong>Datos Profesionales del Veterinario:</strong> Matrícula profesional habilitante, provincia de matriculación y estado de validación SENASA.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                3. Transmisión Segura y Cero PII en Streaming WebRTC
              </h2>
              <p className="text-slate-600">
                Las videollamadas se transmiten a través de túneles cifrados WebRTC / SFU (LiveKit). Los tokens de acceso no contienen datos de identificación personal (PII) como teléfonos o correos; únicamente viajan identificadores técnicos opacos y el nombre de pila. Las fotografías de lesiones y recetas se almacenan de forma protegida y su acceso requiere autenticación criptográfica.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                4. Conservación Sanitaria y Anonimización (Derecho al Olvido)
              </h2>
              <p className="text-slate-600">
                Por imperativo de la normativa sanitaria y el Código de Ética Veterinaria, las historias clínicas y recetas emitidas deben preservarse para trazabilidad médica. Si un usuario solicita la baja de su cuenta, el sistema ejecuta una <strong>eliminación lógica con anonimización irreversible</strong> de sus datos de contacto (nombre, email y teléfono), preservando los registros clínicos desvinculados de su identidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
              </h2>
              <p className="text-slate-600">
                El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses. Para ejercer estos derechos, envíe una comunicación a <a href="mailto:privacidad@vetconnect.com.ar" className="text-emerald-700 font-semibold underline">privacidad@vetconnect.com.ar</a> acompañando copia de su documento de identidad.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-3 text-xs text-emerald-900">
                <p className="font-bold">Información de la Autoridad de Control:</p>
                <p className="mt-1">
                  La Agencia de Acceso a la Información Pública (AAIP), en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas sobre protección de datos personales.
                </p>
              </div>
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

export default PrivacyPolicy;
