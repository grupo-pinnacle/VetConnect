import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CallRoom from '../components/call/CallRoom';
import { ReviewModal } from '../components/ui/ReviewModal';
import { PrescriptionModal } from '../components/ui/PrescriptionModal';
import { Message, ApiResponse, Consultation } from '../types';
import { Stethoscope, CheckCircle2, Search, Paperclip, Loader2, X, FileText, CheckCircle, ShieldCheck, ClipboardList, MessageSquare, Video } from 'lucide-react';
import VetPatientProfile from '../components/dashboard/VetPatientProfile';

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
  const [mobileTab, setMobileTab] = useState<'video' | 'chat'>('video');

  // --- Vet Clinical In-Call Actions ---
  const [showPrescriptionModal, setShowPrescriptionModal] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showPatientProfile, setShowPatientProfile] = useState<boolean>(false);
  const [diagnosisNotes, setDiagnosisNotes] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // --- LiveKit credentials (only populated when phase === 'active') ---
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitWsUrl, setLivekitWsUrl] = useState<string | undefined>(undefined);

  // --- Live Chat state ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
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
    setChatError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setChatError('Solo se admiten imágenes en formato JPEG, PNG o WebP');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setChatError('La imagen no puede superar 10 MB');
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
      setChatError(err.response?.data?.error?.message || 'Error al subir la imagen clínica');
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

  // ----------------------------------------------------------------
  // Complete consultation — Vet clinical discharge & diagnosis notes
  // ----------------------------------------------------------------
  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationId) return;
    setCompleteError(null);
    if (!diagnosisNotes.trim() || diagnosisNotes.trim().length < 2) {
      setCompleteError('Por favor ingrese la evolución o diagnóstico clínico (mínimo 2 caracteres).');
      return;
    }

    try {
      setIsCompleting(true);
      const res = await api.patch<ApiResponse<Consultation>>(`/api/consultations/${consultationId}/complete`, {
        diagnosisNotes: diagnosisNotes.trim(),
      });
      if (res.data.success) {
        setShowCompleteModal(false);
        setPhase('completed');
      }
    } catch (err: any) {
      setCompleteError(err.response?.data?.error?.message || 'Error al completar la consulta');
    } finally {
      setIsCompleting(false);
    }
  };

  // ================================================================
  // RENDER — one branch per phase
  // ================================================================

  // --- Loading ---
  if (phase === 'loading') {
    return (
      <div className="w-full min-h-[100dvh] h-[100dvh] bg-slate-900 text-white flex items-center justify-center">
        <p className="text-lg">Cargando información de la consulta...</p>
      </div>
    );
  }

  // --- Error ---
  if (phase === 'error') {
    return (
      <div className="w-full min-h-[100dvh] h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error de Conexión</h2>
        <p className="text-slate-300 mb-6">{errorMsg || 'No se pudo obtener credenciales WebRTC'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Volver
        </button>
      </div>
    );
  }

  // --- Waiting (WAITING status — poll until ACTIVE) ---
  if (phase === 'waiting') {
    return (
      <div
        role="region"
        aria-live="polite"
        aria-label="Estado de sala de espera"
        className="w-full min-h-[100dvh] h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-6 gap-6"
      >
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
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Cancelar y volver
        </button>
      </div>
    );
  }

  // --- Cancelled ---
  if (phase === 'cancelled') {
    return (
      <div className="w-full min-h-[100dvh] h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-amber-400 mb-2">Consulta Cancelada</h2>
        <p className="text-slate-300 mb-6">Esta consulta fue cancelada. Podés iniciar una nueva desde tu panel.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Volver al panel
        </button>
      </div>
    );
  }

  // --- Completed (show summary / review prompt) ---
  if (phase === 'completed') {
    return (
      <div className="w-full min-h-[100dvh] h-[100dvh] bg-slate-900 text-white flex flex-col items-center justify-center p-4">
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
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-slate-950 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Mobile Tab Switcher (< 1024px) */}
      <div className="lg:hidden z-30 bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('video')}
          aria-pressed={mobileTab === 'video'}
          className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            mobileTab === 'video'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Principal</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          aria-pressed={mobileTab === 'chat'}
          className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition relative cursor-pointer ${
            mobileTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ver Chat ({messages.length})</span>
        </button>
      </div>

      {/* Main Video Call Area */}
      <div className={`flex-1 min-h-0 h-full relative flex flex-col ${mobileTab === 'video' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Medical Command Header Bar */}
        <header className="absolute top-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 z-20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-white">
                  Consulta Médica #{consultationId?.slice(0, 8)}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WebRTC HD
                </span>
              </div>
              {consultation?.pet && (
                <p className="text-[11px] text-slate-300">
                  Paciente: <span className="font-semibold text-white">{consultation.pet.name}</span> ({consultation.pet.species})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'VET' && (
              <>
                {consultation?.petId && (
                  <button
                    type="button"
                    data-testid="in-call-view-patient-profile-btn"
                    onClick={() => setShowPatientProfile(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] bg-slate-800 hover:bg-slate-700 text-stone-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
                    title="Ver ficha clínica del paciente y contacto de emergencia"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ficha Paciente</span>
                  </button>
                )}
                <button
                  type="button"
                  data-testid="in-call-emit-prescription-btn"
                  onClick={() => setShowPrescriptionModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Emitir Receta</span>
                </button>
                <button
                  type="button"
                  data-testid="in-call-complete-consultation-btn"
                  onClick={() => setShowCompleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Finalizar Consulta</span>
                </button>
              </>
            )}

            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 min-h-[40px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Salir
            </button>
          </div>
        </header>

        <div className="flex-1 w-full h-full pt-14">
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
      </div>

      {/* Live Chat Side Panel */}
      <div className={`w-full lg:w-84 h-full min-h-0 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col ${mobileTab === 'chat' ? 'flex flex-1' : 'hidden lg:flex'}`}>
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 text-white font-semibold text-sm flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chat Clínico & Telemetría</span>
          </div>
          {uploadingPhoto ? (
            <span className="text-[11px] text-sky-400 animate-pulse flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Subiendo...
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">SENASA R.1442</span>
          )}
        </div>

        {chatError && (
          <div
            role="alert"
            aria-live="assertive"
            className="px-3 py-1.5 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-[11px] flex items-center justify-between shrink-0"
          >
            <span>{chatError}</span>
            <button type="button" onClick={() => setChatError(null)} className="text-rose-400 hover:text-white p-0.5 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2.5 overscroll-contain">
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            const isVet = msg.sender?.role === 'VET';
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
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                  {isVet ? (
                    <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                      <Stethoscope className="w-2.5 h-2.5" /> Dr/a. {msg.sender?.firstName || 'Veterinario'}
                    </span>
                  ) : (
                    <span>{msg.sender?.firstName || 'Usuario'}</span>
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-xl text-xs max-w-[88%] leading-relaxed ${
                    isMine
                      ? 'bg-[#00875A] text-white shadow-sm'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {msg.content}

                  {fullAttachmentUrl && (
                    <div className="mt-2 cursor-pointer overflow-hidden rounded-lg border border-white/10 hover:opacity-95 transition-opacity">
                      <img
                        src={fullAttachmentUrl}
                        alt="Fotografía clínica"
                        className="max-h-40 max-w-full object-cover rounded-t-lg"
                        onClick={() => setZoomImage(fullAttachmentUrl)}
                      />
                      <span className="text-[10px] text-slate-200 px-2 py-1 bg-black/60 backdrop-blur-xs text-center flex items-center justify-center gap-1">
                        <Search className="w-3 h-3 text-emerald-400" />
                        <span>Clic para ampliar macroscopía</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] border-t border-slate-800 bg-slate-900/60 flex items-center gap-2 shrink-0">
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
            className="p-2 min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer"
          >
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Paperclip className="w-4 h-4 text-slate-300" />}
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={uploadingPhoto ? 'Subiendo imagen...' : 'Escriba un mensaje...'}
            disabled={uploadingPhoto}
            className="flex-1 min-h-[44px] bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={uploadingPhoto || !inputMessage.trim()}
            className="min-h-[44px] bg-[#00875A] hover:bg-[#00704A] disabled:opacity-40 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
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

      {/* In-Call Vet Prescription Modal */}
      {user?.role === 'VET' && consultationId && (
        <PrescriptionModal
          isOpen={showPrescriptionModal}
          consultationId={consultationId}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            setShowPrescriptionModal(false);
          }}
        />
      )}

      {/* In-Call Vet Finalize Consultation Modal */}
      {user?.role === 'VET' && showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#06241D]">
                    Finalizar Atención Médica
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cierre de acto médico oficial según resolución SENASA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteConsultation} className="mt-4 space-y-4">
              {completeError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium"
                >
                  {completeError}
                </div>
              )}
              {consultation?.pet && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-900">
                  <span className="font-semibold">Paciente:</span> {consultation.pet.name} ({consultation.pet.species})
                  {consultation.notes && (
                    <div className="mt-1 text-slate-600">
                      <span className="font-semibold">Motivo inicial:</span> {consultation.notes}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Evolución Clínica & Diagnóstico Presuntivo *
                </label>
                <textarea
                  required
                  rows={4}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="Detalle la evolución del paciente durante la teleconsulta, diagnóstico presuntivo, indicaciones terapéuticas y pautas de alarma..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00875A] bg-white resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Mínimo 2 caracteres. Quedará registrado en la historia clínica del paciente.</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  disabled={isCompleting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCompleting || !diagnosisNotes.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Confirmar y Completar Consulta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Patient Profile Drawer */}
      <VetPatientProfile
        petId={consultation?.petId || null}
        isOpen={showPatientProfile}
        onClose={() => setShowPatientProfile(false)}
      />
    </div>
  );
};

export default ConsultationRoom;
