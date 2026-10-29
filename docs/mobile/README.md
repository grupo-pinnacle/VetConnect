# 📱 VetConnect Mobile — Índice Maestro y Arquitectura (SSOT)

> **Decisión Arquitectónica Consolidada:**  
> La aplicación móvil de VetConnect es formalmente un **Shell / Contenedor Híbrido** basado en React Native (Expo SDK 54) con `react-native-webview`, encargado de encapsular y servir la aplicación Web responsive de VetConnect (`web/`).  
> La lógica de negocio clínica, los flujos de tutores y veterinarios, la gestión de mascotas, el chat interactivo y las videoconsultas WebRTC (LiveKit) residen y se mantienen en la Web App, la cual está expresamente optimizada y adaptada para operar dentro del WebView móvil.

---

## 1. Misión del Contenedor Mobile (WebView Shell)

El contenedor móvil nativo no busca duplicar la interfaz de usuario ni las pantallas del cliente web, sino dotar a la plataforma web de capacidades y presencia de app nativa:

1. **Empaquetado y Distribución:** Distribución en Android (APK/AAB vía EAS Build) y presencia en el launcher del dispositivo.
2. **Puente de Hardware y Permisos:** Solicitud y gestión centralizada de permisos nativos de Cámara, Micrófono y Notificaciones.
3. **Inyección y Sincronización de Sesión (Auth Seeding):** Sincronización segura de credenciales de autenticación en `localStorage` del WebView antes del montaje de los scripts web (`injectedJavaScriptBeforeContentLoaded`).
4. **Protocolo de Bridge Bidireccional (`window.ReactNativeWebView`):** Señalización reactiva de ciclo de vida (`page:ready`, `call:ended`), gestión de Screen WakeLock para videoconsultas, y manejo de cámara/archivos.
5. **Notificaciones Push y Deep Linking:** Recepción de push remotas vía Expo Push Notifications y redirección inteligente a rutas internas del WebView (`vetconnect://`).
6. **Resiliencia ante Reciclado de Memoria:** Soporte en la capa web de persistencia en `localStorage` para tolerar la destrucción y rehidratación de actividades en Android cuando el sistema operativo reclama recursos.

---

## 2. Mapa de Documentos — Estructura de la Sección

Cada archivo en `docs/mobile/` posee una responsabilidad única y delimita el contrato del contenedor:

| Archivo | Nivel | Responsabilidad Única |
|---|---|---|
| `README.md` | 1 | **Índice Maestro y SSOT**: Definición arquitectónica del WebView Shell, mapa de responsabilidades y verificación. |
| `AGENT_CODING_SPEC_MOBILE.md` | 2 | **Especificación del Contenedor Nativo**: Configuración de `react-native-webview`, scripts de auth seeding, bridge bidireccional de eventos y guardrails. |
| `01_TECH_REFERENCE_MOBILE.md` | 2 | **Contratos y Rutas Embebidas**: Endpoints nativos (Push tokens), mapeo de rutas web envueltas y protocolo de mensajería `postMessage`. |
| `02_QA_DISTRIBUCION_Y_SEGURIDAD.md` | 3 | **Operación y Calidad**: Build EAS/local, variables de entorno (`EXPO_PUBLIC_WEB_URL`), permisos en `app.json`, debugging y seguridad. |
| `03_ESTADO_Y_DEUDA_MOBILE.md` | — | **Diagnóstico y Hoja de Ruta**: Estado verificado del wrapper, mitigaciones implementadas (BUG-01, BUG-02, BUG-06/FEAT-05) y deuda técnica del contenedor. |

---

## 3. Principios de Integración Web ↔ WebView

Estas reglas neutralizan inconsistencias y guían el desarrollo de ambas capas:

| Principio | Regla de Oro | Razón Técnica |
|---|---|---|
| **Cero Duplicación de UI** | Las pantallas de negocio viven exclusivamente en `web/`. El contenedor móvil provee el visor y los componentes de shell (splash, error de conexión, selector de permisos). | Evita divergencias de diseño, simplifica el mantenimiento a un solo codebase visual y unifica la experiencia. |
| **Videollamadas WebRTC Web** | Las videoconsultas se ejecutan a través del componente web de LiveKit dentro del WebView con permisos inline concedidos. | Prohibido incluir SDK nativo de LiveKit en React Native (`@livekit/react-native`); el WebView soporta WebRTC directamente. |
| **Auth Seeding Temprano** | Los tokens de sesión se inyectan en `window.localStorage` en `injectedJavaScriptBeforeContentLoaded`. | La aplicación web lee su token en tiempo de evaluación de módulos. Inyectar post-carga (`page:ready`) provocaría redirects erróneos al login. |
| **Persistencia Anti-Crash** | Los formularios clave en web implementan auto-guardado en borrador (`localStorage`). | Si Android destruye la actividad del WebView al abrir la cámara o por baja memoria, el usuario no pierde datos al regresar. |
| **Screen WakeLock** | La web solicita mantener la pantalla activa mediante mensajes al bridge (`wakelock:request`). | Evita que el dispositivo suspenda la pantalla o corte la cámara durante una videoconsulta activa. |

---

## 4. Comandos de Verificación del Workspace

```powershell
# Verificación estática de tipos en el contenedor móvil
npm run typecheck -w mobile

# Ejecución de pruebas unitarias del wrapper y utilidades de bridge
npm test -w mobile

# Validación del paquete web (que corre dentro del WebView)
npm run typecheck -w web
npm test -w web
```
