import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Prescription, ApiResponse } from '../types';
import { PrescriptionDoc } from '../components/ui/PrescriptionDoc';
import { PrescriptionDocSkeleton } from '../components/ui/Skeleton';

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
        <PrescriptionDocSkeleton />
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
      {/* Back button header (Hidden on print) */}
      <div className="w-full max-w-2xl flex justify-start items-center mb-2 print:hidden">
        <button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          ← Volver
        </button>
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
