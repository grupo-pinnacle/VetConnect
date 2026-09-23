import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CallRoom from '../components/call/CallRoom';
import { ReviewModal } from '../components/ui/ReviewModal';
import { Message, ApiResponse, Consultation } from '../types';
import { Stethoscope, CheckCircle2, Search, Paperclip, Loader2, X } from 'lucide-react';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const POLLING_INTERVAL_MS = 5000;

// ------------------------------------------------------------
// State machine for the consultation lifecycle:
//   LOADING → WAITING → ACTIVE → COMPLETED | CANCELLED | ERROR
// ------------------------------------------------------------
type RoomPhase = 'loading' | 'waiting' | 'active' | 'completed' | 'cancelled' | 'error';

export const ConsultationRoom: React.FC = () => {
  const { id: consultationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- State machine ---
  const [phase, setPhase] = useState<RoomPhase>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(true);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  // --- LiveKit credentials (only populated when phase === 'active') ---
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitWsUrl, setLivekitWsUrl] = useState<string | undefined>(undefined);

  // --- Live Chat state ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ----------------------------------------------------------------
  // Helper: fetch consultation status and drive the state machine
  // ----------------------------------------------------------------
  const fetchConsultation = useCallback(async (): Promise<Consultation | null> => {
    if (!consultationId) return null;
    try {
      const res = await api.get<ApiResponse<Consultation>>(`/api/consultations/${consultationId}`);
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }, [consultationId]);

  // ----------------------------------------------------------------
  // Helper: fetch LiveKit token (only call when status === ACTIVE)
  // ----------------------------------------------------------------
  const fetchToken = useCallback(async (): Promise<void> => {
    if (!consultationId) return;
    try {
      const res = await api.post<ApiResponse<{ token: string; wsUrl: string }>>(
        `/api/calls/${consultationId}/token`
      );
      if (res.data.success && res.data.data?.token) {
        setLivekitToken(res.data.data.token);
        if (res.data.data.wsUrl) {
          setLivekitWsUrl(res.data.data.wsUrl);
        }
        setPhase('active');
      } else {
        throw new Error(res.data.error?.message || 'No se pudo obtener el token WebRTC');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error conectando con la videollamada');
      setPhase('error');
    }
  }, [consultationId]);

  // ----------------------------------------------------------------
  // Stop polling helper
  // ----------------------------------------------------------------
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ----------------------------------------------------------------
  // Main state machine: on mount, fetch consultation and react
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!consultationId) return;

    let isMounted = true;

    const bootstrap = async () => {
      const data = await fetchConsultation();
      if (!isMounted) return;

      if (!data) {
        setErrorMsg('No se pudo cargar la información de la consulta.');
        setPhase('error');
        return;
      }

      setConsultation(data);

      switch (data.status) {
        case 'WAITING':
          setPhase('waiting');
          // Poll every 5s until status changes — AGENTS.md / 08_DESARROLLO §2.1
          pollingRef.current = setInterval(async () => {
            const polled = await fetchConsultation();
            if (!isMounted || !polled) return;
            setConsultation(polled);

            if (polled.status === 'ACTIVE') {
              stopPolling();
              await fetchToken();
            } else if (polled.status === 'CANCELLED') {
              stopPolling();
              if (isMounted) setPhase('cancelled');
            } else if (polled.status === 'COMPLETED') {
              stopPolling();
              if (isMounted) setPhase('completed');
            }
          }, POLLING_INTERVAL_MS);
          break;

        case 'ACTIVE':
          await fetchToken();
          break;

        case 'COMPLETED':
          setPhase('completed');
          break;

        case 'CANCELLED':
          setPhase('cancelled');
          break;

        default:
          setErrorMsg(`Estado de consulta desconocido: ${data.status}`);
          setPhase('error');
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [consultationId, fetchConsultation, fetchToken, stopPolling]);

  // ----------------------------------------------------------------
  // Close Lightbox on Escape key
  // ----------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoomImage) {
        setZoomImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomImage]);

  // ----------------------------------------------------------------
  // Emit page:ready handshake for mobile WebView wrapper
  // ----------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'page:ready' }));
    }
  }, []);

  // ----------------------------------------------------------------
  // Connect Socket.io for Realtime Chat — only while ACTIVE
  // ----------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'active' || !consultationId) return;

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

    // ⚠️ Backend does NOT emit 'consultation:completed' (not in socket.types.ts).
    // Poll HTTP every 5s to detect COMPLETED / CANCELLED from the ACTIVE phase.
    pollingRef.current = setInterval(async () => {
      const polled = await fetchConsultation();
      if (!polled) return;
      if (polled.status === 'COMPLETED') {
        stopPolling();
        setPhase('completed');
      } else if (polled.status === 'CANCELLED') {
        stopPolling();
        setPhase('cancelled');
      }
    }, POLLING_INTERVAL_MS);

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
  }, [phase, consultationId, stopPolling]);

  // ----------------------------------------------------------------
  // Message sending
  // ----------------------------------------------------------------
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
          content: inputMessage.trim() || `[Foto: ${file.name}]`,
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

  // ----------------------------------------------------------------
  // Cancel consultation — call PATCH /cancel before navigating back
  // so the consultation doesn't stay stuck in WAITING/ACTIVE in the DB.
  // ----------------------------------------------------------------
  const handleCancel = async () => {
    stopPolling();
    if (consultationId) {
      try {
        await api.patch(`/api/consultations/${consultationId}/cancel`);
      } catch {
        // Best-effort — navigate back even if cancel fails
      }
    }
    navigate(-1);
  };

  // ================================================================
  // RENDER — one branch per phase
  // ================================================================

  // --- Loading ---
  if (phase === 'loading') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg">Cargando información de la consulta...</p>
      </div>
    );
  }

  // --- Error ---
  if (phase === 'error') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error de Conexión</h2>
        <p className="text-slate-300 mb-6">{errorMsg || 'No se pudo obtener credenciales WebRTC'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold"
        >
          Volver
        </button>
      </div>
    );
  }

  // --- Waiting (WAITING status — poll until ACTIVE) ---
  if (phase === 'waiting') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 gap-6">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-sky-600/20 flex items-center justify-center animate-pulse">
            <Stethoscope className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Sala de Espera</h2>
          <p className="text-slate-300">
            Tu consulta ha sido recibida. Estamos asignando al próximo veterinario de guardia disponible.
            Por favor, aguarda un momento.
          </p>
          {consultation?.pet && (
            <p className="text-xs text-slate-400">
              Paciente: <span className="font-semibold text-slate-200">{consultation.pet.name}</span>
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-sky-400 animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
            Buscando veterinario de guardia...
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold"
        >
          Cancelar y volver
        </button>
      </div>
    );
  }

  // --- Cancelled ---
  if (phase === 'cancelled') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-amber-400 mb-2">Consulta Cancelada</h2>
        <p className="text-slate-300 mb-6">Esta consulta fue cancelada. Podés iniciar una nueva desde tu panel.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold"
        >
          Volver al panel
        </button>
      </div>
    );
  }

  // --- Completed (show summary / review prompt) ---
  if (phase === 'completed') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-emerald-400 mt-4 mb-2">Consulta Finalizada</h2>
          <p className="text-slate-300 mb-6">
            La consulta médica ha concluido. Gracias por utilizar VetConnect.
          </p>

          {user?.role === 'CLIENT' && reviewSubmitted && (
            <div className="mb-6 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-medium">
              ¡Muchas gracias por calificar la atención médica!
            </div>
          )}

          {user?.role === 'CLIENT' && !reviewSubmitted && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full mb-3 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md transition"
            >
              ⭐ Calificar Atención Médica
            </button>
          )}

          <button
            onClick={() => navigate(user?.role === 'VET' ? '/vet/dashboard' : '/client/dashboard')}
            className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-semibold transition"
          >
            Volver al panel
          </button>
        </div>

        {user?.role === 'CLIENT' && consultationId && (
          <ReviewModal
            isOpen={showReviewModal && !reviewSubmitted}
            consultationId={consultationId}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => setReviewSubmitted(true)}
          />
        )}
      </div>
    );
  }

  // --- Active (ACTIVE status — render call room + chat) ---
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
          token={livekitToken!}
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
                      <span className="text-[10px] text-slate-300 px-1 py-0.5 bg-black/40 text-center flex items-center justify-center gap-1">
                        <Search className="w-3 h-3 text-sky-400" />
                        <span>Clic para ampliar</span>
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
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <Paperclip className="w-4 h-4 text-slate-300" />}
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
              className="absolute -top-10 right-0 text-white hover:text-red-400 font-bold text-sm bg-slate-800/80 px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              <span>Cerrar (Esc)</span>
              <X className="w-3.5 h-3.5" />
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
