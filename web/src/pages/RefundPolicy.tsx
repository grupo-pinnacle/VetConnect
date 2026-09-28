import React from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, ArrowLeft, Clock, ShieldCheck, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';

export const RefundPolicy: React.FC = () => {
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
            <CircleDollarSign className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">VetConnect Legal</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full" id="main-content">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Política de Reembolsos y Cancelaciones
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Garantía de Servicio y Protección al Consumidor (Ley 24.240) • Última actualización: Septiembre 2026
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                1. Compromiso de Transparencia
              </h2>
              <p className="text-slate-600">
                En <strong>VetConnect</strong> (operado por <strong>Pinnacle Group S.A.</strong>, CUIT: 30-71234567-8) creemos en la transparencia total. Nuestra política de cancelaciones y reembolsos se basa en el cumplimiento estricto del Art. 34 de la Ley Nacional N° 24.240 de Defensa del Consumidor y en los Acuerdos de Nivel de Servicio (SLA) clínicos de nuestra plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                2. Supuestos de Reembolso Total Inmediato (100%)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/50">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Cancelación Voluntaria</h3>
                  <p className="text-xs text-slate-600">
                    Si el tutor cancela su solicitud mientras se encuentra en la sala de espera (estado <code>WAITING</code>), se reintegra el 100% de inmediato sin penalización.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/50">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Timeout de Triage (15 min)</h3>
                  <p className="text-xs text-slate-600">
                    Si transcurren 15 minutos en guardia sin que un veterinario colegiado tome el caso (ADR-024), el sistema cancela y devuelve el 100% del pago automáticamente.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/50">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Fallo Técnico Profesional</h3>
                  <p className="text-xs text-slate-600">
                    Si el veterinario sufre una desconexión y no reingresa dentro de la ventana de gracia de 3 minutos, se ofrece reintegro del 100% o reasignación prioritaria.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                3. Supuestos No Reembolsables
              </h2>
              <p className="text-slate-600">
                Una vez que la teleconsulta ha sido iniciada y completada efectivamente por el médico veterinario actuante, o si se ha emitido formalmente la historia clínica y/o receta médica digital, el servicio se considera consumado en su totalidad y no admitirá reembolso basado en discrepancias de criterio clínico diagnóstico, conforme a las pautas de los Colegios Médicos Veterinarios y la Ley 14.072.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                4. Plazos de Acreditación Bancaria
              </h2>
              <p className="text-slate-600">
                Los reembolsos aprobados se procesan en forma automática por nuestra pasarela de pagos en un plazo máximo de 24 a 72 horas hábiles. La acreditación final en su resumen bancario o saldo de cuenta dependerá de los tiempos de la entidad emisora de su tarjeta de crédito o débito.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                5. Canales de Reclamación y Soporte
              </h2>
              <p className="text-slate-600">
                Si experimentó algún inconveniente durante su atención y desea solicitar la revisión de su caso por el equipo de auditoría médica, escriba a <a href="mailto:soporte@vetconnect.com.ar" className="text-emerald-700 font-semibold underline">soporte@vetconnect.com.ar</a> indicando el ID de su consulta y el correo registrado.
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

export default RefundPolicy;
