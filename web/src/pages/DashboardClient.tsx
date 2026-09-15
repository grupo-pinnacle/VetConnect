import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardClient: React.FC = () => {
  const { user, logout } = useAuth();

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
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mis Mascotas</h2>
          <p className="text-sm text-slate-600">Cascarón funcional para listado y alta de mascotas.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Solicitar Teleconsulta</h2>
          <p className="text-sm text-slate-600">Cascarón funcional para triage y cola de espera telemática.</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardClient;
