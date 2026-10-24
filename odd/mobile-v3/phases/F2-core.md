# F2 — Núcleo: sesión, red, tiempo real y navegación por rol

> **Objetivo:** la infraestructura de mayor riesgo, testeada a fondo, sobre la que se apoyan todas las features.

## Definition of Ready
- [ ] F1 `HECHA`.

## Lecturas
- `backend/src/modules/auth/auth.routes.ts`, `auth.controller.ts`, `auth.schemas.ts`
- `backend/src/modules/users/users.routes.ts` (`/me`, presencia)
- `backend/src/realtime/socket.types.ts`, `socket.auth.middleware.ts`
- `backend/src/middlewares/errorHandler.ts` (envelope de error)
- `mobile-legacy/src/lib/api.ts`, `authStore.ts`, `socket.ts`: **solo como referencia de qué falló** (D-05, D-06, D-07 en `docs/mobile/03_ESTADO_Y_DEUDA_MOBILE.md` §3.2)

## Tareas
1. `shared/lib/secureStorage.ts`: refresh token en `expo-secure-store`. Access token solo en memoria.
2. `shared/lib/apiClient.ts`: axios con `X-Client-Platform: mobile`, interceptor 401 con refresh **single-flight** y cola de peticiones. Si el refresh falla → `session.expire()` limpia el store, el QueryClient y el socket, y navega a login. Errores tipados según el envelope del backend.
3. `features/auth`: login, registro, logout, `initAuth` al arrancar (refresh → `/auth/me`, verificando el envelope real `data: { user }`).
4. `shared/lib/queryClient.ts`: TanStack Query con `focusManager` (AppState) y `onlineManager` (`@react-native-community/netinfo`).
5. `shared/lib/socket.ts`: un singleton por sesión, auth por token, reconexión que **dispara resync** (invalidar queries y emitir un evento de resync para el chat) sin perder el watermark. Cierre limpio en logout/expiración.
6. Navegación: `app/_layout.tsx` con providers; grupos `(auth)`, `(tutor)`, `(vet)`; redirect por rol; ADMIN → pantalla "Usar el panel web"; gate SENASA para VET no aprobado con polling de `/auth/me` (intervalo y backoff a definir).
7. `OfflineBanner` global conectado a NetInfo.

## Tests obligatorios (TDD)
- apiClient: 401 → refresh → reintento; 3 requests concurrentes con 401 → **un solo** refresh; refresh fallido → expira la sesión.
- socket: reconexión → resync emitido; logout → desconectado y sin listeners colgados.
- guards: cada rol cae en su grupo; VET pendiente → gate.

## Fuera de alcance
Pantallas de producto (más allá de login, registro y los placeholders de las tabs).

## Criterio de salida
- [ ] Tests anteriores en verde; typecheck en verde.
- [ ] En el dispositivo: login tutor, login vet, logout, y sesión expirada (revocar desde el backend) → vuelve a login sin quedar atrapado.

## Handoff
_Pendiente._
