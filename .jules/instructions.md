# 🤖 Instructions for Google Jules & Autonomous Coding Agents (VetConnect)

> **Repository:** VetConnect — Veterinary Telemedicine Monorepo (Node.js 20, Express 5, Prisma 6, React 19, React Native Expo SDK 54).
> **Objective:** Act as an autonomous, FAANG-standard software engineer capable of taking backlog task packets, planning, implementing, writing tests, verifying, and opening clean PRs.

---

## 🧭 1. Core Architecture & Sources of Truth

Before modifying or creating any code, you MUST reference these documents:
- **Contracts & Database Models:** [`docs/TECH_REFERENCE.md`](../docs/TECH_REFERENCE.md) — Exact Prisma schema, REST endpoints, Socket.io events, and payload definitions.
- **Architectural Decisions:** [`docs/DECISIONS.md`](../docs/DECISIONS.md) — 21 ADRs governing monorepo architecture, auth, realtime, and storage.
- **System Specifications:** [`docs/SPEC.md`](../docs/SPEC.md) — Functional business logic, roles (`CLIENT`, `VET`, `ADMIN`), and consultation lifecycles.
- **Agent Operating Guidelines:** [`AGENTS.md`](../AGENTS.md) — Coding standards, anti-patterns, and layer-by-layer instructions.
- **Task Backlog:** [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md) — Master backlog organized in discrete Task Packets (F0 to F7).

---

## ⚡ 2. Autonomous Execution Protocol

When assigned a task or issue:

### Step 1: Context & Contract Discovery
- Identify the affected layer (`backend/`, `web/`, or `mobile/`).
- Inspect existing files and interfaces using directory listings and file readers.
- DO NOT invent new endpoint paths, database column names, or socket events. Strictly follow [`docs/TECH_REFERENCE.md`](../docs/TECH_REFERENCE.md).

### Step 2: Test-Driven Development (TDD)
- Write unit or integration tests in Jest / Vitest BEFORE or alongside your implementation.
- Tests must be realistic: assert status codes, response payloads, database state, or error codes.
- Target coverage: >80% for backend services and controllers.

### Step 3: Implementation & Clean Code
- **Backend:** Express 5 + TypeScript + Prisma 6 + Zod.
  - All multi-word database columns MUST use `@map("snake_case")`.
  - All endpoints MUST validate input with Zod schemas.
  - Return standardized RFC 7807 errors on failure (`{ success: false, error: { code, message, timestamp } }`).
  - Use atomic operations / transactions for data updates.
- **Frontend / Mobile:** React 19 / React Native Expo.
  - Zero `any` types (explicit TypeScript interfaces).
  - Proper handling of loading, error, empty, and reconnecting states.

### Step 4: Self-Verification (Mandatory Before Opening PR)
Run these commands locally in your environment and ensure all pass with 0 errors:
```bash
# 1. Validate Prisma schema (if touching database)
cd backend && npx prisma validate

# 2. Typecheck across workspaces
npm run typecheck

# 3. Execute test suite
npm test
```

### Step 5: Pull Request Generation
- Branch name format: `feat/<feature-name>`, `fix/<issue-name>`, `test/<area>`.
- Commit message: Conventional Commits (e.g., `feat(auth): implement tokenVersion rotation and session revocation`).
- PR description must include:
  1. Summary of changes made.
  2. Related task ID from [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md).
  3. Verification output (paste terminal output of passing tests).

---

## 🛑 3. Safety Guardrails

1. **NEVER read, edit, or commit `.env` files.** Only update `.env.example` when adding new configuration keys.
2. **NEVER execute destructive Git operations** (`git filter-repo`, `git push --force`, history purge).
3. **NEVER execute physical database deletes (`DELETE`).** Always use soft-deletes with `deletedAt = new Date()`.
4. **NEVER expose PII** (emails, phone numbers) in public endpoints or LiveKit access tokens. Use opaque IDs and public display names.
