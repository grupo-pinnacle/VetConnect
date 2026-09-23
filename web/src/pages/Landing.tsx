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
} from 'lucide-react';

export type SpeciesType = 'DOG' | 'CAT' | 'EXOTIC';

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

const SPECIES_DATA: Record<
  SpeciesType,
  {
    label: string;
    emoji: string;
    scenarios: TriageScenario[];
  }
> = {
  DOG: {
    label: 'Perros',
    emoji: '🐶',
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
    emoji: '🐱',
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
    emoji: '🐰',
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
      className="min-h-screen bg-[#F9FBFA] flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white antialiased overflow-x-hidden"
      data-testid="landing-page"
    >
      {/* 1. Header Minimalista & Elegante (Estilo PagoFlex: Fondo Verde Bosque Intenso) */}
      <header className="sticky top-0 z-50 bg-[#023D2F] text-white px-4 sm:px-8 py-3.5 shadow-md">
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
              <div className="w-9 h-9 rounded-xl bg-[#00A86B] flex items-center justify-center text-white shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-white" aria-hidden="true" />
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
              <a href="#inicio" className="hover:text-white transition-colors">
                Inicio
              </a>
              <a href="#simulador" className="hover:text-white transition-colors">
                Triage
              </a>
              <a href="#portales" className="hover:text-white transition-colors">
                Portales
              </a>
              <a href="#preguntas" className="hover:text-white transition-colors">
                Preguntas frecuentes
              </a>
            </nav>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-3">
            {/* Badge de Argentina */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-white border border-white/10">
              <span>🇦🇷</span>
              <span>Argentina</span>
            </div>

            {/* Botón Iniciar Sesión (Texto limpio) */}
            <button
              type="button"
              data-testid="landing-login-button"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block text-sm font-semibold text-white hover:text-emerald-300 transition-colors px-3 py-1.5 cursor-pointer"
            >
              Iniciar sesión
            </button>

            {/* Botón Registrarse (Pill verde vibrante) */}
            <button
              type="button"
              data-testid="landing-register-button"
              onClick={() => navigate('/register')}
              className="bg-[#00D084] hover:bg-[#00b975] active:bg-[#00a86b] text-[#023D2F] font-bold text-xs sm:text-sm px-5 py-2 sm:py-2.5 rounded-full shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              Registrarse
            </button>

            {/* Botón Hamburguesa Móvil */}
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
          <div className="md:hidden border-t border-white/10 mt-3 pt-3 pb-2 px-2 space-y-2 text-sm text-slate-200">
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
              Simulador de Triage
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

      {/* 2. Hero Section Minimalista (Inspirado fielmente en PagoFlex) */}
      <main className="flex-1 flex flex-col items-center">
        <section id="inicio" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 relative">
          {/* Ondas decorativas de fondo (Líneas concéntricas sutiles estilo PagoFlex) */}
          <div className="absolute top-12 left-0 w-[500px] h-[500px] -z-10 pointer-events-none opacity-40">
            <svg viewBox="0 0 500 500" fill="none" className="w-full h-full stroke-emerald-200">
              <circle cx="100" cy="200" r="140" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="100" cy="200" r="220" strokeWidth="1.5" />
              <circle cx="100" cy="200" r="300" strokeWidth="1.5" strokeDasharray="6 6" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Columna Izquierda: Jerarquía Visual Limpia y Contundente */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
              {/* Pill Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E6F7F0] text-[#00875A] rounded-full text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#00A86B]" />
                <span data-testid="trust-badge-senasa">Tu mascota, en las mejores manos</span>
              </div>

              {/* Título Principal (Grande, rotundo, con verde de acento) */}
              <h1
                data-testid="hero-title"
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6"
              >
                Una atención médica <br />
                pensada para <br />
                <span className="text-[#00A86B]">tutores y veterinarios</span>
              </h1>

              {/* Subtítulo Despejado */}
              <p
                data-testid="hero-description"
                className="text-slate-600 text-base sm:text-lg max-w-lg mb-8 leading-relaxed font-normal"
              >
                Gestioná consultas de guardia, recetas digitales con QR y el historial de salud de tus mascotas desde una misma plataforma. Rápido, seguro y sin complicaciones.
              </p>

              {/* Botones Redondeados (Estilo PagoFlex: Crear Cuenta y Sobre VetConnect) */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-8 py-3.5 bg-[#023D2F] hover:bg-[#03513e] active:bg-[#022c22] text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-[#023D2F]/20 hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#portales"
                  className="px-8 py-3.5 bg-[#00875A] hover:bg-[#00744d] active:bg-[#006342] text-white font-bold text-sm sm:text-base rounded-full shadow-md transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Sobre VetConnect</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Tira de 4 Beneficios Minimalistas (Iconos y textos pequeños como PagoFlex) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200/80 w-full max-w-lg">
                <div className="flex flex-col items-start">
                  <Zap className="w-4 h-4 text-[#00A86B] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 leading-snug">Guardia 24hs</span>
                  <span className="text-[11px] text-slate-500">Respuesta &lt; 3 min</span>
                </div>
                <div className="flex flex-col items-start">
                  <MapPin className="w-4 h-4 text-[#00A86B] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 leading-snug">Disponible</span>
                  <span className="text-[11px] text-slate-500">En toda Argentina</span>
                </div>
                <div className="flex flex-col items-start">
                  <Lock className="w-4 h-4 text-[#00A86B] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 leading-snug">Tu información</span>
                  <span className="text-[11px] text-slate-500">Siempre protegida</span>
                </div>
                <div className="flex flex-col items-start">
                  <Award className="w-4 h-4 text-[#00A86B] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 leading-snug">Matriculados</span>
                  <span className="text-[11px] text-slate-500">100% Verificados</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: EL SMARTPHONE MOCKUP CON HOVER INTERACTIVO (IDÉNTICO A PAGOFLEX) */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-6">
              {/* Gran Círculo Pastel Verde Detrás del Celular */}
              <div className="absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] rounded-full bg-[#E3F5EE] -z-10 pointer-events-none" />

              {/* Contenedor del Celular con Hover Transform */}
              <div className="relative group/phone select-none cursor-pointer">
                {/* Badge Flotante Izquierdo: "Pedí guardia con tu celular" */}
                <div className="absolute -left-6 sm:-left-12 top-16 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 flex items-center gap-3 z-30 transition-transform duration-500 group-hover/phone:-translate-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Guardia veterinaria</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Médicos en línea</p>
                  </div>
                </div>

                {/* Badge Flotante Derecho: "Receta con QR oficial" */}
                <div className="absolute -right-4 sm:-right-8 bottom-16 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-100 z-30 transition-transform duration-500 group-hover/phone:translate-x-2">
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs font-bold text-slate-800">Receta con QR</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Lista para farmacias</p>
                </div>

                {/* CUERPO DEL SMARTPHONE (Se inclina y al hacer hover se endereza y agranda suavemente) */}
                <div className="w-[280px] sm:w-[305px] bg-slate-900 rounded-[44px] p-3 shadow-[0_30px_60px_-15px_rgba(2,61,47,0.35)] border-[5px] border-slate-800 text-white transform rotate-[-4deg] sm:rotate-[-5deg] group-hover/phone:rotate-0 group-hover/phone:scale-105 group-hover/phone:-translate-y-2 transition-all duration-500 ease-out">
                  {/* Dynamic Island / Notch */}
                  <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-slate-800 inline-block" />
                  </div>

                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 mb-2 text-[10px] text-slate-400 font-mono">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-slate-300" />
                      <Battery className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>

                  {/* Pantalla Interna (Blanca, limpia, estilo App Móvil Nativa) */}
                  <div className="bg-white rounded-[32px] p-4 text-slate-900 overflow-hidden">
                    {/* Header de la App */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-[#00A86B] flex items-center justify-center text-white">
                          <HeartPulse className="w-3 h-3" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 tracking-tight">VetConnect</span>
                      </div>
                      <Bell className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Tarjeta de Saldo / Paciente Activo (Fiel al estilo PagoFlex) */}
                    <div className="bg-[#023D2F] rounded-2xl p-3.5 text-white mb-3 shadow-sm">
                      <div className="flex justify-between items-center text-[10px] text-emerald-300 mb-0.5">
                        <span>Paciente en atención</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 rounded text-[9px] font-bold">Activo</span>
                      </div>
                      <p className="text-lg font-extrabold tracking-tight mb-2">Milo (Golden)</p>
                      
                      {/* Botones de Acción Rápida */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-emerald-800/80 text-center">
                        <div className="bg-white/10 hover:bg-white/20 rounded-xl p-1.5 transition">
                          <Video className="w-3.5 h-3.5 text-emerald-300 mx-auto mb-0.5" />
                          <span className="text-[8px] font-semibold text-white block">Consulta</span>
                        </div>
                        <div className="bg-white/10 hover:bg-white/20 rounded-xl p-1.5 transition">
                          <QrCode className="w-3.5 h-3.5 text-emerald-300 mx-auto mb-0.5" />
                          <span className="text-[8px] font-semibold text-white block">Recetas</span>
                        </div>
                        <div className="bg-white/10 hover:bg-white/20 rounded-xl p-1.5 transition">
                          <FileText className="w-3.5 h-3.5 text-emerald-300 mx-auto mb-0.5" />
                          <span className="text-[8px] font-semibold text-white block">Historial</span>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Últimos Movimientos / Consultas */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-700">Última atención</span>
                        <span className="text-[#00A86B] font-semibold">Ver todas</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                            SR
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800">Dra. Silvina Romero</p>
                            <p className="text-[9px] text-slate-400">Control digestivo favorable</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Finalizada
                        </span>
                      </div>
                    </div>

                    {/* Barra de Navegación Inferior del Móvil */}
                    <div className="flex justify-around items-center pt-2 border-t border-slate-100 text-[9px] text-slate-400">
                      <div className="text-[#00A86B] font-bold flex flex-col items-center">
                        <HeartPulse className="w-3 h-3 mb-0.5" />
                        <span>Inicio</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Activity className="w-3 h-3 mb-0.5" />
                        <span>Triage</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <FileText className="w-3 h-3 mb-0.5" />
                        <span>Recetas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Simulador de Triage Limpio & Despejado */}
        <section id="simulador" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00875A] bg-[#E6F7F0] px-3 py-1 rounded-full">
                  Atención Inteligente
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                  Simulador de Triage por Especie
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Elegí tu compañero y el síntoma para conocer la respuesta médica protocolizada.
                </p>
              </div>

              {/* Selector de Especies */}
              <div className="flex gap-2">
                {(['DOG', 'CAT', 'EXOTIC'] as SpeciesType[]).map((speciesKey) => {
                  const item = SPECIES_DATA[speciesKey];
                  const isSelected = selectedSpecies === speciesKey;
                  return (
                    <button
                      key={speciesKey}
                      type="button"
                      onClick={() => handleSpeciesChange(speciesKey)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#00875A] bg-[#E6F7F0] text-[#00875A]'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Síntomas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {currentSpeciesData.scenarios.map((sc) => {
                const isSelected = activeScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? sc.priority === 'ROJO'
                          ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500'
                          : sc.priority === 'AMARILLO'
                          ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                          : 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">{sc.name}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          sc.priority === 'ROJO'
                            ? 'bg-rose-100 text-rose-800'
                            : sc.priority === 'AMARILLO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sc.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{sc.symptom}</p>
                  </button>
                );
              })}
            </div>

            {/* Respuesta Protocolizada */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{activeScenario.priorityLabel}</span>
                  <span className="text-xs text-slate-500">• Espera: {activeScenario.responseTime}</span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">{activeScenario.description}</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-[#023D2F] hover:bg-[#03513e] text-white rounded-full font-bold text-xs shrink-0 cursor-pointer shadow-sm transition"
              >
                {activeScenario.ctaText} →
              </button>
            </div>
          </div>
        </section>

        {/* 4. Portales Especializados por Rol (CTAs Tripartitos) */}
        <section id="portales" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00875A] bg-[#E6F7F0] px-3 py-1 rounded-full">
              Ecosistema VetConnect
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-2">
              Un portal para cada rol
            </h2>
            <p className="text-sm text-slate-600">
              Accedé rápidamente según seas tutor de mascota, médico veterinario o administrador.
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

        {/* 5. Descarga App Móvil (Banner Minimalista) */}
        <section
          id="app-mobile"
          data-testid="apk-download-banner"
          className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="bg-[#023D2F] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
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
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00D084] hover:bg-[#00b975] text-[#023D2F] font-bold text-sm rounded-full shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar APK Android (.apk)</span>
            </a>
          </div>
        </section>

        {/* 6. Preguntas Frecuentes */}
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

        {/* 7. Marco Legal Ágil (features-section) */}
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
              <span>Escuela Técnica Nº 20 D.E. 20 &ldquo;Carolina Muzilli&rdquo;</span>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer Minimalista */}
      <footer
        id="ayuda"
        className="bg-[#023D2F] text-white pt-10 pb-8 px-4 sm:px-8"
        data-testid="landing-footer"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00A86B] flex items-center justify-center text-white font-bold text-xs">
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
