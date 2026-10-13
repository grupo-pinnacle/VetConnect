import { useState } from "react";
import { Alert, Button, EmptyState, Icon, Modal, PageHeader, Status, Tabs, go } from "../shared";
import api from "../services/api";
import { availability, getPatient, todayIndex, weekDays, type AgendaEvent } from "./data";
import { ConsultStatus, PetPhoto, useVet } from "./vetkit";

function EventCard({ e, reason, onReschedule, onCancel }: { e: AgendaEvent; reason?: string; onReschedule: () => void; onCancel: () => void }) {
  const p = getPatient(e.petId);
  const closed = e.status === "Completada" || e.status === "Cancelada";
  return <article className={`v-event v-event--${e.status.toLowerCase()}`}>
    <b className="v-event__time">{e.time}</b>
    <PetPhoto pet={p} size={40}/>
    <div className="v-event__main"><h3>{p.name} <small>{p.kind}</small></h3><p>Tutor: {p.tutor}</p>{reason && <p className="v-event__reason">{reason}</p>}<span className="v-chip"><Icon name={e.type === "Chat" ? "message" : e.type === "Seguimiento" ? "repeat" : "video"} size={13}/>{e.type}</span></div>
    <ConsultStatus status={e.status}/>
    <div className="v-event__actions">
      <Button variant="secondary" onClick={() => go(e.consultId ? `/vet/consultations/${e.consultId}` : "/vet/follow-ups")}>{e.consultId ? "Ver consulta" : "Ver seguimiento"}</Button>
      {!closed && <><Button variant="soft" onClick={onReschedule}>Reprogramar</Button><Button variant="secondary" onClick={onCancel} className="v-btn-quiet">Cancelar</Button></>}
    </div>
  </article>;
}

function AvailabilitySummary() {
  return <aside className="panel v-availability" aria-labelledby="mi-disp">
    <div className="panel__heading"><div><span className="eyebrow">Horarios de atención</span><h2 id="mi-disp">Mi disponibilidad</h2></div></div>
    <ul>{availability.map((r) => <li key={r.day}><b>{r.day}</b><span className={r.hours === "No disponible" ? "is-off" : ""}>{r.hours}</span></li>)}</ul>
    <Button variant="secondary" icon="edit" onClick={() => go("/vet/availability")}>Editar disponibilidad</Button>
  </aside>;
}

type AvailabilityRow = { day: string; enabled: boolean; start: string; end: string };
const availabilityRows: AvailabilityRow[] = availability.map((row) => {
  const [start = "", end = ""] = row.hours === "No disponible" ? [] : row.hours.split(" — ");
  return { day: row.day, enabled: row.hours !== "No disponible", start, end };
});

export function AvailabilityPage() {
  const { avail, requestAvail, notify } = useVet();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(availabilityRows);
  const [draft, setDraft] = useState(availabilityRows);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [savedHere, setSavedHere] = useState(false);
  const update = (index: number, patch: Partial<AvailabilityRow>) => {
    setDraft((rows) => rows.map((row, i) => i === index ? { ...row, ...patch } : row));
    setErrors((current) => { const next = { ...current }; delete next[index]; return next; });
    setSavedHere(false);
  };
  const save = () => {
    const next: Record<number, string> = {};
    draft.forEach((row, index) => {
      if (!row.enabled) return;
      if (!row.start || !row.end) next[index] = "Completá ambos horarios.";
      else if (row.start >= row.end) next[index] = "La hora de inicio debe ser anterior a la de cierre.";
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaved(draft);
    setEditing(false);
    setSavedHere(true);
    notify("La disponibilidad se actualizó en esta vista.");
  };
  const activeDays = saved.filter((row) => row.enabled).length;
  return <>
    <PageHeader eyebrow="Organización profesional" title="Disponibilidad" description="Definí tus horarios de atención para esta vista." action={!editing ? <Button icon="edit" onClick={() => setEditing(true)}>Editar disponibilidad</Button> : undefined}/>
    <div className="v-availability-layout">
      <section className="panel v-availability-editor" aria-labelledby="availability-schedule">
        <div className="panel__heading"><div><span className="eyebrow">Semana habitual</span><h2 id="availability-schedule">Días y horarios</h2><p>{activeDays} días de atención configurados con datos de demostración.</p></div></div>
        {savedHere && <Alert tone="success" title="Disponibilidad actualizada en esta vista.">Estos cambios son locales y no se guardaron en un servidor.</Alert>}
        <div className="v-schedule" aria-live="polite">
          {(editing ? draft : saved).map((row, index) => <div className={`v-schedule__row ${errors[index] ? "has-error" : ""}`} key={row.day}>
            <div><b>{row.day}</b><span>{row.enabled ? "Atención habilitada" : "No disponible"}</span></div>
            {editing ? <>
              <button type="button" role="switch" aria-checked={row.enabled} aria-label={`Atención el ${row.day}`} className={`switch ${row.enabled ? "is-on" : ""}`} onClick={() => update(index, { enabled: !row.enabled })}><span/></button>
              <label><span>Desde</span><input type="time" value={row.start} disabled={!row.enabled} onChange={(event) => update(index, { start: event.target.value })}/></label>
              <label><span>Hasta</span><input type="time" value={row.end} disabled={!row.enabled} onChange={(event) => update(index, { end: event.target.value })}/></label>
            </> : <strong>{row.enabled ? `${row.start}–${row.end}` : "No disponible"}</strong>}
            {errors[index] && <em role="alert">{errors[index]}</em>}
          </div>)}
        </div>
        {editing && <div className="v-form__bar"><Button variant="secondary" onClick={() => { setDraft(saved); setErrors({}); setEditing(false); }}>Cancelar edición</Button><Button icon="check" onClick={save}>Guardar cambios en esta vista</Button></div>}
      </section>
      <aside className="panel v-availability-state">
        <span className="eyebrow">Estado actual</span>
        <h2>{avail}</h2>
        <Status tone={avail === "Disponible" ? "teal" : avail === "En consulta" ? "amber" : "gray"}>{avail}</Status>
        <p>Este estado coincide con el indicador del encabezado y define cómo te mostrás en esta sesión.</p>
        <div className="v-state-actions" role="group" aria-label="Cambiar estado profesional">
          <Button variant={avail === "Disponible" ? "primary" : "secondary"} onClick={() => requestAvail("Disponible")}>Disponible</Button>
          <Button variant={avail === "No disponible" ? "primary" : "secondary"} onClick={() => requestAvail("No disponible")}>No disponible</Button>
        </div>
      </aside>
    </div>
  </>;
}

export function AppointmentsPage() {
  const { events, setEvents, notify, forceEmpty, consults } = useVet();
  const [tab, setTab] = useState("Agenda diaria");
  const [day, setDay] = useState(todayIndex);
  const [resched, setResched] = useState<AgendaEvent | null>(null);
  const [cancel, setCancel] = useState<AgendaEvent | null>(null);
  const [nd, setNd] = useState(0);
  const [nt, setNt] = useState("18:00");
  const sorted = (l: AgendaEvent[]) => [...l].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const card = (e: AgendaEvent) => <EventCard key={e.id} e={e} reason={consults.find((consult) => consult.id === e.consultId)?.reason} onReschedule={() => { setResched(e); setNd(e.day); setNt(e.time); }} onCancel={() => setCancel(e)}/>;
  const upcoming = sorted(events.filter((e) => (e.status === "Confirmada" || e.status === "Pendiente") && e.day >= todayIndex));
  return <>
    <PageHeader eyebrow={`Organización semanal · ${weekDays[0].date} al ${weekDays[6].date} de ${weekDays[6].month}`} title="Agenda" description="Tus consultas programadas y tus horarios de atención."/>
    <Tabs tabs={["Agenda diaria", "Semana", "Próximas consultas"]} active={tab} onChange={setTab}/>
    <div className="v-agenda">
      <div className="v-agenda__main">
        {tab === "Agenda diaria" && <>
          <div className="v-days" role="tablist" aria-label="Día de la semana">{weekDays.map((d, i) => <button key={d.short} role="tab" aria-selected={day === i} className={`${day === i ? "is-selected" : ""} ${i === todayIndex ? "is-today" : ""}`} onClick={() => setDay(i)}><small>{d.short}</small><b>{d.date}</b>{i === todayIndex && <em>Hoy</em>}</button>)}</div>
          <div className="v-day-head"><h2>{weekDays[day].name} {weekDays[day].date} de {weekDays[day].month}</h2><span className="v-chip"><Icon name="clock" size={13}/>{availability[day].hours}</span></div>
          {sorted(events.filter((e) => e.day === day)).length ? <div className="v-events">{sorted(events.filter((e) => e.day === day)).map(card)}</div> : <div className="panel"><EmptyState icon="calendar" title="No tenés consultas para este día." text="Tu agenda está libre en este horario."/></div>}
        </>}
        {tab === "Semana" && <div className="v-week">{weekDays.map((d, i) => <section key={d.short} className={`v-week__col ${i === todayIndex ? "is-today" : ""}`} aria-label={`${d.name} ${d.date}`}>
          <header><small>{d.short}</small><b>{d.date}</b></header>
          {sorted(events.filter((e) => e.day === i)).map((e) => { const p = getPatient(e.petId); return <button key={e.id} className={`v-week__ev v-event--${e.status.toLowerCase()}`} onClick={() => go(e.consultId ? `/vet/consultations/${e.consultId}` : "/vet/follow-ups")}><b>{e.time}</b><span>{p.name}</span><small>{e.type} · {e.status}</small></button>; })}
          {!events.some((e) => e.day === i) && <p className="v-week__empty">Sin consultas</p>}
        </section>)}</div>}
        {tab === "Próximas consultas" && (upcoming.length ? <div className="v-events">{upcoming.map((e) => <div key={e.id}><span className="v-day-label">{weekDays[e.day].name} {weekDays[e.day].date}{e.day === todayIndex ? " · Hoy" : ""}</span>{card(e)}</div>)}</div> : <div className="panel"><EmptyState icon="calendar" title="No tenés consultas para mostrar." text="Tus próximas consultas aparecerán acá."/></div>)}
      </div>
      {!forceEmpty && <AvailabilitySummary/>}
    </div>
    {resched && <Modal title="Reprogramar consulta" text={`${getPatient(resched.petId).name} · ${getPatient(resched.petId).tutor}. El cambio se aplicará únicamente en esta vista.`} cancel="Volver" confirm="Confirmar cambio" onClose={() => setResched(null)} onConfirm={() => { setEvents((l) => l.map((e) => e.id === resched.id ? { ...e, day: nd, time: nt, status: "Pendiente" } : e)); notify("Consulta reprogramada en esta vista."); setResched(null); }}>
      <div className="v-modal-fields">
        <label className="v-select"><span>Día</span><select value={nd} onChange={(e) => setNd(Number(e.target.value))}>{weekDays.map((d, i) => <option key={d.short} value={i} disabled={i < todayIndex}>{d.name} {d.date}</option>)}</select></label>
        <label className="v-select"><span>Hora</span><select value={nt} onChange={(e) => setNt(e.target.value)}>{["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
    </Modal>}
    {cancel && <Modal title="¿Querés cancelar esta consulta?" text={`La consulta de ${getPatient(cancel.petId).name} cambiará a Cancelada.`} cancel="Volver" confirm="Confirmar cancelación" destructive onClose={() => setCancel(null)} onConfirm={async () => { const consultId = cancel.consultId; if (consultId) { try { await api.patch(`/api/consultations/${consultId}/cancel`, { reason: "Cancelada desde la agenda" }); } catch (err) { console.warn("Backend cancel notice:", err); } } setEvents((l) => l.map((e) => e.id === cancel.id ? { ...e, status: "Cancelada" } : e)); notify("Consulta cancelada."); setCancel(null); }}/>}
  </>;
}
