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
    description: 'Síomas leves, consultas de control o dudas de cuidado general.',
    colorBorder: 'border-[#609f9c]/45',
    colorBg: 'bg-[#edf6f4]',
    colorText: 'text-[#183c3a]',
    colorActive: 'ring-2 ring-[#609f9c] border-[#609f9c] bg-[#edf6f4]/80',
  },
  {
    value: 'AMARILLO',
    label: 'Prioridad Media (Amarillo)',
    badgeText: 'Moderada',
    description: 'Vómitos recurrentes, cojera aguda, decaimiento o diarrea.',
    colorBorder: 'border-[#d6b66f]',
    colorBg: 'bg-[#f8f0dc]',
    colorText: 'text-[#7a5813]',
    colorActive: 'ring-2 ring-[#c19e45] border-[#c19e45] bg-[#f8f0dc]/70',
  },
  {
    value: 'ROJO',
    label: 'Emergencia Crítica (Rojo)',
    badgeText: 'Riesgo Vital',
    description: 'Dificultad respiratoria, convulsiones, hemorragias o pérdida de conciencia.',
    colorBorder: 'border-[#ae4d45]/50',
    colorBg: 'bg-[#fbeee9]',
    colorText: 'text-[#ae4d45]',
    colorActive: 'ring-2 ring-[#ae4d45] border-[#ae4d45] bg-[#fbeee9]/80 animate-pulse',
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
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              isSelected
                ? opt.colorActive
                : `border-[#e4dfd2] bg-white hover:bg-[#fffbef] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${opt.colorBg} ${opt.colorText} border ${opt.colorBorder}`}>
                  {opt.badgeText}
                </span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#609f9c] bg-[#609f9c]' : 'border-[#d4cfc2]'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <h4 className="font-bold text-[#183c3a] text-sm">{opt.label}</h4>
              <p className="text-xs text-[#454e4e] mt-1 leading-relaxed">{opt.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
