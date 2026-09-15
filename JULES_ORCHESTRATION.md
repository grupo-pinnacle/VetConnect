# 🤖 JULES_ORCHESTRATION.md — Protocolo Maestro de Orquestación Multi-Agente (VetConnect)

> **Destinatario Principal:** Google Jules (IA autónoma 24/7) y cualquier agente de IA orquestador.  
> **Propósito:** Documento operativo supremo para la construcción autónoma completa del monorepo VetConnect desde cero (Greenfield), usando el **Método del Quirófano de Código** adaptado a una arquitectura de agentes especializados.  
> **Estado:** 🟢 APROBADO — Listo para ejecución autónoma desde el 01-Oct-2026 (Hito M0).

---

## 🗺️ 1. Arquitectura de Agentes Especializados (Roles & Responsabilidades)

Jules trabaja con **9 agentes especializados** que operan en coordinación. Cada agente tiene un dominio exclusivo, trabaja en una rama Git dedicada y reporta al agente **Orchestrator** antes de mergear a `main`.

| Agente | Task Packets | Rama Git | Verificación |
|---|---|---|---|
| **Orchestrator (Tech Lead)** | Todos (supervisión) | `main` | Aprobación de PRs |
| **Scaffolding Agent** | TASK-0.1, TASK-0.2 | `feat/scaffolding` | `npm run docker:up` |
| **Database Agent** | TASK-1.1, TASK-1.2 | `feat/database` | `npx prisma validate && npx prisma db push` |
| **Backend REST Agent** | TASK-2.1 – TASK-2.5 | `feat/backend-api` | `npm test -w backend` |
| **Realtime Agent** | TASK-3.1, TASK-3.2 | `feat/realtime` | `npm test -w backend -- -t "realtime"` |
| **Media & Video Agent** | TASK-4.1, TASK-4.2 | `feat/media-video` | `npm test -w backend -- -t "media"` |
| **Web Frontend Agent** | TASK-5.1, TASK-5.2 | `feat/web-frontend` | `npm run build -w web && npm test -w web` |
| **Mobile Agent** | TASK-6.1 – TASK-6.3 | `feat/mobile` | `npm run typecheck -w mobile` |
| **QA & CI Agent** | TASK-7.1, TASK-7.2 | `feat/qa-ci` | `npm test --workspaces && npm run typecheck` |
| **Debugger Agent** | Cualquier fallo | `fix/<area>-<issue>` | `npm test -- --verbose` |

---

## 🔄 2. Protocolo de 5 Fases por Task Packet (Método del Quirófano)

Basado en `protocolo-nueva-feature-v3.md`. Cada agente aplica este protocolo para **cada Task Packet** que tome.

### FASE 1 — Especificación & Mapeo de Capas
1. Leer el Task Packet en `PLAN_ACCION_VETCONNECT.md`.
2. Consultar contratos en `docs/TECH_REFERENCE.md` y `docs/DECISIONS.md`.
3. Formular el escenario BDD: **Given / When / Then**.
4. Aislar las capas involucradas: `backend/`, `web/`, `mobile/`, o raíz.

### FASE 2 — El Cerco de Seguridad (Plan Mode)
El agente produce un micro-plan antes de tocar código:
1. **ARCHIVOS A CREAR:** Lista exacta de archivos nuevos.
2. **ARCHIVOS A MODIFICAR:** Lista estricta de archivos a extender.
3. **ARCHIVOS FUERA DEL ALCANCE:** Qué no tocar bajo ninguna circunstancia.
4. **EVALUACIÓN DE RIESGOS:** Módulos vecinos conectados al task.
5. **SECUENCIA ATÓMICA:** Pasos en orden de dependencia.

El Orchestrator revisa y aprueba el cerco antes de que el agente empiece a escribir código.

### FASE 3 — Blindaje Anti-Regresiones
- Grep de referencias cruzadas para identificar consumidores existentes.
- Preservación de firmas de funciones y contratos Zod previos.
- Cero modificaciones a archivos fuera del cerco.

### FASE 4 — El Quirófano (Implementación Minimal en Rama Dedicada)
Reglas de oro:
- Rama dedicada: `feat/<task-id>-<description>` (ej. `feat/task-2.2-auth-jwt`).
- Solo lo especificado en el Task Packet. Prohibido refactorizar módulos vecinos.
- TDD primero: El test existe y falla (rojo) antes de la lógica de negocio.
- Self-Correction Loop: Si `tsc --noEmit` falla, el agente corrige iterativamente.

### FASE 5 — Validación & PR
El agente NO da por terminada la tarea hasta ejecutar:
```bash
cd backend && npx prisma validate   # Si toca BD
npm run typecheck                   # 0 errores en las 3 capas
npm test                            # 100% en verde
npm run build                       # Sin errores de compilación
```

PR con: Título `feat(task-X.Y): descripción`, criterio de aceptación cumplido + output de tests.

---

## 📋 3. Secuencia de Ejecución (Orden de Dependencias)

```
F0: Scaffolding Agent
  TASK-0.1 → TASK-0.2
      │
F1: Database Agent (requiere F0 verde)
  TASK-1.1 → TASK-1.2
      │
F2: Backend REST Agent (requiere F1 verde)
  TASK-2.1 → TASK-2.2 → TASK-2.3 → TASK-2.4 → TASK-2.5
      │
F3: Realtime Agent (requiere F2 verde)
  TASK-3.1 → TASK-3.2
      │
F4: Media & Video Agent (requiere F3 verde)
  TASK-4.1 → TASK-4.2
      │
F5 & F6 (paralelo permitido tras F4 verde):
  Web Frontend Agent:    TASK-5.1 → TASK-5.2
  Mobile Agent:          TASK-6.1 → TASK-6.2 → TASK-6.3
      │
F7: QA & CI Agent (requiere F5 + F6 verde)
  TASK-7.1 → TASK-7.2
```

---

## 🛡️ 4. Contratos Inamovibles (Fuentes de Verdad)

Jules NUNCA inventa nombres de endpoints, campos de BD, ni eventos Socket. Siempre consulta:

| Contrato | Documento | Sección |
|---|---|---|
| Endpoints REST | `docs/TECH_REFERENCE.md` | §2.1 – §2.6 |
| Eventos Socket.io | `docs/TECH_REFERENCE.md` | §3 |
| Modelos Prisma | `docs/TECH_REFERENCE.md` | §1.1 |
| FSM de Consultas | `docs/SPEC.md` | §3.3 |
| 24 ADRs | `docs/DECISIONS.md` | ADR-001 al ADR-024 |
| Antipatrones | `AGENTS.md` | §5 (NO USO 1–5) |
| Task Packets | `PLAN_ACCION_VETCONNECT.md` | TASK-0.1 a TASK-7.2 |

---

## 🔑 5. Eventos Socket.io Canónicos (Referencia Inmutable)

| Evento | Dirección | Descripción |
|---|---|---|
| `join:consultation` | Cliente → Server | Unirse a sala de chat |
| `message:send` | Cliente → Server | Enviar mensaje (idempotente con `clientMsgId`) |
| `message:new` | Server → Sala | **Broadcast** de mensaje a ambos participantes |
| `call:incoming` | Server → Usuario | Alerta de videollamada entrante |
| `call:answered` | Cliente → Server | Llamada atendida |
| `call:rejected` | Cliente → Server | Llamada rechazada |
| `prescription:new` | Server → Sala | Nueva receta emitida |

> ⚠️ **`message:received` NO EXISTE.** El evento canónico es `message:new`.

---

## 🔐 6. Guardarraíles Absolutos para Jules

Jules interrumpe la tarea y escala al humano si:

| Guardarrail | Condición |
|---|---|
| **Secretos** | Petición de leer/editar/exponer `.env` |
| **Git destructivo** | Uso de `--force`, `filter-repo`, purge |
| **Borrado físico** | `DELETE` en Prisma sobre datos clínicos (usar `deletedAt`) |
| **PII en tokens** | Email/teléfono en tokens LiveKit o logs |
| **Fuera del cerco** | Modificar archivos no listados en FASE 2 |
| **Tests rojos** | `npm test` falla al cerrar un Task Packet |

---

## 📐 7. Checklist DoD (Definition of Done) por Task Packet

- [ ] Cerco Respetado: Solo archivos listados en FASE 2 tocados.
- [ ] Contrato Fiel: Ningún endpoint/evento/campo difiere de `docs/TECH_REFERENCE.md`.
- [ ] ADR Vinculante Citado en el código/PR.
- [ ] Test Primero: Test existió en rojo antes de implementar.
- [ ] Cobertura >80% en el módulo.
- [ ] Typecheck 0 errores en las 3 capas.
- [ ] RFC 7807 en todos los errores backend.
- [ ] Cero `any` en TypeScript.
- [ ] Snake_case en todas las columnas multi-palabra BD.
- [ ] Cero PII en tokens LiveKit (`identity: user.id`).
- [ ] Soft-delete: Ningún `.delete()` físico en datos clínicos.
- [ ] Conventional Commit: `feat(auth): ...` / `fix(chat): ...`
- [ ] PR descriptivo con task ID + output de tests.

---

## 🐛 8. Protocolo del Debugger Agent

Se activa cuando un agente reporta tests rojos insolubles, CI falla, o hay regresión post-merge.

**Flujo:**
1. **Aislar:** `npm test -- -t "<suite>"`
2. **Reproducir:** Confirmar fallo determinista.
3. **Trazar:** Prisma logs, Socket.io debug, console.error.
4. **Cerco de Fix:** Cerco mínimo solo para la corrección.
5. **Self-Correction Loop:** Corregir hasta `npm test` 100%.
6. **Rama:** `fix/<área>-<descripción>` → PR al Orchestrator.

---

## 🚀 9. Issues de GitHub Listos para Jules (Label: `jules-task`)

```
#01 [TASK-0.1] Scaffolding: Monorepo npm workspaces + Docker Compose
    Agente: Scaffolding | Rama: feat/task-0.1-scaffolding
    Criterio: postgres y redis en estado healthy

#02 [TASK-0.2] Scripts DX: run.bat + start.ps1 + ADB reverse
    Agente: Scaffolding | Rama: feat/task-0.2-scripts-dx

#03 [TASK-1.1] Database: schema.prisma — 10 modelos canónicos + 2 de soporte + snake_case + índices
    Agente: Database | Rama: feat/task-1.1-prisma-schema
    Criterio: npx prisma validate sin warnings

#04 [TASK-1.2] Database: Migración inicial + Singleton + Seeds
    Agente: Database | Rama: feat/task-1.2-migration-seeds

#05 [TASK-2.1] Backend: Express 5 + Helmet + CORS + RFC 7807 + /health
    Agente: Backend REST | Rama: feat/task-2.1-express-server

#06 [TASK-2.2] Backend: Auth JWT + tokenVersion + RT Dual Web/Mobile
    Agente: Backend REST | Rama: feat/task-2.2-auth-jwt
    Criterio: Tests Web (cookie) y Mobile (body) en verde

#07 [TASK-2.3] Backend: CRUD Mascotas + microchip ISO + soft-delete
    Agente: Backend REST | Rama: feat/task-2.3-pets-crud

#08 [TASK-2.4] Backend: FSM Consultas (TTL 15min + gracia 3min + Review)
    Agente: Backend REST | Rama: feat/task-2.4-consultations-fsm
    Criterio: Tests de timeout de triage y ventana de gracia en verde

#09 [TASK-2.5] Backend: Recetas QR + firma profesional SENASA
    Agente: Backend REST | Rama: feat/task-2.5-prescriptions-qr

#10 [TASK-3.1] Realtime: Socket.io + Redis Adapter + auth handshake
    Agente: Realtime | Rama: feat/task-3.1-socketio-redis

#11 [TASK-3.2] Realtime: Chat idempotente clientMsgId + message:new broadcast
    Agente: Realtime | Rama: feat/task-3.2-chat-idempotent
    Criterio: Reintento con mismo clientMsgId retorna HTTP 200

#12 [TASK-4.1] Media & Calls: Tokens LiveKit SFU sin PII + POST ring timbrado
    Agente: Media & Video | Rama: feat/task-4.1-livekit-tokens-ring

#13 [TASK-4.2] Media: Upload Magic Bytes + GET /api/media/:id auth + Cuota 50MB (RNF-06)
    Agente: Media & Video | Rama: feat/task-4.2-media-secure
    Criterio: .exe rechazado 400; >10MB 413; >50MB 429; dueño 200; tercero 403

#14 [TASK-5.1] Web: Scaffolding React 19 + Vite + TanStack Query + routing
    Agente: Web Frontend | Rama: feat/task-5.1-web-scaffold

#15 [TASK-5.2] Web: CallRoom + PreJoin + VideoConference (sin RoomAudioRenderer duplicado)
    Agente: Web Frontend | Rama: feat/task-5.2-web-video-call

#16 [TASK-6.1] Mobile: Expo SDK 54 + expo-secure-store RT + offline sync
    Agente: Mobile | Rama: feat/task-6.1-mobile-scaffold
    Criterio: RT en secure store; sync incremental tras foreground

#17 [TASK-6.2] Mobile: WebView LiveKit + handshake page:ready
    Agente: Mobile | Rama: feat/task-6.2-mobile-webview

#18 [TASK-6.3] Mobile: Expo Push API + bandeja in-app
    Agente: Mobile | Rama: feat/task-6.3-push-notifications

#19 [TASK-7.1] QA: Suite 120+ tests Jest >80% cobertura
    Agente: QA & CI | Rama: feat/task-7.1-test-suite

#20 [TASK-7.2] CI/CD: Dockerfile multi-stage (USER node) + GitHub Actions
    Agente: QA & CI | Rama: feat/task-7.2-cicd-docker
```

---

## 📊 10. Dashboard de Progreso (Living — Actualizar al mergear PRs)

| Task | Agente | Estado | PR |
|---|---|---|---|
| TASK-0.1 | Scaffolding | ⬜ Pendiente | — |
| TASK-0.2 | Scaffolding | ⬜ Pendiente | — |
| TASK-1.1 | Database | ⬜ Pendiente | — |
| TASK-1.2 | Database | ⬜ Pendiente | — |
| TASK-2.1 | Backend REST | ⬜ Pendiente | — |
| TASK-2.2 | Backend REST | ⬜ Pendiente | — |
| TASK-2.3 | Backend REST | ⬜ Pendiente | — |
| TASK-2.4 | Backend REST | ⬜ Pendiente | — |
| TASK-2.5 | Backend REST | ⬜ Pendiente | — |
| TASK-3.1 | Realtime | ⬜ Pendiente | — |
| TASK-3.2 | Realtime | ⬜ Pendiente | — |
| TASK-4.1 | Media & Video | ⬜ Pendiente | — |
| TASK-4.2 | Media & Video | ⬜ Pendiente | — |
| TASK-5.1 | Web Frontend | ⬜ Pendiente | — |
| TASK-5.2 | Web Frontend | ⬜ Pendiente | — |
| TASK-6.1 | Mobile | ⬜ Pendiente | — |
| TASK-6.2 | Mobile | ⬜ Pendiente | — |
| TASK-6.3 | Mobile | ⬜ Pendiente | — |
| TASK-7.1 | QA & CI | ⬜ Pendiente | — |
| TASK-7.2 | QA & CI | ⬜ Pendiente | — |

---
*VetConnect — Jules Orchestration Protocol v1.0 — Greenfield 2026.*
