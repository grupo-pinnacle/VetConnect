import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export const SessionTerminatedModal: React.FC = () => {
  const { sessionTerminated, dismissSessionTerminated } = useAuth();
  const navigate = useNavigate();

  if (!sessionTerminated) return null;

  const isBanned = sessionTerminated.reason === 'ACCOUNT_BANNED';

  const handleAction = () => {
    dismissSessionTerminated();
    try {
      navigate('/login');
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-terminated-title"
      data-testid="session-terminated-modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-['Manrope',sans-serif]"
      style={{ backgroundColor: 'rgba(24, 60, 58, 0.72)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fadeIn"
        style={{
          backgroundColor: '#fffbef',
          border: isBanned ? '1.5px solid #e98b70' : '1.5px solid #e4dfd2',
          color: '#183c3a',
        }}
      >
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isBanned ? '#fbeee9' : '#d9e8e4',
            border: isBanned ? '1.5px solid #e98b70' : '1.5px solid #609f9c',
            color: isBanned ? '#ae4d45' : '#315f5d',
          }}
        >
          <ShieldAlert className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          {isBanned && (
            <span
              className="inline-block text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full mb-1"
              style={{ backgroundColor: '#fbeee9', color: '#ae4d45', border: '1px solid #f3c2b5' }}
            >
              Baneo Permanente
            </span>
          )}
          <h2
            id="session-terminated-title"
            className="text-xl sm:text-2xl font-extrabold tracking-tight"
            style={{ color: isBanned ? '#8b2615' : '#183c3a' }}
          >
            {isBanned ? 'Cuenta Suspendida Definitivamente' : 'Sesión cerrada en este dispositivo'}
          </h2>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: '#607674' }}
          >
            {sessionTerminated.message ||
              (isBanned
                ? 'Tu cuenta ha sido suspendida permanentemente por un administrador por infracción de normativas y términos de la plataforma. El acceso a este perfil ha sido revocado.'
                : 'Se ha detectado un inicio de sesión en tu cuenta desde otro dispositivo o navegador. Por razones de confidencialidad clínica y seguridad del paciente, esta sesión anterior ha sido finalizada.')}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleAction}
            className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-white transition-colors shadow-sm cursor-pointer ${
              isBanned ? 'bg-[#ae4d45] hover:bg-[#8d3d36]' : 'bg-[#609f9c] hover:bg-[#4d8d89]'
            }`}
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>{isBanned ? 'Entendido / Ir al inicio' : 'Volver a iniciar sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTerminatedModal;
