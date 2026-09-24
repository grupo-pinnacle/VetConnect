# 📱 01_TECH_REFERENCE_MOBILE — Contratos Reales (Nivel 2)

> Construido desde Nivel 1 (`schema.prisma:1-272`, `backend/src/modules/*/ *.routes.ts`, `*.controller.ts`, `*.service.ts`). Si `SPEC`/`TECH_REFERENCE` general dicen otra cosa, vale esta tabla + código.

## 1. Modelos (12, Prisma v2.0 — `schema.prisma`)

`User (Role CLIENT|VET|ADMIN, VetStatus PENDING|APPROVED|REJECTED, tokenVersion, ratingAvg/Count, isOnline, deletedAt)` · `Pet (ownerId, microchip opt, deletedAt)` · `Consultation (WAITING|ACTIVE|COMPLETED|CANCELLED, clientId/vetId/petId)` · `Message (clientMsgId @unique)` · `Call (INITIATED|ACTIVE|ENDED)` · `Prescription` · `Review (rating 1-5)` · `AuditLog` · `DailyUploadCounter (@@unique[userId,date], 50MB/día)` · `MediaFile` · `PushToken (token @unique)` · `Notification (isRead/readAt)`. Todo multi-palabra con `@map(snake_case)` + `@@map(plural)`. **No existe `FavoriteVet`** — no usar.

Tipos mobile espejo en `mobile/src/types/index.ts:1-110`. Fix pendiente: `ApiResponse<T=any>→unknown`, `data?: Record<string,any>→unknown`.

## 2. REST consumido por mobile (códigos reales)

| Método | Endpoint | Uso mobile | Notas reales (no copiar docs viejos) |
|---|---|---|---|
| `POST` | `/api/auth/register` | `(auth)/register` | Mobile recibe `refreshToken` en JSON también aquí, no solo login |
| `POST` | `/api/auth/login` | `(auth)/login` | Requiere `X-Client-Platform: mobile` para JSON |
| `POST` | `/api/auth/refresh` | `initAuth`, `failedQueue` | Body `{ refreshToken }`, rota refresh |
| `POST` | `/api/auth/logout` | `logout()` | Incrementa `tokenVersion`, borrar SecureStore aunque falle red |
| `GET` | `/api/auth/me` | Rehidratar `user` | No está en SPEC §4.1 pero sí existe |
| `PATCH` | `/api/users/profile` | `isOnline`, `bio`, `photoUrl` | **Sin Zod** (deuda) — validar en cliente max 500 bio / URL https |
| `GET/POST` | `/api/pets` | Home + `pets/new` | Solo dueño; ADMIN no ve global (deuda) |
| `GET/PATCH/DELETE` | `/api/pets/:id` | Detalle/editar/baja | `DELETE` = soft `deletedAt`. VET cualquiera puede leer (redactado `[REDACTED]` si no asignado) |
| `POST` | `/api/consultations` | `consultation/new` | Body `{ petId, notes }`. Prioridad como `[Prioridad: ROJO\|AMARILLO\|VERDE] notes` sin enum servidor. **Puede nacer `ACTIVE` directo si hay vet online** (no siempre `WAITING`) |
| `GET` | `/api/consultations/mine` | Home | VET: asignadas + `WAITING`. CLIENT/ADMIN: solo propias (ADMIN sin vista global) |
| `GET` | `/api/consultations/:id` | Chat/Call header | Participantes/ADMIN. Incluye `email+phone` sin redactar (no loggear) |
| `GET` | `/api/consultations/:id/messages?after=ISO` | Chat historial + sync | Único GET mensajes. **No existe `POST …/messages`** |
| `POST` | `/api/consultations/:id/review` | Rating | `{ rating: 1-5, comment? }` entero, una por consulta |
| `PATCH` | `/api/consultations/:id/assign` | Vet toma caso | Solo VET APPROVED; `WAITING→ACTIVE` + `startedAt`. `400 INVALID_STATUS` si no está en espera |
| `PATCH` | `/api/consultations/:id/complete` | Vet cierra | Solo asignado/ADMIN; body `{ diagnosisNotes }` min 2. Cierra sala LiveKit |
| `PATCH` | `/api/consultations/:id/cancel` | Cancelar tutor/vet | Participantes/ADMIN; `{ reason? }` se anexa a `notes`. No si `COMPLETED/CANCELLED` |
| `POST` | `/api/consultations/:id/prescriptions` | Vet emite receta | Solo asignado; `{ medication, dosage, frequency, durationDays 1-365, indications }` |
| `POST` | `/api/calls/:consultationId/token` | Call bridge | `{ token, wsUrl }`, requiere `ACTIVE`. Sin PII |
| `POST` | `/api/calls/:consultationId/ring` | Timbrar par | Requiere `ACTIVE`. Errores reales `400 INVALID_CONSULTATION_STATE`, `403 NOT_CONSULTATION_PARTICIPANT` (no `INVALID_STATE/FORBIDDEN`) |
| `POST` | `/api/notifications/register-token` | Push init | `{ token: ExponentPushToken[…], platform }` idempotente |
| `GET` | `/api/notifications` | Bandeja | **`take:50` fijo, sin `skip/cursor`** aunque docs digan `take,skip` |
| `PATCH` | `/api/notifications/:id/read` | Marcar leída | `{ isRead:true, readAt }` |
| `POST` | `/api/media` | Adjuntar foto | multipart, 10MB/archivo `413 FILE_TOO_LARGE`, 50MB/día `429 UPLOAD_QUOTA_EXCEEDED`, magic JPEG/PNG/PDF (cobertura 8 hex real) |
| `GET` | `/api/media/:id` | Ver adjunto | **302 redirect a presigned TTL 300s** (S3) o stream local. Dueño/vet asignado/ADMIN o `403`. Mobile descarga a data URL (nunca expone presigned) |
| `GET` | `/api/prescriptions/:id` | Ver receta QR | Público, inmutable. Polling (socket `prescription:new` no se emite) |

Error uniforme RFC7807: `{ success:false, error:{ code, message, details?, timestamp } }` (`middlewares/errorHandler.ts:28-36`).

## 3. Sockets + push (ver SPEC_MOBILE §4)

`join:consultation` → `message:send (clientMsgId único, P2002→200 existente)` → `message:new` → `call:incoming { consultationId, callerName:firstName, roomName }` (cero PII) / `call:answered` / `call:rejected`. Reconnect: `AppState` + `GET ?after=` (`socket.ts:63-87`).

## 4. Prohibido en v2.0 mobile

`POST /:id/messages`, `GET /pets/:id/calendar.ics`, `FavoriteVet`, `VaccinationRecord/MedicationSchedule/PetDocument`, `GET /pending`, estados `PENDING/IN_PROGRESS`, TanStack, LiveKit nativo, `RoomAudioRenderer`, SecureStore para access token, `take/skip` en notificaciones.
