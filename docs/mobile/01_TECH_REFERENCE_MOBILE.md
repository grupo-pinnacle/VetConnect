# 📱 01_TECH_REFERENCE_MOBILE — Contratos de Backend Consumidos (Nivel 2)

> Construido desde Nivel 1 real: `backend/prisma/schema.prisma`, `backend/src/modules/*/ *.routes.ts` · `*.controller.ts` · `*.service.ts`.
> Si `docs/SPEC.md` o `docs/TECH_REFERENCE.md` general dicen otra cosa, **manda esta tabla + el código**.
> Este archivo es el **único dueño** de los endpoints, sockets, códigos de error y de la tabla de deuda backend con su workaround mobile.

---

## 1. Modelos Prisma v2.0 (12)

`User` (Role `CLIENT|VET|ADMIN`, VetStatus `PENDING|APPROVED|REJECTED`, `tokenVersion`, `ratingAvg`/`ratingCount`, `isOnline`, `bio`, `photoUrl`, `deletedAt`) ·
`Pet` (`ownerId`, `name`, `species`, `breed`, `sex`, `birthDate`, `weightKg`, `microchip` opcional, `allergies`, `chronicConditions`, `notes`, `deletedAt`) ·
`Consultation` (status `WAITING|ACTIVE|COMPLETED|CANCELLED`, `clientId`/`vetId`/`petId`, `notes`, `diagnosisNotes`, `startedAt`, `endedAt`, `cancelledAt`, `cancelReason`) ·
`Message` (`clientMsgId @unique` → idempotencia) ·
`Call` (`INITIATED|ACTIVE|ENDED`) ·
`Prescription` (`medication`, `dosage`, `frequency`, `durationDays` 1–365, `indications`) ·
`Review` (`rating` 1–5, una por consulta) ·
`AuditLog` ·
`DailyUploadCounter` (`@@unique([userId, date])`, 50 MB/día) ·
`MediaFile` ·
`PushToken` (`token @unique`) ·
`Notification` (`isRead`, `readAt`).

Convenciones: toda columna multi-palabra con `@map("snake_case")`, cada modelo con `@@map("plural")`.
Espejo tipado en mobile: `src/types/index.ts`.

> **No existe `FavoriteVet`.** No usar.
> **No existe campo `priority`.** La prioridad de triage viaja como texto en `notes` (§4, nota D-B06).

---

## 2. REST consumido por mobile — con códigos reales

| Método | Endpoint | Uso en mobile | Notas reales (no copiar docs viejos) |
|---|---|---|---|
| `POST` | `/api/auth/register` | `(auth)/register` | Mobile recibe `refreshToken` en JSON **también aquí**, no solo en login |
| `POST` | `/api/auth/login` | `(auth)/login` | Requiere `X-Client-Platform: mobile` para devolver JSON |
| `POST` | `/api/auth/refresh` | `initAuth` + `failedQueue` | Body `{ refreshToken }`; rota el par |
| `POST` | `/api/auth/logout` | `logout()` | Incrementa `tokenVersion`; borrar SecureStore aunque la red falle |
| `GET` | `/api/auth/me` | Rehidratar `user` | **Devuelve `data: { user }`**, no `data: User` — ver D-B13 |
| `PATCH` | `/api/users/profile` | Perfil | **Sin Zod en backend** (deuda) → validar en cliente: `bio` ≤500, `photoUrl` https |
| `GET` | `/api/pets` | Home + triage + alta | Solo el dueño. ADMIN **no** tiene vista global (D-B03) |
| `POST` | `/api/pets` | `pets/new` | Propietario = usuario autenticado |
| `GET` | `/api/pets/:id` | Detalle | Cualquier VET puede leer, con `email`/`phone` redactados como `[REDACTED]` si no está asignada |
| `PATCH` | `/api/pets/:id` | Editar mascota | Solo dueño o ADMIN |
| `DELETE` | `/api/pets/:id` | Baja lógica | **Soft delete**: `deletedAt = new Date()`. Nunca físico |
| `POST` | `/api/consultations` | `consultation/new` | Body `{ petId, notes }`. Puede nacer **`ACTIVE`** directo si hay vet online (D-B01) |
| `GET` | `/api/consultations/mine` | Home + Historial + guardia | VET: asignadas + `WAITING`. CLIENT: propias. **ADMIN: solo propias** (D-B04) |
| `GET` | `/api/consultations/:id` | Chat/Call header, Detalle | Participantes o ADMIN. Incluye `email`+`phone` sin redactar (**no loggear**) y las relaciones `prescriptions[]` + `review` |
| `GET` | `/api/consultations/:id/messages?after=ISO` | Historial + sync | **Único** endpoint de lectura de mensajes. **No existe `POST …/messages`** |
| `POST` | `/api/consultations/:id/review` | Calificar | `{ rating: 1-5 entero, comment? }`, una por consulta. `409 REVIEW_ALREADY_EXISTS` si ya existe |
| `PATCH` | `/api/consultations/:id/assign` | Vet toma el caso | Solo VET `APPROVED`; `WAITING→ACTIVE` + `startedAt`. `400 INVALID_STATUS` si no está en espera |
| `PATCH` | `/api/consultations/:id/complete` | Vet cierra | Solo asignado o ADMIN; body `{ diagnosisNotes }` (mín. 2). Cierra la sala LiveKit |
| `PATCH` | `/api/consultations/:id/cancel` | Cancelar | Participantes o ADMIN; `{ reason? }` se anexa a `notes`. Rechaza `COMPLETED`/`CANCELLED` |
| `POST` | `/api/consultations/:id/prescriptions` | Emitir receta | Solo vet asignado; `{ medication, dosage, frequency, durationDays 1-365, indications }` |
| `POST` | `/api/calls/:consultationId/token` | Bridge de video | `{ token, wsUrl }`; requiere `ACTIVE`. **Cero PII** |
| `POST` | `/api/calls/:consultationId/ring` | Timbrar al par | Requiere `ACTIVE`. Errores reales `400 INVALID_CONSULTATION_STATE`, `403 NOT_CONSULTATION_PARTICIPANT` |
| `POST` | `/api/notifications/register-token` | Push init | `{ token: ExponentPushToken[…], platform: 'ios'\|'android'\|'web' }`, idempotente |
| `GET` | `/api/notifications` | Bandeja | **`take:50` fijo, sin `skip` ni cursor** (D-B07) |
| `PATCH` | `/api/notifications/:id/read` | Marcar leída | `{ isRead: true, readAt }` |
| `POST` | `/api/media` | Adjuntar foto/PDF | multipart `file` + `consultationId`; 10 MB/archivo → `413 FILE_TOO_LARGE`; 50 MB/día → `429 UPLOAD_QUOTA_EXCEEDED`; magic bytes JPEG/PNG/PDF |
| `GET` | `/api/media/:id` | Ver adjunto | **302 redirect** a presigned TTL 300s (S3) o stream local. Autorización: dueño / vet asignado / ADMIN, si no `403` |
| `GET` | `/api/prescriptions/:id` | Receta + QR | **Público e inmutable.** El QR codifica una URL pública, sin firma criptográfica |

**Envelope de error uniforme (RFC 7807)** — `backend/src/middlewares/errorHandler.ts:28-36`:
```json
{ "success": false, "error": { "code": "...", "message": "...", "details": {}, "timestamp": "..." } }
```

---

## 3. Sockets y push

`join:consultation` → `message:send { clientMsgId }` (único por consulta; `P2002` → **200** con el mensaje existente) → `message:new` → `call:incoming { consultationId, callerName: firstName, roomName }` / `call:answered` / `call:rejected`.
Detalle de eventos y reconexión en `AGENT_CODING_SPEC_MOBILE.md §4`.

---

## 4. Deuda backend conocida + workaround mobile

Esta tabla es el **único registro** de divergencia backend↔mobile. No duplicarla en `AGENT_CODING_SPEC_MOBILE.md` ni en `03_ESTADO_Y_DEUDA_MOBILE.md`.

| ID | Divergencia | Evidencia | Workaround mobile |
|---|---|---|---|
| D-B01 | `POST /consultations` puede nacer `ACTIVE` directo | `consultations.service.ts:53-64` vs `TECH_REFERENCE:131` | Tras crear, leer `status`: si `ACTIVE` ir a chat/llamada, si `WAITING` mostrar TTL |
| D-B02 | Códigos reales `INVALID_CONSULTATION_STATE` / `NOT_CONSULTATION_PARTICIPANT` | `calls.service.ts:60,98,105` vs `TECH_REFERENCE:158` | Matchear códigos reales, no `INVALID_STATE`/`FORBIDDEN` |
| D-B03 | `GET /pets` sin vista global para ADMIN; `GET /pets/:id` lo lee cualquier VET | `pets.service.ts:34-39,54-60` vs `TECH_REFERENCE:122-126` | No asumir vista admin global; ocultar `email`/`phone` si viene `[REDACTED]` |
| D-B04 | `GET /consultations/mine` devuelve vacío para ADMIN | `consultations.service.ts:281-314` | Admin en mobile = solo sus propias consultas |
| D-B05 | `reject { reason }` es opcional con fallback | `admin.controller.ts:39` vs `TECH_REFERENCE:146` | Enviar `reason` siempre, aunque la API lo tolere |
| D-B06 | `PATCH /profile` sin Zod; `priority` **sin enum** | `users.controller.ts:8-11`, `consultations.schemas.ts:3-6` | Validar en cliente: `bio` ≤500, `photoUrl` https. La prioridad viaja como tag en `notes` |
| D-B07 | `GET /notifications` sin `skip`, `take:50` fijo | `notifications.service.ts:23-29` vs `TECH_REFERENCE:164` | Paginar en memoria + pull-to-refresh. Nada más allá de 50 es alcanzable |
| D-B08 | `GET /media/:id` responde 302, magic bytes de 8 hex | `media.controller.ts:28-29`, `media.middleware.ts:49-59` vs `TECH_REFERENCE:171`, `SPEC:406` | Seguir el redirect; validar tipo MIME + 10 MB **antes** de subir |
| D-B09 | `GET /consultations/:id` expone `email`+`phone` | `consultations.service.ts:12-24` vs `AGENTS.md §4.3` | No persistir ni loggear PII; mostrar solo `firstName` |
| D-B10 | Sin anonimización `anon_` (Ley 25.326) | `SPEC.md:372-377`; 0 coincidencias en el código | Baja = `deletedAt` + ticket manual; advertir en la UX |
| D-B11 | `prescription:new` no se emite; `getById` interno muerto | `prescriptions.service.ts`, `controller.ts:29-43` | Polling de `GET /prescriptions/:id` |
| D-B12 | `SPEC.md:320` (`POST messages`), `SPEC.md:106` (`FavoriteVet`), `SPEC.md:479-491` (v2.1+) | vs schema y código | No implementar; cerrado como wontfix v2.0 |
| D-B13 | `GET /api/auth/me` responde `data: { user }`, no `data: User` | `auth.controller.ts:124-130` vs `mobile/src/services/users.service.ts:26-30` | Desempaquetar `data.user`. Hoy latente: la función no tiene callers |
| D-B14 | El backend **nunca crea** filas `Notification` | `prisma.notification.create` → 0 coincidencias en `backend/src` | La bandeja queda siempre vacía y no se emite push. Requiere cambio backend (D-01) |
| D-B15 | `prescriptions.controller.ts:113-115` — el bloque de autorización de `getByIdPublic` es una sentencia vacía | `prescriptions.service.ts` | La receta es legible por cualquiera con el UUID. El texto "OFICIAL FIRMADO SENASA" en mobile es **engañoso** hasta que exista firma |

### Deuda de documentación general (no replicar en código)

Conteo de ADRs 24 vs **25** · `strict` vs `lax` de cookies · 129 vs **123** tests · `TS 5.8` vs `5.7` · `PENDING/IN_PROGRESS` vs la FSM real · links muertos a `PLAN_ACCION_VETCONNECT.md` y `AI_TECHLEAD_BRIEF.md` · "100% Greenfield" fosilizado. Todo neutralizado en `README.md`.

---

## 5. Prohibido en v2.0 mobile

`POST /:id/messages` · `GET /pets/:id/calendar.ics` · `FavoriteVet` · `VaccinationRecord` / `MedicationSchedule` / `PetDocument` · `GET /consultations/pending` · estados `PENDING`/`IN_PROGRESS` · `@tanstack/react-query` · LiveKit nativo y `RoomAudioRenderer` · `SecureStore` para el access token · `take`/`skip` en notificaciones · campo `priority` con enum.
