# 📱 VetConnect Mobile Docs — Índice Maestro (v2.0)

> **SSOT (ADR-025):** Nivel 1 `backend/prisma/schema.prisma` + `backend/src/modules/` > Nivel 2 `docs/TECH_REFERENCE.md` + `docs/mobile/AGENT_CODING_SPEC_MOBILE.md` > Nivel 3 `ARCHITECTURE`/`DECISIONS` > Nivel 4 wireframes/narrativa. Ante conflicto, vale el nivel superior. Prohibido inventar endpoints/campos desde Nivel 4.

## Mapa (todo lo anterior: contratos + spec + réplica web adaptada)

| Archivo | Nivel | Propósito |
|---|---|---|
| `AGENT_CODING_SPEC_MOBILE.md` | 2 | Contrato canónico ejecutable mobile (stack, auth, router, sockets, LiveKit, guardrails) |
| `01_TECH_REFERENCE_MOBILE.md` | 2 | Endpoints/sockets/modelos reales consumidos por mobile, con códigos reales |
| `00_AUDITORIA_ESTADO_REAL_MOBILE.md` | — | Foto real SDK 52 vs baseline exigido SDK 54, brechas verificadas `archivo:línea` |
| `02_ARQUITECTURA_NAVEGACION.md` | 3 | Expo Router real + guards TODO + deep-links + offline |
| `03_DCU_Y_UX_MOBILE.md` | 4 | Réplica ligera web 01-04: arquetipos, journeys, 5 estados UI obligatorios |
| `04_SISTEMA_DISENO_MOBILE.md` | 4 | Tokens → StyleSheet actual → migración NativeWind v4 |
| `05_LIVEKIT_MOBILE_BRIDGE.md` | 2/3 | Bridge WebView + PiP/BottomSheet + `facingMode:environment` (ADR-012) |
| `06_QA_PERFORMANCE_SEGURIDAD.md` | 3 | EAS tripartita, ADB reverse, TestSprite, PII cero, cuotas |
| `DEUDA_CODIGO_Y_UPGRADE_SDK54.md` | — | Deuda backend/docs marcada (no corregida) + checklist upgrade SDK 54 |

## Qué NO heredar (inconsistencias neutralizadas)

1. **ADRs = 25** (`docs/DECISIONS.md:3`). Ignorar `AGENTS.md §1.1`=24 y `RECONCILIACION`=24.
2. **Mensajes solo Socket** (`TECH_REFERENCE.md:138,216`). Ignorar `SPEC.md:320` `POST /:id/messages` — no existe en `consultations.routes.ts:11-18`.
3. **Sin TanStack en mobile.** `TECH §2.9`/ADR-015 describen web; mobile usa `zustand` (`src/lib/authStore.ts:1`) + `axios+failedQueue` (`src/lib/api.ts:17-97`). No instalar `@tanstack/react-query`.
4. **FSM 4 estados** `WAITING/ACTIVE/COMPLETED/CANCELLED` (`schema.prisma:22-27`). Ignorar `SISTEMA_DE_DISENO §1.2` `PENDING/IN_PROGRESS`.
5. **SameSite `lax` dev / `none;Secure` prod** (ADR-004). Ignorar `FRONTEND_ARCH: strict`.
6. **Tests 123 baseline web** (`docs/web/README`), no 129 del `DOSSIER`. Mobile: 7 suites en `src/__tests__/`.
7. **`FavoriteVet`, `calendar.ics`, `VetDrive`, vacunación/alarmas, `raza=otros`, fallecimiento** son v2.1+ (`MINUTA 2026-09`, `SPEC:479-491`). No existen en schema. No implementar.
8. **Links muertos** `PLAN_ACCION_VETCONNECT.md`, `AI_TECHLEAD_BRIEF.md` — no replicar.
9. **Códigos reales** `INVALID_CONSULTATION_STATE` + `NOT_CONSULTATION_PARTICIPANT` (`calls.service.ts:60,98,105`), no `INVALID_STATE/FORBIDDEN` de `TECH:158`.
10. **`GET /notifications` = `take:50` fijo** (`notifications.service.ts:23-29`), sin `skip`. **`GET /media/:id` = `302 redirect` TTL 300s** (`media.controller.ts:28-29`), no JSON.

## Baseline exigido — IMPLEMENTADO 2026-09-24 ✅

* React **19.1.0** en mobile (excepción: SDK 54/RN 0.81 lo requieren; web sigue 18.3.1) — ver `00_*`.
* Expo **SDK 54 + Router ~6 + RN ~0.81 + NativeWind v4** ✅ (instalado y verificado con `expo export`).
* Auth dual: web cookie `HttpOnly`, mobile `X-Client-Platform: mobile` + `expo-secure-store` (`api.ts:9-14`, `authStore.ts:62-63`).

## Verificación

```powershell
npx prisma validate --schema=backend/prisma/schema.prisma
npm run typecheck --workspaces
npm test --workspaces
```
