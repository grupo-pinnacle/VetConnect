# 📱 02_QA_DISTRIBUCION_Y_SEGURIDAD — Operación, QA y Seguridad (Nivel 3)

> **Rol del Documento:**  
> Define los procedimientos de compilación y empaquetado (EAS), la configuración de variables de entorno para desarrollo y producción, la estrategia de aseguramiento de calidad (QA) del WebView y las directivas de seguridad y protección de datos médicos.

---

## 1. Distribución y Empaquetado con Expo EAS

El contenedor móvil se construye utilizando **Expo Application Services (EAS Build)** y soporte de Continuous Native Generation (CNG):

### 1.1 Perfiles en `mobile/eas.json`

| Perfil | Tipo de Artefacto | Propósito Operativo |
|---|---|---|
| `development` | APK con `expo-dev-client` | Pruebas e iteración en caliente sobre dispositivos físicos o emuladores |
| `preview` | APK independiente (sideload) | Distribución directa para pruebas clínicas y homologación con veterinarios |
| `production` | Android App Bundle (**AAB**) | Publicación oficial en Google Play Store |

### 1.2 Comandos de Compilación
```powershell
# Compilación de APK standalone de previsualización (local)
npm run build:apk -w mobile

# Compilación de bundle de producción para Play Store
npm run build:bundle -w mobile
```

### 1.3 Requisitos y Guardrails del Toolchain
- **Ruta de Archivos ASCII Estricta:** El compilador de C++ (NDK/clang) y el bundler de Metro fallan ante rutas con caracteres con tildes (ej. `ó`). Asegurarse de ejecutar el build en una ruta completamente ASCII.
- **Java Runtime:** Se requiere **JDK 21** para compatibilidad con Gradle 8.14.
- **Configuración de Permisos en `mobile/app.json`:**
  - Android: `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `INTERNET`, `WAKE_LOCK`, `POST_NOTIFICATIONS`.
  - iOS (`Info.plist`): Declarar `NSCameraUsageDescription` y `NSMicrophoneUsageDescription` con explicaciones claras de uso teleclínico.

---

## 2. Configuración de Entornos y Conectividad

### 2.1 Variables de Entorno Clave
- `EXPO_PUBLIC_WEB_URL`: URL base de la aplicación web que el WebView cargará (por defecto `http://localhost:5173` en desarrollo).
- `EXPO_PUBLIC_API_URL`: URL del backend para registro de notificaciones push (por defecto `http://localhost:3001`).

### 2.2 Desarrollo en Teléfonos Físicos y Regla de Loopback
En un dispositivo físico, `localhost` resuelve al hardware del teléfono y no a la computadora de desarrollo donde corre Vite.

Para probar en un teléfono conectado por USB:
```powershell
# Reenviar el puerto del servidor web Vite
adb reverse tcp:5173 tcp:5173

# Reenviar el puerto del servidor backend Node
adb reverse tcp:3001 tcp:3001
```

> ⚠️ `src/lib/webviewBridge.ts` contiene la validación `isLoopbackUrl()` que previene pantallas blancas mudas: si la app detecta que se configuró `localhost` sin reenvío de puertos o en un entorno no emulado, despliega una alerta con instrucciones claras.

---

## 3. Estrategia de Calidad (QA) para el Contenedor WebView

### 3.1 Pruebas Unitarias del Wrapper Nativo
El contenedor cuenta con suites de pruebas unitarias enfocadas en las funciones críticas de integración:
```powershell
npm test -w mobile
```
- **Seeding de Autenticación (`webviewBridge.test.ts`):** Valida que `buildAuthSeedScript` genere sintaxis JavaScript válida, con escape JSON seguro de strings y finalice con `true;`.
- **Evaluación de Permisos (`callPermissions.test.ts`):** Verifica que los estados de carga (`null`), concesión (`granted`) y denegación de cámara/micrófono se evalúen con precisión sin falsos positivos.
- **Detección de Host y Rutas (`webviewBridge.test.ts`):** Comprueba que `isLoopbackUrl` identifique correctamente variantes IPv4, IPv6 y nombres locales.

### 3.2 Checklist de Verificación Manual en Dispositivo
1. **Carga Inicial y Handshake:** Verificar que al iniciar la aplicación se muestre el splash nativo hasta recibir `page:ready` de la web.
2. **Videoconsulta Telemédica:** Acceder a una consulta en estado `ACTIVE`, comprobar que los tracks de audio y video de LiveKit se inicien fluidamente sin exigir interacción manual adicional.
3. **Persistencia de Pantalla (WakeLock):** Comprobar que durante una videollamada de 10 minutos la pantalla del teléfono permanezca encendida sin entrar en reposo.
4. **Captura y Subida de Archivos:** Seleccionar una foto de la galería o tomar una foto con la cámara para la ficha de mascota; confirmar que el WebView no se recargue ni pierda el estado tras cerrar el selector nativo.
5. **Reciclado de Memoria:** Simular cierre de proceso o suspensión en Android (`Don't keep activities` en opciones de desarrollador) y verificar que los datos en borrador de registro o alta de mascota se restauren.

---

## 4. Seguridad, Aislamiento y Cumplimiento Legal

### 4.1 Aislamiento de Navegación (`originWhitelist`)
Para impedir ataques de redirección o que el WebView cargue contenido no confiable:
- La propiedad `originWhitelist` está restringida a los orígenes del sistema (`['http://*', 'https://*']`).
- Cualquier intento de navegación fuera del dominio oficial de VetConnect debe ser interceptado en `onShouldStartLoadWithRequest` y delegado al navegador externo del sistema si corresponde.

### 4.2 Privacidad de Datos Médicos (Ley 25.326)
- **Cero PII en Enlaces y Logs:** Prohibido transportar nombres de tutores, diagnósticos o teléfonos en cadenas de consulta (query params) o deep links.
- **Tokens de Acceso:** El access token se mantiene estrictamente en memoria del proceso nativo y se inyecta en el `localStorage` del origen web seguro.
- **Cierre Seguro de Sesión:** Al invocar logout, el contenedor limpia el almacén seguro de tokens (`expo-secure-store`) y remueve las entradas `vetconnect_token` y `vetconnect_user` del almacenamiento local.
