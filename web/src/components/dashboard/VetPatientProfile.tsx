import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Pet, ApiResponse } from '../../types';
import { SpeciesIcon } from '../icons/SpeciesIcons';
import {
  X,
  Phone,
  Scale,
  QrCode,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';

interface VetPatientProfileProps {
  petId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VetPatientProfile: React.FC<VetPatientProfileProps> = ({ petId, isOpen, onClose }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !petId) {
      setPet(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get<ApiResponse<Pet>>(`/api/pets/${petId}`)
      .then((res) => {
        if (isMounted && res.data.success && res.data.data) {
          setPet(res.data.data);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
          setError(apiErr.response?.data?.error?.message || 'Error al cargar expediente del paciente');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, petId]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vet-drawer-title"
      data-testid="vet-patient-profile-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-[#183c3a]/55 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div className="bg-[#fffbef] w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-[#e4dfd2] animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-[#183c3a] to-[#315f5d] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-[#d9e8e4]" />
            </div>
            <div>
              <h2 id="vet-drawer-title" className="text-base font-extrabold tracking-tight">
                Contexto Clínico del Paciente
              </h2>
              <p className="text-[11px] text-[#d9e8e4]/90">Ficha médica de guardia en tiempo real</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-vet-drawer-button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar ficha"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3 text-[#607674]">
              <Loader2 className="w-8 h-8 text-[#609f9c] animate-spin" />
              <p className="text-xs font-semibold">Cargando expediente del paciente...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-[#fcece9] border border-[#e98b70]/45 text-[#ae4d45] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : pet ? (
            <>
              {/* Pet Card Header */}
              <div className="p-4 rounded-2xl bg-[#f2eddd] border border-[#e4dfd2] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#edf6f4] border border-[#609f9c]/30 text-[#315f5d] flex items-center justify-center shrink-0 shadow-inner">
                  <SpeciesIcon species={pet.species} className="w-7 h-7 text-[#315f5d]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#183c3a]">{pet.name}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fffbef] border border-[#e4dfd2] text-[#183c3a]">
                      {pet.species}
                    </span>
                  </div>
                  <p className="text-xs text-[#454e4e] font-medium">{pet.breed || 'Raza sin especificar'}</p>
                  <p className="text-[11px] text-[#607674] mt-1 flex items-center gap-2">
                    {pet.weightKg && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#9a621c]">
                        <Scale className="w-3 h-3 text-[#c88a2e]" />
                        {pet.weightKg} kg
                      </span>
                    )}
                    {pet.microchip && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#315f5d] font-bold">
                        <QrCode className="w-3 h-3 text-[#609f9c]" />
                        {pet.microchip}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Clinical Alerts */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#607674]">
                  Alertas Médicas & Riesgos
                </h4>

                {/* Allergies */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Alergias Conocidas
                    </span>
                  </div>
                  {pet.allergies ? (
                    <p className="text-xs font-bold text-amber-900 bg-amber-100/80 p-2 rounded-lg border border-amber-300">
                      {pet.allergies}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#607674] italic">Sin alergias reportadas en el expediente.</p>
                  )}
                </div>

                {/* Chronic Conditions */}
                <div className="p-3.5 rounded-xl bg-[#fcece9] border border-[#e98b70]/45 space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#ae4d45]" />
                    <span className="text-xs font-bold text-[#183c3a] uppercase tracking-wide">
                      Condición Crónica / Diagnóstico Previo
                    </span>
                  </div>
                  {pet.chronicConditions ? (
                    <p className="text-xs font-bold text-[#ae4d45] bg-[#fffbef] p-2 rounded-lg border border-[#e98b70]/45">
                      {pet.chronicConditions}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#607674] italic">Sin patologías crónicas activas.</p>
                  )}
                </div>
              </div>

              {/* Tutor Direct Contact & Telemedical Contingency */}
              <div className="p-4 rounded-2xl bg-white border border-[#e4dfd2] space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#607674]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#454e4e]">
                    Datos del Tutor Responsable
                  </h4>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-[#183c3a]">
                    {pet.owner ? `${pet.owner.firstName || ''} ${pet.owner.lastName || ''}`.trim() : 'Tutor Registrado'}
                  </p>
                  {pet.owner?.email && <p className="text-[#607674]">{pet.owner.email}</p>}
                </div>

                {pet.owner?.phone ? (
                  <a
                    href={`tel:${pet.owner.phone}`}
                    data-testid="call-tutor-phone-button"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#edf6f4] hover:bg-[#d9e8e4] active:bg-[#cfe2dd] text-[#183c3a] rounded-full text-xs font-extrabold border border-[#609f9c]/45 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#315f5d]" />
                    <span>Llamada de Emergencia: {pet.owner.phone}</span>
                  </a>
                ) : (
                  <div className="text-[11px] text-[#607674] italic">
                    Sin teléfono directo cargado en el perfil del tutor.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-[#607674] py-12">
              No se seleccionó ninguna mascota para inspeccionar.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#f2eddd] border-t border-[#e4dfd2] shrink-0 flex justify-between items-center text-[10px] text-[#454e4e]">
          <span className="flex items-center gap-1 font-semibold text-[#315f5d]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#609f9c]" />
            Acceso Médico Autorizado
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#fffbef] hover:bg-white rounded-full text-xs font-bold text-[#183c3a] border border-[#e4dfd2] cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VetPatientProfile;
