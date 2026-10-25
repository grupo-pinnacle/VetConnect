import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ApiResponse, User } from '../types';
import {
  Users,
  PawPrint,
  Video,
  ShieldCheck,
  Activity,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  MessageSquare,
  Ban,
  AlertTriangle,
  X,
  Check,
  Eye,
  FileText,
  LogOut,
  Menu,
  Stethoscope,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { getWeightAssessment } from '../data/petBreeds';

interface AdminStats {
  pendingVets: number;
  approvedVets: number;
  rejectedVets: number;
  onlineVets: number;
  approvalRate: number;
  clientsCount?: number;
  vetsCount?: number;
  adminsCount?: number;
  activePetsCount?: number;
  deletedPetsCount?: number;
  totalConsultations?: number;
  waitingConsultations?: number;
  activeConsultations?: number;
  completedConsultations?: number;
  cancelledConsultations?: number;
}

interface AdminPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  weightKg: number | null;
  sex: string | null;
  microchip: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  createdAt: string;
  deletedAt: string | null;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

interface AdminConsultation {
  id: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  diagnosisNotes: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  client: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  vet: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    licenseNumber?: string | null;
  } | null;
  pet: {
    name: string;
    species: string;
    breed: string;
  };
  review: {
    rating: number;
    comment: string | null;
  } | null;
  _count?: {
    messages: number;
  };
}

interface AdminChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    photoUrl?: string | null;
  };
}

interface AuditLogItem {
  id: string;
  action: string;
  targetId: string | null;
  details: any;
  createdAt: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function AdminApp() {
  const { user, logout } = useAuth();

  // Navigation tab
  const getInitialTab = (): 'dashboard' | 'users' | 'pets' | 'consultations' | 'vets' | 'audit' => {
    const p = window.location.pathname;
    if (p.includes('/admin/users')) return 'users';
    if (p.includes('/admin/pets')) return 'pets';
    if (p.includes('/admin/consultations')) return 'consultations';
    if (p.includes('/admin/vets')) return 'vets';
    if (p.includes('/admin/audit')) return 'audit';
    return 'dashboard';
  };

  const [tab, setTab] = useState<'dashboard' | 'users' | 'pets' | 'consultations' | 'vets' | 'audit'>(getInitialTab);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);

  const notify = (msg: string) => setToast({ msg, id: Date.now() });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast?.id]);

  const switchTab = (nextTab: typeof tab) => {
    setTab(nextTab);
    setMobileMenu(false);
    window.history.pushState(null, '', `/admin/${nextTab === 'dashboard' ? 'dashboard' : nextTab}`);
  };

  // State data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userIncludeDeleted, setUserIncludeDeleted] = useState(true);

  const [petSearch, setPetSearch] = useState('');
  const [petFilter, setPetFilter] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');

  const [consStatusFilter, setConsStatusFilter] = useState<string>('ALL');

  // Modals state: Users & Pets CRUD
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<AdminPet | null>(null);

  // Ban Modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [targetBanUser, setTargetBanUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [isBanning, setIsBanning] = useState(false);

  // Chat Inspector Modal state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<AdminConsultation | null>(null);
  const [consultationMessages, setConsultationMessages] = useState<AdminChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Form states for User
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT',
    licenseNumber: '',
    bio: '',
  });

  // Form states for Pet
  const [petForm, setPetForm] = useState({
    ownerId: '',
    name: '',
    species: 'Perro',
    breed: 'Mestizo',
    weightKg: '',
    sex: 'Macho',
    microchip: '',
    allergies: '',
    chronicConditions: '',
  });

  // Fetch initial data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers, resPets, resCons, resLogs] = await Promise.all([
        api.get<ApiResponse<AdminStats>>('/api/admin/stats'),
        api.get<ApiResponse<User[]>>('/api/admin/users?includeDeleted=true'),
        api.get<ApiResponse<AdminPet[]>>('/api/admin/pets?includeDeleted=true'),
        api.get<ApiResponse<AdminConsultation[]>>('/api/admin/consultations'),
        api.get<ApiResponse<AuditLogItem[]>>('/api/admin/audit-logs'),
      ]);

      if (resStats.data.success && resStats.data.data) setStats(resStats.data.data);
      if (resUsers.data.success && resUsers.data.data) setUsers(resUsers.data.data);
      if (resPets.data.success && resPets.data.data) setPets(resPets.data.data);
      if (resCons.data.success && resCons.data.data) setConsultations(resCons.data.data);
      if (resLogs.data.success && resLogs.data.data) setAuditLogs(resLogs.data.data);
    } catch (err: unknown) {
      console.warn('Error loading admin data:', err);
      notify('No se pudieron cargar todos los datos administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userIncludeDeleted && u.deletedAt) return false;
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
      if (!userSearch) return true;
      const s = userSearch.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(s) ||
        u.lastName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.licenseNumber?.toLowerCase().includes(s)
      );
    });
  }, [users, userRoleFilter, userIncludeDeleted, userSearch]);

  const filteredPets = useMemo(() => {
    return pets.filter((p) => {
      if (petFilter === 'ACTIVE' && p.deletedAt) return false;
      if (petFilter === 'HIDDEN' && !p.deletedAt) return false;
      if (!petSearch) return true;
      const s = petSearch.toLowerCase();
      return (
        p.name?.toLowerCase().includes(s) ||
        p.breed?.toLowerCase().includes(s) ||
        p.species?.toLowerCase().includes(s) ||
        p.owner?.firstName?.toLowerCase().includes(s) ||
        p.owner?.lastName?.toLowerCase().includes(s) ||
        p.owner?.email?.toLowerCase().includes(s)
      );
    });
  }, [pets, petFilter, petSearch]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      if (consStatusFilter !== 'ALL' && c.status !== consStatusFilter) return false;
      return true;
    });
  }, [consultations, consStatusFilter]);

  // Handlers for User CRUD
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'CLIENT',
      licenseNumber: '',
      bio: '',
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: '',
      phone: u.phone || '',
      role: u.role,
      licenseNumber: u.licenseNumber || '',
      bio: u.bio || '',
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phone: userForm.phone || null,
          role: userForm.role,
          licenseNumber: userForm.role === 'VET' ? userForm.licenseNumber || null : null,
          bio: userForm.bio || null,
        };
        if (userForm.password) payload.password = userForm.password;

        const res = await api.patch<ApiResponse<User>>(`/api/admin/users/${editingUser.id}`, payload);
        if (res.data.success) {
          notify(`Usuario ${userForm.firstName} ${userForm.lastName} actualizado.`);
          setUserModalOpen(false);
          fetchAllData();
        }
      } else {
        const res = await api.post<ApiResponse<User>>('/api/admin/users', userForm);
        if (res.data.success) {
          notify(`Usuario ${userForm.firstName} ${userForm.lastName} creado exitosamente.`);
          setUserModalOpen(false);
          fetchAllData();
        }
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al guardar usuario.');
    }
  };

  // Trigger Ban Modal
  const handleOpenBanModal = (u: User) => {
    setTargetBanUser(u);
    setBanReason('');
    setBanModalOpen(true);
  };

  const handleConfirmBan = async () => {
    if (!targetBanUser) return;
    setIsBanning(true);
    try {
      const res = await api.patch<ApiResponse<User>>(`/api/admin/users/${targetBanUser.id}/ban`, {
        reason: banReason.trim() || 'Infracción grave de términos del servicio.',
      });
      if (res.data.success) {
        notify(`Cuenta de ${targetBanUser.firstName} ${targetBanUser.lastName} suspendida permanentemente.`);
        setBanModalOpen(false);
        setTargetBanUser(null);
        fetchAllData();
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al procesar el baneo de cuenta.');
    } finally {
      setIsBanning(false);
    }
  };

  const handleRestoreUser = async (u: User) => {
    try {
      await api.patch(`/api/admin/users/${u.id}/restore`);
      notify(`Usuario ${u.firstName} ${u.lastName} restaurado.`);
      fetchAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al restaurar usuario.');
    }
  };

  // Handlers for Pet CRUD
  const handleOpenCreatePet = () => {
    setEditingPet(null);
    setPetForm({
      ownerId: users.find((u) => u.role === 'CLIENT')?.id || '',
      name: '',
      species: 'Perro',
      breed: 'Mestizo',
      weightKg: '',
      sex: 'Macho',
      microchip: '',
      allergies: '',
      chronicConditions: '',
    });
    setPetModalOpen(true);
  };

  const handleOpenEditPet = (p: AdminPet) => {
    setEditingPet(p);
    setPetForm({
      ownerId: p.owner?.id || '',
      name: p.name,
      species: p.species,
      breed: p.breed,
      weightKg: p.weightKg !== null ? String(p.weightKg) : '',
      sex: p.sex || 'Macho',
      microchip: p.microchip || '',
      allergies: p.allergies || '',
      chronicConditions: p.chronicConditions || '',
    });
    setPetModalOpen(true);
  };

  const adminPetWeightAssessment = useMemo(() => {
    return getWeightAssessment(petForm.species, petForm.breed, petForm.weightKg);
  }, [petForm.species, petForm.breed, petForm.weightKg]);

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPetWeightAssessment && adminPetWeightAssessment.isBlocking) {
      alert(adminPetWeightAssessment.message);
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed,
        weightKg: petForm.weightKg ? parseFloat(petForm.weightKg) : null,
        sex: petForm.sex,
        microchip: petForm.microchip || null,
        allergies: petForm.allergies || null,
        chronicConditions: petForm.chronicConditions || null,
      };

      if (editingPet) {
        const res = await api.patch<ApiResponse<AdminPet>>(`/api/admin/pets/${editingPet.id}`, payload);
        if (res.data.success) {
          notify(`Mascota ${petForm.name} actualizada con éxito.`);
          setPetModalOpen(false);
          fetchAllData();
        }
      } else {
        payload.ownerId = petForm.ownerId;
        const res = await api.post<ApiResponse<AdminPet>>('/api/admin/pets', payload);
        if (res.data.success) {
          notify(`Mascota ${petForm.name} registrada con éxito.`);
          setPetModalOpen(false);
          fetchAllData();
        }
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al guardar la mascota.');
    }
  };

  const handleDeletePet = async (p: AdminPet) => {
    if (!window.confirm(`¿Seguro que deseás ocultar a la mascota ${p.name}?`)) return;
    try {
      await api.delete(`/api/admin/pets/${p.id}`);
      notify(`Mascota ${p.name} ocultada.`);
      fetchAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al ocultar mascota.');
    }
  };

  const handleRestorePet = async (p: AdminPet) => {
    try {
      await api.patch(`/api/admin/pets/${p.id}/restore`);
      notify(`Mascota ${p.name} restaurada.`);
      fetchAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al restaurar mascota.');
    }
  };

  // SENASA Approval handlers
  const handleApproveVet = async (vetId: string) => {
    try {
      await api.patch(`/api/admin/vets/${vetId}/approve`);
      notify('Matrícula SENASA aprobada exitosamente.');
      fetchAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al aprobar matrícula.');
    }
  };

  const handleRejectVet = async (vetId: string) => {
    const reason = prompt('Motivo de rechazo de la matrícula profesional:');
    if (!reason) return;
    try {
      await api.patch(`/api/admin/vets/${vetId}/reject`, { reason });
      notify('Matrícula rechazada.');
      fetchAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      alert(errorMsg || 'Error al rechazar matrícula.');
    }
  };

  // Open Chat Inspector Modal
  const handleOpenChatInspector = async (cons: AdminConsultation) => {
    setSelectedConsultation(cons);
    setConsultationMessages([]);
    setLoadingMessages(true);
    setChatModalOpen(true);
    try {
      const res = await api.get<ApiResponse<AdminChatMessage[]>>(`/api/admin/consultations/${cons.id}/messages`);
      if (res.data.success && res.data.data) {
        setConsultationMessages(res.data.data);
      }
    } catch (err: unknown) {
      console.warn('Error fetching consultation messages:', err);
      notify('No se pudieron cargar los mensajes del chat.');
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="adm-shell">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-[9999] flex items-center gap-3 py-3 px-5 rounded-xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-top-4 duration-200"
          style={{ backgroundColor: '#183c3a', border: '1px solid #315f5d' }}
        >
          <Check className="w-5 h-5 text-[#609f9c]" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Mobile Scrim Backdrop */}
      {mobileMenu && (
        <button
          className="adm-scrim"
          onClick={() => setMobileMenu(false)}
          aria-label="Cerrar menú de navegación"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`adm-sidebar ${mobileMenu ? 'is-open' : ''}`}>
        <div className="adm-sidebar__head">
          <div className="flex items-center gap-2.5">
            <div className="adm-sidebar__logo-mark">
              V
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">VetConnect</span>
          </div>
          <button
            className="adm-sidebar__close"
            onClick={() => setMobileMenu(false)}
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="adm-sidebar__profile">
          <div className="adm-sidebar__avatar">
            SA
          </div>
          <div className="adm-sidebar__profile-info">
            <span className="adm-sidebar__profile-name">
              {user ? `${user.firstName} ${user.lastName}` : 'Super Admin'}
            </span>
            <span className="adm-sidebar__profile-email">
              {user?.email || 'admin@huellicam.com'}
            </span>
          </div>
        </div>

        <nav className="adm-sidebar__nav">
          <button
            className={`adm-nav-item ${tab === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => switchTab('dashboard')}
          >
            <Activity className="w-4 h-4" />
            <span>Métricas & Control</span>
          </button>

          <button
            className={`adm-nav-item ${tab === 'users' ? 'is-active' : ''}`}
            onClick={() => switchTab('users')}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Baneos</span>
            {users.length > 0 && <small>{users.length}</small>}
          </button>

          <button
            className={`adm-nav-item ${tab === 'pets' ? 'is-active' : ''}`}
            onClick={() => switchTab('pets')}
          >
            <PawPrint className="w-4 h-4" />
            <span>Mascotas (CRUD)</span>
            {pets.length > 0 && <small>{pets.length}</small>}
          </button>

          <button
            className={`adm-nav-item ${tab === 'consultations' ? 'is-active' : ''}`}
            onClick={() => switchTab('consultations')}
          >
            <Video className="w-4 h-4" />
            <span>Consultas & Chats</span>
            {consultations.length > 0 && <small>{consultations.length}</small>}
          </button>

          <button
            className={`adm-nav-item ${tab === 'vets' ? 'is-active' : ''}`}
            onClick={() => switchTab('vets')}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría SENASA</span>
            {stats && stats.pendingVets > 0 && (
              <small>{stats.pendingVets}</small>
            )}
          </button>

          <button
            className={`adm-nav-item ${tab === 'audit' ? 'is-active' : ''}`}
            onClick={() => switchTab('audit')}
          >
            <FileText className="w-4 h-4" />
            <span>Logs de Seguridad</span>
          </button>
        </nav>

        <div className="adm-sidebar__foot">
          <button
            className="adm-nav-item text-[#e98b70] hover:text-[#ffffff] hover:bg-[#c96b52]"
            onClick={() => {
              logout().then(() => {
                window.location.href = '/login';
              });
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar__left">
            <button
              className="adm-topbar__toggle"
              onClick={() => setMobileMenu(true)}
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-wide uppercase text-[#183c3a]">
                Panel de Administración
              </span>
              <span className="adm-topbar__badge">Consola Suprema</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#536b69]">
              <Clock className="w-3.5 h-3.5" />
              <span>Actualizado en vivo</span>
            </div>
            <button
              onClick={fetchAllData}
              className="p-2 rounded-lg bg-[#f1eee4] text-[#183c3a] hover:bg-[#e2ded4] transition-colors"
              title="Recargar datos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="adm-content">
          {/* TAB 1: DASHBOARD & METRICS */}
          {tab === 'dashboard' && (
            <div>
              <div className="adm-header">
                <div className="adm-header__titles">
                  <span className="adm-header__eyebrow">Métricas en tiempo real</span>
                  <h1>Resumen del Sistema</h1>
                  <p>Monitoreo unificado de telemedicina, usuarios, pacientes y cola de triage.</p>
                </div>
                <div className="adm-header__actions">
                  <button
                    onClick={handleOpenCreateUser}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#183c3a] text-[#fffbef] hover:bg-[#254d4a] transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Usuario</span>
                  </button>
                  <button
                    onClick={handleOpenCreatePet}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#ffffff] text-[#183c3a] border border-[#315f5d] hover:bg-[#f8f6f0] transition-all shadow-sm"
                  >
                    <PawPrint className="w-4 h-4" />
                    <span>Nueva Mascota</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="adm-kpi-grid">
                <div className="adm-kpi-card">
                  <div className="adm-kpi-card__top">
                    <span className="adm-kpi-card__label">Veterinarios Online</span>
                    <div className="adm-kpi-card__icon bg-[#e7f2f0] text-[#183c3a]">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="adm-kpi-card__value text-[#183c3a]">
                    {stats?.onlineVets ?? 0}
                  </div>
                  <div className="adm-kpi-card__sub">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>En guardia inmediata</span>
                  </div>
                </div>

                <div className="adm-kpi-card">
                  <div className="adm-kpi-card__top">
                    <span className="adm-kpi-card__label">SENASA Pendientes</span>
                    <div className="adm-kpi-card__icon bg-[#fbeee9] text-[#c96b52]">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="adm-kpi-card__value text-[#c96b52]">
                    {stats?.pendingVets ?? 0}
                  </div>
                  <div className="adm-kpi-card__sub">
                    <span>Aprobación SENASA requerida</span>
                  </div>
                </div>

                <div className="adm-kpi-card">
                  <div className="adm-kpi-card__top">
                    <span className="adm-kpi-card__label">Consultas Totales</span>
                    <div className="adm-kpi-card__icon bg-[#f3efe6] text-[#183c3a]">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="adm-kpi-card__value text-[#183c3a]">
                    {stats?.totalConsultations ?? consultations.length}
                  </div>
                  <div className="adm-kpi-card__sub">
                    <span>Telemedicina registrada</span>
                  </div>
                </div>

                <div className="adm-kpi-card">
                  <div className="adm-kpi-card__top">
                    <span className="adm-kpi-card__label">Pacientes Activos</span>
                    <div className="adm-kpi-card__icon bg-[#e7f2f0] text-[#245e5b]">
                      <PawPrint className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="adm-kpi-card__value text-[#245e5b]">
                    {stats?.activePetsCount ?? pets.filter((p) => !p.deletedAt).length}
                  </div>
                  <div className="adm-kpi-card__sub">
                    <span>Mascotas en seguimiento</span>
                  </div>
                </div>
              </div>

              {/* Operations Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Vets Queue */}
                <div className="adm-table-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base text-[#183c3a] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#609f9c]" />
                      <span>Matrículas SENASA por Validar</span>
                    </h3>
                    <button
                      onClick={() => switchTab('vets')}
                      className="text-xs font-bold text-[#315f5d] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Ver todas</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {users.filter((u) => u.role === 'VET' && u.vetStatus === 'PENDING').length === 0 ? (
                    <div className="py-10 text-center text-sm font-medium text-[#536b69]">
                      Cero solicitudes pendientes. Todas las matrículas fueron verificadas.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users
                        .filter((u) => u.role === 'VET' && u.vetStatus === 'PENDING')
                        .slice(0, 4)
                        .map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f6f0] border border-[#e2ded4]"
                          >
                            <div>
                              <div className="font-extrabold text-sm text-[#183c3a]">
                                Dr. {v.firstName} {v.lastName}
                              </div>
                              <div className="text-xs text-[#536b69]">
                                Matrícula: <strong className="text-[#183c3a]">{v.licenseNumber || 'S/N'}</strong> • {v.email}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveVet(v.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#183c3a] text-white hover:bg-[#254d4a]"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleRejectVet(v.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fbeee9] text-[#c96b52] hover:bg-[#f3c2b5]"
                              >
                                Rechazar
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Recent Telemedicine Consultations */}
                <div className="adm-table-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base text-[#183c3a] flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#609f9c]" />
                      <span>Últimas Consultas Realizadas</span>
                    </h3>
                    <button
                      onClick={() => switchTab('consultations')}
                      className="text-xs font-bold text-[#315f5d] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Ver todas</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {consultations.length === 0 ? (
                    <div className="py-10 text-center text-sm font-medium text-[#536b69]">
                      Aún no hay consultas registradas en la base de datos.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consultations.slice(0, 4).map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f6f0] border border-[#e2ded4]"
                        >
                          <div>
                            <div className="font-extrabold text-sm text-[#183c3a]">
                              {c.pet.name} ({c.pet.species})
                            </div>
                            <div className="text-xs text-[#536b69]">
                              Tutor: {c.client.firstName} {c.client.lastName} • Vet: {c.vet ? `Dr. ${c.vet.firstName}` : 'En espera'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`adm-badge ${
                                c.status === 'COMPLETED'
                                  ? 'adm-badge--active'
                                  : c.status === 'WAITING'
                                  ? 'adm-badge--waiting'
                                  : 'adm-badge--client'
                              }`}
                            >
                              {c.status}
                            </span>
                            <button
                              onClick={() => handleOpenChatInspector(c)}
                              className="p-1.5 rounded-lg bg-[#ffffff] border border-[#315f5d] text-[#183c3a] hover:bg-[#e7f2f0]"
                              title="Ver Chat"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS & PERMANENT BANS */}
          {tab === 'users' && (
            <div>
              <div className="adm-header">
                <div className="adm-header__titles">
                  <span className="adm-header__eyebrow">Gestión Integral de Accesos</span>
                  <h1>Usuarios del Sistema</h1>
                  <p>Administración, edición y aplicación de baneos y suspensiones permanentes.</p>
                </div>
                <div className="adm-header__actions">
                  <button
                    onClick={handleOpenCreateUser}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#183c3a] text-[#fffbef] hover:bg-[#254d4a] transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Usuario</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="adm-filter-bar">
                <div className="adm-filter-bar__search">
                  <Search className="w-4 h-4 text-[#536b69]" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o matrícula..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="text-[#536b69] hover:text-[#183c3a]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="adm-filter-bar__actions">
                  <select
                    className="adm-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="ALL">Todos los Roles</option>
                    <option value="CLIENT">Tutores (CLIENT)</option>
                    <option value="VET">Veterinarios (VET)</option>
                    <option value="ADMIN">Administradores (ADMIN)</option>
                  </select>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#183c3a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userIncludeDeleted}
                      onChange={(e) => setUserIncludeDeleted(e.target.checked)}
                      className="rounded border-[#315f5d] text-[#183c3a]"
                    />
                    <span>Ver suspendidos/baneados</span>
                  </label>
                </div>
              </div>

              {/* Users Responsive Table */}
              <div className="adm-table-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Nombre y Correo</th>
                        <th>Rol</th>
                        <th>Estado Cuenta</th>
                        <th>Presencia</th>
                        <th>Matrícula / Bio</th>
                        <th>Alta</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-sm text-[#536b69]">
                            No se encontraron usuarios que coincidan con los filtros.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isBanned = Boolean(u.deletedAt);
                          return (
                            <tr key={u.id} className={isBanned ? 'is-banned' : ''}>
                              <td>
                                <div className="font-extrabold text-sm text-[#183c3a]">
                                  {u.firstName} {u.lastName}
                                </div>
                                <div className="text-xs text-[#536b69]">{u.email}</div>
                              </td>
                              <td>
                                <span
                                  className={`adm-badge ${
                                    u.role === 'ADMIN'
                                      ? 'adm-badge--admin'
                                      : u.role === 'VET'
                                      ? 'adm-badge--vet'
                                      : 'adm-badge--client'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                {isBanned ? (
                                  <span className="adm-badge adm-badge--banned">
                                    <Ban className="w-3 h-3" />
                                    <span>Suspendido / Baneado</span>
                                  </span>
                                ) : (
                                  <span className="adm-badge adm-badge--active">
                                    <Check className="w-3 h-3" />
                                    <span>Activo</span>
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                                    }`}
                                  />
                                  <span>{u.isOnline ? 'Conectado' : 'Offline'}</span>
                                </span>
                              </td>
                              <td>
                                <div className="text-xs text-[#183c3a] font-medium max-w-[200px] truncate">
                                  {u.licenseNumber ? `MP: ${u.licenseNumber}` : u.bio || '—'}
                                </div>
                              </td>
                              <td className="text-xs text-[#536b69] whitespace-nowrap">
                                {new Date(u.createdAt).toLocaleDateString('es-AR')}
                              </td>
                              <td>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    className="p-2 rounded-lg bg-[#f8f6f0] border border-[#e2ded4] text-[#183c3a] hover:bg-[#e7f2f0] transition-colors"
                                    title="Editar Usuario"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {isBanned ? (
                                    <button
                                      onClick={() => handleRestoreUser(u)}
                                      className="p-2 rounded-lg bg-[#eaf6ea] border border-[#c2e2c2] text-[#206120] hover:bg-[#d5ebd5] transition-colors"
                                      title="Restaurar Cuenta"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenBanModal(u)}
                                      className="p-2 rounded-lg bg-[#fbeee9] border border-[#f3c2b5] text-[#c96b52] hover:bg-[#e98b70] hover:text-white transition-colors"
                                      title="Banear / Suspender Permanentemente"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PETS (CRUD) */}
          {tab === 'pets' && (
            <div>
              <div className="adm-header">
                <div className="adm-header__titles">
                  <span className="adm-header__eyebrow">Expedientes Clínicos Veterinarios</span>
                  <h1>Mascotas Registradas</h1>
                  <p>Administración completa de animales registrados, activas u ocultas.</p>
                </div>
                <div className="adm-header__actions">
                  <button
                    onClick={handleOpenCreatePet}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#183c3a] text-[#fffbef] hover:bg-[#254d4a] transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Mascota</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="adm-filter-bar">
                <div className="adm-filter-bar__search">
                  <Search className="w-4 h-4 text-[#536b69]" />
                  <input
                    type="text"
                    placeholder="Buscar por mascota, tutor o raza..."
                    value={petSearch}
                    onChange={(e) => setPetSearch(e.target.value)}
                  />
                  {petSearch && (
                    <button onClick={() => setPetSearch('')} className="text-[#536b69] hover:text-[#183c3a]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="adm-filter-bar__actions">
                  <select
                    className="adm-select"
                    value={petFilter}
                    onChange={(e) => setPetFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todas las Mascotas</option>
                    <option value="ACTIVE">Solo Activas</option>
                    <option value="HIDDEN">Ocultas / Dadas de Baja</option>
                  </select>
                </div>
              </div>

              {/* Pets Responsive Table */}
              <div className="adm-table-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Mascota & Especie</th>
                        <th>Raza & Peso</th>
                        <th>Tutor Responsable</th>
                        <th>Microchip</th>
                        <th>Alergias / Crónicas</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-sm text-[#536b69]">
                            No hay mascotas que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredPets.map((p) => {
                          const isDeleted = Boolean(p.deletedAt);
                          return (
                            <tr key={p.id} className={isDeleted ? 'is-banned' : ''}>
                              <td>
                                <div className="font-extrabold text-sm text-[#183c3a]">{p.name}</div>
                                <div className="text-xs text-[#536b69]">{p.species} • {p.sex || 'N/A'}</div>
                              </td>
                              <td>
                                <div className="text-xs font-bold text-[#183c3a]">{p.breed}</div>
                                <div className="text-xs text-[#536b69]">{p.weightKg ? `${p.weightKg} kg` : 'Sin peso'}</div>
                              </td>
                              <td>
                                <div className="text-xs font-bold text-[#183c3a]">
                                  {p.owner ? `${p.owner.firstName} ${p.owner.lastName}` : 'Desconocido'}
                                </div>
                                <div className="text-xs text-[#536b69]">{p.owner?.email || '—'}</div>
                              </td>
                              <td className="text-xs font-mono text-[#536b69]">{p.microchip || '—'}</td>
                              <td>
                                <div className="text-xs text-[#183c3a] max-w-[200px] truncate">
                                  {p.allergies || p.chronicConditions ? (
                                    <span className="text-[#c96b52] font-semibold">
                                      {p.allergies || p.chronicConditions}
                                    </span>
                                  ) : (
                                    <span className="text-[#536b69]">Ninguna</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {isDeleted ? (
                                  <span className="adm-badge adm-badge--banned">Oculta / Baja</span>
                                ) : (
                                  <span className="adm-badge adm-badge--active">Activa</span>
                                )}
                              </td>
                              <td>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditPet(p)}
                                    className="p-2 rounded-lg bg-[#f8f6f0] border border-[#e2ded4] text-[#183c3a] hover:bg-[#e7f2f0] transition-colors"
                                    title="Editar Mascota"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  {isDeleted ? (
                                    <button
                                      onClick={() => handleRestorePet(p)}
                                      className="p-2 rounded-lg bg-[#eaf6ea] border border-[#c2e2c2] text-[#206120] hover:bg-[#d5ebd5] transition-colors"
                                      title="Restaurar Mascota"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDeletePet(p)}
                                      className="p-2 rounded-lg bg-[#fbeee9] border border-[#f3c2b5] text-[#c96b52] hover:bg-[#f3c2b5] transition-colors"
                                      title="Ocultar Mascota"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONSULTATIONS & CHAT CONVERSATION VIEWER */}
          {tab === 'consultations' && (
            <div>
              <div className="adm-header">
                <div className="adm-header__titles">
                  <span className="adm-header__eyebrow">Auditoría Clínica & Conversaciones</span>
                  <h1>Consultas & Chats</h1>
                  <p>Inspección de teleconsultas, estado médico y mensajes cruzados entre tutores y veterinarios.</p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="adm-filter-bar">
                <div className="adm-filter-bar__search">
                  <Search className="w-4 h-4 text-[#536b69]" />
                  <input
                    type="text"
                    placeholder="Filtrar por paciente o profesional..."
                    value={petSearch}
                    onChange={(e) => setPetSearch(e.target.value)}
                  />
                </div>

                <div className="adm-filter-bar__actions">
                  <select
                    className="adm-select"
                    value={consStatusFilter}
                    onChange={(e) => setConsStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Todos los Estados</option>
                    <option value="WAITING">En Sala de Espera (WAITING)</option>
                    <option value="ACTIVE">En Consulta Activa (ACTIVE)</option>
                    <option value="COMPLETED">Finalizadas (COMPLETED)</option>
                    <option value="CANCELLED">Canceladas (CANCELLED)</option>
                  </select>
                </div>
              </div>

              {/* Consultations Table */}
              <div className="adm-table-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Fecha / ID</th>
                        <th>Paciente (Mascota)</th>
                        <th>Tutor (Cliente)</th>
                        <th>Veterinario Asignado</th>
                        <th>Estado Consulta</th>
                        <th>Reseña / Calificación</th>
                        <th style={{ textAlign: 'right' }}>Conversación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConsultations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-sm text-[#536b69]">
                            No hay consultas registradas que coincidan con los filtros.
                          </td>
                        </tr>
                      ) : (
                        filteredConsultations.map((c) => {
                          const msgCount = c._count?.messages ?? 0;
                          return (
                            <tr key={c.id}>
                              <td>
                                <div className="font-extrabold text-xs text-[#183c3a]">
                                  {new Date(c.createdAt).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                                <div className="text-[10px] font-mono text-[#536b69]">{c.id.substring(0, 8)}...</div>
                              </td>
                              <td>
                                <div className="font-extrabold text-sm text-[#183c3a]">{c.pet.name}</div>
                                <div className="text-xs text-[#536b69]">{c.pet.species} • {c.pet.breed}</div>
                              </td>
                              <td>
                                <div className="font-bold text-xs text-[#183c3a]">
                                  {c.client.firstName} {c.client.lastName}
                                </div>
                                <div className="text-xs text-[#536b69]">{c.client.email}</div>
                              </td>
                              <td>
                                {c.vet ? (
                                  <>
                                    <div className="font-bold text-xs text-[#183c3a]">
                                      Dr. {c.vet.firstName} {c.vet.lastName}
                                    </div>
                                    <div className="text-xs text-[#536b69]">{c.vet.email}</div>
                                  </>
                                ) : (
                                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                    Sin asignar
                                  </span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`adm-badge ${
                                    c.status === 'COMPLETED'
                                      ? 'adm-badge--active'
                                      : c.status === 'WAITING'
                                      ? 'adm-badge--waiting'
                                      : 'adm-badge--client'
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </td>
                              <td>
                                {c.review ? (
                                  <div className="flex items-center gap-1 text-xs font-bold text-[#183c3a]">
                                    <span className="text-amber-500">★</span>
                                    <span>{c.review.rating}</span>
                                    {c.review.comment && (
                                      <span className="text-[11px] font-normal text-[#536b69] max-w-[120px] truncate ml-1">
                                        "{c.review.comment}"
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#536b69]">—</span>
                                )}
                              </td>
                              <td>
                                <div className="flex items-center justify-end">
                                  <button
                                    onClick={() => handleOpenChatInspector(c)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#183c3a] text-[#fffbef] hover:bg-[#254d4a] transition-all shadow-sm cursor-pointer"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-[#609f9c]" />
                                    <span>Ver Chat</span>
                                    {msgCount > 0 && (
                                      <span className="bg-[#609f9c] text-[#183c3a] px-1.5 py-0.2 rounded-full text-[10px] font-black">
                                        {msgCount}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SENASA VETS VERIFICATION */}
          {tab === 'vets' && (
            <div>
              <div className="adm-header">
                <div className="adm-header__titles">
                  <span className="adm-header__eyebrow">Validación Legal SENASA</span>
                  <h1>Auditoría de Matrículas Veterinarias</h1>
                  <p>Inspección de credenciales habilitantes para ejercicio clínico legal en Argentina.</p>
                </div>
              </div>

              <div className="adm-table-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Veterinario</th>
                        <th>Matrícula Profesional</th>
                        <th>Estado SENASA</th>
                        <th>Especialidad / Bio</th>
                        <th>Fecha Registro</th>
                        <th style={{ textAlign: 'right' }}>Resolución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter((u) => u.role === 'VET').length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-sm text-[#536b69]">
                            No hay profesionales veterinarios registrados en el sistema.
                          </td>
                        </tr>
                      ) : (
                        users
                          .filter((u) => u.role === 'VET')
                          .map((v) => (
                            <tr key={v.id}>
                              <td>
                                <div className="font-extrabold text-sm text-[#183c3a]">
                                  Dr. {v.firstName} {v.lastName}
                                </div>
                                <div className="text-xs text-[#536b69]">{v.email}</div>
                              </td>
                              <td>
                                <span className="font-mono text-xs font-extrabold text-[#183c3a] bg-[#f8f6f0] px-2 py-1 rounded border border-[#e2ded4]">
                                  {v.licenseNumber || 'PENDIENTE'}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`adm-badge ${
                                    v.vetStatus === 'APPROVED'
                                      ? 'adm-badge--active'
                                      : v.vetStatus === 'REJECTED'
                                      ? 'adm-badge--banned'
                                      : 'adm-badge--waiting'
                                  }`}
                                >
                                  {v.vetStatus || 'PENDING'}
                                </span>
                              </td>
                              <td>
                                <div className="text-xs text-[#536b69] max-w-[260px] truncate">{v.bio || '—'}</div>
                              </td>
                              <td className="text-xs text-[#536b69]">
                                {new Date(v.createdAt).toLocaleDateString('es-AR')}
                              </td>
                              <td>
                                <div className="flex items-center justify-end gap-2">
                                  {v.vetStatus !== 'APPROVED' && (
                                    <button
                                      onClick={() => handleApproveVet(v.id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#183c3a] text-white hover:bg-[#254d4a] transition-all"
                                    >
                                      Aprobar
                                    </button>
                                  )}
                                  {v.vetStatus !== 'REJECTED' && (
                                    <button
                                      onClick={() => handleRejectVet(v.id)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fbeee9] text-[#c96b52] hover:bg-[#f3c2b5] transition-all"
                                    >
                                      Rechazar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT LOGS */}
          {tab === 'audit' && (
            <div>
              <div className="adm-header">
                <div className="adm-header__titles">
                  <span className="adm-header__eyebrow">Trazabilidad & Seguridad</span>
                  <h1>Registro de Auditoría</h1>
                  <p>Historial inmutable de operaciones administrativas y modificaciones de datos.</p>
                </div>
              </div>

              <div className="adm-table-card">
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Fecha & Hora</th>
                        <th>Administrador</th>
                        <th>Acción Ejecutada</th>
                        <th>ID Objeto / Target</th>
                        <th>Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-sm text-[#536b69]">
                            No hay eventos registrados en la bitácora de auditoría.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="text-xs font-mono text-[#536b69] whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString('es-AR')}
                            </td>
                            <td>
                              <div className="font-bold text-xs text-[#183c3a]">
                                {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'Sistema'}
                              </div>
                              <div className="text-[11px] text-[#536b69]">{log.admin?.email}</div>
                            </td>
                            <td>
                              <span className="font-mono text-xs font-bold text-[#183c3a] bg-[#e7f2f0] px-2 py-0.5 rounded border border-[#bddbd6]">
                                {log.action}
                              </span>
                            </td>
                            <td className="text-xs font-mono text-[#536b69]">{log.targetId || '—'}</td>
                            <td className="text-xs text-[#536b69]">
                              <code className="text-[11px] bg-[#f8f6f0] px-2 py-1 rounded border border-[#e2ded4] block max-w-sm truncate">
                                {JSON.stringify(log.details)}
                              </code>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: PERMANENT BAN CONFIRMATION WITH ANIMATION   */}
      {/* ==================================================== */}
      {banModalOpen && targetBanUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="adm-modal-overlay"
        >
          <div className="adm-modal-card text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#fbeee9] border-2 border-[#c96b52] flex items-center justify-center text-[#c96b52] animate-bounce">
              <Ban className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-[#fbeee9] text-[#c96b52] border border-[#f3c2b5]">
                Acción Irreversible
              </span>
              <h2 className="text-2xl font-black text-[#183c3a] tracking-tight">
                Banear Cuenta Permanentemente
              </h2>
              <p className="text-sm text-[#536b69] font-medium leading-relaxed">
                ¿Estás seguro de que deseás suspender y banear de forma permanente a{' '}
                <strong className="text-[#183c3a]">
                  {targetBanUser.firstName} {targetBanUser.lastName} ({targetBanUser.email})
                </strong>
                ?
              </p>
            </div>

            <div className="bg-[#f8f6f0] p-4 rounded-xl border border-[#e2ded4] text-left space-y-3">
              <div className="flex items-start gap-2 text-xs text-[#c96b52] font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Al confirmar, sus tokens de sesión se invalidarán al instante y recibirá una notificación en pantalla expulsándolo del sistema.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183c3a] mb-1">
                  Motivo del Baneo (visible para el usuario):
                </label>
                <textarea
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a] focus:outline-none focus:border-[#315f5d]"
                  rows={2}
                  placeholder="Ej: Infracción reiterada de normas comunitarias / Suplantación de identidad profesional."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isBanning}
                onClick={() => {
                  setBanModalOpen(false);
                  setTargetBanUser(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-white text-[#183c3a] border border-[#315f5d] hover:bg-[#f8f6f0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isBanning}
                onClick={handleConfirmBan}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-[#c96b52] text-white hover:bg-[#b0533b] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isBanning ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    <span>Confirmar Baneo Definitivo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: CHAT CONVERSATION INSPECTOR                 */}
      {/* ==================================================== */}
      {chatModalOpen && selectedConsultation && (
        <div
          role="dialog"
          aria-modal="true"
          className="adm-modal-overlay"
        >
          <div className="adm-modal-card adm-modal-card--wide space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#e2ded4]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-[#183c3a]">
                    Conversación de Teleconsulta
                  </span>
                  <span
                    className={`adm-badge ${
                      selectedConsultation.status === 'COMPLETED'
                        ? 'adm-badge--active'
                        : selectedConsultation.status === 'WAITING'
                        ? 'adm-badge--waiting'
                        : 'adm-badge--client'
                    }`}
                  >
                    {selectedConsultation.status}
                  </span>
                </div>
                <p className="text-xs text-[#536b69] mt-0.5">
                  Paciente: <strong className="text-[#183c3a]">{selectedConsultation.pet.name}</strong> • Tutor:{' '}
                  <strong className="text-[#183c3a]">
                    {selectedConsultation.client.firstName} {selectedConsultation.client.lastName}
                  </strong>{' '}
                  • Veterinario:{' '}
                  <strong className="text-[#183c3a]">
                    {selectedConsultation.vet
                      ? `Dr. ${selectedConsultation.vet.firstName} ${selectedConsultation.vet.lastName}`
                      : 'Sin asignar'}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setChatModalOpen(false)}
                className="p-1.5 rounded-lg text-[#536b69] hover:text-[#183c3a] hover:bg-[#e2ded4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="adm-chat-thread">
              {loadingMessages ? (
                <div className="py-20 text-center text-sm font-semibold text-[#536b69]">
                  Cargando mensajes del servidor seguro...
                </div>
              ) : consultationMessages.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <MessageSquare className="w-10 h-10 text-[#609f9c] mx-auto opacity-40" />
                  <p className="text-sm font-bold text-[#183c3a]">No hay mensajes registrados</p>
                  <p className="text-xs text-[#536b69]">
                    Esta teleconsulta no registra mensajes de texto intercambiados entre las partes.
                  </p>
                </div>
              ) : (
                consultationMessages.map((msg) => {
                  const isVet = msg.sender.role === 'VET';
                  return (
                    <div
                      key={msg.id}
                      className={`adm-chat-msg ${isVet ? 'adm-chat-msg--vet' : 'adm-chat-msg--client'}`}
                    >
                      <div className="adm-chat-msg__meta">
                        <span className="font-extrabold">
                          {isVet ? `Dr. ${msg.sender.firstName} ${msg.sender.lastName}` : `${msg.sender.firstName} (Tutor)`}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-mono opacity-70">
                          {msg.sender.role}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.attachmentUrl && (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#245e5b] underline font-bold"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Ver archivo adjunto</span>
                        </a>
                      )}
                      <div className="adm-chat-msg__time">
                        {new Date(msg.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setChatModalOpen(false)}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-[#183c3a] text-white hover:bg-[#254d4a] transition-colors cursor-pointer"
              >
                Cerrar Visor de Conversación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: USER CREATE / EDIT                          */}
      {/* ==================================================== */}
      {userModalOpen && (
        <div role="dialog" aria-modal="true" className="adm-modal-overlay">
          <div className="adm-modal-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2ded4] mb-4">
              <h2 className="text-xl font-black text-[#183c3a]">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button onClick={() => setUserModalOpen(false)} className="text-[#536b69] hover:text-[#183c3a]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Nombre</label>
                  <input
                    required
                    type="text"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Apellido</label>
                  <input
                    required
                    type="text"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183c3a] mb-1">Correo Electrónico</label>
                <input
                  required
                  type="email"
                  disabled={Boolean(editingUser)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a] disabled:opacity-60"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#183c3a] mb-1">
                  {editingUser ? 'Contraseña (dejar en blanco para no modificar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Rol</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="CLIENT">Tutor (CLIENT)</option>
                    <option value="VET">Veterinario (VET)</option>
                    <option value="ADMIN">Administrador (ADMIN)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Teléfono</label>
                  <input
                    type="tel"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {userForm.role === 'VET' && (
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Matrícula SENASA</label>
                  <input
                    type="text"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    placeholder="MP-1234"
                    value={userForm.licenseNumber}
                    onChange={(e) => setUserForm({ ...userForm, licenseNumber: e.target.value })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#183c3a] border border-[#315f5d]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl text-xs font-bold bg-[#183c3a] text-white hover:bg-[#254d4a]"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: PET CREATE / EDIT                           */}
      {/* ==================================================== */}
      {petModalOpen && (
        <div role="dialog" aria-modal="true" className="adm-modal-overlay">
          <div className="adm-modal-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2ded4] mb-4">
              <h2 className="text-xl font-black text-[#183c3a]">
                {editingPet ? 'Editar Mascota' : 'Registrar Mascota'}
              </h2>
              <button onClick={() => setPetModalOpen(false)} className="text-[#536b69] hover:text-[#183c3a]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePet} className="space-y-4">
              {!editingPet && (
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Tutor Propietario</label>
                  <select
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={petForm.ownerId}
                    onChange={(e) => setPetForm({ ...petForm, ownerId: e.target.value })}
                  >
                    <option value="">Seleccionar Tutor...</option>
                    {users
                      .filter((u) => u.role === 'CLIENT')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} ({c.email})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Nombre de Mascota</label>
                  <input
                    required
                    type="text"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Especie</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={petForm.species}
                    onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Exótico">Exótico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Raza</label>
                  <input
                    type="text"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={petForm.weightKg}
                    onChange={(e) => setPetForm({ ...petForm, weightKg: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#183c3a] mb-1">Sexo</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                    value={petForm.sex}
                    onChange={(e) => setPetForm({ ...petForm, sex: e.target.value })}
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              {adminPetWeightAssessment && (
                <div className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
                  adminPetWeightAssessment.status === 'too_low' || adminPetWeightAssessment.status === 'too_high'
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : adminPetWeightAssessment.status === 'valid_divergent'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  {adminPetWeightAssessment.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#183c3a] mb-1">Microchip (opcional)</label>
                <input
                  type="text"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e2ded4] bg-white text-[#183c3a]"
                  value={petForm.microchip}
                  onChange={(e) => setPetForm({ ...petForm, microchip: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPetModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-[#183c3a] border border-[#315f5d]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl text-xs font-bold bg-[#183c3a] text-white hover:bg-[#254d4a]"
                >
                  Guardar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApp;
