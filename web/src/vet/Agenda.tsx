import { useState } from "react";
import { Button, EmptyState, Icon, Modal, PageHeader, Tabs, go } from "../shared";
import { availability, getPatient, todayIndex, weekDays, type AgendaEvent } from "./data";
import { ConsultStatus, PetPhoto, useVet } from "./vetkit";

function EventCard({ e, onReschedule, onCancel }: { e: AgendaEvent; onReschedule: () => void; onCancel: () => void }) {
  const p = getPatient(e.petId);
  const closed = e.status === "Completada" || e.status === "Cancelada";
  return <article className={`v-event v-event--${e.status.toLowerCase()}`}>
    <b className="v-event__time">{e.time}</b>
    <PetPhoto pet={p} size={40}/>
    <div className="v-event__main"><h3>{p.name} <small>{p.kind}</small></h3><p>Tutor: {p.tutor}</p><span className="v-chip"><Icon name={e.type === "Chat" ? "message" : e.type === "Seguimiento" ? "repeat" : "video"} size={13}/>{e.type}</span></div>
    <ConsultStatus status={e.status}/>
    <div className="v-event__actions">
      <Button variant="secondary" onClick={() => go(e.consultId ? `/vet/consultations/${e.consultId}` : "/vet/follow-ups")}>{e.consultId ? "Ver consulta" : "Ver seguimiento"}</Button>
      {!closed && <><Button variant="soft" onClick={onReschedule}>Reprogramar</Button><Button variant="secondary" onClick={onCancel} className="v-btn-quiet">Cancelar</Button></>}
    </div>
  </article>;
}

function Availability() {
  const { notify } = useVet();
  const [edit, setEdit] = useState(false);
  const [rows, setRows] = useState(availability);
  return <aside className="panel v-availability" aria-labelledby="mi-disp">
    <div className="panel__heading"><div><span className="eyebrow">Horarios de atención</span><h2 id="mi-disp">Mi disponibilidad</h2></div></div>
    <ul>{rows.map((r, i) => <li key={r.day}><b>{r.day}</b>{edit ? <input aria-label={`Horario del ${r.day}`} value={r.hours} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))}/> : <span className={r.hours === "No disponible" ? "is-off" : ""}>{r.hours}</span>}</li>)}</ul>
    {edit ? <div className="v-inline-actions"><Button variant="secondary" onClick={() => { setRows(availability); setEdit(false); }}>Cancelar</Button><Button icon="check" onClick={() => { setEdit(false); notify("Disponibilidad actualizada"); }}>Guardar</Button></div> : <Button variant="secondary" icon="edit" onClick={() => setEdit(true)}>Editar disponibilidad</Button>}
  </aside>;
}

export function AppointmentsPage() {
  const { events, setEvents, notify, forceEmpty } = useVet();
  const [tab, setTab] = useState("Agenda diaria");
  const [day, setDay] = useState(todayIndex);
  const [resched, setResched] = useState<AgendaEvent | null>(null);
  const [cancel, setCancel] = useState<AgendaEvent | null>(null);
  const [nd, setNd] = useState(0);
  const [nt, setNt] = useState("18:00");
  const sorted = (l: AgendaEvent[]) => [...l].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const card = (e: AgendaEvent) => <EventCard key={e.id} e={e} onReschedule={() => { setResched(e); setNd(e.day); setNt(e.time); }} onCancel={() => setCancel(e)}/>;
  const upcoming = sorted(events.filter((e) => (e.status === "Confirmada" || e.status === "Pendiente") && e.day >= todayIndex));
  return <>
    <PageHeader eyebrow="Organización semanal · 14 al 20 de julio" title="Agenda" description="Tus consultas programadas y tus horarios de atención."/>
    <Tabs tabs={["Agenda diaria", "Semana", "Próximas consultas"]} active={tab} onChange={setTab}/>
    <div className="v-agenda">
      <div className="v-agenda__main">
        {tab === "Agenda diaria" && <>
          <div className="v-days" role="tablist" aria-label="Día de la semana">{weekDays.map((d, i) => <button key={d.short} role="tab" aria-selected={day === i} className={`${day === i ? "is-selected" : ""} ${i === todayIndex ? "is-today" : ""}`} onClick={() => setDay(i)}><small>{d.short}</small><b>{d.date}</b>{i === todayIndex && <em>Hoy</em>}</button>)}</div>
          <div className="v-day-head"><h2>{weekDays[day].name} {weekDays[day].date} de julio</h2><span className="v-chip"><Icon name="clock" size={13}/>{availability[day].hours}</span></div>
          {sorted(events.filter((e) => e.day === day)).length ? <div className="v-events">{sorted(events.filter((e) => e.day === day)).map(card)}</div> : <div className="panel"><EmptyState icon="calendar" title="No tenés consultas para este día." text="Tu agenda está libre en este horario."/></div>}
        </>}
        {tab === "Semana" && <div className="v-week">{weekDays.map((d, i) => <section key={d.short} className={`v-week__col ${i === todayIndex ? "is-today" : ""}`} aria-label={`${d.name} ${d.date}`}>
          <header><small>{d.short}</small><b>{d.date}</b></header>
          {sorted(events.filter((e) => e.day === i)).map((e) => { const p = getPatient(e.petId); return <button key={e.id} className={`v-week__ev v-event--${e.status.toLowerCase()}`} onClick={() => go(e.consultId ? `/vet/consultations/${e.consultId}` : "/vet/follow-ups")}><b>{e.time}</b><span>{p.name}</span><small>{e.type} · {e.status}</small></button>; })}
          {!events.some((e) => e.day === i) && <p className="v-week__empty">Sin consultas</p>}
        </section>)}</div>}
        {tab === "Próximas consultas" && (upcoming.length ? <div className="v-events">{upcoming.map((e) => <div key={e.id}><span className="v-day-label">{weekDays[e.day].name} {weekDays[e.day].date}{e.day === todayIndex ? " · Hoy" : ""}</span>{card(e)}</div>)}</div> : <div className="panel"><EmptyState icon="calendar" title="No tenés consultas para mostrar." text="Tus próximas consultas aparecerán acá."/></div>)}
      </div>
      {!forceEmpty && <Availability/>}
    </div>
    {resched && <div className="modal-layer" role="presentation"><button className="modal-scrim" aria-label="Cerrar" onClick={() => setResched(null)}/><div className="modal v-modal-form" role="dialog" aria-modal="true" aria-labelledby="rs-t">
      <span className="modal__icon"><Icon name="calendar"/></span><h2 id="rs-t">Reprogramar consulta</h2><p>{getPatient(resched.petId).name} · {getPatient(resched.petId).tutor}</p>
      <div className="v-modal-fields">
        <label className="v-select"><span>Día</span><select value={nd} onChange={(e) => setNd(Number(e.target.value))}>{weekDays.map((d, i) => <option key={d.short} value={i} disabled={i < todayIndex}>{d.name} {d.date}</option>)}</select></label>
        <label className="v-select"><span>Hora</span><select value={nt} onChange={(e) => setNt(e.target.value)}>{["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      <div><Button variant="secondary" onClick={() => setResched(null)}>Volver</Button><Button onClick={() => { setEvents((l) => l.map((e) => e.id === resched.id ? { ...e, day: nd, time: nt, status: "Pendiente" } : e)); notify("Consulta reprogramada. Se avisará al tutor."); setResched(null); }}>Confirmar cambio</Button></div>
    </div></div>}
    {cancel && <Modal title="Cancelar consulta" text={`¿Seguro que querés cancelar la consulta de ${getPatient(cancel.petId).name}? El tutor recibirá un aviso.`} cancel="Volver" confirm="Cancelar consulta" destructive onClose={() => setCancel(null)} onConfirm={() => { setEvents((l) => l.map((e) => e.id === cancel.id ? { ...e, status: "Cancelada" } : e)); notify("Consulta cancelada"); setCancel(null); }}/>}
  </>;
}
