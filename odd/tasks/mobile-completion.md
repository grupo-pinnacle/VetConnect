# Feature: mobile-completion

> ODD feature document. Single source of task state for finishing the VetConnect mobile app
> plus the backend work that mobile notifications depend on.
> Debt IDs (D-*) and evidence live in `docs/mobile/03_ESTADO_Y_DEUDA_MOBILE.md`.

## Objective

Make the mobile app genuinely functional: every screen that exists works end to end, no dead
code paths, real test coverage on the risky modules, and the missing product surfaces present.

## Problem

The app is structurally complete but non-functional at three seams. Push notifications can never
arrive because the backend never creates `Notification` rows. The video call screen has a dead
permission branch and injects a function that does not exist in `web/`. Deep linking is declared
but never wired. Beyond that, 30 verified debt items, ~11 of 29 tests providing no regression
protection, and five test suites asserting on literals defined inside the test file.

## Why now

The user requested completion of the mobile app and authorized backend changes (overriding the
standing "backend/docs not touched" policy for this feature only).

## Scope

Authorized: `mobile/**`, plus the minimum `backend/**` needed for notification creation, Expo push
dispatch, and the prescription authorization/signature gap.

Out of scope: web redesign, any v2.1+ field (`FavoriteVet`, `VaccinationRecord`, …), refactors
unrelated to the debt list.

## Constraints

- Zero `any`. Unknown + Zod only.
- Soft deletes only (`deletedAt`). Never `prisma.*.delete()`.
- Zero PII in LiveKit tokens, audit logs, or push payloads.
- RFC 7807 error envelope on all new backend responses.
- Mobile uses `zustand` + `axios`. Never `@tanstack/react-query`.
- No LiveKit native SDK in mobile — WebView bridge only.
- No hardcoded metrics or KPIs in UI.
- Verification gate for every work unit: `npm run typecheck -w mobile` AND `npm test -w mobile` green.

## Delivery strategy

`ask-on-risk` resolved to **single-PR, all phases** by explicit user selection of Fases 1-6.
Budget advisory: ~400 authored changed lines per work unit; the 400-line PR review budget applies
at delivery time and is the user's call.

## TDD mode

**Off** (source: no project/session TDD configuration found; user did not request strict TDD).
Ordinary functional checks apply: typecheck + jest after every work unit. New tests are written
alongside the behavior they cover, not as a separate ceremony.

---

## Tasks

### Phase 1 — Unblock what already exists

- [ ] **WU1** Session expiry (D-07). On refresh failure clear `useAuthStore` and navigate to
      `/(auth)/login`. Reset `isRefreshing`/`failedQueue` on logout.
      *Check:* typecheck + test green; new test asserts store cleared on refresh rejection.
- [ ] **WU2** Chat sync + socket leak (D-05, D-06). Consume the
      `syncIncrementalMessages()` result instead of discarding it; do not advance the watermark
      when the fetch fails. Disconnect the socket manager on unmount.
      *Check:* typecheck + test green; new test asserts failed sync leaves watermark unchanged.
- [ ] **WU3** Deep linking (D-02). Wire `expo-linking`, add `+not-found.tsx`, honor
      `vetconnect://call/:id`, `://consultation/:id`, `://prescriptions/:id` while preserving the
      SecureStore session.
      *Check:* typecheck + test green.
- [ ] **WU4** Push wiring, mobile half (D-01). Invoke `registerPushToken()` and install
      `setupNotificationListeners()` from the root layout. Validate `Platform.OS` against the
      closed `ios|android|web` enum before sending.
      *Check:* typecheck + test green; test asserts invalid platform is not posted.
- [ ] **WU5** Call screen (D-03). Request real permissions via `expo-camera` so the denied branch is
      reachable; fix the token handshake with the embedded web client; remove the dead
      `initLiveKitCall` no-op or make it real on the web side; drop `catch (err: any)`.
      *Check:* typecheck + test green; no `any` remains in the file.

### Phase 2 — Call signalling

- [ ] **WU6** Ring + incoming call (D-04). `POST /calls/:id/ring`, incoming-call UI,
      `call:answered` / `call:rejected`, `call:ended` handling.
      *Check:* typecheck + test green.

### Phase 3 — Contract and state corrections

- [ ] **WU7** `/auth/me` envelope (D-08). Unwrap `data.user` in `users.service.refreshMe`; wire it
      or delete it.
      *Check:* typecheck + test green; test asserts the stored user is the `User`, not `{user}`.
- [ ] **WU8** Consultation detail completeness (D-09). Render `prescriptions[]` and `review`; add
      both to the `Consultation` type; hide the rating CTA once a review exists (removes a
      guaranteed 409).
      *Check:* typecheck + test green.
- [ ] **WU9** Media hardening (D-10). Enforce `MAX_FILE_BYTES` pre-flight; fix MIME resolution;
      stop stringifying the file id into `attachmentUrl` ambiguously.
      *Check:* typecheck + test green; test rejects >10MB before any network call.
- [ ] **WU10** Error unification + zero-any (D-15, D-16). Replace `Alert.alert` data errors with
      `ScreenState`; remove both `any` casts.
      *Check:* typecheck + test green; `grep -rn ": any" mobile/` returns nothing.

### Phase 4 — Real tests

- [ ] **WU11** Cover `src/lib/api.ts` 401 refresh + `failedQueue` single-flight (D-11).
      *Check:* new tests fail against the old code and pass against the new.
- [ ] **WU12** Cover `src/lib/socket.ts` (D-11).
- [ ] **WU13** Rewrite or delete the 5 suites that import no app code (D-14); fix
      `deepLinking.test.ts` to exercise real routing.
      *Check:* every remaining suite imports production code.

### Phase 5 — Product surfaces

- [ ] **WU14** Admin on mobile (D-22). Pending-vet queue, approve/reject with reason.
- [ ] **WU15** Role-aware tabs (D-24) + SENASA gate polling (D-23).
- [ ] **WU16** Notification pagination (D-27) and camera/PDF attachment (D-28).
- [ ] **WU17** Profile photo picker (D-25), full pet creation fields (D-26).
- [ ] **WU18** Global connectivity state (D-17), prescription patient name (D-30), biometrics
      (D-29), vet queue priority ordering (D-21), dead code removal (D-19), `useProfile` error
      contract (D-20).

### Phase 6 — Backend (authorized by user)

- [ ] **WU19** Create `Notification` rows and dispatch Expo push (D-01 backend half). Wire the
      events that should notify: call incoming, prescription issued, message. Idempotent, RFC 7807.
      *Check:* backend typecheck + its own tests green.
- [ ] **WU20** Prescription authorization/signature (D-B15). Either sign the prescription so the
      "OFICIAL FIRMADO SENASA" claim is true, or fix the UI copy and close the empty authorization
      block. Legal exposure — not shippable until resolved.
- [ ] **WU21** Notification pagination (D-B07). Add cursor/skip to the backend so >50 is reachable.

---

## Progress

| Phase | Status |
|---|---|
| 0. Docs consolidation | ✅ done — 10 files → 5, one owner each |
| 1. Unblock | 🔲 not started |
| 2. Call signalling | 🔲 not started |
| 3. Contracts | 🔲 not started |
| 4. Tests | 🔲 not started |
| 5. Product | 🔲 not started |
| 6. Backend | 🔲 not started |

## Verification evidence

Baseline before any source write (2026-09-28):
- `npm install` → 2043 packages (workspace had **no** `node_modules`).
- `npm run typecheck -w mobile` → **green**.
- `npm test -w mobile` → **11 suites / 29 tests green**.

## Next step

WU1 — session expiry handling.
