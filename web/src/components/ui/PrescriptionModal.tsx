import React, { useState, useEffect } from 'react';
import { X, Loader2, QrCode } from 'lucide-react';
import { PrescriptionModalProps, Prescription, ApiResponse } from '../../types';
import api from '../../services/api';
import { cn } from '../../lib/utils';

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  consultationId,
  onClose,
  onSuccess,
  initialValues,
  isLoading: externalLoading = false,
  onSubmit,
  className = '',
  'data-testid': testId = 'prescription-modal',
}) => {
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [indications, setIndications] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedPrescription, setIssuedPrescription] = useState<Prescription | null>(null);

  // Sync initial values on open or when initialValues change
  useEffect(() => {
    if (isOpen) {
      setMedication(initialValues?.medication || '');
      setDosage(initialValues?.dosage || '');
      setFrequency(initialValues?.frequency || '');
      setDurationDays(initialValues?.durationDays ? String(initialValues.durationDays) : '7');
      setIndications(initialValues?.indications || '');
      setError(null);
      setIssuedPrescription(null);
    }
  }, [isOpen, initialValues]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSubmitting = externalLoading || internalLoading;
  const isIndicationsValid = indications.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIndicationsValid) {
      setError('Las indicaciones clínicas deben contener al menos 5 caracteres.');
      return;
    }

    setError(null);
    setInternalLoading(true);

    const formData = {
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      durationDays: parseInt(durationDays, 10) || 7,
      indications: indications.trim(),
    };

    try {
      if (onSubmit) {
        const result = await onSubmit(formData);
        if (result) {
          setIssuedPrescription(result);
          onSuccess(result);
        }
      } else {
        const res = await api.post<ApiResponse<Prescription>>(
          `/api/consultations/${consultationId}/prescriptions`,
          formData
        );

        if (res.data.success && res.data.data) {
          setIssuedPrescription(res.data.data);
          onSuccess(res.data.data);
        } else {
          setError(res.data.message || 'Error al emitir la receta médica digital.');
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message || 'Error de conexión al emitir receta médica.');
    } finally {
      setInternalLoading(false);
    }
  };

  const durationOptions = [3, 5, 7, 10, 14, 30];
  const currentDurationNum = parseInt(durationDays, 10);
  const isCustomDuration = !durationOptions.includes(currentDurationNum) && !isNaN(currentDurationNum);

  return (
    <div
      data-testid={testId}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prescription-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 relative my-8 font-sans',
          className
        )}
      >
        {/* Close icon button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <h2
          id="prescription-modal-title"
          className="text-lg font-bold font-display text-slate-800 mb-1"
        >
          Emitir Receta Médica Digital Oficial SENASA
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Firma electrónica con validez farmacéutica legal (Ley 25.506).
        </p>

        {issuedPrescription ? (
          <div className="text-center space-y-4 pt-2" data-testid="prescription-success-container">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2">
              <span className="text-emerald-600 text-base">✓</span>
              <span>¡Receta Digital Emitida Exitosamente!</span>
            </div>

            {issuedPrescription.qrCodeDataUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={issuedPrescription.qrCodeDataUrl}
                  alt="Código QR de Receta"
                  className="w-36 h-36 border border-slate-200 rounded-xl p-2 bg-white shadow-sm"
                  data-testid="prescription-qr-image"
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Escanear para validar en farmacias autorizadas
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  data-testid="prescription-qr-image"
                  className="w-36 h-36 border border-slate-200 rounded-xl p-2 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shadow-inner"
                >
                  <QrCode className="w-12 h-12 text-slate-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-500">QR SENASA</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Escanear para validar en farmacias autorizadas
                </p>
              </div>
            )}

            <button
              type="button"
              data-testid="close-prescription-success-button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="prescription-form">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="prescription-medication"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Medicamento / Principio Activo *
              </label>
              <input
                id="prescription-medication"
                type="text"
                data-testid="input-prescription-medication"
                placeholder="Ej. Amoxicilina 250mg"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="prescription-dosage"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Dosis *
                </label>
                <input
                  id="prescription-dosage"
                  type="text"
                  data-testid="input-prescription-dosage"
                  placeholder="Ej. 1 comprimido"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="prescription-frequency"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Frecuencia *
                </label>
                <input
                  id="prescription-frequency"
                  type="text"
                  data-testid="input-prescription-frequency"
                  placeholder="Ej. Cada 12 hs"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prescription-duration"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Duración del Tratamiento *
              </label>
              <select
                id="prescription-duration"
                data-testid="input-prescription-duration"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              >
                {durationOptions.map((days) => (
                  <option key={days} value={days}>
                    {days} días
                  </option>
                ))}
                {isCustomDuration && (
                  <option value={durationDays}>{durationDays} días</option>
                )}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="prescription-indications"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Indicaciones Clínicas *
                </label>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    indications.length >= 5 ? 'text-slate-400' : 'text-amber-600 font-semibold'
                  )}
                >
                  {indications.length}/5 mín.
                </span>
              </div>
              <textarea
                id="prescription-indications"
                rows={3}
                data-testid="input-prescription-indications"
                placeholder="Administrar junto con alimento..."
                value={indications}
                onChange={(e) => setIndications(e.target.value)}
                disabled={isSubmitting}
                required
                minLength={5}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400',
                  indications.length > 0 && indications.length < 5
                    ? 'border-amber-400 focus:ring-amber-500'
                    : 'border-slate-300'
                )}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                data-testid="cancel-prescription-button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                data-testid="save-prescription-button"
                disabled={isSubmitting || !isIndicationsValid}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Receta</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PrescriptionModal;
