# 📱 AGENT_CODING_SPEC_MOBILE — Especificación Técnica del Contenedor WebView (Nivel 2)

> **Contrato de Código del Contenedor:**  
> Define el stack, la configuración del WebView endurecido, el protocolo de sincronización de autenticación, el bridge de eventos nativos y las reglas operativas del shell móvil.

---

## 1. Stack Técnico del Contenedor Mobile

| Paquete | Versión | Rol en la Arquitectura |
|---|---|---|
| `expo` | `~54.0.0` | Runtime nativo y herramientas de empaquetado (EAS / CNG) |
| `expo-router` | `~6.0.0` | Entry point y enrutador base (`main: expo-router/entry`) |
| `react-native` | `0.81.4` | Framework base para Android e iOS |
| `react` / `react-dom` | `19.1.0` | Baseline requerido por Expo SDK 54 / RN 0.81 |
| `react-native-webview` | `^13.15.0` | Motor central que aloja y renderiza la Web App de VetConnect |
| `expo-camera` | `~17.0.0` | Gestión de permisos nativos de hardware de cámara |
| `expo-notifications` | `~0.32.0` | Manejador de notificaciones push y registro de token APNs/FCM |
| `expo-secure-store` | `~15.0.0` | Almacenamiento cifrado en hardware de credenciales/tokens nativos |
| `expo-keep-awake` | `~14.0.0` | Prevención de suspensión de pantalla durante videoconsultas (WakeLock) |
| `typescript` | `^5.7.3` | Tipado estricto. **Cero `any`** en el puente nativo |

> ❌ **Reglas Críticas del Stack:**  
> - **Prohibido el SDK nativo de LiveKit en mobile** (`@livekit/react-native` o `@livekit/react-native-webrtc`). Todo el flujo de telemedicina se procesa directamente por WebRTC en el motor del WebView.  
> - **Prohibido duplicar pantallas de negocio en React Native.** Vistas de mascotas, chat, historial, recetas y perfiles se consumen desde la aplicación web.

---

## 2. Configuración Endurecida del WebView (`HARDENED_WEBVIEW_CONFIG`)

Para garantizar que WebRTC, el audio bidireccional, el selector de fotos y el almacenamiento local funcionen sin fricción en Android e iOS, el componente `WebView` debe instanciarse con la configuración exportada en `src/lib/webviewBridge.ts`:

```ts
export const HARDENED_WEBVIEW_CONFIG = {
  domStorageEnabled: true,                      // Obligatorio para localStorage de auth y drafts
  javaScriptEnabled: true,                     // Ejecución del bundle SPA de React
  sharedCookiesEnabled: true,                  // Sincronización de cookies de sesión
  thirdPartyCookiesEnabled: true,              // Soporte de cookies seguras cross-origin
  allowsInlineMediaPlayback: true,             // Video inline de LiveKit sin forzar fullscreen
  mediaPlaybackRequiresUserAction: false,      // Reproducción inmediata de tracks de video/audio
  allowFileAccess: true,                       // Permite subir imágenes y reportes clínicos
  mediaCapturePermissionGrantType: 'grant',    // Concede permisos de getUserMedia en Android
  originWhitelist: ['http://*', 'https://*'],  // Bloquea esquemas no seguros o URLs externas no autorizadas
} as const;
```

---

## 3. Mecanismo de Sincronización de Sesión (Auth Seeding)

### 3.1 El Problema del Timing
La aplicación web (`web/src/services/api.ts` y `AuthContext.tsx`) inicializa su estado leyendo `localStorage` en el **momento en que se evalúa el primer módulo** del bundle de Javascript.  
Inyectar las credenciales después de que el documento termina de cargar (`onLoadEnd` o `page:ready`) provocaría una condición de carrera: la SPA leería `null`, asumiría que no hay sesión activa y dispararía una redirección automática a `/login`.

### 3.2 Solución Canónica: `injectedJavaScriptBeforeContentLoaded`
El shell móvil inyecta el script de inicialización **antes de que cualquier script de la página web sea ejecutado**:

```ts
// src/lib/webviewBridge.ts
export const WEB_TOKEN_STORAGE_KEY = 'vetconnect_token';
export const WEB_USER_STORAGE_KEY = 'vetconnect_user';

export function buildAuthSeedScript(accessToken: string, user: User): string {
  const token = JSON.stringify(accessToken);
  const userJson = JSON.stringify(user);

  return (
    'try{' +
    `window.localStorage.setItem(${JSON.stringify(WEB_TOKEN_STORAGE_KEY)},${token});` +
    `window.localStorage.setItem(${JSON.stringify(WEB_USER_STORAGE_KEY)},${userJson});` +
    '}catch(e){};' +
    'true;' // Obligatorio: debe evaluar a true para evitar advertencias de react-native-webview
  );
}
```

En la vista del WebView:
```tsx
<WebView
  ref={webviewRef}
  source={{ uri: targetUrl }}
  injectedJavaScriptBeforeContentLoaded={
    accessToken && user ? buildAuthSeedScript(accessToken, user) : undefined
  }
  {...HARDENED_WEBVIEW_CONFIG}
  onMessage={handleBridgeMessage}
/>
```

---

## 4. Protocolo de Bridge Bidireccional (`postMessage`)

La comunicación entre el cliente web hospedado y el contenedor nativo utiliza la interfaz estándar `window.ReactNativeWebView.postMessage`.

### 4.1 Eventos Emitidos por la Web hacia Mobile (Web → Mobile)

| Evento (`type`) | Payload | Responsabilidad del Contenedor Mobile |
|---|---|---|
| `page:ready` | `{}` | Informa que la vista web completó su hidratación. Mobile oculta el splash nativo de carga. |
| `call:ended` | `{ consultationId?: string }` | Notifica el fin de la videollamada. Mobile puede navegar hacia atrás o resetear la pantalla. |
| `wakelock:request` | `{ tag?: string }` | Solicita activar `activateKeepAwakeAsync()` para impedir que la pantalla se apague en consulta. |
| `wakelock:release` | `{}` | Invoca `deactivateKeepAwake()` para restituir el comportamiento normal de suspensión. |
| `photo:picker` | `{ targetInputId?: string }` | Señaliza el disparo seguro del selector de fotos evitando recargas accidentales. |

### 4.2 Manejo de Eventos en Mobile
```ts
const handleBridgeMessage = (event: WebViewMessageEvent) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case 'page:ready':
        setIsPageReady(true);
        break;
      case 'call:ended':
        handleCallTermination(data.consultationId);
        break;
      case 'wakelock:request':
        activateKeepAwakeAsync();
        break;
      case 'wakelock:release':
        deactivateKeepAwake();
        break;
    }
  } catch (err) {
    // Prohibido crashear ante payloads no estructurados
  }
};
```

---

## 5. Resiliencia de Hardware y Sistema Operativo

### 5.1 Detección de Loopback en Desarrollo (`isLoopbackUrl`)
En dispositivos físicos, `localhost` o `127.0.0.1` apuntan al hardware del teléfono, no a la máquina host.  
`src/lib/webviewBridge.ts` provee `isLoopbackUrl()` para alertar de inmediato al desarrollador con un mensaje constructivo (`Configurar EXPO_PUBLIC_WEB_URL con la IP de red local o usar ADB reverse`) en vez de mostrar una pantalla blanca opaca.

### 5.2 Reciclado de Procesos en Android (`onContentProcessDidTerminate`)
Cuando el sistema operativo Android sufre presión de memoria (ej. al abrir la cámara de alta resolución para fotografiar a la mascota), el proceso de renderizado del WebView puede ser finalizado.  
- **En Mobile:** `onContentProcessDidTerminate` detecta el evento e invoca `webviewRef.current?.reload()`.
- **En Web:** Los formularios clave (`NewPet`, `Register`) implementan persistencia automática de borradores en `localStorage` (mitigaciones BUG-01 y BUG-02), recuperando los datos del usuario al recargar sin pérdida de información.

---

## 6. Notificaciones Push y Deep Linking

### 6.1 Registro de Push Token
- Al iniciar la aplicación, el shell solicita permisos de notificación mediante `expo-notifications`.
- El token obtenido (`ExponentPushToken[...]`) se envía a `POST /api/notifications/register-token` indicando la plataforma (`android` o `ios`).

### 6.2 Enrutamiento por Deep Link
El esquema declarado en `app.json` es `vetconnect://`. Al recibir una push o abrir un enlace externo:
- `vetconnect://call/:id` → Carga `${EXPO_PUBLIC_WEB_URL}/call/:id` dentro del WebView.
- `vetconnect://consultation/:id` → Carga `${EXPO_PUBLIC_WEB_URL}/consultations/:id`.
- `vetconnect://prescriptions/:id` → Carga `${EXPO_PUBLIC_WEB_URL}/prescriptions/:id`.

---

## 7. Guardrails del Contenedor (Fallo Inmediato de CI si se Violan)

❌ **Prohibido:**
1. Instalar `@livekit/react-native`, `@livekit/react-native-webrtc` o cualquier SDK de videollamadas nativo.
2. Replicar pantallas visuales de negocio dentro de `mobile/app/(app)/*`.
3. Utilizar tipos `any` o directivas `@ts-ignore` en el código de integración del bridge.
4. Incluir credenciales o información médica personal identificable (PII) en parámetros de URLs o logs.
5. Desactivar `domStorageEnabled` o `javaScriptEnabled` en el WebView.

✅ **Obligatorio:**
1. Gestionar siempre los estados de carga, error de red y denegación de permisos en la UI del contenedor.
2. Utilizar `buildAuthSeedScript` con escape JSON estricto para inyectar credenciales de sesión.
3. Proveer feedback claro al usuario si el servidor web no responde o no hay conexión a Internet.
