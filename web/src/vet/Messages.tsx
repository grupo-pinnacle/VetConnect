import { useState } from "react";
import { Button, EmptyState, Icon, PageHeader, go } from "../shared";
import { getPatient } from "./data";
import { ChatPanel, PetPhoto, useVet } from "./vetkit";

export function MessagesPage() {
  const { threads, consults } = useVet();
  const [sel, setSel] = useState<string>(threads[0]?.petId ?? "");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = threads.filter((t) => (getPatient(t.petId).name + getPatient(t.petId).tutor).toLowerCase().includes(q.toLowerCase()));
  if (!threads.length) return <><PageHeader eyebrow="Comunicación con tutores" title="Mensajes"/><div className="panel"><EmptyState icon="message" title="No tenés conversaciones pendientes." text="Los mensajes de tus tutores aparecerán acá."/></div></>;
  const consult = consults.find((c) => c.petId === sel && (c.status === "Activa" || c.status === "Próxima"));
  return <>
    <PageHeader eyebrow="Comunicación con tutores" title="Mensajes" description="Conversaciones vinculadas a tus pacientes."/>
    <div className={`messages-layout v-msgs ${open ? "is-thread" : ""}`}>
      <aside className="conversation-list" aria-label="Conversaciones">
        <div className="search-field"><Icon name="search" size={18}/><input aria-label="Buscar conversación" placeholder="Buscar paciente o tutor" value={q} onChange={(e) => setQ(e.target.value)}/></div>
        {list.length === 0 && <p className="v-none v-pad">Sin resultados.</p>}
        {list.map((t) => { const p = getPatient(t.petId); return <button key={t.id} className={`${sel === t.petId ? "is-active" : ""} ${t.unread ? "is-unread" : ""}`} aria-current={sel === t.petId} onClick={() => { setSel(t.petId); setOpen(true); }}>
          <span className="v-conv-avatar"><PetPhoto pet={p} size={42}/><i className={t.online ? "is-online" : "is-offline"} title={t.online ? "En línea" : "Sin conexión"}/></span>
          <span><strong>{p.tutor}</strong><small>{p.name} · {p.kind}{t.unread ? " · No leído" : ""}</small><p>{t.last}</p></span>
          <time>{t.lastTime}</time>{t.unread > 0 && <b className="unread" aria-label={`${t.unread} mensajes sin leer`}>{t.unread}</b>}
        </button>; })}
      </aside>
      <ChatPanel key={sel} petId={sel} onBack={() => setOpen(false)} consultLabel={consult?.reason ?? "Conversación"} actions={<>
        <Button variant="soft" icon="file" onClick={() => go(`/vet/patients/${sel}`)}>Ficha</Button>
        {consult && <Button variant="secondary" icon="video" onClick={() => go(`/vet/consultations/${consult.id}`)}>Consulta</Button>}
      </>}/>
    </div>
  </>;
}
