# F7 — Workspace del veterinario

> **Objetivo:** el veterinario trabaja desde mobile: disponibilidad, cola priorizada, toma de casos, chat, llamada y receta.

## Definition of Ready
- [ ] F6 `HECHA`.

## Lecturas
- `backend/src/modules/consultations/consultations.routes.ts` (cola, assign, complete)
- `backend/src/modules/prescriptions/*`
- `backend/src/modules/users/users.routes.ts` (online/offline, perfil del vet)
- Modelos `Consultation`, `Prescription`, `User` (`vetStatus`, `isOnline`)

## Tareas
1. Tabs propias de `(vet)`: Cola, Mis consultas, Alertas, Perfil.
2. Switch de disponibilidad (online/offline) con estado optimista y rollback.
3. Cola `WAITING` **ordenada por prioridad de triage y después por antigüedad** (si el backend no la ordena, se ordena en el cliente con `useMemo` y se anota como hallazgo de backend). Se refresca por socket o polling y con pull-to-refresh.
4. Tomar caso (`assign`) → chat/llamada. Completar consulta.
5. Emitir receta (formulario zod, según el schema de `Prescription`).
6. Perfil profesional: rating real o `—` + "Nuevo" si `ratingCount === 0`.

## Criterio de salida
- [ ] El vet toma un caso ROJO antes que uno VERDE más antiguo.
- [ ] Ciclo completo desde mobile: tomar → chatear → llamar → recetar → completar → el tutor ve la receta.
- [ ] Typecheck y tests en verde.

## Handoff
_Pendiente._
