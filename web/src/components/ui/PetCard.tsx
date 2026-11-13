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
      className={`bg-white rounded-3xl border p-4 transition-all shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer ${
        selected ? 'ring-2 ring-[#609f9c] border-[#609f9c]' : 'border-[#183c3a]/15'
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
            <h3 className="font-bold text-[#183c3a] text-base truncate">{pet.name}</h3>
            <Badge variant="neutral" size="sm">
              {pet.species}
            </Badge>
          </div>
          {pet.breed && (
            <p className="text-xs text-[#607674] truncate mt-0.5">{pet.breed}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-[#454e4e]">
            {pet.weightKg && (
              <span>
                <strong className="text-[#183c3a]">{pet.weightKg}</strong> kg
              </span>
            )}
            {pet.sex && (
              <span>
                Sexo: <strong className="text-[#183c3a]">{pet.sex}</strong>
              </span>
            )}
          </div>
          {pet.microchip && (
            <div className="mt-2 text-xs font-mono text-[#454e4e] bg-[#f2eddd]/60 px-2.5 py-0.5 rounded-full border border-[#e4dfd2] inline-block">
              CHIP: {pet.microchip}
            </div>
          )}
        </div>
      </div>

      {onRequestConsultation && (
        <div className="mt-4 pt-3 border-t border-[#e4dfd2]/70 flex justify-end">
          <button
            type="button"
            data-testid={`request-consultation-${pet.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onRequestConsultation(pet);
            }}
            className="px-4 py-1.5 bg-[#609f9c] hover:bg-[#315f5d] text-white rounded-full text-xs font-bold shadow-sm transition-colors"
          >
            Iniciar Consulta
          </button>
        </div>
      )}
    </div>
  );
};
