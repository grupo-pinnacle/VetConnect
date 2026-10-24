# F4 — Chat en tiempo real

> **Objetivo:** un chat que **nunca pierde mensajes**, ni al cortarse la red ni al volver de segundo plano.

## Definition of Ready
- [ ] F3 `HECHA` (o al menos F3b).

## Lecturas
- `backend/src/realtime/gateways/chat.gateway.ts`, `socket.types.ts`
- `backend/src/modules/consultations/consultations.routes.ts` (solo `GET …/messages?after=`)
- `backend/src/modules/media/*` (upload, magic bytes, límites, 302 en `GET /api/media/:id`)
- Modelos `Message` y `MediaFile` en `schema.prisma`

## Tareas
1. `features/chat`: `join:consultation` al montar, `leave` + limpieza de listeners al desmontar.
2. Envío optimista con `clientMsgId` (uuid). Estados del mensaje: enviando / enviado / fallido + reintentar. Un reintento con el mismo `clientMsgId` no duplica.
3. Resync: al reconectar o volver a primer plano → `GET …/messages?after=<último confirmado>`. El watermark **solo avanza cuando el merge se aplicó**.
4. Adjuntos: cámara, galería y PDF (`expo-document-picker`). Validar tamaño y MIME **antes** de subir, con el MIME real (no por extensión). Vista previa de imagen; el PDF se abre con el visor del sistema.
5. Lista invertida virtualizada, separadores por día, indicador de offline.

## Tests obligatorios
- Merge de mensajes: dedupe por id/`clientMsgId`, orden estable.
- El watermark no avanza si el fetch falla.
- Validación de adjuntos (tamaño y MIME).

## Criterio de salida
- [ ] Prueba manual: modo avión 30 s mientras el vet escribe desde la web → al reconectar aparecen todos los mensajes, sin duplicados.
- [ ] Typecheck y tests en verde.

## Handoff
_Pendiente._
