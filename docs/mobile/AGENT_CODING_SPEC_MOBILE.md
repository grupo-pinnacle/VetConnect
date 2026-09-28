# 📱 AGENT_CODING_SPEC_MOBILE — Contrato Canónico Ejecutable (Nivel 2)

> Precedencia: este archivo + `01_TECH_REFERENCE_MOBILE.md` invalidan a `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/web/00-11`, `docs/SISTEMA_DE_DISENO.md` y `docs/SPEC.md` si hay conflicto (ADR-025).
> Fuentes reales: `mobile/`, `backend/src/modules/`, `backend/prisma/schema.prisma`.
> Este archivo es el **único dueño** del stack, auth, router, sockets, bridge LiveKit, estados UI y tokens. No repetir esos temas en otro documento.

---

## 1. Stack congelado

| Paquete | Versión | Nota |
|---|---|---|
| `expo` | `~54.0.0` | Baseline exigido, instalado |
| `expo-router` | `~6.0.0` | `"main": "expo-router/entry"` |
| `react-native` | `0.81.4` | |
| `react` / `react-dom` | `19.1.0` | **Excepción documentada**: lo exige SDK 54 / RN 0.81. Web queda en 18.3.1 LTS (usa LiveKit nativo; mobile usa bridge WebView) |
| `nativewind` | `^4.1.0` + `tailwindcss` `^3.4.17` | Cableado activo: `tailwind.config.js` + `global.css` + `nativewind/babel` + `withNativeWind` |
| `typescript` | `^5.7.3` | Estricto. **Cero `any`** |
| `jest` / `jest-expo` | `^29.7.0` / `~54.0.0` | |

Librerías de dominio: `axios ^1.12.0`, `socket.io-client ^4.8.1`, `zod ^3.24.2`, `zustand ^5.0.3`, `expo-secure-store ~15.0.0`, `expo-notifications ~0.32.0`, `expo-camera ~17.0.0`, `expo-image-picker ~17.0.0`, `expo-linking ~8.0.0`, `react-native-webview ^13.15.0`.

> ❌ **Prohibido** instalar `@tanstack/react-query` en mobile. El estado vive en `zustand` + services con `axios` (ADR-015 aplica solo a web).
> ❌ **Prohibido** LiveKit nativo (`@livekit/components-react`) en mobile. El video va por bridge WebView (§6).

### 1.1 Cableado de NativeWind v4 (monorepo) — no revertir

Hallazgos verificados en build, registrados en `metro.config.js` y `babel.config.js`:

- `blockList` de copia única de React Native: la versión stale del root (`0.76.7`) y la anidada (`0.87.1`) están vetadas.
- `extraNodeModules` fija `react`/`react-native` canónicos del workspace mobile.
- Plugin `expo-router-plugin` declarado explícitamente: el preset hoisted no detecta `expo-router` anidado.
- Único cast `WebView` permitido (13.15 → 17 de tipos) vía `unknown`, documentado en `call/[consultationId].tsx`.

---

## 2. Auth dual (ADR-004) — única forma válida

- **Header obligatorio** `X-Client-Platform: mobile` (`src/lib/api.ts:13`). Sin él el backend devuelve refresh token en cookie HttpOnly y mobile no puede leerlo.
- `login` / `register` / `refresh` retornan `{ accessToken, refreshToken, user }` en JSON **solo** con ese header (`backend/src/modules/auth/auth.controller.ts:35,57,74-82`).
- **Refresh token** → solo `expo-secure-store`, clave `vetconnect_refresh_token`.
- **Access token** → **solo memoria** (`authStore.ts`). Nunca `SecureStore`, nunca `AsyncStorage` (ver §8).
- `initAuth()` corre en `app/_layout.tsx` al arrancar: lee SecureStore → `POST /api/auth/refresh` → rehidrata `user`.
- Refresh en vuelo: `failedQueue` + single-flight en `api.ts:17-32,47-53` — **un solo** refresh para N requests 401 concurrentes.
- Logout: `POST /api/auth/logout` + borrar SecureStore + limpiar header Authorization. **Borrar el token local aunque la red falle.**

### 2.1 Roles y bloqueo SENASA (ADR-013)

| Rol | Comportamiento en mobile |
|---|---|
| `CLIENT` | Home tutor, pets, triage, chat, llamada, receta, calificar |
| `VET` + `APPROVED` | Guardia: cola `WAITING`, asignar, atender, emitir receta, cerrar con `diagnosisNotes` |
| `VET` + `PENDING`/`REJECTED` | **Bloqueado**: `(app)/_layout.tsx:30` renderiza `VetPendingBlock` (testID `vet-pending-block`). Sin acceso a salas |
| `ADMIN` | Solo lectura de lo propio. Mobile **no** expone `/api/admin/*` (ver `03_ESTADO_Y_DEUDA_MOBILE.md`) |

---

## 3. Router — árbol real (19 pantallas)

```
app/_layout.tsx                     Stack root + initAuth + Splash(ActivityIndicator)
app/index.tsx                       Redirect por sesión y rol
app/(auth)/_layout.tsx              Stack sin tabs: login, register
app/(app)/_layout.tsx               Tabs + bloqueo SENASA
```

| Ruta | Pantalla | Responsabilidad |
|---|---|---|
| `(auth)/login.tsx` | Login | `POST /api/auth/login` |
| `(auth)/register.tsx` | Registro | `POST /api/auth/register` |
| `(app)/index.tsx` | Home | `GET /pets` + `GET /consultations/mine`; delega a `VetWorkspace` si VET |
| `(app)/history.tsx` | Historial | `GET /consultations/mine` + filtros + `PATCH :id/cancel` |
| `(app)/notifications.tsx` | Alertas | `GET /notifications` + `PATCH :id/read` |
| `(app)/profile.tsx` | Perfil | `PATCH /api/users/profile` (bio, photoUrl, isOnline) + logout |
| `(app)/pets/new.tsx` | Alta mascota | `POST /api/pets` |
| `(app)/pets/[id].tsx` | Mascota | `GET/PATCH/DELETE /api/pets/:id` (CRUD completo) |
| `(app)/consultation/new.tsx` | Triage | `GET /pets` + `POST /consultations` |
| `(app)/consultation/[id].tsx` | Detalle | `GET /consultations/:id` + acciones vet |
| `(app)/consultation/[id]/prescribe.tsx` | Emitir receta | `POST /consultations/:id/prescriptions` |
| `(app)/chat/[consultationId].tsx` | Chat | `GET …/messages?after=` + sockets + `POST /media` |
| `(app)/call/[consultationId].tsx` | Videoconsulta | `POST /calls/:id/token` + bridge WebView (§6) |
| `(app)/prescriptions/[id].tsx` | Receta + QR | `GET /api/prescriptions/:id` + `Share` |
| `(app)/review/[consultationId].tsx` | Calificar | `POST /consultations/:id/review` |

**Convenciones**

- `useLocalSearchParams<{ consultationId: string }>()`; el parámetro de ruta se llama `consultationId` (no `id`) en `chat/`, `call/` y `review/`.
- Navegación push → `/call/:id` o `/consultation/:id` (`src/services/notifications.service.ts:54-57`).
- Fin de llamada → `router.back()`.
- Rutas sin tab visible: `options={{ href: null }}`.

### 3.1 Deep links

Esquema declarado en `app.json:9` (`vetconnect`). Rutas profundas soportadas: `vetconnect://call/:id`, `vetconnect://consultation/:id`, `vetconnect://prescriptions/:id`.
⚠️ Estado actual: `expo-linking` está instalado pero **sin cablear** — ver `03_ESTADO_Y_DEUDA_MOBILE.md`.

---

## 4. Sockets (ADR-009) — solo estos eventos

**Connect** (`src/lib/socket.ts:19-23`):
```ts
io(WS_URL, { auth: { token: `Bearer ${accessToken}` }, transports: ['websocket'] })
```
`WS_URL` = `EXPO_PUBLIC_WS_URL` o `http://localhost:3001`.

**Cliente → servidor**

| Evento | Payload | Notas |
|---|---|---|
| `join:consultation` | `{ consultationId }` | Al entrar al chat |
| `message:send` | `{ consultationId, content, clientMsgId }` | `clientMsgId = mobile-${Date.now()}-rand`. Idempotente: `P2002` → el servidor responde **200** con el mensaje existente, nunca 500 ni duplicado |
| `call:answered` | `{ consultationId }` | Al aceptar videoconsulta entrante |
| `call:rejected` | `{ consultationId }` | Al rechazar |

**Servidor → cliente**

| Evento | Payload | Notas |
|---|---|---|
| `message:new` | `Message` | Append + `updateLastKnownTimestamp` |
| `call:incoming` | `{ consultationId, callerName, roomName }` | `callerName` es **`firstName`**. Cero PII |
| `call:ended` | — | El bridge web la usa para cerrar |

- **Background:** `AppState → background` desconecta; `→ active` reconecta y llama `syncIncrementalMessages()` (`socket.ts:46-60`), que sincroniza con `GET /consultations/:id/messages?after=ISO`.
- `prescription:new` está **tipado pero NO emitido** por el backend. Para recetas: **polling** `GET /api/prescriptions/:id`, nunca esperar el socket.

---

## 5. Push + in-app (ADR-011)

- `Notifications.setNotificationHandler` a nivel de módulo (`src/services/notifications.service.ts:6-12`). Usar únicamente las claves vigentes de la API de Expo Notifications; no mezclar `shouldShowAlert` con sus reemplazos.
- `registerPushToken()`: `getPermissions` → `getExpoPushTokenAsync` → `POST /api/notifications/register-token { token, platform }` (idempotente, `pushToken.token` es `@unique`).
- `platform` es un enum cerrado `ios | android | web` (`notifications.schemas.ts:5`). **Nunca enviar `Platform.OS` sin validar**: bajo Expo Go puede valer `macos`/`windows` y el backend responde 400.
- Tap: `data.consultationId` + `type === CALL_INCOMING` → `/call/:id`; el resto → `/consultation/:id`.
- ⚠️ Estado actual: cableado incompleto — ver `03_ESTADO_Y_DEUDA_MOBILE.md`.

---

## 6. Bridge LiveKit (ADR-012) — prohibido SDK nativo

1. `POST /api/calls/:consultationId/token` → `{ token, wsUrl }`. Solo `ACTIVE` y participantes. Token **sin PII**: `identity: user.id`, `name: user.firstName`.
2. `WebView` carga `${EXPO_PUBLIC_WEB_URL}/call/${consultationId}` con `allowsInlineMediaPlayback`, `mediaPlaybackRequiresUserAction=false`, `javaScriptEnabled`, `domStorageEnabled`.
3. Handshake: la web embebida emite `page:ready` → mobile inyecta el token vía `window.initLiveKitCall(...)` → overlay `Preparando cámara…` hasta `isPageReady`.
4. `call:ended` → alerta → `router.back()`.
5. La web embebida monta **solo** `<VideoConference/>`, nunca `RoomAudioRenderer` (provoca eco y doble audio).
6. Cámara trasera `facingMode: 'environment'` con autoenfoque, para que el tutor narre mientras enfoca.

### 6.1 UX clínica

- Chat durante la videoconsulta: la web embebida ya incluye su propio chat (`ConsultationRoom`). Mobile no lo duplica.
- Multicanal: foto clínica (`POST /api/media`) en paralelo **sin desmontar** el `WebView`.
- Ventana de gracia 3 min ante corte del vet (`VET_DISCONNECTED_TIMEOUT` → reencolado prioritario en `WAITING`).
- Timeout de triage 15 min (`TIMEOUT_NO_VET_AVAILABLE`) vía push + socket.
- Timbrar al par: `POST /api/calls/:consultationId/ring`.

---

## 7. Los 5 estados UI obligatorios (5/5)

Toda pantalla asíncrona debe manejar los cinco:

| Estado | Requisito |
|---|---|
| `loading` | `ActivityIndicator` o skeleton con `colors.primary` (`#0284C7`) |
| `error` | **Caja de error visible + botón Reintentar**. Prohibido `console.warn` como único reporte |
| `empty` | Estado informativo ("No tienes…"), nunca datos simulados |
| `success` | Contenido real del backend |
| `reconnecting` / `offline` | Banner de conexión + acción de reintento |

Componentes del kit (`src/components/`): `ScreenState` (loading/error/empty), `Field`, `PrimaryButton`, `Stars`, `StatusBadge`, `AttachmentView`, `VetConsultationActions`, `VetWorkspace`.
❌ Prohibido `Alert.alert` para errores de datos en pantallas con estado asíncrono — usar `ScreenState`. `Alert` queda solo para confirmación e irreversibles (baja, cancelar).

---

## 8. Design tokens

Fuente única: **`src/theme/tokens.ts`**. Prohibido hex literal fuera de ese archivo.

| Rol | Valor |
|---|---|
| Primary | `#0284C7` |
| Fondo | `#F8FAFC` |
| Texto / ink | `#0F172A`, secundario `#334155` |
| Muted | `#64748B`, `#94A3B8` |
| Borde | `#E2E8F0`, `#CBD5E1` |
| Burbuja propia | fondo `#0284C7`, texto `#FFF` |
| Burbuja ajena | fondo `#E2E8F0`, texto `#0F172A` |

- Radio 8. Cards `padding: 16`, `borderWidth: 1`. Header 16 bold.
- Distribución 60-30-10 heredada de `docs/SISTEMA_DE_DISENO.md`.
- Tipografía nativa del sistema en mobile (Inter es web).
- NativeWind v4 está cableado; la migración `style=` → `className` es **progresiva por pantalla**, manteniendo `testID` y snapshot visual. No mezclar NativeWind v2 con v4.

---

## 9. Guardrails — fallo de CI si se violan

❌ **Prohibido**
- `any` explícito o implícito. Usar `unknown` + Zod. Cast solo vía `unknown` documentado.
- `localStorage` / `AsyncStorage` para el refresh token.
- Omitir el header `X-Client-Platform`.
- `@livekit/components-react` o `RoomAudioRenderer` en mobile.
- `POST /:id/messages` (no existe; los mensajes son por socket).
- `express.static` sobre `/uploads`.
- Email o teléfono en tokens LiveKit, logs de auditoría o respuestas públicas.
- `prisma.<model>.delete()` físico (siempre `deletedAt`).
- Escala de rating distinta de 1–5 entero.
- Campos v2.1+ (`FavoriteVet`, `isHidden`, `VaccinationRecord`…).
- Métricas, contadores o KPIs hardcodeados. Todo número visible sale de PostgreSQL o se calcula con `useMemo` sobre entidades reales.
- Ramas de mocking (`?mock=true`, `id === 'demo'`).

✅ **Obligatorio**
- Zod en todo input antes de tocar la red (`src/validation/{auth,pet,clinical,profile}.ts`).
- Envelope `ApiResponse<T>` RFC 7807: `{ success, data?, error: { code, message, details?, timestamp } }`.
- `testID` en pantallas de llamada y chat: `call-loading-screen`, `permission-denied-screen`, `call-room-view`, `vet-pending-block`.
- `keyExtractor` estable (`id || clientMsgId`).
- `FlatList` para listas, nunca `ScrollView`.
- Un solo escritor por vez; sin `any`, sin `@ts-ignore`.
