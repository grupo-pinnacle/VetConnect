import { useEffect, useState } from "react";
import "./vet.css";
import { Button, Icon, Modal, go } from "../shared";
import { getPatient, initialConsults, initialQueue } from "./data";
import { ChatPanel, TriageBadge, VetProvider } from "./vetkit";
import { FichaClinica } from "./Consultations";

function Room({ id }: { id: string }) {
  const consult = initialConsults.find((c) => c.id === id);
  const queued = initialQueue.find((q) => q.id === id);
  const petId = consult?.petId ?? queued?.petId ?? "milo";
  const p = getPatient(petId);
  const triage = queued?.triage;
  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [panel, setPanel] = useState<"" | "Chat" | "Ficha">("Chat");
  const [ending, setEnding] = useState(false);
  const requested = new URLSearchParams(window.location.search).get("state");
  const fromClient = new URLSearchParams(window.location.search).get("from") === "client";
  const [callState, setCallState] = useState<"connecting" | "waiting" | "connected" | "reconnecting" | "ended" | "error">(
    requested === "connecting" || requested === "waiting" || requested === "reconnecting" || requested === "ended" || requested === "error" ? requested : "connected",
  );
  useEffect(() => { const t = window.setInterval(() => setSecs((s) => s + 1), 1000); return () => window.clearInterval(t); }, []);
  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  if (callState === "ended") return <main className="v-call-summary">
    <section className="v-call-summary__card">
      <span className="v-call-summary__icon"><Icon name="check" size={28}/></span>
      <span className="eyebrow">Videoconsulta</span>
      <h1>Consulta finalizada</h1>
      <p>La atención quedó registrada. Podés revisar las indicaciones y documentos cuando lo necesites.</p>
      <dl>
        <div><dt>{fromClient ? "Veterinario" : "Tutor"}</dt><dd>{fromClient ? "Dr. Santiago Mendoza" : p.tutor}</dd></div>
        <div><dt>Mascota</dt><dd>{p.name} · {p.kind}</dd></div>
        <div><dt>Fecha y duración</dt><dd>Hoy · {clock}</dd></div>
        <div><dt>Motivo</dt><dd>{consult?.reason ?? queued?.reason ?? "Videoconsulta"}</dd></div>
        <div className="is-wide"><dt>Resumen</dt><dd>Evolución estable durante la consulta. Se indicó continuar el seguimiento clínico.</dd></div>
        <div className="is-wide"><dt>Indicaciones</dt><dd>Seguir las pautas del profesional y consultar nuevamente si aparecen cambios.</dd></div>
        <div><dt>Recetas</dt><dd>1 receta disponible</dd></div>
        <div><dt>Documentos</dt><dd>Resumen de consulta</dd></div>
      </dl>
      <Button icon="arrow" onClick={() => go(fromClient ? "/client/consultations" : `/vet/consultations/${id}`)}>{fromClient ? "Volver a mis consultas" : "Volver a la consulta"}</Button>
    </section>
  </main>;
  const stateCopy = {
    connecting: ["Conectando con el veterinario…", "Estamos preparando el audio y el video."],
    waiting: ["El veterinario se está conectando.", "Podés quedarte en esta pantalla. Te avisamos cuando ingrese."],
    reconnecting: ["Se perdió momentáneamente la conexión.", "Estamos intentando reconectar la llamada."],
    error: ["No pudimos conectar la videollamada.", "Revisá tu conexión e intentá nuevamente."],
    connected: ["", ""],
    ended: ["", ""],
  }[callState];
  return <div className={`v-call ${panel ? "has-panel" : ""}`}>
    <header className="v-call__top">
      <button className="v-call__back" onClick={() => setEnding(true)} aria-label="Salir de la videollamada"><Icon name="left" size={20}/></button>
      <div><b>{p.name} · {p.tutor}</b><span>{consult?.reason ?? queued?.reason ?? "Videoconsulta"}</span></div>
      {triage && <TriageBadge level={triage} compact/>}
      <span className={`v-call__net ${callState === "reconnecting" ? "is-warning" : ""}`}><Icon name={callState === "reconnecting" ? "repeat" : "check"} size={13}/>{callState === "reconnecting" ? "Reconectando" : "Conexión estable"}</span>
      <time className="v-call__time" aria-label={`Duración ${Math.floor(secs / 60)} minutos`}>{clock}</time>
    </header>
    <main className="v-call__stage">
      <div className="v-call__remote">
        {fromClient ? <div className="v-call__professional" role="img" aria-label="Video del Dr. Santiago Mendoza"><span className="avatar">SM</span><small>Dr. Santiago Mendoza</small></div> : <img src={p.photo} alt={`Video de ${p.tutor} con ${p.name}`}/>}
        <span className="v-call__tag">{fromClient ? "Dr. Santiago Mendoza" : `${p.tutor} · ${p.name}`}</span>
        <span className="v-call__sim">Videollamada simulada</span>
        {callState !== "connected" && <div className={`v-call__state v-call__state--${callState}`} role={callState === "error" ? "alert" : "status"} aria-live="assertive"><span><Icon name={callState === "error" ? "alert" : "repeat"} size={24}/></span><h1>{stateCopy[0]}</h1><p>{stateCopy[1]}</p>{callState === "error" && <Button variant="secondary" icon="repeat" onClick={() => setCallState("connecting")}>Reintentar</Button>}</div>}
      </div>
      <div className={`v-call__self ${cam ? "" : "is-off"}`}>{cam ? <span className="avatar">SM</span> : <><Icon name="video" size={18}/><small>Cámara apagada</small></>}<em>Vos</em>{!mic && <span className="v-call__muted"><Icon name="micoff" size={13}/></span>}</div>
    </main>
    <nav className="v-call__bar" aria-label="Controles de la llamada">
      <button className={`v-ctl ${mic ? "" : "is-off"}`} aria-label={mic ? "Silenciar micrófono" : "Activar micrófono"} aria-pressed={!mic} onClick={() => setMic(!mic)}><Icon name={mic ? "mic" : "micoff"} size={20}/><span>{mic ? "Silenciar" : "Activar mic"}</span></button>
      <button className={`v-ctl ${cam ? "" : "is-off"}`} aria-label={cam ? "Apagar cámara" : "Encender cámara"} aria-pressed={!cam} onClick={() => setCam(!cam)}><Icon name="video" size={20}/><span>{cam ? "Apagar cámara" : "Encender"}</span></button>
      <button className={`v-ctl ${panel === "Chat" ? "is-on" : ""}`} aria-pressed={panel === "Chat"} onClick={() => setPanel(panel === "Chat" ? "" : "Chat")}><Icon name="message" size={20}/><span>Chat</span></button>
      <button className={`v-ctl ${panel === "Ficha" ? "is-on" : ""}`} aria-pressed={panel === "Ficha"} onClick={() => setPanel(panel === "Ficha" ? "" : "Ficha")}><Icon name="file" size={20}/><span>Ficha</span></button>
      <button className="v-ctl v-ctl--end" onClick={() => setEnding(true)}><Icon name="phone" size={20}/><span>Finalizar</span></button>
    </nav>
    {panel && <aside className="v-call__panel" aria-label={panel === "Chat" ? `Chat con ${fromClient ? "el veterinario" : "el tutor"}` : "Ficha clínica"}>
      <header><b>{panel === "Chat" ? `Chat con ${fromClient ? "el veterinario" : "el tutor"}` : "Ficha clínica"}</b><button className="button button--icon" onClick={() => setPanel("")} aria-label="Cerrar panel"><Icon name="close" size={16}/></button></header>
      <div className="v-call__panel-body">{panel === "Chat" ? <ChatPanel petId={p.id} header={false} consultLabel="Videoconsulta"/> : <FichaClinica p={p}/>}</div>
    </aside>}
    {ending && <Modal title="Finalizar videollamada" text="La llamada terminará para todas las personas. Después vas a poder revisar el resumen de la consulta." cancel="Seguir en la llamada" confirm="Finalizar llamada" destructive onClose={() => setEnding(false)} onConfirm={() => { setEnding(false); setCallState("ended"); setPanel(""); }}/>}
  </div>;
}

export default function CallRoom({ id }: { id: string }) {
  return <VetProvider forceEmpty={false}><Room id={id}/></VetProvider>;
}
