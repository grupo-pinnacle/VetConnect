import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardVet: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-900">VetConnect — Portal Veterinario</h1>
          <p className="text-sm text-slate-600">
            Dr/a. {user?.firstName} {user?.lastName} (Matrícula: {user?.licenseNumber || 'N/A'})
          </p>
          <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
            Estado: {user?.vetStatus || 'PENDING'}
          </span>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Sala de Espera (Guardia)</h2>
          <p className="text-sm text-slate-600">Cascarón funcional para atencion FIFO de pacientes en cola.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Historial de Consultas Atendidas</h2>
          <p className="text-sm text-slate-600">Cascarón funcional para registros médicos y emisión de recetas.</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardVet;
