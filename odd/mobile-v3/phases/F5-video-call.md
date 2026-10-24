# F5 — Videollamada nativa (LiveKit)

> **Objetivo:** llamada real tutor ↔ vet, con timbre, aceptar/rechazar y permisos reales. Se construye sobre lo aprendido en el spike de F0.

## Definition of Ready
- [ ] F4 `HECHA`.
- [ ] Handoff de F0 leído (orden de inicialización de LiveKit, gotchas).

## Lecturas
- `odd/mobile-v3/phases/F0-spikes.md` → sección Handoff
- `backend/src/modules/calls/*`
- `backend/src/realtime/socket.types.ts` (eventos `call:*`)
- `docs/LIVEKIT_AUDIT.md`: solo si el Handoff de F0 lo recomienda

## Tareas
1. `features/calls/api`: obtener el token y hacer ring. Manejar `INVALID_CONSULTATION_STATE` y `NOT_CONSULTATION_PARTICIPANT` con UI clara.
2. Permisos reales de cámara y micrófono: pedir → denegado → explicar → abrir ajustes. Sin estados falsos.
3. Pantalla `app/call/[consultationId].tsx`: video remoto a pantalla completa, local en PiP, controles (mute, cámara, girar cámara, altavoz, colgar), estado de conexión y reconexión.
4. Llamada entrante: escuchar `call:incoming` en el socket global → `IncomingCallSheet` con tono (`expo-av` / `expo-audio`) → `call:answered` / `call:rejected`. Timeout sin respuesta.
5. Mantener la pantalla encendida durante la llamada (`expo-keep-awake`).
6. Cero PII: verificar que el token solo lleve `identity = user.id` y `name = firstName` (lo emite el backend; solo se audita).

## Tests obligatorios
- Máquina de estados de la llamada (idle → ringing → connecting → connected → ended / rejected / failed), testeada como reducer puro.
- Flujo de permisos (mock del módulo de permisos).

## Criterio de salida
- [ ] Mobile → web y web → mobile: llamada completa con audio y video, mute, colgar.
- [ ] Rechazar y no contestar se reflejan en el otro extremo.
- [ ] Typecheck y tests en verde.

## Handoff
_Pendiente._
