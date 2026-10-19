import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import "./vet.css";
import { Button, EmptyState, Icon, Logo, PageHeader, go, type IconName } from "../shared";
import { getPatient, triageMeta, type QueueItem, type Triage } from "./data";
import { ConsultStatus, PetPhoto, Sheet, TriageBadge, VetProvider, WaitTimer, useVet, type Avail } from "./vetkit";
import { ConsultationDetail, ConsultationsPage } from "./Consultations";
import { PatientDetail, PatientsPage } from "./Patients";
import { AppointmentsPage, AvailabilityPage } from "./Agenda";
import { MessagesPage } from "./Messages";
import { NewPrescription, PrescriptionDetail, PrescriptionsPage } from "./Prescriptions";
import { FollowUpsPage, ProfilePage, SettingsPage } from "./Admin";

const clinical: { label: string; path: string; icon: IconName }[] = [
  { label: "Inicio", path: "/vet/dashboard", icon: "home" },
  { label: "Cola de atención", path: "/vet/queue", icon: "users" },
  { label: "Consultas", path: "/vet/consultations", icon: "video" },
  { label: "Pacientes", path: "/vet/patients", icon: "paw" },
  { label: "Agenda", path: "/vet/appointments", icon: "calendar" },
  { label: "Mensajes", path: "/vet/messages", icon: "message" },
  { label: "Recetas", path: "/vet/prescriptions", icon: "file" },
  { label: "Seguimientos", path: "/vet/follow-ups", icon: "repeat" },
];
const admin: typeof clinical = [
  { label: "Mi perfil profesional", path: "/vet/profile", icon: "user" },
  { label: "Disponibilidad", path: "/vet/availability", icon: "clock" },
  { label: "Configuración", path: "/vet/settings", icon: "settings" },
];

const availOptions: { value: Avail; icon: IconName; text: string }[] = [
  { value: "Disponible", icon: "check", text: "Recibís nuevas solicitudes de pacientes." },
  { value: "En consulta", icon: "video", text: "Estás atendiendo. Las solicitudes quedan en espera." },
  { value: "No disponible", icon: "close", text: "No recibís nuevas solicitudes." },
];
const availSlug = (a: Avail) => (a === "Disponible" ? "on" : a === "En consulta" ? "busy" : "off");

function AvailabilityControl() {
  const { avail, requestAvail } = useVet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const current = availOptions.find((o) => o.value === avail)!;
  return <div className="v-avail" ref={ref}>
    <button className={`v-avail__btn v-avail--${availSlug(avail)}`} onClick={() => setOpen(!open)} aria-haspopup="true" aria-expanded={open}>
      <span className="v-avail__dot"><Icon name={current.icon} size={11}/></span>
      <span><small>Mi estado</small><b>{avail}</b></span>
      <Icon name="chevron" size={14}/>
    </button>
    {open && <>
      <button className="v-avail__scrim" aria-label="Cerrar" onClick={() => setOpen(false)}/>
      <div className="v-avail__pop" role="radiogroup" aria-label="Estado de disponibilidad">
        <span className="v-avail__grip" aria-hidden="true"/>
        <span className="eyebrow">Estado profesional</span>
        {availOptions.map((o) => <button key={o.value} role="radio" aria-checked={avail === o.value} className={`v-avail__opt v-avail--${availSlug(o.value)} ${avail === o.value ? "is-selected" : ""}`} onClick={() => { requestAvail(o.value); setOpen(false); }}>
          <span className="v-avail__dot"><Icon name={o.icon} size={12}/></span><span><b>{o.value}</b><small>{o.text}</small></span>{avail === o.value && <Icon name="check" size={16}/>}
        </button>)}
      </div>
    </>}
  </div>;
}

function NotificationsPop() {
  const { queue } = useVet();
  const [open, setOpen] = useState(false);
  const items: [IconName, string, string][] = queue.map((q): [IconName, string, string] => [
    q.triage === "Crítico" ? "alert" : "calendar",
    `Caso en espera: ${getPatient(q.petId).name} (${q.triage})`,
    "En sala de espera",
  ]);

  return <div className="v-notif">
    <button className={`icon-button ${items.length > 0 ? "has-dot" : ""}`} onClick={() => setOpen(!open)} aria-label="Notificaciones" aria-expanded={open}><Icon name="bell"/></button>
    {open && <><button className="v-avail__scrim" aria-label="Cerrar" onClick={() => setOpen(false)}/><div className="v-avail__pop v-notif__pop"><span className="v-avail__grip" aria-hidden="true"/><span className="eyebrow">Notificaciones</span>{items.length === 0 ? <div style={{ padding: "14px 16px", color: "var(--ink-soft)", fontSize: 13 }}>No tenés notificaciones pendientes.</div> : items.map((n) => <div key={n[1]} className="v-notif__item"><Icon name={n[0]} size={18}/><div><b>{n[1]}</b><small>{n[2]}</small></div></div>)}</div></>}
  </div>;
}

function VetShell({ path, children }: { path: string; children: ReactNode }) {
  const { queue, unread, followUps } = useVet();
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "VC" : "VC";
  const displayName = user ? `Dr. ${user.firstName || ""} ${user.lastName || ""}`.trim() : "Profesional Veterinario";
  const sub = user?.licenseNumber ? `Clínica general · MP ${user.licenseNumber}` : (user?.role === "VET" ? "Clínica general" : "Veterinario");
  const shortName = user?.lastName ? `Dr. ${user.lastName}` : (user?.firstName ? `Dr. ${user.firstName}` : "Profesional");
  const now = new Date();
  const dateName = now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const topDate = `${dateName.charAt(0).toUpperCase() + dateName.slice(1)} · ${now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;

  const late = followUps.filter((f) => f.status === "Atrasado" || f.status === "Pendiente").length;
  const badge = (p: string) => p === "/vet/queue" ? queue.length : p === "/vet/messages" ? unread : p === "/vet/follow-ups" ? late : 0;
  const active = (p: string) => path.startsWith(p) || (p === "/vet/dashboard" && path === "/vet");
  const item = (n: typeof clinical[number]) => { const b = badge(n.path); return <button key={n.path} className={`nav-item ${active(n.path) ? "is-active" : ""}`} aria-current={active(n.path) ? "page" : undefined} onClick={() => { go(n.path); setMenu(false); }}><Icon name={n.icon}/><span>{n.label}</span>{b > 0 && <small aria-label={`${b} pendientes`}>{b}</small>}</button>; };
  const mobile = [clinical[0], clinical[1], clinical[2], clinical[5], clinical[4]];
  return <div className="app-shell v-shell">
    <aside className={`sidebar ${menu ? "is-open" : ""}`}>
      <div className="sidebar__head"><Logo to="/vet/dashboard"/><Button variant="icon" icon="close" onClick={() => setMenu(false)} ariaLabel="Cerrar menú" className="sidebar__close"/></div>
      <div className="sidebar__profile"><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>{sub}</span></div></div>
      <nav className="sidebar__nav" aria-label="Navegación clínica">
        <span className="v-nav-label">Acciones clínicas</span>
        {clinical.map(item)}
        <span className="v-nav-label v-nav-label--admin">Administración</span>
        {admin.map(item)}
      </nav>
      {user ? (
        <button className="nav-item" style={{ marginTop: 8, color: "var(--red, #ef4444)" }} onClick={() => logout().then(() => { window.location.href = "/login"; })}>
          <Icon name="close"/><span>Cerrar sesión</span>
        </button>
      ) : (
        <button className="nav-item" style={{ marginTop: 8, color: "var(--teal, #0d9488)" }} onClick={() => { window.location.href = "/login"; }}>
          <Icon name="user"/><span>Iniciar sesión</span>
        </button>
      )}
    </aside>
    {menu && <button className="scrim" onClick={() => setMenu(false)} aria-label="Cerrar menú"/>}
    <div className="app-main">
      <header className="topbar v-topbar">
        <div className="topbar__mobile"><Button variant="icon" icon="menu" onClick={() => setMenu(true)} ariaLabel="Abrir menú"/><Logo to="/vet/dashboard"/></div>
        <div className="v-topbar__pro"><b>Consola profesional</b><span>{topDate}</span></div>
        <div className="topbar__spacer"/>
        <AvailabilityControl/>
        <NotificationsPop/>
        <button className="icon-button v-topbar__msgs" onClick={() => go("/vet/messages")} aria-label={`Mensajes${unread ? `, ${unread} sin leer` : ""}`}><Icon name="message"/>{unread > 0 && <b className="v-count">{unread}</b>}</button>
        <div className="user-menu-wrapper">
          <button
            className="user-menu"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-label="Mi perfil profesional"
          >
            <span className="avatar avatar--small">{initials}</span>
            <span>{shortName}</span>
            <Icon name="chevron" size={15}/>
          </button>
          {userMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="user-menu-dropdown">
                <div className="user-menu-dropdown__header">
                  <strong>{displayName}</strong>
                  <span>{user?.email || "Veterinario"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    go("/vet/profile");
                  }}
                >
                  <Icon name="user"/>
                  <span>Mi perfil profesional</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    go("/vet/dashboard");
                  }}
                >
                  <Icon name="calendar"/>
                  <span>Consola clínica</span>
                </button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout().then(() => {
                      window.location.href = "/login";
                    });
                  }}
                >
                  <Icon name="close"/>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="content content--wide">{children}</main>
    </div>
    <nav className="mobile-nav" aria-label="Navegación móvil">
      {mobile.map((n) => { const b = badge(n.path); return <button key={n.path} className={active(n.path) ? "is-active" : ""} aria-current={active(n.path) ? "page" : undefined} onClick={() => go(n.path)}><Icon name={n.icon}/><span>{n.label === "Cola de atención" ? "Cola" : n.label}</span>{b > 0 && <small>{b}</small>}</button>; })}
    </nav>
  </div>;
}

export function QueueRow({ item }: { item: QueueItem }) {
  const { accept, avail } = useVet();
  const pet = getPatient(item.petId);
  const blocked = avail === "No disponible";
  const [reviewing, setReviewing] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const confirm = async () => {
    setAccepting(true);
    try {
      await accept(item.id);
    } finally {
      setAccepting(false);
    }
  };
  return <article className={`v-queue-row v-queue-row--${triageSlug(item.triage)} ${reviewing ? "is-selected" : ""}`}>
    <PetPhoto pet={pet} size={52}/>
    <div className="v-queue-row__main">
      <div className="v-queue-row__name"><h3>{pet.name}</h3><span>{pet.kind} · {pet.breed}</span></div>
      <p className="v-queue-row__reason"><b>Motivo:</b> {item.reason}</p>
      <p className="v-queue-row__tutor">Tutor: {pet.tutor} · Solicitó a las {item.requested}</p>
    </div>
    <div className="v-queue-row__triage"><span className="v-label">Triage</span><TriageBadge level={item.triage}/><small>{triageMeta[item.triage].hint}</small></div>
    <div className="v-queue-row__wait"><span className="v-label">Espera</span><WaitTimer base={item.wait}/></div>
    <div className="v-queue-row__cta">
      <Button onClick={() => setReviewing(true)} disabled={blocked}>Revisar solicitud</Button>
      {blocked && <small>Pasá a Disponible para aceptar.</small>}
    </div>
    {reviewing && <Sheet eyebrow="Solicitud en revisión" title={`${pet.name} · ${item.reason}`} onClose={() => setReviewing(false)} footer={<>
      <Button variant="secondary" onClick={() => setReviewing(false)}>Volver a la cola</Button>
      <Button icon={accepting ? "clock" : "check"} disabled={accepting} onClick={confirm}>{accepting ? "Iniciando consulta…" : "Aceptar consulta"}</Button>
    </>}>
      <div className="v-sheet__who"><PetPhoto pet={pet} size={56}/><div><b>{pet.name}</b><span>{pet.kind} · {pet.breed}</span><small>Tutor: {pet.tutor} · {pet.tutorPhone}</small></div></div>
      <div className="v-review-priority"><span className="v-label">Prioridad informada</span><TriageBadge level={item.triage}/><p>{triageMeta[item.triage].hint}. La prioridad es un dato de demostración y no reemplaza la evaluación profesional.</p></div>
      <dl className="v-kv v-kv--stack">
        <div><dt>Motivo informado</dt><dd>{item.reason}</dd></div>
        <div><dt>Contexto enviado por el tutor</dt><dd>{item.note}</dd></div>
        <div><dt>Solicitud</dt><dd>{item.requested} · <WaitTimer base={item.wait}/></dd></div>
        <div><dt>Alergias registradas</dt><dd>{pet.allergies.join(" · ")}</dd></div>
        <div><dt>Medicación actual</dt><dd>{pet.meds.join(" · ")}</dd></div>
        <div><dt>Antecedentes relevantes</dt><dd>{pet.history.join(" · ")}</dd></div>
      </dl>
      <Button variant="soft" icon="file" onClick={() => go(`/vet/patients/${pet.id}`)}>Abrir ficha clínica completa</Button>
    </Sheet>}
  </article>;
}
const triageSlug = (t: Triage) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function sortedQueue(q: QueueItem[]) {
  return [...q].sort((a, b) => triageMeta[a.triage].rank - triageMeta[b.triage].rank || b.wait - a.wait);
}

function QueueList() {
  const { queue } = useVet();
  if (!queue.length) return <div className="panel"><EmptyState icon="users" title="No hay pacientes en espera" text="Cuando un tutor solicite atención, vas a verlo acá ordenado por prioridad."/></div>;
  return <div className="v-queue" role="list" aria-label="Pacientes en espera, ordenados por prioridad">{sortedQueue(queue).map((q) => <div role="listitem" key={q.id}><QueueRow item={q}/></div>)}</div>;
}

function Dashboard() {
  const { avail, requestAvail, queue, consults, unread, threads } = useVet();
  const today = consults.filter((c) => c.day === "Hoy");
  const next = consults.filter((c) => c.day === "Hoy" && c.status === "Próxima").sort((a, b) => a.time.localeCompare(b.time))[0];
  const done = today.filter((c) => c.status === "Finalizada").length;
  const active = consults.filter((c) => c.status === "Activa");
  const critical = queue.filter((q) => q.triage === "Crítico").length;
  const upcoming = consults.filter((c) => c.day === "Hoy" && c.status === "Próxima").sort((a, b) => a.time.localeCompare(b.time));
  const heading = avail === "Disponible" ? "Disponible para consultas" : avail === "En consulta" ? "En consulta" : "No disponible para consultas";
  const metrics: { label: string; value: string; sub: string; icon: IconName; to: string; alert?: boolean }[] = [
    { label: "Consultas de hoy", value: String(today.length), sub: `${active.length} activa${active.length === 1 ? "" : "s"}`, icon: "video", to: "/vet/consultations" },
    { label: "En espera", value: String(queue.length), sub: critical ? `${critical} crítico` : "Sin casos críticos", icon: critical ? "alert" : "users", to: "/vet/queue", alert: critical > 0 },
    { label: "Próxima consulta", value: next?.time ?? "—", sub: next ? getPatient(next.petId).name : "Sin próximas", icon: "clock", to: "/vet/appointments" },
    { label: "Finalizadas", value: String(done), sub: "hoy", icon: "check", to: "/vet/consultations" },
    { label: "Mensajes pendientes", value: String(unread), sub: unread ? `${threads.filter((t) => t.unread).length} conversaciones` : "Al día", icon: "message", to: "/vet/messages" },
  ];
  const { user } = useAuth();
  const vetName = user ? (user.lastName ? `Dr. ${user.firstName} ${user.lastName}` : `Dr. ${user.firstName}`) : "Colega";
  const nowStr = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  return <>
    <PageHeader eyebrow={nowStr.charAt(0).toUpperCase() + nowStr.slice(1)} title={`Hola, ${vetName}`} description="Esto es lo que necesita tu atención ahora."/>
    <section className={`v-status-card v-avail--${availSlug(avail)}`} aria-labelledby="avail-title">
      <div className="v-status-card__text"><span className="v-avail__dot v-avail__dot--lg"><Icon name={availOptions.find((o) => o.value === avail)!.icon} size={18}/></span><div><span className="eyebrow">Mi estado profesional</span><h2 id="avail-title">{heading}</h2><p>{availOptions.find((o) => o.value === avail)!.text}</p></div></div>
      <div className="v-segment" role="radiogroup" aria-label="Cambiar estado">
        {availOptions.map((o) => <button key={o.value} role="radio" aria-checked={avail === o.value} className={avail === o.value ? "is-selected" : ""} onClick={() => requestAvail(o.value)}>{avail === o.value && <Icon name="check" size={14}/>}{o.value}</button>)}
      </div>
    </section>
    <section className="v-metrics" aria-label="Resumen del día">
      {metrics.map((m) => <button key={m.label} className={`v-metric ${m.alert ? "v-metric--alert" : ""}`} onClick={() => go(m.to)}><span className="v-metric__icon"><Icon name={m.icon} size={17}/></span><span className="v-metric__value">{m.value}</span><span className="v-metric__label">{m.label}</span><small>{m.sub}</small></button>)}
    </section>
    <div className="v-dash">
      <section className="v-dash__active" aria-labelledby="active-h">
        <div className="v-head"><h2 id="active-h">Consultas activas</h2></div>
        {active.length ? active.map((c) => { const p = getPatient(c.petId); return <article className="v-active" key={c.id}>
          <PetPhoto pet={p} size={48}/><div><h3>{p.name} <ConsultStatus status="Activa"/></h3><p>{c.reason} · {c.mode} desde las {c.time}</p><small>Tutor: {p.tutor}</small></div>
          <div className="v-active__actions"><Button onClick={() => go(`/vet/consultations/${c.id}`)}>Abrir consulta</Button>{c.mode === "Videoconsulta" && <Button variant="secondary" icon="video" onClick={() => go(`/call/${c.id}`)}>Videollamada</Button>}</div>
        </article>; }) : <div className="panel v-mini-empty"><Icon name="video" size={20}/><p>No tenés consultas activas. Aceptá un paciente de la cola para comenzar.</p></div>}
      </section>
      <section className="v-dash__queue" aria-labelledby="queue-h">
        <div className="v-head"><div><span className="eyebrow">Atender ahora</span><h2 id="queue-h">Pacientes en espera</h2></div><button onClick={() => go("/vet/queue")}>Ver cola completa <Icon name="arrow" size={15}/></button></div>
        <QueueList/>
      </section>
      <section className="v-dash__msgs" aria-labelledby="msgs-h">
        <div className="v-head"><h2 id="msgs-h">Mensajes sin leer</h2><button onClick={() => go("/vet/messages")}>Abrir <Icon name="arrow" size={15}/></button></div>
        <div className="panel v-list">{threads.filter((t) => t.unread).length ? threads.filter((t) => t.unread).map((t) => { const p = getPatient(t.petId); return <button key={t.id} onClick={() => go("/vet/messages")}><PetPhoto pet={p} size={34}/><span><b>{p.tutor} · {p.name}</b><small>{t.last}</small></span><em className="unread">{t.unread}</em></button>; }) : <p className="v-mini-empty">No tenés conversaciones pendientes.</p>}</div>
      </section>
      <section className="v-dash__agenda" aria-labelledby="ag-h">
        <div className="v-head"><h2 id="ag-h">Próximas hoy</h2><button onClick={() => go("/vet/appointments")}>Agenda <Icon name="arrow" size={15}/></button></div>
        <div className="panel v-list">{upcoming.length ? upcoming.map((c) => { const p = getPatient(c.petId); return <button key={c.id} onClick={() => go(`/vet/consultations/${c.id}`)}><b className="v-list__time">{c.time}</b><span><b>{p.name} · {p.tutor}</b><small>{c.reason}</small></span><Icon name="chevron" size={15}/></button>; }) : <p className="v-mini-empty">No tenés más consultas hoy.</p>}</div>
      </section>
    </div>
  </>;
}

function QueuePage() {
  const { avail, requestAvail } = useVet();
  return <>
    <PageHeader eyebrow="Atender ahora" title="Cola de atención" description="Pacientes ordenados por prioridad clínica y luego por tiempo de espera."/>
    {avail === "No disponible" && <div className="v-notice" role="status"><Icon name="alert" size={20}/><div><b>Estás en estado No disponible.</b><p>No podés aceptar consultas hasta que cambies tu estado.</p></div><Button variant="secondary" onClick={() => requestAvail("Disponible")}>Pasar a Disponible</Button></div>}
    <ul className="v-legend" aria-label="Niveles de triage">
      {(Object.keys(triageMeta) as Triage[]).map((t) => <li key={t}><TriageBadge level={t} compact/><span>{triageMeta[t].hint}</span></li>)}
    </ul>
    <QueueList/>
  </>;
}

function Loading() {
  return <div className="skeleton-page" aria-busy="true" aria-live="polite"><span className="sr-only">Cargando contenido</span><div className="skeleton skeleton--eyebrow"/><div className="skeleton skeleton--title"/><div className="skeleton skeleton--subtitle"/><div className="v-metrics">{[0, 1, 2, 3, 4].map((i) => <div className="skeleton v-skel-metric" key={i}/>)}</div><div className="skeleton-grid"><div className="skeleton skeleton--card"/><div className="skeleton skeleton--card"/><div className="skeleton skeleton--card"/></div></div>;
}

function Router({ path }: { path: string }) {
  const seg = path.split("/").filter(Boolean);
  const [, section, id] = seg;
  switch (section) {
    case undefined: case "dashboard": return <Dashboard/>;
    case "queue": return <QueuePage/>;
    case "consultations": return id ? <ConsultationDetail id={id}/> : <ConsultationsPage/>;
    case "patients": return id ? <PatientDetail id={id}/> : <PatientsPage/>;
    case "appointments": return <AppointmentsPage/>;
    case "availability": return <AvailabilityPage/>;
    case "messages": return <MessagesPage/>;
    case "prescriptions": return id === "new" ? <NewPrescription/> : id ? <PrescriptionDetail id={id}/> : <PrescriptionsPage/>;
    case "follow-ups": return <FollowUpsPage/>;
    case "profile": return <ProfilePage/>;
    case "settings": return <SettingsPage/>;
    default: return <div className="panel"><EmptyState icon="paw" title="No encontramos esta página" text="Volvé a la consola para seguir con tu trabajo clínico."/><div className="v-retry"><Button onClick={() => go("/vet/dashboard")}>Ir al inicio</Button></div></div>;
  }
}

export default function VetApp({ path }: { path: string }) {
  const { user } = useAuth();
  useEffect(() => {
    if (user && user.role === "CLIENT") {
      go("/client/dashboard");
    }
  }, [user]);
  const state = new URLSearchParams(window.location.search).get("state");
  return <VetProvider forceEmpty={state === "empty"} key={state ?? "ok"}>
    <VetShell path={path}>
      {state === "loading" ? <Loading/> : state === "error" ? <div className="panel"><EmptyState icon="alert" title="No pudimos cargar esta información" text="Revisá tu conexión e intentá nuevamente."/><div className="v-retry"><Button variant="secondary" onClick={() => go(path)}>Reintentar</Button></div></div> : <Router path={path}/>}
    </VetShell>
  </VetProvider>;
}
