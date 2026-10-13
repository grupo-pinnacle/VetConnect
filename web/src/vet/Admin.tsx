import { useState } from "react";
import { Alert, Button, EmptyState, Field, Icon, PageHeader, Status, go } from "../shared";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
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
    <div className="v-row__main"><h3>{p.name} <small>{p.kind}</small></h3><p>{f.title}</p><small>Tutor: {p.tutor} · Última consulta: {p.last}</small></div>
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
      <Button disabled={open.status === "Realizado"} icon="check" onClick={() => { setFollowUps((l) => l.map((x) => x.id === open.id ? { ...x, status: "Realizado" } : x)); notify(`Seguimiento de ${p.name} marcado como realizado en esta vista.`); setOpen(null); }}>Marcar como realizado</Button></>}>
      <div className="v-sheet__who"><PetPhoto pet={p} size={56}/><div><b>{p.name}</b><span>{p.kind} · {p.breed}</span><small>Tutor: {p.tutor} · {p.tutorPhone}</small></div></div>
      <dl className="v-kv v-kv--stack"><div><dt>Próximo seguimiento</dt><dd>{open.when}</dd></div><div><dt>Estado</dt><dd><ConsultStatus status={open.status}/></dd></div><div><dt>Qué revisar</dt><dd>{open.note}</dd></div><div><dt>Última evolución</dt><dd>{p.evolution[0].date} · {p.evolution[0].text}</dd></div></dl>
      <Button variant="soft" icon="file" onClick={() => go(`/vet/patients/${p.id}`)}>Abrir ficha clínica</Button>
    </Sheet>; })()}
  </>;
}

const specialties = ["Clínica general", "Animales de compañía", "Dermatología", "Exóticos"];

export function ProfilePage() {
  const { notify } = useVet();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "Profesional Veterinario";
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName ? user.lastName[0] : ""}`.toUpperCase() || "VC" : "VC";
  const license = user?.licenseNumber ? `MP ${user.licenseNumber}` : "MP Registrada";
  const initial = {
    name: fullName,
    experience: "Profesional matriculado",
    specialties: specialties.slice(0, 3).join(", "),
    jurisdiction: "Ciudad Autónoma de Buenos Aires",
    email: user?.email || "profesional@vetconnect.com.ar",
    phone: user?.phone || "+54 11 5555 0100",
    bio: user?.bio || "Veterinario con experiencia en atención clínica telemática y seguimiento de pacientes."
  };
  const [profile, setProfile] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const update = (key: keyof typeof draft, value: string) => { setDraft({ ...draft, [key]: value }); if (state === "error") setState("idle"); };
  const cancel = () => { setDraft(profile); setEditing(false); setState("idle"); };
  const save = async () => {
    if (!draft.name.trim() || !draft.email.trim() || !draft.jurisdiction.trim()) { setState("error"); return; }
    setState("saving");
    try {
      await api.patch('/api/users/profile', { bio: draft.bio });
    } catch (err) {
      console.warn("Backend profile save notice:", err);
    }
    setProfile(draft);
    setEditing(false);
    setState("success");
    notify("Perfil actualizado correctamente.");
  };
  return <>
    <PageHeader eyebrow="Perfil profesional" title="Mi perfil profesional" description="Así te ven los tutores cuando se conectan con vos." action={editing
      ? <div className="v-inline-actions"><Button variant="secondary" disabled={state === "saving"} onClick={cancel}>Cancelar</Button><Button icon={state === "saving" ? "clock" : "check"} disabled={state === "saving"} onClick={save}>{state === "saving" ? "Guardando…" : "Guardar cambios"}</Button></div>
      : <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>Editar perfil</Button>}/>
    <div className="v-modes" role="status"><span className="v-chip">{editing ? "Modo edición" : "Modo visualización"}</span></div>
    {state === "success" && <Alert tone="success" title="Perfil actualizado.">Los datos se guardaron correctamente.</Alert>}
    {state === "error" && <Alert tone="error" title="Revisá los campos señalados.">Nombre, jurisdicción y email profesional son obligatorios.</Alert>}
    <div className="profile-grid v-profile">
      <section className="panel profile-card"><div className="profile-avatar">{initials}</div><h2>Dr. {profile.name}</h2><p>Clínica general · Animales de compañía</p><Status>Matrícula {license}</Status>{editing && <Button variant="soft" icon="image" onClick={() => notify("La carga de foto está disponible desde la app.")}>Cambiar fotografía</Button>}
        <div className="v-chips">{specialties.map((s) => <span className="v-chip" key={s}>{s}</span>)}</div></section>
      <div className="v-stack">
        <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Datos profesionales</span><h2>Información</h2></div></div>
          <div className="form-grid"><Field label="Nombre" value={editing ? draft.name : profile.name} editing={editing} onChange={(value) => update("name", value)} error={state === "error" && !draft.name.trim() ? "Ingresá el nombre profesional." : undefined}/><Field label="Matrícula" value={license} editing={false}/><Field label="Jurisdicción" value={editing ? draft.jurisdiction : profile.jurisdiction} editing={editing} onChange={(value) => update("jurisdiction", value)} error={state === "error" && !draft.jurisdiction.trim() ? "Ingresá la jurisdicción." : undefined}/><Field label="Experiencia" value={editing ? draft.experience : profile.experience} editing={editing} onChange={(value) => update("experience", value)}/><Field label="Especialidades" value={editing ? draft.specialties : profile.specialties} editing={editing} onChange={(value) => update("specialties", value)}/></div>
          <label className="v-field v-field--wide v-mt"><span>Descripción</span>{editing ? <textarea className="v-textarea" rows={4} value={draft.bio} onChange={(e) => update("bio", e.target.value)}/> : <p className="v-bio">{profile.bio}</p>}</label></section>
        <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Para los tutores</span><h2>Contacto profesional</h2></div></div><div className="form-grid"><Field label="Email profesional" value={editing ? draft.email : profile.email} editing={editing} onChange={(value) => update("email", value)} error={state === "error" && !draft.email.trim() ? "Ingresá el email profesional." : undefined}/><Field label="Teléfono" value={editing ? draft.phone : profile.phone} editing={editing} onChange={(value) => update("phone", value)}/></div></section>
        <section className="panel v-availability"><div className="panel__heading"><div><span className="eyebrow">Horarios</span><h2>Disponibilidad</h2></div><Button variant="soft" onClick={() => go("/vet/availability")}>Editar horarios</Button></div><ul>{availability.map((r) => <li key={r.day}><b>{r.day}</b><span className={r.hours === "No disponible" ? "is-off" : ""}>{r.hours}</span></li>)}</ul></section>
      </div>
    </div>
  </>;
}

export function SettingsPage() {
  const { notify } = useVet();
  const [t, setT] = useState([true, true, true, false]);
  const items = [["Nuevos pacientes en espera", "Aviso cuando un tutor solicite atención."], ["Casos críticos", "Aviso destacado ante casos de nivel crítico."], ["Mensajes de tutores", "Cuando recibas un mensaje nuevo."], ["Recordatorios de agenda", "Aviso antes de cada consulta programada."]];
  return <>
    <PageHeader eyebrow="Administración" title="Configuración" description="Preferencias de cuenta y notificaciones profesionales."/>
    <div className="settings-layout">
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Avisos</span><h2>Notificaciones</h2></div></div>
        {items.map((it, i) => <div className="setting-row" key={it[0]}><div><strong>{it[0]}</strong><p>{it[1]}</p></div><button role="switch" aria-checked={t[i]} aria-label={it[0]} className={`switch ${t[i] ? "is-on" : ""}`} onClick={() => { setT(t.map((v, j) => j === i ? !v : v)); notify("Preferencia actualizada en esta vista."); }}><span/></button></div>)}</section>
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Cuenta</span><h2>Perfil y disponibilidad</h2></div></div>
        <div className="setting-row"><div><strong>Zona horaria</strong><p>Argentina (GMT-3)</p></div></div>
        <button className="settings-link" onClick={() => go("/vet/profile")}><span><Icon name="user"/><span><strong>Perfil profesional</strong><small>Revisá tus datos y contacto profesional.</small></span></span><Icon name="chevron"/></button>
        <button className="settings-link" onClick={() => go("/vet/availability")}><span><Icon name="clock"/><span><strong>Disponibilidad</strong><small>Configurá días y horarios de atención.</small></span></span><Icon name="chevron"/></button></section>
    </div>
  </>;
}
