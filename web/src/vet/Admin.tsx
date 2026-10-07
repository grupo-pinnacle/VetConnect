import { useState } from "react";
import { Button, EmptyState, Field, Icon, PageHeader, Status, go } from "../shared";
import { availability, getPatient, type FollowUp } from "./data";
import { ConsultStatus, PetPhoto, Sheet, useVet } from "./vetkit";

export function FollowUpsPage() {
  const { followUps, setFollowUps, notify } = useVet();
  const [open, setOpen] = useState<FollowUp | null>(null);
  const rank = { Atrasado: 0, Pendiente: 1, Programado: 2, Realizado: 3 } as const;
  const list = [...followUps].sort((a, b) => rank[a.status] - rank[b.status]);
  const pending = list.filter((f) => f.status !== "Realizado");
  const done = list.filter((f) => f.status === "Realizado");
  const card = (f: FollowUp) => { const p = getPatient(f.petId); return <article role="listitem" className={`v-row v-row--fu v-row--${f.status.toLowerCase()}`} key={f.id}>
    <PetPhoto pet={p} size={48}/>
    <div className="v-row__main"><h3>{p.name} <small>{p.kind}</small></h3><p>{f.title}</p><small>Tutor: {p.tutor}</small></div>
    <div className="v-fu-when"><span className="v-label">Próximo seguimiento</span><b><Icon name={f.status === "Atrasado" ? "alert" : "clock"} size={14}/>{f.when}</b></div>
    <ConsultStatus status={f.status}/>
    <Button variant={f.status === "Atrasado" ? "primary" : "secondary"} onClick={() => setOpen(f)}>Abrir seguimiento</Button>
  </article>; };
  return <>
    <PageHeader eyebrow="Continuidad del cuidado" title="Seguimientos" description="Pacientes que necesitan control luego de una consulta."/>
    {pending.length === 0 ? <div className="panel"><EmptyState icon="check" title="Todos los seguimientos están al día." text="Cuando programes un nuevo control, lo vas a ver acá."/></div> : <div className="v-rows" role="list" aria-label="Seguimientos pendientes">{pending.map(card)}</div>}
    {done.length > 0 && <><div className="v-head"><h2>Realizados</h2></div><div className="v-rows" role="list">{done.map(card)}</div></>}
    {open && (() => { const p = getPatient(open.petId); return <Sheet eyebrow="Seguimiento" title={`${p.name} · ${open.title}`} onClose={() => setOpen(null)} footer={<>
      <Button variant="secondary" icon="message" onClick={() => go("/vet/messages")}>Enviar mensaje</Button>
      <Button disabled={open.status === "Realizado"} icon="check" onClick={() => { setFollowUps((l) => l.map((x) => x.id === open.id ? { ...x, status: "Realizado" } : x)); notify(`Seguimiento de ${p.name} marcado como realizado`); setOpen(null); }}>Marcar como realizado</Button></>}>
      <div className="v-sheet__who"><PetPhoto pet={p} size={56}/><div><b>{p.name}</b><span>{p.kind} · {p.breed}</span><small>Tutor: {p.tutor} · {p.tutorPhone}</small></div></div>
      <dl className="v-kv v-kv--stack"><div><dt>Próximo seguimiento</dt><dd>{open.when}</dd></div><div><dt>Estado</dt><dd><ConsultStatus status={open.status}/></dd></div><div><dt>Qué revisar</dt><dd>{open.note}</dd></div><div><dt>Última evolución</dt><dd>{p.evolution[0].date} · {p.evolution[0].text}</dd></div></dl>
      <Button variant="soft" icon="file" onClick={() => go(`/vet/patients/${p.id}`)}>Abrir ficha clínica</Button>
    </Sheet>; })()}
  </>;
}

const specialties = ["Clínica general", "Animales de compañía", "Dermatología", "Exóticos"];

export function ProfilePage() {
  const { notify } = useVet();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("Veterinario con 9 años de experiencia en atención de animales de compañía. Atiendo perros, gatos y animales exóticos con un enfoque en seguimiento a distancia y comunicación clara con los tutores.");
  return <>
    <PageHeader eyebrow="Perfil profesional" title="Mi perfil profesional" description="Así te ven los tutores cuando se conectan con vos." action={editing
      ? <div className="v-inline-actions"><Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button><Button icon="check" onClick={() => { setEditing(false); notify("Perfil actualizado"); }}>Guardar cambios</Button></div>
      : <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>Editar perfil</Button>}/>
    <div className="v-modes" role="status"><span className="v-chip">{editing ? "Modo edición" : "Modo visualización"}</span></div>
    <div className="profile-grid v-profile">
      <section className="panel profile-card"><div className="profile-avatar">SM</div><h2>Dr. Santiago Mendoza</h2><p>Clínica general · Animales de compañía</p><Status>Matrícula MP 12.884</Status>{editing && <Button variant="soft" icon="image" onClick={() => notify("Carga de foto disponible en la versión conectada")}>Cambiar fotografía</Button>}
        <div className="v-chips">{specialties.map((s) => <span className="v-chip" key={s}>{s}</span>)}</div></section>
      <div className="v-stack">
        <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Datos profesionales</span><h2>Información</h2></div></div>
          <div className="form-grid"><Field label="Nombre" value="Santiago Mendoza" editing={editing}/><Field label="Matrícula" value="MP 12.884" editing={false}/><Field label="Experiencia" value="9 años" editing={editing}/><Field label="Especialidades" value={specialties.slice(0, 3).join(", ")} editing={editing}/></div>
          <label className="v-field v-field--wide v-mt"><span>Descripción</span>{editing ? <textarea className="v-textarea" rows={4} value={bio} onChange={(e) => setBio(e.target.value)}/> : <p className="v-bio">{bio}</p>}</label></section>
        <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Para los tutores</span><h2>Contacto profesional</h2></div></div><div className="form-grid"><Field label="Email profesional" value="s.mendoza@vetconnect.ejemplo" editing={editing}/><Field label="Teléfono" value="+54 11 5555 0100" editing={editing}/></div></section>
        <section className="panel v-availability"><div className="panel__heading"><div><span className="eyebrow">Horarios</span><h2>Disponibilidad</h2></div><Button variant="soft" onClick={() => go("/vet/appointments")}>Editar en agenda</Button></div><ul>{availability.map((r) => <li key={r.day}><b>{r.day}</b><span className={r.hours === "No disponible" ? "is-off" : ""}>{r.hours}</span></li>)}</ul></section>
      </div>
    </div>
  </>;
}

export function SettingsPage() {
  const [t, setT] = useState([true, true, true, false]);
  const items = [["Nuevos pacientes en espera", "Aviso cuando un tutor solicite atención."], ["Casos críticos", "Aviso destacado ante casos de nivel crítico."], ["Mensajes de tutores", "Cuando recibas un mensaje nuevo."], ["Recordatorios de agenda", "Aviso antes de cada consulta programada."]];
  return <>
    <PageHeader eyebrow="Administración" title="Configuración" description="Preferencias de cuenta y notificaciones profesionales."/>
    <div className="settings-layout">
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Avisos</span><h2>Notificaciones</h2></div></div>
        {items.map((it, i) => <div className="setting-row" key={it[0]}><div><strong>{it[0]}</strong><p>{it[1]}</p></div><button role="switch" aria-checked={t[i]} aria-label={it[0]} className={`switch ${t[i] ? "is-on" : ""}`} onClick={() => setT(t.map((v, j) => j === i ? !v : v))}><span/></button></div>)}</section>
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Cuenta</span><h2>Privacidad y acceso</h2></div></div>
        <div className="setting-row"><div><strong>Zona horaria</strong><p>Argentina (GMT-3)</p></div></div>
        <button className="settings-link"><span><Icon name="shield"/><span><strong>Cambiar contraseña</strong><small>Actualizá tu clave de acceso.</small></span></span><Icon name="chevron"/></button>
        <button className="settings-link"><span><Icon name="file"/><span><strong>Privacidad</strong><small>Cómo se cuidan los datos clínicos.</small></span></span><Icon name="chevron"/></button></section>
    </div>
  </>;
}
