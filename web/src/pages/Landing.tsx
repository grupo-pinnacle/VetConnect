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
  Star,
  Video,
  ChevronDown,
  ChevronUp,
  Heart,
  Award,
  QrCode,
  Menu,
  X,
  Sparkles,
  Zap,
  MapPin,
  Lock,
  Bell,
  Wifi,
  Battery,
  PhoneCall,
  Volume2,
  Calendar,
  Check,
  AlertTriangle,
  PawPrint,
} from 'lucide-react';

export type SpeciesType = 'DOG' | 'CAT' | 'EXOTIC';
export type PhoneTabType = 'CALL' | 'PRESCRIPTION' | 'HISTORY';

export interface TriageScenario {
  id: string;
  name: string;
  symptom: string;
  priority: 'ROJO' | 'AMARILLO' | 'VERDE';
  priorityLabel: string;
  responseTime: string;
  description: string;
  ctaText: string;
}

const DogIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .18 1.6 1.6 2 2.5 2 .5 0 1-.2 1.5-.5" />
    <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.18 1.6-1.6 2-2.5 2-.5 0-1-.2-1.5-.5" />
    <path d="M8 14v.5" />
    <path d="M16 14v.5" />
    <path d="M11.25 16.25h1.5" />
    <path d="M5.42 9C6.4 5.5 8.9 5 12 5s5.6.5 6.58 4c.6 2.13.42 5.5-1.58 7.5-1.5 1.5-3 1.5-5 1.5s-3.5 0-5-1.5C5 14.5 4.82 11.13 5.42 9z" />
  </svg>
);

const CatIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 5c-4 0-7.5 2.5-7.5 6.5 0 2.5 1.5 4.5 3.5 5.5.5 1 2 2 4 2s3.5-1 4-2c2-1 3.5-3 3.5-5.5C19.5 7.5 16 5 12 5z" />
    <path d="M5.5 8.5L3 3l5.5 2.5" />
    <path d="M18.5 8.5L21 3l-5.5 2.5" />
    <circle cx="9.5" cy="11.5" r=".75" fill="currentColor" />
    <circle cx="14.5" cy="11.5" r=".75" fill="currentColor" />
    <path d="M11.25 14h1.5" />
    <path d="M8 13.5l-3-.5" />
    <path d="M16 13.5l3-.5" />
  </svg>
);

const RabbitIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M8 3c-1.5 0-2.5 3-2.5 6.5 0 2 .5 3.5 1.5 4.5" />
    <path d="M16 3c1.5 0 2.5 3 2.5 6.5 0 2-.5 3.5-1.5 4.5" />
    <path d="M12 9c-3.5 0-5.5 2.5-5.5 6 0 3 2.5 5 5.5 5s5.5-2 5.5-5c0-3.5-2-6-5.5-6z" />
    <circle cx="10" cy="14" r=".75" fill="currentColor" />
    <circle cx="14" cy="14" r=".75" fill="currentColor" />
    <path d="M11.5 16.5h1" />
  </svg>
);

const SPECIES_DATA: Record<
  SpeciesType,
  {
    label: string;
    Icon: React.FC<{ className?: string }>;
    scenarios: TriageScenario[];
  }
> = {
  DOG: {
    label: 'Perros',
    Icon: DogIcon,
    scenarios: [
      {
        id: 'dog-rojo',
        name: 'Emergencia Vital',
        symptom: 'Dificultad respiratoria severa, abdomen hinchado y duro o convulsiones',
        priority: 'ROJO',
        priorityLabel: 'Código Rojo — Atención Inmediata',
        responseTime: '< 3 minutos',
        description:
          'Signos de posible compromiso respiratorio o torsión gástrica. Un veterinario de guardia te guiará de inmediato para estabilizarlo mientras te asiste en la derivación física si es requerida.',
        ctaText: 'Conectar con Guardia de Emergencia',
      },
      {
        id: 'dog-amarillo',
        name: 'Urgencia Prioritaria',
        symptom: 'Vómito reiterado, decaimiento marcado o ingesta de alimento indebido',
        priority: 'AMARILLO',
        priorityLabel: 'Código Amarillo — Urgencia Prioritaria',
        responseTime: '< 15 minutos',
        description:
          'Cuadro clínico que requiere valoración pronta para definir medicación, hidratación y pautas de alarma antes de que se agrave.',
        ctaText: 'Ingresar a Guardia Médica',
      },
      {
        id: 'dog-verde',
        name: 'Consulta Preventiva',
        symptom: 'Control de rutina, plan de vacunación, desparasitación o picazón de piel',
        priority: 'VERDE',
        priorityLabel: 'Código Verde — Consulta Regular',
        responseTime: 'Atención en el día',
        description:
          'Tu perro está clínicamente estable. Ideal para evacuar dudas de alimentación, emitir recetas o programar vacunas.',
        ctaText: 'Agendar Consulta Preventiva',
      },
    ],
  },
  CAT: {
    label: 'Gatos',
    Icon: CatIcon,
    scenarios: [
      {
        id: 'cat-rojo',
        name: 'Emergencia Crítica',
        symptom: 'Intenta orinar y no puede (maúlla de dolor) o respira con boca abierta',
        priority: 'ROJO',
        priorityLabel: 'Código Rojo — Emergencia Felina',
        responseTime: '< 3 minutos',
        description:
          'La obstrucción urinaria felina y la dificultad respiratoria son emergencias que ponen en riesgo la vida. Te conectamos al instante con el especialista.',
        ctaText: 'Solicitar Guardia Felina Inmediata',
      },
      {
        id: 'cat-amarillo',
        name: 'Urgencia Moderada',
        symptom: 'No come hace más de 24 horas, estornudos o rascado intenso de orejas',
        priority: 'AMARILLO',
        priorityLabel: 'Código Amarillo — Atención en el Día',
        responseTime: '< 15 minutos',
        description:
          'Los gatos que dejan de comer corren riesgo de lipidosis hepática. Requiere indicación profesional pronta.',
        ctaText: 'Ingresar a Guardia de Urgencia',
      },
      {
        id: 'cat-verde',
        name: 'Chequeo & Hábitos',
        symptom: 'Consulta de comportamiento, cambio de alimento o renovación de antiparasitario',
        priority: 'VERDE',
        priorityLabel: 'Código Verde — Control Preventivo',
        responseTime: 'Atención en el día',
        description:
          'Evaluación de bienestar y nutrición desde la tranquilidad de su casa, evitando el estrés del traslado en transportadora.',
        ctaText: 'Agendar Consulta Felina Sin Estrés',
      },
    ],
  },
  EXOTIC: {
    label: 'Exóticos & Otros',
    Icon: RabbitIcon,
    scenarios: [
      {
        id: 'exotic-rojo',
        name: 'Emergencia de Especie',
        symptom: 'Falta total de ingesta y heces por más de 10 horas, o letargia severa',
        priority: 'ROJO',
        priorityLabel: 'Código Rojo — Estasis Digestiva',
        responseTime: '< 3 minutos',
        description:
          'En pequeños mamíferos herbívoros, la detención digestiva es una emergencia crítica. El profesional te orientará de inmediato.',
        ctaText: 'Guardia Especialistas en Exóticos',
      },
      {
        id: 'exotic-amarillo',
        name: 'Urgencia Temprana',
        symptom: 'Lagrimeo ocular, secreción nasal, dificultad al masticar o decaimiento',
        priority: 'AMARILLO',
        priorityLabel: 'Código Amarillo — Valoración Rápida',
        responseTime: '< 20 minutos',
        description:
          'Posible problema dental o respiratorio. Detección temprana para evitar cuadros complejos.',
        ctaText: 'Consultar Especialista en Exóticos',
      },
      {
        id: 'exotic-verde',
        name: 'Guía de Cuidados',
        symptom: 'Asesoramiento de hábitat, dieta balanceada de heno y control preventivo',
        priority: 'VERDE',
        priorityLabel: 'Código Verde — Bienestar y Nutrición',
        responseTime: 'Turno programado',
        description:
          'Conocé las necesidades específicas de tu especie para asegurarle una vida sana y feliz.',
        ctaText: 'Agendar Guía Nutricional',
      },
    ],
  },
};

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo me entregan la receta para comprar en la farmacia?',
    answer:
      'Al terminar la videollamada, el veterinario emite la receta con firma digital y código QR oficial (SENASA Res. 1442/2021). Te llega inmediatamente a tu cuenta y podés mostrarla desde tu celular en cualquier farmacia o veterinaria del país.',
  },
  {
    question: '¿Qué pasa si mi mascota tiene una emergencia quirúrgica grave?',
    answer:
      'Si el veterinario detecta riesgo vital inminente durante el triage o la consulta, te indicará las maniobras de primeros auxilios y te conectará con el hospital veterinario presencial de urgencias más cercano.',
  },
  {
    question: '¿Quiénes son los veterinarios que atienden en VetConnect?',
    answer:
      'Son profesionales matriculados en Argentina, con su habilitación verificada ante sus Colegios Oficiales y SENASA. Podés consultar su nombre y número de matrícula antes y durante la atención.',
  },
  {
    question: '¿Qué necesito para realizar la videoconsulta?',
    answer:
      'Solo tu celular o computadora con cámara y conexión a internet. La plataforma ajusta la calidad de video automáticamente para que la llamada sea nítida y sin cortes.',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesType>('DOG');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('dog-rojo');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneTab, setPhoneTab] = useState<PhoneTabType>('CALL');

  const currentSpeciesData = SPECIES_DATA[selectedSpecies];
  const activeScenario =
    currentSpeciesData.scenarios.find((s) => s.id === selectedScenarioId) ||
    currentSpeciesData.scenarios[0];

  const handleSpeciesChange = (species: SpeciesType) => {
    setSelectedSpecies(species);
    setSelectedScenarioId(SPECIES_DATA[species].scenarios[0].id);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div
      className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white antialiased overflow-x-hidden"
      data-testid="landing-page"
    >
      {/* 1. Header Flotante Moderno (Frosted Glass & Forest Green) */}
      <header className="sticky top-0 z-50 bg-[#03362A] text-white px-4 sm:px-8 py-3.5 shadow-md border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo e Isotipo */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl"
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              title="VetConnect — Inicio"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-[#03362A]" aria-hidden="true" />
              </div>
              <span
                data-testid="brand-logo"
                className="font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-1.5"
              >
                VetConnect
              </span>
            </div>

            {/* Enlaces de Navegación Centrales */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-200">
              <a href="#inicio" className="hover:text-emerald-300 transition-colors">
                Inicio
              </a>
              <a href="#simulador" className="hover:text-emerald-300 transition-colors">
                Orientador de Salud
              </a>
              <a href="#portales" className="hover:text-emerald-300 transition-colors">
                Portales
              </a>
              <a href="#preguntas" className="hover:text-emerald-300 transition-colors">
                Preguntas frecuentes
              </a>
            </nav>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-3">
            {/* Badge de Guardia Activa */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Guardia 24hs Activa</span>
            </div>

            {/* Iniciar Sesión */}
            <button
              type="button"
              data-testid="landing-login-button"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block text-sm font-semibold text-white hover:text-emerald-300 transition-colors px-3 py-1.5 cursor-pointer"
            >
              Iniciar sesión
            </button>

            {/* Registrarse (Pill verde vibrante) */}
            <button
              type="button"
              data-testid="landing-register-button"
              onClick={() => navigate('/register')}
              className="bg-[#00D084] hover:bg-[#05b876] active:bg-[#009c63] text-[#03362A] font-extrabold text-xs sm:text-sm px-5 py-2 sm:py-2.5 rounded-full shadow-md shadow-emerald-950/20 transition-all hover:scale-105 cursor-pointer"
            >
              Registrarse
            </button>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable en Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-900/60 mt-3 pt-3 pb-2 px-2 space-y-2 text-sm text-slate-200">
            <a
              href="#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white font-medium"
            >
              Inicio
            </a>
            <a
              href="#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white font-medium"
            >
              Orientador de Salud
            </a>
            <a
              href="#portales"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white font-medium"
            >
              Portales Especializados
            </a>
            <a
              href="#preguntas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white font-medium"
            >
              Preguntas Frecuentes
            </a>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-center py-2 text-white font-semibold hover:bg-white/10 rounded-lg"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section de Alta Fidelidad & Creatividad Original */}
      <main className="flex-1 flex flex-col items-center">
        <section id="inicio" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 relative">
          {/* Ondas orgánicas de fondo en verde menta */}
          <div className="absolute top-10 left-0 w-[550px] h-[550px] -z-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 500 500" fill="none" className="w-full h-full stroke-emerald-200">
              <circle cx="120" cy="220" r="160" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="120" cy="220" r="240" strokeWidth="1.5" />
              <circle cx="120" cy="220" r="320" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[680px]">
            {/* Columna Izquierda: Mensaje Contundente y Original (No Clon) */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
              {/* Badge Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F7F0] text-[#00875A] rounded-full text-xs font-bold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-ping" />
                <span data-testid="trust-badge-senasa">Telemedicina Homologada • SENASA Res. 1442/2021</span>
              </div>

              {/* Titular Principal Original */}
              <h1
                data-testid="hero-title"
                className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6"
              >
                El hospital veterinario <br />
                en tu casa, <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  cuando más importa.
                </span>
              </h1>

              {/* Subtítulo Empático */}
              <p
                data-testid="hero-description"
                className="text-slate-600 text-base sm:text-lg max-w-lg mb-8 leading-relaxed font-normal"
              >
                Conectá en menos de 3 minutos con médicos veterinarios matriculados por videollamada HD. Recetas oficiales con código QR, guardia activa 24/7 y cero estrés de sala de espera.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-[#03362A] hover:bg-[#044c3b] active:bg-[#022c22] text-white font-bold text-sm sm:text-base rounded-full shadow-xl shadow-[#03362A]/25 hover:shadow-2xl transition-all flex items-center gap-2.5 group cursor-pointer hover:scale-102"
                >
                  <span>Iniciar Consulta Inmediata</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-400" />
                </button>
                <a
                  href="#simulador"
                  className="px-7 py-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-[#00A86B]" />
                  <span>Orientador de Salud</span>
                </a>
              </div>

              {/* Tira de Disponibilidad Médica en Vivo */}
              <div className="flex items-center gap-4 pt-5 border-t border-slate-200/90 w-full max-w-lg">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full ring-2 ring-white bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    SR
                  </div>
                  <div className="w-8 h-8 rounded-full ring-2 ring-white bg-sky-700 text-white font-bold text-xs flex items-center justify-center">
                    JS
                  </div>
                  <div className="w-8 h-8 rounded-full ring-2 ring-white bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                    MC
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>8 Médicos de Guardia Conectados</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Tiempo medio de espera actual: ~2 min 40 seg</p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: EL SMARTPHONE REAL-SIZE CON ANIMACIÓN 3D HOVER & PANTALLA INTERACTIVA */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-4">
              {/* Gran Fondo Circular con Gradiente de Luz Suave */}
              <div className="absolute w-[440px] sm:w-[520px] h-[440px] sm:h-[520px] rounded-full bg-gradient-to-tr from-[#DDF4EA] via-[#E9F7F1] to-white/60 -z-10 pointer-events-none blur-sm" />

              {/* Grupo del Celular con Hover 3D */}
              <div className="relative group/phone select-none cursor-pointer">
                {/* 1. Badge Flotante Superior Izquierdo: Telemetría / Audio HD */}
                <div className="absolute -left-6 sm:-left-12 top-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 flex items-center gap-3 z-30 transition-all duration-500 group-hover/phone:-translate-x-3 group-hover/phone:-translate-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-extrabold text-slate-800">Audio HD • 18ms</span>
                    </div>
                    <p className="text-[10px] text-slate-500">WebRTC LiveKit SFU</p>
                  </div>
                </div>

                {/* 2. Badge Flotante Inferior Derecho: Receta Oficial con QR */}
                <div className="absolute -right-4 sm:-right-10 bottom-16 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-100 z-30 transition-all duration-500 group-hover/phone:translate-x-3 group-hover/phone:translate-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-[#E6F7F0] flex items-center justify-center text-[#00875A]">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Receta Oficial SENASA</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Hash criptográfico verificado</p>
                </div>

                {/* 3. Badge Flotante Notificación Push Superior Derecha */}
                <div className="hidden sm:flex absolute -right-6 top-8 bg-slate-900/90 text-white backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-lg z-30 items-center gap-2 text-[11px] border border-slate-700/80 transition-all duration-500 group-hover/phone:translate-y-[-4px]">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium">Dra. Romero se unió a la sala</span>
                </div>

                {/* CHASIS DEL SMARTPHONE TAMAÑO REAL (340px - 360px de ancho x 720px de alto) */}
                <div className="w-[325px] sm:w-[355px] min-h-[690px] bg-slate-950 rounded-[52px] p-3.5 shadow-[0_35px_80px_-15px_rgba(3,54,42,0.35)] border-[6px] border-slate-800 text-white transform rotate-[-3.5deg] group-hover/phone:rotate-0 group-hover/phone:scale-[1.03] group-hover/phone:-translate-y-3 transition-all duration-700 ease-out">
                  {/* Dynamic Island / Parlante */}
                  <div className="w-28 h-5 bg-black rounded-full mx-auto mb-2 flex items-center justify-between px-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8px] font-mono text-emerald-400">LIVE</span>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 mb-2 text-[11px] text-slate-400 font-mono">
                    <span className="font-bold text-slate-300">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-slate-300" />
                      <Battery className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>

                  {/* Pantalla Interna de la Aplicación VetConnect */}
                  <div className="bg-white rounded-[38px] p-4 text-slate-900 flex flex-col justify-between min-h-[620px] overflow-hidden shadow-inner">
                    {/* Header de la App en Pantalla */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#00A86B] flex items-center justify-center text-white shadow-sm">
                            <HeartPulse className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 tracking-tight leading-none">VetConnect</p>
                            <p className="text-[9px] text-emerald-700 font-medium">Clínica 24hs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                            EN GUARDIA
                          </span>
                          <Bell className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Selector de Pestañas Interactivas Dentro del Móvil */}
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-3 text-[10px] font-bold text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhoneTab('CALL');
                          }}
                          className={`py-1.5 rounded-lg transition-all ${
                            phoneTab === 'CALL' ? 'bg-white text-[#03362A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Llamada
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhoneTab('PRESCRIPTION');
                          }}
                          className={`py-1.5 rounded-lg transition-all ${
                            phoneTab === 'PRESCRIPTION' ? 'bg-white text-[#03362A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Receta QR
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhoneTab('HISTORY');
                          }}
                          className={`py-1.5 rounded-lg transition-all ${
                            phoneTab === 'HISTORY' ? 'bg-white text-[#03362A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Historial
                        </button>
                      </div>

                      {/* Contenido Dinámico de la Pantalla del Celular */}
                      {phoneTab === 'CALL' && (
                        <div className="space-y-3 animate-fadeIn">
                          {/* Ventana de Videollamada Activa */}
                          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-md flex items-center justify-center border border-slate-700">
                            {/* Doctora en Pantalla */}
                            <div className="flex flex-col items-center justify-center text-center p-3 z-10">
                              <div className="w-12 h-12 rounded-full bg-emerald-600/40 border border-emerald-400/60 flex items-center justify-center text-emerald-300 mb-1">
                                <Stethoscope className="w-6 h-6" />
                              </div>
                              <p className="text-xs font-bold text-white">Dra. Silvina Romero</p>
                              <p className="text-[10px] text-emerald-300 font-mono">M.P. 4492 • Guardia Activa</p>
                            </div>

                            {/* Miniatura PiP de Milo */}
                            <div className="absolute bottom-2 right-2 w-16 h-14 rounded-xl bg-slate-900/90 border border-slate-600 p-1 flex flex-col items-center justify-center z-20 shadow-md">
                              <PawPrint className="w-5 h-5 text-amber-400 mb-0.5" />
                              <span className="text-[8px] font-bold text-slate-200">Milo</span>
                            </div>

                            {/* Signos Vitales */}
                            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 text-[9px] font-mono">
                              <span className="px-1.5 py-0.5 bg-black/60 rounded text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> 92 bpm
                              </span>
                              <span className="px-1.5 py-0.5 bg-black/60 rounded text-sky-400 border border-sky-500/30 flex items-center gap-1">
                                <Activity className="w-2.5 h-2.5 text-sky-400" /> 24 rpm
                              </span>
                            </div>
                          </div>

                          {/* Tarjeta de Paciente Activo */}
                          <div className="bg-[#03362A] text-white rounded-2xl p-3 shadow-sm">
                            <div className="flex justify-between items-center text-[10px] text-emerald-300 mb-1">
                              <span>Paciente en Consulta</span>
                              <span className="font-mono text-emerald-400">04:32 min</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-white">Milo (Golden Retriever, 3 años)</h4>
                            <p className="text-[10px] text-slate-300">Tutor: Martín Rossi • Consulta digestiva</p>
                          </div>

                          {/* Controles de Llamada */}
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex flex-col items-center">
                              <Video className="w-4 h-4 text-emerald-600 mb-1" />
                              <span>Cámara</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex flex-col items-center">
                              <FileText className="w-4 h-4 text-sky-600 mb-1" />
                              <span>Receta</span>
                            </div>
                            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-col items-center">
                              <PhoneCall className="w-4 h-4 text-rose-600 mb-1" />
                              <span>Finalizar</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {phoneTab === 'PRESCRIPTION' && (
                        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2.5 animate-fadeIn">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                SENASA Res. 1442
                              </span>
                              <h4 className="font-bold text-xs text-slate-900 mt-1">Receta Médica Digital</h4>
                            </div>
                            <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                              <QrCode className="w-10 h-10 text-slate-800" />
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100 text-[10px] space-y-1">
                            <p className="font-bold text-slate-800">Rp/ Amoxicilina + Ácido Clavulánico</p>
                            <p className="text-slate-600">Dosis: 500mg cada 12hs por 7 días</p>
                            <p className="text-slate-400 text-[9px]">Dra. Silvina Romero • M.P. 4492</p>
                          </div>
                          <div className="text-[9px] text-emerald-700 flex items-center gap-1 font-semibold">
                            <Check className="w-3 h-3 text-emerald-600" /> Válida para farmacias veterinarias
                          </div>
                        </div>
                      )}

                      {phoneTab === 'HISTORY' && (
                        <div className="space-y-2 animate-fadeIn text-[10px]">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">Vacuna Séxtuple Canina</p>
                              <p className="text-slate-400 text-[9px]">Aplicada: 15 Ene 2026</p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                              Vigente
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">Antiparasitario Interno</p>
                              <p className="text-slate-400 text-[9px]">Próximo: 15 Oct 2026</p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">
                              Próximo
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón Inferior de Entrada Rápida */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full py-2.5 bg-[#03362A] hover:bg-[#044c3b] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <span>Entrar a mi Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tira de 4 Pilares de Salud (Minimalista & Espaciosa) */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm text-center">
            <div>
              <Zap className="w-6 h-6 text-[#00A86B] mx-auto mb-2" />
              <p className="text-lg font-extrabold text-slate-900 font-display">&lt; 3 minutos</p>
              <p className="text-xs text-slate-500 mt-0.5">Conexión de guardia médica</p>
            </div>
            <div>
              <MapPin className="w-6 h-6 text-[#00A86B] mx-auto mb-2" />
              <p className="text-lg font-extrabold text-slate-900 font-display">Nacional</p>
              <p className="text-xs text-slate-500 mt-0.5">Atención en toda Argentina</p>
            </div>
            <div>
              <Lock className="w-6 h-6 text-[#00A86B] mx-auto mb-2" />
              <p className="text-lg font-extrabold text-slate-900 font-display">Ley 25.326</p>
              <p className="text-xs text-slate-500 mt-0.5">Historias clínicas inmutables</p>
            </div>
            <div>
              <Award className="w-6 h-6 text-[#00A86B] mx-auto mb-2" />
              <p className="text-lg font-extrabold text-slate-900 font-display">100% Verificados</p>
              <p className="text-xs text-slate-500 mt-0.5">Veterinarios colegiados SENASA</p>
            </div>
          </div>
        </section>

        {/* 4. Orientador Rápido de Salud Animal (Cálido, Intuitivo y con Bordes Suaves) */}
        <section id="simulador" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-left">
          <div className="bg-gradient-to-b from-white to-[#F8FBF9] rounded-[36px] p-6 sm:p-10 shadow-[0_20px_50px_-12px_rgba(2,42,33,0.08)] border border-slate-200/80">
            {/* Cabecera Cálida y Humana */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-7">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00875A] bg-[#E6F7F0] px-3.5 py-1 rounded-full border border-emerald-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Orientador Rápido de Salud</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-display">
                  ¿Qué le pasa a tu compañero?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                  Elegí qué animal tenés y qué síntoma observás para saber en 10 segundos la atención recomendada.
                </p>
              </div>

              {/* Selector de Especies con Botones Suaves y Acolchados */}
              <div className="flex gap-2.5">
                {(['DOG', 'CAT', 'EXOTIC'] as SpeciesType[]).map((speciesKey) => {
                  const item = SPECIES_DATA[speciesKey];
                  const isSelected = selectedSpecies === speciesKey;
                  return (
                    <button
                      key={speciesKey}
                      type="button"
                      onClick={() => handleSpeciesChange(speciesKey)}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#00875A] bg-[#E6F7F0] text-[#00875A] shadow-sm ring-1 ring-[#00875A]/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <item.Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tarjetas de Síntomas con Bordes Curvos y Micro-interacciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
              {currentSpeciesData.scenarios.map((sc) => {
                const isSelected = activeScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-5 rounded-[24px] border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? sc.priority === 'ROJO'
                          ? 'border-rose-400 bg-rose-50/70 shadow-md shadow-rose-500/10 ring-2 ring-rose-400/50'
                          : sc.priority === 'AMARILLO'
                          ? 'border-amber-400 bg-amber-50/70 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/50'
                          : 'border-emerald-400 bg-emerald-50/70 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-400/50'
                        : 'border-slate-200/90 hover:border-slate-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-black text-slate-900 font-display">{sc.name}</span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          sc.priority === 'ROJO'
                            ? 'bg-rose-100 text-rose-800'
                            : sc.priority === 'AMARILLO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sc.priority === 'ROJO' ? (
                          <AlertCircle className="w-3 h-3 text-rose-700" />
                        ) : sc.priority === 'AMARILLO' ? (
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        )}
                        <span>{sc.priority === 'ROJO' ? 'Alerta' : sc.priority === 'AMARILLO' ? 'Urgente' : 'Control'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{sc.symptom}</p>
                  </button>
                );
              })}
            </div>

            {/* Respuesta Orientadora Inteligente con Bordes Suaves */}
            <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#022A21] via-[#03362A] to-[#022A21] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl shadow-emerald-950/15 border border-emerald-800/40">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm text-white font-display">{activeScenario.priorityLabel}</span>
                  <span className="text-xs text-emerald-300 font-mono">• Tiempo: {activeScenario.responseTime}</span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{activeScenario.description}</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-[#00D084] hover:bg-[#05b876] active:scale-[0.98] text-[#022A21] rounded-2xl font-black text-xs shrink-0 cursor-pointer shadow-md transition-all duration-150 flex items-center gap-1.5"
              >
                <span>{activeScenario.ctaText}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. Portales Especializados por Rol (CTAs Tripartitos) */}
        <section id="portales" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00875A] bg-[#E6F7F0] px-3 py-1 rounded-full">
              Ecosistema Integral
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-2">
              Un portal diseñado para tu rol
            </h2>
            <p className="text-sm text-slate-600">
              Ingresá al entorno específico correspondiente a tu perfil en VetConnect.
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
              className="p-8 bg-white hover:bg-emerald-50/30 border border-slate-200 hover:border-emerald-300 rounded-3xl shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E6F7F0] text-[#00875A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Portal Tutores</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Guardia inmediata, videoconsultas sin estrés y recetas oficiales con QR en tu teléfono.
                </p>
              </div>
              <span className="text-xs font-bold text-[#00875A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ingresar como Tutor →
              </span>
            </button>

            {/* Tarjeta 2: Portal Veterinarios */}
            <button
              type="button"
              data-testid="cta-vet-portal"
              onClick={() => navigate('/login')}
              className="p-8 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-3xl shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Portal Veterinarios</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Guardia telemática 24/7, atención con audio HD y emisión de recetas homologadas por SENASA.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ingresar a Guardia →
              </span>
            </button>

            {/* Tarjeta 3: Panel Fiscalización */}
            <button
              type="button"
              data-testid="cta-admin-portal"
              onClick={() => navigate('/login')}
              className="p-8 bg-white hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 rounded-3xl shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">Panel Administrador</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Auditoría manual de matrículas profesionales, control de habilitaciones y supervisión clínica.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Auditar Matrículas →
              </span>
            </button>
          </div>
        </section>

        {/* 6. Descarga App Móvil */}
        <section
          id="app-mobile"
          data-testid="apk-download-banner"
          className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="bg-[#03362A] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                App Oficial para Android
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                La salud de tu mascota, en tu bolsillo
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Accedé a guardias inmediatas, recetas con QR y notificaciones en tiempo real desde tu teléfono.
              </p>
            </div>

            <a
              href="/downloads/vetconnect-preview.apk"
              download="vetconnect-preview.apk"
              data-testid="download-apk-link"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00D084] hover:bg-[#05b876] text-[#03362A] font-bold text-sm rounded-full shadow-md transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Descargar APK Android (.apk)</span>
            </a>
          </div>
        </section>

        {/* 7. Preguntas Frecuentes */}
        <section id="preguntas" className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-left">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Respuestas rápidas para consultar con total tranquilidad.
            </p>
          </div>

          <div className="space-y-3">
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
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Respaldo Regulatorio (features-section) */}
        <section
          id="marco-legal"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left"
          data-testid="features-section"
        >
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Homologado por SENASA Res. 1442/2021</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Protección de Datos Personales (Ley 25.326)</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Pinnacle Group — Soluciones Audiovisuales &amp; Streaming</span>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer Minimalista */}
      <footer
        id="ayuda"
        className="bg-[#03362A] text-white pt-10 pb-8 px-4 sm:px-8 border-t border-emerald-900/50"
        data-testid="landing-footer"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00A86B] flex items-center justify-center text-[#03362A] font-bold text-xs">
              VC
            </div>
            <span className="font-bold text-white">VetConnect</span>
            <span className="text-slate-400">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-slate-300 text-xs">
            <button onClick={() => navigate('/login')} className="hover:text-white transition">
              Tutores
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition">
              Veterinarios
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition">
              Administración
            </button>
            <a href="#app-mobile" className="hover:text-white transition">
              App Móvil
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
