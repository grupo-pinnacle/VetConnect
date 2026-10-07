import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  const queryClient = useQueryClient();
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
        {consultationsLoading ? (
          <div className="skeleton skeleton--hero" style={{ height: 110 }}/>
        ) : nextConsultation ? (
          <ConsultationCard item={nextConsultation}/>
        ) : (
          <div className="panel"><EmptyState icon="calendar" title="Sin consultas programadas" text="Cuando reserves un turno o pidas atención, aparecerá acá." action="Nueva consulta" onAction={() => go("/client/triage")}/></div>
        )}
      </section>

      {consultationsLoading ? (
        <aside className="care-note">
          <Icon name="shield" size={25}/>
          <div>
            <h3>Cuidado preventivo</h3>
            <p>Mantené la información médica de tus mascotas al día para agilizar la atención de guardia.</p>
          </div>
          <button onClick={() => go("/client/pets")}>Gestionar mascotas</button>
        </aside>
      ) : nextConsultation ? (
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
          <button onClick={() => pets.length > 0 ? go("/client/pets") : setModalOpen(true)}>Gestionar mascotas</button>
        </aside>
      )}
    </div>

    <section>
      <div className="section-heading"><div><span className="eyebrow">Su salud, en un solo lugar</span><h2>Tus mascotas</h2></div><button onClick={() => go("/client/pets")}>Ver todas <Icon name="arrow" size={16}/></button></div>
      {petsLoading ? (
        <div className="pet-grid pet-grid--dashboard">
          <div className="skeleton skeleton--card"/>
        </div>
      ) : pets.length > 0 ? (
        <div className="pet-grid pet-grid--dashboard">{pets.slice(0, 3).map((pet) => <PetCard pet={pet} compact key={pet.id}/>)}</div>
      ) : (
        <div className="pet-grid pet-grid--dashboard">
          <div className="pet-card--add" onClick={() => setModalOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setModalOpen(true); }}>
            <span><Icon name="plus" size={24}/></span>
            <h3>Agregar mi primera mascota</h3>
            <p>Abrí su ficha clínica para organizar vacunas, estudios y pedir atención veterinaria.</p>
            <Button variant="primary" icon="plus" onClick={() => setModalOpen(true)}>Agregar mascota</Button>
          </div>
        </div>
      )}
    </section>

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

function PetsPage() {
  const { pets } = useClientData();
  const queryClient = useQueryClient();
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

  const isActuallyEmpty = pets.length === 0;

  return <>
    <PageHeader eyebrow="Familia VetConnect" title="Mis mascotas" description="Su información de salud, organizada y siempre a mano." action={<Button icon="plus" onClick={() => setModalOpen(true)}>Agregar mascota</Button>}/>
    <div className="view-toggle"><span>{pets.length} {pets.length === 1 ? "mascota" : "mascotas"}</span></div>
    {isActuallyEmpty ? (
      <EmptyState icon="paw" title="Todavía no agregaste ninguna mascota" text="Agregá una mascota para comenzar a organizar su información." action="Agregar mascota" onAction={() => setModalOpen(true)}/>
    ) : (
      <div className="pet-grid">{pets.map((pet) => <PetCard pet={pet} key={pet.id}/>)}</div>
    )}

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
  const queryClient = useQueryClient();
  const pet = pets.find((item) => item.id === id) || pets[0];
  const [tab, setTab] = useState("Información general");
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [vaccineModal, setVaccineModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit pet state
  const [editName, setEditName] = useState(pet?.name || "");
  const [editKind, setEditKind] = useState(pet?.kind || "Perro");
  const [editBreed, setEditBreed] = useState(pet?.breed || "");
  const [editWeight, setEditWeight] = useState(pet?.weight ? pet.weight.replace(" kg", "").replace(" g", "").trim() : "");
  const [editSex, setEditSex] = useState("Macho");
  const [editMicrochip, setEditMicrochip] = useState(pet?.microchip && pet.microchip !== "No informado" ? pet.microchip : "");
  const [editAllergies, setEditAllergies] = useState(pet?.allergies && pet.allergies !== "Sin alergias conocidas" ? pet.allergies : "");

  // Vaccines local storage / state per pet
  const [vaccines, setVaccines] = useState<{ id: string; name: string; date: string; nextDate: string; status: "Al día" | "Próxima" | "Vencida" }[]>(() => {
    try {
      const stored = localStorage.getItem(`vetconnect_vaccines_${pet?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [vacName, setVacName] = useState("");
  const [vacDate, setVacDate] = useState("");
  const [vacNext, setVacNext] = useState("");
  const [vacStatus, setVacStatus] = useState<"Al día" | "Próxima" | "Vencida">("Al día");

  // Documents state per pet
  const [docs, setDocs] = useState<{ id: string; name: string; type: string; date: string; size: string }[]>(() => {
    try {
      const stored = localStorage.getItem(`vetconnect_docs_${pet?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Estudio médico");

  useEffect(() => {
    if (pet) {
      setEditName(pet.name);
      setEditKind(pet.kind);
      setEditBreed(pet.breed);
      setEditWeight(pet.weight ? pet.weight.replace(" kg", "").replace(" g", "").trim() : "");
      setEditMicrochip(pet.microchip && pet.microchip !== "No informado" ? pet.microchip : "");
      setEditAllergies(pet.allergies && pet.allergies !== "Sin alergias conocidas" ? pet.allergies : "");
      try {
        const storedV = localStorage.getItem(`vetconnect_vaccines_${pet.id}`);
        setVaccines(storedV ? JSON.parse(storedV) : []);
        const storedD = localStorage.getItem(`vetconnect_docs_${pet.id}`);
        setDocs(storedD ? JSON.parse(storedD) : []);
      } catch {
        // noop
      }
    }
  }, [pet?.id]);

  const updatePetMutation = useMutation({
    mutationFn: async (payload: { name: string; species: string; breed: string; weightKg?: number; sex?: string; microchip?: string; allergies?: string }) => {
      const res = await api.patch<ApiResponse<BackendPet>>(`/api/pets/${pet.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setEditModal(false);
      setToastMsg("Ficha actualizada con éxito");
      setTimeout(() => setToastMsg(null), 3500);
    },
    onError: () => {
      setToastMsg("Error al actualizar la ficha");
      setTimeout(() => setToastMsg(null), 3500);
    },
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updatePetMutation.mutate({
      name: editName.trim(),
      species: editKind,
      breed: editBreed.trim() || "Mestizo",
      weightKg: editWeight ? parseFloat(editWeight) : undefined,
      sex: editSex,
      microchip: editMicrochip.trim() ? editMicrochip.trim() : undefined,
      allergies: editAllergies.trim() ? editAllergies.trim() : undefined,
    });
  };

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName.trim()) return;
    const newVac = {
      id: `vac-${Date.now()}`,
      name: vacName.trim(),
      date: vacDate || new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }),
      nextDate: vacNext || "A definir",
      status: vacStatus,
    };
    const updated = [...vaccines, newVac];
    setVaccines(updated);
    if (pet?.id) localStorage.setItem(`vetconnect_vaccines_${pet.id}`, JSON.stringify(updated));
    setVaccineModal(false);
    setVacName("");
    setVacDate("");
    setVacNext("");
    setToastMsg("Vacuna registrada exitosamente");
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: docName.trim(),
      type: `${docType} · PDF`,
      date: new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }),
      size: "1,2 MB",
    };
    const updated = [...docs, newDoc];
    setDocs(updated);
    if (pet?.id) localStorage.setItem(`vetconnect_docs_${pet.id}`, JSON.stringify(updated));
    setDocumentModal(false);
    setDocName("");
    setToastMsg("Documento adjuntado exitosamente");
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteDoc = (docId: string) => {
    const updated = docs.filter(d => d.id !== docId);
    setDocs(updated);
    if (pet?.id) localStorage.setItem(`vetconnect_docs_${pet.id}`, JSON.stringify(updated));
    setDeleteDocId(null);
    setToastMsg("Documento eliminado");
    setTimeout(() => setToastMsg(null), 3500);
  };

  if (!pet) {
    return <section className="panel"><EmptyState icon="paw" title="Mascota no encontrada" text="No pudimos encontrar la información de esta mascota." action="Volver al inicio" onAction={() => go("/client/pets")}/></section>;
  }

  const tabs = ["Información general", "Vacunación", "Antecedentes", "Documentos", "Consultas", "Recetas", "Evolución"];

  return <>
    <button className="back-link" onClick={() => go("/client/pets")}><Icon name="arrow" size={17}/> Volver a mis mascotas</button>
    <section className="pet-hero">
      <img src={pet.photo} alt={pet.name}/>
      <div className="pet-hero__title">
        <span className="eyebrow">Ficha de mascota</span>
        <h1>{pet.name}</h1>
        <p>{pet.kind} · {pet.breed}</p>
        <Status>{pet.state}</Status>
      </div>
      <div className="pet-hero__facts">
        <span><small>Edad</small><strong>{pet.age}</strong></span>
        <span><small>Sexo</small><strong>{editSex}</strong></span>
        <span><small>Peso</small><strong>{pet.weight}</strong></span>
        <span><small>Microchip</small><strong>{pet.microchip || "No informado"}</strong></span>
      </div>
      <Button variant="secondary" icon="edit" onClick={() => setEditModal(true)}>Editar ficha</Button>
    </section>

    <Tabs tabs={tabs} active={tab} onChange={setTab}/>

    {tab === "Información general" && <div className="detail-grid">
      <section className="panel">
        <div className="panel__heading">
          <div><span className="eyebrow">Resumen</span><h2>Información general</h2></div>
          <Button variant="soft" icon="edit" onClick={() => setEditModal(true)}>Editar</Button>
        </div>
        <dl className="info-list">
          <div><dt>Especie</dt><dd>{pet.kind}</dd></div>
          <div><dt>Raza</dt><dd>{pet.breed}</dd></div>
          <div><dt>Microchip ISO</dt><dd>{pet.microchip || "No informado"}</dd></div>
          <div><dt>Estado clínico</dt><dd>{pet.state}</dd></div>
        </dl>
      </section>
      <section className="panel">
        <div className="panel__heading">
          <div><span className="eyebrow">Cuidados actuales</span><h2>Información médica</h2></div>
        </div>
        <div className="medical-items">
          <div><span className="medical-icon"><Icon name="heart"/></span><div><strong>Alergias</strong><p>{pet.allergies || "Sin alergias conocidas"}</p></div></div>
          <div><span className="medical-icon"><Icon name="file"/></span><div><strong>Condiciones crónicas</strong><p>{pet.chronicConditions || "Ninguna registrada"}</p></div></div>
          <div><span className="medical-icon"><Icon name="shield"/></span><div><strong>Última consulta</strong><p>{pet.last}</p></div></div>
        </div>
      </section>
      <section className="panel panel--wide">
        <div className="panel__heading">
          <div><span className="eyebrow">Últimos registros</span><h2>Evolución</h2></div>
          <Button variant="soft" icon="plus" onClick={() => go("/client/triage")}>Nueva consulta</Button>
        </div>
        <div className="timeline">
          <div><span/><div><b>{pet.last}</b><strong>Atención registrada en sistema</strong><p>Expediente sincronizado con la red veterinaria VetConnect.</p></div></div>
        </div>
      </section>
    </div>}

    {tab === "Vacunación" && (
      <section className="panel">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Prevención</span>
            <h2>Vacunación</h2>
            <p>Mantené el calendario de {pet.name} actualizado.</p>
          </div>
          <Button icon="plus" onClick={() => setVaccineModal(true)}>Agregar vacuna</Button>
        </div>
        {vaccines.length > 0 ? (
          <div className="table-list">
            {vaccines.map((v) => (
              <div className="table-row" key={v.id}>
                <div><small>Vacuna</small><strong>{v.name}</strong></div>
                <div><small>Aplicación</small><span>{v.date}</span></div>
                <div><small>Próxima dosis</small><span>{v.nextDate}</span></div>
                <div><Status tone={v.status === "Al día" ? "teal" : v.status === "Próxima" ? "amber" : "red"}>{v.status}</Status></div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="shield" title="Sin vacunas registradas aún" text={`Registrá la libreta sanitaria o certificados de vacunación de ${pet.name}.`} action="Agregar vacuna" onAction={() => setVaccineModal(true)}/>
        )}
      </section>
    )}

    {tab === "Documentos" && (
      <section className="panel">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Biblioteca médica</span>
            <h2>Documentos</h2>
            <p>Estudios, recetas y archivos veterinarios de {pet.name}.</p>
          </div>
          <Button icon="plus" onClick={() => setDocumentModal(true)}>Agregar documento</Button>
        </div>
        {docs.length > 0 ? (
          <div className="document-list">
            {docs.map((doc) => (
              <article className="document-card" key={doc.id}>
                <span className="document-card__icon"><Icon name="file"/></span>
                <div>
                  <strong>{doc.name}</strong>
                  <p>{doc.type} · {doc.date} · {doc.size}</p>
                  <small>Expediente clínico</small>
                </div>
                <div className="document-card__actions">
                  <Button variant="soft" onClick={() => setToastMsg(`Visualizando ${doc.name}`)}>Ver</Button>
                  <Button variant="icon" icon="download" ariaLabel={`Descargar ${doc.name}`} onClick={() => setToastMsg(`Descargando ${doc.name}`)}/>
                  <Button variant="icon" icon="trash" ariaLabel={`Eliminar ${doc.name}`} onClick={() => setDeleteDocId(doc.id)}/>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="file" title="No hay documentos adjuntos aún" text={`Subí certificados, análisis o radiografías de ${pet.name} para tenerlos siempre a mano.`} action="Agregar documento" onAction={() => setDocumentModal(true)}/>
        )}
      </section>
    )}

    {!["Información general", "Vacunación", "Documentos"].includes(tab) && (
      <section className="panel">
        <EmptyState 
          icon="file" 
          title={`${tab} de ${pet.name}`} 
          text={`Cuando haya nueva información de ${tab.toLowerCase()}, la vas a encontrar organizada acá.`} 
          action="Nueva consulta"
          onAction={() => go("/client/triage")}
        />
      </section>
    )}

    {editModal && (
      <div className="modal-layer" role="presentation">
        <button className="modal-scrim" onClick={() => setEditModal(false)} aria-label="Cerrar modal"/>
        <div className="modal" role="dialog" aria-modal="true" style={{ textAlign: "left", width: "min(500px, calc(100% - 32px))" }}>
          <button className="button button--icon modal__close" onClick={() => setEditModal(false)} aria-label="Cerrar"><Icon name="close" size={18}/></button>
          <span className="modal__icon"><Icon name="edit"/></span>
          <h2 style={{ textAlign: "center" }}>Editar ficha de {pet.name}</h2>
          <p style={{ textAlign: "center", marginBottom: 20 }}>Actualizá los datos de tu mascota en su historia clínica.</p>
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <label className="field"><span>Nombre</span><input value={editName} onChange={(e) => setEditName(e.target.value)} required/></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="field"><span>Especie</span>
                  <select value={editKind} onChange={(e) => setEditKind(e.target.value)} style={{ width: "100%", height: 43, borderRadius: 10, border: "1px solid var(--line)", padding: "0 12px", background: "white", color: "var(--ink)" }}>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Ave">Ave</option>
                    <option value="Hurón">Hurón</option>
                    <option value="Otro">Otro</option>
                  </select>
                </label>
                <label className="field"><span>Sexo</span>
                  <select value={editSex} onChange={(e) => setEditSex(e.target.value)} style={{ width: "100%", height: 43, borderRadius: 10, border: "1px solid var(--line)", padding: "0 12px", background: "white", color: "var(--ink)" }}>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="field"><span>Raza</span><input value={editBreed} onChange={(e) => setEditBreed(e.target.value)}/></label>
                <label className="field"><span>Peso (kg)</span><input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)}/></label>
              </div>
              <label className="field"><span>Microchip (15 dígitos)</span><input value={editMicrochip} onChange={(e) => setEditMicrochip(e.target.value)} placeholder="Ej: 032884912000000"/></label>
              <label className="field"><span>Alergias conocidas</span><input value={editAllergies} onChange={(e) => setEditAllergies(e.target.value)} placeholder="Ej: Polen estacional / Ninguna"/></label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <Button variant="secondary" onClick={() => setEditModal(false)}>Cancelar</Button>
              <Button variant="primary" disabled={updatePetMutation.isPending}>{updatePetMutation.isPending ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {vaccineModal && (
      <div className="modal-layer" role="presentation">
        <button className="modal-scrim" onClick={() => setVaccineModal(false)} aria-label="Cerrar modal"/>
        <div className="modal" role="dialog" aria-modal="true" style={{ textAlign: "left", width: "min(460px, calc(100% - 32px))" }}>
          <button className="button button--icon modal__close" onClick={() => setVaccineModal(false)} aria-label="Cerrar"><Icon name="close" size={18}/></button>
          <span className="modal__icon"><Icon name="shield"/></span>
          <h2 style={{ textAlign: "center" }}>Registrar vacuna</h2>
          <p style={{ textAlign: "center", marginBottom: 20 }}>Agregá una vacuna aplicada o programada para {pet.name}.</p>
          <form onSubmit={handleAddVaccine}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <label className="field"><span>Nombre de la vacuna</span><input value={vacName} onChange={(e) => setVacName(e.target.value)} placeholder="Ej: Antirrábica / Séxtuple" required/></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="field"><span>Fecha de aplicación</span><input value={vacDate} onChange={(e) => setVacDate(e.target.value)} placeholder="Ej: 12 Mar 2026"/></label>
                <label className="field"><span>Próxima dosis</span><input value={vacNext} onChange={(e) => setVacNext(e.target.value)} placeholder="Ej: 12 Mar 2027"/></label>
              </div>
              <label className="field"><span>Estado</span>
                <select value={vacStatus} onChange={(e) => setVacStatus(e.target.value as "Al día" | "Próxima" | "Vencida")} style={{ width: "100%", height: 43, borderRadius: 10, border: "1px solid var(--line)", padding: "0 12px", background: "white", color: "var(--ink)" }}>
                  <option value="Al día">Al día</option>
                  <option value="Próxima">Próxima</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <Button variant="secondary" onClick={() => setVaccineModal(false)}>Cancelar</Button>
              <Button variant="primary">Guardar vacuna</Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {documentModal && (
      <div className="modal-layer" role="presentation">
        <button className="modal-scrim" onClick={() => setDocumentModal(false)} aria-label="Cerrar modal"/>
        <div className="modal" role="dialog" aria-modal="true" style={{ textAlign: "left", width: "min(460px, calc(100% - 32px))" }}>
          <button className="button button--icon modal__close" onClick={() => setDocumentModal(false)} aria-label="Cerrar"><Icon name="close" size={18}/></button>
          <span className="modal__icon"><Icon name="file"/></span>
          <h2 style={{ textAlign: "center" }}>Adjuntar documento</h2>
          <p style={{ textAlign: "center", marginBottom: 20 }}>Subí un estudio, receta o certificado para {pet.name}.</p>
          <form onSubmit={handleAddDoc}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <label className="field"><span>Nombre del documento</span><input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Ej: Radiografía de tórax" required/></label>
              <label className="field"><span>Tipo de documento</span>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ width: "100%", height: 43, borderRadius: 10, border: "1px solid var(--line)", padding: "0 12px", background: "white", color: "var(--ink)" }}>
                  <option value="Estudio médico">Estudio médico</option>
                  <option value="Análisis de sangre">Análisis de sangre</option>
                  <option value="Certificado">Certificado de vacunación</option>
                  <option value="Receta veterinaria">Receta veterinaria</option>
                  <option value="Otro">Otro archivo</option>
                </select>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <Button variant="secondary" onClick={() => setDocumentModal(false)}>Cancelar</Button>
              <Button variant="primary">Adjuntar</Button>
            </div>
          </form>
        </div>
      </div>
    )}

    {deleteDocId && (
      <Modal 
        title="Eliminar documento" 
        text="¿Seguro que querés eliminar este documento? Esta acción no se puede deshacer." 
        cancel="Volver" 
        confirm="Eliminar documento" 
        destructive 
        onClose={() => setDeleteDocId(null)} 
        onConfirm={() => handleDeleteDoc(deleteDocId)}
      />
    )}

    {toastMsg && <Toast message={toastMsg} tone={toastMsg.includes("Error") ? "error" : "success"}/>}
  </>;
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
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real-time Calendar state
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  const monthName = viewDate.toLocaleDateString("es-AR", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Month navigation
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNumber = today.getDate();

  // Map dates with consultations
  const eventDays = useMemo(() => {
    const map = new Map<number, "confirmada" | "pendiente">();
    consultations.forEach(c => {
      // If consultation has date matching current month/year
      const dayNum = parseInt(c.date, 10);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
        map.set(dayNum, c.status === "Confirmada" ? "confirmada" : "pendiente");
      }
    });
    return map;
  }, [consultations]);

  // Filter consultations
  const filteredConsultations = useMemo(() => {
    if (!selectedDateStr) return consultations;
    return consultations.filter(c => {
      const dayNum = parseInt(c.date, 10);
      return String(dayNum) === selectedDateStr;
    });
  }, [consultations, selectedDateStr]);

  const cancelMutation = useMutation({
    mutationFn: async (consId: string) => {
      const res = await api.patch<ApiResponse<BackendConsultation>>(`/api/consultations/${consId}/status`, { status: "CANCELLED" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations', 'mine'] });
      setModal(null);
      setToastMsg("Turno cancelado correctamente");
      setTimeout(() => setToastMsg(null), 3500);
    },
    onError: () => {
      setToastMsg("No se pudo cancelar el turno");
      setTimeout(() => setToastMsg(null), 3500);
    },
  });

  return <>
    <PageHeader eyebrow="Organizá tus turnos" title="Agenda" description="Consultas, controles y recordatorios para tus mascotas." action={<Button icon="plus" onClick={() => go("/client/triage")}>Reservar turno</Button>}/>
    <div className="calendar-layout">
      <section className="panel calendar">
        <div className="calendar__head">
          <div>
            <span className="eyebrow">Calendario</span>
            <h2>{capitalizedMonth} {year}</h2>
          </div>
          <div>
            <Button variant="icon" icon="chevron" ariaLabel="Mes anterior" onClick={prevMonth}/>
            <Button variant="icon" icon="chevron" ariaLabel="Mes siguiente" onClick={nextMonth} className="calendar-nav-next"/>
          </div>
        </div>
        <div className="calendar__week">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="calendar__days">
          {/* Empty padding days for previous month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <button key={`pad-${i}`} disabled style={{ opacity: 0.2 }}> </button>
          ))}
          {/* Month days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const isToday = isCurrentMonth && dayNum === todayDateNumber;
            const isSelected = selectedDateStr === String(dayNum);
            const hasEvent = eventDays.has(dayNum);
            return (
              <button 
                key={dayNum}
                className={`${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""} ${hasEvent ? "has-event" : ""}`}
                onClick={() => setSelectedDateStr(isSelected ? null : String(dayNum))}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
        <div className="calendar__legend">
          <span><i className="teal-dot"/>Consulta confirmada</span>
          <span><i className="amber-dot"/>Pendiente</span>
          {selectedDateStr && (
            <button 
              onClick={() => setSelectedDateStr(null)} 
              style={{ marginLeft: "auto", border: 0, background: "none", color: "var(--teal-deep)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
            >
              Ver todos los turnos
            </button>
          )}
        </div>
      </section>

      <aside className="panel agenda-list">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">{selectedDateStr ? `Día ${selectedDateStr} de ${capitalizedMonth}` : "Próximos"}</span>
            <h2>{selectedDateStr ? "Turnos del día" : "Tus turnos"}</h2>
          </div>
        </div>
        {filteredConsultations.length > 0 ? (
          filteredConsultations.map(item => (
            <div className="agenda-item" key={item.id}>
              <div>
                <b>{item.date} · {item.time}</b>
                <strong>{item.title}</strong>
                <span>{item.pet} · {item.vet}</span>
              </div>
              <div className="agenda-item__actions">
                <Status tone={item.status === "Cancelada" ? "gray" : item.status === "Pendiente" ? "amber" : "teal"}>
                  {item.status}
                </Status>
                {item.status !== "Cancelada" && item.status !== "Finalizada" && (
                  <button onClick={() => setModal(item.id)}>Cancelar turno</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="v-mini-empty" style={{ padding: "24px 0", color: "var(--ink-soft)", fontSize: 12, textAlign: "center" }}>
            {selectedDateStr ? "No tenés turnos agendados para este día." : "No tenés turnos programados."}
          </p>
        )}
      </aside>
    </div>

    {modal && (
      <Modal 
        title="Cancelar consulta" 
        text="¿Seguro que querés cancelar esta consulta? El turno quedará liberado para otro paciente." 
        cancel="Volver" 
        confirm="Cancelar consulta" 
        destructive 
        onClose={() => setModal(null)}
        onConfirm={() => cancelMutation.mutate(modal)}
      />
    )}
    {toastMsg && <Toast message={toastMsg} tone={toastMsg.includes("No") ? "error" : "success"}/>}
  </>;
}

function WhatsAppCheck({ state }: { state: "sending" | "sent" | "delivered" | "read" }) {
  if (state === "sending" || state === "sent") {
    return (
      <svg width="15" height="11" viewBox="0 0 16 11" fill="none" aria-label="Enviado">
        <path d="M1.5 6L5.5 10L14.5 1" stroke="#8696a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  const color = state === "read" ? "#53bdeb" : "#8696a0";
  return (
    <svg width="16" height="11" viewBox="0 0 18 11" fill="none" aria-label={state === "read" ? "Leído" : "Entregado"}>
      <path d="M1 6L5 10L14 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 6L9 10L18 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface WADocAttachment {
  title: string;
  sub: string;
  bannerTag?: string;
  bannerTitle?: string;
}

interface WAMessageItem {
  id: string;
  sender: "me" | "them";
  senderName?: string;
  text?: string;
  doc?: WADocAttachment;
  time: string;
  state: "sending" | "sent" | "delivered" | "read";
}

interface WAChatConversation {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  isOnline: boolean;
  statusText: string;
  lastTime: string;
  preview: string;
  unreadCount?: number;
  isPinned?: boolean;
  category: "vets" | "consults";
  messages: WAMessageItem[];
}

function MessagesPage() {
  const { pets, consultations } = useClientData();
  const petName = pets[0]?.name || "Milo";

  const [activeChip, setActiveChip] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string>("santiago");
  const [inputText, setInputText] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<WAChatConversation[]>([
    {
      id: "santiago",
      name: "Dr. Santiago Mendoza",
      role: `Clínica general · Veterinario de ${petName}`,
      avatarText: "SM",
      isOnline: true,
      statusText: "en línea",
      lastTime: "12:38 p. m.",
      preview: "✓✓ Perfecto doctor, muchas gracias. Ya me descargué...",
      isPinned: true,
      category: "consults",
      messages: [
        {
          id: "m-1",
          sender: "them",
          senderName: "Dr. Santiago Mendoza",
          text: `¡Hola Mariana! Ya revisé la evolución clínica de ${petName} respecto al control dermatológico. El cuadro inflamatorio cedió notablemente y la piel está en excelente estado.`,
          time: "12:30 p. m.",
          state: "read",
        },
        {
          id: "m-2",
          sender: "them",
          senderName: "Dr. Santiago Mendoza",
          doc: {
            title: `INFORME_CLINICO_Y_PLAN_TRATAMIENTO_${petName.toUpperCase()}_2026.pdf`,
            sub: "48 páginas • PDF • 2.2 MB",
            bannerTag: "HISTORIA CLÍNICA OFICIAL",
            bannerTitle: "VetConnect · Evaluación Dermatológica",
          },
          time: "12:35 p. m.",
          state: "read",
        },
        {
          id: "m-3",
          sender: "them",
          senderName: "Dr. Santiago Mendoza",
          text: `Plan terapéutico para ${petName}:\n1. Continuar comprimido antialérgico cada 24 hs por la mañana.\n2. Baño con shampoo antiséptico el día jueves (dejar actuar 10 min antes de enjuagar).\n3. Mantener cepillado suave con cardina para oxigenar el manto.\n4. Próximo control: videoconsulta de seguimiento el viernes.`,
          time: "12:36 p. m.",
          state: "read",
        },
        {
          id: "m-4",
          sender: "me",
          text: "Perfecto doctor, muchas gracias. Ya me descargué el informe y el jueves le hago el baño terapéutico como me indicó.",
          time: "12:38 p. m.",
          state: "read",
        },
      ],
    },
    {
      id: "camila",
      name: "Dra. Camila López",
      role: "Especialista en Nutrición Animal",
      avatarText: "CL",
      isOnline: false,
      statusText: "Última vez hoy a las 11:35 a. m.",
      lastTime: "11:29 a. m.",
      preview: "Avisame si notás alguna alteración gastrointestinal...",
      unreadCount: 2,
      category: "vets",
      messages: [
        {
          id: "c-1",
          sender: "them",
          senderName: "Dra. Camila López",
          text: "Hola Mariana, ¿cómo viene tolerando Luna la transición al nuevo alimento balanceado húmedo?",
          time: "11:25 a. m.",
          state: "delivered",
        },
        {
          id: "c-2",
          sender: "them",
          senderName: "Dra. Camila López",
          text: "Avisame si notás alguna alteración gastrointestinal para regular la ración diaria antes del fin de semana.",
          time: "11:29 a. m.",
          state: "delivered",
        },
      ],
    },
    {
      id: "guardia",
      name: "Guardia VetConnect 24hs",
      role: "Atención Médica Inmediata y Triage",
      avatarText: "VC",
      isOnline: true,
      statusText: "Disponible 24/7",
      lastTime: "Ayer",
      preview: "Si notás síntomas críticos como dificultad respiratoria...",
      isPinned: true,
      category: "consults",
      messages: [
        {
          id: "g-1",
          sender: "them",
          senderName: "Guardia VetConnect",
          text: "Canal oficial de guardia y soporte clínico 24/7 de VetConnect.",
          time: "Ayer",
          state: "read",
        },
        {
          id: "g-2",
          sender: "them",
          senderName: "Guardia VetConnect",
          text: "Si notás síntomas críticos como dificultad respiratoria o sangrado, ingresá a 'Necesito atención' para triage y conexión prioritaria por videoconsulta.",
          time: "Ayer",
          state: "read",
        },
      ],
    },
    {
      id: "martin",
      name: "Dr. Martín Silva",
      role: "Cirugía Veterinaria & Traumatología",
      avatarText: "MS",
      isOnline: false,
      statusText: "Última vez lunes a las 18:20",
      lastTime: "Lunes",
      preview: "✓✓ Muchas gracias Dr. Silva, nos vemos en la fecha...",
      category: "vets",
      messages: [
        {
          id: "s-1",
          sender: "them",
          senderName: "Dr. Martín Silva",
          text: "Mariana, te confirmo que los análisis prequirúrgicos están totalmente en regla para la intervención programada.",
          time: "Lunes",
          state: "read",
        },
        {
          id: "s-2",
          sender: "me",
          text: "Muchas gracias Dr. Silva, nos vemos en la fecha pactada.",
          time: "Lunes",
          state: "read",
        },
      ],
    },
  ]);

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const filteredChats = useMemo(() => {
    return conversations.filter((chat) => {
      if (activeChip === "No leídos" && (!chat.unreadCount || chat.unreadCount === 0)) return false;
      if (activeChip === "Consultas" && chat.category !== "consults") return false;
      if (activeChip === "Veterinarios" && chat.category !== "vets") return false;
      if (activeChip === "Archivados") return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return chat.name.toLowerCase().includes(q) || chat.preview.toLowerCase().includes(q) || chat.role.toLowerCase().includes(q);
    });
  }, [conversations, activeChip, searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatId, activeChat?.messages, isTyping]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileThreadOpen(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: undefined } : c))
    );
  };

  const handleSend = (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content) return;

    const newMsgId = `msg-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

    const newMsg: WAMessageItem = {
      id: newMsgId,
      sender: "me",
      text: content,
      time: nowTime,
      state: "sent",
    };

    setConversations((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            lastTime: nowTime,
            preview: `✓✓ ${content}`,
            messages: [...chat.messages, newMsg],
          };
        }
        return chat;
      })
    );

    setInputText("");
    setShowEmojiMenu(false);
    setShowAttachMenu(false);

    // Transition ticks: sent -> delivered -> read
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((chat) => ({
          ...chat,
          messages: chat.messages.map((m) => (m.id === newMsgId ? { ...m, state: "delivered" } : m)),
        }))
      );
    }, 450);

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((chat) => ({
          ...chat,
          messages: chat.messages.map((m) => (m.id === newMsgId ? { ...m, state: "read" } : m)),
        }))
      );
    }, 950);

    // Simulated authentic reply from veterinarian
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyTime = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        const replyMsg: WAMessageItem = {
          id: `reply-${Date.now()}`,
          sender: "them",
          senderName: activeChat.name,
          text: `Recibido Mariana. Cualquier cambio o consulta adicional que tengas con ${petName}, escribime por acá y lo monitoreamos en conjunto.`,
          time: replyTime,
          state: "read",
        };
        setConversations((prev) =>
          prev.map((chat) => {
            if (chat.id === activeChat.id) {
              return {
                ...chat,
                lastTime: replyTime,
                preview: replyMsg.text || "",
                messages: [...chat.messages, replyMsg],
              };
            }
            return chat;
          })
        );
      }, 2000);
    }, 1500);
  };

  const handleAttachDoc = (docTitle: string) => {
    setShowAttachMenu(false);
    const newMsgId = `doc-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const newDocMsg: WAMessageItem = {
      id: newMsgId,
      sender: "me",
      doc: {
        title: docTitle,
        sub: "3 páginas • PDF • 1.4 MB",
        bannerTag: "DOCUMENTO ADJUNTO",
        bannerTitle: "VetConnect · Certificado Médico",
      },
      time: nowTime,
      state: "read",
    };

    setConversations((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            lastTime: nowTime,
            preview: `✓✓ 📄 ${docTitle}`,
            messages: [...chat.messages, newDocMsg],
          };
        }
        return chat;
      })
    );
    setToastMsg(`Documento adjuntado: ${docTitle}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownloadDoc = (title: string) => {
    setToastMsg(`Descargando ${title}...`);
    setTimeout(() => {
      setToastMsg(`Archivo descargado correctamente: ${title}`);
      setTimeout(() => setToastMsg(null), 3500);
    }, 1200);
  };

  const chips = ["Todos", "No leídos", "Consultas", "Veterinarios", "Archivados"];
  const quickEmojis = ["🐾", "🐶", "🐱", "🩺", "💊", "❤️", "👍", "🙏", "😊", "✨"];

  return (
    <>
      <PageHeader
        eyebrow="Chat clínico oficial"
        title="Mensajes"
        description="Comunicación directa y seguimiento médico con tus veterinarios tratantes."
      />

      <div className="wa-container">
        {/* LEFT SIDEBAR */}
        <aside className={`wa-sidebar ${mobileThreadOpen ? "is-hidden" : ""}`}>
          <div className="wa-sidebar__top">
            <div className="wa-sidebar__brand">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#00a884">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.45 0-2.87-.38-4.12-1.11l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.25-4.42c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
              </svg>
              <span>WhatsApp</span>
            </div>
            <div className="wa-sidebar__actions">
              <button
                className="wa-icon-btn"
                title="Nueva consulta"
                onClick={() => go("/client/triage")}
                aria-label="Nueva consulta"
              >
                <Icon name="plus" size={19} />
              </button>
              <button
                className="wa-icon-btn"
                title="Agenda de turnos"
                onClick={() => go("/client/appointments")}
                aria-label="Agenda"
              >
                <Icon name="calendar" size={19} />
              </button>
              <button
                className="wa-icon-btn"
                title="Opciones"
                onClick={() => setToastMsg("VetConnect Chat clínico v2.4 activo")}
                aria-label="Opciones"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="wa-sidebar__search-section">
            <div className="wa-search-bar">
              <Icon name="search" size={17} />
              <input
                type="text"
                placeholder="Buscar un chat o iniciar uno nuevo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="wa-icon-btn"
                  style={{ width: 24, height: 24 }}
                  onClick={() => setSearchQuery("")}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            <div className="wa-chips-bar">
              {chips.map((chip) => (
                <button
                  key={chip}
                  className={`wa-chip ${activeChip === chip ? "is-active" : ""}`}
                  onClick={() => setActiveChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {showBanner && (
            <div className="wa-banner">
              <span className="wa-banner__icon">
                <Icon name="bell" size={18} />
              </span>
              <div className="wa-banner__text">
                Las notificaciones de mensajes y llamadas están activadas.{" "}
                <a onClick={() => go("/client/notifications")}>Configurar</a>
              </div>
              <button
                className="wa-banner__close"
                onClick={() => setShowBanner(false)}
                aria-label="Cerrar aviso"
              >
                <Icon name="close" size={15} />
              </button>
            </div>
          )}

          <div className="wa-chats-list">
            {filteredChats.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#667781", fontSize: 13 }}>
                No se encontraron conversaciones con ese filtro.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === activeChat.id;
                const hasUnread = !!chat.unreadCount && chat.unreadCount > 0;
                return (
                  <button
                    key={chat.id}
                    className={`wa-chat-item ${isSelected ? "is-active" : ""} ${hasUnread ? "has-unread" : ""}`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <div className="wa-chat-item__avatar">
                      {chat.avatarText}
                      {chat.isOnline && <span className="wa-online-badge" />}
                    </div>

                    <div className="wa-chat-item__content">
                      <div className="wa-chat-item__top">
                        <span className="wa-chat-item__name">{chat.name}</span>
                        <span className="wa-chat-item__time">{chat.lastTime}</span>
                      </div>
                      <div className="wa-chat-item__bottom">
                        <span className="wa-chat-item__preview">{chat.preview}</span>
                        <div className="wa-chat-item__badges">
                          {chat.isPinned && (
                            <span className="wa-pin-icon" title="Chat fijado">
                              📌
                            </span>
                          )}
                          {hasUnread && (
                            <span className="wa-unread-badge">{chat.unreadCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT CHAT PANE */}
        <section className={`wa-chat-pane ${!mobileThreadOpen ? "is-hidden" : ""}`}>
          <header className="wa-chat-pane__header">
            <div className="wa-chat-pane__header-contact" onClick={() => go(`/client/consultations/seguimiento-milo`)}>
              <button
                className="wa-icon-btn mobile-only-btn"
                style={{ marginRight: -4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileThreadOpen(false);
                }}
                aria-label="Volver a chats"
              >
                <Icon name="left" size={18} />
              </button>
              <div className="wa-chat-pane__header-avatar">
                {activeChat.avatarText}
                {activeChat.isOnline && <span className="wa-online-badge" />}
              </div>
              <div className="wa-chat-pane__header-info">
                <h2>{activeChat.name}</h2>
                <span className={activeChat.isOnline ? "is-online" : ""}>
                  {activeChat.statusText}
                </span>
              </div>
            </div>

            <div className="wa-chat-pane__header-actions">
              <button
                className="wa-icon-btn"
                title="Iniciar videoconsulta"
                onClick={() => go(`/call/seguimiento-milo?from=client`)}
                aria-label="Videollamada"
              >
                <Icon name="video" size={20} />
              </button>
              <button
                className="wa-icon-btn"
                title="Buscar en el chat"
                onClick={() => setToastMsg("Buscador dentro del chat activo")}
                aria-label="Buscar"
              >
                <Icon name="search" size={19} />
              </button>
              <button
                className="wa-icon-btn"
                title="Más opciones"
                onClick={() => setToastMsg(`Conversación con ${activeChat.name}`)}
                aria-label="Más opciones"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>
          </header>

          {/* CHAT BODY WITH DOODLE BACKGROUND */}
          <div className="wa-chat-body">
            <div className="wa-encryption-pill">
              <span>🔒</span>
              <span>
                Los mensajes y llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera VetConnect, puede leerlos ni escucharlos.
              </span>
            </div>

            <div className="wa-date-pill">HOY</div>

            {activeChat.messages.map((msg) => {
              const isSent = msg.sender === "me";

              if (msg.doc) {
                return (
                  <div
                    key={msg.id}
                    className={`wa-bubble wa-doc-bubble ${isSent ? "wa-bubble--sent" : "wa-bubble--received"}`}
                  >
                    {!isSent && msg.senderName && (
                      <div className="wa-bubble__sender">{msg.senderName}</div>
                    )}
                    <div className="wa-doc-card">
                      <div className="wa-doc-card__banner">
                        <span className="wa-doc-card__banner-tag">
                          {msg.doc.bannerTag || "DOCUMENTO PDF"}
                        </span>
                        <div className="wa-doc-card__banner-preview">
                          <Icon name="file" size={26} />
                          <span>{msg.doc.bannerTitle || "VetConnect Clinical Record"}</span>
                        </div>
                      </div>

                      <div className="wa-doc-card__body">
                        <div className="wa-pdf-badge">PDF</div>
                        <div className="wa-doc-card__info">
                          <div className="wa-doc-card__title" title={msg.doc.title}>
                            {msg.doc.title}
                          </div>
                          <div className="wa-doc-card__sub">{msg.doc.sub}</div>
                        </div>
                        <button
                          className="wa-doc-card__download"
                          onClick={() => handleDownloadDoc(msg.doc!.title)}
                          title="Descargar documento"
                          aria-label="Descargar documento"
                        >
                          <Icon name="download" size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="wa-bubble__meta">
                      <span>{msg.time}</span>
                      {isSent && <WhatsAppCheck state={msg.state} />}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`wa-bubble ${isSent ? "wa-bubble--sent" : "wa-bubble--received"}`}
                >
                  {!isSent && msg.senderName && (
                    <div className="wa-bubble__sender">{msg.senderName}</div>
                  )}
                  <p className="wa-bubble__text">{msg.text}</p>
                  <div className="wa-bubble__meta">
                    <span>{msg.time}</span>
                    {isSent && <WhatsAppCheck state={msg.state} />}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="wa-typing-indicator">
                <span className="wa-typing-dot" />
                <span className="wa-typing-dot" />
                <span className="wa-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK EMOJI BAR */}
          {showEmojiMenu && (
            <div className="wa-emoji-bar">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className="wa-emoji-btn"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                    setShowEmojiMenu(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* QUICK ATTACH POPUP */}
          {showAttachMenu && (
            <div className="wa-attach-popup">
              <button
                className="wa-attach-item"
                onClick={() =>
                  handleAttachDoc(`ESTUDIO_COMPLEMENTARIO_${petName.toUpperCase()}_2026.pdf`)
                }
              >
                <i style={{ background: "#ea4335" }}>
                  <Icon name="file" size={17} />
                </i>
                <span>Documento PDF</span>
              </button>
              <button
                className="wa-attach-item"
                onClick={() =>
                  handleAttachDoc(`FOTO_CLINICA_EVOLUCION_${petName.toUpperCase()}.pdf`)
                }
              >
                <i style={{ background: "#007bfc" }}>
                  <Icon name="image" size={17} />
                </i>
                <span>Fotos y videos</span>
              </button>
              <button
                className="wa-attach-item"
                onClick={() =>
                  handleAttachDoc(`RECETA_MEDICA_${petName.toUpperCase()}.pdf`)
                }
              >
                <i style={{ background: "#00a884" }}>
                  <Icon name="pill" size={17} />
                </i>
                <span>Receta médica</span>
              </button>
            </div>
          )}

          {/* FOOTER INPUT BAR */}
          <footer className="wa-chat-footer">
            <div className="wa-chat-footer__actions">
              <button
                className="wa-icon-btn"
                title="Emojis"
                onClick={() => {
                  setShowEmojiMenu(!showEmojiMenu);
                  setShowAttachMenu(false);
                }}
                aria-label="Emojis"
              >
                😊
              </button>
              <button
                className="wa-icon-btn"
                title="Adjuntar archivo o documento"
                onClick={() => {
                  setShowAttachMenu(!showAttachMenu);
                  setShowEmojiMenu(false);
                }}
                aria-label="Adjuntar"
              >
                <Icon name="paperclip" size={20} />
              </button>
            </div>

            <div className="wa-input-pill">
              <input
                type="text"
                placeholder="Escribe un mensaje"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>

            {inputText.trim() ? (
              <button
                className="wa-send-btn"
                onClick={() => handleSend()}
                title="Enviar mensaje"
                aria-label="Enviar"
              >
                <Icon name="send" size={19} />
              </button>
            ) : (
              <button
                className="wa-mic-btn"
                onClick={() => setToastMsg("Mensaje de voz: mantén presionado para grabar")}
                title="Mensaje de voz"
                aria-label="Mensaje de voz"
              >
                <Icon name="mic" size={20} />
              </button>
            )}
          </footer>
        </section>
      </div>

      {toastMsg && <Toast message={toastMsg} tone="success" />}
    </>
  );
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
