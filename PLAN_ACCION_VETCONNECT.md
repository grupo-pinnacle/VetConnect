# 📋 PLAN DE ACCIÓN GREENFIELD — BACKLOG DE TAREAS PARA AGENTES AUTÓNOMOS (VetConnect)

> **Destinatarios:** Agentes autónomos de IA (**Google Jules**, Antigravity, Claude Code, Cursor) y desarrolladores del equipo.
> **Enfoque:** Construcción desde cero (**Greenfield**) del monorepo VetConnect, sin deuda técnica heredada y con arquitectura FAANG.
> **Naturaleza del Documento:** Backlog maestro de especificación para la construcción desde cero y **Guía Preventiva de Antipatrones de Diseño**. No constituye un conjunto de parches sobre código previo (el repositorio es pre-código y parte de cero absoluto).
> **Estructura:** Dividido en **Task Packets** atómicos y autocontenidos. Cada tarea puede ser copiada directamente como un Issue de GitHub o prompt operativo para Google Jules.

---

## 🗺️ Gobernanza Dual & Matriz de Mapeo Biunívoco (PB ↔ TASK)

Para garantizar total transparencia operativa entre el seguimiento de gestión de producto y la ejecución técnica automatizada por agentes de IA (**Google Jules**), el proyecto establece un **modelo de gobernanza dual**:

1. **Lente de Producto & Humano (Product Backlog PB-01 a PB-40 en [`docs/PLAN_DE_PROYECTO_Y_GESTION.md`](docs/PLAN_DE_PROYECTO_Y_GESTION.md) §7.2):**  
   Organizado cronológicamente por **Sprints (1 al 10)**. Es la fuente de verdad para el tablero Scrumban del equipo, reuniones de retrospectiva y reporting a stakeholders ejecutivos.
2. **Lente de Ingeniería & Agente (Agent Backlog TASK-0.1 a TASK-7.2 en este documento):**  
   Organizado estructuralmente por **Fases de dependencias arquitectónicas (F0 a F7)**. Es la fuente de verdad técnica para alimentar Issues de GitHub y prompts operativos de microVMs en Google Jules.

### Tabla de Equivalencia Biunívoca

| Tarea de Agente (Fase Técnica) | Ítems del Product Backlog (Sprints) | Alcance Concreto |
|---|---|---|
| **TASK-0.1** (Monorepo & Docker) | **PB-01**, **PB-02** (Sprint 1) | Scaffolding workspaces, .gitignore, Docker Postgres/Redis. |
| **TASK-0.2** (Scripts DX & ADB) | **PB-03** (Sprint 1) | Scripts run.bat y start.ps1 con reverse ADB. |
| **TASK-1.1** (Modelado Prisma) | **PB-05** (Sprint 2), **PB-15** (Sprint 4), **PB-16** (Sprint 5) | Esquema PostgreSQL, snake_case, soft-deletes y AuditLog. |
| **TASK-1.2** (Seeds de Prueba) | **PB-05** (Sprint 2) | Semilla de usuarios, mascotas y relaciones en base de datos. |
| **TASK-2.1** (Express 5 & RFC 7807) | **PB-13**, **PB-14** (Sprint 4) | Servidor HTTP, middleware de errores y panel admin VETs. |
| **TASK-2.2** (Auth JWT & SENASA) | **PB-06**, **PB-07**, **PB-08** (Sprint 2) | Registro CLIENT/VET PENDING, login HttpOnly y tokenVersion. |
| **TASK-2.3** (CRUD Mascotas & PII) | **PB-17**, **PB-18**, **PB-19** (Sprint 5) | Fichas de mascotas, validación microchip ISO y PII masking. |
| **TASK-2.4** (Triage, FSM & Review) | **PB-21**, **PB-22** (Sprint 6), **PB-36** (Sprint 9) | Máquina estados WAITING->ACTIVE, balanceo y rating 1-5. |
| **TASK-2.5** (Recetas Oficiales QR) | **PB-35** (Sprint 9) | Receta estructurada con firma, modelo Prescription y QR. |
| **TASK-3.1** (Socket.io & Redis) | **PB-24**, **PB-25** (Sprint 7) | Servidor WebSockets con Redis Adapter y auth handshake. |
| **TASK-3.2** (Chat Idempotente) | **PB-26**, **PB-27** (Sprint 7) | Mensajería con clientMsgId, deduplicación P2002 y presencia. |
| **TASK-4.1** (Tokens LiveKit SFU) | **PB-29**, **PB-32** (Sprint 8) | Tokens WebRTC 720p sin PII y teardown server-side deleteRoom. |
| **TASK-4.2** (Storage Magic Bytes) | **PB-20** (Sprint 5), **PB-28** (Sprint 7) | Subida segura a disco/S3 con validación de primeros 32 bytes. |
| **TASK-5.1** (Frontend Web SPA) | **PB-04** (S2), **PB-09**, **PB-10**, **PB-11** (S3), **PB-12** (S4), **PB-23** (S6) | React 19 + Vite, TanStack Query, routing, FAQ y UI Kit. |
| **TASK-5.2** (Videollamada Web) | **PB-30** (Sprint 8) | Componente CallRoom, PreJoin y CERO doble RoomAudioRenderer. |
| **TASK-6.1** (Mobile Expo Router) | **PB-10** (Sprint 3), **PB-19** (Sprint 5), **PB-20** (Sprint 6), **PB-23** (Sprint 6) | App Expo SDK 54, NativeWind, secure store y FAQ de soporte. |
| **TASK-6.2** (Mobile WebView LiveKit) | **PB-31** (Sprint 8) | Handshake bidireccional page:ready y permisos de hardware. |
| **TASK-6.3** (Notificaciones Push & In-App) | **PB-19** (S5), **PB-20** (S6), **PB-31** (S8) | Expo Push API, registro de tokens y bandeja in-app (ADR-011). |
| **TASK-7.1** (Suite 120+ Tests) | **PB-33**, **PB-34** (Sprint 9), **PB-37**, **PB-38** (Sprint 10) | Heurística ISO 9241-11, UX <60s, 10 suites Jest (>80%). |
| **TASK-7.2** (CI/CD & Coolify) | **PB-39**, **PB-40** (Sprint 10) | GitHub Actions, Dockerfile multi-stage y deploy Vercel/VPS. |

---

### 🚦 Criterio de Entrada: Definition of Ready (DoR) para Task Packets
Antes de que un agente autónomo (**Google Jules**) o desarrollador tome un paquete de tareas (`TASK-X.X`), se debe verificar que:
1. **Contrato Congelado:** Los endpoints, DTOs Zod y esquemas Prisma requeridos están declarados explícitamente en [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) sin campos ambiguos de v2.1+.
2. **ADR Vinculante:** La tarea referencia explícitamente las decisiones de arquitectura aplicables (de los 24 ADRs en [`docs/DECISIONS.md`](docs/DECISIONS.md)).
3. **Dependencias Previas Satisfechas:** La fase o tarea antecesora completó su Definition of Done (DoD) con CI en verde (`npm run typecheck && npm test`).
4. **Protección de PII Verificada:** Se prohíbe explícitamente inyectar emails o teléfonos en tokens WebRTC, logs o responses públicas.
5. **Comando CLI de Verificación:** El paquete especifica el comando exacto para validar la entrega (ej. `npx prisma validate`, `npm test -- -t auth`).
6. **Idempotencia / Manejo de Error Declarado:** En endpoints mutables o chat, se especifica el comportamiento ante reintentos (ej. HTTP 200 ante duplicado de `clientMsgId`).

---
## 🧭 Metodología de Ejecución para Agentes

Cada tarea debe ejecutarse siguiendo estrictamente el estándar de [`AGENTS.md`](AGENTS.md):
1. **Inspeccionar contratos:** Revisar [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) y [`docs/DECISIONS.md`](docs/DECISIONS.md) antes de escribir código.
2. **Ciclo TDD:** Crear o preparar la prueba unitaria antes de implementar la lógica de negocio.
3. **Verificación local:** Ejecutar `npx prisma validate`, `npm run typecheck` y `npm test` antes de dar la tarea por finalizada.
4. **Cero `any` y Mappings Explícitos:** Toda columna en base de datos debe usar `@map("snake_case")`.

---

## 🏗️ FASE 0: Cimientos del Monorepo & Scaffolding (Infraestructura Dev)

### 📦 TASK-0.1: Configuración Raíz de Monorepo con npm Workspaces
- **Capa:** Raíz (`/`)
- **Archivos:** `package.json`, `.gitignore`, `docker-compose.yml`, `.env.example`, `.jules/instructions.md`
- **Contratos/ADRs:** [ADR-008](docs/DECISIONS.md) (Estrategia de Tipos Monorepo), [ADR-021](docs/DECISIONS.md) (CI/CD Pipeline).
- **Instrucciones:**
  1. Configurar `package.json` raíz con workspaces: `["backend", "web", "mobile"]` y scripts orquestadores (`dev`, `build`, `test`, `typecheck`).
  2. Crear `.gitignore` exhaustivo que bloquee `.env`, `node_modules`, `dist`, `.expo` y temporales.
  3. Crear `docker-compose.yml` con servicios para PostgreSQL 16 Alpine (`5432`) y Redis 7 Alpine (`6379`) con healthchecks.
  4. Crear `.env.example` central con todas las variables documentadas para backend, web y mobile.
- **Comando de Verificación:**
  ```bash
  npm run docker:up && docker compose ps
  ```
- **Criterio de Aceptación:** Contenedores de Postgres y Redis levantados y reportando estado saludable (`healthy`).

### 📦 TASK-0.2: Scripts de Automatización DX para Desarrollo Local
- **Capa:** Raíz (`/`)
- **Archivos:** `run.bat`, `start.ps1`
- **Contratos/ADRs:** [ADR-016](docs/DECISIONS.md) (Conexión Mobile USB Directa con ADB Reverse), [`GUIA_EJECUCION_VETCONNECT.md`](GUIA_EJECUCION_VETCONNECT.md).
- **Instrucciones:**
  1. Crear `run.bat` para iniciar backend (puerto 3001) y web (puerto 5173) en Windows de forma concurrente.
  2. Crear `start.ps1` para detectar dispositivos Android conectados por USB, ejecutar `adb reverse tcp:3001 tcp:3001` e iniciar Expo en mobile sin depender de Wi-Fi corporativo.
- **Comando de Verificación:**
  ```powershell
  Get-Command adb -ErrorAction SilentlyContinue
  ```
- **Criterio de Aceptación:** Scripts existentes, ejecutables y documentados en el README.

---

## 🐘 FASE 1: Modelado de Datos & Prisma ORM 6

### 📦 TASK-1.1: Esquema Relacional de Base de Datos con Mappings Snake_Case
- **Capa:** Backend (`backend/prisma/schema.prisma`)
- **Archivos:** `backend/prisma/schema.prisma`
- **Contratos/ADRs:** [ADR-002](docs/DECISIONS.md) (Prisma 6), [ADR-005](docs/DECISIONS.md) (Soft-Deletes), [ADR-019](docs/DECISIONS.md) (Índices & Denormalización), [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) §1.
> 🛡️ **AISLAMIENTO DE ALCANCE (Scope Isolation MVP v2.0 vs v2.1+):**  
> Para preservar la velocidad de entrega del Greenfield inicial y evitar sobrecarga en la base de datos:  
> - **Modelos v2.0 In-Scope:** Los 9 modelos base del dominio (`User`, `Pet`, `Consultation`, `Message`, `Call`, `Prescription`, `Review`, `AuditLog`, `DailyUploadCounter`) y soporte de notificaciones (`PushToken`, `Notification`).  
> > - **Protocolo de Migraciones Sin Caídas (Expand/Contract):** A partir del Hito M5, todo campo nuevo de v2.1+ debe crearse inicialmente como opcional/nullable (`@nullable`), desplegar el código que escribe en ambos estados, ejecutar backfill asíncrono y posteriormente contraer la columna si se requiere obligatoriedad (`SPEC.md` §8.2).
- **Modelos v2.1+ Excluidos (Prohibidos en F1):** Quedan terminantemente excluidos del `schema.prisma` inicial: `VaccinationRecord`, `PetDocument`, `MedicationSchedule`, `FavoriteVet`.  
> - **Campos v2.1+ Excluidos de `Pet`:** No agregar en esta fase los campos `isHidden`, `deathDate`, `birthDate`.  
> - **Evolución:** Estos elementos pertenecen exclusivamente a los Hitos M5 a M8 del Roadmap v2.1 y se incorporarán mediante migraciones *expand/contract* cuando comience dicha fase.

- **Instrucciones:**
  1. Configurar datasource PostgreSQL y client generator de Prisma en `backend/prisma/schema.prisma`.
  2. Definir enums: `Role` (`CLIENT`, `VET`, `ADMIN`), `VetStatus` (`PENDING`, `APPROVED`, `REJECTED`), `ConsultationStatus` (`WAITING`, `ACTIVE`, `COMPLETED`, `CANCELLED`), `CallStatus` (`INITIATED`, `ACTIVE`, `ENDED`).
  3. Implementar modelos: `User`, `Pet`, `Consultation`, `Message`, `Call`, `Prescription`, `Review`, `AuditLog`, `DailyUploadCounter`, `PushToken`, `Notification`.
  4. Mapear **todas** las columnas multi-palabra explícitamente a snake_case: `@map("is_email_verified")`, `@map("token_version")`, `@map("last_seen")`, `@map("deleted_at")`, `@map("rating_avg")`, etc.
  5. Mapear todas las tablas en plural: `@@map("users")`, `@@map("pets")`, etc.
  6. Configurar índices compuestos de alto rendimiento:
     - `@@index([role, isOnline, vetStatus, deletedAt])` en `User`.
     - `@@index([clientId, status, deletedAt])` y `@@index([vetId, status, deletedAt])` en `Consultation`.
     - `@@index([consultationId, createdAt])` en `Message`.
- **Comando de Verificación:**
  ```bash
  cd backend && npx prisma validate && npx prisma format
  ```
- **Criterio de Aceptación:** Validación de Prisma sin advertencias ni errores; 100% de columnas multi-palabra mapeadas.

### 📦 TASK-1.2: Migración Inicial, Singleton de Prisma y Seeds de Prueba
- **Capa:** Backend (`backend/src/lib/prisma.ts`, `backend/prisma/seed.ts`)
- **Archivos:** `backend/src/lib/prisma.ts`, `backend/prisma/seed.ts`, `backend/package.json`
- **Contratos/ADRs:** [ADR-006](docs/DECISIONS.md) (Singleton PrismaClient con Pooling).
- **Instrucciones:**
  1. Crear singleton de `PrismaClient` en `src/lib/prisma.ts` reutilizando la instancia en desarrollo para evitar agotar el pool de conexiones.
  2. Crear script `backend/prisma/seed.ts` con usuarios semilla:
     - 1 Admin (`admin@vetconnect.com`).
     - 2 Veterinarios (uno `APPROVED` y otro `PENDING`).
     - 2 Clientes con mascotas de prueba (perro con microchip de 15 dígitos ISO y gato sin microchip `null`).
  3. Configurar script `"seed": "tsx prisma/seed.ts"` en `backend/package.json`.
- **Comando de Verificación:**
  ```bash
  cd backend && npx prisma db push && npm run seed
  ```
- **Criterio de Aceptación:** Base de datos poblada exitosamente sin violaciones de unicidad ni claves foráneas.

---

## ⚙️ FASE 2: Core Backend REST API & Autenticación

### 📦 TASK-2.1: Servidor Express 5, Middlewares de Seguridad y Manejador de Errores RFC 7807
- **Capa:** Backend (`backend/src/server.ts`, `backend/src/app.ts`, `backend/src/middlewares/errorHandler.ts`)
- **Archivos:** `backend/src/app.ts`, `backend/src/server.ts`, `backend/src/middlewares/errorHandler.ts`
- **Contratos/ADRs:** [ADR-001](docs/DECISIONS.md) (Monolito Modular), [ADR-007](docs/DECISIONS.md) (Zod), [`docs/GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md`](docs/GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md) §3.
- **Instrucciones:**
  1. Configurar Express 5 con middlewares base: `helmet()`, `cors({ origin: [...] })`, `express.json({ limit: '10mb' })`, `cookieParser()`.
  2. Implementar middleware de rate limiting con Redis / memoria en `/api/auth/*`.
  3. Implementar middleware centralizado de errores con formato RFC 7807 (`{ success: false, error: { code, message, timestamp } }`).
  4. Configurar endpoint `/health` que reporte estado del proceso y conectividad a base de datos.
- **Comando de Verificación:**
  ```bash
  cd backend && npm run dev (en paralelo: curl http://localhost:3001/health)
  ```
- **Criterio de Aceptación:** Respuesta `{ status: "ok", timestamp: "..." }` con HTTP 200.

### 📦 TASK-2.2: Módulo de Autenticación con JWT, Refresh Cookies y `tokenVersion`
- **Capa:** Backend (`backend/src/modules/auth/`)
- **Archivos:** `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`, `auth.middleware.ts`, `auth.schemas.ts`
- **Contratos/ADRs:** [ADR-004](docs/DECISIONS.md) (JWT con `tokenVersion`), Antipatrón 1 de `AGENTS.md` (Cookies HttpOnly), [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) §3.
- **Instrucciones:**
  1. Crear esquemas Zod `registerSchema` (permite `role: 'CLIENT'` o `role: 'VET'`) y `loginSchema`.
     - **Diseño Bloqueante Estricto (ADR-013):** Las cuentas con rol `VET` se crean con `vetStatus: 'PENDING'`. Quedan estrictamente bloqueadas para ingresar a colas de triage, atender consultas o emitir recetas hasta que un Administrador valide manualmente su matrícula profesional (quedando formalmente descartado cualquier auto-registro no bloqueante).
  2. Implementar hash de contraseñas con `bcryptjs` (salt 12).
  3. Emitir Access Token (15 min) en JSON y Refresh Token (7 días) exclusivamente en cookie `HttpOnly`, `Secure`, `SameSite: strict`.
  4. Middleware `authenticate`: validar firma JWT con algoritmo fijo `algorithms: ['HS256']` y comprobar que `payload.tokenVersion === user.tokenVersion`.
  5. Endpoint `/logout`: incrementar `tokenVersion` del usuario e invalidar cookie para revocación instantánea de sesiones.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "auth"
  ```
- **Criterio de Aceptación:** Tests de registro, login, refresh en cookie y revocación de sesión por `tokenVersion` pasando en verde.

### 📦 TASK-2.3: Módulo de Gestión de Mascotas & Validación de Microchip
- **Capa:** Backend (`backend/src/modules/pets/`)
- **Archivos:** `pets.controller.ts`, `pets.service.ts`, `pets.routes.ts`, `pets.schemas.ts`
- **Contratos/ADRs:** [ADR-005](docs/DECISIONS.md) (Protección de PII), [`docs/MINUTA_STAKEHOLDER_2026-09.md`](docs/MINUTA_STAKEHOLDER_2026-09.md) (Microchip Opcional).
- **Instrucciones:**
  1. Crear `createPetSchema`: nombre, especie, raza, fecha de nacimiento, peso y `microchip` opcional (si se provee, validar estrictamente 15 dígitos numéricos estándar ISO).
  2. Implementar CRUD de mascotas asociado al `ownerId` con soft-delete (`deletedAt`).
  3. Redacción de PII: Cuando un veterinario consulta una mascota (`GET /api/pets/:id`), omitir `email` y `phone` del dueño a menos que exista una consulta médica activa o histórica vinculada entre ambos.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "pets"
  ```
- **Criterio de Aceptación:** Registro exitoso con microchip válido, registro exitoso con microchip nulo, rechazo 400 ante formato de microchip inválido.

### 📦 TASK-2.4: Módulo de Consultas & Máquina de Estados Médica
- **Capa:** Backend (`backend/src/modules/consultations/`)
- **Archivos:** `consultations.controller.ts`, `consultations.service.ts`, `consultations.routes.ts`, `consultations.schemas.ts`
- **Contratos/ADRs:** [ADR-013](docs/DECISIONS.md) (Sala de Espera), [`docs/SPEC.md`](docs/SPEC.md) §3.
- **Instrucciones:**
  1. Crear `createConsultationSchema` (motivo de consulta, síntomas, `petId`).
  2. Flujo de estados:
     - Crear consulta: estado inicial `WAITING`.
     - Si hay un veterinario `APPROVED` online (`isOnline = true`) con disponibilidad, auto-asignar y cambiar a `ACTIVE`.
     - Finalizar consulta (`completeConsultation`): veterinario ingresa diagnóstico y receta médica opcional, estado transiciona a `COMPLETED`.
  3. Endpoint de calificación (`POST /api/consultations/:id/review`): calificar del 1 al 5 estrellas, recalculando atómicamente `rating_avg` y `rating_count` del veterinario en una transacción Prisma (ADR-019 y ADR-023).
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "consultations"
  ```
- **Criterio de Aceptación:** Transiciones de estado validadas, imposibilidad de finalizar consultas ajenas, recálculo atómico de estrellas 1–5.

---

### 📦 TASK-2.5: Módulo de Recetas Digitales Estructuradas con Firma y Código QR
- **Capa:** Backend (`backend/src/modules/prescriptions/`)
- **Archivos:** `prescriptions.controller.ts`, `prescriptions.service.ts`, `prescriptions.routes.ts`, `prescriptions.schemas.ts`, `qr.util.ts`
- **Contratos/ADRs:** [ADR-013](docs/DECISIONS.md) (Veterinario Aprobado Bloqueante), PB-35 (Sprint 9), [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) §2.3, [`docs/SPEC.md`](docs/SPEC.md) §3.3 y §4.
- **Instrucciones:**
  1. Crear esquema Zod `createPrescriptionSchema` validando campos clínicos obligatorios:
     - `medication: z.string().min(2).max(100)`
     - `dosage: z.string().min(1).max(100)`
     - `frequency: z.string().min(1).max(100)`
     - `durationDays: z.number().int().positive().max(365)`
     - `indications: z.string().min(5).max(1000)`
  2. Implementar endpoint `POST /api/consultations/:id/prescriptions`:
     - Validar que el usuario autenticado posea rol `VET` y matrícula aprobada (`vetStatus: 'APPROVED'`).
     - Validar que sea el veterinario asignado a la consulta médica (`vetId === req.user.id`).
     - Validar que la consulta se encuentre en estado `ACTIVE` o completándose en la misma transacción.
  3. Generar firma digital inmutable y código QR único apuntando a la URL pública de validación de receta (`https://vetconnect.app/verify/prescription/:id`).
  4. Persistir registro en la tabla `prescriptions` de PostgreSQL asociada a la consulta, veterinario y mascota.
  5. Emitir evento en tiempo real `prescription:new` vía Socket.io hacia la sala `consultation:${consultationId}` para notificar instantáneamente al tutor en Web y Mobile.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "prescriptions"
  ```
- **Criterio de Aceptación:** Emisión exitosa de receta con código QR por el veterinario asignado; rechazo HTTP 403 ante veterinarios no aprobados o ajenos a la consulta; broadcast de evento `prescription:new` recibido por ambos participantes.

---

## ⚡ FASE 3: Motor de Tiempo Real & Chat WebSocket

### 📦 TASK-3.1: Servidor Socket.io con Redis Adapter & Autenticación
- **Capa:** Backend (`backend/src/realtime/`)
- **Archivos:** `socket.server.ts`, `socket.auth.middleware.ts`, `socket.types.ts`
- **Contratos/ADRs:** [ADR-009](docs/DECISIONS.md) (Socket.io + Redis Adapter), [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) §2.
- **Instrucciones:**
  1. Configurar servidor Socket.io adjunto a la instancia HTTP de Express.
  2. Conectar `@socket.io/redis-adapter` si `REDIS_URL` está definido (obligatorio en producción).
  3. Configurar CORS estricto en Socket.io validando `origin` contra lista blanca (`process.env.FRONTEND_URL`, prohibido `origin: "*"` en producción según ADR-009).
  4. Implementar rate limiting por socket para mitigar inundaciones de paquetes (máximo 10 eventos/segundo por cliente).
  5. Middleware de autenticación de sockets: extraer JWT del handshake (`auth.token` o cookie), validar firma y cargar usuario en `socket.data.user`.
  4. Manejo de conexión y desconexión: actualizar `isOnline` y `lastSeen = new Date()` en PostgreSQL.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "realtime.auth"
  ```
- **Criterio de Aceptación:** Conexión aceptada con token válido; conexión rechazada (401) con token expirado o ausente.

### 📦 TASK-3.2: Gateway de Chat con Idempotencia por `clientMsgId`
- **Capa:** Backend (`backend/src/realtime/gateways/chat.gateway.ts`, `backend/src/modules/consultations/consultations.controller.ts`)
- **Archivos:** `chat.gateway.ts`, `consultations.controller.ts`
- **Contratos/ADRs:** Antipatrón 4 de `AGENTS.md` (Idempotencia), [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) §2.
- **Instrucciones:**
  1. Evento `message:send`: recibir `{ consultationId, content, clientMsgId, mediaUrl? }`.
  2. Verificar que el emisor sea el cliente o veterinario asignado a la consulta `ACTIVE`.
  3. Almacenar mensaje en base de datos. Si ocurre colisión única de `clientMsgId` (código Prisma `P2002`), capturar el error y responder HTTP 200 con el mensaje existente en lugar de fallar con 500.
  4. Broadcast del mensaje a la sala de Socket.io `consultation:${consultationId}` mediante evento `message:received`.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "chat.idempotency"
  ```
- **Criterio de Aceptación:** Reintento con el mismo `clientMsgId` devuelve el mensaje original con HTTP 200 y cero duplicados en la base de datos.

---

## 🎥 FASE 4: Telemedicina WebRTC & Manejo Seguro de Archivos

### 📦 TASK-4.1: Minting de Tokens Criptográficos de LiveKit SFU sin Exposición de PII
- **Capa:** Backend (`backend/src/modules/calls/`)
- **Archivos:** `calls.controller.ts`, `calls.service.ts`, `calls.routes.ts`
- **Contratos/ADRs:** [ADR-012](docs/DECISIONS.md) (LiveKit SFU), Antipatrón 2 de `AGENTS.md` (Tokens LiveKit seguros).
> 🔬 **GATE DE VERIFICACIÓN PREVIA (Spike LiveKit):**  
> Antes de codificar TASK-4.1 en producción, ejecutar la prueba de concepto aislada en `spikes/livekit-spike/` (`npm test` en esa carpeta) para validar empíricamente la emisión de tokens opacos sin PII, el teardown determinista con `deleteRoom` y el handshake WebView (`page:ready`).

- **Instrucciones:**
  1. Integrar SDK oficial `livekit-server-sdk`.
  2. Endpoint `POST /api/calls/:consultationId/token`:
     - Verificar que la consulta esté `ACTIVE` y el solicitante sea participante de la misma.
     - Generar `AccessToken` con `identity: user.id` (ID opaco) y `name: user.firstName` (nombre de pila público).
     - **Prohibido incluir correos electrónicos (`user.email`) en los claims o metadatos de LiveKit.**
     - Asignar permisos de sala: `roomJoin: true`, `room: consultationId`.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "calls.token"
  ```
- **Criterio de Aceptación:** Token JWT de LiveKit emitido; verificación de claims confirma ausencia de correo electrónico o PII sensible.

### 📦 TASK-4.2: Subida Segura de Archivos con Validación Binaria de Magic Bytes
- **Capa:** Backend (`backend/src/modules/media/`)
- **Archivos:** `media.middleware.ts`, `media.service.ts`, `media.controller.ts`, `media.routes.ts`
- **Contratos/ADRs:** [ADR-010](docs/DECISIONS.md) (Storage Resiliente), [ADR-020](docs/DECISIONS.md) (Mitigación DoS & Streaming).
- **Instrucciones:**
  1. Configurar Multer con `diskStorage` temporal en `./uploads/tmp/` (máximo 10 MB).
  2. Middleware `verifyMagicBytes`: leer los primeros 32 bytes del buffer en disco para comprobar la firma binaria real:
     - JPEG: `FF D8 FF`
     - PNG: `89 50 4E 47`
     - PDF: `25 50 44 46`
  3. Sanitizar nombres de archivo para neutralizar ataques de Path Traversal (`../`).
  4. Mover el archivo validado a `./uploads/` (o subir a AWS S3 mediante presigned URL) y eliminar el archivo temporal inmediatamente.
  5. Cuota de subida diaria: registrar consumo en `DailyUploadCounter` y limitar a 50 MB/día por usuario.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "media.magicbytes"
  ```
- **Criterio de Aceptación:** Archivo `.exe` renombrado a `.jpg` es rechazado con código 400 por discordancia de magic bytes; imágenes legítimas se procesan exitosamente.

---

## 💻 FASE 5: Frontend Web SPA (React 19 + Vite)

### 📦 TASK-5.1: Scaffolding Web, Enrutamiento y Capa de Datos (TanStack Query v5)
- **Capa:** Web (`web/`)
- **Archivos:** `web/package.json`, `web/vite.config.ts`, `web/src/main.tsx`, `web/src/App.tsx`, `web/src/services/api.ts`
- **Contratos/ADRs:** [ADR-015](docs/DECISIONS.md) (TanStack Query v5), [ADR-008](docs/DECISIONS.md), [ADR-022](docs/DECISIONS.md) (Vercel Oficial).
- **Instrucciones:**
  1. Inicializar proyecto React 19 + Vite + TypeScript + Tailwind CSS.
  2. Configurar cliente HTTP Axios con interceptor para refresh token automático en 401.
  3. Configurar `QueryClient` de TanStack Query con tiempos de invalidación optimizados (`staleTime: 5 min`).
  4. Configurar rutas protegidas (`ProtectedRoute`) para clientes, veterinarios y administradores.
- **Comando de Verificación:**
  ```bash
  cd web && npm run build
  ```
- **Criterio de Aceptación:** Build de Vite ejecutado sin errores; rutas privadas redirigen al login ante ausencia de sesión.

### 📦 TASK-5.2: Sala de Videollamada WebRTC con LiveKit Components
- **Capa:** Web (`web/src/components/call/`)
- **Archivos:** `web/src/components/call/CallRoom.tsx`, `web/src/components/call/PreJoinModal.tsx`
- **Contratos/ADRs:** [ADR-012](docs/DECISIONS.md) (LiveKit SFU), Antipatrón 3 de `AGENTS.md` (Cero duplicación de audio renderer).
- **Instrucciones:**
  1. Instalar `@livekit/components-react` y `livekit-client`.
  2. Implementar pantalla `PreJoinModal` para testeo de cámara y micrófono antes de ingresar.
  3. Renderizar `<LiveKitRoom>` pasando el token criptográfico emitido por el backend.
  4. Incluir exclusivamente el componente `<VideoConference />`. **Prohibido agregar `<RoomAudioRenderer />` adicional para evitar eco y distorsión.**
  5. Calidad de video configurada a 720p adaptativo con reconexión automática.
- **Comando de Verificación:**
  ```bash
  cd web && npm test -- -t "CallRoom"
  ```
- **Criterio de Aceptación:** Componente renderiza correctamente y desconecta la llamada limpiamente al desmontarse.

---

## 📱 FASE 6: Aplicación Mobile (React Native + Expo SDK 54)

### 📦 TASK-6.1: Scaffolding Mobile, Expo Router y Persistencia Segura
- **Capa:** Mobile (`mobile/`)
- **Archivos:** `mobile/package.json`, `mobile/app.json`, `mobile/app/_layout.tsx`, `mobile/src/lib/authStore.ts`
- **Contratos/ADRs:** [ADR-016](docs/DECISIONS.md) (ADB Reverse USB), [ADR-018](docs/DECISIONS.md) (Distribución Android).
- **Instrucciones:**
  1. Configurar proyecto Expo SDK 54 con Expo Router y NativeWind.
  2. Implementar `authStore` utilizando `expo-secure-store` para el almacenamiento seguro de credenciales.
  3. Configurar cliente Socket.io mobile con gestión de ciclo de vida (`AppState`: desconectar sockets en segundo plano para ahorrar batería).
- **Comando de Verificación:**
  ```bash
  cd mobile && npx expo-doctor || npm run typecheck
  ```
- **Criterio de Aceptación:** Proyecto mobile compila y typecheck de TypeScript pasa sin errores.

### 📦 TASK-6.2: Telemedicina Mobile con WebView y Handshake Bidireccional
- **Capa:** Mobile (`mobile/app/(app)/call/[consultationId].tsx`)
- **Archivos:** `mobile/app/(app)/call/[consultationId].tsx`
- **Contratos/ADRs:** Fase 4 de `AGENTS.md` (Handshake bidireccional).
- **Instrucciones:**
  1. Configurar `react-native-webview` apuntando a la URL del contenedor de videollamada web (`/call/:id`).
  2. Habilitar permisos de hardware en Android (`RECORD_AUDIO`, `CAMERA`).
  3. Implementar protocolo de enlace (Handshake):
     - La página web emite `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page:ready' }))` al montarse.
     - El componente mobile aguarda el evento `page:ready` antes de inyectar el token de acceso criptográfico mediante `injectJavaScript`.
- **Comando de Verificación:**
  ```bash
  cd mobile && npm test -- -t "call"
  ```
- **Criterio de Aceptación:** WebView gestiona correctamente el handshake sin inyecciones prematuras de scripts.

---

### 📦 TASK-6.3: Módulo de Notificaciones Push con Expo Push API & Bandeja In-App
- **Capa:** Mobile & Backend (`backend/src/modules/notifications/`, `mobile/src/services/notifications.service.ts`)
- **Archivos:** `backend/src/modules/notifications/notifications.controller.ts`, `backend/src/modules/notifications/notifications.service.ts`, `backend/src/modules/notifications/notifications.routes.ts`, `backend/src/modules/notifications/notifications.schemas.ts`, `mobile/src/services/notifications.service.ts`, `mobile/app/(app)/notifications.tsx`
- **Contratos/ADRs:** [ADR-011](docs/DECISIONS.md) (Expo Push API & Bandeja In-App), PB-19 (S5), PB-20 (S6), PB-31 (S8), [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) §2.5.
- **Instrucciones:**
  1. Implementar en backend el despacho push mediante `expo-server-sdk`:
     - Endpoint `POST /api/notifications/register-token`: registra o actualiza de forma idempotente el token de dispositivo (`ExponentPushToken[...]`) asociado al `userId` autenticado en la tabla `push_tokens`.
     - Despacho automatizado de notificaciones ante eventos críticos: videollamada entrante (`call:incoming`), nuevo mensaje de chat con app en segundo plano y emisión de receta médica oficial (`prescription:new`).
  2. Implementar persistencia y lectura de bandeja in-app en tabla `notifications`:
     - Endpoint `GET /api/notifications`: lista las notificaciones históricas del usuario autenticado ordenadas por fecha descendente con paginación (`take`, `skip`).
     - Endpoint `PATCH /api/notifications/:id/read`: marca una notificación individual como leída.
  3. En la aplicación móvil (`mobile/src/services/notifications.service.ts`):
     - Solicitar permisos nativos de notificación en el primer arranque mediante `expo-notifications`.
     - Obtener el push token con `Notifications.getExpoPushTokenAsync()` y sincronizarlo con el backend mediante `POST /api/notifications/register-token`.
     - Configurar listener de notificaciones en segundo plano para redirección directa (deep linking) a `/call/:consultationId` o `/consultations/:id`.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- -t "notifications"
  ```
- **Criterio de Aceptación:** Registro idempotente del push token de Expo; despacho simulado sin errores hacia los servidores de Expo; persistencia, consulta y marcado de lectura en bandeja in-app funcionando con 100% de tests en verde.

---

## 🧪 FASE 7: QA Automatizado, Hardening & CI/CD

### 📦 TASK-7.1: Suite Completa de Pruebas Automatizadas Backend (Meta: 120+ Tests)
- **Capa:** Backend (`backend/src/__tests__/`)
- **Archivos:** 10 suites de test en `backend/src/__tests__/` (`app.test.ts`, `auth.test.ts`, `pets.test.ts`, `consultations.test.ts`, `calls.test.ts`, `media.test.ts`, `realtime.test.ts`, `users.test.ts`, `utils.test.ts`, `cache.test.ts`).
- **Contratos/ADRs:** Meta proyectada de ~120+ tests en Jest (>80% de cobertura).
- **Instrucciones:**
  1. Configurar Jest con `supertest` y base de datos efímera de pruebas.
  2. Implementar tests de autenticación positiva y negativa (tokens alterados, expirados, `tokenVersion` inválido).
  3. Implementar tests de validación estricta Zod en todos los endpoints.
  4. Implementar tests de concurrencia en finalización de consultas y deduplicación de mensajes.
- **Comando de Verificación:**
  ```bash
  cd backend && npm test -- --coverage
  ```
- **Criterio de Aceptación:** 100% de los tests pasando en verde, cobertura global de código superior al 80%.

### 📦 TASK-7.2: Contenedor Docker de Producción & Despliegue en Coolify (ADR-017)
- **Capa:** Raíz / Backend (`backend/Dockerfile`, `docs/DEPLOY.md`)
- **Archivos:** `backend/Dockerfile`, `backend/.dockerignore`
- **Contratos/ADRs:** [ADR-017](docs/DECISIONS.md) (Coolify VPS), [ADR-022](docs/DECISIONS.md) (Vercel Edge), [ADR-021](docs/DECISIONS.md) (Hardening de Contenedores).
- **Instrucciones:**
  1. Crear `Dockerfile` multi-stage build para el backend:
     - Etapa 1 (`builder`): Compilar TypeScript y generar Prisma Client.
     - Etapa 2 (`runner`): Imagen limpia `node:20-alpine`, instalar únicamente dependencias de producción.
     - Ejecutar bajo usuario sin privilegios `USER node` (no root).
     - Configurar `HEALTHCHECK` consultando `/health`.
- **Comando de Verificación:**
  ```bash
  docker build -t vetconnect-backend:latest -f backend/Dockerfile .
  ```
- **Criterio de Aceptación:** Imagen construida exitosamente con peso optimizado y arrancando bajo usuario `node`.

---
*Backlog Greenfield para Agentes de IA — VetConnect 2026.*
