import React from 'react';
import { Printer, ShieldCheck, Stethoscope } from 'lucide-react';
import { PrescriptionDocProps } from '../../types';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const PrescriptionDoc: React.FC<PrescriptionDocProps> = ({
  prescription,
  qrUrl,
  pet,
  fallbackLicense,
  onPrint,
  className = '',
  'data-testid': testId = 'prescription-document',
}) => {
  const { user } = useAuth();
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
    : user
    ? `Dr/a. ${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Médico Veterinario Matriculado';
  const licenseNumber = prescription.vet?.licenseNumber || fallbackLicense || user?.licenseNumber || 'MP-Oficial';

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
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#609f9c] hover:bg-[#4d8d89] active:bg-[#315f5d] text-white rounded-full text-xs font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#609f9c] focus-visible:ring-offset-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* Official Prescription Document */}
      <article
        data-testid={testId}
        className={cn(
          "bg-white border border-[#e4dfd2] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-sm font-['Manrope',sans-serif] text-[#183c3a] print:shadow-none print:border-none print:p-0 print:max-w-none print:m-0",
          className
        )}
      >
        {/* Header */}
        <header className="border-b border-[#e4dfd2] pb-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#d9e8e4] border border-[#609f9c]/30 flex items-center justify-center text-[#315f5d] flex-shrink-0">
                <Stethoscope className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h1
                  data-testid="prescription-header-title"
                  className="text-lg sm:text-xl font-extrabold text-[#183c3a] tracking-tight"
                >
                  RECETA MÉDICA VETERINARIA DIGITAL
                </h1>
                <p className="text-xs text-[#607674] font-semibold mt-0.5">
                  Normativa Oficial SENASA Ley 25.326 — HuelliCam
                </p>
              </div>
            </div>

            <div className="sm:text-right flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase font-extrabold px-3 py-1 bg-[#d9e8e4]/70 text-[#183c3a] border border-[#609f9c]/35 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#315f5d]" aria-hidden="true" />
                <span>Documento Oficial Firmado</span>
              </span>
              <p className="text-[11px] text-[#607674] mt-1.5">
                {formattedDate}
              </p>
            </div>
          </div>
        </header>

        {/* Vet & Prescription Identification Grid */}
        <section
          data-testid="prescription-info-grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#fffbef] border border-[#e4dfd2] p-4 rounded-2xl mb-5 text-xs"
        >
          <div>
            <span className="text-[#607674] uppercase font-bold text-[10px] block tracking-wider">
              Médico Veterinario Prescriptor
            </span>
            <p data-testid="prescription-vet-name" className="font-bold text-[#183c3a] mt-0.5">
              {vetName}
            </p>
            <p className="text-[#454e4e] font-medium">
              Matrícula Oficial: <span className="font-bold text-[#183c3a]">{licenseNumber}</span>
            </p>
          </div>

          <div>
            <span className="text-[#607674] uppercase font-bold text-[10px] block tracking-wider">
              Identificación de Receta
            </span>
            <p data-testid="prescription-id" className="font-mono text-[#183c3a] font-bold mt-0.5">
              ID: {prescription.id}
            </p>
            <p className="text-[#607674] text-[11px]">
              Consulta: {prescription.consultationId || 'Cons-Directa'}
            </p>
          </div>
        </section>

        {/* Patient Data Section */}
        {pet && (
          <section
            data-testid="prescription-patient-info"
            className="border border-[#e4dfd2] rounded-2xl p-4 mb-5 bg-white"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#607674] mb-2">
              Datos Clínicos del Paciente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#607674] block text-[10px] uppercase font-semibold">Mascota</span>
                <span data-testid="prescription-pet-name" className="font-bold text-[#183c3a] text-sm">
                  {pet.name}
                </span>
              </div>
              <div>
                <span className="text-[#607674] block text-[10px] uppercase font-semibold">Especie / Raza</span>
                <span className="text-[#183c3a] font-medium">
                  {pet.species} • {pet.breed}
                </span>
              </div>
              <div>
                <span className="text-[#607674] block text-[10px] uppercase font-semibold">Peso Registrado</span>
                <span className="text-[#183c3a] font-medium">
                  {pet.weightKg !== undefined && pet.weightKg !== null ? `${pet.weightKg} kg` : 'N/R'}
                </span>
              </div>
              <div>
                <span className="text-[#607674] block text-[10px] uppercase font-semibold">Microchip ISO</span>
                <span className="font-mono text-[11px] text-[#183c3a] font-medium">
                  {pet.microchip || 'No informado'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Rp/ Pharmacological Details */}
        <section data-testid="prescription-details" className="mb-6 space-y-4">
          <div className="border border-[#e4dfd2] rounded-2xl p-4 sm:p-5 relative bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span
                aria-hidden="true"
                className="font-black text-2xl text-[#609f9c] leading-none select-none"
              >
                Rp/
              </span>
              <h2 className="font-bold text-[#183c3a] text-sm">
                Prescripción de Medicamento
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-1">
                <span className="text-[#607674] block text-[11px]">Medicamento / Principio Activo:</span>
                <span
                  data-testid="rx-medication"
                  className="font-bold text-[#183c3a] text-sm block mt-0.5"
                >
                  {prescription.medication}
                </span>
              </div>

              <div>
                <span className="text-[#607674] block text-[11px]">Dosis & Frecuencia:</span>
                <span
                  data-testid="rx-dosage-frequency"
                  className="font-bold text-[#183c3a] block mt-0.5"
                >
                  {prescription.dosage} ({prescription.frequency})
                </span>
              </div>

              <div>
                <span className="text-[#607674] block text-[11px]">Duración del Tratamiento:</span>
                <span
                  data-testid="rx-duration"
                  className="font-bold text-[#183c3a] block mt-0.5"
                >
                  {prescription.durationDays} días
                </span>
              </div>
            </div>
          </div>

          <div className="border border-[#e98b70]/40 rounded-2xl p-4 bg-[#f2eddd]/60">
            <h3 className="font-bold text-[#183c3a] text-xs mb-1.5 flex items-center gap-1.5">
              <span>Indicaciones Médicas Veterinarias</span>
            </h3>
            <p
              data-testid="rx-indications"
              className="text-xs text-[#454e4e] leading-relaxed font-normal whitespace-pre-line"
            >
              {prescription.indications}
            </p>
          </div>
        </section>

        {/* QR Code Verification Section */}
        <footer className="border-t border-[#e4dfd2] pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-bold text-[#183c3a]">
              Validación Digital Farmacéutica
            </h4>
            <p className="text-[11px] text-[#607674] max-w-sm mt-0.5 leading-relaxed">
              Documento oficial con validez nacional según Ley 25.506 y normativa SENASA. Escaneá el código QR para validar la firma digital y matrícula profesional.
            </p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            {qrSource ? (
              <img
                src={qrSource}
                alt="QR Receta Oficial SENASA"
                data-testid="prescription-qr-code"
                className="w-24 h-24 sm:w-28 sm:h-28 border border-[#e4dfd2] p-1.5 rounded-2xl bg-white shadow-sm object-contain"
              />
            ) : (
              <div
                data-testid="prescription-qr-code"
                className="w-24 h-24 sm:w-28 sm:h-28 border border-[#e4dfd2] p-2 rounded-2xl bg-[#fffbef] flex flex-col items-center justify-center text-center"
              >
                <div className="w-10 h-10 border-2 border-[#609f9c] border-dashed rounded-lg flex items-center justify-center mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#315f5d]">QR</span>
                </div>
                <span className="text-[8px] font-mono text-[#607674] leading-tight">SENASA VAL</span>
              </div>
            )}
            <span className="text-[9px] font-mono text-[#607674] font-semibold mt-1 tracking-wider uppercase">
              VERIFICABLE SENASA
            </span>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default PrescriptionDoc;
