export interface ParsedConsultationNotes {
  cleanNotes: string;
  cancellationReason: string | null;
  priority: 'ROJO' | 'AMARILLO' | 'VERDE' | null;
}

export interface FormatConsultationNotesParams {
  tier?: 'ROJO' | 'AMARILLO' | 'VERDE' | null;
  symptom: string;
  timeframe?: string | null;
  isRoutine?: boolean;
}

/**
 * Formats user symptom and triage priority into backend consultation notes string.
 * BUG-03: When it is a routine / preventive care consultation, timeframe duration
 * is explicitly omitted so that headers do not display awkward "(Hace menos de una hora)" suffixes.
 */
export function formatConsultationNotes({
  tier = 'VERDE',
  symptom,
  timeframe,
  isRoutine = false,
}: FormatConsultationNotesParams): string {
  const cleanSymptom = (symptom || '').trim() || 'Consulta médica general';
  const effectiveTier = isRoutine ? 'VERDE' : (tier || 'VERDE');

  // Routine checkup always has VERDE priority and never concatenates timeframe
  if (isRoutine || /rutina|preventiv|control general/i.test(cleanSymptom)) {
    return `[Prioridad: ${effectiveTier}] ${cleanSymptom}`;
  }

  const durationSuffix = timeframe && timeframe.trim() ? ` (${timeframe.trim()})` : '';
  return `[Prioridad: ${effectiveTier}] ${cleanSymptom}${durationSuffix}`;
}

/**
 * Sanitizes and parses consultation notes by removing internal technical tags
 * such as [Prioridad: ...], [Triage IA: ...] and [CANCELLED_...] (ADR-030).
 * Returns empathetic user-facing copy and translated cancellation reasons.
 */
export function parseConsultationNotes(rawNotes?: string | null): ParsedConsultationNotes {
  if (!rawNotes || !rawNotes.trim()) {
    return {
      cleanNotes: 'Consulta médica general',
      cancellationReason: null,
      priority: null,
    };
  }

  let text = rawNotes;
  let cancellationReason: string | null = null;
  let priority: 'ROJO' | 'AMARILLO' | 'VERDE' | null = null;

  // 1. Extract and remove [Prioridad: ...]
  const priorityMatch = text.match(/\[Prioridad:\s*(ROJO|AMARILLO|VERDE)\]/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toUpperCase() as 'ROJO' | 'AMARILLO' | 'VERDE';
    text = text.replace(priorityMatch[0], '');
  }

  // 2. Remove [Triage IA: ...]
  text = text.replace(/\[Triage IA:\s*[^\]]+\]/gi, '');

  // 3. Extract and remove cancellation tags
  if (text.includes('CANCELLED_TIMEOUT_NO_VET_AVAILABLE')) {
    cancellationReason = 'Tiempo de espera agotado: sin veterinarios disponibles en guardia.';
    text = text.replace(/\[?CANCELLED_TIMEOUT_NO_VET_AVAILABLE\]?/g, '');
  } else if (/\[CANCELLED_[^\]]+\]/i.test(text)) {
    cancellationReason = 'Consulta cancelada en guardia.';
    text = text.replace(/\[CANCELLED_[^\]]+\]/gi, '');
  }

  // 4. Clean extra spaces and punctuation
  let cleanNotes = text.trim().replace(/^[-–—:\s]+|[-–—:\s]+$/g, '') || 'Consulta médica general';

  // 5. BUG-03: Strip legacy or accidental timeframe suffixes from routine / preventive consultations
  if (/rutina|preventiv|control general/i.test(cleanNotes)) {
    cleanNotes = cleanNotes
      .replace(/\s*\([^)]*(?:hora|día|dia|ayer|hoy|semana|mes|tiempo|evolución|evolucion)[^)]*\)/gi, '')
      .trim();
  }

  return {
    cleanNotes: cleanNotes || 'Consulta médica general',
    cancellationReason,
    priority,
  };
}
