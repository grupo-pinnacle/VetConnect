import React, { useState } from 'react';
import { Pet } from '../../types';
import { SpeciesIcon } from '../icons/SpeciesIcons';
import {
  X,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  Scale,
  QrCode,
  AlertTriangle,
  AlertCircle,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

interface PetDossierModalProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PetDossierModal: React.FC<PetDossierModalProps> = ({ pet, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pet) return null;

  const handleCopyChip = () => {
    if (!pet.microchip) return;
    navigator.clipboard.writeText(pet.microchip).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
      data-testid="pet-dossier-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#06241D]/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E2D5] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Printable & Header section */}
        <div className="bg-gradient-to-r from-[#06241D] to-[#0B3B30] text-white p-6 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <SpeciesIcon species={pet.species} className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dossier-modal-title" className="text-lg font-extrabold tracking-tight">
                  Expediente Clínico — {pet.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ley 25.326
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">Ficha médica digital oficial y trazabilidad clínica</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="print-dossier-button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              type="button"
              data-testid="close-dossier-button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar expediente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official printable document body */}
        <div id="printable-dossier-content" className="p-6 sm:p-8 space-y-6">
          {/* Institutional Print Watermark & Header (visible when printing) */}
          <div className="border-b border-[#E8E2D5] pb-4 mb-2 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>VetConnect — Red Nacional de Telemedicina Veterinaria</span>
              </div>
              <h1 className="text-2xl font-black text-[#06241D] mt-1" data-testid="dossier-pet-name">
                {pet.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Padrón Único de Identificación y Registro Clínico Digital
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              {pet.owner && (
                <div className="mb-1">
                  <p className="font-semibold text-slate-700">Tutor Responsable:</p>
                  <p className="font-medium text-slate-900">{pet.owner.firstName} {pet.owner.lastName}</p>
                </div>
              )}
              <p className="font-semibold text-slate-700">Fecha de Emisión:</p>
              <p>{new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Biological & Physical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Especie</span>
              <span className="text-sm font-extrabold text-[#06241D] capitalize">{pet.species}</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Raza</span>
              <span className="text-sm font-extrabold text-[#06241D] truncate block">{pet.breed || 'Mestizo'}</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Peso Actual</span>
              <span className="text-sm font-extrabold text-[#06241D] flex items-center gap-1" data-testid="dossier-weight">
                <Scale className="w-3.5 h-3.5 text-amber-600" />
                {pet.weightKg ? `${pet.weightKg} kg` : 'No registrado'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Alta en Sistema</span>
              <span className="text-sm font-extrabold text-[#06241D]" data-testid="dossier-age">
                {new Date(pet.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Microchip Identification & Copy Section */}
          <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5 text-sky-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                  Microchip ISO 11784/11785 (15 Dígitos)
                </p>
                <p className="font-mono text-sm font-black text-sky-900" data-testid="dossier-microchip" data-testcode="dossier-microchip-code">
                  {pet.microchip || 'SIN MICROCHIP HOMOLOGADO'}
                </p>
              </div>
            </div>

            {pet.microchip && (
              <button
                type="button"
                data-testid="copy-microchip-btn"
                onClick={handleCopyChip}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-sky-900 hover:bg-sky-100 active:bg-sky-200 rounded-xl text-xs font-extrabold border border-sky-300 shadow-sm transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-700" />}
                <span>{copied ? '¡Copiado!' : 'Copiar ISO'}</span>
              </button>
            )}
          </div>

          {/* Clinical Alerts: Allergies & Chronic Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allergies */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                  Alergias Clínicas Declaradas
                </h3>
              </div>
              {Array.isArray(pet.allergies) && pet.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {pet.allergies.map((allergy, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : typeof pet.allergies === 'string' && pet.allergies ? (
                <div className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
                  {pet.allergies}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Sin alergias conocidas registradas por el tutor.</p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-950">
                  Condiciones Crónicas / Preexistentes
                </h3>
              </div>
              {Array.isArray(pet.chronicConditions) && pet.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {pet.chronicConditions.map((cond, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold">
                      {cond}
                    </span>
                  ))}
                </div>
              ) : typeof pet.chronicConditions === 'string' && pet.chronicConditions ? (
                <div className="inline-block px-3 py-1 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold">
                  {pet.chronicConditions}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Sin patologías crónicas reportadas a la fecha.</p>
              )}
            </div>
          </div>

          {/* Legal Compliance Footer under Ley 25.326 */}
          <div className="pt-4 border-t border-[#E8E2D5] text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Marco Legal y Protección de Datos:</p>
            <p>
              Este expediente se emite en conformidad con la Ley N° 25.326 de Protección de Datos Personales de la República Argentina y las resoluciones de ejercicio telemédico profesional vigentes. Prohibida su alteración o adulteración.
            </p>
          </div>
        </div>

        {/* Modal Footer (no-print) */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E2D5] flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-[#E8E2D5] transition-all cursor-pointer"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDossierModal;
