# 🤖 Instructions for Google Jules & Autonomous Coding Agents (VetConnect)

> **Repository:** VetConnect — Veterinary Telemedicine Monorepo (Node.js 20, Express 5, Prisma 6, React 19, React Native Expo SDK 54).  
> **Objective:** Act as an autonomous, FAANG-standard software engineer capable of taking backlog task packets, planning, implementing, writing tests, verifying, and opening clean PRs.

---

## 🧭 1. Orchestration Protocol & Specialized Agent Roles

Before taking any task, read:
- **[`JULES_ORCHESTRATION.md`](../JULES_ORCHESTRATION.md)** — **PRIMARY REFERENCE:** Full orchestration protocol, 9 specialized agent roles, 5-phase Quirófano method, dependency sequence, and 20 GitHub Issues ready to assign.
- **[`protocolo-nueva-feature-v3.md`](../protocolo-nueva-feature-v3.md)** — The "Quirófano de Código" method for implementing any new feature (5 phases: Spec → Cerco → Anti-regression → Quirófano → Validation).

---

## 🗂️ 2. Sources of Truth (Read Before Writing Any Code)

| Document | Purpose |
|---|---|
| [`docs/TECH_REFERENCE.md`](../docs/TECH_REFERENCE.md) | **The Technical Bible:** Exact Prisma schema, REST endpoints (§2.1–§2.6), Socket.io events (§3), Zod schemas. |
| [`docs/DECISIONS.md`](../docs/DECISIONS.md) | **24 ADRs** (ADR-001 to ADR-024) governing all architectural decisions. |
| [`docs/SPEC.md`](../docs/SPEC.md) | Business logic, FSM states (§3.3), roles, consultation lifecycle, and timeout rules. |
| [`AGENTS.md`](../AGENTS.md) | Coding standards, anti-patterns (NO USO 1–5), and layer-by-layer rules. |
| [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md) | **Master backlog:** 20 Task Packets (TASK-0.1 to TASK-7.2) with exact file lists and acceptance criteria. |

---

## ⚡ 3. Autonomous Execution Protocol (5 Phases)

For every Task Packet, apply the Quirófano de Código protocol:

### Phase 1 — Specification & Layer Mapping
- Read the Task Packet. Identify Given/When/Then.
- Consult `docs/TECH_REFERENCE.md` and `docs/DECISIONS.md` before writing anything.
- **DO NOT invent** endpoint paths, column names, or socket events. Use exact contracts.

### Phase 2 — Security Fence (Plan Mode, Cerco de Seguridad)
Before writing code, generate a structured plan:
1. FILES TO CREATE: exact list.
2. FILES TO MODIFY: strict list.
3. FILES OUT OF SCOPE: do not touch under any circumstance.
4. RISK ASSESSMENT: which existing modules connect to this task.
5. ATOMIC STEPS: ordered implementation sequence.

Wait for Orchestrator approval before proceeding.

### Phase 3 — Anti-Regression Shield
- Grep cross-references to identify existing consumers.
- All additions must be additive (new endpoints, optional params). Never break existing contracts.

### Phase 4 — Quirófano (Minimal Implementation on Dedicated Branch)
- Branch: `feat/task-X.Y-description` (e.g., `feat/task-2.2-auth-jwt`).
- Build only what's specified. NO refactoring of neighboring modules.
- **TDD first:** Test must exist and fail (red) before implementing logic (green).
- Self-Correction Loop: Fix `tsc --noEmit` errors iteratively before escalating.

### Phase 5 — Validation & Pull Request
```bash
cd backend && npx prisma validate   # If touching database
npm run typecheck                   # 0 errors across all workspaces
npm test                            # 100% passing
npm run build                       # No compilation errors
```

PR format:
- Title: `feat(task-X.Y): <brief description>`
- Body: Acceptance criteria met + terminal output of passing tests.
- Link to Task Packet in `PLAN_ACCION_VETCONNECT.md`.

---

## 🔑 4. Canonical Socket.io Events (Immutable)

| Event | Direction | Description |
|---|---|---|
| `join:consultation` | Client → Server | Join consultation chat room |
| `message:send` | Client → Server | Send message (idempotent via `clientMsgId`) |
| `message:new` | Server → Room | **Broadcast** new message to both participants |
| `call:incoming` | Server → User | Incoming video call alert |
| `call:answered` | Client → Server | Call answered |
| `call:rejected` | Client → Server | Call rejected |
| `prescription:new` | Server → Room | New prescription emitted |

> ⚠️ **`message:received` DOES NOT EXIST.** The canonical event is `message:new`.

---

## 🔐 5. Auth Strategy: Dual Web / Mobile (ADR-004)

- **Web SPA (no `X-Client-Platform` header):** Refresh Token in `HttpOnly; Secure; SameSite=Strict` cookie only. Access Token in JSON body.
- **Mobile App (`X-Client-Platform: mobile` header):** Refresh Token **also** in JSON body `{ accessToken, refreshToken, user }`. App persists it in `expo-secure-store`. Mobile calls `POST /api/auth/refresh` with body `{ refreshToken }`.

---

## 🛑 6. Safety Guardrails

1. **NEVER read, edit, or commit `.env` files.** Only update `.env.example`.
2. **NEVER execute destructive Git operations** (`git push --force`, `filter-repo`, history purge).
3. **NEVER execute physical database deletes.** Always use soft-deletes with `deletedAt = new Date()`.
4. **NEVER expose PII** in public endpoints or LiveKit tokens. Use `identity: user.id`, `name: user.firstName`.
5. **NEVER serve `/uploads` as static public.** Use authenticated `GET /api/media/:id` endpoint only.
6. **NEVER emit `message:received`.** Use `message:new` exclusively.
7. **NEVER add `<RoomAudioRenderer />` alongside `<VideoConference />`** — causes audio echo.

---

## 📐 7. Definition of Done (DoD) Checklist

Before opening any PR, confirm ALL of these:

- [ ] Security Fence respected: only listed files touched.
- [ ] Contract-faithful: no endpoint/event/field differs from `docs/TECH_REFERENCE.md`.
- [ ] Binding ADR cited in code comments and PR.
- [ ] TDD: test was red before implementation turned it green.
- [ ] Coverage >80% for the implemented module.
- [ ] Typecheck: 0 errors across all 3 workspaces.
- [ ] RFC 7807 on all backend errors `{ success: false, error: { code, message, timestamp } }`.
- [ ] Zero `any` in TypeScript.
- [ ] All multi-word DB columns have `@map("snake_case")`.
- [ ] No PII in LiveKit tokens: `identity: user.id`.
- [ ] No physical deletes: `deletedAt` only.
- [ ] Conventional Commits: `feat(auth): ...` / `fix(chat): ...`
- [ ] Descriptive PR with task ID + test output.
