# F0 — Spikes de riesgo y proyecto limpio

> **Objetivo:** demostrar en un teléfono real que las 3 cosas que hicieron fracasar la v2 funcionan **antes** de construir cualquier pantalla: dev build, push remoto y videollamada LiveKit nativa.

## Definition of Ready
- [ ] Teléfono Android físico con depuración USB (o emulador con Google Play Services).
- [ ] JDK 17+ y Android SDK instalados (`npx expo run:android` debe poder compilar).
- [ ] Acceso a una cuenta de Firebase y a la cuenta de Expo dueña del `projectId` `e578295e-7fa0-4727-b57c-4c31b6df01aa`.
- [ ] Backend corriendo localmente (`docker-compose up` + `npm run dev -w backend`) con credenciales de LiveKit en su `.env` (no leer el archivo; solo confirmar con el usuario).

## Lecturas
- `odd/mobile-v3/CONTEXT.md`
- `backend/src/modules/calls/calls.routes.ts`, `calls.service.ts`
- `backend/src/modules/notifications/notifications.service.ts`, `notifications.routes.ts`
- `backend/src/modules/auth/auth.controller.ts` (solo login con `X-Client-Platform`)
- `mobile/app.json`, `mobile/eas.json`, `app.json` y `eas.json` de la raíz (solo para migrarlos)

## Tareas
1. **Rama y legado:** crear `feat/mobile-v3`. Mover `mobile/` → `mobile-legacy/` con `git mv`. Sacar `mobile-legacy` de los `workspaces` del `package.json` raíz.
2. **Proyecto limpio:** `npx create-expo-app@latest mobile --template blank-typescript` fijado a **SDK 54**. Nombre del paquete npm `@vetconnect/mobile`. Agregar `mobile` a los workspaces. Scripts: `start`, `android`, `typecheck`, `test`.
3. **Config única:** crear `mobile/app.config.ts` (package `com.vetconnect.app`, scheme `vetconnect`, permisos con tildes correctas en UTF-8) y `mobile/eas.json` con perfiles `development` / `preview` / `production`. **Borrar `app.json` y `eas.json` de la raíz** (había un package `com.juan_mendoza.vetconnect` en conflicto). `android/` e `ios/` en `.gitignore`.
4. **Herramientas base:** jest-expo + `@testing-library/react-native`, TypeScript strict, alias `@/` → `src/`, y la estructura vacía de carpetas de `CONTEXT.md §4`.
5. **Spike push:**
   - Crear el proyecto Firebase y la app Android `com.vetconnect.app`. `google-services.json` va en `mobile/` y queda **fuera de git** (se documenta en `.env.example`/README cómo obtenerlo; en EAS se sube como secret de archivo).
   - Subir la credencial FCM v1 a EAS (`eas credentials`).
   - Pantalla temporal `app/spike/push.tsx`: pedir permiso → `getExpoPushTokenAsync({ projectId })` → mostrar el token.
   - Enviar una push desde https://expo.dev/notifications y confirmar que llega con la app en primer plano, en segundo plano y cerrada.
6. **Spike LiveKit:**
   - Instalar los paquetes de M-02 y registrar los config plugins. `registerGlobals()` al inicio.
   - Pantalla temporal `app/spike/call.tsx`: login con un usuario de prueba → `POST /api/calls/:consultationId/token` sobre una consulta `ACTIVE` del seed → conectar a la sala → video local y remoto.
   - El otro participante entra desde la web (`web/`) a la misma consulta.
7. **Inventario de push del backend:** listar qué eventos invocan `notifications.service` (grep de los callers). Los huecos se anotan como hallazgos para F6. No se toca el backend en F0.
8. **ADRs:** registrar M-01..M-06 en `docs/DECISIONS.md` con su contexto y sus tradeoffs (resumir desde `CONTEXT.md`).
9. **Limpieza:** las pantallas `spike/*` se borran al cerrar la fase. Lo aprendido (orden de inicialización, flags, permisos) se escribe en el Handoff.

## Fuera de alcance
Design system, auth real, cualquier pantalla de producto.

## Criterio de salida
- [ ] `npx expo run:android` instala el dev build y el hot reload funciona.
- [ ] Llega una push remota con la app en primer plano, en segundo plano y cerrada.
- [ ] Teléfono ↔ web en la misma sala LiveKit con audio y video bidireccional.
- [ ] `npm run typecheck -w mobile` y `npm test -w mobile` en verde (con al menos un smoke test).
- [ ] Una sola config Expo/EAS en el repo.

> 🔴 Si push o LiveKit fallan, la fase termina **BLOQUEADA** con diagnóstico. No se avanza a F1.

## Handoff
_Pendiente._
