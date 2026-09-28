import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export const TermsConditions: React.FC = () => {
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
            <Scale className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">VetConnect Legal</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full" id="main-content">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Contrato de Adhesión y Servicio de Teleorientación Veterinaria • Última actualización: Septiembre 2026
              </p>
            </div>
          </div>

          {/* Banner de Descargo de Emergencia (Emergency Disclaimer) */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-8 flex items-start gap-3.5 text-amber-950">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-black uppercase tracking-wider text-amber-900 mb-1">
                Descargo de Responsabilidad por Emergencias Críticas
              </p>
              <p>
                <strong>VetConnect es una plataforma de teleorientación veterinaria, triaje primario y seguimiento.</strong> NO es un servicio hospitalario de urgencias de rescate animal. Si su mascota experimenta convulsiones continuas, hemorragias profusas, disnea severa (dificultad para respirar), abdomen hinchado y duro con arqueo, pérdida de conciencia o traumatismos vehiculares, <strong>acérquese de manera urgente a la clínica u hospital veterinario presencial de guardia 24 horas más próximo</strong>.
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-6">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                1. Información de la Entidad Titular
              </h2>
              <p className="text-slate-600">
                La plataforma <strong>VetConnect</strong> (en adelante, &quot;la Plataforma&quot;) es operada por <strong>Pinnacle Group S.A.</strong> (CUIT: 30-71234567-8), con domicilio legal constituido en Av. Santa Fe 1234, Ciudad Autónoma de Buenos Aires, República Argentina. Canal de contacto legal y regulatorio: <a href="mailto:legal@vetconnect.com.ar" className="text-emerald-700 font-semibold underline">legal@vetconnect.com.ar</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                2. Aceptación de los Términos
              </h2>
              <p className="text-slate-600">
                Al registrarse, acceder o utilizar cualquier funcionalidad de la Plataforma, el usuario (ya sea en calidad de tutor o de profesional veterinario) declara ser mayor de 18 años, contar con plena capacidad civil para contratar y aceptar expresamente estos Términos y Condiciones, así como la Política de Privacidad y la Política de Reembolsos.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                3. Alcance de los Servicios de Teleorientación
              </h2>
              <p className="text-slate-600">
                VetConnect provee infraestructura tecnológica de telecomunicaciones sincrónicas en tiempo real (video, audio de alta definición y mensajería encriptada) para interconectar a tutores con profesionales médicos veterinarios matriculados:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 mt-2">
                <li><strong>Triaje preliminar y pautas de alarma:</strong> Evaluación remota de síntomas no letales, orientación nutricional y conductual.</li>
                <li><strong>Seguimiento de tratamientos preexistentes:</strong> Control evolutivo de pacientes con diagnóstico previo emitido presencialmente.</li>
                <li><strong>Prescripción Digital Homologada:</strong> Emisión de recetas con firma electrónica y código QR verificable con validez conforme a la normativa de SENASA y los colegios profesionales veterinarios correspondientes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                4. Régimen de Responsabilidad Profesional (Ley 14.072)
              </h2>
              <p className="text-slate-600">
                Los médicos veterinarios registrados en VetConnect actúan en ejercicio libre e independiente de su profesión conforme a la Ley Nacional N° 14.072 y las normas deontológicas de los Colegios y Consejos Veterinarios de sus respectivas jurisdicciones. Cada profesional es el único y exclusivo responsable civil y deontológico del acto médico veterinario, de los diagnósticos presuntivos emitidos y de los fármacos recetados. VetConnect no interviene en el criterio clínico ni garantiza resultados médicos.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                5. Derechos del Consumidor y Derecho de Revocación (Ley 24.240)
              </h2>
              <p className="text-slate-600">
                En cumplimiento del Art. 34 de la Ley Nacional N° 24.240 de Defensa del Consumidor, el tutor tiene derecho irrestricto a revocar la solicitud de consulta con reintegro íntegro e inmediato en cualquier instante previo a que el médico veterinario inicie formalmente la sesión telemática.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                6. Propiedad Intelectual y Marcas
              </h2>
              <p className="text-slate-600">
                El software, código fuente, logotipos, arquitectura de bases de datos, marcas y elementos gráficos de VetConnect son propiedad exclusiva de Pinnacle Group S.A. o de sus licenciantes, encontrándose protegidos por la Ley Nacional de Propiedad Intelectual N° 11.723 y tratados internacionales. Queda terminantemente prohibida su reproducción, ingeniería inversa o explotación no autorizada.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                7. Ley Aplicable y Jurisdicción
              </h2>
              <p className="text-slate-600">
                Estos Términos se rigen e interpretan conforme a las leyes de la República Argentina. Para cualquier controversia judicial que no pueda ser resuelta mediante mediación previa prejudicial, las partes se someten a la jurisdicción de la Justicia Nacional Ordinaria en lo Comercial con asiento en la Ciudad Autónoma de Buenos Aires.
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

export default TermsConditions;
