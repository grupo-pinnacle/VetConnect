import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, EmptyState, Field, Icon, Logo, MessageBubble, Modal, PageHeader, Status, Tabs, Toast, go, photos, type IconName, type MessageState } from "../shared";
import { useAuth } from "../context/AuthContext";
const VetApp = lazy(() => import("../vet/VetApp"));
const CallRoom = lazy(() => import("../vet/CallRoom"));

const routes = [
  { label: "Inicio", path: "/client/dashboard", icon: "home" as IconName },
  { label: "Mis mascotas", path: "/client/pets", icon: "paw" as IconName },
  { label: "Mis consultas", path: "/client/consultations", icon: "video" as IconName },
  { label: "Agenda", path: "/client/appointments", icon: "calendar" as IconName },
  { label: "Mensajes", path: "/client/messages", icon: "message" as IconName, badge: "2" },
  { label: "Recetas", path: "/client/prescriptions", icon: "file" as IconName },
  { label: "Notificaciones", path: "/client/notifications", icon: "bell" as IconName, badge: "4" },
  { label: "Mi perfil", path: "/client/profile", icon: "user" as IconName },
];

const mobileRoutes = [
  routes[0],
  routes[1],
  { label: "Atención", path: "/client/triage", icon: "heart" as IconName },
  routes[4],
  routes[6],
];


const pets = [
  { id: "milo", name: "Milo", kind: "Perro", breed: "Golden Retriever", age: "8 años", weight: "29 kg", state: "Controles al día", last: "12 Jun 2025", next: "Hoy · 19:30", photo: photos.milo },
  { id: "luna", name: "Luna", kind: "Coneja", breed: "Enana", age: "3 años", weight: "1,7 kg", state: "En seguimiento", last: "28 May 2025", next: "Sin turno próximo", photo: photos.luna },
  { id: "nube", name: "Nube", kind: "Gato", breed: "Mestizo", age: "5 años", weight: "4,3 kg", state: "Controles al día", last: "03 Abr 2025", next: "18 Jul · 10:00", photo: photos.nube },
  { id: "kiwi", name: "Kiwi", kind: "Ave", breed: "Cotorra argentina", age: "2 años", weight: "110 g", state: "Control pendiente", last: "10 Ene 2025", next: "Sin turno próximo", photo: photos.kiwi },
  { id: "toby", name: "Toby", kind: "Hurón", breed: "Sable", age: "4 años", weight: "1,2 kg", state: "Controles al día", last: "20 May 2025", next: "02 Ago · 16:30", photo: photos.toby },
];

const consultations = [
  { id: "seguimiento-milo", title: "Consulta de seguimiento", vet: "Dr. Santiago Mendoza", pet: "Milo", date: "Hoy", time: "19:30", reason: "Seguimiento dermatológico", status: "Confirmada", mode: "Videoconsulta" },
  { id: "luna-nutricion", title: "Control nutricional", vet: "Dra. Camila López", pet: "Luna", date: "18 Jul", time: "10:00", reason: "Control de alimentación", status: "Pendiente", mode: "Videoconsulta" },
  { id: "nube-control", title: "Control clínico", vet: "Dr. Santiago Mendoza", pet: "Nube", date: "03 Abr", time: "17:15", reason: "Control anual", status: "Finalizada", mode: "Videoconsulta" },
];


function AppShell({ children, path }: { children: ReactNode; path: string }) {
  const [menu, setMenu] = useState(false);
  const { user, logout } = useAuth();
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Mariana López" : "Mariana López";
  const firstName = user?.firstName || "Mariana";
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "ML" : "ML";
  const roleName = user?.role === "VET" ? "Veterinario" : user?.role === "ADMIN" ? "Administrador" : "Tutora";

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? "is-open" : ""}`}>
      <div className="sidebar__head"><Logo/><Button variant="icon" icon="close" onClick={() => setMenu(false)} ariaLabel="Cerrar menú" className="sidebar__close"/></div>
      <div className="sidebar__profile"><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>{roleName}</span></div></div>
      <nav className="sidebar__nav" aria-label="Navegación principal">
        {routes.map((item) => <button key={item.path} className={`nav-item ${path.startsWith(item.path) ? "is-active" : ""}`} onClick={() => { go(item.path); setMenu(false); }}><Icon name={item.icon}/><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}</button>)}
      </nav>
      <div className="sidebar__support"><span className="eyebrow">¿Necesitás ayuda?</span><strong>Estamos para acompañarte.</strong><button onClick={() => go("/client/triage")}>Necesito atención <Icon name="arrow" size={16}/></button></div>
      <button className={`nav-item ${path === "/client/settings" ? "is-active" : ""}`} onClick={() => go("/client/settings")}><Icon name="settings"/><span>Configuración</span></button>
      {user && <button className="nav-item" style={{ marginTop: 8 }} onClick={() => logout().then(() => { window.location.href = "/"; })}><Icon name="close"/><span>Cerrar sesión</span></button>}
    </aside>
    {menu && <button className="scrim" onClick={() => setMenu(false)} aria-label="Cerrar menú"/>}
    <div className="app-main">
      <header className="topbar">
        <div className="topbar__mobile"><Button variant="icon" icon="menu" onClick={() => setMenu(true)} ariaLabel="Abrir menú"/><Logo/></div>
        <div className="topbar__spacer"/>
        <button className="topbar__help" onClick={() => go("/client/triage")}><Icon name="heart" size={18}/> Necesito atención</button>
        <button className="icon-button has-dot" onClick={() => go("/client/notifications")} aria-label="Ver notificaciones"><Icon name="bell"/></button>
        <button className="user-menu" onClick={() => go("/client/profile")}><span className="avatar avatar--small">{initials}</span><span>{firstName}</span><Icon name="chevron" size={15}/></button>
      </header>
      <main className="content">{children}</main>
    </div>
    <nav className="mobile-nav" aria-label="Navegación móvil">
      {mobileRoutes.map((item) => <button key={item.path} className={`${path.startsWith(item.path) ? "is-active" : ""} ${item.path === "/client/triage" ? "is-priority" : ""}`} onClick={() => go(item.path)}><Icon name={item.icon}/><span>{item.label.replace("Mis ", "")}</span>{"badge" in item && item.badge && <small>{item.badge}</small>}</button>)}
    </nav>
  </div>;
}


function PetCard({ pet, compact = false }: { pet: typeof pets[number]; compact?: boolean }) {
  return <article className={`pet-card ${compact ? "pet-card--compact" : ""}`}>
    <div className="pet-card__photo"><img src={pet.photo} alt={`${pet.name}, ${pet.kind.toLowerCase()} de Mariana`}/><Status tone={pet.state.includes("pendiente") ? "amber" : "teal"}>{pet.state}</Status></div>
    <div className="pet-card__body"><div><h3>{pet.name}</h3><p>{pet.kind} · {pet.breed}</p></div><div className="pet-card__facts"><span><b>{pet.age}</b>Edad</span><span><b>{pet.weight}</b>Peso</span></div>{!compact && <div className="pet-card__dates"><span>Última consulta <b>{pet.last}</b></span><span>Próxima consulta <b>{pet.next}</b></span></div>}<Button variant="secondary" onClick={() => go(`/client/pets/${pet.id}`)}>Ver ficha <Icon name="arrow" size={16}/></Button></div>
  </article>;
}

function ConsultationCard({ item }: { item: typeof consultations[number] }) {
  const tone = item.status === "Confirmada" ? "teal" : item.status === "Pendiente" ? "amber" : "gray";
  return <article className="consultation-card"><div className="date-block"><strong>{item.date}</strong><span>{item.time}</span></div><div className="consultation-card__body"><div className="row-between"><div><h3>{item.title}</h3><p>{item.vet}</p></div><Status tone={tone}>{item.status}</Status></div><div className="consultation-meta"><span><Icon name="paw" size={17}/>{item.pet}</span><span><Icon name="video" size={17}/>{item.mode}</span><span><Icon name="file" size={17}/>{item.reason}</span></div></div><Button variant="secondary" onClick={() => go(`/client/consultations/${item.id}`)}>Ver consulta</Button></article>;
}

function Dashboard() {
  return <>
    <PageHeader eyebrow="Portal del tutor" title="Hola, Mariana" description="¿Cómo podemos ayudarte hoy?"/>
    <section className="attention-banner"><div className="attention-banner__icon"><Icon name="heart" size={28}/></div><div><span className="eyebrow">Orientación en pocos pasos</span><h2>¿Necesitás orientación veterinaria?</h2><p>Contanos qué está pasando y te ayudamos a encontrar el siguiente paso.</p></div><Button onClick={() => go("/client/triage")}>Necesito atención <Icon name="arrow" size={17}/></Button></section>
    <section className="active-call"><div className="active-call__pulse"><Icon name="video"/></div><div><span className="eyebrow">Consulta en curso</span><h2>Tu consulta está por comenzar</h2><p>Estás esperando la conexión con el Dr. Santiago Mendoza.</p></div><div className="active-call__meta"><span>Tiempo estimado</span><strong>4 minutos</strong></div><Button variant="primary" onClick={() => go("/client/consultations/seguimiento-milo")}>Entrar a la consulta</Button></section>
    <div className="dashboard-grid">
      <section><div className="section-heading"><div><span className="eyebrow">Tu agenda</span><h2>Próxima consulta</h2></div><button onClick={() => go("/client/consultations")}>Ver todas <Icon name="arrow" size={16}/></button></div><ConsultationCard item={consultations[0]}/></section>
      <aside className="care-note"><Icon name="shield" size={25}/><div><h3>Todo listo para hoy</h3><p>Tené a Milo cerca y buscá un lugar tranquilo con buena conexión.</p></div><button>Ver cómo prepararme</button></aside>
    </div>
    <section><div className="section-heading"><div><span className="eyebrow">Su salud, en un solo lugar</span><h2>Tus mascotas</h2></div><button onClick={() => go("/client/pets")}>Ver todas <Icon name="arrow" size={16}/></button></div><div className="pet-grid pet-grid--dashboard">{pets.slice(0, 3).map((pet) => <PetCard pet={pet} compact key={pet.id}/>)}</div></section>
  </>;
}

function PetsPage() {
  const [showEmpty, setShowEmpty] = useState(false);
  return <>
    <PageHeader eyebrow="Familia VetConnect" title="Mis mascotas" description="Su información de salud, organizada y siempre a mano." action={<Button icon="plus">Agregar mascota</Button>}/>
    <div className="view-toggle"><span>{pets.length} mascotas</span><button onClick={() => setShowEmpty(!showEmpty)}>{showEmpty ? "Ver mascotas" : "Ver estado vacío"}</button></div>
    {showEmpty ? <EmptyState icon="paw" title="Todavía no agregaste ninguna mascota" text="Agregá una mascota para comenzar a organizar su información." action="Agregar mascota"/> : <div className="pet-grid">{pets.map((pet) => <PetCard pet={pet} key={pet.id}/>)}</div>}
  </>;
}


function PetDetail({ id }: { id: string }) {
  const pet = pets.find((item) => item.id === id) || pets[0];
  const [tab, setTab] = useState("Información general");
  const [deleteModal, setDeleteModal] = useState(false);
  const tabs = ["Información general", "Vacunación", "Antecedentes", "Documentos", "Consultas", "Recetas", "Evolución"];
  return <>
    <button className="back-link" onClick={() => go("/client/pets")}><Icon name="arrow" size={17}/> Volver a mis mascotas</button>
    <section className="pet-hero"><img src={pet.photo} alt={pet.name}/><div className="pet-hero__title"><span className="eyebrow">Ficha de mascota</span><h1>{pet.name}</h1><p>{pet.kind} · {pet.breed}</p><Status>{pet.state}</Status></div><div className="pet-hero__facts"><span><small>Edad</small><strong>{pet.age}</strong></span><span><small>Sexo</small><strong>Macho</strong></span><span><small>Peso</small><strong>{pet.weight}</strong></span><span><small>Microchip</small><strong>{pet.id === "milo" ? "032 884 912" : "No informado"}</strong></span></div><Button variant="secondary" icon="edit">Editar ficha</Button></section>
    <Tabs tabs={tabs} active={tab} onChange={setTab}/>
    {tab === "Información general" && <div className="detail-grid">
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Resumen</span><h2>Información general</h2></div><Button variant="soft" icon="edit">Editar</Button></div><dl className="info-list"><div><dt>Fecha de nacimiento</dt><dd>14 de marzo de 2017</dd></div><div><dt>Color</dt><dd>Dorado</dd></div><div><dt>Estado reproductivo</dt><dd>Castrado</dd></div><div><dt>Veterinario habitual</dt><dd>Dr. Santiago Mendoza</dd></div></dl></section>
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Cuidados actuales</span><h2>Información médica</h2></div></div><div className="medical-items"><div><span className="medical-icon"><Icon name="heart"/></span><div><strong>Alergias</strong><p>Polen estacional</p></div></div><div><span className="medical-icon"><Icon name="file"/></span><div><strong>Medicación actual</strong><p>Oclacitinib · 1 comprimido diario</p></div></div><div><span className="medical-icon"><Icon name="shield"/></span><div><strong>Antecedentes</strong><p>Dermatitis atópica leve</p></div></div></div></section>
      <section className="panel panel--wide"><div className="panel__heading"><div><span className="eyebrow">Últimos registros</span><h2>Evolución</h2></div><Button variant="soft" icon="plus">Agregar nota</Button></div><div className="timeline"><div><span/><div><b>12 Jun 2025</b><strong>Buena respuesta al tratamiento</strong><p>Disminuyó el rascado. Continuar indicación actual.</p></div></div><div><span/><div><b>28 May 2025</b><strong>Inicio de seguimiento dermatológico</strong><p>Se reciben fotografías y se ajusta medicación.</p></div></div></div></section>
    </div>}
    {tab === "Vacunación" && <Vaccines/>}
    {tab === "Documentos" && <Documents onDelete={() => setDeleteModal(true)}/>}
    {!["Información general", "Vacunación", "Documentos"].includes(tab) && <section className="panel"><EmptyState icon="file" title={`${tab} de ${pet.name}`} text="Cuando haya nueva información, la vas a encontrar organizada acá." action={tab === "Evolución" ? "Agregar nota" : undefined}/></section>}
    {deleteModal && <Modal title="Eliminar documento" text="¿Seguro que querés eliminar este documento? Esta acción no se puede deshacer." cancel="Volver" confirm="Eliminar documento" destructive onClose={() => setDeleteModal(false)}/>}
  </>;
}

function Vaccines() {
  const rows = [
    ["Séxtuple canina", "12 Mar 2025", "12 Mar 2026", "Al día"],
    ["Antirrábica", "18 Jul 2024", "18 Jul 2025", "Próxima"],
    ["Bordetella", "08 Ene 2024", "08 Ene 2025", "Vencida"],
  ];
  return <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Prevención</span><h2>Vacunación</h2><p>Mantené el calendario de Milo actualizado.</p></div><Button icon="plus">Agregar vacuna</Button></div><div className="table-list">{rows.map((row) => <div className="table-row" key={row[0]}><div><small>Vacuna</small><strong>{row[0]}</strong></div><div><small>Aplicación</small><span>{row[1]}</span></div><div><small>Próxima dosis</small><span>{row[2]}</span></div><Status tone={row[3] === "Al día" ? "teal" : row[3] === "Próxima" ? "amber" : "red"}>{row[3]}</Status></div>)}</div></section>;
}

function Documents({ onDelete }: { onDelete: () => void }) {
  const docs = [["Análisis de sangre completo", "Análisis · PDF", "12 Jun 2025", "1,8 MB"], ["Radiografía de cadera", "Imagen · JPG", "28 May 2025", "4,2 MB"], ["Certificado de vacunación", "Certificado · PDF", "12 Mar 2025", "840 KB"]];
  return <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Biblioteca médica</span><h2>Documentos</h2><p>Estudios, recetas y archivos veterinarios de Milo.</p></div><Button icon="plus">Agregar documento</Button></div><div className="document-list">{docs.map((doc) => <article className="document-card" key={doc[0]}><span className="document-card__icon"><Icon name="file"/></span><div><strong>{doc[0]}</strong><p>{doc[1]} · {doc[2]} · {doc[3]}</p><small>Dr. Santiago Mendoza</small></div><div className="document-card__actions"><Button variant="soft">Ver</Button><Button variant="icon" icon="download" ariaLabel={`Descargar ${doc[0]}`}/><Button variant="icon" icon="trash" ariaLabel={`Eliminar ${doc[0]}`} onClick={onDelete}/></div></article>)}</div></section>;
}

function ConsultationsPage() {
  const [filter, setFilter] = useState("Próximas");
  const shown = filter === "Finalizadas" ? [consultations[2]] : filter === "En curso" ? [consultations[0]] : consultations.slice(0, 2);
  return <>
    <PageHeader eyebrow="Atención veterinaria" title="Mis consultas" description="Seguí tus próximas consultas y revisá las anteriores." action={<Button onClick={() => go("/client/triage")}>Nueva consulta</Button>}/>
    <Tabs tabs={["Próximas", "En curso", "Finalizadas"]} active={filter} onChange={setFilter}/>
    {filter === "En curso" && <section className="active-call active-call--page"><div className="active-call__pulse"><Icon name="video"/></div><div><span className="eyebrow">En espera</span><h2>Tu consulta está en curso</h2><p>El Dr. Santiago Mendoza se va a conectar en aproximadamente 4 minutos.</p></div><Button onClick={() => go("/call/c-milo?from=client&state=waiting")}>Entrar a la consulta</Button></section>}
    <div className="consultation-list">{shown.map((item) => <ConsultationCard item={item} key={item.id}/>)}</div>
  </>;
}

function ConsultationDetail() {
  const [tab, setTab] = useState("Resumen");
  return <>
    <button className="back-link" onClick={() => go("/client/consultations")}><Icon name="arrow" size={17}/> Volver a mis consultas</button>
    <PageHeader eyebrow="Consulta confirmada" title="Consulta de seguimiento" description="Hoy, 19:30 · Videoconsulta" action={<Button icon="video" onClick={() => go("/call/c-milo?from=client")}>Entrar a videoconsulta</Button>}/>
    <section className="consultation-summary"><div className="vet-avatar">SM</div><div><small>Profesional</small><strong>Dr. Santiago Mendoza</strong><p>Clínica general · MP 12.884</p></div><div><small>Mascota</small><strong>Milo</strong><p>Golden Retriever · 8 años</p></div><div><small>Motivo</small><strong>Seguimiento dermatológico</strong><p>Control de evolución</p></div><Status>Confirmada</Status></section>
    <Tabs tabs={["Resumen", "Mensajes", "Historial", "Recetas", "Documentos"]} active={tab} onChange={setTab}/>
    {tab === "Resumen" ? <div className="detail-grid"><section className="panel"><div className="panel__heading"><h2>Antes de la consulta</h2></div><div className="checklist"><p><Icon name="check"/> Tené a Milo cerca</p><p><Icon name="check"/> Buscá un lugar tranquilo</p><p><Icon name="check"/> Revisá tu conexión</p></div></section><section className="panel"><div className="panel__heading"><h2>Notas para el veterinario</h2></div><p className="muted">Milo respondió bien a la medicación. Todavía se rasca por la noche, pero con menor frecuencia.</p><Button variant="soft" icon="edit">Editar nota</Button></section></div> : <section className="panel"><EmptyState icon={tab === "Mensajes" ? "message" : "file"} title={tab} text={`La información de ${tab.toLowerCase()} de esta consulta aparecerá acá.`}/></section>}
  </>;
}

function AppointmentsPage() {
  const [modal, setModal] = useState(false);
  return <>
    <PageHeader eyebrow="Organizá tus turnos" title="Agenda" description="Consultas, controles y recordatorios para tus mascotas." action={<Button icon="plus">Reservar turno</Button>}/>
    <div className="calendar-layout"><section className="panel calendar"><div className="calendar__head"><div><span className="eyebrow">Calendario</span><h2>Julio 2025</h2></div><div><Button variant="icon" icon="chevron" ariaLabel="Mes anterior"/><Button variant="icon" icon="chevron" ariaLabel="Mes siguiente"/></div></div><div className="calendar__week">{["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => <span key={d}>{d}</span>)}</div><div className="calendar__days">{Array.from({length:35},(_,i) => { const day=i-1; return <button className={`${day === 15 ? "is-today" : ""} ${day === 18 ? "has-event" : ""}`} key={i}>{day > 0 && day <= 31 ? day : ""}</button>;})}</div><div className="calendar__legend"><span><i className="teal-dot"/>Consulta confirmada</span><span><i className="amber-dot"/>Pendiente</span></div></section><aside className="panel agenda-list"><div className="panel__heading"><div><span className="eyebrow">Próximos</span><h2>Tus turnos</h2></div></div>{consultations.slice(0,2).map(item => <div className="agenda-item" key={item.id}><div><b>{item.date} · {item.time}</b><strong>{item.title}</strong><span>{item.pet} · {item.vet}</span></div><Status tone={item.status === "Pendiente" ? "amber" : "teal"}>{item.status}</Status><button onClick={() => setModal(true)}>Cancelar</button></div>)}</aside></div>
    {modal && <Modal title="Cancelar consulta" text="¿Seguro que querés cancelar esta consulta? El turno quedará disponible para otra persona." cancel="Volver" confirm="Cancelar consulta" destructive onClose={() => setModal(false)}/>}
  </>;
}

function MessagesPage() {
  const [messages, setMessages] = useState<{ id: number; text: string; state: MessageState }[]>([]);
  const [text, setText] = useState("");
  const [toast, setToast] = useState(false);
  const send = () => {
    if (!text.trim()) return;
    const id = Date.now();
    setMessages((list) => [...list, { id, text: text.trim(), state: "sending" }]);
    setText("");
    window.setTimeout(() => setMessages((list) => list.map((message) => message.id === id ? { ...message, state: "sent" } : message)), 500);
    window.setTimeout(() => setMessages((list) => list.map((message) => message.id === id ? { ...message, state: "read" } : message)), 1100);
    setToast(true);
    window.setTimeout(() => setToast(false), 3800);
  };
  const conversations = [["SM", "Dr. Santiago Mendoza", "Milo", "Revisé las fotografías que enviaste.", "10:42", "2"], ["CL", "Dra. Camila López", "Luna", "Perfecto, nos vemos en el control.", "Ayer", ""], ["FM", "Dr. Federico Martín", "Nube", "La receta ya está disponible.", "Lun", ""]];
  return <>
    <PageHeader eyebrow="Chat clínico" title="Mensajes" description="Conversaciones vinculadas al cuidado de tus mascotas."/>
    <div className="messages-layout">
      <aside className="conversation-list" aria-label="Conversaciones"><div className="search-field"><Icon name="search" size={18}/><input aria-label="Buscar conversación" placeholder="Buscar conversación"/></div>{conversations.map((conversation, index) => <button className={index === 0 ? "is-active" : ""} key={conversation[1]}><span className="vet-avatar">{conversation[0]}</span><span><strong>{conversation[1]}</strong><small>{conversation[2]} · Consulta clínica</small><p>{conversation[3]}</p></span><time>{conversation[4]}</time>{conversation[5] && <b className="unread" aria-label={`${conversation[5]} mensajes sin leer`}>{conversation[5]}</b>}</button>)}</aside>
      <section className="chat" aria-label="Conversación con el Dr. Santiago Mendoza"><header><span className="vet-avatar">SM</span><div><strong>Dr. Santiago Mendoza</strong><span><i/> Disponible · Consulta de Milo</span></div><Button variant="soft" icon="video" onClick={() => go("/client/consultations/seguimiento-milo")}>Ver consulta</Button></header><div className="chat__messages"><div className="day-label">Hoy</div><MessageBubble text="Hola, Mariana. Revisé las fotografías que enviaste." time="10:38"/><MessageBubble text="Por lo que observo, necesito hacerte algunas preguntas antes de continuar. ¿Notaste si Milo se rasca más durante la noche?" time="10:39"/><MessageBubble mine text="Sí, sobre todo después de volver del paseo. A la noche se calma un poco." time="10:41" state="read"/><MessageBubble text="Gracias. Eso me ayuda mucho. Por ahora continuá con la indicación anterior y lo vemos juntos en la consulta de hoy." time="10:42"/>{messages.map((message) => <MessageBubble key={message.id} mine text={message.text} time="Ahora" state={message.state}/>) }<div className="typing" role="status" aria-live="polite"><span/><span/><span/> Veterinario escribiendo…</div></div><footer><Button variant="icon" icon="paperclip" ariaLabel="Adjuntar archivo"/><input aria-label="Escribir mensaje" placeholder="Escribí un mensaje para el veterinario" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()}/><Button variant="icon" icon="send" ariaLabel="Enviar mensaje" disabled={!text.trim()} onClick={send}/></footer></section>
    </div>
    {toast && <Toast message="Mensaje enviado."/>}
  </>;
}

function NotificationsPage() {
  const [allRead, setAllRead] = useState(false);
  const items: [IconName,string,string,string][] = [["video","Nueva consulta","Tu consulta con el Dr. Mendoza comienza en 15 minutos.","Hace 2 min"],["file","Receta disponible","El Dr. Mendoza emitió una nueva receta para Milo.","Hace 1 h"],["heart","Seguimiento","Tu veterinario agregó una indicación al seguimiento de Luna.","Ayer"],["file","Nuevo documento","Se agregó un análisis de sangre a la ficha de Milo.","12 Jun"]];
  return <>
    <PageHeader eyebrow="Novedades importantes" title="Notificaciones" description="Todo lo que necesitás saber sobre la salud de tus mascotas." action={<Button variant="secondary" onClick={() => setAllRead(true)}>Marcar todo como leído</Button>}/>
    <div className="notification-list">{items.map((n,i) => <article className={`notification ${!allRead && i < 2 ? "is-unread" : ""}`} key={n[1]}><span className="notification__icon"><Icon name={n[0]}/></span><div><div><strong>{n[1]}</strong>{!allRead && i < 2 && <span>Nueva</span>}</div><p>{n[2]}</p><time>{n[3]}</time></div><button aria-label={`Abrir ${n[1]}`}><Icon name="chevron"/></button></article>)}</div>
  </>;
}

function PrescriptionsPage() {
  const [active, setActive] = useState("Activas");
  return <>
    <PageHeader eyebrow="Indicaciones médicas" title="Recetas" description="Consultá tratamientos e indicaciones emitidas por tus veterinarios."/>
    <Tabs tabs={["Activas", "Anteriores"]} active={active} onChange={setActive}/>
    <div className="prescription-grid">{(active === "Activas" ? [1,2] : [3]).map((n) => <article className="prescription-card" key={n}><div className="prescription-card__head"><span><Icon name="file"/></span><div><small>Receta veterinaria</small><h3>{n === 2 ? "Plan nutricional" : "Tratamiento dermatológico"}</h3></div><Status tone={n === 3 ? "gray" : "teal"}>{n === 3 ? "Finalizada" : "Activa"}</Status></div><div className="prescription-card__vet"><div className="vet-avatar">SM</div><div><strong>Dr. Santiago Mendoza</strong><span>Milo · {n === 3 ? "03 Abr 2025" : "12 Jun 2025"}</span></div></div><div className="medicine"><small>Medicamento</small><strong>{n === 2 ? "Alimento hipoalergénico" : "Oclacitinib 16 mg"}</strong><p>{n === 2 ? "Según plan adjunto durante 30 días." : "1 comprimido cada 24 horas durante 14 días."}</p></div><Button variant="secondary">Ver receta completa <Icon name="arrow" size={16}/></Button></article>)}</div>
  </>;
}

function TriagePage() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const critical = answer === "Dificultad para respirar" || answer === "Sangrado";
  const options = ["Dificultad para respirar", "Vómitos", "Diarrea", "Herida", "Intoxicación", "Dolor", "Sangrado", "Otro"];
  if (step === 3) return <TriageResult critical={critical} onRestart={() => {setStep(0);setAnswer("");}}/>;
  return <div className="triage-page"><div className="triage-top"><Logo/><button onClick={() => go("/client/dashboard")}><Icon name="close"/> Salir</button></div><div className="triage-progress"><span style={{width:`${(step + 1) * 33}%`}}/><small>Paso {step + 1} de 3 · Cerca de 60 segundos</small></div><main className="triage-card"><span className="triage-icon"><Icon name={step === 0 ? "heart" : step === 1 ? "paw" : "clock"} size={28}/></span><span className="eyebrow">Orientación inicial</span><h1>{step === 0 ? "¿Qué está pasando?" : step === 1 ? "¿A quién vamos a ayudar?" : "¿Cuándo empezó?"}</h1><p>{step === 0 ? "Elegí la opción que mejor describa lo que ves. No hace falta que tengas toda la información." : step === 1 ? "Seleccioná una de tus mascotas para que podamos orientarte mejor." : "Esta información nos ayuda a estimar el nivel de atención."}</p><div className={step === 0 ? "option-grid" : "option-list"}>{step === 0 && options.map((option) => <button className={answer === option ? "is-selected" : ""} onClick={() => setAnswer(option)} key={option}><span>{option}</span>{answer === option && <Icon name="check"/>}</button>)}{step === 1 && pets.slice(0,3).map(pet => <button className={answer.includes("|"+pet.name) ? "is-selected" : ""} onClick={() => setAnswer(answer.split("|")[0]+"|"+pet.name)} key={pet.id}><img src={pet.photo} alt=""/><span><strong>{pet.name}</strong><small>{pet.kind} · {pet.breed}</small></span><Icon name="chevron"/></button>)}{step === 2 && ["Hace menos de una hora","Hoy","Entre ayer y hoy","Hace varios días"].map(option => <button className={answer.includes("|"+option) ? "is-selected" : ""} onClick={() => setAnswer(answer.split("|").slice(0,2).join("|")+"|"+option)} key={option}><span>{option}</span>{answer.includes("|"+option) && <Icon name="check"/>}</button>)}</div><div className="triage-actions">{step > 0 && <Button variant="secondary" onClick={() => setStep(step-1)}>Volver</Button>}<Button disabled={!answer} onClick={() => setStep(step+1)}>Continuar <Icon name="arrow" size={17}/></Button></div><small className="triage-disclaimer"><Icon name="shield" size={15}/> Esta orientación no reemplaza una evaluación veterinaria.</small></main></div>;
}

function TriageResult({ critical, onRestart }: { critical: boolean; onRestart: () => void }) {
  const [matched, setMatched] = useState(false);
  if (matched) return <div className="triage-page"><div className="triage-top"><Logo/></div><main className="matching-card"><div className="matching-visual"><span/><span/><span/><Icon name="search" size={30}/></div><span className="eyebrow">{critical ? "Prioridad alta" : "Prioridad moderada"}</span><h1>Veterinario encontrado</h1><p>Hay un profesional disponible para acompañarte ahora.</p><div className="matched-vet"><div className="vet-avatar vet-avatar--large">SM</div><div><strong>Dr. Santiago Mendoza</strong><span>Clínica general · Animales de compañía</span><small>Disponible ahora</small></div></div><Button onClick={() => go("/client/consultations/seguimiento-milo")}>Entrar a la consulta <Icon name="arrow" size={17}/></Button></main></div>;
  return <div className="triage-page"><div className="triage-top"><Logo/></div><main className={`result-card ${critical ? "result-card--critical" : ""}`}><span className="result-card__icon"><Icon name={critical ? "phone" : "heart"} size={31}/></span><span className="eyebrow">{critical ? "Atención inmediata" : "Orientación completada"}</span><h1>{critical ? "Necesitás atención veterinaria inmediata." : "Nivel de atención: MODERADO"}</h1><p>{critical ? "Por lo que nos contaste, es importante actuar ahora. Contactá una guardia veterinaria presencial mientras te conectamos con un profesional." : "Según las respuestas ingresadas, recomendamos conectar con un veterinario."}</p>{critical && <div className="critical-guidance"><strong>Mientras buscás atención:</strong><p>Mantené a tu mascota tranquila y en un lugar seguro.</p><p>No le des comida, agua ni medicación sin indicación profesional.</p><p>Si podés trasladarla, buscá una guardia veterinaria cercana.</p></div>}<div className="estimate"><span><Icon name="clock"/><small>Tiempo estimado</small></span><strong>{critical ? "Ahora" : "4 minutos"}</strong></div><div className="result-actions"><Button onClick={() => setMatched(true)}>{critical ? "Conectar con atención veterinaria" : "Conectar con veterinario"}</Button>{critical && <Button variant="secondary">Buscar atención presencial inmediata</Button>}</div><button className="text-button" onClick={onRestart}>Revisar respuestas</button><small className="triage-disclaimer">VetConnect no reemplaza una guardia veterinaria presencial.</small></main></div>;
}

function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Mariana López" : "Mariana López";
  const firstName = user?.firstName || "Mariana";
  const lastName = user?.lastName || "López";
  const email = user?.email || "mariana.lopez@ejemplo.com";
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "ML" : "ML";

  return <>
    <PageHeader eyebrow="Tu cuenta" title="Mi perfil" description="Mantené tus datos de contacto actualizados." action={<Button variant={editing ? "primary" : "secondary"} icon={editing ? "check" : "edit"} onClick={() => setEditing(!editing)}>{editing ? "Guardar cambios" : "Editar perfil"}</Button>}/>
    <div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">{initials}</div><h2>{displayName}</h2><p>Tutor registrado</p><Status>Perfil activo</Status></section><section className="panel"><div className="panel__heading"><div><span className="eyebrow">Datos básicos</span><h2>Información personal</h2></div></div><div className="form-grid"><Field label="Nombre" value={firstName} editing={editing}/><Field label="Apellido" value={lastName} editing={editing}/><Field label="Email" value={email} editing={editing}/><Field label="Teléfono" value="+54 11 5555 0182" editing={editing}/><Field label="Ciudad" value="Buenos Aires" editing={editing}/><Field label="Zona horaria" value="Argentina (GMT-3)" editing={false}/></div></section></div>
  </>;
}


function SettingsPage() {
  const [toggles, setToggles] = useState([true,true,false,true]);
  return <>
    <PageHeader eyebrow="Preferencias" title="Configuración" description="Elegí cómo querés usar VetConnect y recibir novedades."/>
    <div className="settings-layout"><section className="panel"><div className="panel__heading"><div><span className="eyebrow">Avisos</span><h2>Notificaciones</h2></div></div>{[["Recordatorios de consultas","Avisos antes de cada turno."],["Nuevos mensajes","Cuando un veterinario te escriba."],["Novedades de VetConnect","Información y consejos de cuidado."],["Recetas y documentos","Cuando haya nuevos archivos disponibles."]].map((item,i) => <div className="setting-row" key={item[0]}><div><strong>{item[0]}</strong><p>{item[1]}</p></div><button role="switch" aria-checked={toggles[i]} className={`switch ${toggles[i] ? "is-on" : ""}`} onClick={() => setToggles(toggles.map((v,j) => i === j ? !v : v))}><span/></button></div>)}</section><section className="panel"><div className="panel__heading"><div><span className="eyebrow">Cuenta</span><h2>Privacidad y acceso</h2></div></div><button className="settings-link"><span><Icon name="shield"/><span><strong>Cambiar contraseña</strong><small>Actualizá tu clave de acceso.</small></span></span><Icon name="chevron"/></button><button className="settings-link"><span><Icon name="file"/><span><strong>Privacidad</strong><small>Revisá cómo cuidamos tus datos.</small></span></span><Icon name="chevron"/></button></section></div>
  </>;
}


function SkeletonPage({ type }: { type: "dashboard" | "list" | "messages" }) {
  return <div className={`skeleton-page skeleton-page--${type}`} aria-busy="true" aria-live="polite">
    <span className="sr-only">Cargando contenido</span>
    <div className="skeleton skeleton--eyebrow"/>
    <div className="skeleton skeleton--title"/>
    <div className="skeleton skeleton--subtitle"/>
    <div className="skeleton skeleton--hero"/>
    <div className="skeleton-grid">
      <div className="skeleton skeleton--card"/>
      <div className="skeleton skeleton--card"/>
      <div className="skeleton skeleton--card"/>
    </div>
  </div>;
}

function ErrorState() {
  return <div className="panel"><EmptyState icon="heart" title="No pudimos cargar esta información" text="Intentá nuevamente en unos segundos." action="Reintentar"/></div>;
}


function NotFound() {
  return <EmptyState icon="paw" title="No encontramos esta página" text="La dirección puede haber cambiado. Volvé al inicio para seguir cuidando a tus mascotas." action="Volver al inicio"/>;
}

export default function ClientApp() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => { const update = () => setPath(window.location.pathname); window.addEventListener("popstate", update); return () => window.removeEventListener("popstate", update); }, []);
  const page = useMemo(() => {
    if (path === "/" || path === "/client" || path === "/client/dashboard") return <Dashboard/>;
    if (path === "/client/pets") return <PetsPage/>;
    if (path.startsWith("/client/pets/")) return <PetDetail id={path.split("/").pop() || "milo"}/>;
    if (path === "/client/consultations") return <ConsultationsPage/>;
    if (path.startsWith("/client/consultations/")) return <ConsultationDetail/>;
    if (path === "/client/appointments") return <AppointmentsPage/>;
    if (path === "/client/messages") return <MessagesPage/>;
    if (path === "/client/notifications") return <NotificationsPage/>;
    if (path === "/client/prescriptions") return <PrescriptionsPage/>;
    if (path === "/client/profile") return <ProfilePage/>;
    if (path === "/client/settings") return <SettingsPage/>;
    return <NotFound/>;
  }, [path]);
  if (path === "/vet" || path.startsWith("/vet/")) return <Suspense fallback={<div className="route-loading" role="status">Cargando consola profesional…</div>}><VetApp path={path}/></Suspense>;
  if (path.startsWith("/call/")) return <Suspense fallback={<div className="route-loading route-loading--dark" role="status">Preparando videoconsulta…</div>}><CallRoom id={path.split("/")[2] || "milo"}/></Suspense>;
  if (path === "/client/triage") return <TriagePage/>;
  const state = new URLSearchParams(window.location.search).get("state");
  if (state === "loading") return <AppShell path={path}><SkeletonPage type={path === "/client/messages" ? "messages" : path === "/client/dashboard" ? "dashboard" : "list"}/></AppShell>;
  if (state === "error") return <AppShell path={path}><ErrorState/></AppShell>;
  return <AppShell path={path}>{page}</AppShell>;
}
