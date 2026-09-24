# 📱 02_ARQUITECTURA_NAVEGACION — Expo Router + Guards + Offline

## Árbol real → objetivo

```
app/_layout.tsx → Stack root (TODO): initAuth + Splash + Redirect por rol
app/index.tsx → Redirect: !user→/(auth)/login, CLIENT→/(app), VET pendiente→bloqueo SENASA
app/(auth)/_layout.tsx (TODO) → Stack sin tabs, `login`, `register`
app/(app)/_layout.tsx (TODO) → Tabs: Home | Pets | Chat | Historial + header `isOnline`
app/(app)/index.tsx → GET /pets + GET /consultations/mine (Promise.all, hoy sin error UI)
...(rutas: `(auth)/login,register`, `(app)/index (rol: tutor→home, VET→guardia)`, `pets/new`, `pets/[id]`, `consultation/new`, `consultation/[id]`, `consultation/[id]/prescribe`, `chat/[id]`, `call/[id]`, `notifications`, `history`, `prescriptions/[id]`, `review/[id]`, `profile`)
```

Guards: `useAuthStore(isLoading,user,vetStatus)`; VET `PENDING/REJECTED` no entra a `(app)` (ADR-013); deep-link `vetconnect://call/:id`, `.../consultation/:id` preservando `SecureStore` session; tap push ya navega (`notifications.service.ts:51-55`).

## Offline / reconexión (obligatorio en pantallas nuevas)

* `socket.ts:46-60` `AppState background→disconnect, active→connect + syncIncrementalMessages (?after=)`. Añadir banner `Sin conexión · reintentando…` + cola `failedQueue` axios + `FlatList` con `ListEmptyComponent` y `refreshing`.
* Env `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`), `EXPO_PUBLIC_WS_URL`, `EXPO_PUBLIC_WEB_URL` (default `http://localhost:5173`). En red corporativa usar ADB reverse (`adb reverse tcp:3001 tcp:3001`, ADR-016), nunca hardcodear IP.
