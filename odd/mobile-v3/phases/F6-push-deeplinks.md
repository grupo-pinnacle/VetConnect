# F6 — Notificaciones push y deep links

> **Objetivo:** que cada push llegue y que, al tocarla, abra la pantalla correcta incluso con la app cerrada.

## Definition of Ready
- [ ] F5 `HECHA`.
- [ ] Inventario de eventos de push de F0 (Handoff F0, "Hallazgos para F6").

## Lecturas
- `odd/mobile-v3/phases/F0-spikes.md` → Handoff
- `backend/src/modules/notifications/*`
- Modelo `Notification` en `schema.prisma`

## Tareas
1. `features/notifications`: después del login → permiso → `getExpoPushTokenAsync` → `POST /api/notifications/register-token`. Re-registrar si el token cambia. Al hacer logout, desasociar (si el backend lo soporta; si no, anotar como hallazgo de backend).
2. Canal Android de alta prioridad para llamadas y otro para el resto.
3. Handlers: primer plano (banner interno), tap con la app abierta o en segundo plano, y **cold start** (`getLastNotificationResponseAsync`).
4. Deep links `vetconnect://consultation/:id`, `…/chat/:id`, `…/call/:id`, resueltos con Expo Router. Validar que el usuario tenga sesión antes de navegar (si no, guardar el destino y aplicarlo después del login).
5. Bandeja de alertas: lista, marcar como leída y marcar todas (`PATCH /read-all`, `PATCH /:id/read`), badge de no leídas.
6. **Backend (solo si F0 encontró huecos):** agregar las llamadas a `notifications.service` en los eventos que falten, con test. Sin PII en el payload de push.

## Criterio de salida
- [ ] Con la app cerrada: push "consulta aceptada" → tap → abre esa consulta.
- [ ] Push de llamada entrante → tap → pantalla de llamada entrante.
- [ ] Bandeja sincronizada con el backend. Typecheck y tests en verde.

## Handoff
_Pendiente._
