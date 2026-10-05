export interface ParsedConsultationNotes {
  cleanNotes: string;
  cancellationReason: string | null;
  priority: 'ROJO' | 'AMARILLO' | 'VERDE' | null;
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
  const cleanNotes = text.trim().replace(/^[-–—:\s]+|[-–—:\s]+$/g, '') || 'Consulta médica general';

  return {
    cleanNotes,
    cancellationReason,
    priority,
  };
}
