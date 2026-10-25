import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClinicalIntakeForm } from '../components/dashboard/ClinicalIntakeForm';
import { TriagePage, TriageResult } from '../pages/ClientApp';
import api from '../services/api';
import { Pet } from '../types';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  getAccessToken: vi.fn(() => 'mock-token'),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', firstName: 'Lucia', lastName: 'Perez', role: 'CLIENT' },
    refreshSession: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockPets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Milo',
    species: 'Canino',
    breed: 'Beagle',
    weightKg: 12,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    ownerId: 'client-1',
  },
];

describe('BUG-03: Conditional Routine Checkup Logic (ClinicalIntakeForm)', () => {
  it('hides the duration section when only routine checkup is selected', () => {
    render(
      <ClinicalIntakeForm
        pets={mockPets}
        selectedPetId="pet-1"
        onSelectPet={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Initially, duration section is visible
    expect(screen.getByTestId('intake-duration-section')).toBeDefined();

    // Click "Control general / Dudas" (routine_checkup)
    const routineChip = screen.getByTestId('symptom-chip-routine_checkup');
    fireEvent.click(routineChip);

    // Duration section must be conditionally hidden for routine checkups
    expect(screen.queryByTestId('intake-duration-section')).toBeNull();
  });

  it('submits with default safe duration when routine checkup is selected without duration prompt', async () => {
    const handleSubmit = vi.fn();
    render(
      <ClinicalIntakeForm
        pets={mockPets}
        selectedPetId="pet-1"
        onSelectPet={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    // Select routine checkup
    fireEvent.click(screen.getByTestId('symptom-chip-routine_checkup'));

    // Submit form
    fireEvent.click(screen.getByTestId('intake-submit-button'));

    expect(handleSubmit).toHaveBeenCalledWith({
      petId: 'pet-1',
      notes: '',
      symptoms: ['routine_checkup'],
      duration: 'LESS_THAN_2_HOURS',
    });
  });
});

describe('FEAT-01: Option "Otro" in Clinical Intake (ClinicalIntakeForm)', () => {
  it('renders "Otro motivo / consulta" chip and requires custom notes before submitting', async () => {
    const handleSubmit = vi.fn();
    render(
      <ClinicalIntakeForm
        pets={mockPets}
        selectedPetId="pet-1"
        onSelectPet={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    // Check that "other" chip exists
    const otherChip = screen.getByTestId('symptom-chip-other');
    expect(otherChip).toBeDefined();

    // Select "other"
    fireEvent.click(otherChip);

    // Try submitting without filling notes
    fireEvent.click(screen.getByTestId('intake-submit-button'));

    // Must show validation error requiring notes
    const errorBanner = screen.getByTestId('intake-form-error');
    expect(errorBanner.textContent).toContain('Por favor describa el motivo o síntoma en las notas para continuar');
    expect(handleSubmit).not.toHaveBeenCalled();

    // Now fill in notes
    const textarea = screen.getByTestId('intake-notes-textarea');
    fireEvent.change(textarea, { target: { value: 'Presenta tos leve al correr y come poco' } });

    // Submit again
    fireEvent.click(screen.getByTestId('intake-submit-button'));

    expect(handleSubmit).toHaveBeenCalledWith({
      petId: 'pet-1',
      notes: 'Presenta tos leve al correr y come poco',
      symptoms: ['other'],
      duration: 'HOURS_2_TO_12',
    });
  });
});

describe('BUG-03 & FEAT-01: Triage Flow in ClientApp (TriagePage & TriageResult)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      if (url === '/api/pets') {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: 'p1',
                name: 'Rocky',
                species: 'Canino',
                breed: 'Mestizo',
                birthDate: '2022-01-01',
                weightKg: 15,
                ownerId: 'u1',
                photoUrl: null,
                allergies: null,
                chronicConditions: null,
                createdAt: '2022-01-01',
                updatedAt: '2022-01-01',
              },
            ],
          },
        });
      }
      if (url === '/api/consultations/mine') {
        return Promise.resolve({
          data: { success: true, data: [] },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('skips timeframe step when "Control preventivo o consulta de rutina" is selected (BUG-03)', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TriagePage />
      </QueryClientProvider>
    );

    // Wait for pet query to resolve
    await waitFor(() => {
      expect(screen.getByText('¿Qué está pasando?')).toBeDefined();
    });

    // Step 0: Select "Control preventivo o consulta de rutina"
    const routineOption = screen.getByText('Control preventivo o consulta de rutina');
    fireEvent.click(routineOption);

    // Click "Continuar" to go to Step 1
    const continueBtn = screen.getByText(/Continuar/i);
    fireEvent.click(continueBtn);

    // Step 1: Select pet
    expect(screen.getByText('¿A quién vamos a ayudar?')).toBeDefined();
    const petBtn = screen.getByText('Rocky');
    fireEvent.click(petBtn);

    // Click "Continuar": BUG-03 must skip Step 2 ("¿Cuándo empezó?") and jump directly to Step 3 (TriageResult)
    fireEvent.click(screen.getByText(/Continuar/i));

    // Must be in Step 3 (TriageResult)
    expect(screen.queryByText('¿Cuándo empezó?')).toBeNull();
    expect(screen.getByText(/CONSULTA GENERAL · CÓDIGO VERDE/i)).toBeDefined();
    expect(screen.getByText(/Cuadro clínico estable/i)).toBeDefined();
  });

  it('renders custom text input when "Otro" is selected and disables continue until text is entered (FEAT-01)', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TriagePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('¿Qué está pasando?')).toBeDefined();
    });

    // Select "Otro"
    const otherOption = screen.getByText('Otro');
    fireEvent.click(otherOption);

    // Custom text input container must appear
    const customContainer = screen.getByTestId('triage-custom-symptom-container');
    expect(customContainer).toBeDefined();

    // Continue button must be disabled when custom text is empty
    const continueBtn = screen.getByRole('button', { name: /Continuar/i });
    expect(continueBtn.getAttribute('disabled')).not.toBeNull();

    // Type custom symptom
    const customInput = screen.getByTestId('triage-custom-symptom-input');
    fireEvent.change(customInput, { target: { value: 'Tiene un bultito en la pata' } });

    // Continue button is now enabled
    expect(continueBtn.getAttribute('disabled')).toBeNull();
  });

  it('submits consultation notes without timeframe suffix for routine checkups (BUG-03)', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 'cons-routine-001', status: 'WAITING' },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TriageResult
          evaluation={{
            tier: 'VERDE',
            badge: 'CONSULTA GENERAL · CÓDIGO VERDE',
            title: 'Cuadro clínico estable / Sin riesgo vital inminente.',
            description: 'No se identificaron signos de compromiso urgente.',
            estimate: 'Atención disponible hoy',
            isEmergency: false,
          }}
          symptom="Control preventivo o consulta de rutina"
          petId="p1"
          timeframe=""
          isRoutine={true}
          onRestart={vi.fn()}
        />
      </QueryClientProvider>
    );

    const connectBtn = screen.getByRole('button', { name: /Conectar con veterinario/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/consultations',
        expect.objectContaining({
          petId: 'p1',
          notes: '[Prioridad: VERDE] Control preventivo o consulta de rutina',
          symptoms: ['Control preventivo o consulta de rutina'],
          duration: 'LESS_THAN_2_HOURS',
        })
      );
    });

    // Ensure notes strictly did not append any (timeframe) suffix
    const callArgs = (api.post as any).mock.calls[0][1];
    expect(callArgs.notes).not.toContain('(');
    expect(callArgs.notes).not.toContain('Hace menos de una hora');
  });
});
