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
  const [livekitWsUrl, setLivekitWsUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Close Lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoomImage) {
        setZoomImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomImage]);

  // 1. Emit page:ready handshake for mobile WebView wrapper
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'page:ready' }));
    }
  }, []);

  // 2. Fetch real LiveKit JWT token and dynamic wsUrl from backend
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
            if (res.data.data.wsUrl) {
              setLivekitWsUrl(res.data.data.wsUrl);
            }
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !consultationId || !socket) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Solo se admiten imágenes en formato JPEG, PNG o WebP');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no puede superar 10 MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('consultationId', consultationId);

    try {
      setUploadingPhoto(true);
      const res = await api.post<ApiResponse<{ id: string; fileName: string }>>('/api/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.data?.id) {
        const mediaId = res.data.data.id;
        const attachmentUrl = `/api/media/${mediaId}`;
        const clientMsgId = `web-media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        socket.emit('message:send', {
          consultationId,
          content: inputMessage.trim() || `📷 ${file.name}`,
          attachmentUrl,
          clientMsgId,
        });
        setInputMessage('');
      }
    } catch (err: any) {
      console.error('Error subiendo imagen clínica:', err);
      alert(err.response?.data?.error?.message || 'Error al subir la imagen clínica');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
    <div className="w-full h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden relative">
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
          serverUrl={livekitWsUrl}
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
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 text-white font-semibold text-sm flex justify-between items-center">
          <span>Chat Clínico en Vivo</span>
          {uploadingPhoto && <span className="text-xs text-sky-400 animate-pulse">Subiendo foto...</span>}
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            const fullAttachmentUrl = msg.attachmentUrl
              ? msg.attachmentUrl.startsWith('http')
                ? msg.attachmentUrl
                : `${api.defaults.baseURL || ''}${msg.attachmentUrl}`
              : null;

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

                  {fullAttachmentUrl && (
                    <div className="mt-1.5 cursor-pointer overflow-hidden rounded border border-slate-700 hover:opacity-90 transition-opacity">
                      <img
                        src={fullAttachmentUrl}
                        alt="Fotografía clínica"
                        className="max-h-36 max-w-full object-cover rounded"
                        onClick={() => setZoomImage(fullAttachmentUrl)}
                      />
                      <span className="text-[10px] text-slate-300 block px-1 py-0.5 bg-black/40 text-center">
                        🔍 Clic para ampliar
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            title="Adjuntar macro-fotografía clínica"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 disabled:opacity-50 transition-colors"
          >
            {uploadingPhoto ? '⏳' : '📎'}
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={uploadingPhoto ? 'Subiendo imagen...' : 'Escriba un mensaje...'}
            disabled={uploadingPhoto}
            className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={uploadingPhoto || !inputMessage.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-semibold"
          >
            Enviar
          </button>
        </form>
      </div>

      {/* Lightbox Modal for Clinical Images */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-red-400 font-bold text-sm bg-slate-800/80 px-3 py-1 rounded-full"
            >
              Cerrar (Esc) ✕
            </button>
            <img
              src={zoomImage}
              alt="Foto macroscópica ampliada"
              className="max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain border border-slate-700"
            />
            <p className="text-xs text-slate-400 mt-2 text-center">
              Inspección Macroscópica de Lesión Clínica — Presione Escape para salir
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom;
