# 🤖 AGENT_CODING_SPEC.md — Especificación Ejecutiva Canónica para Agentes de IA (Web Frontend)

> **Documento:** `docs/web/AGENT_CODING_SPEC.md`  
> **Propósito:** Referencia única, sin contradicciones y sin duplicados para que un agente de IA programe el frontend web de VetConnect sin necesidad de consultar otros documentos. **Si hay conflicto entre este archivo y cualquier otro en `docs/web/`, este archivo tiene precedencia.**  
> **Proyecto:** VetConnect — Telemedicina Veterinaria & Gestión Clínica

---

## 0. Stack Tecnológico (No Negociable)

| Capa | Tecnología | Versión | Notas Críticas |
|---|---|---|---|
| Librería UI | React | **18.3.1 LTS** | NO migrar a React 19 (peer-dep conflict con LiveKit) |
| Build | Vite | 6.x | — |
| Estilos | Tailwind CSS | v3 | NO usar Tailwind v4 aún |
| Data Fetching | useState + useEffect + api.ts | — | TanStack Query v5 CONGELADO en páginas existentes |
| Sesión | AuthContext + Axios failedQueue | — | Access token en memoria; refresh en cookie HttpOnly |
| WebRTC | @livekit/components-react | latest compatible | Solo `<VideoConference />` dentro de `<LiveKitRoom>` |
| Realtime | socket.io-client | — | Conectado solo dentro de ConsultationRoom |
| Testing | Vitest + @testing-library/react | — | 29 tests deben permanecer en verde |

### Guardarraíles Absolutos (Prohibiciones de Tooling)
- ❌ `npx shadcn@latest init` / `npx shadcn add` — **PROHIBIDO**
- ❌ `@radix-ui/*` — **PROHIBIDO** (usar HTML5 semántico nativo)
- ❌ `useQuery` / `useMutation` en páginas existentes hasta crear `test-utils.tsx`
- ❌ `<RoomAudioRenderer />` junto a `<VideoConference />` — causa eco WebRTC
- ❌ Eliminar o renombrar `data-testid` existentes (rompe los 29 tests)
- ❌ `git push --force`, `git filter-repo` — NUNCA
- ❌ PII (email, teléfono) en tokens LiveKit — usar solo `user.id` + `user.firstName`

---

## 1. Rutas Canónicas (React Router)

| Ruta | Componente | Rol Requerido |
|---|---|---|
| `/` | `pages/Landing.tsx` | Público |
| `/login` | `pages/Login.tsx` | Público |
| `/register` | `pages/Register.tsx` | Público |
| `/client/dashboard` | `pages/DashboardClient.tsx` | `CLIENT` |
| `/vet/dashboard` | `pages/DashboardVet.tsx` | `VET` |
| `/call/:id` | `pages/ConsultationRoom.tsx` | `CLIENT` + `VET` |
| `/prescriptions/:id` | `pages/PrescriptionView.tsx` | **Público** ⚠️ Sin ProtectedRoute — farmacias y SENASA escanean QR sin cuenta |
| `/admin/vets` | `pages/AdminVets.tsx` | `ADMIN` |
| `/admin/dashboard` | `pages/AdminVets.tsx` | `ADMIN` (alias — mismo componente, NO existe AdminDashboard.tsx) |
| `*` | `pages/NotFound.tsx` | Público |

---

## 2. Modelo de Datos Canónico (`web/src/types/index.ts`)

### Campos del Modelo `User` (sincronizado con Prisma schema)
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'CLIENT' | 'VET' | 'ADMIN';
  vetStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  licenseNumber?: string | null;
  bio?: string | null;          // ✅ ÚNICO campo de descripción profesional del veterinario
  // ❌ NO EXISTE speciality — el campo en DB y API es bio, no speciality
  photoUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  isOnline: boolean;
  lastSeen?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Triage — Convención de Almacenamiento
- Prioridad almacenada en **español** en el campo `notes` de `Consultation`
- Formato exacto: `[Prioridad: ROJO] descripción...` / `[Prioridad: AMARILLO] ...` / `[Prioridad: VERDE] ...`
- `DashboardVet.tsx` detecta la prioridad buscando estas cadenas exactas en `notes`
- Conversión bilingüe: `TRIAGE_EN_TO_ES` y `TRIAGE_ES_TO_EN` en `web/src/types/index.ts`
- `TriageSelector` acepta ÚNICAMENTE español (`'ROJO' | 'AMARILLO' | 'VERDE'`); la normalización EN→ES ocurre en el contenedor antes de pasar el valor

---

## 3. Endpoints REST Consumidos por la SPA (Fuente Única de Verdad)

> ⚠️ Antes de codear cualquier llamada a API, verificar que el endpoint existe en `docs/TECH_REFERENCE.md`. Si no está listado allí, NO se usa en el frontend.

| Método | Ruta | Página / Componente | Notas Críticas |
|---|---|---|---|
| POST | `/api/auth/register` | `Register.tsx` | Body: `{ email, password, firstName, lastName, role, licenseNumber?, bio? }` |
| POST | `/api/auth/login` | `Login.tsx` | Respuesta: `{ accessToken, user }` + Cookie `refreshToken` HttpOnly |
| POST | `/api/auth/refresh` | `services/api.ts` | Ejecutado silenciosamente por el interceptor Axios |
| POST | `/api/auth/logout` | `AuthContext.tsx` | Invalida cookie |
| GET  | `/api/auth/me` | `AuthContext.tsx` | Carga el perfil al iniciar sesión |
| PATCH | `/api/users/profile` | `DashboardVet.tsx` | Body: `{ isOnline?, bio?, photoUrl? }` |
| GET  | `/api/pets` | `DashboardClient.tsx` | Lista mascotas del usuario autenticado |
| POST | `/api/pets` | `DashboardClient.tsx` | Crea mascota; `breed` min 1 char |
| GET  | `/api/pets/:id` | `DashboardClient.tsx` | ⏳ Pendiente de consumo en código |
| PATCH | `/api/pets/:id` | `DashboardClient.tsx` | ⏳ Pendiente de consumo en código |
| DELETE | `/api/pets/:id` | `DashboardClient.tsx` | Soft-delete (`deletedAt = now`). ⏳ Pendiente: implementar modal de confirmación |
| GET  | `/api/consultations/mine` | `DashboardClient.tsx`, `DashboardVet.tsx` | Sin query params |
| POST | `/api/consultations` | `DashboardClient.tsx` (Triage) | Body: `{ petId, notes }` donde notes incluye `[Prioridad: X]` |
| GET  | `/api/consultations/:id` | `ConsultationRoom.tsx` | Usado para polling de WAITING→ACTIVE |
| PATCH | `/api/consultations/:id/assign` | `DashboardVet.tsx` | Solo rol VET APPROVED |
| PATCH | `/api/consultations/:id/cancel` | `DashboardClient.tsx`, `ConsultationRoom.tsx` | CLIENT y ADMIN |
| PATCH | `/api/consultations/:id/complete` | `ConsultationRoom.tsx` | Body: `{ diagnosisNotes: string }` — solo VET asignado |
| GET  | `/api/consultations/:id/messages` | `ConsultationRoom.tsx` | Historial inicial de chat |
| POST | `/api/consultations/:id/review` | `ConsultationRoom.tsx` (`<ReviewModal>` cuando `phase === 'completed'`) | Body: `{ rating: 1-5, comment? }` — solo CLIENT |
| POST | `/api/calls/:consultationId/token` | `ConsultationRoom.tsx` | **SOLO LLAMAR cuando `status === 'ACTIVE'`** — HTTP 400 si WAITING |
| POST | `/api/calls/:consultationId/ring` | `ConsultationRoom.tsx` | Requiere `status === 'ACTIVE'` |
| GET  | `/api/prescriptions/:id` | `PrescriptionView.tsx` | — |
| POST | `/api/consultations/:id/prescriptions` | `ConsultationRoom.tsx` (futuro: `PrescriptionModal.tsx`) | Body: `{ medication, dosage, frequency, durationDays, indications }` |
| GET  | `/api/admin/vets/pending` | `AdminVets.tsx` | Solo ADMIN |
| PATCH | `/api/admin/vets/:id/approve` | `AdminVets.tsx` | — |
| PATCH | `/api/admin/vets/:id/reject` | `AdminVets.tsx` | Body: `{ reason: string }` |
| POST | `/api/media` | `ConsultationRoom.tsx` | multipart/form-data; responde `{ id, fileName, ... }` SIN campo `url` |
| GET  | `/api/media/:id` | `ConsultationRoom.tsx` (Lightbox) | Acceso autenticado — construir URL como `` `/api/media/${id}` `` |

---

## 4. Máquina de Estados de `ConsultationRoom.tsx`

> **BUG CRÍTICO CORREGIDO:** La versión anterior llamaba `POST /api/calls/:id/token` inmediatamente al montar, obteniendo HTTP 400 cuando la consulta estaba en estado `WAITING`.

```
LOADING → (GET /api/consultations/:id)
  → WAITING  → [poll cada 5s con GET /api/consultations/:id]
                → ACTIVE → (POST /api/calls/:id/token) → Render <CallRoom>
                → CANCELLED → Pantalla de cancelación
                → COMPLETED → Pantalla de finalización + <ReviewModal> (CDD Fase 3)
  → ACTIVE   → (POST /api/calls/:id/token) → Render <CallRoom>
  → COMPLETED → Pantalla de finalización
  → CANCELLED → Pantalla de cancelación
  → ERROR    → Pantalla de error con botón "Volver"
```

**Regla de sincronización WAITING→ACTIVE:**  
Backend v2.0 NO emite `consultation:assigned` por Socket.io. El cliente DEBE usar exclusivamente polling HTTP cada 5s. NO registrar listeners socket ficticios para este evento.

---

## 5. Socket.io — Contrato de Eventos

| Dirección | Evento | Sala/Room | Payload |
|---|---|---|---|
| client → server | `join:consultation` | — | `{ consultationId }` |
| client → server | `message:send` | — | `{ consultationId, content, clientMsgId, attachmentUrl? }` |
| server → client | `message:new` | `consultation:${id}` | `Message` |
| server → client | `call:incoming` | `user:${userId}` | `{ consultationId }` |

**Notas:**
- Sala con formato `consultation:${id}` (dos puntos como separador, confirmado en `chat.gateway.ts:29`)
- NO existe `POST /api/consultations/:id/messages` REST — el chat usa EXCLUSIVAMENTE `socket.emit('message:send', ...)`
- La conexión Socket.io se abre ÚNICAMENTE en `ConsultationRoom.tsx`, no existe SocketContext global

---

## 6. Tokens de Diseño (Tailwind CSS)

### Colores Canónicos (de `tailwind.config.js` + `SISTEMA_DE_DISENO.md`)

| Rol | HEX | Clase Tailwind |
|---|---|---|
| Fondo base | `#F8FAFC` | `bg-slate-50` |
| Tipografía mayor | `#0F172A` | `text-slate-900` |
| Acción primaria | `#2563EB` | `bg-blue-600` |
| Éxito / Online | `#059669` | `bg-emerald-600` |
| Peligro / Botón destructivo | `bg-rose-600` | `bg-rose-600` (variante `danger` de Button.tsx) |
| Triage Rojo / Alertas clínicas | `#DC2626` | `bg-red-600` (badges e indicadores) |
| Triage Amarillo | `#D97706` | `bg-amber-600` |
| Info / Chat | `#0284C7` | `bg-sky-600` |

**Aclaración de coexistencia rose vs red:**
- `bg-rose-600`: variante `danger` del componente `Button.tsx` (acciones destructivas de UI)
- `bg-red-600` / `#DC2626`: badges de triage de urgencia vital en `DashboardVet.tsx`
- Ambos son correctos en su contexto respectivo — no es una inconsistencia

### Tokens de Badge de Triage en `DashboardVet.tsx`
```
ROJO:     bg-red-100 text-red-800 border-red-200 animate-pulse
AMARILLO: bg-amber-100 text-amber-800 border-amber-200
VERDE:    bg-emerald-100 text-emerald-800 border-emerald-200
```

---

## 7. Inventario Canónico de `data-testid` (Anti-Regresión Vitest)

**Regla:** NUNCA modificar estos selectores. 29 tests dependen de ellos.

| Pantalla | Selectores Críticos |
|---|---|
| Landing | `brand-logo`, `trust-badge-senasa`, `hero-title`, `cta-client-portal`, `cta-vet-portal`, `cta-admin-portal`, `download-apk-link` |
| Login | placeholder `"ejemplo@vetconnect.com"`, placeholder `"********"`, botón texto `"Iniciar Sesión"` |
| Register | heading `"Registro en VetConnect"`, botón `"Crear Cuenta"` |
| DashboardClient | `header-title`, `empty-pets-state`, `empty-consultations-state`, `add-pet-button`, `add-pet-modal`, `input-pet-name`, `input-pet-breed`, `save-pet-button` |
| DashboardVet | `badge-priority-rojo`, `badge-priority-amarillo`, `badge-priority-verde`, `emit-prescription-button-{id}`, `input-prescription-medication`, `input-prescription-dosage`, `input-prescription-frequency`, `input-prescription-duration`, `input-prescription-indications`, `save-prescription-button`, `prescription-qr-image`, `header-vet-title`, `vet-license-info`, `presence-toggle-switch`, `waiting-card-{id}`, `assign-patient-button-{id}`, `prescription-modal` |
| CallRoom | heading `"Verificacion Previa de Camara y Microfono"`, botón `"Ingresar a la Consulta"` |
| PrescriptionView | `prescription-header-title`, `rx-medication`, `prescription-qr-code`, `print-prescription-button` |
| AdminVets | `admin-title`, `vet-row-{id}`, `vet-speciality-{id}` *(muestra `vet.bio || 'General'` — el campo DB es `bio`, no `speciality`)*, `approve-vet-button-{id}`, `reject-vet-button-{id}`, `input-reject-reason-{id}` |
| AdminVetsModal | `admin-toast-notification`, `empty-pending-vets`, `admin-error-alert` |
| NotFound | `not-found-code`, `not-found-title`, `not-found-home-button` |

---

## 8. Componentes UI Atómicos — Estado Real vs. Roadmap

### Estado Actual del Código
- ✅ `Button.tsx` + `Button.stories.tsx` — implementados en `web/src/components/ui/`
- ❌ Todos los demás componentes están embebidos en páginas — pendiente de extracción

### CDD Roadmap (orden de dependencias)

**Prerrequisito:** Crear `web/src/lib/utils.ts` primero:
```typescript
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
```

**Fase 1 — Átomos:**
- `Badge.tsx` — props: `BadgeProps` (ya en `types/index.ts`)
- `Input.tsx` — props: `InputProps` (ya en `types/index.ts`)
- `Avatar.tsx` — props: `AvatarProps` (ya en `types/index.ts`)

**Fase 2 — Moléculas:**
- `PetCard.tsx` — props: `PetCardProps`
- `TriageSelector.tsx` — props: `TriageSelectorProps` (valor estrictamente en español)
- `Breadcrumbs.tsx` — props: `BreadcrumbsProps`
- `ChatMessage.tsx` — props: `ChatMessageProps`

**Fase 3 — Organismos:**
- `HangUpButton.tsx` — props: `HangUpButtonProps` — NO duplicar controles de `<VideoConference />`
- `PrescriptionDoc.tsx` — props: `PrescriptionDocProps`
- `PrescriptionModal.tsx` — props: `PrescriptionModalProps` (modal HTML5 nativo, sin Radix)
- `ReviewModal.tsx` — props: `ReviewModalProps` — renderizado por ConsultationRoom cuando `phase === 'completed'`

**Regla para extracción atómica (anti-rotura de tests):**
1. Extraer componente a `web/src/components/ui/NombreComponente.tsx`
2. Importarlo en la página viva reemplazando el bloque inline
3. Ejecutar `npm test -w web` — debe continuar con 29 tests en verde
4. Solo si los tests pasan, crear `NombreComponente.stories.tsx`

---

## 9. Gaps Pendientes de Implementación (Backlog v2.0)

| Gap | Descripción | Prioridad |
|---|---|---|
| **G-01** | Modal de confirmación soft-delete de mascotas en `DashboardClient.tsx` | Alta |
| **G-02** | `ConfirmModal.tsx` atómico (HTML5 nativo, sin Radix) | Alta |
| **G-03** | Checkbox "No posee microchip" en formulario de alta de mascotas | Media |
| **G-04** | `ReviewModal.tsx` en `ConsultationRoom.tsx` (cuando `phase === 'completed'`) | Alta |
| **G-05** | `PrescriptionModal.tsx` extraído de `DashboardVet.tsx` como componente atómico | Media |
| **G-06** | Consumo de `GET/PATCH/DELETE /api/pets/:id` en `DashboardClient.tsx` | Alta |
| **G-07** | Crear `web/src/lib/utils.ts` con función `cn` antes de CDD Fase 1 | Bloqueante |
| **G-08** | Crear `web/src/__tests__/test-utils.tsx` con `renderWithClient` (QueryClientProvider) | Bloqueante para TanStack |
| **G-09** | `SocketContext` global en `App.tsx` para recibir `call:incoming` fuera de ConsultationRoom | Backlog v2.1+ |
| **G-10** | Banner avanzado de espera con nombre del médico asignado (ETA) en ConsultationRoom | Media |

---

## 10. Seguridad y PII

- Refresh token: cookie `HttpOnly; Secure; SameSite=None` (prod) / `SameSite=Lax` (dev)
- Mobile: `X-Client-Platform: mobile` header → backend retorna `refreshToken` en body para Expo SecureStore
- Token LiveKit: `identity: user.id`, `name: user.firstName` — **NUNCA** email ni teléfono
- Archivos médicos: acceso ÚNICAMENTE por `GET /api/media/:id` autenticado — NUNCA `express.static`
- Chat idempotente: reintentos con `clientMsgId` existente → HTTP 200 con mensaje previo (P2002 → idempotencia)

---

## 11. Comandos de Verificación (Ejecutar Antes de Reportar como Completado)

```bash
# TypeScript estricto en la capa web
npm run typecheck -w web

# Suite de tests (meta: 29 tests en verde)
npm test -w web

# Build de producción (sin errores)
npm run build -w web

# Validación del schema Prisma (si se modificó)
cd backend && npx prisma validate
```

---

*VetConnect AGENT_CODING_SPEC.md — Especificación Ejecutiva Canónica Web 2026.*
