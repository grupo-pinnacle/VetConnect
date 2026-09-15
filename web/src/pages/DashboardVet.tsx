import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Consultation, ApiResponse } from '../types';

export const DashboardVet: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(user?.isOnline || false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Cargando portal veterinario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-900">VetConnect — Portal Veterinario</h1>
          <p className="text-sm text-slate-600">
            Dr/a. {user?.firstName} {user?.lastName} (Matrícula: {user?.licenseNumber || 'N/A'})
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                user?.vetStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Matrícula: {user?.vetStatus || 'PENDING'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waiting Queue */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Sala de Espera (Guardia Activa)
          </h2>

          <div className="space-y-3">
            {queue.filter((c) => c.status === 'WAITING').length === 0 ? (
              <p className="text-sm text-slate-500 italic">No hay pacientes en sala de espera</p>
            ) : (
              queue
                .filter((c) => c.status === 'WAITING')
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-slate-200 rounded-lg flex justify-between items-center bg-amber-50/50"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Paciente: {c.pet?.name} ({c.pet?.species})
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">Motivo: {c.notes}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Ingresó: {new Date(c.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAssignAndJoin(c.id)}
                      className="px-3 py-1.5 bg-secondary-600 text-white rounded-lg text-xs font-bold hover:bg-secondary-500"
                    >
                      Atender (FIFO)
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Assigned Consultations */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Mis Consultas Asignadas
          </h2>

          <div className="space-y-3">
            {queue.filter((c) => c.vetId === user?.id).length === 0 ? (
              <p className="text-sm text-slate-500 italic">No tienes consultas asignadas actualmente</p>
            ) : (
              queue
                .filter((c) => c.vetId === user?.id)
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-slate-200 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Paciente: {c.pet?.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{c.notes}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/call/${c.id}`)}
                      className="px-3 py-1.5 bg-primary-900 text-white rounded-lg text-xs font-semibold hover:bg-primary-800"
                    >
                      Ingresar a Sala
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardVet;
