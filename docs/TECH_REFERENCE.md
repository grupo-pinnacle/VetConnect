# 📚 Referencia Técnica Integral del Sistema — VetConnect

Esta guía contiene la documentación de bajo nivel, contratos de endpoints, eventos de WebSocket y estructura completa de directorios para desarrolladores.

---

## 1. Estructura de Directorios del Monorepo

```
vetconnect/
├── backend/                        # API REST, WebSockets & Capa de Persistencia
│   ├── prisma/
│   │   ├── schema.prisma           # Modelado de datos PostgreSQL
│   │   └── seed.ts                 # Semilla de datos de prueba (TypeScript, ejecutado via `ts-node`)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin/              # Fiscalización SENASA, aprobación/rechazo de veterinarios, AuditLogs
│   │   │   ├── auth/               # Registro, Login, Refresh JWT, Verificación Email
│   │   │   ├── users/              # Perfil de usuario, conmutación isOnline, bio
│   │   │   ├── pets/               # CRUD de mascotas, especies, fichas clínicas
│   │   │   ├── consultations/      # Triage, colas, asignación, estados, notas
│   │   │   ├── prescriptions/      # Emisión y verificación QR de recetas oficiales SENASA
│   │   │   ├── calls/              # Señalización WebRTC y tokens LiveKit
│   │   │   ├── media/              # Subida de adjuntos (S3 / Local), magic bytes
│   │   │   └── notifications/      # Push Expo API y bandeja in-app
│   │   ├── config/
│   │   │   ├── cors.ts             # Política CORS dinámica Express y Socket.io
│   │   │   └── env.ts              # Validación Zod fail-fast de variables de entorno
│   │   ├── lib/
│   │   │   ├── prisma.ts           # Cliente Prisma singleton con connection pooling
│   │   │   └── redis.ts            # Cliente ioredis y Redis adapter
│   │   ├── middlewares/            # Auth, requireRole, rateLimiter, errorHandler RFC 7807
│   │   ├── realtime/               # Gateway de Socket.io y multiplexación de salas
│   │   ├── app.ts                  # Configuración de Express, Helmet & Middlewares
│   │   └── server.ts               # Punto de entrada HTTP, Socket.io y Graceful Shutdown
│   ├── jest.config.js              # Configuración de pruebas automatizadas
│   └── package.json
│
├── web/                            # Frontend Web (Veterinarios, Admins y Tutores)
│   ├── src/
│   │   ├── components/
│   │   │   ├── call/               # CallRoom, PreJoinModal (LiveKit WebRTC + Handshake)
│   │   │   ├── common/             # ErrorBoundary, Global Fallbacks
│   │   │   └── ui/                 # Componentes base y catálogo Storybook (Button, Input, Badge, etc.)
│   │   ├── context/                # AuthContext (Almacenamiento de token y Axios interceptor)
│   │   ├── pages/                  # Landing, Login, Register, DashboardClient, DashboardVet, ConsultationRoom, PrescriptionView, AdminVets, NotFound
│   │   ├── routes/                 # ProtectedRoute, enrutamiento condicional por rol
│   │   ├── services/               # api.ts (Instancia Axios centralizada y contratos REST)
│   │   └── types/                  # Interfaces TypeScript nativas sincronizadas con backend DTOs
│   ├── tailwind.config.js          # Sistema de diseño, tokens clínicos y responsive breakpoints
│   └── vite.config.ts              # Configuración de Vite, code-splitting y proxies
│
├── mobile/                         # Aplicación Nativa Mobile (React Native / Expo)
│   ├── app/                        # File-based routing (Expo Router)
│   │   ├── (auth)/                 # Pantallas de Login y Registro
│   │   └── (app)/                  # Pantallas con Tabs (Home, Pets, Chat, Historial)
│   ├── src/
│   │   ├── components/             # Componentes UI nativos (NativeWind)
│   │   ├── hooks/                  # useAuth, useIncomingCall, usePets
│   │   ├── lib/                    # api.ts, socket.ts, secureStore.ts
│   │   └── stores/                 # Zustand state stores
│   └── app.json                    # Configuración de Expo, permisos y bundle IDs
│
└── docs/                           # Documentación técnica consolidada
    ├── PROJECT_CHARTER.md          # Carta fundacional, gobernanza y visión del proyecto
    ├── PLAN_DE_PROYECTO_Y_GESTION.md # Plan de Proyecto, RACI, Stakeholders, DCU & KPIs
    ├── ARCHITECTURE.md             # Arquitectura de alto nivel y normativas
    ├── DECISIONS.md                # Registro oficial de decisiones de arquitectura (ADR-001 a ADR-024)
    ├── TECH_REFERENCE.md           # Este documento (referencia técnica y contratos)
    ├── GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md # Guía de Buenas Prácticas, Antipatrones y Seguridad
    ├── DEPLOY.md                   # Manual de despliegue en producción (Coolify / Vercel / EAS)
    ├── BRIEF.md                    # Brief de producto y modelo de negocio
    ├── SPEC.md                     # Especificación técnica, modelos de dominio y protocolos
    ├── MINUTA_STAKEHOLDER_2026-09.md # Requerimientos acordados con stakeholders y backlog v2.1+
    ├── LIVEKIT_AUDIT.md            # Guía Maestra & Checklist Preventivo de Implementación LiveKit SFU
    ├── PROPUESTA_MEJORAS_LIVEKIT.md # Hoja de Ruta Consolidada LiveKit
    └── RECONCILIACION_ARQUITECTURA_Y_DISCREPANCIAS.md # Registro Oficial de Reconciliación de Arquitectura
```

> ℹ️ **Nota de Diseño sobre `packages/shared` (ADR-008):**
> Para maximizar la velocidad de desarrollo y evitar la sobrecarga de tooling complejo de monorepos (Nx, Turborepo o transpiladores cruzados), la arquitectura descarta formalmente un workspace `packages/shared`. Los contratos y esquemas Zod se definen con rigor en el Backend (`backend/src/contracts/` y DTOs por módulo) y se sincronizan como interfaces TypeScript nativas en los clientes `web` y `mobile`.

---

### 1.1 Modelos Canónicos del Schema de Base de Datos (Prisma v2.0)
El esquema inicial del MVP v2.0 comprende **exactamente 10 modelos principales** más soporte de notificaciones:
1. `User`: Identidades con autenticación JWT, rol (`CLIENT`, `VET`, `ADMIN`), `vetStatus` y `tokenVersion`.
2. `Pet`: Mascotas con soporte de soft-delete (`deletedAt`) y validación opcional de microchip ISO 15 dígitos.
3. `Consultation`: Ciclo clínico y máquina de estados (`WAITING`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
4. `Message`: Mensajería sincrónica de chat con deduplicación por `clientMsgId` único.
5. `Call`: Sesiones de teleconsulta WebRTC con estado (`INITIATED`, `ACTIVE`, `ENDED`) y duración.
6. `Prescription`: Recetas médicas digitales oficiales con firma profesional y código QR.
7. `Review`: Calificaciones médicas profesionales en escala universal de 1 a 5 estrellas (ADR-023).
8. `AuditLog`: Registro inmutable de auditoría para trazabilidad de mutaciones administrativas (ADR-014).
9. `DailyUploadCounter`: Control de cuota diaria de subidas por usuario (`totalBytes` acumulado hasta 50 MB/día y `count`, mitigación DoS).
10. `MediaFile`: Metadatos de archivos clínicos y adjuntos (`id`, `ownerId`, `consultationId`, `fileName`, `fileSize`, `mimeType`, `localPath`, `s3Key`, `createdAt`, `deletedAt`). Cumple con ADR-010 (acceso autenticado, prohibición de serving estático) y ADR-020.
*(Soporte de notificaciones: modelos `PushToken` [tokens de dispositivo Expo Push API con `platform` y unicidad de token] y `Notification` [bandeja in-app persistida con `title`, `body`, `type`, `data`, `isRead`, `readAt`] bajo ADR-011).*

---

## 2. Contratos de API REST (Endpoints Clave)

### 2.1 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevos tutores o veterinarios (VET inicia en `PENDING`) | Público |
| `POST` | `/api/auth/login` | Inicio de sesión. Web: Refresh Token en cookie `HttpOnly`. Mobile (`X-Client-Platform: mobile`): Refresh Token en JSON body para `expo-secure-store` | Público |
| `POST` | `/api/auth/refresh` | Renovación de access token. Web: lee cookie `HttpOnly`. Mobile: lee payload `{ refreshToken }` | Público |
| `POST` | `/api/auth/logout` | Cierre de sesión, incrementa `tokenVersion` e invalida cookies | Autenticado |
| `GET`  | `/api/auth/me`     | Rehidratación del perfil de usuario autenticado activo en `AuthContext.tsx` | Autenticado |

### 2.2 Usuarios & Perfil (`/api/users`)
> ⚠️ **Nota de Contrato:** Para obtener el perfil del usuario autenticado, usar `GET /api/auth/me` (definido en la sección 2.1). El módulo `users` solo expone `PATCH /api/users/profile` para actualizaciones.

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `PATCH`| `/api/users/profile` | Conmutación reactiva de guardia (`isOnline: boolean`), edición de `bio` y `photoUrl` | Autenticado |

### 2.3 Mascotas (`/api/pets`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/pets` | Listar mascotas del usuario autenticado | CLIENT / ADMIN |
| `POST` | `/api/pets` | Crear nueva ficha de mascota (microchip ISO opcional) | CLIENT / ADMIN |
| `GET` | `/api/pets/:id` | Obtener detalle e historial clínico de una mascota | Dueño / Vet asignado / ADMIN |
| `PATCH`| `/api/pets/:id` | Modificar datos de la mascota | Dueño / ADMIN |
| `DELETE`| `/api/pets/:id` | Soft-delete de mascota (`deletedAt`) | Dueño / ADMIN |

### 2.3 Consultas & Telemedicina (`/api/consultations`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/consultations` | Crear consulta e ingresar en cola de triage (`WAITING`, TTL 15 min). Convención UI: la prioridad elegida (`ROJO`\|`AMARILLO`\|`VERDE`) se antepone en `notes` como `[Prioridad: ${priority}] ${notes}` | CLIENT |
| `GET`  | `/api/consultations/mine`| **CLIENT:** Devuelve sus propias consultas activas/pendientes. **VET:** Devuelve sus consultas asignadas MÁS todas las consultas en estado `WAITING` de la cola de guardia (sin requerir query params). | Autenticado |
| `GET` | `/api/consultations/:id`| Obtener detalle completo de consulta e historial | Participantes / ADMIN |
| `PATCH`| `/api/consultations/:id/assign` | Toma directa de guardia o auto-asignación FIFO | VET (Approved) / ADMIN |
| `PATCH`| `/api/consultations/:id/cancel` | Cancelar consulta telemática (transición a `CANCELLED`) | Participantes / ADMIN |
| `PATCH`| `/api/consultations/:id/complete` | Cerrar consulta registrando evolución (`diagnosisNotes`) | VET asignado |
| `POST` | `/api/consultations/:id/prescriptions` | Emitir receta digital oficial con QR y firma | VET asignado |
| `GET`  | `/api/consultations/:id/messages` | Recuperar historial de mensajes o sincronización incremental (`?after={ISO_TIMESTAMP}`). ⚠️ **Los mensajes nuevos se envían EXCLUSIVAMENTE via Socket.io `message:send` — no existe un endpoint REST para enviar mensajes.** | Participantes |
| `POST` | `/api/consultations/:id/review` | Calificar atención médica (1 a 5 estrellas, ADR-023) | CLIENT asignado |

### 2.4 Administración & Fiscalización SENASA (`/api/admin`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET`  | `/api/admin/vets/pending` | Listar veterinarios pendientes de validación de matrícula SENASA (`vetStatus = PENDING`). Requiere rol `ADMIN` | ADMIN |
| `PATCH`| `/api/admin/vets/:id/approve` | Aprobar matrícula profesional (`vetStatus = APPROVED`) y registrar auditoría inmutable en `AuditLog` | ADMIN |
| `PATCH`| `/api/admin/vets/:id/reject` | Rechazar solicitud profesional con motivo obligatorio (`{ reason: string }`), pasa a `REJECTED` y audita | ADMIN |

### 2.5 Recetas Digitales SENASA (`/api/prescriptions`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET`  | `/api/prescriptions/:id` | Consulta y verificación pública no confidencial de receta médica oficial escaneada vía QR (medicamento, dosis, matrícula, fecha, mascota) | Público |
| `POST` | `/api/consultations/:id/prescriptions` | Emisión de receta digital oficial con firma y código QR | VET asignado |

### 2.6 Videollamadas (`/api/calls`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/calls/:consultationId/token` | Generar token de acceso LiveKit para una consulta (sin PII) | Participantes de la consulta |
| `POST` | `/api/calls/:consultationId/ring` | Disparar notificación de timbrado global al par (emite `call:incoming` con Cero PII y fallback Push Expo). Requiere consulta en estado `ACTIVE`. Errores: `400 INVALID_STATE`, `403 FORBIDDEN` | Participantes de la consulta |

### 2.7 Notificaciones Push & In-App (`/api/notifications`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/notifications/register-token` | Registrar o actualizar token Expo Push (`ExponentPushToken[...]`) idempotentemente | Autenticado |
| `GET`  | `/api/notifications` | Listar notificaciones in-app del usuario autenticado (`take`, `skip`) | Autenticado |
| `PATCH`| `/api/notifications/:id/read` | Marcar notificación específica como leída (`isRead: true`, `readAt`) | Autenticado |

### 2.8 Archivos Médicos & Adjuntos (`/api/media`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/media` | Subida multipart con validación binaria de Magic Bytes (JPEG, PNG, PDF). Límite individual de 10 MB/archivo y cuota agregada de 50 MB/día por usuario (RNF-06). Persiste metadatos en `MediaFile` y consumo en `DailyUploadCounter`. Retorna `413 FILE_TOO_LARGE` si archivo > 10 MB o `429 UPLOAD_QUOTA_EXCEEDED` si supera 50 MB/día | Autenticado |
| `GET`  | `/api/media/:id` | Descarga/streaming seguro de archivo clínico (prohibido acceso estático público ADR-010; valida que solicitante sea dueño, vet asignado o ADMIN). En S3 retorna URL presignada con TTL 300s; en local sirve vía stream seguro | Participantes / ADMIN |

### 2.9 Contratos de Consumo Frontend Web & Matriz de Query Keys (TanStack Query v5)

El cliente web gestiona el estado asíncrono del servidor mediante **TanStack Query v5**, organizando las consultas y mutaciones bajo una matriz determinista de *Query Keys*:

| Query Key | Hook / Consumo | Endpoint Backend | StaleTime | Invalidado Tras Mutación |
|---|---|---|---|---|
| `['pets']` | Listado de mascotas del tutor | `GET /api/pets` | 5 min | Alta de mascota (`POST /api/pets`), baja (`DELETE /api/pets/:id`) |
| `['pet', petId]` | Detalle e historial de mascota | `GET /api/pets/:id` | 5 min | Edición de mascota (`PATCH /api/pets/:id`) |
| `['consultations', 'mine']` | Consultas del usuario autenticado | `GET /api/consultations/mine` | 30 seg | Solicitud de triage (`POST /api/consultations`), asignación (`PATCH /.../assign`) |
| `['consultation', id]` | Ficha clínica de la consulta activa | `GET /api/consultations/:id` | 10 seg | Cierre con evolución (`PATCH /.../complete`), receta emitida |
| `['vets', 'pending']` | Cola de fiscalización SENASA | `GET /api/admin/vets/pending` | 1 min | Aprobación (`PATCH /.../approve`), rechazo (`PATCH /.../reject`) |
| `['prescriptions', id]` | Verificación de receta pública | `GET /api/prescriptions/:id` | 15 min | Inmutable tras emisión |

#### Interceptor de Autenticación & Cola Concurrente de Refresco:
- Instancia centralizada: `web/src/services/api.ts`
- Token en memoria: `currentAccessToken` (volátil, cero persistencia en `localStorage` contra XSS).
- Cola `failedQueue`: Si múltiples llamadas concurrentes reciben HTTP 401, se pausan en cola mientras se despacha un único `POST /api/auth/refresh` con cookie `HttpOnly`. Al renovarse el token, toda la cola se reintenta automáticamente con el nuevo `Authorization: Bearer <token>`.

---

### 2.10 Especificación Técnica de Vistas y Páginas Web

Cada página del frontend web implementa una interfaz formal tipada, gestionando los 4 estados canónicos (`loading`, `error`, `empty`, `success`):

| Página / Archivo | Ruta Web | Acceso / Rol | Endpoints REST Consumidos | Eventos Sockets / WebRTC |
|---|---|---|---|---|
| **Landing** (`Landing.tsx`) | `/` | Público | `GET /` (Assets estáticos) | N/A |
| **Login** (`Login.tsx`) | `/login` | Público | `POST /api/auth/login` | N/A |
| **Register** (`Register.tsx`) | `/register` | Público | `POST /api/auth/register` | N/A |
| **DashboardClient** (`DashboardClient.tsx`) | `/client/dashboard` | `CLIENT` | `GET /api/pets`, `POST /api/pets`, `POST /api/consultations`, `GET /api/consultations/mine` | `call:incoming`, `consultation:status` |
| **DashboardVet** (`DashboardVet.tsx`) | `/vet/dashboard` | `VET` | `PATCH /api/users/profile`, `GET /api/consultations/mine`, `PATCH /api/consultations/:id/assign`, `POST /api/consultations/:id/prescriptions` | `vet:status:changed`, `call:incoming` |
| **ConsultationRoom** (`ConsultationRoom.tsx`) | `/call/:id` | `CLIENT`, `VET`, `ADMIN` | `POST /api/calls/:id/token`, `GET /api/consultations/:id/messages` | `join:consultation`, `message:send`, `message:new`, LiveKit WebRTC SFU |
| **PrescriptionView** (`PrescriptionView.tsx`) | `/prescriptions/:id` | Público | `GET /api/prescriptions/:id` | N/A (Vista optimizada para impresión y farmacia) |
| **AdminVets** (`AdminVets.tsx`) | `/admin/vets` | `ADMIN` | `GET /api/admin/vets/pending`, `PATCH /api/admin/vets/:id/approve`, `PATCH /api/admin/vets/:id/reject` | N/A |
| **NotFound** (`NotFound.tsx`) | `*` (Catch-all) | Público | N/A | N/A (Redirección segura al home) |

---

## 3. Matriz de Eventos en Tiempo Real (Socket.io)

| Evento | Payload | Emisor | Receptor | Descripción |
|---|---|---|---|---|
| `join:consultation` | `{ consultationId: string }` | Cliente / Vet | Servidor | Une el socket a la sala de chat de la consulta |
| `message:send` | `{ consultationId, content, clientMsgId, attachmentUrl? }` | Cliente / Vet | Servidor | **Única forma de enviar mensajes de chat (no existe REST POST para mensajes).** Deduplicación idempotente: si `clientMsgId` ya existe, el servidor retorna el mensaje preexistente sin duplicar (HTTP 200). |
| `message:new` | `Message` object | Servidor | Sala de Consulta | Broadcast del mensaje a ambos participantes |
| `call:incoming` | `{ consultationId, callerName, roomName }` | Servidor | Usuario llamado | Dispara la alerta de llamada entrante en Web y Mobile |
| `call:answered` | `{ consultationId }` | Usuario llamado | Servidor | Notifica que la videollamada fue atendida |
| `call:rejected` | `{ consultationId, reason }` | Usuario llamado | Servidor | Cancela el timbrado en el dispositivo emisor |
| `prescription:new` | `Prescription` object | Servidor | Tutor / Sala | ⚠️ **TIPADO PERO NO EMITIDO — Pendiente de implementación:** El evento está declarado en `socket.types.ts` (ServerToClientEvents) pero `prescriptions.service.ts` no emite este evento actualmente. Para completarlo, `prescriptions.service.ts` debe emitir este evento a la sala `consultation:${consultationId}` después de crear la prescripción exitosamente. |

### 3.1 Protocolo WebRTC & Handshake de Videollamada (LiveKit Web Client)
- **Cero PII en Token JWT:** `identity: user.id`, `name: user.firstName`. Correos y teléfonos redactados.
- **Inyección dinámica de `wsUrl`:** Se toma del payload de `POST /api/calls/:id/token`.
- **Handshake WebView para Apps Móviles:**
  Al montar la sala en navegadores embebidos, se emite el evento:
  ```javascript
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'page:ready' }));
  ```
  Esto permite a la app nativa desmontar el spinner de carga inicial sin parpadeos.
- **Prevención de Eco Acústico (Antipatrón 3 de AGENTS.md):**
  Se monta exclusivamente `<VideoConference />` dentro de `<LiveKitRoom />`. Nunca duplicar `<RoomAudioRenderer />`.

---

## 4. Guía de Ejecución de Pruebas Automatizadas

### 4.1 Pruebas del Backend (Jest)
```bash
# Ejecutar toda la suite de pruebas del backend (Jest)
cd backend && npm test

# Ejecutar únicamente pruebas unitarias
npm run test:unit -w backend
```

### 4.2 Pruebas del Frontend Web (Vitest & Testing Library)
```bash
# Ejecutar toda la suite de pruebas del frontend web (Vitest)
npm test -w web

# Ejecutar en modo observador interactivo (TDD)
cd web && npx vitest

# Cobertura de código del frontend
cd web && npx vitest run --coverage
```

### 4.3 Verificación de Integración Continua y Pre-Despliegue
```bash
# 1. Verificación semántica y de gobernanza (40 PBs ↔ 20 TASKs ↔ 10 Modelos)
npm run check:governance

# 2. Typecheck estricto sin emisión en los 3 workspaces
npm run typecheck

# 3. Suite completa de pruebas en todo el monorepo (meta: 120+ tests)
npm test

# 4. Compilación de producción (Backend tsc + Web vite build)
npm run build
```

