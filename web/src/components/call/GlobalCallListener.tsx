import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { startRingtone, stopRingtone } from '../../lib/ringtone';
import { Video, PhoneCall, PhoneOff, Stethoscope, ShieldCheck } from 'lucide-react';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

interface IncomingCallData {
  consultationId: string;
  callerName: string;
  roomName: string;
}

export const GlobalCallListener: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io with credentials (cookie/token)
    const socket = io(WS_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('call:incoming', (data: IncomingCallData) => {
      setIncomingCall(data);
      startRingtone();
    });

    return () => {
      stopRingtone();
      socket.off('call:incoming');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const handleAccept = () => {
    if (!incomingCall) return;
    const cid = incomingCall.consultationId;
    stopRingtone();
    setIncomingCall(null);
    navigate(`/call/${cid}`);
  };

  const handleReject = () => {
    if (!incomingCall) return;
    stopRingtone();
    if (socketRef.current) {
      socketRef.current.emit('call:rejected', { consultationId: incomingCall.consultationId });
    }
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-call-title"
      data-testid="global-incoming-call-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06241D]/60 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(6,36,29,0.3)] border border-[#E8E2D5] text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Pulsing Clinical Video Call Avatar */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#06241D] to-emerald-700 text-white flex items-center justify-center shadow-lg border-2 border-emerald-400">
            <Video className="w-9 h-9 text-emerald-300 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* Call Info */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Llamada Clínica Entrante
          </span>
          <h2 id="incoming-call-title" className="text-xl font-extrabold text-[#06241D] tracking-tight">
            {incomingCall.callerName || 'Consulta Médica'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Videoconsulta veterinaria oficial en tiempo real
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-[#FAF8F5] py-2 px-3 rounded-xl border border-[#E8E2D5]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Canal Cifrado • SENASA Res. 1442/2021</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            data-testid="reject-incoming-call-button"
            onClick={handleReject}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Rechazar</span>
          </button>

          <button
            type="button"
            data-testid="accept-incoming-call-button"
            onClick={handleAccept}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-[#00875A] hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-700/25 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Atender</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalCallListener;
