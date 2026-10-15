import { useEffect, useState, useRef, useCallback } from "react";
import "./vet.css";
import { Button, Icon, Modal, go } from "../shared";
import { getPatient, initialConsults, initialQueue, registerPatient, type Consult, type QueueItem } from "./data";
import { TriageBadge, VetProvider, useVet } from "./vetkit";
import { EvolutionEditor, FichaClinica } from "./Consultations";
import { useAuth } from "../context/AuthContext";
import api, { getAccessToken, getDeviceId } from "../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, Consultation as BackendConsultation } from "../types";
import { mapBackendPetToPatient } from "./mappers";
import { io, Socket } from "socket.io-client";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { ReviewModal } from "../components/ui/ReviewModal";

export const getWsUrl = () => {
  if (typeof window !== "undefined") {
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs && !envWs.includes("localhost") && !envWs.includes("127.0.0.1")) {
      return envWs;
    }
    // If running via Dev Tunnels or external domain, connect to current origin so Vite proxy forwards /socket.io
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return window.location.origin;
    }
  }
  return import.meta.env.VITE_WS_URL || "http://localhost:3001";
};

export function WhatsAppCheck({ state = "read" }: { state?: "sending" | "sent" | "delivered" | "read" }) {
  if (state === "sending" || state === "sent") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 11" fill="none" aria-label="Enviado">
        <path d="M1.5 6L5.5 10L14.5 1" stroke="#8696a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  const color = state === "read" ? "#53bdeb" : "#8696a0";
  return (
    <svg width="16" height="11" viewBox="0 0 18 11" fill="none" aria-label={state === "read" ? "Leído" : "Entregado"}>
      <path d="M1 6L5 10L14 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 6L9 10L18 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CallChatPanel({
  consultationId,
  otherName,
  user,
}: {
  consultationId: string;
  otherName: string;
  user: any;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const s = io(wsUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("join:consultation", { consultationId });
    });

    s.on("connect_error", (err) => {
      console.warn("Socket connect error in CallChatPanel:", err.message);
    });

    s.on("disconnect", () => setConnected(false));

    s.on("message:new", (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => (m.id && m.id === msg.id) || (m.clientMsgId && m.clientMsgId === msg.clientMsgId))) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    api
      .get<ApiResponse<any[]>>(`/api/consultations/${consultationId}/messages`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setMessages(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      s.disconnect();
    };
  }, [consultationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const clientMsgId = `call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newContent = text.trim();
    setText("");

    if (socket && connected) {
      socket.emit(
        "message:send",
        {
          consultationId,
          content: newContent,
          clientMsgId,
        },
        (res: any) => {
          if (res?.success && res?.data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === res.data.id || m.clientMsgId === clientMsgId)) return prev;
              return [...prev, res.data];
            });
          }
        }
      );
    } else {
      // Fallback via HTTP REST
      try {
        const res = await api.post<ApiResponse<any>>(`/api/consultations/${consultationId}/messages`, {
          content: newContent,
          clientMsgId,
        });
        if (res.data.success && res.data.data) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.data.data.id || m.clientMsgId === clientMsgId)) return prev;
            return [...prev, res.data.data];
          });
        }
      } catch (err) {
        console.error("Error sending message via HTTP fallback:", err);
      }
    }
  };

  return (
    <div className="wa-chat-pane" style={{ display: "flex", flexDirection: "column", height: "100%", background: "#efeae2" }}>
      <div className="wa-chat-body" style={{ flex: 1, padding: "14px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="wa-encryption-pill" style={{ alignSelf: "center", margin: "4px auto 8px" }}>
          <span>🔒</span>
          <span>Llamada y chat cifrados de extremo a extremo · SENASA</span>
        </div>
        <div className="wa-date-pill" style={{ alignSelf: "center", margin: "0 auto 6px" }}>HOY</div>

        {messages.length === 0 ? (
          <div className="v-chat__empty" style={{ textAlign: "center", padding: "32px 16px", color: "var(--ink-soft)" }}>
            <Icon name="message" size={26} />
            <p style={{ marginTop: 8, fontSize: 13 }}>Todavía no hay mensajes con {otherName}. Escribí abajo para comenzar.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id;
            const time = m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Ahora";
            return (
              <div
                key={m.id || m.clientMsgId}
                className={`wa-bubble ${mine ? "wa-bubble--sent" : "wa-bubble--received"}`}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                {!mine && (
                  <div className="wa-bubble__sender" style={{ fontSize: 11.5, fontWeight: 700, color: "#008069", marginBottom: 2 }}>
                    {m.sender?.firstName || otherName}
                  </div>
                )}
                <p className="wa-bubble__text" style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: "#111b21" }}>
                  {m.content}
                </p>
                <div className="wa-bubble__meta" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3, fontSize: 10, color: "#667781" }}>
                  <span>{time}</span>
                  {mine && <WhatsAppCheck state="read" />}
                </div>
              </div>
            );
          })
        )}
        <div style={{ fontSize: 11, padding: "4px 8px", color: connected ? "#008069" : "#64748b", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: "auto" }}>
          <i className={connected ? "is-online" : "is-offline"} style={{ width: 7, height: 7, borderRadius: "50%" }} />
          {connected ? "Canal telemático seguro conectado" : "Conectando al servidor…"}
        </div>
        <div ref={endRef} />
      </div>

      <footer className="wa-chat-footer" style={{ padding: "8px 12px", background: "#f0f2f5", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #e9edef" }}>
        <div className="wa-input-pill" style={{ flex: 1, background: "#ffffff", borderRadius: 8, height: 40, display: "flex", alignItems: "center", padding: "0 12px" }}>
          <input
            aria-label="Escribir mensaje"
            placeholder={`Escribir a ${otherName}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111b21" }}
          />
        </div>
        <button
          className="wa-send-btn"
          disabled={!text.trim()}
          onClick={handleSend}
          aria-label="Enviar mensaje"
          style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: text.trim() ? "#00a884" : "#8696a0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default" }}
        >
          <Icon name="send" size={17} />
        </button>
      </footer>
    </div>
  );
}

function Room({ id }: { id: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { consults, queue, finish } = useVet();

  // Fetch real consultation data from PostgreSQL
  const { data: consultation, refetch: refetchConsultation } = useQuery<BackendConsultation | null>({
    queryKey: ["consultation", id],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<BackendConsultation>>(`/api/consultations/${id}`);
        return res.data.success && res.data.data ? res.data.data : null;
      } catch {
        return null;
      }
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "WAITING" ? 3000 : status === "ACTIVE" ? 4000 : false;
    },
  });

  // Dynamically register pet into local dictionary if loaded
  useEffect(() => {
    if (consultation?.pet) {
      const mapped = mapBackendPetToPatient(consultation.pet, consultation.client);
      registerPatient(mapped);
    }
  }, [consultation?.pet, consultation?.client]);

  const fallbackConsult = consults.find((c: Consult) => c.id === id) ?? initialConsults.find((c: Consult) => c.id === id);
  const fallbackQueued = queue.find((q: QueueItem) => q.id === id) ?? initialQueue.find((q: QueueItem) => q.id === id);
  const petId = consultation?.petId ?? fallbackConsult?.petId ?? fallbackQueued?.petId ?? "milo";
  const p = getPatient(petId);
  const triage = fallbackQueued?.triage ?? fallbackConsult?.triage;

  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [panel, setPanel] = useState<"" | "Chat" | "Ficha" | "Evolución">("Chat");
  const [ending, setEnding] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const isVet = user?.role === "VET";
  const fromClient = user ? user.role === "CLIENT" : new URLSearchParams(window.location.search).get("from") === "client";

  // Participant naming derived directly from DB
  const petName = consultation?.pet?.name || p.name || "Mascota";
  const petKind = consultation?.pet?.species || p.kind || "Canino";
  const petBreed = consultation?.pet?.breed ? ` · ${consultation.pet.breed}` : "";
  const reason = consultation?.notes || fallbackConsult?.reason || fallbackQueued?.reason || "Videoconsulta telemática";

  const tutorName = consultation?.client
    ? [consultation.client.firstName, consultation.client.lastName].filter(Boolean).join(" ") || "Tutor"
    : (p.tutor || "Tutor");

  const tutorInitials = consultation?.client
    ? `${consultation.client.firstName?.[0] || "T"}${consultation.client.lastName?.[0] || ""}`.toUpperCase()
    : "TU";

  const hasVetAssigned = Boolean(consultation?.vet);
  const vetName = consultation?.vet
    ? (consultation.vet.lastName ? `Dr. ${consultation.vet.firstName} ${consultation.vet.lastName}` : `Dr. ${consultation.vet.firstName}`)
    : (isVet && user
      ? (user.lastName ? `Dr. ${user.firstName} ${user.lastName}` : `Dr. ${user.firstName}`)
      : (consultation?.status === "WAITING" ? "Guardia Veterinaria" : "Veterinario de guardia"));

  const vetInitials = consultation?.vet
    ? `${consultation.vet.firstName?.[0] || "V"}${consultation.vet.lastName?.[0] || ""}`.toUpperCase()
    : (isVet && user ? `${user.firstName?.[0] || "V"}${user.lastName?.[0] || ""}`.toUpperCase() : "VC");

  const remoteName = fromClient ? (hasVetAssigned ? vetName : "Guardia Veterinaria") : `${tutorName} · ${petName}`;
  const remoteInitials = fromClient ? vetInitials : tutorInitials;
  const selfInitials = user ? `${user.firstName?.[0] || "U"}${user.lastName?.[0] || ""}`.toUpperCase() : "VO";
  const chatOtherName = fromClient
    ? (hasVetAssigned ? vetName : "la guardia veterinaria")
    : (tutorName || "el tutor");

  // Derive callState from consultation lifecycle
  const [callState, setCallState] = useState<"connecting" | "waiting" | "connected" | "reconnecting" | "ended" | "error">("connecting");

  useEffect(() => {
    if (consultation?.status === "WAITING") {
      setCallState("waiting");
    } else if (consultation?.status === "COMPLETED" || consultation?.status === "CANCELLED") {
      setCallState("ended");
    } else if (consultation?.status === "ACTIVE") {
      setCallState("connected");
    } else if (!consultation) {
      setCallState("connected");
    }
  }, [consultation?.status, consultation]);

  // LiveKit WebRTC state
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitWsUrl, setLivekitWsUrl] = useState<string | undefined>(undefined);
  const [livekitFailed, setLivekitFailed] = useState(false);

  useEffect(() => {
    if (consultation?.status === "ACTIVE" && !livekitToken && !livekitFailed) {
      api
        .post<ApiResponse<{ token: string; wsUrl: string }>>(`/api/calls/${id}/token`)
        .then((res) => {
          if (res.data.success && res.data.data?.token) {
            setLivekitToken(res.data.data.token);
            if (res.data.data.wsUrl) setLivekitWsUrl(res.data.data.wsUrl);
          }
        })
        .catch((err) => {
          console.warn("LiveKit token notice:", err);
          setLivekitFailed(true);
        });
    }
  }, [consultation?.status, id, livekitToken, livekitFailed]);

  // Local camera preview via getUserMedia (only when LiveKit is not active)
  useEffect(() => {
    if (!cam || livekitToken) {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        localVideoRef.current.srcObject = null;
      }
      return;
    }
    let activeStream: MediaStream | null = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          activeStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {});
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cam, livekitToken]);

  // Listen for socket events (like call:ended) in Room
  useEffect(() => {
    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const deviceId = getDeviceId();
    const roomSocket = io(wsUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      auth: { token: token ? `Bearer ${token}` : undefined, deviceId },
    });

    roomSocket.on("connect", () => {
      roomSocket.emit("join:consultation", { consultationId: id });
    });

    roomSocket.on("session:invalidated", (data: { reason?: string; message?: string }) => {
      roomSocket.disconnect();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vetconnect:session_terminated", {
            detail: {
              reason: data?.reason || "MULTIPLE_DEVICES_DETECTED",
              message: data?.message || "Tu sesión fue transferida a otro dispositivo.",
            },
          })
        );
      }
    });

    roomSocket.on("call:ended", () => {
      setCallState("ended");
      queryClient.invalidateQueries({ queryKey: ["consultation", id] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      if (fromClient) {
        setShowReviewModal(true);
      }
    });

    return () => {
      roomSocket.off("call:ended");
      roomSocket.off("session:invalidated");
      roomSocket.disconnect();
    };
  }, [id, queryClient, fromClient]);

  // Duration timer
  useEffect(() => {
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  // Call completion handler
  const handleFinalize = async () => {
    setEnding(false);
    try {
      await api.patch(`/api/consultations/${id}/complete`, {
        diagnosisNotes: fromClient ? "Consulta finalizada por el tutor." : "Consulta telemática finalizada con éxito.",
      });
    } catch (err) {
      console.warn("Notice completing consultation:", err);
    }

    queryClient.invalidateQueries({ queryKey: ["consultation", id] });
    queryClient.invalidateQueries({ queryKey: ["consultations"] });

    // Inform socket room
    try {
      const wsUrl = getWsUrl();
      const token = getAccessToken();
      const s = io(wsUrl, {
        withCredentials: true,
        transports: ["polling", "websocket"],
        reconnection: true,
        auth: { token: token ? `Bearer ${token}` : undefined },
      });
      s.emit("call:ended", { consultationId: id });
      setTimeout(() => s.disconnect(), 1000);
    } catch {}

    if (!fromClient) {
      void finish(id);
    }
    setCallState("ended");
    if (fromClient) {
      setShowReviewModal(true);
    }
  };

  if (callState === "ended") {
    return (
      <main className="v-call-summary">
        <section className="v-call-summary__card">
          <span className="v-call-summary__icon">
            <Icon name="check" size={28} />
          </span>
          <span className="eyebrow">Videoconsulta</span>
          <h1>Consulta finalizada</h1>
          <p>La llamada finalizó exitosamente. Podés revisar los detalles de la atención.</p>
          <dl>
            <div>
              <dt>{fromClient ? "Veterinario" : "Tutor"}</dt>
              <dd>{fromClient ? vetName : tutorName}</dd>
            </div>
            <div>
              <dt>Mascota</dt>
              <dd>{petName} · {petKind}{petBreed}</dd>
            </div>
            <div>
              <dt>Fecha y duración</dt>
              <dd>Hoy · {clock}</dd>
            </div>
            <div>
              <dt>Motivo</dt>
              <dd>{reason}</dd>
            </div>
            <div className="is-wide">
              <dt>Diagnóstico / Evolución</dt>
              <dd>{consultation?.diagnosisNotes || "Atención telemática realizada y registrada en el historial clínico."}</dd>
            </div>
          </dl>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {fromClient && (
              <Button variant="secondary" onClick={() => setShowReviewModal(true)}>
                ⭐ Calificar atención
              </Button>
            )}
            <Button
              icon="arrow"
              onClick={() => go(fromClient ? "/client/consultations" : `/vet/consultations/${id}`)}
            >
              {fromClient ? "Volver a mis consultas" : "Volver a la consulta"}
            </Button>
          </div>
        </section>

        {fromClient && (
          <ReviewModal
            isOpen={showReviewModal}
            consultationId={id}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => {
              setShowReviewModal(false);
              go("/client/consultations");
            }}
          />
        )}
      </main>
    );
  }

  const stateCopy = {
    connecting: [fromClient ? "Conectando con el veterinario…" : "Conectando con el tutor…", "Estamos preparando la sala de telemedicina."],
    waiting: [
      fromClient ? "Sala de espera de guardia" : "Esperando que el tutor se conecte…",
      fromClient
        ? "Tu solicitud está en la cola de atención médica. Te conectaremos automáticamente apenas un veterinario de guardia tome la consulta."
        : "Podés quedarte en esta pantalla. Te avisamos en cuanto ingrese.",
    ],
    reconnecting: ["Se perdió momentáneamente la conexión.", "Estamos intentando reconectar la llamada."],
    error: ["No pudimos conectar la videollamada.", "Revisá tu conexión e intentá nuevamente."],
    connected: ["", ""],
    ended: ["", ""],
  }[callState];

  return (
    <div className={`v-call ${panel ? "has-panel" : ""}`}>
      <header className="v-call__top">
        <button className="v-call__back" onClick={() => setEnding(true)} aria-label="Salir de la videollamada">
          <Icon name="left" size={20} />
        </button>
        <div>
          <b>{petName} · {tutorName}</b>
          <span>{reason}</span>
        </div>
        {triage && <TriageBadge level={triage} compact />}
        <span className={`v-call__net ${callState === "reconnecting" ? "is-warning" : ""}`}>
          <Icon name={callState === "reconnecting" ? "repeat" : "check"} size={13} />
          {callState === "reconnecting" ? "Reconectando" : "Conexión estable"}
        </span>
        <time className="v-call__time" aria-label={`Duración ${Math.floor(secs / 60)} minutos`}>
          {clock}
        </time>
      </header>

      <main className="v-call__stage">
        <div className="v-call__remote">
          {/* LiveKit WebRTC active feed if available */}
          {livekitToken ? (
            <LiveKitRoom
              video={cam}
              audio={mic}
              token={livekitToken}
              serverUrl={livekitWsUrl}
              connect={true}
              data-lk-theme="default"
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
              onDisconnected={() => {
                handleFinalize();
              }}
            >
              <VideoConference />
            </LiveKitRoom>
          ) : callState !== "connected" ? (
            <div className={`v-call__state v-call__state--${callState}`} role="status" aria-live="assertive">
              <span>
                <Icon name={callState === "error" ? "alert" : "repeat"} size={26} />
              </span>
              <h1>{stateCopy[0]}</h1>
              <p>{stateCopy[1]}</p>
              {callState === "waiting" && (
                <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, padding: "6px 14px", borderRadius: 20, background: "#254d4a", color: "#609f9c", border: "1px solid #3d6f6c" }}>
                  <i className="is-online" style={{ width: 8, height: 8 }} />
                  <span>Sala de espera activa · Notificando a médicos de guardia</span>
                </div>
              )}
              {callState === "error" && (
                <Button variant="secondary" icon="repeat" onClick={() => refetchConsultation()}>
                  Reintentar
                </Button>
              )}
            </div>
          ) : (
            <div className="v-call__professional" role="img" aria-label={`Video de ${remoteName}`}>
              <span className="avatar">{remoteInitials}</span>
              <small>{remoteName}</small>
              <span style={{ fontSize: 12, color: "#d9e8e4", marginTop: 4 }}>
                Canal telemático HD activo
              </span>
            </div>
          )}

          {/* Clinical identification tag */}
          <span className="v-call__tag">
            {callState === "waiting" ? "Sala de espera · Guardia VetConnect" : remoteName}
          </span>

          {/* Legal compliance badge */}
          <span
            className="v-call__tag"
            style={{
              top: 14,
              left: 14,
              bottom: "auto",
              fontSize: 11,
              background: "#183c3a",
              border: "1px solid #315f5d",
              color: "#609f9c",
            }}
          >
            Canal Cifrado • SENASA Res. 1442/2021
          </span>
        </div>

        {/* Local user pip with live webcam stream - only when LiveKit room is not active */}
        {!livekitToken && (
          <div className={`v-call__self ${cam ? "" : "is-off"}`}>
            {cam ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
              />
            ) : (
              <>
                <Icon name="video" size={18} />
                <small>Cámara apagada</small>
              </>
            )}
            <em>Vos ({selfInitials})</em>
            {!mic && (
              <span className="v-call__muted">
                <Icon name="micoff" size={13} />
              </span>
            )}
          </div>
        )}
      </main>

      <nav className="v-call__bar" aria-label="Controles de la llamada">
        <button
          className={`v-ctl ${mic ? "" : "is-off"}`}
          aria-label={mic ? "Silenciar micrófono" : "Activar micrófono"}
          aria-pressed={!mic}
          onClick={() => setMic(!mic)}
        >
          <Icon name={mic ? "mic" : "micoff"} size={20} />
          <span>{mic ? "Silenciar" : "Activar mic"}</span>
        </button>
        <button
          className={`v-ctl ${cam ? "" : "is-off"}`}
          aria-label={cam ? "Apagar cámara" : "Encender cámara"}
          aria-pressed={!cam}
          onClick={() => setCam(!cam)}
        >
          <Icon name={cam ? "video" : "micoff"} size={20} />
          <span>{cam ? "Apagar cámara" : "Encender"}</span>
        </button>
        <button
          className={`v-ctl ${panel === "Chat" ? "is-on" : ""}`}
          aria-pressed={panel === "Chat"}
          onClick={() => setPanel(panel === "Chat" ? "" : "Chat")}
        >
          <Icon name="message" size={20} />
          <span>Chat</span>
        </button>
        <button
          className={`v-ctl ${panel === "Ficha" ? "is-on" : ""}`}
          aria-pressed={panel === "Ficha"}
          onClick={() => setPanel(panel === "Ficha" ? "" : "Ficha")}
        >
          <Icon name="file" size={20} />
          <span>Ficha</span>
        </button>
        {!fromClient && (
          <button
            className={`v-ctl ${panel === "Evolución" ? "is-on" : ""}`}
            aria-pressed={panel === "Evolución"}
            onClick={() => setPanel(panel === "Evolución" ? "" : "Evolución")}
          >
            <Icon name="edit" size={20} />
            <span>Evolución</span>
          </button>
        )}
        <button className="v-ctl v-ctl--end" onClick={() => setEnding(true)}>
          <Icon name="phone" size={20} />
          <span>Finalizar</span>
        </button>
      </nav>

      {panel && (
        <aside
          className="v-call__panel"
          aria-label={
            panel === "Chat"
              ? `Chat con ${chatOtherName}`
              : panel === "Ficha"
              ? "Ficha clínica"
              : "Evolución clínica"
          }
        >
          <header>
            <b>
              {panel === "Chat"
                ? `Chat con ${chatOtherName}`
                : panel === "Ficha"
                ? "Ficha clínica"
                : "Evolución clínica"}
            </b>
            <button className="button button--icon" onClick={() => setPanel("")} aria-label="Cerrar panel">
              <Icon name="close" size={16} />
            </button>
          </header>
          <div className="v-call__panel-body">
            {panel === "Chat" ? (
              <CallChatPanel consultationId={id} otherName={chatOtherName} user={user} />
            ) : panel === "Ficha" ? (
              <FichaClinica p={p} />
            ) : (
              <EvolutionEditor p={p} />
            )}
          </div>
        </aside>
      )}

      {ending && (
        <Modal
          title="Finalizar videollamada"
          text="La llamada terminará para todas las personas. Vas a poder revisar el resumen de la consulta."
          cancel="Seguir en la llamada"
          confirm="Finalizar llamada"
          destructive
          onClose={() => setEnding(false)}
          onConfirm={handleFinalize}
        />
      )}
    </div>
  );
}

export default function CallRoom({ id }: { id: string }) {
  return (
    <VetProvider forceEmpty={false}>
      <Room id={id} />
    </VetProvider>
  );
}
