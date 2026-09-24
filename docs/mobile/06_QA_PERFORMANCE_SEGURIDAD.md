# 📱 06_QA_PERFORMANCE_SEGURIDAD — EAS + ADB + TestSprite + PII Cero

## Distribución (ADR-018) + dev (ADR-016)

* `eas.json`: `development` (client + `apk` interno), `preview` (`apk` sideload clínicas beta), `production` (`app-bundle` Play Store). Comandos `mobile/package.json:10-11` `build:apk/bundle`. Contingencia: APK desde web oficial, nunca Play como único canal en beta.
* Dev corporativo: `adb reverse tcp:3001 tcp:3001` (+ `5173` si WebView local) vía `start.ps1`; `EXPO_PUBLIC_*` por entorno. Prohibido IP hardcodeada.

## QA

* Jest + `jest-expo`: `npm test -w mobile` (7 suites hoy: `authStore, callWebView, deepLinking, permissions, petValidation, prescription, app`). Cobertura objetivo >80% (`BRIEF`). E2E TestSprite TS-E2E-01..08 sobre preview Vercel + backend staging; a11y Axe en Storybook web espejo.
* Performance: `FlatList` (nunca `ScrollView` listas), `keyExtractor id||clientMsgId`, imágenes WebP, `take:50` respetar, sin polling <5s salvo `ConsultationRoom waiting` web.

## Seguridad / legal (Ley 25.326 + SENASA)

* PII cero en LiveKit/logs/push (`identity:user.id`, `callerName:firstName`). `email/phone` de `GET /consultations/:id` nunca se persisten ni loggean. Refresh solo `SecureStore`, access en memoria, `SameSite lax/none` solo web.
* Media: `diskStorage /app/uploads/tmp/`, magic JPEG/PNG/PDF, 10MB `413`, 50MB/día `429`, `GET /media/:id` auth dueño/vet-asignado/ADMIN, S3 presigned 300s vía `302`. Nunca `express.static /uploads`. Soft-delete `deletedAt`, jamás `delete()` físico. Anonimización `anon_` pendiente (ver DEUDA).
