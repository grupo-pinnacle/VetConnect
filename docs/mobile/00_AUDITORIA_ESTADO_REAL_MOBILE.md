# 📱 00_AUDITORIA_ESTADO_REAL_MOBILE — Foto Verificada (2026-09-24, post-build)

## SDK / baseline — UPGRADE COMPLETADO

* Baseline exigido: SDK 54 + Router ~6 + RN ~0.81 + NativeWind v4 ✅ **implementado**.
* Real verificado: `mobile/package.json` `expo ~54.0.0` (instalado 54.0.37), `expo-router ~6.0.0` (6.0.24), `react-native 0.81.4`, `react 19.1.0`, `nativewind ^4.1.0` (4.2.7), `jest-expo ~54.0.0`, `expo-camera ~17.0.0`, `expo-image-picker ~17.0.0`, `react-native-reanimated` + `react-native-worklets` (SDK 54, requeridos por `nativewind/babel`), `axios ^1.12.0` + `ts-jest ^29.1.0` + `babel-preset-expo ~54.0.0` + `react-native-css-interop 0.2.7` (deps directas explícitas), `"main": "expo-router/entry"`.
* **Excepción documentada vs spec web:** mobile usa React **19.1.0** (requerido por SDK 54/RN 0.81); web queda en 18.3.1 LTS. Mobile no usa LiveKit nativo (bridge WebView), por lo que el motivo del congelamiento 18.3.1 no aplica.

## SDK / baseline

* Exigido: SDK 54 + Router ~6 + RN ~0.81 + NativeWind v4 (`ARCHITECTURE.md:34,43`, `AGENTS.md §4.3`).
* Real: `mobile/package.json:16` `expo ~52.0.0`, `:20` `expo-router ~4.0.17`, `:26` `react-native 0.76.7`, `:17-22,39` `constants ~17.0.3, linking ~7.0.3, notifications ~0.29.13, secure-store ~14.0.1, jest-expo ~52.0.0`. React OK `18.3.1` (`:24-25`). **Deuda D-01: upgrade a 54 — COMPLETADA 2026-09-24.**
* `app.json` scheme `vetconnect`, permisos `CAMERA, RECORD_AUDIO, READ/WRITE_EXTERNAL_STORAGE`, plugins `expo-camera` + `expo-notifications` + `expo-image-picker` (agregado en build). `eas.json:1-28` tripartita OK (development/preview `apk`, production `app-bundle`).

## Estilos — NativeWind declarado, no cableado

* `package.json:23,40` `nativewind ^2.0.11` + `tailwindcss ^3.4.17` instalados pero `babel.config.js:1-6` solo `babel-preset-expo` (falta `nativewind/babel`), `metro.config.js:1-15` sin `withNativeWind`, 0 `tailwind.config.*`, 0 `className` en `mobile/`. Todo `StyleSheet` con hex hardcodeados (`#F8FAFC,#0F172A,#0284C7` en `index.tsx:96-113`, `chat/[id].tsx:122-139`, `call/[id].tsx:138-162`). **Deuda D-02 — CABLEADO COMPLETADO 2026-09-24** (`tailwind.config.js` + `global.css` + `nativewind/babel` + `withNativeWind`; pantallas nuevas usan `src/theme/tokens.ts`, migración `className` progresiva).

## Router / guards

* Real: `app/_layout.tsx:1-13` `Slot + initAuth` sin `Stack/Tabs/Redirect`; `app/index.tsx:1-10` dummy; `(app)/ index, chat/[id], call/[id], consultation/new, pets/new, notifications, prescriptions/[id]` + `(auth)/ login,register`. Sin `(app)/_layout.tsx` ni `(auth)/_layout.tsx` de protección por rol (web sí `ProtectedRoute.tsx:11-13`). Sin `src/components/`, `src/hooks/`, `src/stores/` (TECH preveía `components/hooks/stores`). **Deuda D-03 — COMPLETADA 2026-09-24** (Stack root + `(auth)` Stack + `(app)` Tabs + Redirect por rol en `app/index.tsx` + bloqueo VET PENDING; creadas `consultation/[id]` y `review/[consultationId]`).
* Tipos OK `CLIENT/VET/ADMIN`, `WAITING/ACTIVE/COMPLETED/CANCELLED` (`types/index.ts:1-3`) `authStore.ts` + `api.ts` + `types/index.ts:94,100,107` violaban cero-`any`. **Deuda D-04 — COMPLETADA 2026-09-24** (`unknown` + Zod en `src/validation/auth.ts`; único cast vía `unknown` documentado: WebView 13.17 en `call/[consultationId].tsx`).

## Funcional verificado

* Auth/refresh/failedQueue conforme (`api.ts:34-97`, `authStore.ts:21-99`). Chat `join/send/new + ?after=` conforme (`chat/[id].tsx:26,38,61-73`). Call bridge `token + page:ready/call:ended + overlay` conforme (`call/[id].tsx:25-27,64-78,118-123`). Push register + tap-navigate conforme (`notifications.service.ts:15-58`).
* Brechas D-05 — **COMPLETADAS 2026-09-24**: error UI + Reintentar en Home/notifications/triage/chat/detail, banner `reconnecting/offline` en chat (`chat-offline` + `syncIncrementalMessages`), ack tipado `SendAck`, adjuntos imagen (`expo-image-picker` → `POST /media` → `attachmentUrl`), triage ROJO/AMARILLO/VERDE con branch `ACTIVE→chat / WAITING→detalle`, review 1-5, `consultation/[id]` (destino de push + Home).

## Tests

* `src/__tests__/`: 9 suites, 21 tests verdes 2026-09-24 (`authStore, callWebView, deepLinking, permissions, petValidation, prescription, app` + nuevos `triage, validation`). Verificación: `npm run typecheck` ✅, `npm test` ✅, `expo export --platform android` ✅ (bundle 4.18 MB).
