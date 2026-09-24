import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Consultation, ApiResponse, User } from '../types';
import { PrescriptionModal } from '../components/ui/PrescriptionModal';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ConsultationQueueSkeleton } from '../components/ui/Skeleton';
import {
  Stethoscope,
  Activity,
  Clock,
  Star,
  ShieldCheck,
  Radio,
  FileText,
  Users,
  CheckCircle2,
  Award,
  LogOut,
  ArrowRight,
  Video,
  AlertTriangle,
  HeartHandshake,
  Timer,
  Sparkles,
} from 'lucide-react';

export const DashboardVet: React.FC = () => {
  const { user, logout, refreshSession } = useAuth();
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
    refreshSession?.();
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
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      alert(apiErr.response?.data?.error?.message || 'Error al asignar consulta');
    }
  };

  const getPriorityBadge = (notes?: string | null) => {
    if (notes?.includes('ROJO')) {
      return (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse"
          data-testid="badge-priority-rojo"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          ROJO • EMERGENCIA VITAL
        </span>
      );
    }
    if (notes?.includes('AMARILLO')) {
      return (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-sm"
          data-testid="badge-priority-amarillo"
        >
          AMARILLO • URGENCIA
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-sm"
        data-testid="badge-priority-verde"
      >
        VERDE • REGULAR
      </span>
    );
  };

  const waitingQueue = queue.filter((c) => c.status === 'WAITING');
  const assignedList = queue.filter((c) => c.vetId === user?.id);
  const hasUrgentRed = waitingQueue.some((c) => c.notes?.includes('ROJO'));

  // Calificación médica real del profesional (calculada a partir de reseñas de tutores)
  const ratingCount = user?.ratingCount ?? 0;
  const ratingAvg = user?.ratingAvg ?? 0;
  const hasReviews = ratingCount > 0;

  // Tiempo de espera real promedio calculado dinámicamente de la cola FIFO
  const avgWaitTimeMinutes = useMemo(() => {
    if (waitingQueue.length === 0) return '00:00';
    const now = Date.now();
    const totalMs = waitingQueue.reduce(
      (acc, c) => acc + Math.max(0, now - new Date(c.createdAt).getTime()),
      0
    );
    const avgMs = totalMs / waitingQueue.length;
    const mins = Math.floor(avgMs / 60000);
    const secs = Math.floor((avgMs % 60000) / 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [waitingQueue]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#F8F5EE] p-6 max-w-7xl mx-auto space-y-6"
        data-testid="vet-loading-state"
      >
        <div className="bg-white/80 p-6 rounded-2xl shadow-sm h-28 border border-[#E8E2D5] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/70 rounded-2xl border border-[#E8E2D5] animate-pulse" />
          ))}
        </div>
        <ConsultationQueueSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F8F5EE] text-[#06241D] antialiased selection:bg-emerald-500 selection:text-white p-4 sm:p-6 lg:p-8"
      data-testid="dashboard-vet-page"
    >
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Inicio', path: '/' },
            { label: 'Tablero de Guardia Profesional' },
          ]}
          className="mb-4"
        />

        {/* 1. Header Clínico de Comando / Cockpit */}
        <header className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5] mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#06241D] to-emerald-800 text-white flex items-center justify-center shadow-md">
                <Stethoscope className="w-7 h-7 text-emerald-300" aria-hidden="true" />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1
                  className="text-xl sm:text-2xl font-extrabold text-[#06241D] tracking-tight"
                  data-testid="header-vet-title"
                >
                  VetConnect — Tablero de Guardia Profesional
                </h1>
                <span
                  data-testid="vet-status-badge"
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-bold rounded-full border ${
                    user?.vetStatus === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Matrícula: {user?.vetStatus || 'PENDING'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-1" data-testid="vet-license-info">
                Dr/a. {user?.firstName} {user?.lastName}{' '}
                <span className="font-mono font-semibold text-slate-700">
                  (Matrícula: {user?.licenseNumber || 'N/A'})
                </span>{' '}
                • Homologado SENASA Res. 1442/2021
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Tactile Switch Físico de Guardia */}
            <label
              htmlFor="presence-toggle-input"
              className={`relative flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 rounded-xl border transition-all duration-300 shadow-sm ${
                isOnline
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 hover:bg-emerald-100/90'
                  : 'bg-slate-100/90 border-slate-300 text-slate-700 hover:bg-slate-200/90'
              }`}
            >
              {/* Canonical input for test compatibility */}
              <input
                id="presence-toggle-input"
                type="checkbox"
                data-testid="presence-toggle-switch"
                checked={isOnline}
                onChange={handleToggleOnline}
                className="sr-only"
              />

              <div
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  isOnline ? 'bg-emerald-600' : 'bg-slate-400'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isOnline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  {isOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      EN GUARDIA ACTIVA
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      GUARDIA EN PAUSA
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                  {isOnline ? 'LiveKit SFU 18ms HD' : 'No recibirás pacientes'}
                </span>
              </div>
            </label>

            <button
              data-testid="vet-logout-button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-[#E8E2D5] rounded-xl text-xs font-bold transition shadow-sm"
              title="Cerrar sesión segura"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* 2. Bento Grid: KPIs del Turno en Vivo */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI 1: Pacientes en Espera */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Pacientes en Espera
              </span>
              <div
                className={`p-2 rounded-xl ${
                  hasUrgentRed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Users className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-[#06241D] tracking-tight font-mono">
                {waitingQueue.length}
              </span>
              <p className="text-xs mt-1 font-medium">
                {hasUrgentRed ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    Código Rojo en espera
                  </span>
                ) : (
                  <span className="text-emerald-700">Cola FIFO en tiempo real</span>
                )}
              </p>
            </div>
          </div>

          {/* KPI 2: Tiempo de Espera Promedio */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Espera Promedio
              </span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                <Timer className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-[#06241D] tracking-tight font-mono" data-testid="vet-avg-wait-time">
                {avgWaitTimeMinutes}
                <span className="text-sm font-sans font-semibold text-slate-500 ml-1">min</span>
              </span>
              <p className="text-xs mt-1 text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                Meta de guardia &lt; 3 min
              </p>
            </div>
          </div>

          {/* KPI 3: Pacientes Atendidos Hoy */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Atendidos en Turno
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Activity className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-[#06241D] tracking-tight font-mono">
                {assignedList.length}
              </span>
              <p className="text-xs mt-1 text-slate-500">
                Casos asignados hoy en guardia
              </p>
            </div>
          </div>

          {/* KPI 4: Reputación Médica Dinámica y Realista */}
          <div
            className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col justify-between"
            data-testid="kpi-vet-rating"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Calificación Médica
              </span>
              <div
                className={`p-2 rounded-xl ${
                  hasReviews ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Award className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              {hasReviews ? (
                <>
                  <span
                    className="text-3xl font-extrabold text-[#06241D] tracking-tight font-mono"
                    data-testid="vet-rating-score"
                  >
                    {ratingAvg.toFixed(2)}
                  </span>
                  <div
                    className="flex items-center text-amber-400"
                    aria-label={`Calificación promedio: ${ratingAvg.toFixed(2)} de 5 estrellas`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(ratingAvg)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-300'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <span
                    className="text-3xl font-extrabold text-slate-400 tracking-tight font-mono"
                    data-testid="vet-rating-score"
                  >
                    —
                  </span>
                  <div
                    className="flex items-center text-slate-300"
                    aria-label="Sin calificaciones registradas aún"
                    title="Sin calificaciones registradas aún"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 stroke-slate-300 fill-none" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    Nuevo
                  </span>
                </>
              )}
            </div>

            <div className="mt-1">
              {hasReviews ? (
                <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>
                    {ratingCount} {ratingCount === 1 ? 'consulta calificada' : 'consultas calificadas'}
                  </span>
                  {ratingAvg >= 4.8 && (
                    <span className="text-emerald-700 font-bold ml-1">• Nivel excelencia SENASA</span>
                  )}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Sin valoraciones aún • 0 consultas calificadas</span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 3. Columnas Principales: Cola de Guardia & Consultas Tomadas */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Cola de Espera (FIFO) */}
          <section
            className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5]"
            data-testid="triage-waiting-room"
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2.5">
                <h2
                  className="text-lg font-bold text-[#06241D] tracking-tight"
                  data-testid="waiting-room-title"
                >
                  Sala de Espera (Guardia Telemática FIFO)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#06241D] text-white font-mono">
                  {waitingQueue.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Tiempo Real</span>
              </div>
            </div>

            <div className="space-y-4" data-testid="waiting-queue-list">
              {waitingQueue.length === 0 ? (
                /* Empty state con carisma y tranquilidad */
                <div
                  className="p-10 text-center bg-[#FAF8F4] border border-[#E8E2D5] rounded-2xl flex flex-col items-center justify-center"
                  data-testid="empty-queue-state"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-4 shadow-sm">
                    <HeartHandshake className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#06241D] mb-1">
                    ¡Todo en calma por ahora, Doctor/a!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm leading-relaxed mb-4">
                    La sala de espera de guardia está despejada. Te notificaremos al instante en
                    que un tutor solicite atención telemática.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8E2D5] rounded-full text-[11px] font-semibold text-slate-600 shadow-sm">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" aria-hidden="true" />
                    Canal Socket.io escuchando solicitudes 24/7
                  </span>
                </div>
              ) : (
                waitingQueue.map((c) => {
                  const isRed = c.notes?.includes('ROJO');
                  return (
                    <div
                      key={c.id}
                      data-testid={`waiting-card-${c.id}`}
                      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        isRed
                          ? 'border-rose-300 bg-rose-50/50 shadow-sm'
                          : 'border-[#E8E2D5] bg-white hover:border-emerald-300 shadow-sm'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getPriorityBadge(c.notes)}
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            Ingreso: {new Date(c.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-[#06241D] text-base tracking-tight">
                          Paciente: {c.pet?.name || 'Mascota'}{' '}
                          <span className="font-medium text-slate-500 text-xs">
                            ({c.pet?.species || 'Canino'}
                            {c.pet?.breed ? ` • ${c.pet.breed}` : ''})
                          </span>
                        </h3>

                        <p className="text-xs text-slate-700 mt-1 bg-white/70 p-2.5 rounded-lg border border-[#E8E2D5]/70">
                          <span className="font-semibold text-slate-900">Motivo: </span>
                          {c.notes || 'Consulta médica general'}
                        </p>
                      </div>

                      <button
                        data-testid={`assign-patient-button-${c.id}`}
                        onClick={() => handleAssignAndJoin(c.id)}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98] ${
                          isRed
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                        }`}
                      >
                        <span>Atender Paciente</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Columna Derecha: Consultas Asignadas & Recetas */}
          <section
            className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5]"
            data-testid="assigned-consultations-section"
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#06241D] tracking-tight">
                  Mis Consultas Asignadas
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#06241D] text-white font-mono">
                  {assignedList.length}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">Gestión Activa</span>
            </div>

            <div className="space-y-4" data-testid="assigned-list">
              {assignedList.length === 0 ? (
                <div
                  className="p-8 text-center bg-[#FAF8F4] border border-[#E8E2D5] rounded-2xl flex flex-col items-center justify-center"
                  data-testid="empty-assigned-state"
                >
                  <Activity className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
                  <p className="text-xs font-bold text-[#06241D]">
                    Sin registros de consultas asignadas
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Toma un caso de la sala de espera para iniciar la videoconsulta y emitir recetas
                    digitales.
                  </p>
                </div>
              ) : (
                assignedList.map((c) => (
                  <div
                    key={c.id}
                    data-testid={`assigned-card-${c.id}`}
                    className="p-4 border border-[#E8E2D5] rounded-2xl bg-white shadow-sm flex flex-col justify-between gap-3 hover:border-emerald-300 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[#06241D] text-sm">
                          Paciente: {c.pet?.name || 'Mascota'}
                          {c.pet?.breed && (
                            <span className="text-xs text-slate-500 font-normal ml-1">
                              ({c.pet.breed})
                            </span>
                          )}
                        </h3>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 uppercase tracking-wide">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{c.notes}</p>

                      {c.review && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                          <div className="flex items-center justify-between text-amber-900 font-semibold mb-1">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3 h-3 text-amber-600" aria-hidden="true" />
                              Valoración del tutor:
                            </span>
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= c.review!.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-slate-100 text-slate-300'
                                  }`}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                          </div>
                          {c.review.comment && (
                            <p className="text-slate-700 text-[11px] italic bg-white/80 p-1.5 rounded-lg border border-amber-100">
                              "{c.review.comment}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D5]">
                      <button
                        data-testid={`join-call-vet-button-${c.id}`}
                        onClick={() => navigate(`/call/${c.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#06241D] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        <span>Sala Video</span>
                      </button>

                      <button
                        data-testid={`emit-prescription-button-${c.id}`}
                        onClick={() => {
                          setSelectedConsId(c.id);
                          setShowPrescriptionModal(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Receta QR</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        {/* Modal Emisión de Receta Digital Oficial SENASA */}
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          consultationId={selectedConsId}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            fetchQueue();
          }}
        />
      </div>
    </div>
  );
};

export default DashboardVet;
