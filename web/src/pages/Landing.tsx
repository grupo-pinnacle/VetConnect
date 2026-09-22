import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Stethoscope,
  Smartphone,
  Download,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  CheckCircle2,
  HeartPulse,
  Activity,
  Sparkles,
} from 'lucide-react';

interface TriageScenario {
  id: string;
  name: string;
  symptom: string;
  priority: 'ROJO' | 'AMARILLO' | 'VERDE';
  priorityLabel: string;
  responseTime: string;
  badgeStyle: string;
  description: string;
  ctaText: string;
}

const TRIAGE_SCENARIOS: TriageScenario[] = [
  {
    id: 'rojo',
    name: 'Emergencia Vital',
    symptom: 'Dificultad respiratoria aguda o traumatismo severo',
    priority: 'ROJO',
    priorityLabel: 'Código Rojo — Emergencia Vital Inmediata',
    responseTime: '< 3 minutos',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    description:
      'Posible compromiso de vías respiratorias, convulsiones activas o shock hemodinámico. Se prioriza la conexión con el médico de guardia en menos de 180 segundos.',
    ctaText: 'Solicitar Guardia Médica Inmediata (Código Rojo)',
  },
  {
    id: 'amarillo',
    name: 'Urgencia Prioritaria',
    symptom: 'Vómito aislado, fiebre o decaimiento marcado',
    priority: 'AMARILLO',
    priorityLabel: 'Código Amarillo — Urgencia Médica Prioritaria',
    responseTime: '< 15 minutos',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    description:
      'Cuadro clínico activo sin riesgo inminente de vida. Amerita valoración profesional pronta para pauta farmacológica e indicaciones higiénico-dietéticas.',
    ctaText: 'Ingresar a Guardia Telemática Prioritaria',
  },
  {
    id: 'verde',
    name: 'Control Regular',
    symptom: 'Revisión anual, plan de vacunación o desparasitación',
    priority: 'VERDE',
    priorityLabel: 'Código Verde — Consulta Preventiva / Regular',
    responseTime: 'Turno programado / Guardia general',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description:
      'Paciente clínicamente estable. Emisión de certificados de salud, prescripciones de control y seguimiento de tratamientos crónicos.',
    ctaText: 'Agendar Teleconsulta Programada',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<TriageScenario>(TRIAGE_SCENARIOS[0]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900" data-testid="landing-page">
      {/* 1. Header de Navegación Profesional */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Logo e Isotipo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <HeartPulse className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span
                  data-testid="brand-logo"
                  className="font-display font-extrabold text-xl text-slate-900 tracking-tight leading-none"
                >
                  VetConnect
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 mt-0.5">
                  Telemedicina Oficial
                </span>
              </div>
            </div>

            {/* Enlaces de Navegación */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a
                href="#simulador"
                className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
              >
                Simulador de Triage
              </a>
              <a
                href="#portales"
                className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
              >
                Portales Clínicos
              </a>
              <a
                href="#app-mobile"
                className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
              >
                App Móvil
              </a>
              <a
                href="#marco-legal"
                className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
              >
                Respaldo Legal SENASA
              </a>
            </nav>
          </div>

          {/* Botones de Autenticación */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              data-testid="landing-login-button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              data-testid="landing-register-button"
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section de Grado Clínico */}
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 text-center flex flex-col items-center">
          {/* Trust Badge SENASA */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
            <span data-testid="trust-badge-senasa">Plataforma Homologada SENASA Ley 25.326</span>
          </div>

          {/* Título Principal */}
          <h1
            data-testid="hero-title"
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.12] mb-6 max-w-4xl"
          >
            Telemedicina Veterinaria Inmediata para la Salud de tu Mascota
          </h1>

          {/* Descripción Empática */}
          <p
            data-testid="hero-description"
            className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mb-6 leading-relaxed font-normal"
          >
            Conecta en minutos con médicos veterinarios acreditados vía videoconsulta de alta definición, emite recetas digitales con QR oficial y gestiona la salud clínica de tus mascotas 24/7.
          </p>

          {/* Píldora de Red Activa en Vivo */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-sm text-xs font-medium text-slate-700 mb-10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>Guardia Veterinaria Activa en Todo el País • Respuesta en &lt; 3 min</span>
          </div>

          {/* 3. Signature Moment: Simulador Interactivo de Triage (En Vivo) */}
          <section
            id="simulador"
            className="w-full max-w-3xl bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-left mb-16 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Activity className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight">
                    Simulador Clínico de Triage Inteligente
                  </h2>
                  <p className="text-xs text-slate-500">
                    Protestá la respuesta del sistema ante distintas gravedades clínicas (ADR-024)
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md self-start sm:self-auto">
                EN VIVO
              </span>
            </div>

            {/* Selector de Síntomas */}
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Seleccioná un cuadro clínico de prueba:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
              {TRIAGE_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenario(sc)}
                    className={`p-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{sc.name}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          sc.priority === 'ROJO'
                            ? 'bg-rose-100 text-rose-700'
                            : sc.priority === 'AMARILLO'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sc.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {sc.symptom}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Tarjeta de Clasificación Reactiva */}
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Respuesta protocolizada del sistema:
            </p>
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${selectedScenario.badgeStyle}`}
                >
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{selectedScenario.priorityLabel}</span>
                </span>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Tiempo estimado: {selectedScenario.responseTime}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedScenario.description}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    selectedScenario.priority === 'ROJO'
                      ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600'
                      : selectedScenario.priority === 'AMARILLO'
                      ? 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600'
                      : 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600'
                  }`}
                >
                  <span>{selectedScenario.ctaText}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          {/* 4. Sección de Portales Clínicos (CTAs Tripartitos) */}
          <div className="w-full mb-16 text-center" id="portales">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mb-2">
              Portales Especializados por Rol
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-8">
              Accede al entorno de trabajo correspondiente a tu perfil en el ecosistema VetConnect.
            </p>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto"
              data-testid="cta-buttons-container"
            >
              {/* Tarjeta 1: Portal Tutores */}
              <button
                type="button"
                data-testid="cta-client-portal"
                onClick={() => navigate('/login')}
                className="group p-6 bg-gradient-to-b from-white to-blue-50/50 hover:to-blue-100/50 border border-slate-200 hover:border-blue-300 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
                    <HeartPulse className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    Portal Tutores
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Solicitar teleconsultas de guardia inmediata, gestionar historias clínicas y consultar recetas firmadas digitalmente.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                  <span>Ingresar como Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Tarjeta 2: Portal Veterinarios */}
              <button
                type="button"
                data-testid="cta-vet-portal"
                onClick={() => navigate('/login')}
                className="group p-6 bg-gradient-to-b from-white to-slate-50 hover:to-slate-100 border border-slate-200 hover:border-slate-400 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-4 shadow-sm shadow-slate-800/30 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1 group-hover:text-slate-800 transition-colors">
                    Portal Veterinarios
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Atención de guardia telemática 24/7, videollamadas WebRTC cifradas de alta fidelidad y emisión de recetas oficiales con QR.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span>Ingresar a Guardia</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Tarjeta 3: Panel Fiscalización */}
              <button
                type="button"
                data-testid="cta-admin-portal"
                onClick={() => navigate('/login')}
                className="group p-6 bg-gradient-to-b from-white to-emerald-50/50 hover:to-emerald-100/50 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-700/30 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                    Panel Administrador
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Validación exhaustiva de matrículas profesionales, auditoría clínica inmutable y fiscalización de directores técnicos.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>Auditoría de Matrículas</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* 5. Banner de Descarga de App Móvil Android */}
          <section
            id="app-mobile"
            data-testid="apk-download-banner"
            className="w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8 text-left relative overflow-hidden section-deferred"
          >
            {/* Decoración luminosa de fondo */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex-1 space-y-3 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Aplicación Oficial para Android</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                Llevá la guardia veterinaria en tu bolsillo
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Diseñada con tecnología nativa React Native y Expo SDK 54. Notificaciones push inmediatas, videollamadas con cero latencia y carnet de vacunas accesible sin conexión.
              </p>

              <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Alertas de guardia en tiempo real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recetario digital sin conexión</span>
                </div>
              </div>
            </div>

            <div className="z-10 flex-shrink-0 w-full sm:w-auto">
              <a
                href="/downloads/vetconnect-preview.apk"
                download="vetconnect-preview.apk"
                data-testid="download-apk-link"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                <span>Descargar APK Android (.apk)</span>
              </a>
            </div>
          </section>

          {/* 6. Respaldo Legal, Ética Médica & Seguridad */}
          <section id="marco-legal" className="w-full max-w-5xl mb-16 text-left section-deferred" data-testid="features-section">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">
                Seguridad Jurídica y Rigor Clínico
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Desarrollado bajo los más estrictos estándares regulatorios de la República Argentina.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjeta 1 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-base mb-2">
                    Recetas Oficiales con Firma QR
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Emisión digital bajo normativa SENASA Res. 1442/2021 y Ley 25.506 de Firma Digital. Trazabilidad completa y verificación instantánea en farmacias.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600">
                  Ley 25.506 • SENASA Oficial
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-base mb-2">
                    Protección de Datos & Zero PII
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cumplimiento total de la Ley 25.326 de Protección de Datos Personales. Los tokens WebRTC y logs de auditoría no transportan correos ni teléfonos privados.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-600">
                  Ley 25.326 • Privacidad Médica
                </div>
              </div>

              {/* Tarjeta 3 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Stethoscope className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-base mb-2">
                    Matrículas Profesionales Verificadas
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cada veterinario en plataforma es validado activamente contra colegios veterinarios provinciales (CVPBA) y registros nacionales oficiales.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600">
                  Fiscalización Activa 100%
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* 7. Footer Institucional */}
      <footer id="ayuda" className="bg-white border-t border-slate-200 py-10 px-6 text-center text-xs text-slate-500 section-deferred" data-testid="landing-footer">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              V
            </div>
            <span className="font-bold text-slate-800 tracking-tight">VetConnect Monorepo v2.0</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Proyecto desarrollado con estándares FAANG en el Polo Educativo de Mataderos (Escuela Técnica Nº 20 D.E. 20).
          </p>

          <p>© {new Date().getFullYear()} VetConnect. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
