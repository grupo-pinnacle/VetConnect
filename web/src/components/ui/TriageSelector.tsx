import React from 'react';
import { TriageSelectorProps, TriagePriorityES } from '../../types';

interface TriageOption {
  value: TriagePriorityES;
  label: string;
  badgeText: string;
  description: string;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  colorActive: string;
}

const TRIAGE_OPTIONS: TriageOption[] = [
  {
    value: 'VERDE',
    label: 'Prioridad Baja (Verde)',
    badgeText: 'Rutina',
    description: 'Síntomas leves, consultas de control o dudas de cuidado general.',
    colorBorder: 'border-emerald-300',
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-800',
    colorActive: 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-50/80',
  },
  {
    value: 'AMARILLO',
    label: 'Prioridad Media (Amarillo)',
    badgeText: 'Moderada',
    description: 'Vómitos recurrentes, cojera aguda, decaimiento o diarrea.',
    colorBorder: 'border-amber-300',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-800',
    colorActive: 'ring-2 ring-amber-600 border-amber-600 bg-amber-50/80',
  },
  {
    value: 'ROJO',
    label: 'Emergencia Crítica (Rojo)',
    badgeText: 'Riesgo Vital',
    description: 'Dificultad respiratoria, convulsiones, hemorragias o pérdida de conciencia.',
    colorBorder: 'border-red-300',
    colorBg: 'bg-red-50',
    colorText: 'text-red-800',
    colorActive: 'ring-2 ring-red-600 border-red-600 bg-red-50/80 animate-pulse',
  },
];

export const TriageSelector: React.FC<TriageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  'data-testid': testId,
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Prioridad de Triage Clínico"
      data-testid={testId || 'triage-selector'}
      className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}
    >
      {TRIAGE_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            data-testid={`triage-option-${opt.value.toLowerCase()}`}
            onClick={() => onChange(opt.value)}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              isSelected
                ? opt.colorActive
                : `border-slate-200 bg-white hover:bg-slate-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.colorBg} ${opt.colorText} border ${opt.colorBorder}`}>
                  {opt.badgeText}
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">{opt.label}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{opt.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
