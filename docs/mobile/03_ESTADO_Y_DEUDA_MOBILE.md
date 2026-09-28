# 📱 03_ESTADO_Y_DEUDA_MOBILE — Foto Verificada (2026-09-28)

> Este archivo es el **único dueño** del estado real del workspace mobile, del registro de deuda y del roadmap restante.
> Reemplaza a los antiguos `00_AUDITORIA_ESTADO_REAL_MOBILE.md` y `DEUDA_CODIGO_Y_UPGRADE_SDK54.md`, que se contradecían entre sí al describir dos estados incompatibles del SDK.
>
> **Método:** verificación directa contra `mobile/**`, `backend/src/modules/**` y `backend/prisma/schema.prisma`. Las afirmaciones de documentación previa **no** se creyeron; se comprobaron una por una.

---

## 1. Estado verificado del workspace

### 1.1 Stack — coincide con el baseline exigido

| Elemento | Baseline exigido | Real verificado | Estado |
|---|---|---|---|
| Expo | SDK 54 | `~54.0.0` | ✅ |
| Expo Router | ~6 | `~6.0.0` | ✅ |
| React Native | ~0.81 | `0.81.4` | ✅ |
| React | (mobile) | `19.1.0` | ✅ Excepción documentada vs web 18.3.1 |
| NativeWind | v4 | `^4.1.0` + `tailwindcss ^3.4.17` | ✅ Cableado activo |
| jest-expo | ~54 | `~54.0.0` | ✅ |
| TypeScript | estricto | `^5.7.3` | ✅ |

**El upgrade SDK 52 → 54 está COMPLETADO.** Toda afirmación de "real: SDK 52" que quede en documentación externa es **obsoleta**.

### 1.2 Estructura

- **19 pantallas** en `mobile/app/**/*.tsx`, con `Stack` root, `Stack` en `(auth)`, `Tabs` en `(app)`, redirect por rol y bloqueo SENASA para `VET` no aprobado (`(app)/_layout.tsx:30`, testID `vet-pending-block`).
- `src/`: 6 services · 3 hooks · 4 lib (`api`, `authStore`, `socket`, `triage`) · 4 validation · 8 components · `theme/tokens.ts` · `types/index.ts`.
- **Tests: 11 suites, 29 casos, todos verdes.**
- `npm run typecheck -w mobile` → **verde**.

> ⚠️ El workspace llega **sin `node_modules`**. Hay que ejecutar `npm install` en la raíz antes de cualquier verificación.

### 1.3 Verificación reproducida

```powershell
npm install                       # raíz del monorepo (workspaces)
npm run typecheck -w mobile       # ✅ sin errores
npm test -w mobile                # ✅ 11 suites / 29 tests
```

---

## 2. Lo que funciona

- Auth dual completo: header `X-Client-Platform`, refresh en SecureStore, access en memoria, `failedQueue` de 401.
- `initAuth` + redirect por rol + bloqueo SENASA.
- Chat: `join:consultation` + `message:new` + `message:send` idempotente + `?after=` + banner offline.
- Triage ROJO/AMARILLO/VERDE con branch `ACTIVE → chat` / `WAITING → detalle`.
- CRUD completo de mascota (`pets/[id].tsx`): ver, editar 8 campos, baja lógica.
- Historial con filtros y cancelación con motivo.
- Adjuntos de imagen: `expo-image-picker` → `POST /media` → `attachmentUrl`.
- Receta + QR + `Share`.
- Rating 1–5.
- Push: handlers y listener implementados en el service.

---

## 3. Deuda abierta — registro único

> `D-*` = deuda **mobile**. `D-B*` = deuda **backend** (tabla completa en `01_TECH_REFERENCE_MOBILE.md §4`).

### 3.1 Bloqueantes — la funcionalidad no llega al usuario

| ID | Deuda | Evidencia | Impacto |
|---|---|---|---|
| **D-01** | El backend **nunca crea** filas `Notification`. `prisma.notification.create` → **0 coincidencias** en `backend/src`. Además el registro de push token nunca se invoca desde código de app | D-B14; `registerPushToken` sin callers | **La pestaña "Alertas" siempre vacía y ningún dispositivo recibe push.** Requiere backend + wiring mobile |
| **D-02** | Deep linking no configurado: `app.json` declara `scheme: vetconnect`, pero `expo-linking` está instalado y **sin usar**; no hay `Linking.addEventListener`, ni `useURL()`, ni `+not-found.tsx` | `app.json:9`, `package.json:22` | Las rutas del listener de push son inalcanzables |
| **D-03** | Pantalla de llamada rota: `hasPermission` se inicializa en `true` y **nadie lo pone en `false`** → toda la UI de permiso denegado es código muerto, y "Habilitar Permisos" solo hace `setHasPermission(true)` sin pedir nada. Además el `window.initLiveKitCall` inyectado **no existe en `web/`** (0 coincidencias) → no-op silencioso | `call/[consultationId].tsx:23,66,96,106` | La videoconsulta depende de que la web cargue con su propia sesión. `expo-camera` es dependencia sin usar |
| **D-04** | Señalización de llamada ausente: el backend emite `call:incoming` y acepta `call:answered`/`call:rejected`, y existe `POST /calls/:id/ring`. Mobile **no los usa** | `socket.types.ts:23-30`, `calls.service.ts:117` | No hay UI de llamada entrante, ni timbre, ni aceptar/rechazar |

### 3.2 Bugs de corrección — hoy fallan en silencio

| ID | Deuda | Evidencia | Impacto |
|---|---|---|---|
| **D-05** | El resultado de la sincronización incremental **se descarta** (`.catch(()=>{})`), pero el watermark `lastSeen` **sí avanza** | `chat:43`, `socket.ts:63-87` | Al reconectar o volver a foreground, los mensajes perdidos **no llegan nunca** hasta remontar |
| **D-06** | `socketManager.disconnect()` no se llama al desmontar el chat | `chat:74-78` | Fuga de socket y de `activeConsultationIds` entre consultas |
| **D-07** | Expiración de sesión sin manejar: al fallar el refresh se borra el token y se rechaza, pero **nunca** se limpia `useAuthStore` ni se navega a `/(auth)/login`; `logout` tampoco resetea `isRefreshing`/`failedQueue` | `api.ts:17-21,88-91` | El usuario queda **atrapado** en una pantalla que solo recibe 401 |
| **D-08** | `GET /api/auth/me` desempaquetado mal: el backend responde `data: { user }` | D-B13, `users.service.ts:26-30` | Latente: la función no tiene callers. Si se conecta, rompe `role`, `vetStatus` y el gate SENASA |
| **D-09** | `consultation/[id].tsx` **nunca lee** `prescriptions[]` ni `review`, aunque el backend los devuelve | `consultations.service.ts:261-262` | Las recetas emitidas son inalcanzables desde la app, y el botón "Calificar" se muestra siempre → **409 garantizado** en consulta ya calificada |
| **D-10** | `MediaFile` se guarda como string en `Message.attachmentUrl`; `MAX_FILE_BYTES` se declara y **nunca se aplica**; `mimeFromExtension` no parsea bien (`.heic` → `image/jpeg`, falla el magic-byte del servidor) | `media.service.ts:4,33-38` | Un archivo >10 MB se sube entero para recibir 413. `fetchMediaDataUrl` mete un PDF de 10 MB en memoria como ~13 MB de string |

### 3.3 Cobertura y calidad de tests

| ID | Deuda |
|---|---|
| **D-11** | `src/lib/api.ts` (interceptor 401, `failedQueue`, single-flight) con **cero cobertura** — la lógica de mayor riesgo de la app |
| **D-12** | Cero cobertura en `lib/socket.ts`, los 3 hooks, `services/consultations.ts`, `prescriptions.ts`, `media.ts`, `users.ts`, `theme/tokens.ts` y los 8 componentes |
| **D-13** | **Cero tests de render**: no existe un solo `.tsx` en `__tests__`, luego ninguna de las 19 pantallas tiene test |
| **D-14** | 5 suites (`app`, `prescription`, `permissions`, `callWebView`, `petValidation`) **no importan código de la app**: afirman sobre literales del propio test. `petValidation.test.ts` reimplementa `validation/pet.ts` y `theme/tokens.ts`. `deepLinking.test.ts` reimplementa el routing en 4 de sus 6 casos. ~11 de 29 tests no dan ninguna protección contra regresión |

### 3.4 Higiene

| ID | Deuda |
|---|---|
| **D-15** | 6 pantallas usan `Alert.alert` para errores de datos en vez del kit `ScreenState` |
| **D-16** | 2 casts `any` violan el estándar del proyecto: `call/[consultationId].tsx:43`, `prescriptions/[id].tsx:25` |
| **D-17** | Sin `NetInfo` ni listener de conectividad: el estado offline es local al chat. 18 de 19 pantallas sin afordancia offline |
| **D-18** | Pull-to-refresh inconsistente: ausente en `pets/[id]` y en la cola `WAITING` de `VetWorkspace` |
| **D-19** | **Código muerto**: `hooks/usePets.ts` (0 imports), `components/Stars.tsx` (0 imports — `review/[id]` reimplementa las estrellas inline), `users.service.refreshMe`, `expo-linking`, y tokens `spacing`/`radius`/`colors.card`/`unreadBg` |
| **D-20** | `useProfile` relanza la excepción tras setear `error`, obligando a todos los callers a capturar dos veces; `save` y `setOnline` comparten un único mensaje de error |
| **D-21** | `VetWorkspace` expone a **cada** vet aprobado la cola `WAITING` global completa (el backend la devuelve a cualquier VET), sin push, sin poll y **ordenada por `createdAt`, no por prioridad** — un caso ROJO no se surfacea primero |

### 3.5 Producto — ausente

| ID | Hueco |
|---|---|
| **D-22** | **Admin inexistente en mobile.** `Role` incluye `ADMIN` y hay un label para él, pero nada llama a `/api/admin/*`. Un ADMIN entra al home de tutor |
| **D-23** | El bloque SENASA no hace polling: un vet aprobado sigue bloqueado hasta que cierre y vuelva a iniciar sesión |
| **D-24** | Sin tabs por rol: un VET ve las pestañas "Consulta" y "Mascota", sin sentido para él |
| **D-25** | `profile.tsx` solo edita `bio` y `photoUrl`; `photoUrl` es un campo de texto crudo pese a tener `expo-image-picker` |
| **D-26** | `pets/new.tsx` no puede fijar `sex`, `allergies` ni `chronicConditions`, y `species` es un toggle Canine/Feline que manda strings en inglés |
| **D-27** | Notificaciones sin paginar, en cliente ni servidor: más allá de 50 es inalcanzable |
| **D-28** | Solo se adjuntan imágenes de galería: no hay captura con cámara ni selección de PDF, aunque el backend acepta JPEG/PNG/PDF |
| **D-29** | Sin biometría (`expo-local-authentication` no es dependencia) |
| **D-30** | La receta no muestra nombre del paciente aunque el backend devuelve `consultation.pet`, y el `Share` comparte un texto sin identificación del paciente |

---

## 4. Roadmap restante — orden sugerido

**Fase 1 — Desbloquear lo que ya está construido** (D-01 parcial mobile, D-02, D-03, D-05, D-06, D-07)
Deep linking, sesión expirada, sincronización de chat, socket leak, y el cableado real de `registerPushToken` + listeners.

**Fase 2 — Señalización de llamada** (D-04, D-03 completo)
Timbre, UI de llamada entrante, `call:answered`/`call:rejected`, handshake real con la web embebida.

**Fase 3 — Corrección de contratos y estados** (D-08, D-09, D-10, D-15, D-16)
Envelope de `/auth/me`, renderizar `prescriptions[]` + `review`, validar tamaño de archivo, unificar errores en `ScreenState`, eliminar los 2 `any`.

**Fase 4 — Tests reales** (D-11, D-12, D-13, D-14)
Empezar por `api.ts` y `socket.ts`. Reescribir o borrar las 5 suites que no importan código de la app. Añadir cobertura de render.

**Fase 5 — Producto** (D-22 a D-30)
Admin, tabs por rol, polling del gate SENASA, paginación de notificaciones, captura con cámara y PDF, biometría.

**Fase 6 — Backend** (D-01 completo, D-B15)
Crear filas `Notification` y despachar Expo push. Firma criptográfica de la receta o corregir el claim legal de la UI.

> 🔴 **D-01 tiene dos mitades.** La mitad mobile (registro del token + listeners + UI de bandeja) se puede hacer ya. La mitad backend —que el backend nunca cree `Notification`— **no se puede resolver desde mobile**. Es la única deuda de este documento que unavoidablemente toca otro workspace.
