import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { User, ApiResponse } from '../types';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Stethoscope,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Search,
  Clock,
  Timer,
  Award,
  Sparkles,
  Loader2,
  Building2,
  FileText,
  BadgeCheck,
  Check,
} from 'lucide-react';

const QUICK_REASONS = [
  'Matrícula no vigente en padrón público',
  'Falta comprobante de habilitación',
  'Inconsistencia en datos personales',
];

const SPECIALTY_OPTIONS = [
  { id: 'ALL', label: 'Todas las especialidades' },
  { id: 'CLINICA', label: 'Clínica General' },
  { id: 'FELINA', label: 'Medicina Felina' },
  { id: 'URGENCIAS', label: 'Urgencias y UCI' },
  { id: 'CIRUGIA', label: 'Cirugía' },
  { id: 'DERMATOLOGIA', label: 'Dermatología' },
];

export const AdminVets: React.FC = () => {
  const { user } = useAuth();

  const [pendingVets, setPendingVets] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [id: string]: string }>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [id: string]: 'approve' | 'reject' | null }>({});

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  useEffect(() => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      setDebouncedSearchQuery(searchQuery);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  interface AdminStats {
    pendingVets: number;
    approvedVets: number;
    rejectedVets: number;
    onlineVets: number;
    approvalRate: number;
  }
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get<ApiResponse<AdminStats>>('/api/admin/stats');
      if (res.data.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching admin stats:', err);
    }
  };

  const fetchPendingVets = async () => {
    try {
      setError(null);
      const res = await api.get<ApiResponse<User[]>>('/api/admin/vets/pending');
      if (res.data.success && res.data.data) {
        setPendingVets(res.data.data);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message || 'Error al cargar veterinarios pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVets();
    fetchStats();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      const res = await api.patch<ApiResponse<User>>(`/api/admin/vets/${id}/approve`);
      if (res.data.success) {
        setPendingVets((prev) => prev.filter((v) => v.id !== id));
        showToast('success', 'Matrícula aprobada exitosamente');
        fetchStats();
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      showToast('error', apiErr.response?.data?.error?.message || 'Error al aprobar matrícula');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectReason[id] || 'Documentación incompleta o no válida';
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      const res = await api.patch<ApiResponse<User>>(`/api/admin/vets/${id}/reject`, { reason });
      if (res.data.success) {
        setPendingVets((prev) => prev.filter((v) => v.id !== id));
        showToast('success', 'Matrícula rechazada');
        fetchStats();
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      showToast('error', apiErr.response?.data?.error?.message || 'Error al rechazar matrícula');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Reciente';
      if (diffHours < 24) return `Hace ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Ayer';
      return `Hace ${diffDays}d`;
    } catch {
      return 'Reciente';
    }
  };

  // Filtered List
  const filteredVets = useMemo(() => {
    return pendingVets.filter((vet) => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const fullName = `${vet.firstName || ''} ${vet.lastName || ''}`.toLowerCase();
      const email = (vet.email || '').toLowerCase();
      const license = (vet.licenseNumber || '').toLowerCase();
      const bio = (vet.bio || '').toLowerCase();

      const matchesQuery =
        !query ||
        fullName.includes(query) ||
        email.includes(query) ||
        license.includes(query) ||
        bio.includes(query);

      const matchesSpecialty =
        selectedSpecialty === 'ALL' ||
        (selectedSpecialty === 'CLINICA' && (bio.includes('general') || bio.includes('clínica') || bio === '')) ||
        (selectedSpecialty === 'FELINA' && bio.includes('felin')) ||
        (selectedSpecialty === 'URGENCIAS' && (bio.includes('urg') || bio.includes('uci') || bio.includes('terapia'))) ||
        (selectedSpecialty === 'CIRUGIA' && bio.includes('cirug')) ||
        (selectedSpecialty === 'DERMATOLOGIA' && bio.includes('dermat'));

      return matchesQuery && matchesSpecialty;
    });
  }, [pendingVets, debouncedSearchQuery, selectedSpecialty]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#FAF8F5] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
        data-testid="admin-vets-loading"
      >
        <div className="bg-white/80 p-6 rounded-2xl shadow-sm h-28 border border-[#E8E2D5] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/70 rounded-2xl border border-[#E8E2D5] animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-[#E8E2D5]">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FAF8F5] text-[#06241D] antialiased selection:bg-emerald-500 selection:text-white p-4 sm:p-6 lg:p-8"
      data-testid="admin-vets-page"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Inicio', path: '/' },
            { label: 'Administración' },
            { label: 'Fiscalización de Veterinarios' },
          ]}
          className="mb-2"
        />

        {/* 1. Membrete Institucional & Header de Auditoría Sanitaria */}
        <header className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#06241D] to-emerald-900 text-white flex items-center justify-center shadow-md shrink-0 border border-emerald-800/40">
              <ShieldCheck className="w-7 h-7 text-emerald-300" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                  <Building2 className="w-3 h-3 text-slate-600" />
                  República Argentina • SENASA Res. 1442/2021
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Fiscalización Central Activa
                </span>
              </div>

              <h1
                className="text-xl sm:text-2xl font-extrabold text-[#06241D] tracking-tight"
                data-testid="admin-title"
              >
                Panel de Auditoría de Matrículas SENASA (ADMIN)
              </h1>

              <p className="text-xs sm:text-sm text-slate-600">
                Auditoría deontológica, validación de habilitaciones provinciales/nacionales y firma de recetas oficiales
              </p>
            </div>
          </div>

          {/* Auditor Identifier & Status */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D5] w-full lg:w-auto shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-sm shadow-inner">
              {user?.firstName ? user.firstName[0] : 'A'}
              {user?.lastName ? user.lastName[0] : 'S'}
            </div>
            <div className="text-left text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#06241D]">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Auditor Central SENASA'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#06241D] text-white">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <p className="text-slate-700 font-mono text-[11px] font-semibold">Matrícula Fiscal N° 01-FED</p>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {/* 2. Bento Grid de KPIs de Fiscalización Sanitaria Dinámicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Matrículas Pendientes */}
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E8E2D5] shadow-[0_4px_20px_-4px_rgba(6,36,29,0.05)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Expedientes Pendientes</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#06241D] tracking-tight">{stats?.pendingVets ?? pendingVets.length}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    (stats?.pendingVets ?? pendingVets.length) > 0
                      ? 'bg-amber-100 text-amber-950 border-amber-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  }`}
                >
                  {(stats?.pendingVets ?? pendingVets.length) > 0 ? 'Dictamen requerido' : 'Al día'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">Solicitudes en cola de revisión deontológica</p>
            </div>

            {/* Card 2: Veterinarios Activos en Guardia */}
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E8E2D5] shadow-[0_4px_20px_-4px_rgba(6,36,29,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Guardia 24hs Activa</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#06241D] tracking-tight">{stats?.onlineVets ?? 0}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  En Turno
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">Médicos habilitados conectados a la guardia</p>
            </div>

            {/* Card 3: Tasa de Aprobación Sanitaria */}
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E8E2D5] shadow-[0_4px_20px_-4px_rgba(6,36,29,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Aprobación Sanitaria</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#06241D] tracking-tight">{stats ? `${stats.approvalRate}%` : '100%'}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-950 border border-sky-300">
                  {stats ? `${stats.approvedVets} aprobados` : 'Histórico'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">Conformidad con padrón federal SENASA</p>
            </div>

            {/* Card 4: Veterinarios Certificados */}
            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E8E2D5] shadow-[0_4px_20px_-4px_rgba(6,36,29,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Padrón Colegiado</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#06241D] tracking-tight">{stats?.approvedVets ?? 0}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                  Habilitados
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">Profesionales con firma de receta digital activa</p>
            </div>
          </div>

        {/* 3. Toast Notifications & Error Alerts */}
        {notification && (
          <div
            data-testid="admin-toast-notification"
            className={`p-4 rounded-2xl shadow-lg border flex justify-between items-center transition-all animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/95 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-sm font-bold tracking-tight">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold p-1.5 rounded-lg hover:bg-black/5 active:bg-black/10 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm"
            data-testid="admin-error-alert"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4. Barra de Búsqueda y Filtros Rápidos */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#E8E2D5] shadow-[0_4px_20px_-4px_rgba(6,36,29,0.05)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre profesional, matrícula o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D5] text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {SPECIALTY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedSpecialty(opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSpecialty === opt.id
                    ? 'bg-[#06241D] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/70 border border-[#E8E2D5]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Tabla de Expedientes Clínicos (Satin Records) */}
        <section
          className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5]"
          data-testid="admin-vets-table-container"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-[#E8E2D5]">
            <div>
              <h2
                className="text-lg font-extrabold text-[#06241D] tracking-tight"
                data-testid="pending-vets-count"
              >
                Veterinarios Pendientes de Aprobación ({pendingVets.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mostrando {filteredVets.length} de {pendingVets.length} expedientes en trámite
              </p>
            </div>

            {pendingVets.length > 0 && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                Protocolo Anti-Fraude Activo
              </span>
            )}
          </div>

          {pendingVets.length === 0 ? (
            <div
              className="p-10 text-center bg-gradient-to-b from-[#FAF8F5]/60 to-[#FAF8F5] border border-dashed border-[#E8E2D5] rounded-2xl flex flex-col items-center justify-center transition-all"
              data-testid="empty-pending-vets"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 shadow-inner border border-emerald-100">
                <Award className="w-8 h-8 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-[#06241D] text-base mb-1.5">
                Padrón de Guardia al Día: Todas las solicitudes de matrícula han sido auditadas.
              </h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-2">
                Sin registros de veterinarios pendientes de aprobación. Todos los postulantes cuentan con dictamen emitido bajo la Resolución SENASA 1442/2021.
              </p>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Sello de Verificación Sanitaria Completa
              </span>
            </div>
          ) : filteredVets.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-600 text-sm">
              <p className="font-bold text-slate-800">No se encontraron postulantes con esos filtros</p>
              <p className="text-xs text-slate-500 mt-1">Pruebe modificando el término de búsqueda o especialidad.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('ALL');
                }}
                className="mt-3 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]" data-testid="pending-vets-table">
                <thead>
                  <tr className="border-b border-[#E8E2D5] bg-[#FAF8F5]/80 text-[#06241D]">
                    <th scope="col" className="p-3.5 font-extrabold text-xs uppercase tracking-wider rounded-l-xl">
                      Profesional & Contacto
                    </th>
                    <th scope="col" className="p-3.5 font-extrabold text-xs uppercase tracking-wider">
                      Matrícula Oficial
                    </th>
                    <th scope="col" className="p-3.5 font-extrabold text-xs uppercase tracking-wider">
                      Especialidad / Perfil
                    </th>
                    <th scope="col" className="p-3.5 font-extrabold text-xs uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th scope="col" className="p-3.5 font-extrabold text-xs uppercase tracking-wider text-right rounded-r-xl">
                      Dictamen de Auditoría
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVets.map((vet) => {
                    const isApproving = actionLoading[vet.id] === 'approve';
                    const isRejecting = actionLoading[vet.id] === 'reject';
                    const isBusy = isApproving || isRejecting;

                    return (
                      <tr
                        key={vet.id}
                        data-testid={`vet-row-${vet.id}`}
                        className="hover:bg-[#FAF8F5]/50 transition-colors duration-150"
                      >
                        {/* 1. Profesional Column */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-xs shadow-inner shrink-0">
                              {vet.firstName ? vet.firstName[0] : 'V'}
                              {vet.lastName ? vet.lastName[0] : 'P'}
                            </div>
                            <div>
                              <div
                                className="font-bold text-[#06241D] text-sm tracking-tight"
                                data-testid={`vet-name-${vet.id}`}
                              >
                                Dr/a. {vet.firstName} {vet.lastName}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">{vet.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* 2. License Column */}
                        <td className="p-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-mono text-xs font-bold tracking-wider"
                            data-testid={`vet-license-${vet.id}`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                            {vet.licenseNumber || 'N/A'}
                          </span>
                        </td>

                        {/* 3. Speciality / Bio Column */}
                        <td className="p-4" data-testid={`vet-speciality-${vet.id}`}>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                            {vet.bio || 'General'}
                          </span>
                        </td>

                        {/* 4. Date Column */}
                        <td className="p-4">
                          <div className="text-xs text-slate-800 font-bold">
                            {new Date(vet.createdAt).toLocaleDateString()}
                          </div>
                          <span className="text-[10px] text-slate-600 font-semibold">
                            {getRelativeTime(vet.createdAt)}
                          </span>
                        </td>

                        {/* 5. Actions Column */}
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              {/* Reason input with canonical testid */}
                              <input
                                type="text"
                                data-testid={`input-reject-reason-${vet.id}`}
                                placeholder="Motivo de rechazo..."
                                value={rejectReason[vet.id] || ''}
                                onChange={(e) =>
                                  setRejectReason({ ...rejectReason, [vet.id]: e.target.value })
                                }
                                disabled={isBusy}
                                className="px-3 py-1.5 text-xs border border-[#E8E2D5] focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-lg w-44 placeholder:text-slate-500 transition-all bg-white"
                              />

                              {/* Reject Button */}
                              <button
                                type="button"
                                data-testid={`reject-vet-button-${vet.id}`}
                                onClick={() => handleReject(vet.id)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                              >
                                {isRejecting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                <span>Rechazar</span>
                              </button>

                              {/* Approve Button */}
                              <button
                                type="button"
                                data-testid={`approve-vet-button-${vet.id}`}
                                onClick={() => handleApprove(vet.id)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-extrabold transition-all shadow-sm shadow-emerald-700/20 disabled:opacity-50 cursor-pointer"
                              >
                                {isApproving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Aprobar Matrícula</span>
                              </button>
                            </div>

                            {/* Quick Reject Chips for Fast Audit */}
                            <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-md">
                              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mr-1">
                                Motivo frecuente:
                              </span>
                              {QUICK_REASONS.map((reason) => (
                                <button
                                  key={reason}
                                  type="button"
                                  onClick={() =>
                                    setRejectReason((prev) => ({ ...prev, [vet.id]: reason }))
                                  }
                                  className="text-[10px] font-semibold text-slate-700 hover:text-rose-900 bg-slate-100 hover:bg-rose-50 px-2 py-0.5 rounded border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer"
                                  title={`Usar: ${reason}`}
                                >
                                  {reason.split(' ')[0]} {reason.split(' ')[1]}...
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      </div>
    </div>
  );
};

export default AdminVets;
