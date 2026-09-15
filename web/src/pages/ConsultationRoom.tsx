import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CallRoom from '../components/call/CallRoom';
import { Message, ApiResponse } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const ConsultationRoom: React.FC = () => {
  const { id: consultationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  // 1. Emit page:ready handshake for mobile WebView wrapper
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'page:ready' }));
    }
  }, []);

  // 2. Fetch real LiveKit JWT token from backend
  useEffect(() => {
    let isMounted = true;

    const fetchToken = async () => {
      try {
        const res = await api.post<ApiResponse<{ token: string; wsUrl: string }>>(
          `/api/calls/${consultationId}/token`
        );

        if (res.data.success && res.data.data?.token) {
          if (isMounted) {
            setLivekitToken(res.data.data.token);
          }
        } else {
          throw new Error(res.data.error?.message || 'No se pudo obtener el token WebRTC');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error conectando con la videollamada');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (consultationId) {
      fetchToken();
    }

    return () => {
      isMounted = false;
    };
  }, [consultationId]);

  // 3. Connect Socket.io for Realtime Chat
  useEffect(() => {
    if (!consultationId) return;

    const newSocket = io(WS_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join:consultation', { consultationId });
    });

    newSocket.on('message:new', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Load initial message history
    api.get<ApiResponse<Message[]>>(`/api/consultations/${consultationId}/messages`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setMessages(res.data.data);
        }
      })
      .catch((err) => console.warn('Error loading chat history:', err));

    return () => {
      newSocket.disconnect();
    };
  }, [consultationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !consultationId) return;

    const clientMsgId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    socket.emit(
      'message:send',
      {
        consultationId,
        content: inputMessage.trim(),
        clientMsgId,
      },
      (res: any) => {
        if (res && res.success && res.data) {
          // Message processed cleanly
        }
      }
    );

    setInputMessage('');
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg">Conectando con la sala de consulta...</p>
      </div>
    );
  }

  if (error || !livekitToken) {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error de Conexion</h2>
        <p className="text-slate-300 mb-6">{error || 'No se pudo obtener credenciales WebRTC'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Main Video Call Area */}
      <div className="flex-1 h-2/3 lg:h-full relative">
        <header className="absolute top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm text-white p-4 flex justify-between items-center z-20">
          <h1 className="text-md font-semibold">Consulta Médica #{consultationId?.slice(0, 8)}</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-xs font-semibold rounded"
          >
            Salir
          </button>
        </header>

        <CallRoom
          token={livekitToken}
          onDisconnected={() => {
            if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
              (window as any).ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'call:ended' })
              );
            }
            navigate(-1);
          }}
        />
      </div>

      {/* Live Chat Side Panel */}
      <div className="w-full lg:w-80 h-1/3 lg:h-full bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 text-white font-semibold text-sm">
          Chat Clínico en Vivo
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id || msg.clientMsgId}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5">
                  {msg.sender?.firstName || 'Usuario'}
                </span>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs max-w-[85%] ${
                    isMine ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escriba un mensaje..."
            className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded text-xs font-semibold"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationRoom;
