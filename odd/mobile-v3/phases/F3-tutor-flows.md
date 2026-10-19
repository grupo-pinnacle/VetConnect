# F3 — Flujos del tutor

> **Objetivo:** las features del tutor como slices verticales (api → hooks → componentes → ruta).
> Recomendado partir en **F3a (mascotas + perfil)** y **F3b (consultas + recetas + reseñas)**, cada una en su propio chat.

## Definition of Ready
- [ ] F2 `HECHA`.

## Lecturas
- F3a: `backend/src/modules/pets/*.routes.ts`, `*.schemas.ts`; `backend/src/modules/users/users.routes.ts`; `backend/src/modules/media/media.routes.ts` (foto de perfil y de mascota); modelo `Pet` y `User` en `backend/prisma/schema.prisma`
- F3b: `backend/src/modules/consultations/*.routes.ts`, `*.schemas.ts`, `clinicalTriage.engine.ts`; `backend/src/modules/prescriptions/*.routes.ts`; modelos `Consultation`, `Prescription`, `Review`
- Legado reutilizable tras auditarlo: `mobile-legacy/src/validation/*`, `mobile-legacy/src/lib/triage.ts`

## Tareas F3a — Mascotas y perfil
1. `features/pets`: lista, detalle, alta y edición con **todos** los campos del schema (incluidos sex, allergies, chronicConditions), especie en el formato que espera el backend y baja lógica.
2. `features/profile`: datos, foto con `expo-image-picker` → media, logout.
3. Estados vacíos honestos (tutor sin mascotas → bienvenida + CTA).

## Tareas F3b — Consultas
1. Nueva consulta: selección de mascota → intake guiado → triage (ROJO/AMARILLO/VERDE) → `POST /api/consultations`. Branch `ACTIVE → chat` / `WAITING → detalle`.
2. Historial con filtros por estado y cancelación con motivo.
3. Detalle: renderizar `prescriptions[]` y `review`; ocultar "Calificar" si ya existe una reseña.
4. Receta: nombre del paciente, QR y `Share` con identificación.
5. Reseña 1–5 con el componente `RatingStars` de F1.

## Reglas
- Query keys centralizados por feature (`petsKeys`, `consultationsKeys`). Las mutaciones invalidan de forma explícita.
- Todos los formularios con zod + `FormField`. Cero `Alert.alert` para errores de datos: usar `ScreenState` o el error inline.

## Criterio de salida
- [ ] Cada slice con test de hook (API mockeada) y test de render de su pantalla principal.
- [ ] Flujo completo en el dispositivo: crear mascota → crear consulta → verla en el historial → (con un vet desde la web) completar → ver la receta → calificar.
- [ ] Typecheck y tests en verde, cero `any`.

## Handoff
_Pendiente._
