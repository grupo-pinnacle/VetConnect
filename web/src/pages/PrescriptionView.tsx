import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Prescription, ApiResponse } from '../types';

export const PrescriptionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        if (!id) return;
        const res = await api.get<ApiResponse<Prescription>>(`/api/prescriptions/${id}`);
        if (res.data.success && res.data.data) {
          setPrescription(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Error al cargar receta médica digital');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" data-testid="prescription-loading">
        <p className="text-slate-600 font-medium">Cargando receta digital oficial SENASA...</p>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" data-testid="prescription-error">
        <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-md w-full shadow text-center">
          <p className="text-red-600 font-medium text-sm mb-4">{error || 'Receta médica no encontrada'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center" data-testid="prescription-view-page">
      {/* Printable Actions Bar (Hidden on print) */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 print:hidden">
        <button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
        >
          ← Volver
        </button>
        <button
          data-testid="print-prescription-button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition"
        >
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>

      {/* Official Prescription Document Box */}
      <article className="bg-white border border-slate-300 rounded-2xl p-8 max-w-2xl w-full shadow-lg font-sans" data-testid="prescription-document">
        <header className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900" data-testid="prescription-header-title">
              RECETA MÉDICA VETERINARIA DIGITAL
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Normativa Oficial SENASA Ley 25.326 — VetConnect
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              DOCUMENTO OFICIAL FIRMADO
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              Fecha: {new Date(prescription.createdAt).toLocaleDateString()}
            </p>
          </div>
        </header>

        {/* Vet & Patient Info */}
        <section className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-6 text-xs" data-testid="prescription-info-grid">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Médico Veterinario Prescriptor</span>
            <p className="font-bold text-slate-800" data-testid="prescription-vet-name">
              Dr/a. {prescription.vet?.firstName} {prescription.vet?.lastName}
            </p>
            <p className="text-slate-600">Matrícula: {prescription.vet?.licenseNumber || 'N/A'}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Identificación de Receta</span>
            <p className="font-mono text-slate-700 font-bold" data-testid="prescription-id">
              ID: {prescription.id}
            </p>
          </div>
        </section>

        {/* Medication Details */}
        <section className="mb-6 space-y-4" data-testid="prescription-details">
          <div className="border border-slate-200 rounded-xl p-4">
            <h2 className="font-bold text-slate-800 text-sm mb-2">Prescripción de Medicamento</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Medicamento / Principio Activo:</span>
                <span className="font-bold text-slate-900 text-sm" data-testid="rx-medication">
                  {prescription.medication}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Dosis & Frecuencia:</span>
                <span className="font-bold text-slate-900" data-testid="rx-dosage-frequency">
                  {prescription.dosage} ({prescription.frequency})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Duración del Tratamiento:</span>
                <span className="font-bold text-slate-900" data-testid="rx-duration">
                  {prescription.durationDays} días
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-amber-50/30">
            <h3 className="font-bold text-slate-800 text-xs mb-1">Indicaciones Médicas Veterinarias</h3>
            <p className="text-xs text-slate-700 leading-relaxed" data-testid="rx-indications">
              {prescription.indications}
            </p>
          </div>
        </section>

        {/* QR Code Verification Section */}
        <footer className="border-t border-slate-200 pt-6 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Validación Digital Farmacéutica</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">
              Escanee el código QR con la cámara de su dispositivo móvil para verificar la validez y firma oficial de la matrícula en la plataforma.
            </p>
          </div>

          {prescription.qrCodeDataUrl && (
            <div className="flex flex-col items-center">
              <img
                src={prescription.qrCodeDataUrl}
                alt="QR Receta Oficial"
                className="w-28 h-28 border border-slate-200 p-1 rounded bg-white shadow-sm"
                data-testid="prescription-qr-code"
              />
              <span className="text-[9px] font-mono text-slate-400 mt-1">VERIFICABLE SENASA</span>
            </div>
          )}
        </footer>
      </article>
    </div>
  );
};

export default PrescriptionView;
