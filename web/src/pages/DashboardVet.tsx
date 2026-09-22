import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Consultation, Prescription, ApiResponse, User } from '../types';
import { PrescriptionModal } from '../components/ui/PrescriptionModal';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ConsultationQueueSkeleton } from '../components/ui/Skeleton';

export const DashboardVet: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(user?.isOnline || false);

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedConsId, setSelectedConsId] = useState<string>('');

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
      <div className="min-h-screen bg-slate-50 p-6 max-w-7xl mx-auto space-y-6" data-testid="vet-loading-state">
        <div className="bg-white p-4 rounded-xl shadow-sm h-20 animate-pulse" />
        <ConsultationQueueSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" data-testid="dashboard-vet-page">
      <Breadcrumbs
        items={[{ label: 'Inicio', path: '/' }, { label: 'Portal Médico Guardia' }]}
        className="mb-4"
      />
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
      <PrescriptionModal
        isOpen={showPrescriptionModal}
        consultationId={selectedConsId}
        onClose={() => setShowPrescriptionModal(false)}
        onSuccess={() => {
          fetchQueue();
        }}
      />
    </div>
  );
};

export default DashboardVet;
