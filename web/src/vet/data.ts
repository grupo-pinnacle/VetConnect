import { photos, type IconName } from "../shared";

export type Triage = "Crítico" | "Prioritario" | "Moderado" | "General";

export const triageMeta: Record<Triage, { level: number; icon: IconName; hint: string; rank: number }> = {
  Crítico: { level: 4, icon: "alert", hint: "Atender de inmediato", rank: 0 },
  Prioritario: { level: 3, icon: "zap", hint: "Atender en los próximos minutos", rank: 1 },
  Moderado: { level: 2, icon: "clock", hint: "Atender por orden de llegada", rank: 2 },
  General: { level: 1, icon: "check", hint: "Sin signos de urgencia", rank: 3 },
};

export type Vaccine = { name: string; date: string; next: string; state: "Al día" | "Próxima" | "Vencida" };
export type Evolution = { date: string; time: string; author: string; text: string };
export type Patient = {
  id: string; name: string; kind: string; breed: string; age: string; weight: string; sex: string; chip: string;
  tutor: string; tutorPhone: string; tutorEmail: string; photo: string; last: string; lastDays: number; state: "Activo" | "En seguimiento" | "Sin consultas recientes";
  allergies: string[]; meds: string[]; history: string[]; vaccines: Vaccine[];
  past: { date: string; title: string; note: string }[]; studies: { name: string; date: string }[];
  docs: { name: string; kind: string; date: string; size: string }[]; evolution: Evolution[];
};

const SM = "Dr. Santiago Mendoza";

export const patients: Patient[] = [
  {
    id: "milo", name: "Milo", kind: "Perro", breed: "Golden Retriever", age: "8 años", weight: "29 kg", sex: "Macho castrado", chip: "032 884 912",
    tutor: "Mariana López", tutorPhone: "+54 11 5555 0182", tutorEmail: "mariana.lopez@ejemplo.com", photo: photos.milo, last: "12 Jun 2025", lastDays: 33, state: "Activo",
    allergies: ["Polen estacional"], meds: ["Oclacitinib 16 mg · 1 comprimido cada 24 h"], history: ["Dermatitis atópica leve (2023)", "Otitis externa recurrente"],
    vaccines: [
      { name: "Séxtuple canina", date: "12 Mar 2025", next: "12 Mar 2026", state: "Al día" },
      { name: "Antirrábica", date: "18 Jul 2024", next: "18 Jul 2025", state: "Próxima" },
      { name: "Bordetella", date: "08 Ene 2024", next: "08 Ene 2025", state: "Vencida" },
    ],
    past: [
      { date: "12 Jun 2025", title: "Seguimiento dermatológico", note: "Buena respuesta al tratamiento. Disminuyó el rascado." },
      { date: "28 May 2025", title: "Inicio de tratamiento", note: "Se indica oclacitinib y baños con shampoo medicado." },
    ],
    studies: [{ name: "Análisis de sangre completo", date: "12 Jun 2025" }, { name: "Radiografía de cadera", date: "28 May 2025" }],
    docs: [{ name: "Certificado de vacunación", kind: "PDF", date: "12 Mar 2025", size: "840 KB" }],
    evolution: [
      { date: "12 Jun 2025", time: "19:48", author: SM, text: "Buena respuesta al tratamiento. Disminuyó el rascado nocturno. Continuar indicación actual y control en 30 días." },
      { date: "28 May 2025", time: "19:20", author: SM, text: "Inicio de seguimiento dermatológico. Se reciben fotografías de abdomen y axilas. Se ajusta medicación." },
    ],
  },
  {
    id: "luna", name: "Luna", kind: "Coneja", breed: "Enana", age: "3 años", weight: "1,7 kg", sex: "Hembra", chip: "No informado",
    tutor: "Tomás Aguirre", tutorPhone: "+54 11 5555 0144", tutorEmail: "tomas.aguirre@ejemplo.com", photo: photos.luna, last: "Hoy", lastDays: 0, state: "En seguimiento",
    allergies: ["Sin alergias conocidas"], meds: ["Simeticona 0,2 ml · cada 8 h (3 días)"], history: ["Estasis gastrointestinal leve (mayo 2025)"],
    vaccines: [{ name: "Mixomatosis", date: "02 Feb 2025", next: "02 Feb 2026", state: "Al día" }, { name: "Enfermedad hemorrágica (VHD)", date: "02 Feb 2025", next: "02 Feb 2026", state: "Al día" }],
    past: [{ date: "28 May 2025", title: "Control nutricional", note: "Se ajusta proporción de heno y pellets." }],
    studies: [{ name: "Ecografía abdominal", date: "28 May 2025" }], docs: [],
    evolution: [{ date: "28 May 2025", time: "18:35", author: SM, text: "Apetito recuperado. Se indica aumentar heno ad libitum y reducir pellets a 25 g diarios." }],
  },
  {
    id: "nube", name: "Nube", kind: "Gato", breed: "Mestizo", age: "5 años", weight: "4,3 kg", sex: "Macho castrado", chip: "941 000 021 447 802",
    tutor: "Joaquín Herrera", tutorPhone: "+54 11 5555 0171", tutorEmail: "joaquin.herrera@ejemplo.com", photo: photos.nube, last: "03 Abr 2025", lastDays: 103, state: "Activo",
    allergies: ["Pollo (dermatitis)"], meds: ["Sin medicación actual"], history: ["Cistitis idiopática (2024)", "Dieta urinaria indicada"],
    vaccines: [{ name: "Triple felina", date: "03 Abr 2025", next: "03 Abr 2026", state: "Al día" }, { name: "Antirrábica", date: "03 Abr 2025", next: "03 Abr 2026", state: "Al día" }],
    past: [{ date: "03 Abr 2025", title: "Control clínico anual", note: "Peso estable. Se refuerza hidratación." }],
    studies: [{ name: "Urianálisis", date: "10 Nov 2024" }], docs: [{ name: "Resumen de historia clínica", kind: "PDF", date: "03 Abr 2025", size: "310 KB" }],
    evolution: [{ date: "03 Abr 2025", time: "17:40", author: SM, text: "Control anual sin hallazgos. Se refuerza dieta húmeda y acceso a agua fresca." }],
  },
  {
    id: "kiwi", name: "Kiwi", kind: "Ave", breed: "Cotorra argentina", age: "2 años", weight: "110 g", sex: "Macho", chip: "No aplica",
    tutor: "Valentina Ríos", tutorPhone: "+54 11 5555 0129", tutorEmail: "valentina.rios@ejemplo.com", photo: photos.kiwi, last: "14 Jul 2025", lastDays: 1, state: "En seguimiento",
    allergies: ["Sin alergias conocidas"], meds: ["Sin medicación actual"], history: ["Picaje leve por estrés ambiental"],
    vaccines: [], past: [{ date: "14 Jul 2025", title: "Control de plumaje", note: "Se recomienda enriquecimiento ambiental." }], studies: [], docs: [],
    evolution: [{ date: "14 Jul 2025", time: "18:25", author: SM, text: "Plumaje en mejoría. Indicar enriquecimiento ambiental y control en una semana." }],
  },
  {
    id: "toby", name: "Toby", kind: "Hurón", breed: "Sable", age: "4 años", weight: "1,2 kg", sex: "Macho castrado", chip: "No informado",
    tutor: "Lucas Benítez", tutorPhone: "+54 11 5555 0163", tutorEmail: "lucas.benitez@ejemplo.com", photo: photos.toby, last: "Hoy", lastDays: 0, state: "Activo",
    allergies: ["Sin alergias conocidas"], meds: ["Sin medicación actual"], history: ["Insulinoma descartado (2024)"],
    vaccines: [{ name: "Moquillo", date: "20 May 2025", next: "20 May 2026", state: "Al día" }], past: [{ date: "20 May 2025", title: "Control de peso", note: "Ganó 80 g. Dieta adecuada." }],
    studies: [{ name: "Glucemia en ayunas", date: "20 May 2025" }], docs: [],
    evolution: [{ date: "20 May 2025", time: "19:05", author: SM, text: "Peso en aumento sostenido. Mantener dieta y control en 60 días." }],
  },
  {
    id: "olivia", name: "Olivia", kind: "Perro", breed: "Beagle", age: "6 años", weight: "13 kg", sex: "Hembra castrada", chip: "941 000 021 556 310",
    tutor: "Sofía Paredes", tutorPhone: "+54 11 5555 0198", tutorEmail: "sofia.paredes@ejemplo.com", photo: photos.milo, last: "02 Jul 2025", lastDays: 13, state: "En seguimiento",
    allergies: ["Penicilinas"], meds: ["Cefalexina 250 mg · cada 12 h"], history: ["Pioderma superficial"],
    vaccines: [{ name: "Séxtuple canina", date: "10 Ene 2025", next: "10 Ene 2026", state: "Al día" }], past: [{ date: "02 Jul 2025", title: "Dermatitis", note: "Se inicia antibiótico." }],
    studies: [], docs: [], evolution: [{ date: "02 Jul 2025", time: "19:30", author: SM, text: "Lesiones en flanco. Se solicita citología en próximo control." }],
  },
  {
    id: "simon", name: "Simón", kind: "Gato", breed: "Siamés", age: "10 años", weight: "4,8 kg", sex: "Macho castrado", chip: "No informado",
    tutor: "Andrés Cabrera", tutorPhone: "+54 11 5555 0105", tutorEmail: "andres.cabrera@ejemplo.com", photo: photos.nube, last: "Hoy", lastDays: 0, state: "Activo",
    allergies: ["Sin alergias conocidas"], meds: ["Alimento renal · según plan"], history: ["Enfermedad renal crónica estadio 2"],
    vaccines: [{ name: "Triple felina", date: "15 Ago 2024", next: "15 Ago 2025", state: "Próxima" }], past: [{ date: "11 Jun 2025", title: "Control renal", note: "Creatinina estable." }],
    studies: [{ name: "Perfil renal", date: "11 Jun 2025" }], docs: [], evolution: [{ date: "11 Jun 2025", time: "20:10", author: SM, text: "Creatinina estable. Continuar dieta renal." }],
  },
];

export const getPatient = (id: string) => patients.find((p) => p.id === id) ?? patients[0];

export type QueueItem = { id: string; petId: string; reason: string; triage: Triage; wait: number; requested: string; note: string };

export const initialQueue: QueueItem[] = [
  { id: "q-milo", petId: "milo", reason: "Vómitos recurrentes", triage: "Moderado", wait: 222, requested: "18:38", note: "3 episodios desde la mañana. Toma agua. Sin fiebre referida." },
  { id: "q-toby", petId: "toby", reason: "Control de peso y alimentación", triage: "General", wait: 665, requested: "18:31", note: "Consulta de rutina. Sin síntomas." },
  { id: "q-nube", petId: "nube", reason: "Dificultad para orinar desde anoche", triage: "Prioritario", wait: 435, requested: "18:35", note: "Antecedente de cistitis. Va varias veces a la bandeja sin producir orina." },
  { id: "q-kiwi", petId: "kiwi", reason: "Respira con el pico abierto y está esponjada", triage: "Crítico", wait: 80, requested: "18:41", note: "Dificultad respiratoria referida. Tutor con la jaula en lugar tranquilo." },
];

export type ConsultStatus = "Próxima" | "Activa" | "Finalizada" | "Cancelada";
export type Consult = { id: string; petId: string; day: string; date: string; time: string; reason: string; status: ConsultStatus; mode: "Videoconsulta" | "Chat"; triage?: Triage };

export const initialConsults: Consult[] = [
  { id: "c-luna", petId: "luna", day: "Hoy", date: "15 Jul", time: "18:20", reason: "Control post consulta · apetito", status: "Activa", mode: "Chat" },
  { id: "c-olivia", petId: "olivia", day: "Hoy", date: "15 Jul", time: "19:30", reason: "Control de lesiones cutáneas", status: "Próxima", mode: "Videoconsulta" },
  { id: "c-simon", petId: "simon", day: "Hoy", date: "15 Jul", time: "21:00", reason: "Control renal", status: "Próxima", mode: "Videoconsulta" },
  { id: "c-nube", petId: "nube", day: "Mañana", date: "16 Jul", time: "19:15", reason: "Control de peso", status: "Próxima", mode: "Videoconsulta" },
  { id: "c-toby", petId: "toby", day: "Hoy", date: "15 Jul", time: "18:00", reason: "Revisión de pelaje", status: "Finalizada", mode: "Videoconsulta" },
  { id: "c-simon-chat", petId: "simon", day: "Hoy", date: "15 Jul", time: "18:10", reason: "Consulta sobre alimentación", status: "Finalizada", mode: "Chat" },
  { id: "c-kiwi", petId: "kiwi", day: "Ayer", date: "14 Jul", time: "18:00", reason: "Control de plumaje", status: "Finalizada", mode: "Chat" },
  { id: "c-simon-vac", petId: "simon", day: "Ayer", date: "14 Jul", time: "19:00", reason: "Vacunación (cancelada por el tutor)", status: "Cancelada", mode: "Videoconsulta" },
];

export type EventStatus = "Confirmada" | "Pendiente" | "Cancelada" | "Completada";
export type AgendaEvent = { id: string; day: number; time: string; petId: string; type: string; status: EventStatus; consultId?: string };
export const weekDays = [
  { short: "Lun", name: "Lunes", date: 14 }, { short: "Mar", name: "Martes", date: 15 }, { short: "Mié", name: "Miércoles", date: 16 },
  { short: "Jue", name: "Jueves", date: 17 }, { short: "Vie", name: "Viernes", date: 18 }, { short: "Sáb", name: "Sábado", date: 19 }, { short: "Dom", name: "Domingo", date: 20 },
];
export const todayIndex = 1;
export const initialEvents: AgendaEvent[] = [
  { id: "e1", day: 0, time: "18:00", petId: "kiwi", type: "Chat", status: "Completada", consultId: "c-kiwi" },
  { id: "e2", day: 0, time: "19:00", petId: "simon", type: "Videoconsulta", status: "Cancelada", consultId: "c-simon-vac" },
  { id: "e3", day: 1, time: "18:00", petId: "toby", type: "Videoconsulta", status: "Completada", consultId: "c-toby" },
  { id: "e4", day: 1, time: "18:20", petId: "luna", type: "Chat", status: "Confirmada", consultId: "c-luna" },
  { id: "e5", day: 1, time: "19:30", petId: "olivia", type: "Videoconsulta", status: "Confirmada", consultId: "c-olivia" },
  { id: "e6", day: 1, time: "21:00", petId: "simon", type: "Videoconsulta", status: "Pendiente", consultId: "c-simon" },
  { id: "e7", day: 2, time: "18:30", petId: "luna", type: "Seguimiento", status: "Pendiente" },
  { id: "e8", day: 2, time: "19:15", petId: "nube", type: "Videoconsulta", status: "Confirmada", consultId: "c-nube" },
  { id: "e9", day: 3, time: "18:30", petId: "milo", type: "Seguimiento", status: "Confirmada" },
  { id: "e10", day: 4, time: "20:00", petId: "toby", type: "Videoconsulta", status: "Pendiente" },
];

export const availability = [
  { day: "Lunes", hours: "18:00 — 22:00" }, { day: "Martes", hours: "18:00 — 22:00" }, { day: "Miércoles", hours: "18:00 — 22:00" },
  { day: "Jueves", hours: "18:00 — 22:00" }, { day: "Viernes", hours: "18:00 — 22:00" }, { day: "Sábado", hours: "10:00 — 14:00" }, { day: "Domingo", hours: "No disponible" },
];

export type Msg = { id: string; mine: boolean; text?: string; time: string; kind?: "image" | "doc"; src?: string; name?: string; pos?: string };
export type Thread = { id: string; petId: string; last: string; lastTime: string; unread: number; online: boolean; msgs: Msg[] };
export const initialThreads: Thread[] = [
  { id: "t-milo", petId: "milo", last: "Te envío otra foto del abdomen.", lastTime: "18:40", unread: 2, online: true, msgs: [
    { id: "m1", mine: false, text: "Buenas noches, doctor. Milo vomitó tres veces desde la mañana.", time: "18:36" },
    { id: "m2", mine: false, kind: "image", src: photos.milo, name: "Abdomen · 18:37", time: "18:37", pos: "50% 70%" },
    { id: "m3", mine: true, text: "Gracias, Mariana. Reviso la ficha de Milo y sigo con algunas preguntas.", time: "18:38" },
    { id: "m4", mine: false, kind: "doc", name: "Análisis de sangre · Jun 2025.pdf", text: "1,8 MB", time: "18:39" },
    { id: "m5", mine: false, text: "Te envío otra foto del abdomen.", time: "18:40" },
  ] },
  { id: "t-kiwi", petId: "kiwi", last: "Sigue con el pico abierto.", lastTime: "18:41", unread: 1, online: true, msgs: [
    { id: "m1", mine: false, text: "Kiwi está esponjada y respira con el pico abierto.", time: "18:40" },
    { id: "m2", mine: false, text: "Sigue con el pico abierto.", time: "18:41" },
  ] },
  { id: "t-nube", petId: "nube", last: "Fue a la bandeja otra vez.", lastTime: "18:39", unread: 1, online: false, msgs: [
    { id: "m1", mine: false, text: "Nube lleva varias idas a la bandeja sin orinar.", time: "18:35" },
    { id: "m2", mine: false, text: "Fue a la bandeja otra vez.", time: "18:39" },
  ] },
  { id: "t-luna", petId: "luna", last: "Comió el heno y un poco de pellets.", lastTime: "18:33", unread: 0, online: true, msgs: [
    { id: "m1", mine: true, text: "Tomás, ¿cómo viene el apetito de Luna?", time: "18:30" },
    { id: "m2", mine: false, text: "Comió el heno y un poco de pellets.", time: "18:33" },
  ] },
  { id: "t-olivia", petId: "olivia", last: "Perfecto, nos vemos a las 19:30.", lastTime: "17:50", unread: 0, online: false, msgs: [
    { id: "m1", mine: true, text: "Sofía, recordá tener buena luz para mostrar las lesiones.", time: "17:48" },
    { id: "m2", mine: false, text: "Perfecto, nos vemos a las 19:30.", time: "17:50" },
  ] },
  { id: "t-simon", petId: "simon", last: "Gracias por la receta.", lastTime: "Ayer", unread: 0, online: false, msgs: [
    { id: "m1", mine: false, text: "Gracias por la receta.", time: "Ayer" },
  ] },
];

export const quickReplies = [
  "Voy a revisar la información de la ficha.",
  "Necesito que me envíes una fotografía con mejor iluminación.",
  "Vamos a continuar con algunas preguntas.",
  "¿Desde cuándo notás este cambio?",
  "Mantené a tu mascota tranquila mientras evalúo el caso.",
];

export type Rx = { id: string; petId: string; med: string; dose: string; freq: string; duration: string; notes: string; status: "Borrador" | "Emitida" | "Finalizada"; date: string };
export const initialRx: Rx[] = [
  { id: "RX-2025-0421", petId: "luna", med: "Simeticona", dose: "0,2 ml", freq: "Cada 8 horas", duration: "3 días", notes: "Administrar con jeringa sin aguja. Ofrecer heno fresco.", status: "Emitida", date: "Hoy" },
  { id: "RX-2025-0418", petId: "milo", med: "Oclacitinib 16 mg", dose: "1 comprimido", freq: "Cada 24 horas", duration: "14 días", notes: "Administrar con comida. Suspender ante vómitos persistentes.", status: "Emitida", date: "12 Jun 2025" },
  { id: "RX-2025-0415", petId: "olivia", med: "Cefalexina 250 mg", dose: "1 comprimido", freq: "Cada 12 horas", duration: "10 días", notes: "", status: "Borrador", date: "Hoy" },
  { id: "RX-2025-0390", petId: "toby", med: "Complemento vitamínico", dose: "0,5 ml", freq: "Cada 24 horas", duration: "30 días", notes: "Mezclar con el alimento.", status: "Finalizada", date: "20 May 2025" },
];

export type FollowUp = { id: string; petId: string; title: string; when: string; status: "Pendiente" | "Programado" | "Atrasado" | "Realizado"; note: string };
export const initialFollowUps: FollowUp[] = [
  { id: "f1", petId: "kiwi", title: "Control de plumaje", when: "Ayer · 18:00", status: "Atrasado", note: "El tutor no respondió el último recordatorio. Reintentar contacto por mensaje." },
  { id: "f2", petId: "luna", title: "Control post consulta", when: "Mañana · 10:00", status: "Pendiente", note: "Verificar apetito, deposiciones y respuesta a simeticona." },
  { id: "f3", petId: "milo", title: "Respuesta al tratamiento dermatológico", when: "Jue 17 Jul · 18:30", status: "Programado", note: "Revisar fotografías de abdomen y axilas. Evaluar continuidad de oclacitinib." },
  { id: "f4", petId: "toby", title: "Revisión de peso", when: "Vie 18 Jul · 20:00", status: "Pendiente", note: "Pesar en ayunas y comparar con control de mayo." },
];
