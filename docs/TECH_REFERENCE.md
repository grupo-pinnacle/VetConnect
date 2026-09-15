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
│   │   │   ├── auth/               # Registro, Login, Refresh JWT, Verificación Email
│   │   │   ├── users/              # Perfil de usuario, veterinarios, aprobación SENASA
│   │   │   ├── pets/               # CRUD de mascotas, especies, fichas clínicas
│   │   │   ├── consultations/      # Triage, colas, asignación, estados, notas
│   │   │   ├── calls/              # Señalización WebRTC y tokens LiveKit
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
│   │   │   ├── call/               # GlobalCallListener, CallButton, VideoRoom
│   │   │   ├── dashboard/          # HomeSection, PetsSection, MessagesSection
│   │   │   │   └── vet/            # VetHomeSection, PatientsSection, VetMessagesSection
│   │   │   └── ui/                 # Componentes base (Button, Input, Card, Modal)
│   │   ├── pages/                  # Landing, Login, Register, Dashboard, AdminDashboard
│   │   ├── hooks/                  # useAuth, useConsultations, useChatSocket
│   │   ├── services/               # Axios endpoints, socket.io client, chatStore
│   │   └── types/                  # Tipos TypeScript
│   ├── tailwind.config.js          # Sistema de diseño, sombras por capas y easing
│   └── vite.config.ts
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
El esquema inicial del MVP v2.0 comprende **exactamente 9 modelos principales** más soporte de notificaciones:
1. `User`: Identidades con autenticación JWT, rol (`CLIENT`, `VET`, `ADMIN`), `vetStatus` y `tokenVersion`.
2. `Pet`: Mascotas con soporte de soft-delete (`deletedAt`) y validación opcional de microchip ISO 15 dígitos.
3. `Consultation`: Ciclo clínico y máquina de estados (`WAITING`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
4. `Message`: Mensajería sincrónica de chat con deduplicación por `clientMsgId` único.
5. `Call`: Sesiones de teleconsulta WebRTC con estado (`INITIATED`, `ACTIVE`, `ENDED`) y duración.
6. `Prescription`: Recetas médicas digitales oficiales con firma profesional y código QR.
7. `Review`: Calificaciones médicas profesionales en escala universal de 1 a 5 estrellas (ADR-023).
8. `AuditLog`: Registro inmutable de auditoría para trazabilidad de mutaciones administrativas (ADR-014).
9. `DailyUploadCounter`: Control de cuota diaria de subidas por usuario para mitigación de abusos.
*(Soporte de notificaciones: modelos `PushToken` y `Notification` para Expo Push API bajo ADR-011).*

---

## 2. Contratos de API REST (Endpoints Clave)

### 2.1 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevos tutores o veterinarios (VET inicia en `PENDING`) | Público |
| `POST` | `/api/auth/login` | Inicio de sesión. Web: Refresh Token en cookie `HttpOnly`. Mobile (`X-Client-Platform: mobile`): Refresh Token en JSON body para `expo-secure-store` | Público |
| `POST` | `/api/auth/refresh` | Renovación de access token. Web: lee cookie `HttpOnly`. Mobile: lee payload `{ refreshToken }` | Público |
| `POST` | `/api/auth/logout` | Cierre de sesión, incrementa `tokenVersion` e invalida cookies | Autenticado |

### 2.2 Mascotas (`/api/pets`)
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

### 2.4 Videollamadas (`/api/calls`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/calls/:consultationId/token` | Generar token de acceso LiveKit para una consulta (sin PII) | Participantes de la consulta |
| `POST` | `/api/calls/:consultationId/ring` | Disparar notificación de timbrado global al par | Participantes de la consulta |

### 2.5 Notificaciones Push & In-App (`/api/notifications`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/notifications/register-token` | Registrar o actualizar token Expo Push (`ExponentPushToken[...]`) | Autenticado |
| `GET`  | `/api/notifications` | Listar notificaciones in-app del usuario autenticado | Autenticado |
| `PATCH`| `/api/notifications/:id/read` | Marcar notificación específica como leída | Autenticado |

### 2.6 Archivos Médicos & Adjuntos (`/api/media`)
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `POST` | `/api/media` | Subida de archivos con validación binaria de Magic Bytes y cuota diaria | Autenticado |
| `GET`  | `/api/media/:id` | Descarga/streaming seguro de archivo clínico (prohibido acceso estático público; valida que solicitante sea dueño, vet asignado o ADMIN) | Participantes / ADMIN |

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
