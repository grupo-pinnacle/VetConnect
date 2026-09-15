import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Pet, Consultation, ApiResponse } from '../types';

export const DashboardClient: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Pet Form Modal State
  const [showPetModal, setShowPetModal] = useState(false);
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'Canine',
    breed: '',
    weightKg: '',
    microchip: '',
  });

  // New Consultation Form State
  const [selectedPetId, setSelectedPetId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
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
    } catch (err) {
      console.warn('Error cargando datos del tutor:', err);
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
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al registrar mascota');
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
      const res = await api.post<ApiResponse<Consultation>>('/api/consultations', {
        petId: selectedPetId,
        notes: notes.trim(),
      });

      if (res.data.success && res.data.data) {
        setConsultations((prev) => [res.data.data!, ...prev]);
        setNotes('');
        alert('Consulta creada exitosamente. Ingressando a sala...');
        navigate(`/call/${res.data.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al solicitar consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 font-medium">Cargando portal del tutor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-900">VetConnect — Portal Tutor</h1>
          <p className="text-sm text-slate-600">Bienvenido/a, {user?.firstName} {user?.lastName}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pets Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Mis Mascotas ({pets.length})</h2>
            <button
              onClick={() => setShowPetModal(true)}
              className="px-3 py-1.5 bg-secondary-600 text-white rounded-lg text-xs font-semibold hover:bg-secondary-500"
            >
              + Agregar Mascota
            </button>
          </div>

          <div className="space-y-3">
            {pets.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No tienes mascotas registradas</p>
            ) : (
              pets.map((pet) => (
                <div key={pet.id} className="p-3 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{pet.name}</h3>
                    <p className="text-xs text-slate-500">{pet.species} - {pet.breed}</p>
                  </div>
                  {pet.microchip && (
                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                      ISO: {pet.microchip}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Consultation Request */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Solicitar Teleconsulta</h2>

          <form onSubmit={handleCreateConsultation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mascota</label>
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
              >
                <option value="">Seleccione una mascota</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Síntomas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                rows={3}
                placeholder="Describa brevemente los síntomas del paciente..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Solicitando...' : 'Ingresar a Cola de Triage'}
            </button>
          </form>

          {/* Active Consultations List */}
          <div className="mt-6">
            <h3 className="font-semibold text-slate-700 text-sm mb-2">Mis Consultas Recientes</h3>
            <div className="space-y-2">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/call/${c.id}`)}
                  className="p-3 border border-slate-200 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-50"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">Mascota: {c.pet?.name || 'Paciente'}</p>
                    <p className="text-[11px] text-slate-500">{c.notes}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Agregar Mascota */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Nueva Mascota</h2>
            <form onSubmit={handleCreatePet} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={petForm.name}
                onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                required
                className="w-full p-2 border rounded text-sm"
              />
              <select
                value={petForm.species}
                onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                <option value="Canine">Canino</option>
                <option value="Feline">Felino</option>
                <option value="Other">Otro</option>
              </select>
              <input
                type="text"
                placeholder="Raza"
                value={petForm.breed}
                onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                required
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Peso en Kg (opcional)"
                value={petForm.weightKg}
                onChange={(e) => setPetForm({ ...petForm, weightKg: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Microchip ISO 15 dígitos (opcional)"
                value={petForm.microchip}
                onChange={(e) => setPetForm({ ...petForm, microchip: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPetModal(false)}
                  className="flex-1 p-2 border rounded text-sm text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 p-2 bg-primary-900 text-white rounded text-sm font-semibold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardClient;
