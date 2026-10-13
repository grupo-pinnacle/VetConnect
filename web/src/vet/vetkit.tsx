import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Button, Icon, MessageBubble, Modal, Status, Toast, go } from "../shared";
import api, { getAccessToken } from "../services/api";
import { getWsUrl, WhatsAppCheck } from "./CallRoom";
import { useAuth } from "../context/AuthContext";
import type { ApiResponse, Consultation as BackendConsultation, User } from "../types";
import { parseConsultationNotes } from "../lib/consultationNotes";
import {
  getPatient, initialConsults, initialEvents, initialFollowUps, initialQueue, initialRx, initialThreads, quickReplies, triageMeta,
  registerPatient, getAllPatients,
  type AgendaEvent, type Consult, type FollowUp, type Msg, type Patient, type QueueItem, type Rx, type Thread, type Triage,
} from "./data";
import { mapConsultationToQueueItem, mapConsultationToConsult, mapBackendPetToPatient } from "./mappers";

export type Avail = "Disponible" | "No disponible" | "En consulta";

type Ctx = {
  avail: Avail; requestAvail: (next: Avail) => void; notify: (msg: string) => void;
  queue: QueueItem[]; accept: (id: string) => void;
  consults: Consult[]; finish: (id: string, notes?: string) => Promise<void> | void; threads: Thread[]; send: (petId: string, msg: Omit<Msg, "id" | "mine" | "time">) => void; markRead: (petId: string) => void; unread: number;
  events: AgendaEvent[]; setEvents: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  rx: Rx[]; setRx: React.Dispatch<React.SetStateAction<Rx[]>>;
  followUps: FollowUp[]; setFollowUps: React.Dispatch<React.SetStateAction<FollowUp[]>>;
  patientsList: Patient[];
  forceEmpty: boolean;
};

const VetContext = createContext<Ctx | null>(null);
export const useVet = () => {
  const ctx = useContext(VetContext);
  if (!ctx) throw new Error("useVet fuera de VetProvider");
  return ctx;
};

export function VetProvider({ children, forceEmpty }: { children: ReactNode; forceEmpty: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avail, setAvail] = useState<Avail>("Disponible");
  const [pending, setPending] = useState<Avail | null>(null);
  const [toast, setToast] = useState<{ msg: string; id: number; leaving?: boolean } | null>(null);

  // Sync vet availability presence with backend on mount
  useEffect(() => {
    if (user?.role === "VET") {
      api.patch('/api/users/profile', { isOnline: true }).catch(() => {});
    }
  }, [user?.role]);

  // Backend query for consultations & queue with real-time polling
  const vetConsultsQuery = useQuery({
    queryKey: ['consultations', 'vet'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BackendConsultation[]>>('/api/consultations/mine');
      return (res.data.success && res.data.data) ? res.data.data : [];
    },
    refetchInterval: 4000,
  });

  const notify = useCallback((msg: string) => setToast({ msg, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const leave = window.setTimeout(() => setToast((current) => current?.id === toast.id ? { ...current, leaving: true } : current), 3300);
    const remove = window.setTimeout(() => setToast((current) => current?.id === toast.id ? null : current), 3800);
    return () => { window.clearTimeout(leave); window.clearTimeout(remove); };
  }, [toast?.id]);

  // Real-time socket sync for incoming guard triage consultations
  useEffect(() => {
    if (!user || user.role !== "VET") return;
    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const socket = io(wsUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });

    socket.on("consultation:new", (newCons: BackendConsultation) => {
      queryClient.invalidateQueries({ queryKey: ["consultations", "vet"] });
      const petName = newCons?.pet?.name || "un paciente";
      notify(`🚨 Nueva solicitud de guardia para ${petName}`);
    });

    return () => {
      socket.off("consultation:new");
      socket.disconnect();
    };
  }, [user, queryClient, notify]);

  // Dynamically register real patients from DB consultations
  useEffect(() => {
    if (vetConsultsQuery.data) {
      vetConsultsQuery.data.forEach((c) => {
        if (c.pet) {
          const patient = mapBackendPetToPatient(c.pet, c.client);
          registerPatient(patient);
        }
      });
    }
  }, [vetConsultsQuery.data]);

  // Derived real queue from WAITING consultations in DB
  const mappedRealQueue = useMemo((): QueueItem[] => {
    if (forceEmpty) return [];
    if (!vetConsultsQuery.data) return [];
    return vetConsultsQuery.data
      .filter((c) => c.status === "WAITING")
      .map(mapConsultationToQueueItem);
  }, [vetConsultsQuery.data, forceEmpty]);

  // Derived real consults from ACTIVE / COMPLETED / CANCELLED in DB
  const mappedRealConsults = useMemo((): Consult[] => {
    if (forceEmpty) return [];
    if (!vetConsultsQuery.data) return [];
    return vetConsultsQuery.data
      .filter((c) => c.status !== "WAITING")
      .map(mapConsultationToConsult);
  }, [vetConsultsQuery.data, forceEmpty]);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [consults, setConsults] = useState<Consult[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [rx, setRx] = useState<Rx[]>(() => {
    try {
      const saved = localStorage.getItem("vetconnect_vet_rx");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  // Sync state when backend returns live rows
  useEffect(() => {
    if (!forceEmpty && mappedRealQueue) {
      setQueue(mappedRealQueue);
    }
  }, [mappedRealQueue, forceEmpty]);

  useEffect(() => {
    if (!forceEmpty && mappedRealConsults) {
      setConsults(mappedRealConsults);
      if (mappedRealConsults.length > 0) {
        setThreads((prev) => {
          const mappedThreads: Thread[] = mappedRealConsults.map((c) => {
            const existing = prev.find((t) => t.petId === c.petId);
            return {
              id: `t-${c.id}`,
              petId: c.petId,
              last: existing?.last || c.reason || "Consulta médica",
              lastTime: existing?.lastTime || c.time || "Hoy",
              unread: existing?.unread || 0,
              online: true,
              msgs: existing?.msgs || [],
            };
          });
          return mappedThreads;
        });
      }
    }
  }, [mappedRealConsults, forceEmpty]);

  const apply = useCallback(async (next: Avail) => {
    setAvail(next);
    notify(`Tu estado ahora es: ${next}`);
    try {
      await api.patch('/api/users/profile', { isOnline: next === "Disponible" });
    } catch {
      // Presence sync
    }
  }, [notify]);

  const requestAvail = useCallback((next: Avail) => {
    if (next === avail) return;
    if (next === "No disponible" && queue.length > 0) setPending(next);
    else apply(next);
  }, [avail, queue.length, apply]);

  const accept = useCallback(async (id: string) => {
    const q = queue.find((item) => item.id === id);
    try {
      await api.patch(`/api/consultations/${id}/assign`);
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      setAvail("En consulta");
      notify(`Aceptaste la consulta de ${q ? getPatient(q.petId).name : "paciente"}`);
      go(`/call/${id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "No se pudo asignar la consulta.";
      notify(msg);
    }
  }, [queue, notify, queryClient]);

  const finish = useCallback(async (id: string, notes?: string) => {
    try {
      await api.patch(`/api/consultations/${id}/complete`, { diagnosisNotes: notes || "Consulta telemática finalizada con éxito." });
      queryClient.invalidateQueries({ queryKey: ['consultations', 'vet'] });
      setAvail("Disponible");
      notify("Consulta finalizada con éxito");
    } catch {
      notify("No se pudo completar la consulta.");
    }
  }, [notify, queryClient]);

  const send = useCallback((petId: string, msg: Omit<Msg, "id" | "mine" | "time">) => {
    const full: Msg = { ...msg, id: `m${Date.now()}`, mine: true, time: "Ahora" };
    setThreads((list) => list.some((t) => t.petId === petId)
      ? list.map((t) => t.petId === petId ? { ...t, msgs: [...t.msgs, full], last: msg.text ?? "Archivo", lastTime: "Ahora" } : t)
      : [{ id: `t-${petId}`, petId, last: msg.text ?? "Archivo", lastTime: "Ahora", unread: 0, online: true, msgs: [full] }, ...list]);
  }, []);
  const markRead = useCallback((petId: string) => setThreads((list) => list.some((t) => t.petId === petId && t.unread) ? list.map((t) => t.petId === petId ? { ...t, unread: 0 } : t) : list), []);
  const unread = threads.reduce((n, t) => n + t.unread, 0);

  const patientsList = useMemo(() => {
    return getAllPatients();
  }, [vetConsultsQuery.data]);

  const value = useMemo(() => ({ avail, requestAvail, notify, queue, accept, consults, finish, threads, send, markRead, unread, events, setEvents, rx, setRx, followUps, setFollowUps, patientsList, forceEmpty }),
    [avail, requestAvail, notify, queue, accept, consults, finish, threads, send, markRead, unread, events, rx, followUps, patientsList, forceEmpty]);

  return <VetContext.Provider value={value}>
    {children}
    {toast && <Toast message={toast.msg} key={toast.id}/>}
    {pending && <Modal title="Pasar a No disponible" text={`Tenés ${queue.length} ${queue.length === 1 ? "paciente" : "pacientes"} en espera. Si cambiás tu estado, dejás de recibir nuevas solicitudes.`} cancel="Seguir disponible" confirm="Cambiar estado" onClose={() => setPending(null)} onConfirm={() => { apply(pending); setPending(null); }}/>}
  </VetContext.Provider>;
}

const slug = (t: Triage) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function TriageBadge({ level, compact = false }: { level: Triage; compact?: boolean }) {
  const meta = triageMeta[level];
  return <span className={`triage triage--${slug(level)} ${compact ? "triage--compact" : ""}`}>
    <Icon name={meta.icon} size={compact ? 14 : 16}/>
    <b>{level}</b>
    <span className="triage__pips" aria-hidden="true">{[1, 2, 3, 4].map((n) => <i key={n} className={n <= meta.level ? "is-on" : ""}/>)}</span>
    <span className="sr-only">Nivel {meta.level} de 4</span>
  </span>;
}

export function WaitTimer({ base }: { base: number }) {
  const [s, setS] = useState(base);
  useEffect(() => { const t = window.setInterval(() => setS((v) => v + 1), 1000); return () => window.clearInterval(t); }, []);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return <time className="v-timer" aria-label={`${Math.floor(s / 60)} minutos de espera`}>{mm}:{ss}</time>;
}

export function PetPhoto({ pet, size = 44 }: { pet: Patient; size?: number }) {
  return <img className="v-pet-photo" src={pet.photo} alt="" width={size} height={size} loading="lazy" style={{ width: size, height: size }}/>;
}

const statusTone: Record<string, "teal" | "amber" | "gray" | "red"> = {
  Próxima: "amber", Activa: "teal", Finalizada: "gray", Cancelada: "red", Confirmada: "teal", Pendiente: "amber", Completada: "gray",
  Programado: "teal", Atrasado: "red", Realizado: "gray", Emitida: "teal", Borrador: "amber",
};

export function ConsultStatus({ status }: { status: string }) {
  return <Status tone={statusTone[status] ?? "gray"}>{status}</Status>;
}

export type LightboxItem = { src: string; caption: string; pos?: string };

export function Lightbox({ items, index, onIndex, onClose, pet, consult }: { items: LightboxItem[]; index: number; onIndex: (i: number) => void; onClose: () => void; pet: string; consult: string }) {
  const [zoom, setZoom] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const move = useCallback((d: number) => { setZoom(false); onIndex((index + d + items.length) % items.length); }, [index, items.length, onIndex]);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") move(-1); if (e.key === "ArrowRight") move(1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, move]);
  const item = items[index];
  return <div className="modal-layer v-lightbox" role="dialog" aria-modal="true" aria-label={`Fotografía clínica ${index + 1} de ${items.length}`}>
    <button className="modal-scrim" onClick={onClose} aria-label="Cerrar visor"/>
    <div className="v-lightbox__frame">
      <header>
        <div><b>{pet}</b><span>{item.caption}</span></div>
        <div className="v-lightbox__ctx"><span>15 Jul 2025</span><span>{consult}</span><span>{index + 1} / {items.length}</span></div>
        <Button variant="icon" icon="expand" ariaLabel={zoom ? "Reducir imagen" : "Ampliar imagen"} onClick={() => setZoom(!zoom)}/>
        <button ref={closeRef} className="button button--icon" onClick={onClose} aria-label="Cerrar visor"><Icon name="close" size={18}/></button>
      </header>
      <div className="v-lightbox__stage">
        {items.length > 1 && <button className="v-lightbox__nav v-lightbox__nav--prev" onClick={() => move(-1)} aria-label="Fotografía anterior"><Icon name="left" size={22}/></button>}
        <img src={item.src} alt={`${item.caption} de ${pet}`} className={zoom ? "is-zoomed" : ""} style={{ objectPosition: item.pos }} onClick={() => setZoom(!zoom)}/>
        {items.length > 1 && <button className="v-lightbox__nav v-lightbox__nav--next" onClick={() => move(1)} aria-label="Fotografía siguiente"><Icon name="chevron" size={22}/></button>}
      </div>
      {items.length > 1 && <div className="v-lightbox__thumbs">{items.map((it, i) => <button key={i} className={i === index ? "is-selected" : ""} onClick={() => { setZoom(false); onIndex(i); }} aria-label={`Ver ${it.caption}`} aria-current={i === index}><img src={it.src} alt="" style={{ objectPosition: it.pos }}/></button>)}</div>}
    </div>
  </div>;
}

export function Sheet({ eyebrow, title, onClose, children, footer }: { eyebrow?: string; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !dialog.current) return;
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); previous.current?.focus(); };
  }, [onClose]);
  return <div className="v-sheet-layer" role="presentation">
    <button className="modal-scrim" onClick={onClose} aria-label="Cerrar panel"/>
    <aside ref={dialog} className="v-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <span className="v-sheet__grip" aria-hidden="true"/>
      <header><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><button ref={ref} className="button button--icon" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={18}/></button></header>
      <div className="v-sheet__body">{children}</div>
      {footer && <footer className="v-sheet__footer">{footer}</footer>}
    </aside>
  </div>;
}

export function ChatPanel({
  petId,
  consultationId,
  header = true,
  actions,
  onBack,
  consultLabel = "Conversación",
}: {
  petId: string;
  consultationId?: string;
  header?: boolean;
  actions?: ReactNode;
  onBack?: () => void;
  consultLabel?: string;
}) {
  const { user } = useAuth();
  const { threads, send, markRead, notify, consults } = useVet();
  const pet = getPatient(petId);
  const thread = threads.find((t) => t.petId === petId);

  // Resolve consultationId from props or consults
  const activeConsultationId = consultationId || consults.find((c) => c.petId === petId || c.id === petId)?.id;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [quick, setQuick] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Mark read
  useEffect(() => {
    markRead(petId);
  }, [petId, markRead, messages.length]);

  // Load and sync real messages if activeConsultationId is available
  useEffect(() => {
    if (!activeConsultationId) {
      if (thread?.msgs) {
        setMessages(
          thread.msgs.map((m) => ({
            id: m.id,
            content: m.text || m.name || "",
            senderId: m.mine ? user?.id : "other",
            createdAt: null,
            timeStr: m.time,
            kind: m.kind,
            src: m.src,
            name: m.name,
            pos: m.pos,
          }))
        );
      }
      return;
    }

    const wsUrl = getWsUrl();
    const token = getAccessToken();
    const s = io(wsUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token: token ? `Bearer ${token}` : undefined },
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("join:consultation", { consultationId: activeConsultationId });
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
      .get<ApiResponse<any[]>>(`/api/consultations/${activeConsultationId}/messages`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setMessages(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      s.disconnect();
    };
  }, [activeConsultationId, user?.id, thread?.msgs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, petId]);

  const submit = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    setQuick(false);

    if (activeConsultationId) {
      const clientMsgId = `vet-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      if (socket && connected) {
        socket.emit(
          "message:send",
          { consultationId: activeConsultationId, content, clientMsgId },
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
        try {
          const res = await api.post<ApiResponse<any>>(`/api/consultations/${activeConsultationId}/messages`, {
            content,
            clientMsgId,
          });
          if (res.data.success && res.data.data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === res.data.data.id || m.clientMsgId === clientMsgId)) return prev;
              return [...prev, res.data.data];
            });
          }
        } catch {
          notify("No se pudo enviar el mensaje.");
        }
      }
    } else {
      send(petId, { text: content });
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, content, senderId: user?.id, createdAt: new Date().toISOString() },
      ]);
    }
  };

  const images = (thread?.msgs ?? []).filter((m) => m.kind === "image");

  return (
    <section className="wa-chat-pane v-chat" style={{ display: "flex", flexDirection: "column", height: "100%", background: "#efeae2" }} aria-label={`Conversación con ${pet.tutor}`}>
      {header && (
        <header className="wa-chat-pane__header">
          <div className="wa-chat-pane__header-contact">
            {onBack && (
              <button className="wa-icon-btn" onClick={onBack} aria-label="Volver a conversaciones">
                <Icon name="left" size={18} />
              </button>
            )}
            <div className="wa-chat-pane__header-avatar">
              <PetPhoto pet={pet} size={40} />
            </div>
            <div className="wa-chat-pane__header-info">
              <h2>{pet.tutor} · {pet.name}</h2>
              <span className="is-online">
                {connected || activeConsultationId ? "En línea" : "Conectado"} · {pet.kind}, {pet.breed}
              </span>
            </div>
          </div>
          <div className="wa-chat-pane__header-actions">
            {actions}
          </div>
        </header>
      )}

      <div className="wa-chat-body" style={{ flex: 1, overflowY: "auto" }}>
        <div className="wa-encryption-pill" style={{ alignSelf: "center", margin: "4px auto 8px" }}>
          <span>🔒</span>
          <span>Los mensajes y llamadas están cifrados de extremo a extremo · SENASA</span>
        </div>
        <div className="wa-date-pill" style={{ alignSelf: "center", margin: "0 auto 6px" }}>HOY</div>

        {messages.length === 0 ? (
          <div className="v-chat__empty" style={{ textAlign: "center", padding: "40px 16px", color: "var(--ink-soft)" }}>
            <Icon name="message" size={24} />
            <p style={{ marginTop: 8, fontSize: 13 }}>Todavía no hay mensajes con {pet.tutor}. Escribí abajo para comenzar.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id || m.mine;
            const time = m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : m.timeStr || "Ahora";

            if (m.kind === "image") {
              const idx = images.findIndex((i) => i.id === m.id);
              return (
                <div key={m.id} className={`wa-bubble ${mine ? "wa-bubble--sent" : "wa-bubble--received"}`} style={{ maxWidth: 280 }}>
                  <button onClick={() => setBox(idx)} style={{ border: 0, padding: 0, background: "none", borderRadius: 8, overflow: "hidden", display: "block", cursor: "pointer" }} aria-label={`Ampliar fotografía: ${m.name}`}>
                    <img src={m.src} alt={m.name} style={{ width: "100%", height: 160, objectFit: "cover", objectPosition: m.pos, display: "block" }} loading="lazy" />
                  </button>
                  <div className="wa-bubble__meta" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4, fontSize: 10, color: "#667781" }}>
                    <span>{m.name} · {time}</span>
                    {mine && <WhatsAppCheck state="read" />}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id || m.clientMsgId}
                className={`wa-bubble ${mine ? "wa-bubble--sent" : "wa-bubble--received"}`}
              >
                {!mine && (
                  <div className="wa-bubble__sender" style={{ fontSize: 11.5, fontWeight: 700, color: "#008069", marginBottom: 2 }}>
                    {m.sender?.firstName || pet.tutor}
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
        <div ref={endRef} />
      </div>

      {quick && (
        <div className="v-quick" role="menu" aria-label="Respuestas rápidas">
          <span className="eyebrow">Respuestas rápidas</span>
          {quickReplies.map((q) => (
            <button role="menuitem" key={q} onClick={() => { setText(q); setQuick(false); }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <footer className="wa-chat-footer" style={{ padding: "8px 14px", background: "#f0f2f5", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #e9edef" }}>
        <button
          className={`button button--icon v-quick-toggle ${quick ? "is-open" : ""}`}
          onClick={() => setQuick(!quick)}
          aria-label="Respuestas rápidas"
          aria-expanded={quick}
          title="Respuestas rápidas"
          style={{ width: 38, height: 38, borderRadius: "50%" }}
        >
          <Icon name="zap" size={17} />
        </button>
        <div className="wa-input-pill" style={{ flex: 1, background: "#ffffff", borderRadius: 8, height: 40, display: "flex", alignItems: "center", padding: "0 14px" }}>
          <input
            aria-label="Escribir mensaje"
            placeholder={`Escribir a ${pet.tutor}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111b21" }}
          />
        </div>
        <button
          className="wa-send-btn"
          disabled={!text.trim()}
          onClick={submit}
          aria-label="Enviar mensaje"
          style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: text.trim() ? "#00a884" : "#8696a0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default" }}
        >
          <Icon name="send" size={17} />
        </button>
      </footer>

      {box !== null && (
        <Lightbox
          items={images.map((i) => ({ src: i.src!, caption: i.name!, pos: i.pos }))}
          index={box}
          onIndex={setBox}
          onClose={() => setBox(null)}
          pet={pet.name}
          consult={consultLabel}
        />
      )}
    </section>
  );
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <label className="v-select"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></label>;
}
