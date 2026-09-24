# 📱 AGENT_CODING_SPEC_MOBILE — Contrato Canónico Ejecutable (Nivel 2)

> Precedencia: este archivo + `docs/TECH_REFERENCE.md` invalidan a `ARCHITECTURE`/`DECISIONS`/`web/00-11`/`SISTEMA_DE_DISENO` si hay conflicto (ADR-025). Fuente real: `mobile/` + `backend/src/modules/` + `schema.prisma`.

## 1. Stack congelado

* React **19.1.0** + `react-dom 19.1.0` (requeridos por Expo SDK 54 / RN 0.81 — excepción mobile documentada en `00_*`; web queda en 18.3.1 LTS porque usa LiveKit nativo, mobile usa bridge WebView).
* Baseline exigido: **Expo SDK 54 + `expo-router ~6` + `react-native ~0.81` + `jest-expo ~54` + NativeWind v4 + `tailwindcss v3`**. Estado real auditado: SDK 52 (`expo ~52.0.0`, `router ~4.0.17`, `RN 0.76.7`, `nativewind ^2.0.11`) — ver `00_AUDITORIA_*`. Todo código nuevo debe ser compatible con 54 (sin APIs exclusivas de 52).
* Libs reales: `axios`, `socket.io-client ^4.8.1`, `expo-secure-store ~14`, `expo-notifications`, `react-native-webview 13.12.5`, `zustand ^5.0.3`, `zod ^3.24.2` (`mobile/package.json:15-42`).
* TS `^5.7.3` estricto, cero `any`. Sustituir `Record<string,any>` (`authStore.ts:10-11`, `api.ts:20`, `types/index.ts:94,100`) por `unknown` + Zod.

## 2. Auth dual (ADR-004) — única forma válida

* Header obligatorio: `X-Client-Platform: mobile` (`src/lib/api.ts:9-14`).
* Login/register/refresh retornan `{ accessToken, refreshToken, user }` en JSON solo si header mobile (`backend/src/modules/auth/auth.controller.ts:35,57,74-82`). Guardar refresh solo en `expo-secure-store` clave `vetconnect_refresh_token` (`api.ts:5,62,78`). Access token en memoria (`authStore.ts:8`, `api.defaults.headers.common.Authorization`).
* Refresh: `POST /api/auth/refresh { refreshToken }` (`authStore.ts:29-32`, `api.ts:64-71`). `failedQueue` para 401 concurrentes (`api.ts:17-32,47-53`). Logout: `POST /api/auth/logout` + borrar SecureStore + borrar header (`authStore.ts:89-99`).
* `initAuth` en `app/_layout.tsx:1-13` al arrancar. Sin guards de rol todavía — TODO `02_ARQUITECTURA`.

## 3. Router + pantallas reales

```
app/_layout.tsx        # Slot + initAuth (sin Stack/Redirect todavía)
app/index.tsx          # dummy, debe redirigir por rol tras guards
app/(auth)/login.tsx, register.tsx
app/(app)/index.tsx              # Home: GET /pets + GET /consultations/mine en paralelo
app/(app)/pets/new.tsx
app/(app)/consultation/new.tsx   # POST /consultations con [Prioridad: ROJO|AMARILLO|VERDE] en notes
app/(app)/chat/[consultationId].tsx  # join + message:send + GET messages + ?after=
app/(app)/call/[consultationId].tsx  # bridge WebView (ver §5)
app/(app)/notifications.tsx      # lista take:50 fijo, PATCH :id/read
app/(app)/prescriptions/[id].tsx # GET público QR
```

Convención: `useLocalSearchParams<{ consultationId: string }>()`, `router.push('/call/'+id)` desde notificaciones (`notifications.service.ts:51-55`), `router.back()` al terminar call.

## 4. Sockets (ADR-009) — solo estos eventos

* Connect: `io(WS_URL, { auth:{ token:'Bearer '+accessToken }, transports:['websocket'] })` (`socket.ts:19-23`). `EXPO_PUBLIC_WS_URL` o `http://localhost:3001`.
* `join:consultation { consultationId }` (`chat/[consultationId].tsx:26`).
* `message:send { consultationId, content, clientMsgId }` con `clientMsgId=mobile-${Date.now()}-rand` (`:59-67`). Callback `(res:any)` — tipar como `ApiResponse<Message>` en refactor, no `any` (`:68`). Servidor deduplica `P2002 → success:true existing` (idempotencia).
* `message:new (msg: Message)` → append + `updateLastKnownTimestamp` (`:28-33`).
* Background: `AppState background → disconnect; active → connect + syncIncrementalMessages()` (`socket.ts:46-60`). Sync vía `GET /consultations/:id/messages?after=ISO` (`:68-70`).
* `prescription:new` tipado pero **no emitido** por backend — mobile debe hacer polling `GET /prescriptions/:id`, nunca esperar socket.

## 5. LiveKit bridge (ADR-012) — prohibido SDK nativo en v2.0

* `POST /api/calls/:consultationId/token → { token, wsUrl }` (`call/[consultationId].tsx:25-27`). Sin PII: `identity:user.id, name:firstName`.
* `WEB_CALL_URL/call/:id` en `WebView` (`:114,124-133`) con `allowsInlineMediaPlayback`, `javaScriptEnabled`, `domStorageEnabled`. Handshake: `page:ready → setIsPageReady → inject window.initLiveKitCall(token)` (`:57-69`); `call:ended → Alert → router.back()` (`:70-74`). Overlay `Preparando cámara…` hasta `isPageReady` (`:118-123`).
* Multicanal: chat + `POST /api/media` en paralelo sin pausar WebView (PiP/BottomSheet en UI nueva). Cámara trasera `facingMode:'environment'` en web embebida.
* Permisos `app.json:25-30` `CAMERA, RECORD_AUDIO, READ/WRITE_EXTERNAL_STORAGE` + plugins `expo-camera`, `expo-notifications`. Pantalla `permission-denied` obligatoria (`:89-112`).

## 6. Push + in-app (ADR-011)

* `Notifications.setNotificationHandler({ shouldShowAlert/PlaySound/SetBadge:true })` (`notifications.service.ts:6-12`).
* `registerPushToken(): getPermissions → getExpoPushTokenAsync → POST /notifications/register-token { token, platform: Platform.OS }` (`:15-44`).
* Tap: `data.consultationId + type CALL_INCOMING → /call/:id`, resto → `/consultation/:id` (`:46-58`).

## 7. Estados UI obligatorios (5/5)

`loading (ActivityIndicator #0284C7)`, `error (Alert + Volver, no solo console.warn)`, `empty (No tienes… — index.tsx:65,78)`, `success`, `reconnecting/offline` (banner socket + `syncIncrementalMessages`, hoy ausente — TODO obligatorio en pantallas nuevas).

## 8. Guardrails (fallo CI si se violan)

* ❌ `any` explícito, ❌ `localStorage/AsyncStorage` para refresh, ❌ omitir `X-Client-Platform`, ❌ `RoomAudioRenderer` / SDK LiveKit nativo, ❌ `POST /:id/messages` REST, ❌ `express.static /uploads`, ❌ email/tel en tokens/logs, ❌ `prisma.*.delete()` físico, ❌ escala rating ≠ 1-5, ❌ campos v2.1+ (`FavoriteVet`, `isHidden`, `VaccinationRecord`…).
* ✅ Zod en todo input, ✅ `ApiResponse<T>` RFC7807 `{ success, data?, error:{code,message,timestamp} }`, ✅ `testID` en pantallas call/chat (`call-loading-screen`, `permission-denied-screen`, `call-room-view`).
