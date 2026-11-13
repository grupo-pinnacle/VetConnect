import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { startRingtone, stopRingtone } from '../../lib/ringtone';
import { Video, PhoneCall, PhoneOff, Stethoscope, ShieldCheck } from 'lucide-react';

import api, { getAccessToken, getDeviceId } from '../../services/api';
import { getWsUrl } from '../../lib/ws';

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

    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const deviceId = getDeviceId();
    const socket = io(wsUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
        deviceId,
      },
    });
    socketRef.current = socket;

    socket.on('call:incoming', (data: IncomingCallData) => {
      setIncomingCall(data);
      startRingtone();
    });

    socket.on('auth:session_terminated', (data: { reason: string; message: string }) => {
      stopRingtone();
      setIncomingCall(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('vetconnect:session_terminated', {
            detail: data,
          })
        );
      }
    });

    socket.on('session:invalidated', (data: { reason?: string; message?: string }) => {
      stopRingtone();
      setIncomingCall(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('vetconnect:session_terminated', {
            detail: {
              reason: data?.reason || 'MULTIPLE_DEVICES_DETECTED',
              message: data?.message || 'Tu sesión fue transferida a otro dispositivo.',
            },
          })
        );
      }
    });

    socket.on('consultation:critical_resume', (data: { consultationId: string }) => {
      stopRingtone();
      setIncomingCall(null);
      if (data?.consultationId) {
        navigate(`/call/${data.consultationId}`);
      }
    });

    const handleDismissCall = (payload?: { consultationId?: string }) => {
      stopRingtone();
      setIncomingCall((prev) =>
        !prev || !payload?.consultationId || payload.consultationId === prev.consultationId ? null : prev
      );
    };

    socket.on('call:ended', handleDismissCall);
    socket.on('call:cancelled', handleDismissCall);

    return () => {
      stopRingtone();
      socket.off('call:incoming');
      socket.off('auth:session_terminated');
      socket.off('session:invalidated');
      socket.off('consultation:critical_resume');
      socket.off('call:ended', handleDismissCall);
      socket.off('call:cancelled', handleDismissCall);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, navigate]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    const cid = incomingCall.consultationId;
    stopRingtone();
    setIncomingCall(null);
    try {
      await api.patch(`/api/consultations/${cid}/assign`);
    } catch {
      // Fallback defensivo: CallRoom.tsx reintentará si sigue en WAITING o ignorará si ya está ACTIVE
    } finally {
      navigate(`/call/${cid}`);
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183c3a]/55 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="bg-[#fffbef] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(24,60,58,0.28)] border border-[#e4dfd2] text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Pulsing Clinical Video Call Avatar */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-[#609f9c]/25 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#183c3a] to-[#315f5d] text-white flex items-center justify-center shadow-lg border-2 border-[#609f9c]">
            <Video className="w-9 h-9 text-[#d9e8e4] animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* Call Info */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#edf6f4] text-[#315f5d] border border-[#609f9c]/40">
            <span className="w-2 h-2 rounded-full bg-[#609f9c] animate-ping" />
            Llamada Clínica Entrante
          </span>
          <h2 id="incoming-call-title" className="text-xl font-extrabold text-[#183c3a] tracking-tight">
            {incomingCall.callerName || 'Consulta Médica'}
          </h2>
          <p className="text-xs text-[#454e4e] font-medium">
            Videoconsulta veterinaria oficial en tiempo real
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#454e4e] bg-[#f2eddd] py-2 px-3 rounded-xl border border-[#e4dfd2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#315f5d]" />
          <span>Canal Cifrado • SENASA Res. 1442/2021</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            data-testid="reject-incoming-call-button"
            onClick={handleReject}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold text-[#ae4d45] bg-[#fcece9] hover:bg-[#f9ded8] active:bg-[#f6cfc7] border border-[#e98b70]/50 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Rechazar</span>
          </button>

          <button
            type="button"
            data-testid="accept-incoming-call-button"
            onClick={handleAccept}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-extrabold text-white bg-[#609f9c] hover:bg-[#4d8d89] active:bg-[#315f5d] shadow-md shadow-[#609f9c]/25 transition-all cursor-pointer"
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
