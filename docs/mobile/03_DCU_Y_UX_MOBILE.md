# 📱 03_DCU_Y_UX_MOBILE — Réplica Ligera Web 01-04 (Nivel 4)

> Narrativa supeditada a Nivel 1/2. Si un wireframe pide campo/endpoint inexistente, se descarta.

## Arquetipos

* **Tutor (CLIENT):** registra mascota (microchip 15 dígitos opt), abre triage `[Prioridad: ROJO|AMARILLO|VERDE]`, chatea, entra a video, ve receta QR, califica 1-5.
* **Vet (VET APPROVED):** guardia `isOnline`, toma `WAITING` FIFO, atiende, emite receta, cierra con `diagnosisNotes`. `PENDING` bloqueado (Sala Espera SENASA).
* **Admin:** fiscaliza en web; mobile solo lectura propia (sin vista global — deuda documentada).

## Journeys (pantallas mobile)

1. `register/login → initAuth → registerPushToken` (permiso + `POST register-token`).
2. `Home (index.tsx:47-93)`: mascotas horizontal + consultas vertical; empty `No tienes…`; tap consulta → `/call/:id` o `/chat/:id` según estado.
3. `consultation/new`: selector mascota + prioridad ROJO/AMARILLO/VERDE + notas → `POST /consultations`; si nace `ACTIVE` ir directo a chat/call, si `WAITING` mostrar TTL 15min + reintento.
4. `chat/[id]`: historial `GET messages`, envío `message:send clientMsgId mobile-…`, adjunto vía `POST /media` → `attachmentUrl`.
5. `call/[id]`: bridge (ver `05_*`), PiP para chatear sin colgar.
6. `prescriptions/[id]`: vista pública QR + farmacia; rating post-`COMPLETED`.

## 5 estados obligatorios por pantalla

`loading (skeleton/ActivityIndicator)`, `error (Alert + Reintentar + Volver — prohibido solo console.warn)`, `empty`, `success`, `reconnecting/offline` (hoy ausente — implementar con `socketManager` + `NetInfo` futuro).
Accesibilidad: touch ≥44pt, contraste 4.5:1, labels ES, `testID` existente (`call-loading-screen`, `call-room-view`).
