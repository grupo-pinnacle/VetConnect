# 📱 VetConnect Mobile — Índice Maestro (SSOT)

> **Precedencia (ADR-025).** Nivel 1 `backend/prisma/schema.prisma` + `backend/src/modules/` → Nivel 2 `01_TECH_REFERENCE_MOBILE.md` + `AGENT_CODING_SPEC_MOBILE.md` → Nivel 3 `docs/ARCHITECTURE.md` + `docs/DECISIONS.md` → Nivel 4 narrativa web/wireframes.
> Ante conflicto **manda el nivel superior**. Prohibido inventar endpoints, campos o estados desde narrativa o wireframes.

## Mapa de documentos — cada archivo tiene UN dueño, cero solapamiento

| Archivo | Nivel | Dueño único de este contenido |
|---|---|---|
| `AGENT_CODING_SPEC_MOBILE.md` | 2 | **Contrato ejecutable de código**: stack, auth, router+guards, sockets, bridge LiveKit, 5 estados UI, tokens, guardrails |
| `01_TECH_REFERENCE_MOBILE.md` | 2 | **Contratos de backend consumidos** + tabla de deuda backend con su workaround mobile |
| `02_QA_DISTRIBUCION_Y_SEGURIDAD.md` | 3 | **Operación**: build EAS/local, distribución, QA, performance, seguridad y legal |
| `03_ESTADO_Y_DEUDA_MOBILE.md` | — | **Foto verificada del estado real** + registro de deuda + roadmap restante |

**Regla anti-ambigüedad:** si un dato aparece en dos de estos archivos, es un error. Cada tabla, endpoint o regla vive en exactamente un lugar.

## Qué NO heredar (inconsistencias neutralizadas a propósito)

Estas contradicciones existen en documentación general del repo. Mobile las ignora deliberadamente.

| # | Usar (verdad mobile) | Ignorar (contradicto) |
|---|---|---|
| 1 | **25 ADRs** (`docs/DECISIONS.md:3`) | `AGENTS.md §1.1`=24, `RECONCILIACION_*`=24, `PLAN_ACCION_*` |
| 2 | Mensajes **solo por socket** + `GET …/messages?after=` | `SPEC.md:320` `POST /:id/messages` — no existe en `consultations.routes.ts` |
| 3 | **Sin TanStack Query.** Estado con `zustand` + `axios` (`src/lib/authStore.ts`, `src/lib/api.ts`) | `TECH_REFERENCE §2.9` / ADR-015 (describen web) |
| 4 | FSM de 4 estados `WAITING/ACTIVE/COMPLETED/CANCELLED` (`schema.prisma:22-27`) | `SISTEMA_DE_DISENO §1.2` `PENDING/IN_PROGRESS` |
| 5 | Cookies `SameSite=lax` (dev) / `none;Secure` (prod) — **solo web** (ADR-004) | `FRONTEND_ARCHITECTURE.md` `strict` |
| 6 | Mobile: **11 suites / 29 tests** en `src/__tests__/` | Web: 123 baseline, no 129 del `DOSSIER` |
| 7 | Mobile: **React 19.1.0** (exigido por SDK 54 / RN 0.81) | Web: React 18.3.1 LTS (motivo: LiveKit nativo; mobile usa bridge WebView) |
| 8 | Códigos reales `INVALID_CONSULTATION_STATE` + `NOT_CONSULTATION_PARTICIPANT` (`calls.service.ts:60,98,105`) | `INVALID_STATE` / `FORBIDDEN` de `TECH_REFERENCE:158` |
| 9 | `GET /api/notifications` = `take:50` **fijo, sin cursor** (`notifications.service.ts:23-29`) | Documentación que prometa `take`+`skip` |
| 10 | `GET /api/media/:id` = **302 redirect** a presigned TTL 300s (`media.controller.ts:28-29`), no JSON | Contratos que esperen payload JSON |

### v2.1+ — NO EXISTEN, no implementar

`FavoriteVet` · `GET /pets/:id/calendar.ics` · `VaccinationRecord` · `MedicationSchedule` · `PetDocument` · `GET /consultations/pending` · campo `priority` con enum · `raza = otros` · baja de paciente por fallecimiento. Todas ausentes de `schema.prisma`. Cerradas como wontfix para v2.0 (`SPEC.md:479-491`, `docs/MINUTA_STAKEHOLDER_2026-09.md`).

## Verificación

```powershell
# Requiere `npm install` en la raíz del monorepo (workspaces)
npm run typecheck -w mobile          # tsc --noEmit, cero `any`
npm test -w mobile                   # jest, 11 suites / 29 tests
cd backend; npx prisma validate      # si se toca contrato de datos
```

> ⚠️ La cadena de build Android requiere JDK 21 + Android SDK/NDK y una **ruta sin tildes ni caracteres no-ASCII** (el toolchain NDK/clang y el embedder de Metro fallan con `ó` en la ruta). Detalle en `02_QA_DISTRIBUCION_Y_SEGURIDAD.md`.
