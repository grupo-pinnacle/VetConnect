import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, EmptyState, Field, Icon, Logo, MessageBubble, Modal, PageHeader, Status, Tabs, Toast, go, photos, type IconName, type MessageState } from "../shared";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import type { ApiResponse, Pet as BackendPet, Consultation as BackendConsultation, Prescription as BackendPrescription } from "../types";
import { parseConsultationNotes } from "../lib/consultationNotes";

const VetApp = lazy(() => import("../vet/VetApp"));
const CallRoom = lazy(() => import("../vet/CallRoom"));

const routes = [
  { label: "Inicio", path: "/client/dashboard", icon: "home" as IconName },
  { label: "Mis mascotas", path: "/client/pets", icon: "paw" as IconName },
  { label: "Mis consultas", path: "/client/consultations", icon: "video" as IconName },
  { label: "Agenda", path: "/client/appointments", icon: "calendar" as IconName },
  { label: "Mensajes", path: "/client/messages", icon: "message" as IconName },
  { label: "Recetas", path: "/client/prescriptions", icon: "file" as IconName },
  { label: "Notificaciones", path: "/client/notifications", icon: "bell" as IconName },
  { label: "Mi perfil", path: "/client/profile", icon: "user" as IconName },
];

const mobileRoutes = [
  routes[0],
  routes[1],
  { label: "Atención", path: "/client/triage", icon: "heart" as IconName },
  routes[4],
  routes[6],
];

export interface ClientViewPet {
  id: string;
  name: string;
  kind: string;
  breed: string;
  age: string;
  weight: string;
  state: string;
  last: string;
  next: string;
  photo: string;
  allergies?: string;
  chronicConditions?: string;
  microchip?: string;
}

const INITIAL_PETS: ClientViewPet[] = [
  { id: "milo", name: "Milo", kind: "Perro", breed: "Golden Retriever", age: "8 años", weight: "29 kg", state: "Controles al día", last: "12 Jun 2025", next: "Hoy · 19:30", photo: photos.milo, allergies: "Polen estacional", microchip: "032 884 912" },
  { id: "luna", name: "Luna", kind: "Coneja", breed: "Enana", age: "3 años", weight: "1,7 kg", state: "En seguimiento", last: "28 May 2025", next: "Sin turno próximo", photo: photos.luna },
  { id: "nube", name: "Nube", kind: "Gato", breed: "Mestizo", age: "5 años", weight: "4,3 kg", state: "Controles al día", last: "03 Abr 2025", next: "18 Jul · 10:00", photo: photos.nube },
  { id: "kiwi", name: "Kiwi", kind: "Ave", breed: "Cotorra argentina", age: "2 años", weight: "110 g", state: "Control pendiente", last: "10 Ene 2025", next: "Sin turno próximo", photo: photos.kiwi },
  { id: "toby", name: "Toby", kind: "Hurón", breed: "Sable", age: "4 años", weight: "1,2 kg", state: "Controles al día", last: "20 May 2025", next: "02 Ago · 16:30", photo: photos.toby },
];

export interface ClientViewConsultation {
  id: string;
  title: string;
  vet: string;
  pet: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  mode: string;
  rawStatus?: string;
}

const INITIAL_CONSULTATIONS: ClientViewConsultation[] = [
  { id: "seguimiento-milo", title: "Consulta de seguimiento", vet: "Dr. Santiago Mendoza", pet: "Milo", date: "Hoy", time: "19:30", reason: "Seguimiento dermatológico", status: "Confirmada", mode: "Videoconsulta" },
  { id: "luna-nutricion", title: "Control nutricional", vet: "Dra. Camila López", pet: "Luna", date: "18 Jul", time: "10:00", reason: "Control de alimentación", status: "Pendiente", mode: "Videoconsulta" },
  { id: "nube-control", title: "Control clínico", vet: "Dr. Santiago Mendoza", pet: "Nube", date: "03 Abr", time: "17:15", reason: "Control anual", status: "Finalizada", mode: "Videoconsulta" },
];

function mapBackendPet(p: BackendPet): ClientViewPet {
  const photo = p.species.toLowerCase().includes("cone") ? photos.luna
    : p.species.toLowerCase().includes("gat") || p.species.toLowerCase().includes("fel") ? photos.nube
    : p.species.toLowerCase().includes("ave") || p.species.toLowerCase().includes("loro") ? photos.kiwi
    : p.species.toLowerCase().includes("hur") ? photos.toby
    : photos.milo;

  return {
    id: p.id,
    name: p.name,
    kind: p.species,
    breed: p.breed || "Mestizo",
    age: "Registrado",
    weight: p.weightKg != null ? `${p.weightKg} kg` : "No informado",
    state: "Al día",
    last: new Date(p.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    next: "Sin turno próximo",
    photo,
    allergies: p.allergies || "Sin alergias conocidas",
    chronicConditions: p.chronicConditions || undefined,
    microchip: p.microchip || "No informado",
  };
}

function mapBackendConsultation(c: BackendConsultation): ClientViewConsultation {
  const parsed = parseConsultationNotes(c.notes);
  const vetName = c.vet ? `Dr. ${c.vet.firstName || ""} ${c.vet.lastName || ""}`.trim() : "Veterinario de guardia";
  const petName = c.pet?.name || "Mascota";
  const dateStr = c.startedAt ? new Date(c.startedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "Hoy";
  const timeStr = c.startedAt ? new Date(c.startedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "En cola";
  const displayStatus = c.status === "ACTIVE" ? "Confirmada" : c.status === "WAITING" ? "Pendiente" : c.status === "COMPLETED" ? "Finalizada" : "Cancelada";

  return {
    id: c.id,
    title: parsed.cleanNotes || "Consulta clínica",
    vet: vetName,
    pet: petName,
    date: dateStr,
    time: timeStr,
    reason: parsed.cleanNotes,
    status: displayStatus,
    mode: "Videoconsulta",
    rawStatus: c.status,
  };
}


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
        {routes.map((item) => <button key={item.path} className={`nav-item ${path.startsWith(item.path) ? "is-active" : ""}`} onClick={() => { go(item.path); setMenu(false); }}><Icon name={item.icon}/><span>{item.label}</span></button>)}
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
      {mobileRoutes.map((item) => <button key={item.path} className={`${path.startsWith(item.path) ? "is-active" : ""} ${item.path === "/client/triage" ? "is-priority" : ""}`} onClick={() => go(item.path)}><Icon name={item.icon}/><span>{item.label.replace("Mis ", "")}</span></button>)}
    </nav>
  </div>;
}


function PetCard({ pet, compact = false }: { pet: ClientViewPet; compact?: boolean }) {
  return <article className={`pet-card ${compact ? "pet-card--compact" : ""}`}>
    <div className="pet-card__photo"><img src={pet.photo} alt={`${pet.name}, ${pet.kind.toLowerCase()}`}/><Status tone={pet.state.includes("pendiente") ? "amber" : "teal"}>{pet.state}</Status></div>
    <div className="pet-card__body"><div><h3>{pet.name}</h3><p>{pet.kind} · {pet.breed}</p></div><div className="pet-card__facts"><span><b>{pet.age}</b>Edad</span><span><b>{pet.weight}</b>Peso</span></div>{!compact && <div className="pet-card__dates"><span>Última consulta <b>{pet.last}</b></span><span>Próxima consulta <b>{pet.next}</b></span></div>}<Button variant="secondary" onClick={() => go(`/client/pets/${pet.id}`)}>Ver ficha <Icon name="arrow" size={16}/></Button></div>
  </article>;
}

function ConsultationCard({ item }: { item: ClientViewConsultation }) {
  const tone = item.status === "Confirmada" ? "teal" : item.status === "Pendiente" ? "amber" : "gray";
  return <article className="consultation-card"><div className="date-block"><strong>{item.date}</strong><span>{item.time}</span></div><div className="consultation-card__body"><div className="row-between"><div><h3>{item.title}</h3><p>{item.vet}</p></div><Status tone={tone}>{item.status}</Status></div><div className="consultation-meta"><span><Icon name="paw" size={17}/>{item.pet}</span><span><Icon name="video" size={17}/>{item.mode}</span><span><Icon name="file" size={17}/>{item.reason}</span></div></div><Button variant="secondary" onClick={() => go(`/client/consultations/${item.id}`)}>Ver consulta</Button></article>;
}

function useClientData() {
  const petsQuery = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BackendPet[]>>('/api/pets');
      return (res.data.success && res.data.data) ? res.data.data.map(mapBackendPet) : [];
    },
  });

  const consultationsQuery = useQuery({
    queryKey: ['consultations', 'mine'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BackendConsultation[]>>('/api/consultations/mine');
      return (res.data.success && res.data.data) ? res.data.data.map(mapBackendConsultation) : [];
    },
  });

  const petsList = petsQuery.data ?? [];
  const consultationsList = consultationsQuery.data ?? [];

  return {
    pets: petsList,
    petsLoading: petsQuery.isLoading,
    hasRealPets: petsList.length > 0,
    consultations: consultationsList,
    consultationsLoading: consultationsQuery.isLoading,
    hasRealConsultations: consultationsList.length > 0,
    rawPetsData: petsQuery.data,
    rawConsultationsData: consultationsQuery.data,
  };
}

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.firstName || "Tobias";
  const { pets, consultations, petsLoading, consultationsLoading } = useClientData();

  // Active call only if there is a real ACTIVE or WAITING consultation in DB
  const activeCall = consultations.find((c) => c.rawStatus === "ACTIVE" || c.rawStatus === "WAITING");
  const nextConsultation = consultations.find((c) => c.rawStatus === "ACTIVE" || c.rawStatus === "WAITING" || c.status === "Confirmada" || c.status === "Pendiente");

  return <>
    <PageHeader eyebrow="Portal del tutor" title={`Hola, ${firstName}`} description="¿Cómo podemos ayudarte hoy?"/>
    <section className="attention-banner"><div className="attention-banner__icon"><Icon name="heart" size={28}/></div><div><span className="eyebrow">Orientación en pocos pasos</span><h2>¿Necesitás orientación veterinaria?</h2><p>Contanos qué está pasando y te ayudamos a encontrar el siguiente paso.</p></div><Button onClick={() => go("/client/triage")}>Necesito atención <Icon name="arrow" size={17}/></Button></section>
    
    {activeCall && (
      <section className="active-call">
        <div className="active-call__pulse"><Icon name="video"/></div>
        <div>
          <span className="eyebrow">{activeCall.rawStatus === "WAITING" ? "Consulta en espera" : "Consulta en curso"}</span>
          <h2>{activeCall.rawStatus === "WAITING" ? "Esperando asignación de veterinario" : "Tu consulta está por comenzar"}</h2>
          <p>{activeCall.rawStatus === "WAITING" ? "Un profesional de guardia tomará tu caso a la brevedad." : `Estás esperando la conexión con ${activeCall.vet}.`}</p>
        </div>
        <div className="active-call__meta"><span>Tiempo estimado</span><strong>{activeCall.rawStatus === "WAITING" ? "En cola" : "4 minutos"}</strong></div>
        <Button variant="primary" onClick={() => go(`/call/${activeCall.id}?from=client`)}>Entrar a la consulta</Button>
      </section>
    )}

    <div className="dashboard-grid">
      <section>
        <div className="section-heading"><div><span className="eyebrow">Tu agenda</span><h2>Próxima consulta</h2></div><button onClick={() => go("/client/consultations")}>Ver todas <Icon name="arrow" size={16}/></button></div>
        {nextConsultation ? (
          <ConsultationCard item={nextConsultation}/>
        ) : (
          <div className="panel"><EmptyState icon="calendar" title="Sin consultas programadas" text="Cuando reserves un turno o pidas atención, aparecerá acá." action="Nueva consulta"/></div>
        )}
      </section>

      {nextConsultation ? (
        <aside className="care-note">
          <Icon name="shield" size={25}/>
          <div>
            <h3>Todo listo para hoy</h3>
            <p>{`Tené a ${nextConsultation.pet || pets[0]?.name || "tu mascota"} cerca y buscá un lugar tranquilo con buena conexión.`}</p>
          </div>
          <button onClick={() => go("/client/triage")}>Ver cómo prepararme</button>
        </aside>
      ) : (
        <aside className="care-note">
          <Icon name="shield" size={25}/>
          <div>
            <h3>Cuidado preventivo</h3>
            <p>Mantené la información médica de tus mascotas al día para agilizar la atención de guardia.</p>
          </div>
          <button onClick={() => go("/client/pets")}>Gestionar mascotas</button>
        </aside>
      )}
    </div>

    <section>
      <div className="section-heading"><div><span className="eyebrow">Su salud, en un solo lugar</span><h2>Tus mascotas</h2></div><button onClick={() => go("/client/pets")}>Ver todas <Icon name="arrow" size={16}/></button></div>
      {pets.length > 0 ? (
        <div className="pet-grid pet-grid--dashboard">{pets.slice(0, 3).map((pet) => <PetCard pet={pet} compact key={pet.id}/>)}</div>
      ) : (
        <div className="panel"><EmptyState icon="paw" title="Todavía no agregaste ninguna mascota" text="Agregá tu primera mascota para organizar su información y solicitar atención." action="Agregar mascota"/></div>
      )}
    </section>
  </>;
}

function PetsPage() {
  const { pets, hasRealPets, rawPetsData } = useClientData();
  const queryClient = useQueryClient();
  const [showEmpty, setShowEmpty] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Perro");
  const [breed, setBreed] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const createPetMutation = useMutation({
    mutationFn: async (payload: { name: string; species: string; breed: string; weightKg?: number }) => {
      const res = await api.post<ApiResponse<BackendPet>>('/api/pets', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setModalOpen(false);
      setName("");
      setBreed("");
      setWeightKg("");
      setToastMsg("Mascota agregada exitosamente");
      setTimeout(() => setToastMsg(null), 3500);
    },
    onError: () => {
      setToastMsg("Error al registrar la mascota");
      setTimeout(() => setToastMsg(null), 3500);
    },
  });

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPetMutation.mutate({
      name: name.trim(),
      species,
      breed: breed.trim() || "Mestizo",
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
    });
  };

  const isActuallyEmpty = rawPetsData && rawPetsData.length === 0 && !hasRealPets;
  const displayPets = showEmpty ? [] : pets;

  return <>
    <PageHeader eyebrow="Familia VetConnect" title="Mis mascotas" description="Su información de salud, organizada y siempre a mano." action={<Button icon="plus" onClick={() => setModalOpen(true)}>Agregar mascota</Button>}/>
    <div className="view-toggle"><span>{displayPets.length} mascotas</span><button onClick={() => setShowEmpty(!showEmpty)}>{showEmpty ? "Ver mascotas" : "Ver estado vacío"}</button></div>
    {showEmpty || isActuallyEmpty ? <EmptyState icon="paw" title="Todavía no agregaste ninguna mascota" text="Agregá una mascota para comenzar a organizar su información." action="Agregar mascota"/> : <div className="pet-grid">{displayPets.map((pet) => <PetCard pet={pet} key={pet.id}/>)}</div>}

    {modalOpen && (
      <div className="modal-layer" role="presentation">
        <button className="modal-scrim" onClick={() => setModalOpen(false)} aria-label="Cerrar modal"/>
        <div className="modal" role="dialog" aria-modal="true" style={{ textAlign: "left", width: "min(480px, calc(100% - 32px))" }}>
          <button className="button button--icon modal__close" onClick={() => setModalOpen(false)} aria-label="Cerrar"><Icon name="close" size={18}/></button>
          <span className="modal__icon"><Icon name="paw"/></span>
          <h2 style={{ textAlign: "center" }}>Nueva mascota</h2>
          <p style={{ textAlign: "center", marginBottom: 20 }}>Ingresá los datos básicos para abrir su expediente clínico.</p>
          <form onSubmit={handleSavePet}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label className="field"><span>Nombre de la mascota</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Milo" required/></label>
              <label className="field"><span>Especie</span>
                <select value={species} onChange={(e) => setSpecies(e.target.value)} style={{ width: "100%", height: 43, borderRadius: 10, border: "1px solid var(--line)", padding: "0 12px", background: "white", color: "var(--ink)" }}>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Conejo">Conejo</option>
                  <option value="Ave">Ave</option>
                  <option value="Hurón">Hurón</option>
                  <option value="Otro">Otro animal de compañía</option>
                </select>
              </label>
              <label className="field"><span>Raza</span><input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Ej: Mestizo / Golden Retriever"/></label>
              <label className="field"><span>Peso (kg)</span><input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Ej: 14.5"/></label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" disabled={createPetMutation.isPending}>{createPetMutation.isPending ? "Guardando..." : "Guardar mascota"}</Button>
            </div>
          </form>
        </div>
      </div>
    )}
    {toastMsg && <Toast message={toastMsg} tone={toastMsg.includes("Error") ? "error" : "success"}/>}
  </>;
}

function PetDetail({ id }: { id: string }) {
  const { pets } = useClientData();
  const pet = pets.find((item) => item.id === id) || pets[0];
  const [tab, setTab] = useState("Información general");
  const [deleteModal, setDeleteModal] = useState(false);
  const tabs = ["Información general", "Vacunación", "Antecedentes", "Documentos", "Consultas", "Recetas", "Evolución"];
  return <>
    <button className="back-link" onClick={() => go("/client/pets")}><Icon name="arrow" size={17}/> Volver a mis mascotas</button>
    <section className="pet-hero"><img src={pet.photo} alt={pet.name}/><div className="pet-hero__title"><span className="eyebrow">Ficha de mascota</span><h1>{pet.name}</h1><p>{pet.kind} · {pet.breed}</p><Status>{pet.state}</Status></div><div className="pet-hero__facts"><span><small>Edad</small><strong>{pet.age}</strong></span><span><small>Sexo</small><strong>Macho</strong></span><span><small>Peso</small><strong>{pet.weight}</strong></span><span><small>Microchip</small><strong>{pet.microchip || "No informado"}</strong></span></div><Button variant="secondary" icon="edit" onClick={() => go("/client/pets")}>Editar ficha</Button></section>
    <Tabs tabs={tabs} active={tab} onChange={setTab}/>
    {tab === "Información general" && <div className="detail-grid">
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Resumen</span><h2>Información general</h2></div><Button variant="soft" icon="edit" onClick={() => go("/client/pets")}>Editar</Button></div><dl className="info-list"><div><dt>Especie</dt><dd>{pet.kind}</dd></div><div><dt>Raza</dt><dd>{pet.breed}</dd></div><div><dt>Microchip ISO</dt><dd>{pet.microchip || "No informado"}</dd></div><div><dt>Estado clínico</dt><dd>{pet.state}</dd></div></dl></section>
      <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Cuidados actuales</span><h2>Información médica</h2></div></div><div className="medical-items"><div><span className="medical-icon"><Icon name="heart"/></span><div><strong>Alergias</strong><p>{pet.allergies || "Sin alergias conocidas"}</p></div></div><div><span className="medical-icon"><Icon name="file"/></span><div><strong>Condiciones crónicas</strong><p>{pet.chronicConditions || "Ninguna registrada"}</p></div></div><div><span className="medical-icon"><Icon name="shield"/></span><div><strong>Última consulta</strong><p>{pet.last}</p></div></div></div></section>
      <section className="panel panel--wide"><div className="panel__heading"><div><span className="eyebrow">Últimos registros</span><h2>Evolución</h2></div><Button variant="soft" icon="plus" onClick={() => go("/client/triage")}>Nueva consulta</Button></div><div className="timeline"><div><span/><div><b>{pet.last}</b><strong>Atención registrada en sistema</strong><p>Expediente sincronizado con la red veterinaria VetConnect.</p></div></div></div></section>
    </div>}
    {tab === "Vacunación" && <Vaccines/>}
    {tab === "Documentos" && <Documents onDelete={() => setDeleteModal(true)}/>}
    {!["Información general", "Vacunación", "Documentos"].includes(tab) && <section className="panel"><EmptyState icon="file" title={`${tab} de ${pet.name}`} text="Cuando haya nueva información, la vas a encontrar organizada acá." action={tab === "Evolución" ? "Nueva consulta" : undefined}/></section>}
    {deleteModal && <Modal title="Eliminar documento" text="¿Seguro que querés eliminar este documento? Esta acción no se puede deshacer." cancel="Volver" confirm="Eliminar documento" destructive onClose={() => setDeleteModal(false)}/>}
  </>;
}

function Vaccines() {
  const rows = [
    ["Séxtuple canina", "12 Mar 2025", "12 Mar 2026", "Al día"],
    ["Antirrábica", "18 Jul 2024", "18 Jul 2025", "Próxima"],
    ["Bordetella", "08 Ene 2024", "08 Ene 2025", "Vencida"],
  ];
  return <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Prevención</span><h2>Vacunación</h2><p>Mantené el calendario actualizado.</p></div><Button icon="plus">Agregar vacuna</Button></div><div className="table-list">{rows.map((row) => <div className="table-row" key={row[0]}><div><small>Vacuna</small><strong>{row[0]}</strong></div><div><small>Aplicación</small><span>{row[1]}</span></div><div><small>Próxima dosis</small><span>{row[2]}</span></div><Status tone={row[3] === "Al día" ? "teal" : row[3] === "Próxima" ? "amber" : "red"}>{row[3]}</Status></div>)}</div></section>;
}

function Documents({ onDelete }: { onDelete: () => void }) {
  const docs = [["Análisis de sangre completo", "Análisis · PDF", "12 Jun 2025", "1,8 MB"], ["Radiografía de cadera", "Imagen · JPG", "28 May 2025", "4,2 MB"], ["Certificado de vacunación", "Certificado · PDF", "12 Mar 2025", "840 KB"]];
  return <section className="panel"><div className="panel__heading"><div><span className="eyebrow">Biblioteca médica</span><h2>Documentos</h2><p>Estudios, recetas y archivos veterinarios.</p></div><Button icon="plus">Agregar documento</Button></div><div className="document-list">{docs.map((doc) => <article className="document-card" key={doc[0]}><span className="document-card__icon"><Icon name="file"/></span><div><strong>{doc[0]}</strong><p>{doc[1]} · {doc[2]} · {doc[3]}</p><small>Dr. Santiago Mendoza</small></div><div className="document-card__actions"><Button variant="soft">Ver</Button><Button variant="icon" icon="download" ariaLabel={`Descargar ${doc[0]}`}/><Button variant="icon" icon="trash" ariaLabel={`Eliminar ${doc[0]}`} onClick={onDelete}/></div></article>)}</div></section>;
}

function ConsultationsPage() {
  const { consultations } = useClientData();
  const [filter, setFilter] = useState("Próximas");
  const shown = filter === "Finalizadas" ? consultations.filter(c => c.status === "Finalizada")
    : filter === "En curso" ? consultations.filter(c => c.status === "Confirmada" || c.status === "Pendiente")
    : consultations;

  return <>
    <PageHeader eyebrow="Atención veterinaria" title="Mis consultas" description="Seguí tus próximas consultas y revisá las anteriores." action={<Button onClick={() => go("/client/triage")}>Nueva consulta</Button>}/>
    <Tabs tabs={["Próximas", "En curso", "Finalizadas"]} active={filter} onChange={setFilter}/>
    {filter === "En curso" && shown[0] && <section className="active-call active-call--page"><div className="active-call__pulse"><Icon name="video"/></div><div><span className="eyebrow">En espera</span><h2>Tu consulta está en curso</h2><p>{`${shown[0].vet} se va a conectar en breve.`}</p></div><Button onClick={() => go(`/call/${shown[0].id}?from=client&state=waiting`)}>Entrar a la consulta</Button></section>}
    {shown.length === 0 ? <div className="panel"><EmptyState icon="video" title="No hay consultas en esta sección" text="Podés solicitar una nueva consulta de telemedicina veterinaria cuando lo necesites." action="Nueva consulta"/></div> : <div className="consultation-list">{shown.map((item) => <ConsultationCard item={item} key={item.id}/>)}</div>}
  </>;
}

function ConsultationDetail() {
  const { consultations, pets } = useClientData();
  const pathId = window.location.pathname.split("/").pop();
  const activeConsultation = consultations.find(c => c.id === pathId) || consultations[0];
  const [tab, setTab] = useState("Resumen");

  return <>
    <button className="back-link" onClick={() => go("/client/consultations")}><Icon name="arrow" size={17}/> Volver a mis consultas</button>
    <PageHeader eyebrow={`Consulta ${activeConsultation?.status || "confirmada"}`} title={activeConsultation?.title || "Consulta veterinaria"} description={`${activeConsultation?.date || "Hoy"}, ${activeConsultation?.time || "19:30"} · Videoconsulta`} action={<Button icon="video" onClick={() => go(`/call/${activeConsultation?.id || "seguimiento-milo"}?from=client`)}>Entrar a videoconsulta</Button>}/>
    <section className="consultation-summary"><div className="vet-avatar">SM</div><div><small>Profesional</small><strong>{activeConsultation?.vet || "Dr. Santiago Mendoza"}</strong><p>Clínica general · MP 12.884</p></div><div><small>Mascota</small><strong>{activeConsultation?.pet || pets[0]?.name || "Milo"}</strong><p>{pets[0]?.kind || "Canino"}</p></div><div><small>Motivo</small><strong>{activeConsultation?.reason || "Orientación médica"}</strong><p>Teleconsulta telemática</p></div><Status>{activeConsultation?.status || "Confirmada"}</Status></section>
    <Tabs tabs={["Resumen", "Mensajes", "Historial", "Recetas", "Documentos"]} active={tab} onChange={setTab}/>
    {tab === "Resumen" ? <div className="detail-grid"><section className="panel"><div className="panel__heading"><h2>Antes de la consulta</h2></div><div className="checklist"><p><Icon name="check"/> Tené a tu mascota cerca</p><p><Icon name="check"/> Buscá un lugar tranquilo</p><p><Icon name="check"/> Revisá tu conexión</p></div></section><section className="panel"><div className="panel__heading"><h2>Notas para el veterinario</h2></div><p className="muted">{activeConsultation?.reason || "Consulta médica general registrada en sistema."}</p><Button variant="soft" icon="edit" onClick={() => go("/client/triage")}>Editar consulta</Button></section></div> : <section className="panel"><EmptyState icon={tab === "Mensajes" ? "message" : "file"} title={tab} text={`La información de ${tab.toLowerCase()} de esta consulta aparecerá acá.`}/></section>}
  </>;
}

function AppointmentsPage() {
  const { consultations } = useClientData();
  const [modal, setModal] = useState(false);
  return <>
    <PageHeader eyebrow="Organizá tus turnos" title="Agenda" description="Consultas, controles y recordatorios para tus mascotas." action={<Button icon="plus" onClick={() => go("/client/triage")}>Reservar turno</Button>}/>
    <div className="calendar-layout"><section className="panel calendar"><div className="calendar__head"><div><span className="eyebrow">Calendario</span><h2>Julio 2025</h2></div><div><Button variant="icon" icon="chevron" ariaLabel="Mes anterior"/><Button variant="icon" icon="chevron" ariaLabel="Mes siguiente"/></div></div><div className="calendar__week">{["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => <span key={d}>{d}</span>)}</div><div className="calendar__days">{Array.from({length:35},(_,i) => { const day=i-1; return <button className={`${day === 15 ? "is-today" : ""} ${day === 18 ? "has-event" : ""}`} key={i}>{day > 0 && day <= 31 ? day : ""}</button>;})}</div><div className="calendar__legend"><span><i className="teal-dot"/>Consulta confirmada</span><span><i className="amber-dot"/>Pendiente</span></div></section><aside className="panel agenda-list"><div className="panel__heading"><div><span className="eyebrow">Próximos</span><h2>Tus turnos</h2></div></div>{consultations.length > 0 ? consultations.slice(0,2).map(item => <div className="agenda-item" key={item.id}><div><b>{item.date} · {item.time}</b><strong>{item.title}</strong><span>{item.pet} · {item.vet}</span></div><Status tone={item.status === "Pendiente" ? "amber" : "teal"}>{item.status}</Status><button onClick={() => setModal(true)}>Cancelar</button></div>) : <p className="v-mini-empty" style={{ padding: 16 }}>No tenés turnos programados.</p>}</aside></div>
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
  return <>
    <PageHeader eyebrow="Chat clínico" title="Mensajes" description="Conversaciones vinculadas al cuidado de tus mascotas."/>
    <div className="panel">
      <EmptyState icon="message" title="No tenés conversaciones activas" text="Cuando inicies una consulta o te comuniques con un veterinario, el chat aparecerá acá." action="Nueva consulta"/>
    </div>
    {toast && <Toast message="Mensaje enviado."/>}
  </>;
}

function NotificationsPage() {
  return <>
    <PageHeader eyebrow="Novedades importantes" title="Notificaciones" description="Todo lo que necesitás saber sobre la salud de tus mascotas."/>
    <div className="panel">
      <EmptyState icon="bell" title="Sin notificaciones pendientes" text="Te avisaremos acá cuando haya novedades sobre tus consultas o recetas."/>
    </div>
  </>;
}

function PrescriptionsPage() {
  const [active, setActive] = useState("Activas");
  return <>
    <PageHeader eyebrow="Indicaciones médicas" title="Recetas" description="Consultá tratamientos e indicaciones emitidas por tus veterinarios."/>
    <Tabs tabs={["Activas", "Anteriores"]} active={active} onChange={setActive}/>
    <div className="panel">
      <EmptyState icon="file" title="No tenés recetas en esta sección." text="Cuando un veterinario emita una receta o plan de tratamiento para tus mascotas, aparecerá acá."/>
    </div>
  </>;
}

function TriagePage() {
  const { pets } = useClientData();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const critical = answer.includes("Dificultad para respirar") || answer.includes("Sangrado");
  const options = ["Dificultad para respirar", "Vómitos", "Diarrea", "Herida", "Intoxicación", "Dolor", "Sangrado", "Otro"];

  if (step === 3) return <TriageResult critical={critical} fullAnswer={answer} onRestart={() => { setStep(0); setAnswer(""); }}/>;

  return <div className="triage-page"><div className="triage-top"><Logo/><button onClick={() => go("/client/dashboard")}><Icon name="close"/> Salir</button></div><div className="triage-progress"><span style={{width:`${(step + 1) * 33}%`}}/><small>Paso {step + 1} de 3 · Cerca de 60 segundos</small></div><main className="triage-card"><span className="triage-icon"><Icon name={step === 0 ? "heart" : step === 1 ? "paw" : "clock"} size={28}/></span><span className="eyebrow">Orientación inicial</span><h1>{step === 0 ? "¿Qué está pasando?" : step === 1 ? "¿A quién vamos a ayudar?" : "¿Cuándo empezó?"}</h1><p>{step === 0 ? "Elegí la opción que mejor describa lo que ves. No hace falta que tengas toda la información." : step === 1 ? "Seleccioná una de tus mascotas para que podamos orientarte mejor." : "Esta información nos ayuda a estimar el nivel de atención."}</p><div className={step === 0 ? "option-grid" : "option-list"}>{step === 0 && options.map((option) => <button className={answer === option ? "is-selected" : ""} onClick={() => setAnswer(option)} key={option}><span>{option}</span>{answer === option && <Icon name="check"/>}</button>)}{step === 1 && pets.slice(0,3).map(pet => <button className={answer.includes("|"+pet.name) ? "is-selected" : ""} onClick={() => setAnswer(answer.split("|")[0]+"|"+pet.name+"|"+pet.id)} key={pet.id}><img src={pet.photo} alt=""/><span><strong>{pet.name}</strong><small>{pet.kind} · {pet.breed}</small></span><Icon name="chevron"/></button>)}{step === 2 && ["Hace menos de una hora","Hoy","Entre ayer y hoy","Hace varios días"].map(option => <button className={answer.includes("|"+option) ? "is-selected" : ""} onClick={() => setAnswer(answer.split("|").slice(0,3).join("|")+"|"+option)} key={option}><span>{option}</span>{answer.includes("|"+option) && <Icon name="check"/>}</button>)}</div><div className="triage-actions">{step > 0 && <Button variant="secondary" onClick={() => setStep(step-1)}>Volver</Button>}<Button disabled={!answer} onClick={() => setStep(step+1)}>Continuar <Icon name="arrow" size={17}/></Button></div><small className="triage-disclaimer"><Icon name="shield" size={15}/> Esta orientación no reemplaza una evaluación veterinaria.</small></main></div>;
}

function TriageResult({ critical, fullAnswer, onRestart }: { critical: boolean; fullAnswer: string; onRestart: () => void }) {
  const [matched, setMatched] = useState(false);
  const [createdConsId, setCreatedConsId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { pets } = useClientData();

  const handleConnect = async () => {
    setIsSubmitting(true);
    try {
      const parts = fullAnswer.split("|");
      const symptom = parts[0] || "Consulta general";
      const petIdFromAnswer = parts[2];
      const selectedPet = pets.find(p => p.id === petIdFromAnswer) || pets[0];
      const petId = selectedPet ? selectedPet.id : undefined;

      if (petId) {
        const res = await api.post<ApiResponse<BackendConsultation>>('/api/consultations', {
          petId,
          notes: symptom,
          symptoms: [symptom],
          duration: parts[3]?.includes('hora') ? 'LESS_THAN_2_HOURS' : 'HOURS_2_TO_12',
        });
        if (res.data.success && res.data.data) {
          queryClient.invalidateQueries({ queryKey: ['consultations', 'mine'] });
          setCreatedConsId(res.data.data.id);
        }
      }
    } catch {
      // Fallback grace
    } finally {
      setIsSubmitting(false);
      setMatched(true);
    }
  };

  if (matched) return <div className="triage-page"><div className="triage-top"><Logo/></div><main className="matching-card"><div className="matching-visual"><span/><span/><span/><Icon name="search" size={30}/></div><span className="eyebrow">{critical ? "Prioridad alta" : "Prioridad moderada"}</span><h1>Veterinario encontrado</h1><p>Hay un profesional disponible para acompañarte ahora.</p><div className="matched-vet"><div className="vet-avatar vet-avatar--large">SM</div><div><strong>Dr. Santiago Mendoza</strong><span>Clínica general · Animales de compañía</span><small>Disponible ahora</small></div></div><Button onClick={() => go(createdConsId ? `/call/${createdConsId}?from=client` : "/client/consultations/seguimiento-milo")}>Entrar a la consulta <Icon name="arrow" size={17}/></Button></main></div>;
  return <div className="triage-page"><div className="triage-top"><Logo/></div><main className={`result-card ${critical ? "result-card--critical" : ""}`}><span className="result-card__icon"><Icon name={critical ? "phone" : "heart"} size={31}/></span><span className="eyebrow">{critical ? "Atención inmediata" : "Orientación completada"}</span><h1>{critical ? "Necesitás atención veterinaria inmediata." : "Nivel de atención: MODERADO"}</h1><p>{critical ? "Por lo que nos contaste, es importante actuar ahora. Contactá una guardia veterinaria presencial mientras te conectamos con un profesional." : "Según las respuestas ingresadas, recomendamos conectar con un veterinario."}</p>{critical && <div className="critical-guidance"><strong>Mientras buscás atención:</strong><p>Mantené a tu mascota tranquila y en un lugar seguro.</p><p>No le des comida, agua ni medicación sin indicación profesional.</p><p>Si podés trasladarla, buscá una guardia veterinaria cercana.</p></div>}<div className="estimate"><span><Icon name="clock"/><small>Tiempo estimado</small></span><strong>{critical ? "Ahora" : "4 minutos"}</strong></div><div className="result-actions"><Button onClick={handleConnect} disabled={isSubmitting}>{isSubmitting ? "Conectando..." : critical ? "Conectar con atención veterinaria" : "Conectar con veterinario"}</Button>{critical && <Button variant="secondary">Buscar atención presencial inmediata</Button>}</div><button className="text-button" onClick={onRestart}>Revisar respuestas</button><small className="triage-disclaimer">VetConnect no reemplaza una guardia veterinaria presencial.</small></main></div>;
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
