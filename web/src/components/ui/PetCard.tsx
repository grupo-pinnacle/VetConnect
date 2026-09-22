import React from 'react';
import { PetCardProps } from '../../types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  onSelect,
  onRequestConsultation,
  selected = false,
  className = '',
  'data-testid': testId,
}) => {
  return (
    <div
      data-testid={testId || `pet-card-${pet.id}`}
      onClick={() => onSelect && onSelect(pet)}
      className={`bg-white rounded-xl border p-4 transition-all shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer ${
        selected ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-200'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <Avatar
          alt={pet.name}
          size="lg"
          data-testid={`pet-avatar-${pet.id}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base truncate">{pet.name}</h3>
            <Badge variant="neutral" size="sm">
              {pet.species}
            </Badge>
          </div>
          {pet.breed && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{pet.breed}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
            {pet.weightKg && (
              <span>
                <strong className="text-slate-800">{pet.weightKg}</strong> kg
              </span>
            )}
            {pet.sex && (
              <span>
                Sexo: <strong className="text-slate-800">{pet.sex}</strong>
              </span>
            )}
          </div>
          {pet.microchip && (
            <div className="mt-2 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
              CHIP: {pet.microchip}
            </div>
          )}
        </div>
      </div>

      {onRequestConsultation && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            data-testid={`request-consultation-${pet.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onRequestConsultation(pet);
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Iniciar Consulta
          </button>
        </div>
      )}
    </div>
  );
};
