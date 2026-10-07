import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon, MessageBubble, Modal, Status, Toast, go } from "../shared";
import {
  getPatient, initialConsults, initialEvents, initialFollowUps, initialQueue, initialRx, initialThreads, quickReplies, triageMeta,
  type AgendaEvent, type Consult, type FollowUp, type Msg, type Patient, type QueueItem, type Rx, type Thread, type Triage,
} from "./data";

export type Avail = "Disponible" | "No disponible" | "En consulta";

type Ctx = {
  avail: Avail; requestAvail: (next: Avail) => void; notify: (msg: string) => void;
  queue: QueueItem[]; accept: (id: string) => void;
  consults: Consult[]; finish: (id: string) => void; threads: Thread[]; send: (petId: string, msg: Omit<Msg, "id" | "mine" | "time">) => void; markRead: (petId: string) => void; unread: number;
  events: AgendaEvent[]; setEvents: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  rx: Rx[]; setRx: React.Dispatch<React.SetStateAction<Rx[]>>;
  followUps: FollowUp[]; setFollowUps: React.Dispatch<React.SetStateAction<FollowUp[]>>;
  forceEmpty: boolean;
};

const VetContext = createContext<Ctx | null>(null);
export const useVet = () => {
  const ctx = useContext(VetContext);
  if (!ctx) throw new Error("useVet fuera de VetProvider");
  return ctx;
};

export function VetProvider({ children, forceEmpty }: { children: ReactNode; forceEmpty: boolean }) {
  const [avail, setAvail] = useState<Avail>("Disponible");
  const [pending, setPending] = useState<Avail | null>(null);
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null);
  const [queue, setQueue] = useState(forceEmpty ? [] : initialQueue);
  const [consults, setConsults] = useState(forceEmpty ? [] : initialConsults);
  const [threads, setThreads] = useState(forceEmpty ? [] : initialThreads);
  const [events, setEvents] = useState(forceEmpty ? [] : initialEvents);
  const [rx, setRx] = useState(forceEmpty ? [] : initialRx);
  const [followUps, setFollowUps] = useState(forceEmpty ? [] : initialFollowUps);

  const notify = useCallback((msg: string) => setToast({ msg, id: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const apply = useCallback((next: Avail) => { setAvail(next); notify(`Tu estado ahora es: ${next}`); }, [notify]);
  const requestAvail = useCallback((next: Avail) => {
    if (next === avail) return;
    if (next === "No disponible" && queue.length > 0) setPending(next);
    else apply(next);
  }, [avail, queue.length, apply]);

  const accept = useCallback((id: string) => {
    const q = queue.find((item) => item.id === id);
    if (!q) return;
    setQueue((list) => list.filter((item) => item.id !== id));
    setConsults((list) => [{ id: q.id, petId: q.petId, day: "Hoy", date: "15 Jul", time: "18:43", reason: q.reason, status: "Activa", mode: "Videoconsulta", triage: q.triage }, ...list]);
    setAvail("En consulta");
    notify(`Aceptaste la consulta de ${getPatient(q.petId).name}`);
    go(`/vet/consultations/${q.id}`);
  }, [queue, notify]);

  const finish = useCallback((id: string) => {
    const remaining = consults.filter((c) => c.status === "Activa" && c.id !== id).length;
    setConsults((list) => list.map((c) => c.id === id ? { ...c, status: "Finalizada" } : c));
    if (!remaining) setAvail("Disponible");
    notify("Consulta finalizada");
  }, [consults, notify]);

  const send = useCallback((petId: string, msg: Omit<Msg, "id" | "mine" | "time">) => {
    const full: Msg = { ...msg, id: `m${Date.now()}`, mine: true, time: "Ahora" };
    setThreads((list) => list.some((t) => t.petId === petId)
      ? list.map((t) => t.petId === petId ? { ...t, msgs: [...t.msgs, full], last: msg.text ?? "Archivo", lastTime: "Ahora" } : t)
      : [{ id: `t-${petId}`, petId, last: msg.text ?? "Archivo", lastTime: "Ahora", unread: 0, online: true, msgs: [full] }, ...list]);
  }, []);
  const markRead = useCallback((petId: string) => setThreads((list) => list.some((t) => t.petId === petId && t.unread) ? list.map((t) => t.petId === petId ? { ...t, unread: 0 } : t) : list), []);
  const unread = threads.reduce((n, t) => n + t.unread, 0);

  const value = useMemo(() => ({ avail, requestAvail, notify, queue, accept, consults, finish, threads, send, markRead, unread, events, setEvents, rx, setRx, followUps, setFollowUps, forceEmpty }),
    [avail, requestAvail, notify, queue, accept, consults, finish, threads, send, markRead, unread, events, rx, followUps, forceEmpty]);

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
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <div className="v-sheet-layer" role="presentation">
    <button className="modal-scrim" onClick={onClose} aria-label="Cerrar panel"/>
    <aside className="v-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <span className="v-sheet__grip" aria-hidden="true"/>
      <header><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><button ref={ref} className="button button--icon" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={18}/></button></header>
      <div className="v-sheet__body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </aside>
  </div>;
}

export function ChatPanel({ petId, header = true, actions, onBack, consultLabel = "Conversación" }: { petId: string; header?: boolean; actions?: ReactNode; onBack?: () => void; consultLabel?: string }) {
  const { threads, send, markRead, notify } = useVet();
  const pet = getPatient(petId);
  const thread = threads.find((t) => t.petId === petId);
  const [text, setText] = useState("");
  const [quick, setQuick] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const msgs = thread?.msgs ?? [];
  useEffect(() => { markRead(petId); }, [petId, markRead, msgs.length]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length, petId]);
  const images = msgs.filter((m) => m.kind === "image");
  const submit = () => { if (!text.trim()) return; send(petId, { text: text.trim() }); setText(""); setQuick(false); };
  return <section className="chat v-chat" aria-label={`Conversación con ${pet.tutor}`}>
    {header && <header>
      {onBack && <Button variant="icon" icon="left" ariaLabel="Volver a conversaciones" onClick={onBack} className="v-chat__back"/>}
      <span className="v-chat__avatar"><PetPhoto pet={pet} size={40}/></span>
      <div><strong>{pet.tutor} · {pet.name}</strong><span><i className={thread?.online ? "is-online" : "is-offline"}/>{thread?.online ? "En línea" : "Sin conexión"} · {pet.kind}, {pet.breed}</span></div>
      {actions}
    </header>}
    <div className="chat__messages">
      {msgs.length === 0 && <div className="v-chat__empty"><Icon name="message" size={22}/><p>Todavía no hay mensajes con {pet.tutor}.</p></div>}
      {msgs.map((m) => {
        if (m.kind === "image") {
          const idx = images.findIndex((i) => i.id === m.id);
          return <div key={m.id} className={`message-bubble v-bubble-img ${m.mine ? "message-bubble--mine" : ""}`}>
            <button onClick={() => setBox(idx)} aria-label={`Ampliar fotografía: ${m.name}`}><img src={m.src} alt={m.name} style={{ objectPosition: m.pos }} loading="lazy"/><span className="v-bubble-img__zoom"><Icon name="expand" size={14}/></span></button>
            <span>{m.name} · {m.time}</span>
          </div>;
        }
        if (m.kind === "doc") return <div key={m.id} className={`message-bubble v-bubble-doc ${m.mine ? "message-bubble--mine" : ""}`}>
          <Icon name="file" size={20}/><div><strong>{m.name}</strong><small>{m.text}</small></div><button className="button button--icon" onClick={() => notify("Documento abierto (mock)")} aria-label={`Abrir ${m.name}`}><Icon name="download" size={16}/></button>
          <span>{m.time}</span>
        </div>;
        return <MessageBubble key={m.id} mine={m.mine} text={m.text ?? ""} time={m.time} state={m.mine ? "read" : undefined}/>;
      })}
      {thread?.online && <div className="typing" role="status" aria-live="polite"><span/><span/><span/> Tutor escribiendo…</div>}
      {!thread?.online && <div className="chat-offline" role="status"><Icon name="alert" size={14}/> Sin conexión. Los mensajes se enviarán cuando vuelva la conexión.</div>}
      <div ref={endRef}/>
    </div>
    {quick && <div className="v-quick" role="menu" aria-label="Respuestas rápidas">
      <span className="eyebrow">Respuestas rápidas</span>
      {quickReplies.map((q) => <button role="menuitem" key={q} onClick={() => { setText(q); setQuick(false); }}>{q}</button>)}
    </div>}
    <footer>
      <Button variant="icon" icon="paperclip" ariaLabel="Adjuntar archivo" onClick={() => notify("Adjuntos disponibles en la versión conectada")}/>
      <button className={`button button--icon v-quick-toggle ${quick ? "is-open" : ""}`} onClick={() => setQuick(!quick)} aria-label="Respuestas rápidas" aria-expanded={quick}><Icon name="zap" size={18}/></button>
      <input aria-label="Escribir mensaje" placeholder="Escribir al tutor…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}/>
      <Button variant="icon" icon="send" ariaLabel="Enviar mensaje" disabled={!text.trim()} onClick={submit}/>
    </footer>
    {box !== null && <Lightbox items={images.map((i) => ({ src: i.src!, caption: i.name!, pos: i.pos }))} index={box} onIndex={setBox} onClose={() => setBox(null)} pet={pet.name} consult={consultLabel}/>}
  </section>;
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <label className="v-select"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></label>;
}
