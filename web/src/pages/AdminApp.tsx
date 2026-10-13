import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Icon, Logo, Status, Toast, go } from '../shared';
import type { ApiResponse, User } from '../types';

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
    firstName: string;
    lastName: string;
    email: string;
  };
  vet: {
    firstName: string;
    lastName: string;
    email: string;
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

  // Active navigation tab
  const getInitialTab = () => {
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

  // Handle URL changes
  const switchTab = (nextTab: typeof tab) => {
    setTab(nextTab);
    setMobileMenu(false);
    go(`/admin/${nextTab === 'dashboard' ? 'dashboard' : nextTab}`);
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

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<AdminPet | null>(null);

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
    } catch (err: any) {
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
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      const email = u.email.toLowerCase();
      const license = (u.licenseNumber || '').toLowerCase();
      return name.includes(s) || email.includes(s) || license.includes(s);
    });
  }, [users, userSearch, userRoleFilter, userIncludeDeleted]);

  const filteredPets = useMemo(() => {
    return pets.filter((p) => {
      if (petFilter === 'ACTIVE' && p.deletedAt) return false;
      if (petFilter === 'HIDDEN' && !p.deletedAt) return false;
      if (!petSearch) return true;
      const s = petSearch.toLowerCase();
      const name = p.name.toLowerCase();
      const species = p.species.toLowerCase();
      const breed = p.breed.toLowerCase();
      const chip = (p.microchip || '').toLowerCase();
      const ownerName = `${p.owner?.firstName} ${p.owner?.lastName}`.toLowerCase();
      const ownerEmail = (p.owner?.email || '').toLowerCase();
      return name.includes(s) || species.includes(s) || breed.includes(s) || chip.includes(s) || ownerName.includes(s) || ownerEmail.includes(s);
    });
  }, [pets, petSearch, petFilter]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      if (consStatusFilter !== 'ALL' && c.status !== consStatusFilter) return false;
      return true;
    });
  }, [consultations, consStatusFilter]);

  // Clients list for Pet owner dropdown
  const clientsList = useMemo(() => {
    return users.filter((u) => u.role === 'CLIENT' && !u.deletedAt);
  }, [users]);

  // ==========================================
  // USER HANDLERS
  // ==========================================
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
        const payload: any = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          phone: userForm.phone || null,
          role: userForm.role,
          licenseNumber: userForm.role === 'VET' ? userForm.licenseNumber : null,
          bio: userForm.bio || null,
        };
        if (userForm.password) payload.password = userForm.password;
        const res = await api.patch<ApiResponse<User>>(`/api/admin/users/${editingUser.id}`, payload);
        if (res.data.success && res.data.data) {
          notify(`Usuario ${res.data.data.firstName} actualizado con éxito.`);
          setUserModalOpen(false);
          fetchAllData();
        }
      } else {
        if (!userForm.password) {
          alert('La contraseña es obligatoria para nuevos usuarios.');
          return;
        }
        const res = await api.post<ApiResponse<User>>('/api/admin/users', userForm);
        if (res.data.success && res.data.data) {
          notify(`Usuario ${res.data.data.firstName} creado con éxito.`);
          setUserModalOpen(false);
          fetchAllData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al guardar el usuario.');
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`¿Seguro que deseás suspender/desactivar al usuario ${u.firstName} ${u.lastName}?`)) return;
    try {
      await api.delete(`/api/admin/users/${u.id}`);
      notify(`Usuario ${u.firstName} suspendido.`);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al suspender usuario.');
    }
  };

  const handleRestoreUser = async (u: User) => {
    try {
      await api.patch(`/api/admin/users/${u.id}/restore`);
      notify(`Usuario ${u.firstName} reactivado.`);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al reactivar usuario.');
    }
  };

  // ==========================================
  // PET HANDLERS
  // ==========================================
  const handleOpenCreatePet = () => {
    setEditingPet(null);
    setPetForm({
      ownerId: clientsList[0]?.id || '',
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

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
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
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al guardar la mascota.');
    }
  };

  const handleDeletePet = async (p: AdminPet) => {
    if (!window.confirm(`¿Seguro que deseás ocultar/dar de baja a la mascota ${p.name}?`)) return;
    try {
      await api.delete(`/api/admin/pets/${p.id}`);
      notify(`Mascota ${p.name} ocultada.`);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al ocultar mascota.');
    }
  };

  const handleRestorePet = async (p: AdminPet) => {
    try {
      await api.patch(`/api/admin/pets/${p.id}/restore`);
      notify(`Mascota ${p.name} restaurada a visible.`);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al restaurar mascota.');
    }
  };

  // SENASA Approval handlers
  const handleApproveVet = async (vetId: string) => {
    try {
      await api.patch(`/api/admin/vets/${vetId}/approve`);
      notify('Matrícula SENASA aprobada exitosamente.');
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al aprobar matrícula.');
    }
  };

  const handleRejectVet = async (vetId: string) => {
    const reason = prompt('Motivo de rechazo de la matrícula:');
    if (!reason) return;
    try {
      await api.patch(`/api/admin/vets/${vetId}/reject`, { reason });
      notify('Matrícula rechazada.');
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al rechazar matrícula.');
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: '#fffbed' }}>
      {/* Toast alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: '#173b3a',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Icon name="check" size={18} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenu ? 'is-open' : ''}`}>
        <div className="sidebar__head">
          <Logo to="/admin/dashboard" />
          <button className="sidebar__close" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú">
            <Icon name="close" />
          </button>
        </div>

        <div className="sidebar__profile">
          <span className="avatar avatar--small">SA</span>
          <div>
            <strong>Super Admin</strong>
            <span>{user?.email || 'admin@vetconnect.com'}</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <button
            className={`nav-item ${tab === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => switchTab('dashboard')}
          >
            <Icon name="home" />
            <span>Métricas & Resumen</span>
          </button>
          <button
            className={`nav-item ${tab === 'users' ? 'is-active' : ''}`}
            onClick={() => switchTab('users')}
          >
            <Icon name="user" />
            <span>Usuarios (CRUD)</span>
            {users.length > 0 && <small>{users.length}</small>}
          </button>
          <button
            className={`nav-item ${tab === 'pets' ? 'is-active' : ''}`}
            onClick={() => switchTab('pets')}
          >
            <Icon name="paw" />
            <span>Mascotas (Activas/Ocultas)</span>
            {pets.length > 0 && <small>{pets.length}</small>}
          </button>
          <button
            className={`nav-item ${tab === 'consultations' ? 'is-active' : ''}`}
            onClick={() => switchTab('consultations')}
          >
            <Icon name="video" />
            <span>Consultas Clínicas</span>
            {consultations.length > 0 && <small>{consultations.length}</small>}
          </button>
          <button
            className={`nav-item ${tab === 'vets' ? 'is-active' : ''}`}
            onClick={() => switchTab('vets')}
          >
            <Icon name="shield" />
            <span>Auditoría SENASA</span>
            {stats && stats.pendingVets > 0 && (
              <small style={{ background: '#e98b70', color: '#fff' }}>{stats.pendingVets}</small>
            )}
          </button>
          <button
            className={`nav-item ${tab === 'audit' ? 'is-active' : ''}`}
            onClick={() => switchTab('audit')}
          >
            <Icon name="file" />
            <span>Registro de Auditoría</span>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            className="nav-item"
            style={{ color: '#ef4444' }}
            onClick={() => {
              logout().then(() => {
                window.location.href = '/login';
              });
            }}
          >
            <Icon name="close" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú" />}

      {/* Main Container */}
      <div className="app-main">
        <header className="topbar">
          <div className="topbar__mobile">
            <Button variant="icon" icon="menu" onClick={() => setMobileMenu(true)} ariaLabel="Abrir menú" />
            <Logo to="/admin/dashboard" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#173b3a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Panel de Administración
            </span>
            <span style={{ fontSize: 11, background: '#e7f2f0', color: '#245e5b', padding: '3px 9px', borderRadius: 12, fontWeight: 700 }}>
              Control Total
            </span>
          </div>
          <div className="topbar__spacer" />
          <button className="user-menu" onClick={() => switchTab('users')}>
            <span className="avatar avatar--small">SA</span>
            <span>Administrador</span>
          </button>
        </header>

        <main className="content">
          {/* ==================================================== */}
          {/* TAB 1: DASHBOARD & METRICS                           */}
          {/* ==================================================== */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <span className="eyebrow">Métricas Operativas</span>
                  <h1>Resumen del Sistema</h1>
                  <p>Supervisión en tiempo real de ingresos, usuarios, mascotas y telemedicina.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button icon="plus" onClick={handleOpenCreateUser}>+ Usuario</Button>
                  <Button variant="secondary" icon="paw" onClick={handleOpenCreatePet}>+ Mascota</Button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#fff', padding: 22, borderRadius: 16, border: '1px solid #dbe7e3', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4b6968' }}>Total Usuarios</span>
                    <span style={{ background: '#e7f2f0', color: '#245e5b', padding: 6, borderRadius: 10 }}><Icon name="users" size={18} /></span>
                  </div>
                  <strong style={{ fontSize: 32, color: '#173b3a' }}>{users.length}</strong>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 12, color: '#4b6968' }}>
                    <span>Tutores: <b>{stats?.clientsCount ?? users.filter(u => u.role === 'CLIENT').length}</b></span>
                    <span>Vets: <b>{stats?.vetsCount ?? users.filter(u => u.role === 'VET').length}</b></span>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 22, borderRadius: 16, border: '1px solid #dbe7e3', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4b6968' }}>Mascotas Registradas</span>
                    <span style={{ background: '#fff3d8', color: '#d4933f', padding: 6, borderRadius: 10 }}><Icon name="paw" size={18} /></span>
                  </div>
                  <strong style={{ fontSize: 32, color: '#173b3a' }}>{pets.length}</strong>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 12, color: '#4b6968' }}>
                    <span style={{ color: '#10b981' }}>Activas: <b>{pets.filter(p => !p.deletedAt).length}</b></span>
                    <span style={{ color: '#ef4444' }}>Ocultas/Bajas: <b>{pets.filter(p => p.deletedAt).length}</b></span>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 22, borderRadius: 16, border: '1px solid #dbe7e3', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4b6968' }}>Consultas Médicas</span>
                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: 6, borderRadius: 10 }}><Icon name="video" size={18} /></span>
                  </div>
                  <strong style={{ fontSize: 32, color: '#173b3a' }}>{consultations.length}</strong>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 12, color: '#4b6968' }}>
                    <span>En espera: <b>{consultations.filter(c => c.status === 'WAITING').length}</b></span>
                    <span style={{ color: '#10b981' }}>Finalizadas: <b>{consultations.filter(c => c.status === 'COMPLETED').length}</b></span>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 22, borderRadius: 16, border: '1px solid #dbe7e3', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4b6968' }}>Auditoría SENASA</span>
                    <span style={{ background: '#fef2f2', color: '#b91c1c', padding: 6, borderRadius: 10 }}><Icon name="shield" size={18} /></span>
                  </div>
                  <strong style={{ fontSize: 32, color: '#173b3a' }}>{stats?.pendingVets ?? 0}</strong>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#4b6968' }}>
                    <span>Tasa de Aprobación: <b>{stats?.approvalRate ?? 100}%</b></span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbe7e3', padding: 24, boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: 17, marginBottom: 16 }}>Últimos Ingresos y Consultas</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#4b6968' }}>
                        <th style={{ padding: '10px 12px' }}>Paciente</th>
                        <th style={{ padding: '10px 12px' }}>Tutor</th>
                        <th style={{ padding: '10px 12px' }}>Veterinario</th>
                        <th style={{ padding: '10px 12px' }}>Estado</th>
                        <th style={{ padding: '10px 12px' }}>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.slice(0, 5).map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px' }}>
                            <b>{c.pet?.name || 'Mascota'}</b>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{c.pet?.species} · {c.pet?.breed}</div>
                          </td>
                          <td style={{ padding: '12px' }}>{c.client?.firstName} {c.client?.lastName}</td>
                          <td style={{ padding: '12px' }}>{c.vet ? `Dr. ${c.vet.firstName} ${c.vet.lastName}` : <span style={{ color: '#94a3b8' }}>En sala de espera</span>}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 9px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              background: c.status === 'COMPLETED' ? '#dcfce7' : c.status === 'ACTIVE' ? '#e0e7ff' : c.status === 'WAITING' ? '#fef3c7' : '#fee2e2',
                              color: c.status === 'COMPLETED' ? '#166534' : c.status === 'ACTIVE' ? '#3730a3' : c.status === 'WAITING' ? '#92400e' : '#991b1b',
                            }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#64748b' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: USUARIOS CRUD                                 */}
          {/* ==================================================== */}
          {tab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span className="eyebrow">Gestión de Acceso y Personas</span>
                  <h1>Usuarios del Sistema</h1>
                  <p>Creación, edición, cambio de roles y suspensión de tutores, médicos y administradores.</p>
                </div>
                <Button icon="plus" onClick={handleOpenCreateUser}>+ Nuevo Usuario</Button>
              </div>

              {/* Filters toolbar */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, background: '#fff', padding: 14, borderRadius: 14, border: '1px solid #dbe7e3' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="search" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o matrícula..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ width: '100%', border: 0, outline: 'none', background: 'transparent' }}
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #dbe7e3', background: '#fff' }}
                >
                  <option value="ALL">Todos los roles</option>
                  <option value="CLIENT">Solo Tutores (CLIENT)</option>
                  <option value="VET">Solo Veterinarios (VET)</option>
                  <option value="ADMIN">Solo Administradores (ADMIN)</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={userIncludeDeleted}
                    onChange={(e) => setUserIncludeDeleted(e.target.checked)}
                  />
                  <span>Mostrar suspendidos</span>
                </label>
              </div>

              {/* Users table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbe7e3', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#4b6968' }}>
                      <th style={{ padding: '12px 16px' }}>Usuario</th>
                      <th style={{ padding: '12px 16px' }}>Contacto</th>
                      <th style={{ padding: '12px 16px' }}>Rol</th>
                      <th style={{ padding: '12px 16px' }}>Estado</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: u.deletedAt ? 0.6 : 1 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <b>{u.firstName} {u.lastName}</b>
                          {u.licenseNumber && (
                            <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>MP: {u.licenseNumber}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{u.email}</div>
                          <small style={{ color: '#64748b' }}>{u.phone || 'Sin teléfono'}</small>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800,
                            background: u.role === 'ADMIN' ? '#f3e8ff' : u.role === 'VET' ? '#e7f2f0' : '#f1f5f9',
                            color: u.role === 'ADMIN' ? '#6b21a8' : u.role === 'VET' ? '#245e5b' : '#334155',
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {u.deletedAt ? (
                            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 11, background: '#fee2e2', padding: '3px 8px', borderRadius: 8 }}>
                              Suspendido
                            </span>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 700, fontSize: 11, background: '#dcfce7', padding: '3px 8px', borderRadius: 8 }}>
                              Activo
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <Button variant="secondary" icon="edit" onClick={() => handleOpenEditUser(u)}>
                              Editar
                            </Button>
                            {u.deletedAt ? (
                              <Button variant="soft" icon="repeat" onClick={() => handleRestoreUser(u)}>
                                Reactivar
                              </Button>
                            ) : (
                              <Button variant="danger" icon="trash" onClick={() => handleDeleteUser(u)}>
                                Suspender
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                          No se encontraron usuarios con los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: MASCOTAS CRUD (Creadas y Ocultas)              */}
          {/* ==================================================== */}
          {tab === 'pets' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span className="eyebrow">Gestión de Pacientes</span>
                  <h1>Mascotas (Activas y Ocultas)</h1>
                  <p>Alta, edición y administración de visibilidad (bajas lógicas y reactivaciones) de mascotas.</p>
                </div>
                <Button icon="plus" onClick={handleOpenCreatePet}>+ Registrar Mascota</Button>
              </div>

              {/* Pet filters toolbar */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, background: '#fff', padding: 14, borderRadius: 14, border: '1px solid #dbe7e3' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="search" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, especie, raza, chip o tutor..."
                    value={petSearch}
                    onChange={(e) => setPetSearch(e.target.value)}
                    style={{ width: '100%', border: 0, outline: 'none', background: 'transparent' }}
                  />
                </div>
                <select
                  value={petFilter}
                  onChange={(e) => setPetFilter(e.target.value as any)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #dbe7e3', background: '#fff' }}
                >
                  <option value="ALL">Todas las mascotas ({pets.length})</option>
                  <option value="ACTIVE">Solo Activas ({pets.filter(p => !p.deletedAt).length})</option>
                  <option value="HIDDEN">Solo Ocultas / Dadas de baja ({pets.filter(p => p.deletedAt).length})</option>
                </select>
              </div>

              {/* Pets table */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbe7e3', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#4b6968' }}>
                      <th style={{ padding: '12px 16px' }}>Mascota</th>
                      <th style={{ padding: '12px 16px' }}>Datos Físicos</th>
                      <th style={{ padding: '12px 16px' }}>Tutor Responsable</th>
                      <th style={{ padding: '12px 16px' }}>Visibilidad</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPets.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: p.deletedAt ? 0.65 : 1 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <b style={{ fontSize: 15, color: '#173b3a' }}>{p.name}</b>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{p.species} · {p.breed}</div>
                          {p.microchip && (
                            <small style={{ color: '#0d9488', display: 'block', marginTop: 2 }}>Chip: {p.microchip}</small>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div><b>{p.weightKg ? `${p.weightKg} kg` : '—'}</b> · {p.sex || 'No especificado'}</div>
                          {p.allergies && <small style={{ color: '#e11d48', display: 'block' }}>Alergias: {p.allergies}</small>}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <b>{p.owner?.firstName} {p.owner?.lastName}</b>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{p.owner?.email}</div>
                          {p.owner?.phone && <div style={{ fontSize: 11, color: '#64748b' }}>{p.owner.phone}</div>}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {p.deletedAt ? (
                            <span style={{ color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              Oculta (Baja)
                            </span>
                          ) : (
                            <span style={{ color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              Activa
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <Button variant="secondary" icon="edit" onClick={() => handleOpenEditPet(p)}>
                              Editar
                            </Button>
                            {p.deletedAt ? (
                              <Button variant="soft" icon="repeat" onClick={() => handleRestorePet(p)}>
                                Restaurar
                              </Button>
                            ) : (
                              <Button variant="danger" icon="trash" onClick={() => handleDeletePet(p)}>
                                Ocultar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPets.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                          No se encontraron mascotas registradas con este filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: CONSULTAS                                     */}
          {/* ==================================================== */}
          {tab === 'consultations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span className="eyebrow">Historial Clínico Central</span>
                  <h1>Consultas Médicas</h1>
                  <p>Registro histórico y auditoría de atenciones de telemedicina.</p>
                </div>
                <select
                  value={consStatusFilter}
                  onChange={(e) => setConsStatusFilter(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #dbe7e3', background: '#fff' }}
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="WAITING">En espera (WAITING)</option>
                  <option value="ACTIVE">En curso (ACTIVE)</option>
                  <option value="COMPLETED">Finalizadas (COMPLETED)</option>
                  <option value="CANCELLED">Canceladas (CANCELLED)</option>
                </select>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbe7e3', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#4b6968' }}>
                      <th style={{ padding: '12px 16px' }}>Paciente</th>
                      <th style={{ padding: '12px 16px' }}>Tutor</th>
                      <th style={{ padding: '12px 16px' }}>Veterinario</th>
                      <th style={{ padding: '12px 16px' }}>Motivo / Triage</th>
                      <th style={{ padding: '12px 16px' }}>Estado</th>
                      <th style={{ padding: '12px 16px' }}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <b>{c.pet?.name}</b>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{c.pet?.species} · {c.pet?.breed}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <b>{c.client?.firstName} {c.client?.lastName}</b>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{c.client?.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {c.vet ? (
                            <div>
                              <b>Dr. {c.vet.firstName} {c.vet.lastName}</b>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{c.vet.email}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: 600 }}>Sin asignar (En guardia)</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: 260 }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.notes || 'Consulta general'}
                          </div>
                          {c.review && (
                            <small style={{ color: '#f59e0b', fontWeight: 700 }}>
                              ★ {c.review.rating}/5 {c.review.comment ? `("${c.review.comment}")` : ''}
                            </small>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 9px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            background: c.status === 'COMPLETED' ? '#dcfce7' : c.status === 'ACTIVE' ? '#e0e7ff' : c.status === 'WAITING' ? '#fef3c7' : '#fee2e2',
                            color: c.status === 'COMPLETED' ? '#166534' : c.status === 'ACTIVE' ? '#3730a3' : c.status === 'WAITING' ? '#92400e' : '#991b1b',
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {filteredConsultations.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                          No hay consultas con este estado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: AUDITORÍA SENASA                              */}
          {/* ==================================================== */}
          {tab === 'vets' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <span className="eyebrow">Matrículas Profesionales</span>
                <h1>Auditoría y Validación SENASA</h1>
                <p>Revisión y habilitación legal de veterinarios para la atención telemática.</p>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbe7e3', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#4b6968' }}>
                      <th style={{ padding: '12px 16px' }}>Veterinario</th>
                      <th style={{ padding: '12px 16px' }}>Matrícula Informada</th>
                      <th style={{ padding: '12px 16px' }}>Bio / Presentación</th>
                      <th style={{ padding: '12px 16px' }}>Estado Actual</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Resolución Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'VET').map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <b>Dr. {v.firstName} {v.lastName}</b>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{v.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                            {v.licenseNumber || 'NO INFORMADA'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: 280, color: '#64748b' }}>
                          {v.bio || 'Sin descripción profesional ingresada.'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800,
                            background: v.vetStatus === 'APPROVED' ? '#dcfce7' : v.vetStatus === 'PENDING' ? '#fef3c7' : '#fee2e2',
                            color: v.vetStatus === 'APPROVED' ? '#166534' : v.vetStatus === 'PENDING' ? '#92400e' : '#991b1b',
                          }}>
                            {v.vetStatus || 'PENDING'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {v.vetStatus !== 'APPROVED' && (
                              <Button variant="primary" icon="check" onClick={() => handleApproveVet(v.id)}>
                                Aprobar
                              </Button>
                            )}
                            {v.vetStatus !== 'REJECTED' && (
                              <Button variant="danger" icon="close" onClick={() => handleRejectVet(v.id)}>
                                Rechazar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: AUDIT LOGS                                    */}
          {/* ==================================================== */}
          {tab === 'audit' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <span className="eyebrow">Trazabilidad Inmutable</span>
                <h1>Registro de Auditoría</h1>
                <p>Historial legal de acciones administrativas realizadas en la base de datos.</p>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #dbe7e3', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#4b6968' }}>
                      <th style={{ padding: '12px 16px' }}>Acción</th>
                      <th style={{ padding: '12px 16px' }}>Administrador</th>
                      <th style={{ padding: '12px 16px' }}>Target ID</th>
                      <th style={{ padding: '12px 16px' }}>Detalles</th>
                      <th style={{ padding: '12px 16px' }}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 800, color: '#173b3a', background: '#e7f2f0', padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {log.admin?.firstName} {log.admin?.lastName}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                          {log.targetId || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: 300, fontSize: 11, color: '#64748b' }}>
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 11 }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                          Aún no hay registros de auditoría almacenados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* MODAL: USUARIO (CREAR / EDITAR)                      */}
      {/* ==================================================== */}
      {userModalOpen && (
        <div className="modal-layer">
          <div className="modal-scrim" onClick={() => setUserModalOpen(false)} />
          <div className="modal" style={{ width: 'min(540px, 92vw)' }}>
            <button className="button button--icon modal__close" onClick={() => setUserModalOpen(false)}>
              <Icon name="close" size={18} />
            </button>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              {editingUser ? 'Actualizar información del perfil o permisos.' : 'Registrar una nueva cuenta en la plataforma.'}
            </p>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field">
                  <span>Nombre</span>
                  <input
                    required
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Apellido</span>
                  <input
                    required
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  />
                </label>
              </div>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{editingUser ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña (mín 8 car.)'}</span>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Password123!'}
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field">
                  <span>Teléfono</span>
                  <input
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Rol de Cuenta</span>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #dbe7e3', background: '#fff' }}
                  >
                    <option value="CLIENT">Tutor (CLIENT)</option>
                    <option value="VET">Veterinario (VET)</option>
                    <option value="ADMIN">Administrador (ADMIN)</option>
                  </select>
                </label>
              </div>

              {userForm.role === 'VET' && (
                <>
                  <label className="field">
                    <span>Matrícula Profesional SENASA / Provincial</span>
                    <input
                      placeholder="MP-12345"
                      value={userForm.licenseNumber}
                      onChange={(e) => setUserForm({ ...userForm, licenseNumber: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Biografía / Especialidad</span>
                    <textarea
                      rows={2}
                      value={userForm.bio}
                      onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
                    />
                  </label>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="secondary" onClick={() => setUserModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar Usuario</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: MASCOTA (CREAR / EDITAR)                      */}
      {/* ==================================================== */}
      {petModalOpen && (
        <div className="modal-layer">
          <div className="modal-scrim" onClick={() => setPetModalOpen(false)} />
          <div className="modal" style={{ width: 'min(540px, 92vw)' }}>
            <button className="button button--icon modal__close" onClick={() => setPetModalOpen(false)}>
              <Icon name="close" size={18} />
            </button>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>
              {editingPet ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              {editingPet ? 'Modificar datos clínicos o del tutor.' : 'Asignar un nuevo paciente a un tutor registrado.'}
            </p>

            <form onSubmit={handleSavePet} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!editingPet && (
                <label className="field">
                  <span>Tutor Responsable</span>
                  <select
                    required
                    value={petForm.ownerId}
                    onChange={(e) => setPetForm({ ...petForm, ownerId: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #dbe7e3', background: '#fff' }}
                  >
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field">
                  <span>Nombre de la Mascota</span>
                  <input
                    required
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Especie</span>
                  <select
                    value={petForm.species}
                    onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #dbe7e3', background: '#fff' }}
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Hurón">Hurón</option>
                    <option value="Ave">Ave</option>
                    <option value="Otro">Otro</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field">
                  <span>Raza</span>
                  <input
                    required
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Peso (kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 14.5"
                    value={petForm.weightKg}
                    onChange={(e) => setPetForm({ ...petForm, weightKg: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field">
                  <span>Sexo</span>
                  <select
                    value={petForm.sex}
                    onChange={(e) => setPetForm({ ...petForm, sex: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #dbe7e3', background: '#fff' }}
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </label>
                <label className="field">
                  <span>Microchip ISO</span>
                  <input
                    placeholder="15 dígitos"
                    value={petForm.microchip}
                    onChange={(e) => setPetForm({ ...petForm, microchip: e.target.value })}
                  />
                </label>
              </div>

              <label className="field">
                <span>Alergias conocidas</span>
                <input
                  placeholder="Ej: Penicilina, polen..."
                  value={petForm.allergies}
                  onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Condiciones crónicas</span>
                <input
                  placeholder="Ej: Displasia leve, diabetes..."
                  value={petForm.chronicConditions}
                  onChange={(e) => setPetForm({ ...petForm, chronicConditions: e.target.value })}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="secondary" onClick={() => setPetModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar Mascota</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApp;
