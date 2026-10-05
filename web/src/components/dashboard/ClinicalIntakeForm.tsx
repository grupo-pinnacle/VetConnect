import React, { useState } from 'react';
import {
  ClinicalIntakeFormProps,
  ClinicalSymptomKey,
  SymptomDuration,
} from '../../types';
import {
  AlertTriangle,
  Stethoscope,
  Clock,
  Activity,
  HeartPulse,
  Flame,
  ShieldAlert,
  HelpCircle,
  Eye,
  Bandage,
} from 'lucide-react';

interface SymptomChip {
  key: ClinicalSymptomKey;
  label: string;
  icon: React.ElementType;
  isCritical?: boolean;
}

const AVAILABLE_SYMPTOMS: SymptomChip[] = [
  { key: 'respiratory_distress', label: 'Dificultad para respirar / Ahogo', icon: HeartPulse, isCritical: true },
  { key: 'seizures', label: 'Convulsiones o desmayo', icon: ShieldAlert, isCritical: true },
  { key: 'severe_trauma', label: 'Traumatismo severo / Accidente', icon: AlertTriangle, isCritical: true },
  { key: 'massive_bleeding', label: 'Sangrado abundante / Hemorragia', icon: Flame, isCritical: true },
  { key: 'persistent_vomiting', label: 'Vómitos o diarrea reiterados', icon: Activity },
  { key: 'acute_lameness', label: 'Cojera / Dolor al apoyar', icon: Bandage },
  { key: 'lethargy', label: 'Decaimiento / Sin apetito', icon: Clock },
  { key: 'deep_wound', label: 'Herida o corte', icon: Bandage },
  { key: 'eye_injury', label: 'Problema en los ojos', icon: Eye },
  { key: 'routine_checkup', label: 'Control general / Dudas', icon: HelpCircle },
];

const DURATION_OPTIONS: Array<{ value: SymptomDuration; label: string }> = [
  { value: 'LESS_THAN_2_HOURS', label: 'Menos de 2 horas' },
  { value: 'HOURS_2_TO_12', label: 'Entre 2 y 12 horas' },
  { value: 'DAYS_1_TO_2', label: '1 a 2 días' },
  { value: 'MORE_THAN_2_DAYS', label: 'Más de 2 días' },
];

export const ClinicalIntakeForm: React.FC<ClinicalIntakeFormProps> = ({
  pets,
  selectedPetId,
  onSelectPet,
  onSubmit,
  isSubmitting = false,
  className = '',
  'data-testid': testId,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<ClinicalSymptomKey[]>([]);
  const [duration, setDuration] = useState<SymptomDuration>('HOURS_2_TO_12');
  const [notes, setNotes] = useState('');

  const toggleSymptom = (key: ClinicalSymptomKey) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const hasCriticalSymptom = selectedSymptoms.some(
    (key) => AVAILABLE_SYMPTOMS.find((s) => s.key === key)?.isCritical
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) {
      alert('Por favor seleccione una mascota');
      return;
    }
    if (!notes.trim() && selectedSymptoms.length === 0) {
      alert('Por favor describa los síntomas o seleccione al menos un signo clínico');
      return;
    }
    await onSubmit({
      petId: selectedPetId,
      notes: notes.trim(),
      symptoms: selectedSymptoms,
      duration,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid={testId || 'clinical-intake-form'}
      className={`bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 shadow-sm space-y-6 ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8E2D5]">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
          <Stethoscope className="w-5 h-5 text-[#03362A]" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Solicitar Teleconsulta Médica
          </h2>
          <p className="text-xs text-slate-500">
            Ingreso asistido a guardia virtual veterinaria 24hs (ADR-028)
          </p>
        </div>
      </div>

      {/* 1. Selección de Mascota */}
      <div>
        <label
          htmlFor="pet-select"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          Paciente / Mascota *
        </label>
        <select
          id="pet-select"
          value={selectedPetId}
          onChange={(e) => onSelectPet(e.target.value)}
          required
          data-testid="intake-pet-select"
          className="w-full px-3 py-2.5 bg-slate-50 border border-[#E8E2D5] rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#03362A]/20 transition"
        >
          <option value="" disabled>
            {pets.length === 0 ? 'No hay mascotas registradas' : 'Seleccione una mascota'}
          </option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.species} • {pet.breed})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Signos Clínicos Observados (Chips de Selección Rápida) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Signos o Molestias Observadas
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Marcá los signos que identificás para orientar al equipo médico:
        </p>
        <div
          role="group"
          aria-label="Signos clínicos observables"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {AVAILABLE_SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.key);
            const Icon = symptom.icon;
            return (
              <button
                key={symptom.key}
                type="button"
                onClick={() => toggleSymptom(symptom.key)}
                data-testid={`symptom-chip-${symptom.key}`}
                aria-pressed={isSelected}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? symptom.isCritical
                      ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400 shadow-sm'
                      : 'bg-[#03362A]/10 border-[#03362A] text-[#03362A] ring-1 ring-[#03362A] font-semibold shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected
                      ? symptom.isCritical
                        ? 'text-rose-600'
                        : 'text-[#03362A]'
                      : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{symptom.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Emergencia Crítica (Red Flag Alert) */}
      {hasCriticalSymptom && (
        <div
          role="alert"
          data-testid="intake-emergency-banner"
          className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-900 animate-pulse"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-bold">Aviso Clínico de Posible Emergencia Vital</p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Detectamos signos de alta criticidad. Mientras ingresás a la guardia virtual para
              recibir soporte inicial, te recomendamos preparar el traslado urgente al centro de
              atención presencial 24hs más próximo.
            </p>
          </div>
        </div>
      )}

      {/* 3. Tiempo de Evolución */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Tiempo Aproximado de Evolución *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDuration(opt.value)}
              data-testid={`duration-${opt.value.toLowerCase()}`}
              className={`py-2 px-2.5 text-center text-xs rounded-xl border transition cursor-pointer ${
                duration === opt.value
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-[#E8E2D5] text-slate-600 font-medium'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Descripción Libre en Lenguaje Natural */}
      <div>
        <label
          htmlFor="intake-notes"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          Motivo / Síntomas Observados *
        </label>
        <textarea
          id="intake-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describí los síntomas con claridad: cuándo comenzaron, apetito, decaimiento o cambios de conducta..."
          data-testid="intake-notes-textarea"
          className="w-full px-3 py-2.5 bg-slate-50 border border-[#E8E2D5] rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#03362A]/20 transition resize-none"
        />
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={isSubmitting || !selectedPetId}
        data-testid="intake-submit-button"
        className="w-full py-3 px-4 bg-[#03362A] hover:bg-[#02241C] text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        <Stethoscope className="w-4 h-4" aria-hidden="true" />
        {isSubmitting ? 'Evaluando síntomas e ingresando a guardia...' : 'Ingresar a Sala de Triage'}
      </button>
    </form>
  );
};
