# 📱 DEUDA_CODIGO_Y_UPGRADE_SDK54 — Marcada, No Corregida (política usuario)

> Backend/docs generales no se tocan en esta fase. Mobile los documenta y hace workaround.

## A. Deuda backend vs docs (workaround mobile)

| ID | Divergencia | Evidencia | Workaround mobile |
|---|---|---|---|
| D-B01 | `POST /consultations` puede nacer `ACTIVE` directo | `consultations.service.ts:53-64` vs `TECH:131` | Tras crear, leer `status`; si `ACTIVE` ir a chat/call, si `WAITING` mostrar TTL |
| D-B02 | Códigos `INVALID_CONSULTATION_STATE` / `NOT_CONSULTATION_PARTICIPANT` | `calls.service.ts:60,98,105` vs `TECH:158` | Matchear códigos reales, no `INVALID_STATE/FORBIDDEN` |
| D-B03 | `GET /pets` ADMIN sin vista global; `GET /pets/:id` cualquier VET | `pets.service.ts:34-39,54-60` vs `TECH:122-126` | No asumir admin global; ocultar email/tel si `[REDACTED]` |
| D-B04 | `GET /mine` ADMIN vacío | `consultations.service.ts:281-314` | Admin mobile = solo propias |
| D-B05 | `reject { reason }` opcional con fallback | `admin.controller.ts:39` vs `TECH:146` | Enviar `reason` siempre aunque API lo tolere |
| D-B06 | `PATCH /profile` sin Zod; `priority` sin enum | `users.controller.ts:8-11`, `consultations.schemas.ts:3-6` | Validar cliente: bio ≤500, photoUrl https, prioridad en `notes` |
| D-B07 | `GET /notifications` sin `skip`, `take:50` fijo | `notifications.service.ts:23-29` vs `TECH:164` | Paginar en memoria, pull-to-refresh |
| D-B08 | `GET /media/:id` `302 redirect`, magic 8 hex | `media.controller.ts:28-29`, `media.middleware.ts:49-59` vs `TECH:171`, `SPEC:406` | Seguir redirects en `WebView`/`Image`; validar tipo+10MB antes de subir |
| D-B09 | `consultations` expone `email+phone` | `consultations.service.ts:12-24` vs `AGENTS §4.3` | No persistir/loggear PII; mostrar solo `firstName` |
| D-B10 | Sin anonimización `anon_` Ley 25.326 | `SPEC:372-377`, grep 0 hits | Baja = `deletedAt` + ticket manual; advertir en UX |
| D-B11 | `prescription:new` no emitido; `getById` muerto | `prescriptions.service.ts`, `controller.ts:29-43` | Polling `GET /prescriptions/:id` |
| D-B12 | `SPEC:320 POST messages`, `SPEC:106 FavoriteVet`, `SPEC:479-491` v2.1+ | vs schema/código | No implementar; cerrar como wontfix v2.0 |

## B. Deuda docs generales (no replicar)

Conteo ADRs 24 vs 25, `strict` vs `lax`, 129 vs 123 tests, `TS5.8` vs `5.7`, `PENDING/IN_PROGRESS` vs FSM, links `PLAN_ACCION/AI_TECHLEAD` muertos, `100% Greenfield` fosilizado. Vale §README.

## C. Upgrade SDK 52 → 54 — COMPLETADO 2026-09-24 ✅

1. ✅ `expo ~54.0.0` (54.0.37), `expo-router ~6.0.0` (6.0.24), `react-native 0.81.4`, `react 19.1.0`, `jest-expo ~54.0.0`, `expo-camera/image-picker ~17.0.0`, `react-native-reanimated` + `worklets` (SDK 54 vía `expo install`), `css-interop 0.2.7`, `"main": "expo-router/entry"`.
2. ✅ NativeWind v4: `tailwind.config.js`, `babel.config.js +nativewind/babel`, `metro.config.js withNativeWind`, `global.css`, `src/theme/tokens.ts`.
3. ✅ `(app)/_layout.tsx` (Tabs + guard rol/vetStatus) y `(auth)/_layout.tsx` (Stack), `app/index.tsx` redirect, tipado `any→unknown` + Zod.
4. ✅ Banner `reconnecting`, error UI con Reintentar, `syncIncrementalMessages` visible.
5. ✅ Verificado: `npm run typecheck` ✅, `npm test` (9 suites/21 tests) ✅, `expo export --platform android` ✅ (4.18 MB).
6. Hallazgos de build (monorepo) registrados en `metro.config.js` + `babel.config.js`: `blockList` copia única RN (root 0.76.7 stale + 0.87.1 anidada vetadas), `extraNodeModules` react/RN canónicos, plugin `expo-router-plugin` explícito (preset hoisted no detecta `expo-router` anidado), cast `WebView` 13.17 vía `unknown`.
