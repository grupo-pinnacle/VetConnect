import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Pet, Consultation, ApiResponse } from '../types';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PetCardSkeleton } from '../components/ui/Skeleton';
import { SpeciesIcon } from '../components/icons/SpeciesIcons';
import {
  Heart,
  Stethoscope,
  Plus,
  Video,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  LogOut,
  ArrowRight,
  Scale,
  QrCode,
  AlertCircle,
  Activity,
  X,
  Calendar,
} from 'lucide-react';

export const DashboardClient: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const triageRef = useRef<HTMLElement>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Pet Form State
  const [showPetModal, setShowPetModal] = useState(false);
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'Canine',
    breed: '',
    weightKg: '',
    microchip: '',
  });

  // Triage Request Form State
  const [selectedPetId, setSelectedPetId] = useState('');
  const [notes, setNotes] = useState('');
  const [triagePriority, setTriagePriority] = useState<'ROJO' | 'AMARILLO' | 'VERDE'>('VERDE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [petsRes, consRes] = await Promise.all([
        api.get<ApiResponse<Pet[]>>('/api/pets'),
        api.get<ApiResponse<Consultation[]>>('/api/consultations/mine'),
      ]);

      if (petsRes.data.success && petsRes.data.data) {
        setPets(petsRes.data.data);
      }
      if (consRes.data.success && consRes.data.data) {
        setConsultations(consRes.data.data);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message || 'Error cargando datos del tutor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed,
        weightKg: petForm.weightKg ? parseFloat(petForm.weightKg) : undefined,
        microchip: petForm.microchip.trim() ? petForm.microchip.trim() : undefined,
      };

      const res = await api.post<ApiResponse<Pet>>('/api/pets', payload);
      if (res.data.success && res.data.data) {
        setPets((prev) => [res.data.data!, ...prev]);
        setShowPetModal(false);
        setPetForm({ name: '', species: 'Canine', breed: '', weightKg: '', microchip: '' });
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      alert(apiErr.response?.data?.error?.message || 'Error al registrar mascota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !notes.trim()) {
      alert('Por favor seleccione una mascota e ingrese el motivo de consulta');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedNotes = `[Prioridad: ${triagePriority}] ${notes.trim()}`;
      const res = await api.post<ApiResponse<Consultation>>('/api/consultations', {
        petId: selectedPetId,
        notes: formattedNotes,
      });

      if (res.data.success && res.data.data) {
        setConsultations((prev) => [res.data.data!, ...prev]);
        setNotes('');
        navigate(`/call/${res.data.data.id}`);
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      alert(apiErr.response?.data?.error?.message || 'Error al solicitar consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickTriage = (petId: string, priority?: 'ROJO' | 'AMARILLO' | 'VERDE') => {
    setSelectedPetId(petId);
    if (priority) setTriagePriority(priority);
    triageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEmergencyClick = () => {
    setTriagePriority('ROJO');
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
    triageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#F8F5EE] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
        data-testid="client-loading-state"
      >
        <div className="bg-white/80 p-6 rounded-2xl shadow-sm h-28 border border-[#E8E2D5] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetCardSkeleton />
          <PetCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F8F5EE] text-[#06241D] antialiased selection:bg-emerald-500 selection:text-white p-4 sm:p-6 lg:p-8"
      data-testid="dashboard-client-page"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs
          items={[{ label: 'Inicio', path: '/' }, { label: 'Mis Mascotas y Consultas' }]}
          className="mb-2"
        />

        {/* 1. Header Clínico del Tutor */}
        <header className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#06241D] to-emerald-800 text-white flex items-center justify-center shadow-md shrink-0">
              <Heart className="w-7 h-7 text-emerald-300 fill-emerald-300/20" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl sm:text-2xl font-extrabold text-[#06241D] tracking-tight"
                  data-testid="header-title"
                >
                  VetConnect — Portal Tutor
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Tutor Verificado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5" data-testid="welcome-message">
                Bienvenido/a, {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          <button
            data-testid="logout-button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            Cerrar Sesión
          </button>
        </header>

        {/* Error Alert */}
        {error && (
          <div
            className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm"
            data-testid="error-alert"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Hero de Bienvenida y Guardia Inmediata */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06241D] via-[#0B3B30] to-[#041E18] text-white p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(6,36,29,0.3)] border border-emerald-900/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Guardia Veterinaria 24hs Activa • Médicos en línea
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Salud y bienestar integral para tus compañeros peludos
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Conectate en minutos con veterinarios matriculados, recibí recetas oficiales SENASA con firma criptográfica y gestioná el historial clínico de todas tus mascotas en un solo lugar.
              </p>

              {/* Fast Stats Row */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-200/90">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span>{pets.length} {pets.length === 1 ? 'Mascota registrada' : 'Mascotas registradas'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>{consultations.length} Consultas en historial</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SENASA Res. 1442/2021</span>
                </div>
              </div>
            </div>

            {/* Emergency CTA Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleEmergencyClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-800 active:to-rose-800 shadow-[0_10px_25px_-5px_rgba(225,29,72,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer border border-rose-400/30"
              >
                <AlertTriangle className="w-5 h-5 text-rose-200 animate-pulse" />
                <span>🚨 Solicitar Guardia Médica 24hs</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Grid: Pets Section & Triage / Consultations */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pets (5 cols) */}
          <section
            className="lg:col-span-5 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5] flex flex-col"
            data-testid="pets-section"
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#06241D]" data-testid="pets-section-title">
                  Mis Mascotas ({pets.length})
                </h2>
              </div>
              <button
                data-testid="add-pet-button"
                onClick={() => setShowPetModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-700/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>+ Nueva Mascota</span>
              </button>
            </div>

            <div className="space-y-3.5 flex-1" data-testid="pets-list">
              {pets.length === 0 ? (
                <div
                  className="p-8 text-center bg-gradient-to-b from-[#F8F5EE]/60 to-[#F8F5EE] border border-dashed border-[#E8E2D5] rounded-2xl flex flex-col items-center justify-center transition-all h-full"
                  data-testid="empty-pets-state"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-inner border border-emerald-100">
                    <Heart className="w-8 h-8 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-extrabold text-[#06241D] text-base mb-1.5">
                    Aún no registraste a tus compañeros peludos
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">
                    Para poder solicitar teleconsultas veterinarias en tiempo real y llevar el historial médico de vacunas y recetas oficiales, primero añade los datos de tu mascota.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPetModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-700/20 hover:shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    + Registrar a mi primera mascota
                  </button>
                </div>
              ) : (
                pets.map((pet) => {
                  const isSelected = selectedPetId === pet.id;
                  return (
                    <div
                      key={pet.id}
                      data-testid={`pet-card-${pet.id}`}
                      className={`p-4 rounded-xl border transition-all duration-200 relative group ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                          : 'bg-white hover:bg-[#F8F5EE]/60 border-[#E8E2D5] hover:border-emerald-300 shadow-[0_2px_8px_-2px_rgba(6,36,29,0.04)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 shadow-inner">
                            <SpeciesIcon species={pet.species} className="w-6 h-6 text-emerald-700" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className="font-extrabold text-[#06241D] text-base tracking-tight"
                                data-testid={`pet-name-${pet.id}`}
                              >
                                {pet.name}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {pet.species}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              {pet.breed || 'Raza mestiza / sin especificar'}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                              {pet.weightKg && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md font-semibold">
                                  <Scale className="w-3 h-3 text-amber-600" />
                                  {pet.weightKg} kg
                                </span>
                              )}
                              {pet.microchip && (
                                <span
                                  className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                                  data-testid={`pet-microchip-${pet.id}`}
                                >
                                  <QrCode className="w-3 h-3 text-sky-600" />
                                  ISO: {pet.microchip}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickTriage(pet.id)}
                          className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          <span>{isSelected ? 'Seleccionado' : 'Pedir Consulta'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Column: Triage Request Form & Consultations (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Consultation Triage Request */}
            <section
              ref={triageRef}
              className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5] relative overflow-hidden"
              data-testid="triage-section"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#00875A] to-emerald-700" />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#06241D]" data-testid="triage-title">
                    Solicitar Teleconsulta Médica
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ingresá a la guardia virtual con atención y evaluación clínica en tiempo real
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateConsultation} className="space-y-5" data-testid="triage-form">
                {/* Pet Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Paciente / Mascota *
                  </label>
                  <select
                    data-testid="select-pet-dropdown"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl bg-white text-sm font-medium text-slate-800 transition-all cursor-pointer"
                  >
                    <option value="">Seleccione una mascota</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nivel de Urgencia Clínico (Triage) *
                  </label>

                  {/* Interactive Visual Priority Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                    <button
                      type="button"
                      onClick={() => setTriagePriority('VERDE')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        triagePriority === 'VERDE'
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white hover:bg-slate-50 border-[#E8E2D5]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Verde — Control
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Dudas generales, control post-quirúrgico, conducta o vacunas.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTriagePriority('AMARILLO')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        triagePriority === 'AMARILLO'
                          ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                          : 'bg-white hover:bg-slate-50 border-[#E8E2D5]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Amarillo — Moderado
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Vómitos leves, claudicación o heridas menores sin sangrado activo.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTriagePriority('ROJO')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        triagePriority === 'ROJO'
                          ? 'bg-rose-50/90 border-rose-500 shadow-sm ring-2 ring-rose-500/20 animate-pulse'
                          : 'bg-white hover:bg-slate-50 border-[#E8E2D5]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800 mb-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Rojo — Urgencia Vital
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Dificultad respiratoria, abdomen duro, convulsiones o traumatismo severo.
                      </p>
                    </button>
                  </div>

                  {/* Canonical Select preserved for tests & accessible form controls */}
                  <select
                    data-testid="select-triage-priority"
                    value={triagePriority}
                    onChange={(e) => setTriagePriority(e.target.value as 'ROJO' | 'AMARILLO' | 'VERDE')}
                    className="w-full px-3.5 py-2 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl bg-white text-xs font-semibold text-slate-700"
                  >
                    <option value="VERDE">VERDE — Consulta General / Leve</option>
                    <option value="AMARILLO">AMARILLO — Urgencia Moderada</option>
                    <option value="ROJO">ROJO — Emergencia Severa</option>
                  </select>
                </div>

                {/* Consultation Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Motivo / Síntomas Observados *
                  </label>
                  <textarea
                    data-testid="input-consultation-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describí los síntomas con claridad: cuándo comenzaron, apetito, decaimiento o cambios de conducta..."
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  data-testid="submit-triage-button"
                  disabled={isSubmitting}
                  className="w-full bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 text-white py-3.5 rounded-xl text-sm font-extrabold shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ingresando a Triage Clínico...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 h-4" />
                      <span>Ingresar a Cola de Triage</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Active / Recent Consultations List */}
            <section
              className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-[0_12px_40px_-15px_rgba(6,36,29,0.06)] border border-[#E8E2D5]"
              data-testid="active-consultations-section"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[#06241D] text-base">Mis Consultas Recientes</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {consultations.length} {consultations.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              <div className="space-y-3">
                {consultations.length === 0 ? (
                  <div
                    className="p-8 text-center bg-gradient-to-b from-[#F8F5EE]/60 to-[#F8F5EE] border border-dashed border-[#E8E2D5] rounded-2xl flex flex-col items-center justify-center transition-all"
                    data-testid="empty-consultations-state"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 shadow-inner border border-sky-100">
                      <Stethoscope className="w-7 h-7 text-sky-600" aria-hidden="true" />
                    </div>
                    <h4 className="font-extrabold text-[#06241D] text-sm sm:text-base mb-1">
                      No tienes consultas activas ni pendientes
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                      Si tu mascota presenta síntomas o necesitás una receta veterinaria oficial, completá el formulario superior para ingresar a la cola de triage con atención profesional.
                    </p>
                  </div>
                ) : (
                  consultations.map((c) => {
                    const isUrgent = c.notes?.includes('ROJO');
                    const isModerate = c.notes?.includes('AMARILLO');

                    return (
                      <div
                        key={c.id}
                        data-testid={`consultation-card-${c.id}`}
                        className="p-4 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#F8F5EE]/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-[#06241D]">
                              Mascota: {c.pet?.name || 'Paciente'}
                            </p>
                            {isUrgent ? (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                ROJO
                              </span>
                            ) : isModerate ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                AMARILLO
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                VERDE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 max-w-md font-medium">
                            {c.notes}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                                : c.status === 'WAITING'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {c.status === 'WAITING' && 'En Espera'}
                            {c.status === 'ACTIVE' && 'En Consulta'}
                            {c.status === 'COMPLETED' && 'Finalizada'}
                            {c.status === 'CANCELLED' && 'Cancelada'}
                          </span>

                          {(c.status === 'WAITING' || c.status === 'ACTIVE') && (
                            <button
                              data-testid={`join-call-button-${c.id}`}
                              onClick={() => navigate(`/call/${c.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Entrar a Videoconsulta</span>
                            </button>
                          )}

                          {c.status === 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => navigate(`/prescriptions/${c.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                              title="Ver Receta Oficial SENASA"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Receta SENASA</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </main>

        {/* 4. Modal Nueva Mascota */}
        {showPetModal && (
          <div
            className="fixed inset-0 bg-[#06241D]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            data-testid="add-pet-modal"
          >
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E8E2D5] overflow-hidden">
              <div className="bg-gradient-to-r from-[#06241D] to-[#0B3B30] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight">Nueva Mascota</h2>
                    <p className="text-[11px] text-emerald-200/80">Registro en padrón clínico veterinario</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPetModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePet} className="p-6 space-y-4" data-testid="add-pet-form">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nombre del Paciente *
                  </label>
                  <input
                    data-testid="input-pet-name"
                    type="text"
                    placeholder="Ej. Firulais, Milo, Luna"
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Especie *
                    </label>
                    <select
                      data-testid="select-pet-species"
                      value={petForm.species}
                      onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm bg-white font-medium transition-all cursor-pointer"
                    >
                      <option value="Canine">Canino (Perro)</option>
                      <option value="Feline">Felino (Gato)</option>
                      <option value="Other">Otro (Exótico)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Raza *
                    </label>
                    <input
                      data-testid="input-pet-breed"
                      type="text"
                      placeholder="Ej. Labrador / Mestizo"
                      value={petForm.breed}
                      onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Peso (Kg)
                    </label>
                    <input
                      data-testid="input-pet-weight"
                      type="number"
                      step="0.1"
                      placeholder="Ej. 12.5"
                      value={petForm.weightKg}
                      onChange={(e) => setPetForm({ ...petForm, weightKg: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Microchip ISO
                    </label>
                    <input
                      data-testid="input-pet-microchip"
                      type="text"
                      placeholder="15 dígitos"
                      value={petForm.microchip}
                      onChange={(e) => setPetForm({ ...petForm, microchip: e.target.value })}
                      className="w-full px-3 py-2.5 border border-[#E8E2D5] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-mono transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#E8E2D5]">
                  <button
                    type="button"
                    data-testid="cancel-add-pet-button"
                    onClick={() => setShowPetModal(false)}
                    className="flex-1 py-2.5 px-4 border border-[#E8E2D5] rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    data-testid="save-pet-button"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-emerald-700/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Mascota'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardClient;
