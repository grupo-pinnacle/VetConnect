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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: '#0e2625' }}
    >
      <div
        className="rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#fffbef',
          border: isBanned ? '2px solid #e98b70' : '2px solid #183c3a',
          color: '#183c3a',
        }}
      >
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center animate-bounce"
          style={{
            backgroundColor: isBanned ? '#fbeee9' : '#faebe7',
            border: isBanned ? '2px solid #c96b52' : '2px solid #e98b70',
            color: isBanned ? '#c96b52' : '#e98b70',
          }}
        >
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          {isBanned && (
            <span
              className="inline-block text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full mb-1"
              style={{ backgroundColor: '#fbeee9', color: '#c96b52', border: '1px solid #f3c2b5' }}
            >
              Baneo Permanente
            </span>
          )}
          <h2
            id="session-terminated-title"
            className="text-xl sm:text-2xl font-black tracking-tight"
            style={{ color: isBanned ? '#8b2615' : '#183c3a' }}
          >
            {isBanned ? 'Cuenta Suspendida Definitivamente' : 'Sesión cerrada en este dispositivo'}
          </h2>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: '#315f5d' }}
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
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white transition-colors shadow-md cursor-pointer"
            style={{
              backgroundColor: isBanned ? '#8b2615' : '#183c3a',
              border: isBanned ? '1px solid #701c0e' : '1px solid #315f5d',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = isBanned ? '#701c0e' : '#254d4a';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = isBanned ? '#8b2615' : '#183c3a';
            }}
          >
            <LogIn className="w-4 h-4" />
            <span>{isBanned ? 'Entendido / Ir al inicio' : 'Volver a iniciar sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTerminatedModal;
