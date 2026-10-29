# 📱 01_TECH_REFERENCE_MOBILE — Contratos de Red, Rutas y Bridge (Nivel 2)

> **Rol del Documento:**  
> Especifica los contratos de red consumidos directamente por el contenedor nativo, el mapa de rutas web embebidas dentro del WebView y el protocolo formal de comunicación del bridge (`window.ReactNativeWebView`).

---

## 1. Endpoints Backend Consumidos Directamente por el Contenedor Nativo

A diferencia de un cliente móvil nativo tradicional, la gran mayoría de las peticiones REST (`/api/pets`, `/api/consultations`, etc.) y las conexiones WebSocket de chat son ejecutadas directamente por la aplicación Web dentro del motor del navegador. El contenedor nativo consume únicamente los siguientes servicios de infraestructura:

| Método | Endpoint | Responsabilidad en Mobile | Payload / Headers |
|---|---|---|---|
| `POST` | `/api/notifications/register-token` | Registro del token para push remotas | `{ token: string, platform: 'android' \| 'ios' }` |
| `POST` | `/api/auth/refresh` | Renovación de token de sesión si el shell gestiona persistencia nativa | Body: `{ refreshToken: string }`<br/>Header: `X-Client-Platform: mobile` |
| `POST` | `/api/auth/logout` | Cierre de sesión e invalidación de token | Header: `Authorization: Bearer <token>` |

> **Envelope Uniforme de Error (RFC 7807):**
> ```json
> {
>   "success": false,
>   "error": {
>     "code": "ERROR_CODE",
>     "message": "Descripción clara del problema",
>     "details": {},
>     "timestamp": "2026-10-29T14:00:00.000Z"
>   }
> }
> ```

---

## 2. Mapa de Rutas Web Embebidas en el WebView

El contenedor nativo resuelve la URL base (`EXPO_PUBLIC_WEB_URL`) y proyecta las siguientes rutas de la aplicación web:

| Ruta Web Embebida | Propósito y Contenido | Características en WebView |
|---|---|---|
| `/` | Dashboard principal según rol (Tutor o Veterinario) | Navegación responsive, listado de mascotas y estado de guardia |
| `/auth/login` | Pantalla de inicio de sesión | Soporte de autocompletado y persistencia en `localStorage` |
| `/auth/register` | Registro de nuevos usuarios y tutores | Soporte de borrador automático ante reciclado de memoria (`vetconnect_register_draft`) |
| `/call/:consultationId` | Sala de videoconsulta médica con LiveKit WebRTC | Activación de permisos inline de cámara/micrófono, emisión de `page:ready` y solicitud de `wakelock:request` |
| `/consultations/:id` | Detalle de consulta médica y chat en tiempo real | Subida de adjuntos e imágenes clínicas vía selector de archivos |
| `/consultations/new` | Flujo de triage veterinario y solicitud de atención | Selección interactiva de mascota y síntoma |
| `/pets` | Ficha y gestión de mascotas del tutor | Listado con fotos y estados de vacunación |
| `/pets/new` | Alta de mascota | Carga de foto con borrador persistente (`vetconnect_new_pet_draft`) |
| `/prescriptions/:id` | Receta médica digital oficial | Visualización inmutable con código QR público |

---

## 3. Protocolo de Bridge Bidireccional (`window.ReactNativeWebView`)

### 3.1 Especificación de Mensajes (Web → Contenedor Nativo)

Todos los mensajes emitidos desde la aplicación web deben ser serializados en JSON mediante `window.ReactNativeWebView.postMessage(JSON.stringify(payload))`:

#### 1. Montaje y Confirmación de Carga (`page:ready`)
- **Emisor:** `ConsultationRoom.tsx`, `CallRoom.tsx`.
- **Momento:** Se emite en el `useEffect` una vez que el DOM de la sala está montado.
- **Payload:**
  ```json
  { "type": "page:ready" }
  ```
- **Acción en Mobile:** Oculta indicadores o pantallas de carga nativas (`isPageReady = true`).

#### 2. Finalización de Videoconsulta (`call:ended`)
- **Emisor:** `CallRoom.tsx` al desconectar o abandonar la sala LiveKit.
- **Payload:**
  ```json
  {
    "type": "call:ended",
    "consultationId": "uuid-de-la-consulta"
  }
  ```
- **Acción en Mobile:** Libera el WakeLock nativo y realiza navegación de retorno (`router.back()`).

#### 3. Control de Pantalla Activa (`wakelock:request` / `wakelock:release`)
- **Emisor:** `ConsultationRoom.tsx` (FEAT-05).
- **Momento:** Al ingresar o salir de una videollamada activa.
- **Payloads:**
  ```json
  { "type": "wakelock:request", "tag": "call-active" }
  { "type": "wakelock:release" }
  ```
- **Acción en Mobile:** Invoca `activateKeepAwakeAsync()` o `deactivateKeepAwake()` para evitar suspensión del display en Android/iOS.

#### 4. Disparo Seguro de Cámara / Selector de Fotos (`photo:picker`)
- **Emisor:** `DashboardClient.tsx`, `NewPet.tsx`.
- **Payload:**
  ```json
  { "type": "photo:picker", "target": "pet-avatar" }
  ```
- **Acción en Mobile:** Notifica al shell que se abrirá un intent de selección multimedia para coordinar el ciclo de vida y evitar que el proceso WebView sea terminado sin aviso.

---

## 4. Persistencia Local Compartida y Prevención de Pérdida de Datos

Para proteger la experiencia del usuario ante el reciclado forzado de memoria del sistema operativo Android (`Low Memory Killer` al abrir la cámara), se establecen las siguientes claves en `window.localStorage`:

| Clave en LocalStorage | Tipo de Dato | Origen / Destino | Propósito |
|---|---|---|---|
| `vetconnect_token` | `string` (JWT) | Inyectado por Mobile / Leído por Web | Token de acceso para cabeceras HTTP `Authorization` |
| `vetconnect_user` | `JSON string` | Inyectado por Mobile / Leído por Web | Datos del usuario autenticado (id, rol, nombre) |
| `vetconnect_register_draft` | `JSON string` | Escrito y leído por Web | Borrador temporal del formulario de registro ante caídas |
| `vetconnect_new_pet_draft` | `JSON string` | Escrito y leído por Web | Borrador temporal de la ficha de mascota ante apertura de cámara |

---

## 5. Tabla de Mitigaciones y Notas de Compatibilidad

| ID | Área | Problema Detectado | Mitigación Implementada |
|---|---|---|---|
| **M-WB01** | Videollamadas | Restricción de reproducción de medios en navegadores embebidos | Configurar `allowsInlineMediaPlayback: true` y `mediaPlaybackRequiresUserAction: false` en el WebView |
| **M-WB02** | Permisos WebRTC | Bloqueo de micrófono y cámara en Android WebView | Establecer `mediaCapturePermissionGrantType: 'grant'` y solicitar permisos nativos previamente |
| **M-WB03** | Auth Timing | Pérdida de sesión si la inyección ocurre en `onLoad` | Uso estricto de `injectedJavaScriptBeforeContentLoaded` con `buildAuthSeedScript` |
| **M-WB04** | Form Crash | Pérdida de fotos o texto al abrir selector de Android | Persistencia de borradores en `localStorage` con rehidratación automática |
| **M-WB05** | Standby de Pantalla | Apagado del display durante consultas prolongadas | Bridge reactivo de WakeLock vía `expo-keep-awake` |
