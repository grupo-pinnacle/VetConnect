# 📱 06_QA_PERFORMANCE_SEGURIDAD — EAS + ADB + TestSprite + PII Cero

## Distribución (ADR-018) + dev (ADR-016)

* `eas.json`: `development` (client + `apk` interno), `preview` (`apk` sideload clínicas beta, `autoIncrement: true`), `production` (`app-bundle` Play Store, `autoIncrement: true`). Comandos `mobile/package.json` `build:apk` (`eas build --platform android --profile preview --local`) / `build:bundle`. Contingencia: APK desde web oficial, nunca Play como único canal en beta.
* Dev corporativo: `adb reverse tcp:3001 tcp:3001` (+ `5173` si WebView local) vía `start.ps1`; `EXPO_PUBLIC_*` por entorno. Prohibido IP hardcodeada.

## Build local verificado 2026-09-24 ✅ (APK release 94.6 MB)

* `eas build --local` exige cuenta Expo (`eas login` o `EXPO_TOKEN`) aun en local — sin credenciales se usa el pipeline equivalente manual: `expo prebuild --platform android` + `gradlew assembleRelease`. `eas-cli` como devDependency + `eas.json` listo para cuando haya login (cloud).
* Requisitos Windows verificados: JDK 21 (`JAVA_HOME`, Gradle 8.14 no corre en Java 23), `ANDROID_HOME` + NDK 27.1.12297006 (SDK movido a `D:\Android\Sdk` porque C: estaba lleno), `GRADLE_USER_HOME` en D:.
* Restricción real: el workspace `D:\Proyectos-Programación\...` contiene `ó` y el toolchain NDK/clang + el embedder de Metro fallan ahí. Build reproducible en ruta ASCII standalone (`D:\vcapp\mobile`: copia de `mobile/` + `npm install` + `prebuild` + `assembleRelease`). Artefacto: `app-release.apk` (`com.vetconnect.app`, versionName 2.0.0; vc1 2026-09-24, vc2 con todas las features 2026-09-24, verificadas con `aapt dump badging`). APKs ignorados (`mobile/.gitignore`: `android/`, `*.apk`, `.expo/`).

## QA

* Jest + `jest-expo`: `npm test -w mobile` (7 suites hoy: `authStore, callWebView, deepLinking, permissions, petValidation, prescription, app`). Cobertura objetivo >80% (`BRIEF`). E2E TestSprite TS-E2E-01..08 sobre preview Vercel + backend staging; a11y Axe en Storybook web espejo.
* Performance: `FlatList` (nunca `ScrollView` listas), `keyExtractor id||clientMsgId`, imágenes WebP, `take:50` respetar, sin polling <5s salvo `ConsultationRoom waiting` web.

## Seguridad / legal (Ley 25.326 + SENASA)

* PII cero en LiveKit/logs/push (`identity:user.id`, `callerName:firstName`). `email/phone` de `GET /consultations/:id` nunca se persisten ni loggean. Refresh solo `SecureStore`, access en memoria, `SameSite lax/none` solo web.
* Media: `diskStorage /app/uploads/tmp/`, magic JPEG/PNG/PDF, 10MB `413`, 50MB/día `429`, `GET /media/:id` auth dueño/vet-asignado/ADMIN, S3 presigned 300s vía `302`. Nunca `express.static /uploads`. Soft-delete `deletedAt`, jamás `delete()` físico. Anonimización `anon_` pendiente (ver DEUDA).
