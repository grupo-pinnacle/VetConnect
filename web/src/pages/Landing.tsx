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
  PhoneCall,
  Info,
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
  advice: string;
  ctaText: string;
}

const SPECIES_DATA: Record<
  SpeciesType,
  {
    label: string;
    emoji: string;
    petExample: string;
    scenarios: TriageScenario[];
  }
> = {
  DOG: {
    label: 'Perros',
    emoji: '🐶',
    petExample: 'Milo (Golden Retriever, 3 años)',
    scenarios: [
      {
        id: 'dog-rojo',
        name: 'Emergencia Vital',
        symptom: 'Dificultad respiratoria severa, abdomen hinchado y duro o convulsión activa',
        priority: 'ROJO',
        priorityLabel: 'Código Rojo — Atención Inmediata',
        responseTime: '< 3 minutos',
        description:
          'Signos de posible compromiso respiratorio, shock o torsión gástrica. Un veterinario de guardia te guiará de inmediato para estabilizarlo mientras te asiste en la derivación física si es requerida.',
        advice: 'Mantené la calma. No le des comida, agua ni medicamentos humanos. Colocalo de costado en un lugar seguro.',
        ctaText: 'Conectar con Guardia de Emergencia (Código Rojo)',
      },
      {
        id: 'dog-amarillo',
        name: 'Urgencia Prioritaria',
        symptom: 'Vómito reiterado, decaimiento marcado o ingesta de chocolate/cuerpo extraño',
        priority: 'AMARILLO',
        priorityLabel: 'Código Amarillo — Urgencia Prioritaria',
        responseTime: '< 15 minutos',
        description:
          'Cuadro clínico que requiere valoración médica pronta para definir medicación, hidratación y pautas de alarma antes de que se agrave.',
        advice: 'Anotá a qué hora comió o qué sustancias pudo haber ingerido. Tené a mano su carnet de vacunas.',
        ctaText: 'Ingresar a Guardia Médica Prioritaria',
      },
      {
        id: 'dog-verde',
        name: 'Consulta Preventiva',
        symptom: 'Control de rutina, plan de vacunación, desparasitación o picazón de piel',
        priority: 'VERDE',
        priorityLabel: 'Código Verde — Consulta Regular',
        responseTime: 'Atención en el día',
        description:
          'Tu perro está estable. Ideal para evacuar dudas de alimentación, emitir recetas de tratamientos crónicos o programar sus vacunas.',
        advice: 'Una consulta preventiva a tiempo previene el 80% de las complicaciones graves de salud.',
        ctaText: 'Agendar Consulta Preventiva',
      },
    ],
  },
  CAT: {
    label: 'Gatos',
    emoji: '🐱',
    petExample: 'Luna (Siamés, 2 años)',
    scenarios: [
      {
        id: 'cat-rojo',
        name: 'Emergencia Crítica',
        symptom: 'Intenta orinar y no puede (maúlla de dolor) o respira con la boca abierta',
        priority: 'ROJO',
        priorityLabel: 'Código Rojo — Emergencia Felina',
        responseTime: '< 3 minutos',
        description:
          'La obstrucción urinaria felina y la dificultad respiratoria son emergencias que ponen en riesgo la vida. Te conectamos al instante con el especialista.',
        advice: 'No lo presiones en el abdomen. Evitá ruidos fuertes y trasladalo en transportadora tapada con una toalla tibia.',
        ctaText: 'Solicitar Guardia Felina Inmediata',
      },
      {
        id: 'cat-amarillo',
        name: 'Urgencia Moderada',
        symptom: 'No come hace más de 24 horas, estornudos frecuentes o rascado intenso en orejas',
        priority: 'AMARILLO',
        priorityLabel: 'Código Amarillo — Atención en el Día',
        responseTime: '< 15 minutos',
        description:
          'Los gatos que dejan de comer corren riesgo de lipidosis hepática. Requiere indicación profesional de soporte y medicación.',
        advice: 'Ofrecele comida tibia muy aromática y verificá si tomó agua en las últimas horas.',
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
        advice: 'La telemedicina felina es "Fear-Free": cuida a tu gato en su territorio seguro y sin estrés.',
        ctaText: 'Agendar Consulta Felina Sin Estrés',
      },
    ],
  },
  EXOTIC: {
    label: 'Exóticos & Otros',
    emoji: '🐰',
    petExample: 'Tambor (Conejo Mini Lop, 1 año)',
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
        advice: 'Mantené su temperatura corporal abrigándolo suavemente. No fuerces comida sólida sin aval médico.',
        ctaText: 'Guardia Especialistas en Exóticos',
      },
      {
        id: 'exotic-amarillo',
        name: 'Urgencia Temprana',
        symptom: 'Lagrimeo ocular, secreción nasal, dificultad al masticar o heces más pequeñas',
        priority: 'AMARILLO',
        priorityLabel: 'Código Amarillo — Valoración Rápida',
        responseTime: '< 20 minutos',
        description:
          'Posible problema dental o respiratorio. Detección temprana para evitar cuadros complejos.',
        advice: 'Guardá una muestra de las heces y observá si consume heno fresco.',
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
        advice: 'El 90% de las patologías en exóticos se previenen con una nutrición adecuada basada en fibra.',
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
      'Al terminar la videollamada, el veterinario emite la receta con su firma digital y código QR oficial. Te llega inmediatamente por la plataforma y podés mostrarla directo desde tu celular en cualquier veterinaria o farmacia del país.',
  },
  {
    question: '¿Qué pasa si mi mascota tiene una emergencia grave que requiere cirugía?',
    answer:
      'Si el veterinario detecta riesgo vital inminente durante el triage o la videoconsulta, te indicará las maniobras de primeros auxilios y te conectará con el hospital veterinario de urgencias presenciales más cercano a tu domicilio.',
  },
  {
    question: '¿Quiénes son los veterinarios que atienden en VetConnect?',
    answer:
      'Son médicas y médicos veterinarios matriculados en Argentina, con su habilitación verificada ante sus respectivos Colegios Profesionales y SENASA. Podés ver su nombre completo y número de matrícula antes y durante la atención.',
  },
  {
    question: '¿Qué necesito para hacer la videoconsulta?',
    answer:
      'Solo tu celular o computadora con cámara y conexión a internet. La plataforma ajusta la calidad de video automáticamente para que se escuche y se vea claro incluso con poca señal celular.',
  },
  {
    question: '¿Por qué la telemedicina es una opción "Fear-Free" (libre de estrés)?',
    answer:
      'Muchos perros y gatos sufren fobia al viaje en auto, a la transportadora o a los olores de la sala de espera. En VetConnect tu mascota es evaluada en su sillón favorito, relajada y junto a vos.',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesType>('DOG');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('dog-rojo');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Obtener escenarios de la especie activa
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
      className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white"
      data-testid="landing-page"
    >
      {/* 1. Header de Navegación Humano y Accesible */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo e Isotipo */}
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl"
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              title="VetConnect — Inicio"
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

            {/* Enlaces de Navegación en Desktop */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
              <a
                href="#simulador"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1.5 py-1"
              >
                Simulador de Triage
              </a>
              <a
                href="#portales"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1.5 py-1"
              >
                Portales de Acceso
              </a>
              <a
                href="#servicios"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1.5 py-1"
              >
                ¿Cómo Funciona?
              </a>
              <a
                href="#testimonios"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1.5 py-1"
              >
                Historias Reales
              </a>
              <a
                href="#preguntas"
                className="hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1.5 py-1"
              >
                Preguntas
              </a>
            </nav>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-3">
            {/* Indicador sutil de guardia activa */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Guardia 24hs Activa</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="landing-login-button"
                onClick={() => navigate('/login')}
                className="px-3.5 py-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                data-testid="landing-register-button"
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
              >
                Registrarse
              </button>
            </div>

            {/* Botón de Menú Móvil */}
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Drawer de Navegación Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 mt-3 pt-3 pb-2 px-2 animate-fadeIn space-y-1">
            <a
              href="#simulador"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Simulador de Triage por Especie
            </a>
            <a
              href="#portales"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Portales Clínicos (Tutores y Vets)
            </a>
            <a
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              ¿Cómo Funciona el Servicio?
            </a>
            <a
              href="#testimonios"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Historias de Pacientes
            </a>
            <a
              href="#app-mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Descargar App Android (.apk)
            </a>
            <a
              href="#preguntas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Preguntas Frecuentes
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section Asimétrico y Cálido */}
      <main className="flex-1 flex flex-col items-center overflow-hidden">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Columna Izquierda: Copywriting Humano & Social Proof */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Badge de Plataforma Homologada y Fear-Free */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-full text-xs font-semibold shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span data-testid="trust-badge-senasa">Homologado SENASA • Res. 1442/2021</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-600/30" />
                  <span>Atención Fear-Free (Sin Estrés)</span>
                </div>
              </div>

              {/* Título Principal */}
              <h1
                data-testid="hero-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.12] mb-5"
              >
                Cuidamos a tu compañero con veterinarios matriculados en tiempo real.
              </h1>

              {/* Descripción Empática y Clara */}
              <p
                data-testid="hero-description"
                className="text-slate-600 text-base sm:text-lg max-w-xl mb-7 leading-relaxed font-normal"
              >
                Sin salas de espera ni el estrés de viajar en transportadora: videoconsultas de guardia las 24 horas, recetas digitales con QR oficial y orientación cálida desde la tranquilidad de tu hogar.
              </p>

              {/* CTAs Principales */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-7">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Iniciar Consulta Inmediata</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#simulador"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Simular Triage por Síntomas</span>
                </a>
              </div>

              {/* Social Proof Cálido: Avatares y Rating Real */}
              <div className="flex items-center gap-4 pt-5 border-t border-slate-200/80 w-full max-w-lg">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-emerald-700 text-white text-xs font-bold shadow-sm" title="Dra. Silvina Romero (Clínica Canina)">
                    SR
                  </div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-sky-700 text-white text-xs font-bold shadow-sm" title="Dr. Juan Pablo Suárez (Urgencias)">
                    JS
                  </div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-teal-700 text-white text-xs font-bold shadow-sm" title="Dra. Mariana Castro (Especialista Felina)">
                    MC
                  </div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white bg-indigo-700 text-white text-xs font-bold shadow-sm" title="Dra. Luciana Farías (Exóticos)">
                    LF
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">4.9 / 5</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Más de 12.000 tutores tranquilos y pacientes recuperados
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: The Hero Visual Mockup (Videoconsulta Real y Amigable) */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Ventana de Videoconsulta */}
              <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl shadow-slate-900/30 text-white relative z-10">
                {/* Cabecera de la llamada */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-[11px] font-mono text-slate-400 ml-1.5">Sala de Teleconsulta HD</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>EN DIRECTO</span>
                  </div>
                </div>

                {/* Info del Paciente */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>🐶 Milo (Golden Retriever)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Tutor: Martín Rossi • Caso #2026-88</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-emerald-300 rounded border border-slate-700">
                    Audio nítido • 1080p
                  </span>
                </div>

                {/* Pantalla de Video Simulado */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 aspect-video mb-3.5 flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent z-10" />

                  {/* Doctora en Pantalla */}
                  <div className="flex flex-col items-center justify-center text-center p-4 z-0">
                    <div className="w-14 h-14 rounded-full bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mb-1.5">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-bold text-white">Dra. Silvina Romero</p>
                    <p className="text-[10px] text-emerald-300 font-mono">M.P. 4492 • Especialista Canina</p>
                  </div>

                  {/* Miniatura PiP de Milo */}
                  <div className="absolute bottom-2.5 right-2.5 w-20 h-16 rounded-xl bg-slate-900/90 border border-slate-600 p-1 flex flex-col items-center justify-center z-20 shadow-lg">
                    <span className="text-lg">🐕</span>
                    <span className="text-[9px] font-bold text-slate-200 mt-0.5">Milo (3 años)</span>
                  </div>

                  {/* Vitals Flotantes */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      ❤️ 92 bpm
                    </span>
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-sky-400 border border-sky-500/30 flex items-center gap-1">
                      🫁 24 rpm
                    </span>
                  </div>
                </div>

                {/* Receta Emitida con QR */}
                <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Receta Digital Emitida</p>
                      <p className="text-[10px] text-slate-400">Amoxicilina 500mg • Lista para farmacia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] border border-slate-700">
                    <QrCode className="w-3 h-3" />
                    <span>QR VÁLIDO</span>
                  </div>
                </div>

                {/* Botón de Entrada Rápida */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-600/30"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Entrar a mi Videoconsulta</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tira de Métricas Humanas & Confianza */}
        <section className="w-full bg-slate-900 text-white py-8 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">15.000+</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Mascotas Atendidas con Éxito</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-display">&lt; 3 min</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Tiempo Medio de Conexión</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">100%</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Veterinarios Matriculados</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-display">24/7/365</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Guardia Activa Día y Noche</p>
            </div>
          </div>
        </section>

        {/* 4. Simulador Clínico de Triage Humanizado con Selector de Especie */}
        <section id="simulador" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-left">
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
                    Simulador Inteligente de Triage Clínico
                  </h2>
                  <p className="text-xs text-slate-400">
                    Seleccioná tu tipo de compañero y el síntoma para conocer la respuesta adecuada en segundos.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SIMULADOR ACTIVO
              </span>
            </div>

            {/* Pestañas de Especie */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                1. ¿A quién querés consultar hoy?
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(['DOG', 'CAT', 'EXOTIC'] as SpeciesType[]).map((speciesKey) => {
                  const item = SPECIES_DATA[speciesKey];
                  const isSelected = selectedSpecies === speciesKey;
                  return (
                    <button
                      key={speciesKey}
                      type="button"
                      onClick={() => handleSpeciesChange(speciesKey)}
                      className={`py-3 px-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-2 ring-emerald-500/50 shadow-md'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base sm:text-lg">{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Síntomas */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              2. Seleccioná el cuadro de salud que presenta:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {currentSpeciesData.scenarios.map((sc) => {
                const isSelected = activeScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isSelected
                        ? sc.priority === 'ROJO'
                          ? 'border-rose-500 bg-rose-950/50 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                          : sc.priority === 'AMARILLO'
                          ? 'border-amber-500 bg-amber-950/50 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
                          : 'border-emerald-500 bg-emerald-950/50 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
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
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {sc.symptom}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Respuesta Protocolizada */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-850/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border ${
                    activeScenario.priority === 'ROJO'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : activeScenario.priority === 'AMARILLO'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{activeScenario.priorityLabel}</span>
                </span>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  <span>Tiempo de respuesta: {activeScenario.responseTime}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeScenario.description}
              </p>

              {/* Caja de Consejo Humano Inmediato */}
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-300">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Consejo veterinario mientras esperás: </span>
                  <span>{activeScenario.advice}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeScenario.priority === 'ROJO'
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      : activeScenario.priority === 'AMARILLO'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  <span>{activeScenario.ctaText}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sección de Portales por Rol (CTAs Tripartitos) */}
        <section id="portales" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Accesos Directos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-2 mb-2">
              Portales Especializados por Rol
            </h2>
            <p className="text-sm text-slate-600">
              Ingresá al espacio diseñado específicamente para tus necesidades médicas o de cuidado.
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
              className="group p-7 bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Portal Tutores
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Pedí guardia médica al instante, gestioná la historia clínica de tus mascotas y recibí recetas con QR para comprar sin trámites.
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
              className="group p-7 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-md shadow-slate-900/25 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-slate-900 transition-colors">
                  Portal Veterinarios
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Tomá turnos de guardia telemática, realizá videollamadas con audio HD y emití recetas oficiales con respaldo legal SENASA.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 pt-4 border-t border-slate-100 w-full">
                <span>Ingresar a Guardia Médica</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Tarjeta 3: Panel Fiscalización */}
            <button
              type="button"
              data-testid="cta-admin-portal"
              onClick={() => navigate('/login')}
              className="group p-7 bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-5 shadow-md shadow-teal-700/25 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-2 group-hover:text-teal-800 transition-colors">
                  Panel Administrador
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Auditoría manual de matrículas profesionales, control de habilitaciones colegiadas y supervisión clínica integral.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-800 pt-4 border-t border-slate-100 w-full">
                <span>Auditar Matrículas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* 6. ¿Cómo Funciona? — 4 Pilares de Cuidado Real */}
        <section id="servicios" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simplicidad & Confianza
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-2 mb-2">
              Telemedicina fácil, rápida y sin vueltas
            </h2>
            <p className="text-sm text-slate-600">
              Diseñado pensando en la tranquilidad de tu familia y la salud de tu mascota.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Pilar 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  Videoconsulta Cara a Cara
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Mostrale a tu mascota en su ambiente, explicá qué le pasa y recibí la guía de un profesional sin moverte de casa.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> En HD y sin cortes
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  Recetas Oficiales con QR
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Te llega directo al teléfono. La farmacia o veterinaria escanea el código y te entrega el medicamento sin demoras.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Homologada por SENASA
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  Historial Médico Digital
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Todas las consultas, vacunas y diagnósticos de tus animales quedan guardados en su ficha. Nunca más un papel perdido.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold text-sky-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Seguro y siempre a mano
              </div>
            </div>

            {/* Pilar 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">
                  Veterinarios Matriculados
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Verificamos minuciosamente cada título y matrícula ante los Colegios Oficiales. Tu mascota en las mejores manos.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Profesionales Verificados
              </div>
            </div>
          </div>
        </section>

        {/* 7. Historias Reales de Tutores y Pacientes */}
        <section id="testimonios" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Testimonios Reales
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-2 mb-2">
              Familias que encontraron alivio y contención
            </h2>
            <p className="text-sm text-slate-600">
              La tranquilidad de saber que nunca estás solo cuando tu mascota lo necesita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Testimonio 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 italic">
                  &ldquo;Milo se comió una barra de chocolate de noche y estábamos desesperados. En menos de 4 minutos la Dra. Silvina nos estaba atendiendo, nos dio las indicaciones precisas de qué vigilar y nos mandó la receta digital. Nos salvó la noche.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  MR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Martín Rossi</p>
                  <p className="text-[11px] text-slate-500">Tutor de Milo (Golden Retriever)</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 italic">
                  &ldquo;Llevar a Luna en transportadora a la clínica era una pesadilla de maullidos y estrés. Con la teleconsulta la atendieron en mi cama, tranquila y ronroneando. Le recetaron sus gotas y las compré con el QR en la esquina.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                  LF
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Lucía Fernández</p>
                  <p className="text-[11px] text-slate-500">Tutora de Luna (Felina Siamés)</p>
                </div>
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 italic">
                  &ldquo;Como veterinario de guardia, la plataforma me da total respaldo profesional. El historial queda protegido, las recetas tienen validez legal y los tutores se sienten contenidos sin la angustia del tráfico nocturno.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
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
          className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 space-y-3 z-10 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                <span>App Móvil Oficial para Android</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                La salud de tu mascota, siempre en tu bolsillo
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Llevá las videoconsultas, las recetas oficiales y el carnet de vacunas estés donde estés. Notificaciones inmediatas cuando el veterinario esté listo.
              </p>
            </div>

            <div className="z-10 flex-shrink-0 w-full sm:w-auto">
              <a
                href="/downloads/vetconnect-preview.apk"
                download="vetconnect-preview.apk"
                data-testid="download-apk-link"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Descargar App Android (.apk)</span>
              </a>
            </div>
          </div>
        </section>

        {/* 9. FAQ Accordion Amigable y Claro */}
        <section id="preguntas" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-left">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Dudas Frecuentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-2 mb-2">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-slate-600">
              Respuestas directas para que consultes con total tranquilidad.
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

        {/* 10. Respaldo Institucional Ágil (features-section) */}
        <section
          id="marco-legal"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left"
          data-testid="features-section"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Recetas con Firma Digital QR</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Homologadas bajo normativa SENASA Res. 1442/2021 y Ley 25.506 para compra en farmacias.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Protección de Datos Personales</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Estricto cumplimiento de la Ley 25.326. Tu privacidad y la historia médica están resguardadas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Ingeniería Pública Argentina</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Desarrollado en la Escuela Técnica Nº 20 D.E. 20 &ldquo;Carolina Muzilli&rdquo; (Taller Proyectos Integrados III).
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 11. Footer Corporativo Hospitalario */}
      <footer
        id="ayuda"
        className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-10 px-4 sm:px-8"
        data-testid="landing-footer"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          {/* Columna 1: Marca & Propósito */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                VC
              </div>
              <span className="font-bold text-base text-white tracking-tight">VetConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de telemedicina veterinaria y gestión clínica con guardias 24hs y recetas con QR homologadas por SENASA.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Guardia Veterinaria Online
            </div>
          </div>

          {/* Columna 2: Portales de Acceso */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Portales</p>
            <ul className="space-y-1.5 text-xs text-slate-400">
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
                  Panel de Administración & Matrículas
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
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Marco Regulatorio</p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Resolución SENASA 1442/2021</li>
              <li>Ley 25.326 de Protección de Datos</li>
              <li>Ley 25.506 de Firma Digital Argentina</li>
              <li>Colegios de Médicos Veterinarios</li>
            </ul>
          </div>

          {/* Columna 4: Ámbito Académico */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Institución</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escuela Técnica Nº 20 D.E. 20 &ldquo;Carolina Muzilli&rdquo;<br />
              Taller de Proyectos Integrados III (6° 2°)<br />
              Cátedra Profs. Camila Lambertucci & Sebastian Anderson
            </p>
          </div>
        </div>

        {/* Disclaimer Legal & Copyright */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <p className="text-[11px] mb-3 sm:mb-0 max-w-2xl text-left">
            * Aviso de Emergencia: Ante traumatismos severos con hemorragia activa o paro cardiorrespiratorio, acudí de inmediato a la guardia física más cercana.
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
