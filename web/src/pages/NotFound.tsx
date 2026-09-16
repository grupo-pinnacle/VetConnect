import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" data-testid="not-found-page">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-lg text-center">
        <h1 className="text-4xl font-extrabold text-sky-600 mb-2" data-testid="not-found-code">
          404
        </h1>
        <h2 className="text-lg font-bold text-slate-800 mb-2" data-testid="not-found-title">
          Página No Encontrada
        </h2>
        <p className="text-xs text-slate-600 mb-6" data-testid="not-found-message">
          La ruta que intenta consultar no existe o ha sido movida temporalmente.
        </p>
        <button
          data-testid="not-found-home-button"
          onClick={() => navigate('/')}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow transition"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
