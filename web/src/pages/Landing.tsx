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
  Star,
  Video,
  Lock,
  ChevronDown,
  ChevronUp,
  Heart,
  HelpCircle,
  Users,
  Award,
  QrCode,
  Building2,
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

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo funciona la receta médica con código QR en farmacias veterinarias?',
    answer:
      'Al concluir la teleconsulta, el médico veterinario matriculado genera la prescripción firmada digitalmente con un hash criptográfico SHA-256 conforme a la Ley 25.506. El código QR codifica un enlace único e inviolable a https://app.vetconnect.com.ar/prescriptions/:id, donde cualquier farmacia puede certificar en tiempo real la validez del documento y la habilitación del profesional.',
  },
  {
    question: '¿Qué cuadros clínicos requieren derivación inmediata a guardia física (Código Rojo)?',
    answer:
      'Casos de asfixia o dificultad respiratoria grave, politraumatismos con hemorragia activa, torsión o dilatación gástrica aguda, convulsiones prolongadas o pérdida de conciencia. El sistema de triage detecta estos síntomas críticos y recomienda la derivación urgente al hospital veterinario presencial más cercano con geolocalización asistida.',
  },
  {
    question: '¿Cómo se verifica la matrícula y habilitación de los médicos veterinarios?',
    answer:
      'Todo profesional que se registra en VetConnect pasa por una exhaustiva verificación manual y documental por parte de nuestro equipo de fiscalización clínica. Se contrasta el número de matrícula ante los Colegios Médicos Veterinarios provinciales y los padrones oficiales de SENASA antes de autorizar la apertura de agenda o la toma de guardias.',
  },
  {
    question: '¿Qué requerimientos técnicos se necesitan para realizar una videoconsulta?',
    answer:
      'Solo se requiere un teléfono inteligente o computadora con cámara web, micrófono y conexión a internet (4G, 5G o Wi-Fi). Nuestra tecnología WebRTC con LiveKit SFU adapta dinámicamente la resolución y el ancho de banda para asegurar audio claro e ininterrumpido incluso en zonas con cobertura celular reducida.',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<TriageScenario>(TRIAGE_SCENARIOS[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white" data-testid="landing-page">
      {/* 1. Header de Navegación Institucional */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/95 border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Logo e Isotipo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span
                  data-testid="brand-logo"
                  className="font-display font-extrabold text-xl text-slate-900 tracking-tight leading-none flex items-center gap-1.5"
                >
                  VetConnect
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Oficial
                  </span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 mt-0.5">
                  Telemedicina Veterinaria Argentina
                </span>
              </div>
            </div>

            {/* Enlaces de Navegación */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a
                href="#simulador"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
              >
                Simulador de Triage
              </a>
              <a
                href="#portales"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
              >
                Portales Clínicos
              </a>
              <a
                href="#caracteristicas"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
              >
                Servicios Médicos
              </a>
              <a
                href="#testimonios"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
              >
                Casos Clínicos
              </a>
              <a
                href="#app-mobile"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
              >
                App Móvil
              </a>
              <a
                href="#preguntas"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
              >
                Preguntas
              </a>
            </nav>
          </div>

          {/* Botones de Autenticación */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              data-testid="landing-login-button"
              onClick={() => navigate('/login')}
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              data-testid="landing-register-button"
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Asimétrico de Alto Impacto (Clinical Modernism) */}
      <main className="flex-1 flex flex-col items-center overflow-hidden">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Columna Izquierda: Mensaje de Valor y Social Proof */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Trust Badge SENASA con Pulso Dinámico */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                <span data-testid="trust-badge-senasa">Plataforma Homologada SENASA Ley 25.326</span>
              </div>

              {/* Título Principal de Alto Impacto */}
              <h1
                data-testid="hero-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.08] mb-6"
              >
                Atención veterinaria inmediata para quienes más amas.
              </h1>

              {/* Descripción Clínica Empática */}
              <p
                data-testid="hero-description"
                className="text-slate-600 text-base sm:text-lg lg:text-xl max-w-xl mb-8 leading-relaxed font-normal"
              >
                Conecta en minutos con médicos veterinarios acreditados vía videoconsulta de alta definición, emite recetas digitales con QR oficial y gestiona la salud clínica de tus mascotas 24/7.
              </p>

              {/* CTAs de Acción Rápida */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Consultar con un Veterinario</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#simulador"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Probar Simulador de Triage</span>
                </a>
              </div>

              {/* Píldora de Guardia Activa */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Guardia Activa en Todo el País • Respuesta en &lt; 3 min</span>
              </div>

              {/* Social Proof: Calificación y Avatares Veterinarios */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200/80 w-full max-w-lg">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-emerald-700 text-white text-xs font-bold shadow-sm">
                    SR
                  </div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-sky-700 text-white text-xs font-bold shadow-sm">
                    JS
                  </div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-teal-700 text-white text-xs font-bold shadow-sm">
                    MC
                  </div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-indigo-700 text-white text-xs font-bold shadow-sm">
                    LF
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Más de 12.000 consultas médicas resueltas con éxito
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: The Hero Visual Mockup (Videoconsulta Clínica High-Fidelity) */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              {/* Halos decorativos de fondo */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Ventana Flotante de Telemedicina */}
              <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl shadow-slate-900/40 text-white relative z-10">
                {/* Header de la Aplicación */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">VetConnect LiveKit SFU</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>EN CONSULTA VITAL</span>
                  </div>
                </div>

                {/* Paciente y Datos de Conexión */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div>
                    <h3 className="font-bold text-white text-sm">Milo (Golden Retriever)</h3>
                    <p className="text-[11px] text-slate-400">Tutor: Martín Rossi • Caso #2026-88</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                    1080p HD • 60 fps
                  </span>
                </div>

                {/* Pantalla de Video Activa Simil-WebRTC */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 aspect-video mb-4 flex items-center justify-center group">
                  {/* Fondo visual representativo de clínica veterinaria */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
                  
                  {/* Ilustración Vectorial Médica */}
                  <div className="flex flex-col items-center justify-center text-center p-4 z-0">
                    <div className="w-16 h-16 rounded-full bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mb-2">
                      <Stethoscope className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-white">Dra. Silvina Romero</p>
                    <p className="text-[10px] text-emerald-300 font-mono">M.P. 4492 • Guardia Activa</p>
                  </div>

                  {/* Miniatura PiP del Paciente Milo */}
                  <div className="absolute bottom-2.5 right-2.5 w-20 h-16 rounded-xl bg-slate-900/90 border border-slate-600/80 p-1.5 flex flex-col items-center justify-center z-20 shadow-lg">
                    <span className="text-xl">🐕</span>
                    <span className="text-[9px] font-bold text-slate-200 mt-0.5">Milo (32 kg)</span>
                  </div>

                  {/* Signos Vitales Flotantes */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      ❤️ 92 bpm
                    </span>
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-sky-400 border border-sky-500/30 flex items-center gap-1">
                      🫁 24 rpm
                    </span>
                  </div>
                </div>

                {/* Widget de Prescripción Rápida con QR Oficial */}
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Receta Digital Emitida</p>
                      <p className="text-[10px] text-slate-400">Amoxicilina 500mg • Validez SENASA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] border border-slate-700">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR ACTIVO</span>
                  </div>
                </div>

                {/* Botones de Control de Teleconsulta */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 cursor-pointer transition">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 cursor-pointer transition">
                    <Heart className="w-4 h-4 text-rose-400" />
                  </div>
                  <div
                    onClick={() => navigate('/login')}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-600/30"
                  >
                    <span>Ingresar a Consulta</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tira de Métricas Clave & Números de Impacto */}
        <section className="w-full bg-slate-900 text-white py-10 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-display">15.000+</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Pacientes Atendidos</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-display">&lt; 180s</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Tiempo Medio de Respuesta</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-display">100%</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Veterinarios Matriculados</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-display">24/7/365</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Guardia Ininterrumpida</p>
            </div>
          </div>
        </section>

        {/* 4. Simulador Clínico de Triage Inteligente (Consola Oscura de Alta Fidelidad) */}
        <section id="simulador" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden text-white">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Cabecera del Simulador */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Activity className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-white leading-tight">
                    Simulador Clínico de Triage Inteligente
                  </h2>
                  <p className="text-xs text-slate-400">
                    Protestá la respuesta del sistema ante distintas gravedades clínicas (ADR-024)
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                EN VIVO
              </span>
            </div>

            {/* Paso 1: Selector de Síntomas */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Seleccioná un cuadro clínico de prueba:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {TRIAGE_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenario(sc)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isSelected
                        ? sc.priority === 'ROJO'
                          ? 'border-rose-500 bg-rose-950/40 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                          : sc.priority === 'AMARILLO'
                          ? 'border-amber-500 bg-amber-950/40 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
                          : 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{sc.name}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          sc.priority === 'ROJO'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : sc.priority === 'AMARILLO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {sc.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {sc.symptom}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Paso 2: Respuesta Protocolizada del Sistema */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Respuesta protocolizada del sistema:
            </p>
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-850/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border ${
                    selectedScenario.priority === 'ROJO'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : selectedScenario.priority === 'AMARILLO'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{selectedScenario.priorityLabel}</span>
                </span>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Tiempo estimado: {selectedScenario.responseTime}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedScenario.description}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedScenario.priority === 'ROJO'
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      : selectedScenario.priority === 'AMARILLO'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  <span>{selectedScenario.ctaText}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sección de Portales Especializados por Rol (CTAs Tripartitos) */}
        <section id="portales" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mb-3">
              Portales Especializados por Rol
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Accede al entorno de trabajo correspondiente a tu perfil en el ecosistema VetConnect.
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            data-testid="cta-buttons-container"
          >
            {/* Tarjeta 1: Portal Tutores */}
            <button
              type="button"
              data-testid="cta-client-portal"
              onClick={() => navigate('/login')}
              className="group p-8 bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/25 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Portal Tutores
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Solicitar teleconsultas de guardia inmediata, gestionar historias clínicas y consultar recetas firmadas digitalmente.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 pt-4 border-t border-slate-100 w-full">
                <span>Ingresar como Tutor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Tarjeta 2: Portal Veterinarios */}
            <button
              type="button"
              data-testid="cta-vet-portal"
              onClick={() => navigate('/login')}
              className="group p-8 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md shadow-slate-900/25 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-slate-900 transition-colors">
                  Portal Veterinarios
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Atención de guardia telemática 24/7, videollamadas WebRTC cifradas de alta fidelidad y emisión de recetas oficiales con QR.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 pt-4 border-t border-slate-100 w-full">
                <span>Ingresar a Guardia</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Tarjeta 3: Panel Fiscalización */}
            <button
              type="button"
              data-testid="cta-admin-portal"
              onClick={() => navigate('/login')}
              className="group p-8 bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-6 shadow-md shadow-teal-700/25 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-teal-800 transition-colors">
                  Panel Administrador
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Validación exhaustiva de matrículas profesionales, auditoría clínica inmutable y fiscalización de directores técnicos.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-800 pt-4 border-t border-slate-100 w-full">
                <span>Auditoría de Matrículas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* 6. Bento Grid de Funcionalidades Médicas */}
        <section id="caracteristicas" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Ecosistema Integral de Salud Animal
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-3 mb-2">
              Ingeniería FAANG al servicio de la medicina veterinaria
            </h2>
            <p className="text-sm text-slate-600">
              Una plataforma diseñada con arquitectura de microservicios y streaming de ultra-baja latencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Span 2 (Guardia WebRTC LiveKit) */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white mb-3">
                  Videoconsultas WebRTC de Ultra-Baja Latencia
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl mb-6">
                  Infraestructura impulsada por LiveKit SFU (Selective Forwarding Unit) con adaptación dinámica de bitrate. Permite transmisiones fluidas en 1080p sin cortes, optimizadas para redes celulares 4G/5G en toda Argentina.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cero latencia de audio
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cifrado 256-bit SSL
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Preservación estricta de PII
                </span>
              </div>
            </div>

            {/* Card 2: Recetas Digitales SENASA */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-6">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-3">
                  Recetas Oficiales con Código QR
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Prescripciones con hash criptográfico SHA-256 bajo la Ley 25.506. Código QR verificable públicamente por cualquier farmacia sin inicio de sesión.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-teal-700">
                Homologado SENASA Res. 1442/2021
              </div>
            </div>

            {/* Card 3: Historias Clínicas Inmutables */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-3">
                  Historias Clínicas Inmutables
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  Trazabilidad de consultas y signos vitales mediante soft-deletes regulados bajo la Ley 25.326. Garantía de auditoría judicial por 10 años sin borrado físico de datos médicos.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-sky-700">
                Ley 25.326 de Protección de Datos
              </div>
            </div>

            {/* Card 4: Span 2 (Validación de Matrículas Profesionales) */}
            <div className="md:col-span-2 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-8 rounded-3xl border border-emerald-900/50 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white mb-3">
                  Verificación Rigurosa de Matrícula Profesional
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl mb-6">
                  Proceso obligatorio de auditoría administrativa previa. Ningún veterinario puede tomar turnos sin haber validado su matrícula ante el Colegio de Médicos Veterinarios correspondiente (CVPBA, FeVA).
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Aprobación por Directores Técnicos
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Registro Provincial y Nacional
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Casos de Éxito & Testimonios Clínicos Reales */}
        <section id="testimonios" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Historias Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-3 mb-2">
              Familias y profesionales que confían en VetConnect
            </h2>
            <p className="text-sm text-slate-600">
              Respuestas médicas oportunas que salvan vidas todos los días.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Testimonio 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 italic">
                  &ldquo;Milo ingirió chocolate en plena medianoche. Entré en pánico pero gracias al triage en Código Amarillo nos atendió la Dra. Silvina en menos de 5 minutos, indicándonos los pasos exactos y emitiendo la receta digital.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  MR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Martín Rossi</p>
                  <p className="text-[11px] text-slate-500">Tutor de Milo (Golden Retriever)</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 italic">
                  &ldquo;Vivo en el interior de Buenos Aires y los traslados nocturnos son difíciles. La telemedicina con receta electrónica me permitió comprar los antibióticos para Luna de inmediato con el QR en la farmacia de guardia.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                  LF
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Lucía Fernández</p>
                  <p className="text-[11px] text-slate-500">Tutora de Luna (Felina Siamés)</p>
                </div>
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 italic">
                  &ldquo;Como profesional, la plataforma me brinda seguridad jurídica total. Las historias clínicas son inmutables, el consentimiento se asienta digitalmente y la receta con QR elimina la informalidad riesgosa de WhatsApp.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                  JS
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dr. Juan Pablo Suárez</p>
                  <p className="text-[11px] text-slate-500">Médico Veterinario (M.P. 5120)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Banner de Descarga de App Móvil Android */}
        <section
          id="app-mobile"
          data-testid="apk-download-banner"
          className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 space-y-4 z-10 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                <span>Aplicación Oficial para Android</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">
                Llevá la guardia veterinaria en tu bolsillo
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Diseñada con tecnología nativa React Native y Expo SDK 54. Notificaciones push inmediatas, videollamadas con cero latencia y carnet de vacunas accesible sin conexión.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Alertas de guardia en tiempo real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recetario digital sin conexión</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cifrado biométrico por hardware</span>
                </div>
              </div>
            </div>

            <div className="z-10 flex-shrink-0 w-full sm:w-auto">
              <a
                href="/downloads/vetconnect-preview.apk"
                download="vetconnect-preview.apk"
                data-testid="download-apk-link"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                <span>Descargar APK Android (.apk)</span>
              </a>
            </div>
          </div>
        </section>

        {/* 9. FAQ Accordion Interactivo */}
        <section id="preguntas" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Resolvemos tus Dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-3 mb-2">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-slate-600">
              Todo lo que necesitas saber sobre la telemedicina veterinaria en Argentina.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 10. Respaldo Institucional y Sellos de Garantía */}
        <section id="marco-legal" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left" data-testid="features-section">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
              Seguridad Jurídica, Ética & Garantía Oficial
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Desarrollado bajo los más estrictos estándares regulatorios de la República Argentina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                  <FileText className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                  Recetas Oficiales con Firma QR
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Emisión digital bajo normativa SENASA Res. 1442/2021 y Ley 25.506 de Firma Digital. Trazabilidad completa y verificación instantánea en farmacias.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-700">
                Ley 25.506 • SENASA Oficial
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                  Protección de Datos & Zero PII
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cumplimiento total de la Ley 25.326 de Protección de Datos Personales. Los tokens WebRTC y logs de auditoría no transportan correos ni teléfonos privados.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-teal-700">
                Ley 25.326 • Privacidad Médica
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-5">
                  <Award className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                  Respaldo Técnico Institucional
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Desarrollado con estándares FAANG en el Polo Educativo de Mataderos por la Escuela Técnica Nº 20 D.E. 20 &ldquo;Carolina Muzilli&rdquo; (Taller de Proyectos Integrados III).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-sky-700">
                Educación Técnica Pública • CABA
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 11. Footer Hospitalario Corporativo */}
      <footer id="ayuda" className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-12 px-4 sm:px-8" data-testid="landing-footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
          {/* Columna 1: Marca & Propósito */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                VC
              </div>
              <span className="font-bold text-lg text-white tracking-tight">VetConnect Monorepo</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma Integral de Telemedicina Veterinaria & Gestión Clínica de Alta Disponibilidad. Regulada bajo normativa SENASA Res. 1442/2021.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistemas Operativos en Línea
            </div>
          </div>

          {/* Columna 2: Portales de Acceso */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Portales Clínicos</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition cursor-pointer">
                  Portal Tutores de Mascotas
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition cursor-pointer">
                  Portal Veterinarios de Guardia
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition cursor-pointer">
                  Panel de Fiscalización & Auditoría
                </button>
              </li>
              <li>
                <a href="#app-mobile" className="hover:text-white transition">
                  Descargar App Móvil Android
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Marco Regulatorio */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Normativa & Leyes</p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Resolución SENASA 1442/2021</li>
              <li>Ley 25.326 de Protección de Datos Personales</li>
              <li>Ley 25.506 de Firma Digital Argentina</li>
              <li>FeVA — Federación Veterinaria Argentina</li>
            </ul>
          </div>

          {/* Columna 4: Ámbito Académico */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Institución Educativa</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escuela Técnica Nº 20 D.E. 20 &ldquo;Carolina Muzilli&rdquo;<br />
              Taller de Proyectos Integrados III — 6° 2°<br />
              Cátedra Profs. Camila Lambertucci & Sebastian Anderson<br />
              Grupo Pinnacle 2026
            </p>
          </div>
        </div>

        {/* Disclaimer Legal & Copyright */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <p className="text-[11px] mb-4 sm:mb-0 max-w-2xl text-left">
            * Aviso de Emergencia: La telemedicina veterinaria no reemplaza la atención quirúrgica presencial ante traumatismos con hemorragia activa o riesgo inminente de vida.
          </p>
          <p className="text-[11px]">
            © {new Date().getFullYear()} VetConnect. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
