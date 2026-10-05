export type TriagePriority = 'ROJO' | 'AMARILLO' | 'VERDE';

export type SymptomDuration =
  | 'LESS_THAN_2_HOURS'
  | 'HOURS_2_TO_12'
  | 'DAYS_1_TO_2'
  | 'MORE_THAN_2_DAYS';

export interface TriageInput {
  pet?: {
    species?: string | null;
    breed?: string | null;
    allergies?: string | null;
    chronicConditions?: string | null;
    weightKg?: number | null;
  } | null;
  symptoms?: string[];
  duration?: SymptomDuration | string;
  notes: string;
}

export interface TriageEvaluation {
  priority: TriagePriority;
  severityScore: number; // 1 to 10
  isEmergency: boolean;
  redFlags: string[];
  summary: string;
  formattedNotes: string;
}

const CRITICAL_SYMPTOM_KEYS = new Set([
  'respiratory_distress',
  'seizures',
  'severe_trauma',
  'massive_bleeding',
  'gastric_dilation',
  'unconscious',
  'collapse',
  'poisoning',
]);

const MODERATE_SYMPTOM_KEYS = new Set([
  'persistent_vomiting',
  'acute_lameness',
  'deep_wound',
  'lethargy',
  'eye_injury',
  'fever',
  'diarrhea',
]);

const EMERGENCY_REGEX =
  /convulsi|ahog|no respira|dificultad respiratoria|asfixi|inconscient|desmay|paro\s|desangr|hemorragia|atropell|politraumat|cianosis|morad|shock|envenen|intoxicac|obstrucci|no puede orinar/i;

const URGENCY_REGEX =
  /vomit|diarrea|coje|renge|claudic|herida|corte|ojo|fiebre|decaid|apatic|no come|inapetent|dolor/i;

/**
 * AI-First Clinical Triage Engine (ADR-028)
 * Standardizes triage severity according to the Veterinary Triage Index (VTI)
 * and Manchester Triage System (MTS) principles.
 */
export function evaluateClinicalTriage(input: TriageInput): TriageEvaluation {
  const rawNotes = (input.notes || '').trim();

  // If priority was already manually set in notes (e.g. legacy mocks), preserve it
  const legacyMatch = rawNotes.match(/^\[Prioridad:\s*(ROJO|AMARILLO|VERDE)\]/i);
  if (legacyMatch) {
    const priority = legacyMatch[1].toUpperCase() as TriagePriority;
    const score = priority === 'ROJO' ? 9 : priority === 'AMARILLO' ? 6 : 2;
    return {
      priority,
      severityScore: score,
      isEmergency: priority === 'ROJO',
      redFlags: priority === 'ROJO' ? ['Prioridad crítica asignada'] : [],
      summary: `Clasificación previa: ${priority}`,
      formattedNotes: rawNotes,
    };
  }

  const symptoms = (input.symptoms || []).map((s) => s.toLowerCase());
  const redFlags: string[] = [];

  // 1. Check critical signs
  let hasCriticalSign = false;
  for (const s of symptoms) {
    if (CRITICAL_SYMPTOM_KEYS.has(s)) {
      hasCriticalSign = true;
      redFlags.push(`Signo crítico reportado: ${s.replace('_', ' ')}`);
    }
  }

  if (EMERGENCY_REGEX.test(rawNotes)) {
    hasCriticalSign = true;
    redFlags.push('Patrón semántico de emergencia vital detectado en descripción clínica');
  }

  // Species-specific vulnerability check (e.g., respiratory issues in brachycephalic dogs/cats)
  const isBrachycephalic =
    input.pet?.breed &&
    /bulldog|pug|boxer|persa|shih tzu|boston/i.test(input.pet.breed);
  if (isBrachycephalic && /respir|agitad|ronquid|ahog/i.test(rawNotes)) {
    hasCriticalSign = true;
    redFlags.push('Paciente braquicéfalo con compromiso respiratorio agudo');
  }

  // 2. Check moderate signs
  let hasModerateSign = false;
  for (const s of symptoms) {
    if (MODERATE_SYMPTOM_KEYS.has(s)) {
      hasModerateSign = true;
    }
  }
  if (URGENCY_REGEX.test(rawNotes)) {
    hasModerateSign = true;
  }

  // Duration aggravation
  const isExtendedDuration =
    input.duration === 'DAYS_1_TO_2' || input.duration === 'MORE_THAN_2_DAYS';

  let priority: TriagePriority = 'VERDE';
  let severityScore = 2;
  let summary = 'Consulta general / Cuadro de baja complejidad clínica';

  if (hasCriticalSign) {
    priority = 'ROJO';
    severityScore = 9;
    summary = 'EMERGENCIA VITAL — Riesgo fisiológico inminente detectado';
  } else if (hasModerateSign) {
    priority = 'AMARILLO';
    severityScore = isExtendedDuration ? 7 : 5;
    summary = isExtendedDuration
      ? 'URGENCIA MODERADA — Síntomas con evolución prolongada'
      : 'URGENCIA MODERADA — Signos agudos sin compromiso vital aparente';
  }

  const formattedNotes = `[Prioridad: ${priority}] [Triage IA: ${severityScore}/10] ${rawNotes}`;

  return {
    priority,
    severityScore,
    isEmergency: priority === 'ROJO',
    redFlags,
    summary,
    formattedNotes,
  };
}
