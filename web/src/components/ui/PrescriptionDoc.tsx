import React from 'react';
import { Printer, ShieldCheck, Stethoscope } from 'lucide-react';
import { PrescriptionDocProps } from '../../types';
import { cn } from '../../lib/utils';

export const PrescriptionDoc: React.FC<PrescriptionDocProps> = ({
  prescription,
  qrUrl,
  pet,
  onPrint,
  className = '',
  'data-testid': testId = 'prescription-document',
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const qrSource = qrUrl || prescription.qrCodeDataUrl || prescription.verifyUrl;
  const vetName = prescription.vet
    ? `Dr/a. ${prescription.vet.firstName || ''} ${prescription.vet.lastName || ''}`.trim()
    : 'Médico Veterinario Matriculado';
  const licenseNumber = prescription.vet?.licenseNumber || 'MP-Oficial';

  const formattedDate = prescription.createdAt
    ? new Date(prescription.createdAt).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('es-AR');

  return (
    <div className="w-full flex flex-col items-center">
      {/* Printable Actions Bar (Hidden during print) */}
      <div className="w-full max-w-2xl flex justify-end items-center mb-4 print:hidden">
        <button
          type="button"
          data-testid="print-prescription-button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* Official Prescription Document */}
      <article
        data-testid={testId}
        className={cn(
          'bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-lg font-sans text-slate-800 print:shadow-none print:border-none print:p-0 print:max-w-none print:m-0',
          className
        )}
      >
        {/* Header */}
        <header className="border-b border-slate-200 pb-5 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                <Stethoscope className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1
                  data-testid="prescription-header-title"
                  className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight"
                >
                  RECETA MÉDICA VETERINARIA DIGITAL
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Normativa Oficial SENASA Ley 25.326 — VetConnect
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                <span>Documento Oficial Firmado</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                {formattedDate}
              </p>
            </div>
          </div>
        </header>

        {/* Vet & Prescription Identification Grid */}
        <section
          data-testid="prescription-info-grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl mb-5 text-xs"
        >
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block tracking-wider">
              Médico Veterinario Prescriptor
            </span>
            <p data-testid="prescription-vet-name" className="font-bold text-slate-800 mt-0.5">
              {vetName}
            </p>
            <p className="text-slate-600 font-medium">
              Matrícula Oficial: <span className="font-semibold text-slate-700">{licenseNumber}</span>
            </p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block tracking-wider">
              Identificación de Receta
            </span>
            <p data-testid="prescription-id" className="font-mono text-slate-800 font-bold mt-0.5">
              ID: {prescription.id}
            </p>
            <p className="text-slate-500 text-[11px]">
              Consulta: {prescription.consultationId || 'Cons-Directa'}
            </p>
          </div>
        </section>

        {/* Patient Data Section */}
        {pet && (
          <section
            data-testid="prescription-patient-info"
            className="border border-slate-200 rounded-xl p-4 mb-5 bg-white shadow-sm"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Datos Clínicos del Paciente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mascota</span>
                <span data-testid="prescription-pet-name" className="font-bold text-slate-900 text-sm">
                  {pet.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Especie / Raza</span>
                <span className="text-slate-700 font-medium">
                  {pet.species} • {pet.breed}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Peso Registrado</span>
                <span className="text-slate-700 font-medium">
                  {pet.weightKg !== undefined && pet.weightKg !== null ? `${pet.weightKg} kg` : 'N/R'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Microchip ISO</span>
                <span className="font-mono text-[11px] text-slate-700 font-medium">
                  {pet.microchip || 'No informado'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Rp/ Pharmacological Details */}
        <section data-testid="prescription-details" className="mb-6 space-y-4">
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5 relative bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span
                aria-hidden="true"
                className="font-display font-black text-2xl text-blue-600 leading-none select-none"
              >
                Rp/
              </span>
              <h2 className="font-bold text-slate-800 text-sm">
                Prescripción de Medicamento
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-1">
                <span className="text-slate-500 block text-[11px]">Medicamento / Principio Activo:</span>
                <span
                  data-testid="rx-medication"
                  className="font-bold text-slate-900 text-sm block mt-0.5"
                >
                  {prescription.medication}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Dosis & Frecuencia:</span>
                <span
                  data-testid="rx-dosage-frequency"
                  className="font-bold text-slate-900 block mt-0.5"
                >
                  {prescription.dosage} ({prescription.frequency})
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Duración del Tratamiento:</span>
                <span
                  data-testid="rx-duration"
                  className="font-bold text-slate-900 block mt-0.5"
                >
                  {prescription.durationDays} días
                </span>
              </div>
            </div>
          </div>

          <div className="border border-amber-200/80 rounded-xl p-4 bg-amber-50/40">
            <h3 className="font-bold text-amber-900 text-xs mb-1.5 flex items-center gap-1.5">
              <span>Indicaciones Médicas Veterinarias</span>
            </h3>
            <p
              data-testid="rx-indications"
              className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line"
            >
              {prescription.indications}
            </p>
          </div>
        </section>

        {/* QR Code Verification Section */}
        <footer className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-bold text-slate-800">
              Validación Digital Farmacéutica
            </h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-0.5 leading-relaxed">
              Documento oficial con validez nacional según Ley 25.506 y normativa SENASA. Escanee el código QR para validar la firma digital y matrícula profesional.
            </p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            {qrSource ? (
              <img
                src={qrSource}
                alt="QR Receta Oficial SENASA"
                data-testid="prescription-qr-code"
                className="w-24 h-24 sm:w-28 sm:h-28 border border-slate-200 p-1.5 rounded-lg bg-white shadow-sm object-contain"
              />
            ) : (
              <div
                data-testid="prescription-qr-code"
                className="w-24 h-24 sm:w-28 sm:h-28 border border-slate-300 p-2 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center shadow-inner"
              >
                <div className="w-10 h-10 border-2 border-slate-400 border-dashed rounded flex items-center justify-center mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-600">QR</span>
                </div>
                <span className="text-[8px] font-mono text-slate-400 leading-tight">SENASA VAL</span>
              </div>
            )}
            <span className="text-[9px] font-mono text-slate-400 font-semibold mt-1 tracking-wider uppercase">
              VERIFICABLE SENASA
            </span>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default PrescriptionDoc;
