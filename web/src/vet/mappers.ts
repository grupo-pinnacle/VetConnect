import { photos } from "../shared";
import type { Consultation as BackendConsultation, Pet as BackendPet, User as BackendUser } from "../types";
export type { BackendConsultation };
import { parseConsultationNotes } from "../lib/consultationNotes";
import type { QueueItem, Consult, Patient, Triage } from "./data";

export function mapBackendTriage(priority: 'ROJO' | 'AMARILLO' | 'VERDE' | null): Triage {
  if (priority === 'ROJO') return 'Crítico';
  if (priority === 'AMARILLO') return 'Moderado';
  return 'General';
}

export function mapBackendPetToPatient(pet?: BackendPet, client?: Partial<BackendUser>): Patient {
  if (!pet) {
    return {
      id: "unknown",
      name: "Paciente",
      kind: "Canino",
      breed: "Mestizo",
      age: "Adulto",
      weight: "No registrado",
      sex: "No informado",
      chip: "No informado",
      tutor: client ? `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Tutor" : "Tutor",
      tutorPhone: client?.phone || "No informado",
      tutorEmail: client?.email || "No informado",
      photo: photos.milo,
      last: "Hoy",
      lastDays: 0,
      state: "Activo",
      allergies: [],
      meds: [],
      history: [],
      vaccines: [],
      past: [],
      studies: [],
      docs: [],
      evolution: [],
    };
  }

  const tutorName = client ? `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Tutor" : "Tutor";
  const speciesLower = (pet.species || "").toLowerCase();
  const photo = speciesLower.includes("gato") || speciesLower.includes("felin") ? photos.nube :
                speciesLower.includes("cone") ? photos.luna :
                speciesLower.includes("ave") || speciesLower.includes("paj") ? photos.kiwi : photos.milo;

  const allergiesList = pet.allergies ? [pet.allergies] : ["Sin alergias conocidas"];
  const historyList = pet.chronicConditions ? [pet.chronicConditions] : [];

  return {
    id: pet.id,
    name: pet.name,
    kind: pet.species || "Mascota",
    breed: pet.breed || "Mestizo",
    age: "Registrado",
    weight: pet.weightKg ? `${pet.weightKg} kg` : "No informado",
    sex: pet.sex || "No informado",
    chip: pet.microchip || "No informado",
    tutor: tutorName,
    tutorPhone: client?.phone || "No informado",
    tutorEmail: client?.email || "No informado",
    photo,
    last: new Date(pet.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    lastDays: Math.floor((Date.now() - new Date(pet.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    state: "Activo",
    allergies: allergiesList,
    meds: [],
    history: historyList,
    vaccines: [],
    past: [],
    studies: [],
    docs: [],
    evolution: [],
  };
}

export function mapConsultationToQueueItem(c: BackendConsultation): QueueItem {
  const parsed = parseConsultationNotes(c.notes);
  const triage = mapBackendTriage(parsed.priority);
  const requestedTime = new Date(c.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const waitSeconds = Math.max(0, Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 1000));

  return {
    id: c.id,
    petId: c.petId,
    reason: parsed.cleanNotes,
    triage,
    wait: waitSeconds,
    requested: requestedTime,
    note: parsed.cleanNotes,
  };
}

export function mapConsultationToConsult(c: BackendConsultation, nowOrIndex?: Date | number): Consult {
  const parsed = parseConsultationNotes(c.notes);
  const triage = mapBackendTriage(parsed.priority);
  const targetDate = new Date(c.startedAt ?? c.createdAt);
  const refNow = nowOrIndex instanceof Date ? nowOrIndex : new Date();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const yesterday = new Date(refNow);
  yesterday.setDate(refNow.getDate() - 1);

  const dateStr = targetDate.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  const timeStr = targetDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const day = isSameDay(targetDate, refNow)
    ? "Hoy"
    : isSameDay(targetDate, yesterday)
    ? "Ayer"
    : dateStr;
  
  const status: "Activa" | "Próxima" | "Finalizada" | "Cancelada" =
    c.status === "ACTIVE" ? "Activa" :
    c.status === "WAITING" ? "Próxima" :
    c.status === "COMPLETED" ? "Finalizada" : "Cancelada";

  return {
    id: c.id,
    petId: c.petId,
    day,
    date: dateStr,
    time: timeStr,
    reason: parsed.cleanNotes,
    status,
    mode: "Videoconsulta",
    triage,
  };
}
