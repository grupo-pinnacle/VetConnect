import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, ApiResponse } from '../types';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { X } from 'lucide-react';

export const AdminVets: React.FC = () => {
  const [pendingVets, setPendingVets] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [id: string]: string }>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPendingVets = async () => {
    try {
      setError(null);
      const res = await api.get<ApiResponse<User[]>>('/api/admin/vets/pending');
      if (res.data.success && res.data.data) {
        setPendingVets(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar veterinarios pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVets();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await api.patch<ApiResponse<User>>(`/api/admin/vets/${id}/approve`);
      if (res.data.success) {
        setPendingVets((prev) => prev.filter((v) => v.id !== id));
        showToast('success', 'Matrícula aprobada exitosamente');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error?.message || 'Error al aprobar matrícula');
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectReason[id] || 'Documentación incompleta o no válida';
    try {
      const res = await api.patch<ApiResponse<User>>(`/api/admin/vets/${id}/reject`, { reason });
      if (res.data.success) {
        setPendingVets((prev) => prev.filter((v) => v.id !== id));
        showToast('success', 'Matrícula rechazada');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error?.message || 'Error al rechazar matrícula');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 max-w-7xl mx-auto space-y-6" data-testid="admin-vets-loading">
        <div className="bg-white p-4 rounded-xl shadow-sm h-20 animate-pulse" />
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" data-testid="admin-vets-page">
      <Breadcrumbs
        items={[
          { label: 'Inicio', path: '/' },
          { label: 'Administración' },
          { label: 'Fiscalización de Veterinarios' },
        ]}
        className="mb-4"
      />
      <header className="bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-primary-900" data-testid="admin-title">
            Panel de Auditoría de Matrículas SENASA (ADMIN)
          </h1>
          <p className="text-sm text-slate-600">
            Validación profesional de médicos veterinarios para habilitación en plataforma
          </p>
        </div>
      </header>

      {/* Custom Toast Notification */}
      {notification && (
        <div
          data-testid="admin-toast-notification"
          className={`p-4 rounded-xl mb-6 text-sm font-semibold flex justify-between items-center transition ${
            notification.type === 'success'
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
              : 'bg-red-100 border border-red-300 text-red-900'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold p-1 rounded hover:bg-black/10 flex items-center justify-center"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium" data-testid="admin-error-alert">
          {error}
        </div>
      )}

      <main className="bg-white p-6 rounded-xl shadow-sm" data-testid="admin-vets-table-container">
        <h2 className="text-lg font-semibold text-slate-800 mb-4" data-testid="pending-vets-count">
          Veterinarios Pendientes de Aprobación ({pendingVets.length})
        </h2>

        {pendingVets.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 italic bg-slate-50 rounded-lg" data-testid="empty-pending-vets">
            Sin registros de veterinarios pendientes de aprobación
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" data-testid="pending-vets-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-semibold text-slate-700">Nombre Profesional</th>
                  <th className="p-3 font-semibold text-slate-700">Email</th>
                  <th className="p-3 font-semibold text-slate-700">Matrícula</th>
                  <th className="p-3 font-semibold text-slate-700">Especialidad</th>
                  <th className="p-3 font-semibold text-slate-700">Fecha Registro</th>
                  <th className="p-3 font-semibold text-slate-700 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody>
                {pendingVets.map((vet) => (
                  <tr key={vet.id} data-testid={`vet-row-${vet.id}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800" data-testid={`vet-name-${vet.id}`}>
                      Dr/a. {vet.firstName} {vet.lastName}
                    </td>
                    <td className="p-3 text-slate-600">{vet.email}</td>
                    <td className="p-3 font-mono text-xs text-sky-700 font-bold" data-testid={`vet-license-${vet.id}`}>
                      {vet.licenseNumber || 'N/A'}
                    </td>
                    <td className="p-3 text-slate-600 text-xs" data-testid={`vet-speciality-${vet.id}`}>
                      {vet.bio || 'General'}
                    </td>
                    <td className="p-3 text-slate-500 text-xs">
                      {new Date(vet.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <input
                          type="text"
                          data-testid={`input-reject-reason-${vet.id}`}
                          placeholder="Motivo rechazo..."
                          value={rejectReason[vet.id] || ''}
                          onChange={(e) =>
                            setRejectReason({ ...rejectReason, [vet.id]: e.target.value })
                          }
                          className="px-2 py-1 text-xs border rounded w-36"
                        />
                        <button
                          data-testid={`reject-vet-button-${vet.id}`}
                          onClick={() => handleReject(vet.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                        >
                          Rechazar
                        </button>
                        <button
                          data-testid={`approve-vet-button-${vet.id}`}
                          onClick={() => handleApprove(vet.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                        >
                          Aprobar Matrícula
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminVets;
