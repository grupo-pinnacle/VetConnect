# 📱 02_QA_DISTRIBUCION_Y_SEGURIDAD — Operación (Nivel 3)

> Este archivo es el **único dueño** de build, distribución, QA, performance, seguridad y legal de mobile.
> El stack y los contratos de código están en `AGENT_CODING_SPEC_MOBILE.md`; los endpoints, en `01_TECH_REFERENCE_MOBILE.md`.

---

## 1. Distribución (ADR-018)

`mobile/eas.json` define tres perfiles:

| Perfil | Tipo | Uso |
|---|---|---|
| `development` | `developmentClient` + APK interno | Iteración con dev client |
| `preview` | APK interno, `autoIncrement: true` | Sideload para beta clínica |
| `production` | **AAB** para Play Store, `autoIncrement: true` | Release |

Comandos: `npm run build:apk -w mobile` (`eas build --platform android --profile preview --local`) y `npm run build:bundle -w mobile`.

**Contingencia:** durante la beta el APK oficial se distribuye desde el canal web. Nunca dejar Play Store como único canal.

### 1.1 Bloqueos de build conocidos

- `eas build --local` **exige cuenta Expo** (`eas login` o `EXPO_TOKEN`) aunque el build sea local. Sin credenciales, usar el pipeline equivalente: `npx expo prebuild --platform android` + `gradlew assembleRelease`.
- **La ruta del proyecto debe ser ASCII.** El toolchain NDK/clang y el embedder de Metro fallan si el path contiene `ó` u otros caracteres no-ASCII. Verificar antes de compilar; si hace falta, compilar desde una copia en ruta ASCII.
- Requisitos: **JDK 21** (Gradle 8.14 no corre en Java 23), `ANDROID_HOME` + NDK `27.1.12297006`, y espacio suficiente en disco. Verificar con `java -version` y `echo $env:ANDROID_HOME`.
- Artefactos Android están gitignorados: `mobile/.gitignore` excluye `android/`, `*.apk`, `.expo/`.

### 1.2 Pendiente de credenciales

- `eas.json` **no tiene `projectId` ni `owner`** → el build en cloud no puede resolverse hasta inicializar el proyecto Expo.
- `app.json` **no tiene `android.googleServicesFile`** → `getExpoPushTokenAsync` **no puede funcionar** en un build Android de producción sin credenciales FCM. Esto bloquea las push (§ QA de seguridad).

---

## 2. Desarrollo local y dispositivo físico

- Env: `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`), `EXPO_PUBLIC_WS_URL`, `EXPO_PUBLIC_WEB_URL` (default `http://localhost:5173`).
- En un teléfono físico `localhost` apunta al handset, no a tu máquina. Usar **ADB reverse** (ADR-016):
  ```powershell
  adb reverse tcp:3001 tcp:3001
  adb reverse tcp:5173 tcp:5173   # solo si el bridge WebView carga la web local
  ```
- ❌ Prohibido hardcodear IPs en el código o en `app.json`.

---

## 3. QA

### 3.1 Unitario

```powershell
npm test -w mobile            # 11 suites / 29 tests
npm run typecheck -w mobile   # tsc --noEmit, cero `any`
```

`jest.config.js` usa `ts-jest` con `testEnvironment: 'node'` y `testMatch: ['**/__tests__/**/*.test.ts']`.

> ⚠️ **Deuda de cobertura registrada.** No hay un solo test de render (`.tsx`). Cero cobertura sobre `src/lib/api.ts` (el interceptor 401 y la `failedQueue`, la lógica de mayor riesgo), `src/lib/socket.ts`, los tres hooks, y 5 de los 6 services. Cinco suites (`app`, `prescription`, `permissions`, `callWebView`, `petValidation`) **no importan código de la app**: afirman sobre literales definidos dentro del propio test, y `petValidation.test.ts` reimplementa `validation/pet.ts` y los colores de `theme/tokens.ts`. Dan falsa sensación de cobertura. Detalle y plan en `03_ESTADO_Y_DEUDA_MOBILE.md`.

- Objetivo de cobertura: >80% (`docs/BRIEF.md`).
- E2E: TestSprite TS-E2E-01..08 sobre preview Vercel + backend staging.
- Accesibilidad web: Axe en Storybook (espejo del sistema de diseño).

### 3.2 Performance

- `FlatList` para toda lista, **nunca** `ScrollView`. Hoy `VetWorkspace` usa un `FlatList` con `scrollEnabled={false}` y sin paginar.
- `keyExtractor` estable: `id || clientMsgId`.
- Imágenes en WebP.
- Respetar el `take:50` fijo de notificaciones.
- Sin polling por debajo de 5 s, salvo la `ConsultationRoom waiting` de web.

---

## 4. Seguridad y legal

### 4.1 Datos personales (Ley 25.326)

- **Cero PII** en tokens LiveKit, logs de auditoría y push: `identity: user.id`, `callerName: firstName`.
- `email`/`phone` que vienen en `GET /api/consultations/:id` **nunca** se persisten ni se loggean (D-B09).
- Refresh token **solo** en `expo-secure-store`; access token **solo** en memoria.
- Cookies `SameSite` — solo web, no aplica a mobile.
- Soft-delete siempre (`deletedAt`). Jamás `delete()` físico.
- Anonimización `anon_`: **no implementada** en backend (D-B10). La baja de usuario es `deletedAt` + ticket manual.

### 4.2 Archivos clínicos

- Nada de `express.static` sobre `/uploads` (violaría la Ley 25.326).
- Magic bytes: solo JPEG, PNG, PDF. 10 MB por archivo → `413 FILE_TOO_LARGE`. 50 MB/día/usuario → `429 UPLOAD_QUOTA_EXCEEDED`.
- `GET /api/media/:id` autoriza a dueño / vet asignado / ADMIN; si no, `403`. En S3 responde **302** hacia una URL presigned con **TTL 300 s**.
- El cliente nunca expone ni persiste la URL presigned: descarga a data URL tras validar la respuesta.

### 4.3 Claims legales en la UI — deben respaldarse

❌ Prohibido afirmar en pantalla que algo es "oficial", "firmado", "certificado" o "validado por SENASA" si no existe la firma criptográfica correspondiente en backend.

> ⚠️ **Vigente hoy:** `prescriptions/[id].tsx` muestra el encabezado "DOCUMENTO OFICIAL FIRMADO SENASA" pero el backend solo genera un QR con una URL pública y el bloque de autorización de `getByIdPublic` es una sentencia vacía (D-B15). Cualquiera con el UUID puede leer la receta. **Corregir antes de release.**

---

## 5. Checklist de release

- [ ] `npm run typecheck -w mobile` sin errores
- [ ] `npm test -w mobile` verde
- [ ] Cero `any` en `mobile/`
- [ ] Los 5 estados UI presentes en toda pantalla asíncrona
- [ ] `eas.json` con `projectId` y `owner`
- [ ] `android.googleServicesFile` configurado si se usan push
- [ ] Claims legales de la UI respaldados por firma real
- [ ] Sin datos simulados ni KPIs hardcodeados
- [ ] Build Android reproducible en ruta ASCII
