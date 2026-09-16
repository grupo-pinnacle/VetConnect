import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Consultation, Prescription, ApiResponse, User } from '../types';

export const DashboardVet: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(user?.isOnline || false);

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedConsId, setSelectedConsId] = useState<string>('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    durationDays: '7',
    indications: '',
  });
  const [issuedPrescription, setIssuedPrescription] = useState<Prescription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await api.get<ApiResponse<Consultation[]>>('/api/consultations/mine');
      if (res.data.success && res.data.data) {
        setQueue(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching vet queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await api.patch<ApiResponse<User>>('/api/users/profile', { isOnline: nextState });
    } catch (err) {
      console.warn('Error updating online presence:', err);
    }
  };

  const handleAssignAndJoin = async (consultationId: string) => {
    try {
      const res = await api.patch<ApiResponse<Consultation>>(
        `/api/consultations/${consultationId}/assign`
      );
      if (res.data.success && res.data.data) {
        navigate(`/call/${consultationId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al asignar consulta');
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsId) return;

    setIsSubmitting(true);
    try {
      const res = await api.post<ApiResponse<Prescription>>(
        `/api/consultations/${selectedConsId}/prescriptions`,
        {
          medication: prescriptionForm.medication,
          dosage: prescriptionForm.dosage,
          frequency: prescriptionForm.frequency,
          durationDays: parseInt(prescriptionForm.durationDays, 10),
          indications: prescriptionForm.indications,
        }
      );

      if (res.data.success && res.data.data) {
        setIssuedPrescription(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al emitir receta digital');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (notes?: string | null) => {
    if (notes?.includes('ROJO')) {
      return <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded" data-testid="badge-priority-rojo">ROJO</span>;
    }
    if (notes?.includes('AMARILLO')) {
      return <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded" data-testid="badge-priority-amarillo">AMARILLO</span>;
    }
    return <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded" data-testid="badge-priority-verde">VERDE</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" data-testid="vet-loading-state">
        <p className="text-slate-600 font-medium">Cargando portal veterinario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" data-testid="dashboard-vet-page">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-900" data-testid="header-vet-title">
            VetConnect — Portal Veterinario
          </h1>
          <p className="text-sm text-slate-600" data-testid="vet-license-info">
            Dr/a. {user?.firstName} {user?.lastName} (Matrícula: {user?.licenseNumber || 'N/A'})
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span
              data-testid="vet-status-badge"
              className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                user?.vetStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Matrícula: {user?.vetStatus || 'PENDING'}
            </span>

            {/* Online Presence Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                data-testid="presence-toggle-switch"
                checked={isOnline}
                onChange={handleToggleOnline}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span>Guardia Online: {isOnline ? 'ACTIVO' : 'INACTIVO'}</span>
            </label>
          </div>
        </div>

        <button
          data-testid="vet-logout-button"
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waiting Queue (Guardia Telemática) */}
        <section className="bg-white p-6 rounded-xl shadow-sm" data-testid="triage-waiting-room">
          <h2 className="text-lg font-semibold text-slate-800 mb-4" data-testid="waiting-room-title">
            Sala de Espera (Guardia Telemática FIFO)
          </h2>

          <div className="space-y-3" data-testid="waiting-queue-list">
            {queue.filter((c) => c.status === 'WAITING').length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 italic bg-slate-50 rounded-lg" data-testid="empty-queue-state">
                Sin registros en sala de espera
              </div>
            ) : (
              queue
                .filter((c) => c.status === 'WAITING')
                .map((c) => (
                  <div
                    key={c.id}
                    data-testid={`waiting-card-${c.id}`}
                    className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-amber-50/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(c.notes)}
                        <h3 className="font-bold text-slate-800 text-sm">
                          Paciente: {c.pet?.name} ({c.pet?.species})
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{c.notes}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Ingresó: {new Date(c.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      data-testid={`assign-patient-button-${c.id}`}
                      onClick={() => handleAssignAndJoin(c.id)}
                      className="px-3 py-1.5 bg-secondary-600 text-white rounded-lg text-xs font-bold hover:bg-secondary-500 shadow-sm"
                    >
                      Atender Paciente
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* Assigned Consultations & Prescriptions */}
        <section className="bg-white p-6 rounded-xl shadow-sm" data-testid="assigned-consultations-section">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Mis Consultas Asignadas & Recetas
          </h2>

          <div className="space-y-3" data-testid="assigned-list">
            {queue.filter((c) => c.vetId === user?.id).length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 italic bg-slate-50 rounded-lg" data-testid="empty-assigned-state">
                Sin registros de consultas asignadas
              </div>
            ) : (
              queue
                .filter((c) => c.vetId === user?.id)
                .map((c) => (
                  <div
                    key={c.id}
                    data-testid={`assigned-card-${c.id}`}
                    className="p-4 border border-slate-200 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Paciente: {c.pet?.name} ({c.pet?.breed})
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{c.notes}</p>
                      <span className="inline-block text-[10px] font-bold mt-1 px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {c.status}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        data-testid={`join-call-vet-button-${c.id}`}
                        onClick={() => navigate(`/call/${c.id}`)}
                        className="px-3 py-1.5 bg-primary-900 text-white rounded-lg text-xs font-semibold hover:bg-primary-800"
                      >
                        Sala Video
                      </button>

                      <button
                        data-testid={`emit-prescription-button-${c.id}`}
                        onClick={() => {
                          setSelectedConsId(c.id);
                          setShowPrescriptionModal(true);
                          setIssuedPrescription(null);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                      >
                        Receta QR
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>

      {/* Modal Emisión de Receta Digital con QR */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="prescription-modal">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Emitir Receta Médica Digital Oficial SENASA
            </h2>

            {issuedPrescription ? (
              <div className="text-center space-y-4" data-testid="prescription-success-container">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
                  ¡Receta Digital Emitida Exitosamente!
                </div>

                {issuedPrescription.qrCodeDataUrl && (
                  <div className="flex flex-col items-center">
                    <img
                      src={issuedPrescription.qrCodeDataUrl}
                      alt="Código QR de Receta"
                      className="w-40 h-40 border border-slate-200 rounded p-2"
                      data-testid="prescription-qr-image"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Escanear para validar en farmacias autorizadas
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  data-testid="close-prescription-success-button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreatePrescription} className="space-y-3" data-testid="prescription-form">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Medicamento / Principio Activo *</label>
                  <input
                    type="text"
                    data-testid="input-prescription-medication"
                    placeholder="Ej. Amoxicilina 250mg"
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                    required
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Dosis *</label>
                    <input
                      type="text"
                      data-testid="input-prescription-dosage"
                      placeholder="Ej. 1 comprimido"
                      value={prescriptionForm.dosage}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                      required
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Frecuencia *</label>
                    <input
                      type="text"
                      data-testid="input-prescription-frequency"
                      placeholder="Ej. Cada 12 hs"
                      value={prescriptionForm.frequency}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                      required
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Duración en Días *</label>
                  <input
                    type="number"
                    data-testid="input-prescription-duration"
                    value={prescriptionForm.durationDays}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, durationDays: e.target.value })}
                    required
                    min={1}
                    max={365}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Indicaciones Clínicas *</label>
                  <textarea
                    rows={3}
                    data-testid="input-prescription-indications"
                    placeholder="Administrar junto con alimento..."
                    value={prescriptionForm.indications}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, indications: e.target.value })}
                    required
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    data-testid="cancel-prescription-button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="flex-1 p-2 border rounded text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    data-testid="save-prescription-button"
                    disabled={isSubmitting}
                    className="flex-1 p-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Firmando...' : 'Emitir Receta con QR'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardVet;
