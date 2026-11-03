import { describe, it, expect } from 'vitest';
import { mapConsultationToConsult, BackendConsultation } from '../vet/mappers';

describe('Bugfix: Cálculo real de day en mapConsultationToConsult (mappers.ts)', () => {
  const baseConsultation: BackendConsultation = {
    id: 'cons-1',
    petId: 'pet-1',
    clientId: 'client-1',
    vetId: 'vet-1',
    status: 'COMPLETED',
    notes: '[Prioridad: Normal] Control general',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
  };

  it('debe asignar day: "Hoy" únicamente cuando startedAt o createdAt pertenece al día local actual', () => {
    const now = new Date();
    const todayConsult = mapConsultationToConsult({
      ...baseConsultation,
      id: 'cons-today',
      createdAt: now.toISOString(),
    });

    expect(todayConsult.day).toBe('Hoy');
  });

  it('NO debe asignar day: "Hoy" a consultas históricas de días anteriores ni fallar al pasarse como callback a Array.prototype.map', () => {
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 1); // Ayer

    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 7); // Hace 7 días

    const list: BackendConsultation[] = [
      { ...baseConsultation, id: 'cons-yesterday', createdAt: pastDate1.toISOString() },
      { ...baseConsultation, id: 'cons-old', createdAt: pastDate2.toISOString(), startedAt: pastDate2.toISOString() },
    ];

    // Simulamos el uso exacto en vetkit.tsx: array.map(mapConsultationToConsult)
    const mapped = list.map(mapConsultationToConsult);

    expect(mapped[0].day).not.toBe('Hoy');
    expect(mapped[0].day).toBe('Ayer');
    expect(mapped[1].day).not.toBe('Hoy');
    expect(mapped[1].day).toBe(mapped[1].date);
  });
});
