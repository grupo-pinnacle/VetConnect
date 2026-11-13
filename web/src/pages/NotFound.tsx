import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fffbef] text-[#183c3a] flex flex-col items-center justify-center p-6 font-['Manrope',sans-serif]" data-testid="not-found-page">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#e4dfd2] max-w-md w-full shadow-sm text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-5">
          <img
            src="/assets/huellicam-mark.png"
            alt="HuelliCam"
            width={192}
            height={192}
            decoding="async"
            className="w-10 h-9 object-contain"
          />
          <span className="font-extrabold text-xl tracking-tight text-[#183c3a]">
            Huelli<span className="text-[#609f9c]">Cam</span>
          </span>
        </div>
        <h1 className="text-6xl font-extrabold text-[#609f9c] tracking-tight mb-2" data-testid="not-found-code">
          404
        </h1>
        <h2 className="text-xl font-bold text-[#183c3a] mb-2" data-testid="not-found-title">
          Página no encontrada
        </h2>
        <p className="text-sm text-[#607674] mb-7 leading-relaxed" data-testid="not-found-message">
          La ruta a la que intentás acceder no existe o fue movida temporalmente.
        </p>
        <button
          type="button"
          data-testid="not-found-home-button"
          onClick={() => navigate('/')}
          className="w-full py-3.5 px-6 bg-[#609f9c] hover:bg-[#4d8d89] active:bg-[#315f5d] text-white rounded-full text-sm font-bold shadow-sm transition-colors cursor-pointer"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
