# 📚 Referencia Técnica Integral del Sistema — VetConnect

Esta guía contiene la documentación de bajo nivel, contratos de endpoints, eventos de WebSocket y estructura completa de directorios para desarrolladores.

---

## 1. Estructura de Directorios del Monorepo

```
vetconnect/
├── backend/                        # API REST, WebSockets & Capa de Persistencia
│   ├── prisma/
│   │   ├── schema.prisma           # Modelado de datos PostgreSQL
│   │   └── seed.js                 # Semilla de datos de prueba
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin/              # Fiscalización SENASA, aprobación de veterinarios y AuditLogs
│   │   │   ├── auth/               # Registro, Login, Refresh JWT, Verificación Email, GET /me
│   │   │   ├── users/              # Perfil de usuario, estado isOnline, especialidad
│   │   │   ├── pets/               # CRUD de mascotas, especies, fichas clínicas
│   │   │   ├── consultations/      # Triage, colas, asignación, estados, notas
│   │   │   ├── calls/              # Señalización WebRTC y tokens LiveKit
│   │   │   ├── prescriptions/      # Emisión y verificación pública de recetas digitales SENASA
│   │   │   ├── media/              # Subida de adjuntos (S3 / Local), magic bytes
│   │   │   └── notifications/      # Push Expo API y bandeja in-app
│   │   ├── shared/
│   │   │   ├── middlewares/        # Auth, Role Guard, Rate Limit, Error Handler
│   │   │   ├── prisma.ts           # Cliente Prisma singleton
│   │   │   ├── redis.ts            # Cliente ioredis & socket.io adapter
│   │   │   └── types/              # Contratos y tipos compartidos
│   │   ├── app.ts                  # Configuración de Express & Middlewares
│   │   └── server.ts               # Punto de entrada HTTP y Socket.io
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
| `GET`  | `/api/auth/me`     | Obtener el usuario autenticado activo | Autenticado |

### 2.2 Usuarios & Perfil (`/api/users`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET`  | `/api/users/profile` | Obtener perfil completo del usuario autenticado | Autenticado |
| `PATCH`| `/api/users/profile` | Conmutación reactiva de guardia (`isOnline: boolean`), edición de especialidad, bio y teléfono | Autenticado |

### 2.3 Mascotas (`/api/pets`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/pets` | Listar mascotas del usuario autenticado | CLIENT / ADMIN |
| `POST` | `/api/pets` | Crear nueva ficha de mascota (microchip ISO opcional) | CLIENT / ADMIN |
| `GET` | `/api/pets/:id` | Obtener detalle e historial clínico de una mascota | Dueño / Vet asignado / ADMIN |
| `PATCH`| `/api/pets/:id` | Modificar datos de la mascota | Dueño / ADMIN |
| `DELETE`| `/api/pets/:id` | Soft-delete de mascota (`deletedAt`) | Dueño / ADMIN |

### 2.4 Administración & Fiscalización SENASA (`/api/admin`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET`  | `/api/admin/vets/pending` | Listar veterinarios pendientes de validación de matrícula SENASA (`vetStatus = PENDING`) | ADMIN |
| `PATCH`| `/api/admin/vets/:id/approve` | Aprobar matrícula profesional (`vetStatus = APPROVED`) y registrar auditoría inmutable en `AuditLog` | ADMIN |
| `PATCH`| `/api/admin/vets/:id/reject` | Rechazar solicitud profesional con motivo obligatorio (`{ reason }`), pasa a `REJECTED` y audita | ADMIN |

### 2.5 Recetas Digitales SENASA (`/api/prescriptions`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET`  | `/api/prescriptions/:id` | Verificación pública no confidencial de receta digital oficial escaneada vía QR | Público |
| `POST` | `/api/consultations/:id/prescriptions` | Emisión de receta digital oficial con firma y código QR | VET asignado |

### 2.6 Consultas & Telemedicina (`/api/consultations`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/consultations` | Crear consulta e ingresar en cola de triage (`WAITING`, TTL 15 min) | CLIENT |
| `GET` | `/api/consultations/mine`| Listar consultas activas/pendientes del usuario | Autenticado |
| `GET` | `/api/consultations/:id`| Obtener detalle completo de consulta e historial | Participantes / ADMIN |
| `PATCH`| `/api/consultations/:id/assign` | Toma directa de guardia o auto-asignación FIFO | VET (Approved) / ADMIN |
| `PATCH`| `/api/consultations/:id/cancel` | Cancelar consulta telemática (transición a `CANCELLED`) | Participantes / ADMIN |
| `PATCH`| `/api/consultations/:id/complete` | Cerrar consulta registrando evolución (`diagnosisNotes`) | VET asignado |
| `POST` | `/api/consultations/:id/prescriptions` | Emitir receta digital oficial con QR y firma | VET asignado |
| `GET`  | `/api/consultations/:id/messages` | Listar mensajes de chat o sincronización incremental (`?after={ISO_TIMESTAMP}`) | Participantes |
| `POST` | `/api/consultations/:id/messages` | Enviar mensaje en el chat médico (idempotente con `clientMsgId`) | Participantes |
| `POST` | `/api/consultations/:id/review` | Calificar atención médica (1 a 5 estrellas, ADR-023) | CLIENT asignado |

### 2.7 Videollamadas (`/api/calls`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/calls/:consultationId/token` | Generar token de acceso LiveKit para una consulta (sin PII) | Participantes de la consulta |
| `POST` | `/api/calls/:consultationId/ring` | Disparar notificación de timbrado global al par (emite `call:incoming` con Cero PII y fallback Push Expo). Requiere consulta en estado `ACTIVE`. Errores: `400 INVALID_STATE`, `403 FORBIDDEN` | Participantes de la consulta |

### 2.8 Notificaciones Push & In-App (`/api/notifications`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/notifications/register-token` | Registrar o actualizar token Expo Push (`ExponentPushToken[...]`) idempotentemente | Autenticado |
| `GET`  | `/api/notifications` | Listar notificaciones in-app del usuario autenticado (`take`, `skip`) | Autenticado |
| `PATCH`| `/api/notifications/:id/read` | Marcar notificación específica como leída (`isRead: true`, `readAt`) | Autenticado |

### 2.9 Archivos Médicos & Adjuntos (`/api/media`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/media` | Subida multipart con validación binaria de Magic Bytes (JPEG, PNG, PDF). Límite individual de 10 MB/archivo y cuota agregada de 50 MB/día por usuario (RNF-06). Persiste metadatos en `MediaFile` y consumo en `DailyUploadCounter`. Retorna `413 FILE_TOO_LARGE` si archivo > 10 MB o `429 UPLOAD_QUOTA_EXCEEDED` si supera 50 MB/día | Autenticado |
| `GET`  | `/api/media/:id` | Descarga/streaming seguro de archivo clínico (prohibido acceso estático público ADR-010; valida que solicitante sea dueño, vet asignado o ADMIN). En S3 retorna URL presignada con TTL 300s; en local sirve vía stream seguro | Participantes / ADMIN |

---

## 3. Matriz de Eventos en Tiempo Real (Socket.io)

| Evento | Payload | Emisor | Receptor | Descripción |
|---|---|---|---|---|
| `join:consultation` | `consultationId: string` | Cliente / Vet | Servidor | Une el socket a la sala de chat de la consulta |
| `message:send` | `{ consultationId, content, clientMsgId, attachmentUrl }` | Cliente / Vet | Servidor | Envía un nuevo mensaje de chat con deduplicación idempotente por clientMsgId |
| `message:new` | `Message` object | Servidor | Sala de Consulta | Broadcast del mensaje a ambos participantes |
| `call:incoming` | `{ consultationId, callerName, roomName }` | Servidor | Usuario llamado | Dispara la alerta de llamada entrante en Web y Mobile |
| `call:answered` | `{ consultationId }` | Usuario llamado | Servidor | Notifica que la videollamada fue atendida |
| `call:rejected` | `{ consultationId, reason }` | Usuario llamado | Servidor | Cancela el timbrado en el dispositivo emisor |
| `prescription:new` | `Prescription` object | Servidor | Tutor / Sala | Notificación en tiempo real de nueva receta emitida |

---

## 4. Guía de Ejecución de Pruebas Automatizadas

```bash
# Ejecutar toda la suite de pruebas del backend (meta: 120+ tests)
cd backend
npm test

# Ejecutar únicamente pruebas unitarias
npm run test:unit

# Modo observación interactiva de tests (TDD)
npm run test:watch
```
