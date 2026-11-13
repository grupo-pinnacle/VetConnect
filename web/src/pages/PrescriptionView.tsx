import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft, Calendar } from 'lucide-react';
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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffbef] flex items-center justify-center p-6 font-['Manrope',sans-serif]" data-testid="prescription-loading">
        <PrescriptionDocSkeleton />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-[#fffbef] flex flex-col items-center justify-center p-6 font-['Manrope',sans-serif]" data-testid="prescription-error">
        <div className="bg-white p-8 rounded-3xl border border-[#e4dfd2] max-w-md w-full shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#fbeee9] text-[#ae4d45] flex items-center justify-center mx-auto mb-4 border border-[#e98b70]/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-[#183c3a] mb-1">Verificación Fallida</h2>
          <p className="text-[#607674] text-sm mb-6 leading-relaxed">
            {error || 'Receta médica no encontrada o código de verificación inválido en los registros de SENASA.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 bg-[#609f9c] hover:bg-[#4d8d89] text-white rounded-full text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbef] text-[#183c3a] p-4 sm:p-6 flex flex-col items-center font-['Manrope',sans-serif]" data-testid="prescription-view-page">
      {/* Top Navigation & Status (Hidden on print) */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="back-button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#e4dfd2] bg-white hover:bg-[#f2eddd] text-[#183c3a] rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Volver</span>
          </button>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#183c3a]">
            <img src="/assets/huellicam-mark.png" alt="HuelliCam" className="w-7 h-6 object-contain" />
            <span>Huelli<span className="text-[#609f9c]">Cam</span></span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-[#d9e8e4] text-[#183c3a] border border-[#609f9c]/35 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#315f5d]" aria-hidden="true" />
            <span>Verificación Oficial SENASA Ley 25.326</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#607674] bg-[#f2eddd] border border-[#e4dfd2] px-3 py-1.5 rounded-full">
            <Calendar className="w-3.5 h-3.5 text-[#315f5d]" aria-hidden="true" />
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
