import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft, Calendar, FileText } from 'lucide-react';
import api from '../services/api';
import { Prescription, ApiResponse } from '../types';
import { PrescriptionDoc } from '../components/ui/PrescriptionDoc';
import { PrescriptionDocSkeleton } from '../components/ui/Skeleton';

export const PrescriptionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const targetId = id || searchParams.get('code') || searchParams.get('id');
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        if (!targetId) {
          setError('No se proporcionó un identificador de receta o código de validación válido');
          setLoading(false);
          return;
        }
        const res = await api.get<ApiResponse<Prescription>>(`/api/prescriptions/${targetId}`);
        if (res.data.success && res.data.data) {
          setPrescription(res.data.data);
        } else {
          setError('La receta solicitada no existe o no pudo ser recuperada.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Error al validar receta médica digital ante el registro SENASA');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [targetId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" data-testid="prescription-loading">
        <PrescriptionDocSkeleton />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6" data-testid="prescription-error">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 max-w-md w-full shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-900 mb-1">Verificación Fallida</h2>
          <p className="text-stone-600 text-xs mb-6 leading-relaxed">
            {error || 'Receta médica no encontrada o código de verificación inválido en los registros de SENASA.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] p-4 sm:p-6 flex flex-col items-center" data-testid="prescription-view-page">
      {/* Top Navigation & Status (Hidden on print) */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 print:hidden">
        <button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium shadow-sm transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-100/80 text-emerald-900 border border-emerald-300 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verificación Oficial SENASA Ley 25.326</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
            <Calendar className="w-3 h-3 text-stone-500" />
            <span>Vigencia: 30 días corridos</span>
          </span>
        </div>
      </div>

      {/* Reusable Official Prescription Document Component */}
      <PrescriptionDoc
        prescription={prescription}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default PrescriptionView;
