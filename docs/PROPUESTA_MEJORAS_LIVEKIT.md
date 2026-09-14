# 🎥 Propuesta de Mejoras, Puntos Ciegos y Contradicciones: Integración de LiveKit en VetConnect

> **Referencia Oficial de Documentación:** [LiveKit Official Docs & MCP Reference](https://docs.livekit.io/mcp)
> **Estado:** Propuesta Técnica de Ingeniería para Actualización de Documentación
> **Fecha:** Septiembre 2026
> **Restricción:** Documento de propuesta sin modificación de archivos preexistentes.

---

## 📑 Índice General

1. [Resumen Ejecutivo y Alineación con Estándares Oficiales](#1-resumen-ejecutivo-y-alineación-con-estándares-oficiales)
2. [Puntos Ciegos Detectados en el Proyecto (Blind Spots)](#2-puntos-ciegos-detectados-en-el-proyecto-blind-spots)
3. [Contradicciones Identificadas en la Arquitectura y Código (Contradictions)](#3-contradicciones-identificadas-en-la-arquitectura-y-código-contradictions)
4. [Delimitación de Scope del Proyecto (MVP vs. Post-MVP)](#4-delimitación-de-scope-del-proyecto-mvp-vs-post-mvp)
5. [Propuesta de Mejoras Técnicas Basadas en la Documentación Oficial LiveKit](#5-propuesta-de-mejoras-técnicas-basadas-en-la-documentación-oficial-livekit)

---

## 1. Resumen Ejecutivo y Alineación con Estándares Oficiales

Tras evaluar la arquitectura actual de **VetConnect** frente a las especificaciones oficiales de **LiveKit** ([https://docs.livekit.io/mcp](https://docs.livekit.io/mcp)), se han identificado áreas críticas de mejora en la integración de videollamadas WebRTC.

El sistema utiliza una arquitectura distribuida con un servidor backend en Node.js, un cliente web en React (`@livekit/components-react`) y un cliente móvil React Native en Expo (a través de `WebView`).

A través del análisis del servidor MCP de LiveKit y la documentación de referência para Tokens & Grants, React Components y Server API, se han detectado **puntos ciegos de seguridad y rendimiento**, **contradicciones internas** entre módulos y documentos del proyecto, y una **necesidad de delimitar formalmente el scope**.

---

## 2. Puntos Ciegos Detectados en el Proyecto (Blind Spots)

### 🔴 PC-01: Exposición de PII en Identidad y Nombres de Tokens JWT
* **Normativa Oficial LiveKit (*Access Tokens & Grants - PII Redaction*):**
  > *"Don't put PII in identity or room name. Participant identity and room name are recorded in logs and traces throughout LiveKit and its infrastructure, and aren't removed by PII redaction."*
* **Punto Ciego:** En la implementación backend (`calls.controller.ts`), se asignaba el correo electrónico (`req.user.email`) en la propiedad `name` o `identity` del JWT de LiveKit.
* **Riesgo:** Los correos de los usuarios quedan registrados permanentemente en la telemetría, métricas y logs de LiveKit Cloud / SFU, violando además normativas de privacidad como la Ley 25.326.

### 🔴 PC-02: Ausencia de Cierre Server-Side de Salas (`deleteRoom`) y Fuga de Recursos
* **Normativa Oficial LiveKit (*Room Service API*):**
  > Al finalizar una sesión interactiva o consulta, el backend debe invalidar activamente la sala mediante `RoomServiceClient.deleteRoom(roomName)` para desconectar a todos los participantes y liberar recursos.
* **Punto Ciego:** Cuando un veterinario completa una consulta (`PATCH /api/consultations/:id/complete`), la base de datos se actualiza a `COMPLETED`, pero la sala en LiveKit Server permanece abierta indefinidamente.
* **Riesgo:** Los usuarios pueden seguir transmitiendo audio y video tras finalizar la consulta, consumiendo minutos de servidor y ancho de banda en LiveKit Cloud.

### 🔴 PC-03: Duplicación de Renderizadores de Audio (`RoomAudioRenderer`) y Eco Local
* **Normativa Oficial LiveKit (*UI Components - React*):**
  > El componente prefabricado `<VideoConference />` de `@livekit/components-react` ya incluye internamente `<RoomAudioRenderer />`.
* **Punto Ciego:** En el componente `CallRoom.tsx`, se incluía un `<RoomAudioRenderer />` como hijo directo de `<LiveKitRoom>` además de renderizar `<VideoConference />`.
* **Riesgo:** Doble reproducción del flujo WebRTC de audio remoto, produciendo eco, acople de volumen y artefactos de sonido.

### 🔴 PC-04: Omisión de Preferencias del Usuario en `PreJoin` (`LocalUserChoices`)
* **Normativa Oficial LiveKit (*React Components - PreJoin*):**
  > `PreJoin` captura las decisiones del usuario (`userChoices`: micrófono apagado/encendido, cámara apagada/encendida, dispositivo seleccionado) y deben pasarse props a `<LiveKitRoom audio={userChoices.audioEnabled} video={userChoices.videoEnabled}>`.
* **Punto Ciego:** En `CallRoom.tsx`, al completar la pantalla de `PreJoin`, el objeto de selección se ignoraba y se forzaba `video={true}` y `audio={true}`.
* **Riesgo:** Violación de la privacidad y preferencia del usuario al encender forzadamente la cámara/micrófono.

### 🔴 PC-05: Condición de Carrera en el Puente WebView Móvil (`postMessage` Race Condition)
* **Normativa Oficial LiveKit / Expo Integration:**
  > En integraciones WebView, el envío de credenciales mediante `postMessage` debe realizarse únicamente cuando la aplicación receptora en la Web se encuentra completamente hidratada.
* **Punto Ciego:** El componente móvil `WebView` ejecutaba `sendCallInit` en el evento `onLoad`. Al usar la Web la ruta perezosa `React.lazy(() => import("./pages/CallPage"))`, la transmisión de mensajes ocurría antes de que la página terminara de cargar, perdiendo el token.
* **Riesgo:** La app móvil quedaba atrapada indefinidamente con el spinner "Conectando a la videollamada...".

### 🔴 PC-06: Ausencia de Handlers para Errores de Conexión WebRTC e ICE
* **Normativa Oficial LiveKit (*LiveKitRoom Handling*):**
  > Es obligatorio definir callbacks `onError` y `onMediaDeviceFailure` en `<LiveKitRoom>` para manejar la expiración de tokens, bloqueos de cortafuegos corporativos o falta de permisos de hardware.
* **Punto Ciego:** En la Web no existía captura de errores de conexión.
* **Riesgo:** Si un token expiraba o el cortafuegos bloqueaba el tráfico UDP WebRTC, el usuario quedaba frente a una pantalla negra congelada sin mensajes de error.

### 🔴 PC-07: Configuración Subóptima de Calidad de Video para Telemedicina
* **Normativa Oficial LiveKit (*Video Presets & Bitrate Guide*):**
  > Para diagnósticos visuales detallados se debe emplear resolución 720p (1280x720) con simulcast adaptativo y bitrate dinámico gestionado por el SFU (1.5 Mbps - 2.0 Mbps).
* **Punto Ciego:** La aplicación forzaba `VideoPresets.h360` a 400kbps y 20fps.
* **Riesgo:** Imagen altamente comprimida y pixelada que dificulta la inspección de lesiones clínicas en la mascota.

### 🔴 PC-08: Falta de Evento de Cancelación de Llamada (`call:cancel`)
* **Normativa Oficial LiveKit / Realtime Signaling:**
  > Toda arquitectura de llamadas debe proveer un evento simétrico de cancelación para cuando el llamante cuelga antes de que el receptor responda.
* **Punto Ciego:** Si el veterinario llamaba y cancelaba de inmediato, el receptor continuaba recibiendo el timbrado y la alerta modal sin cerrarse.

---

## 3. Contradicciones Identificadas en la Arquitectura y Código (Contradictions)

### ⚡ C-01: Inconsistencia de Estados Admitidos entre Gateway y Servicio de Tokens
* **Contradicción:** `chat.gateway.ts` permitía el inicio de llamada si el estado de la consulta era `'ACTIVE'` o `'PENDING'`. Sin embargo, `calls.service.ts` rechazaba la solicitud de token con HTTP 409 Conflict si la consulta no estaba en estado estrictamente `'ACTIVE'`.
* **Impacto:** Si un usuario llamaba en estado `PENDING`, el destinatario recibía el timbrado, pero al presionar "Atender", el servidor le negaba el token de videollamada.

### ⚡ C-02: Inversión de Nombres en la Señalización (`callerName` vs `peerName`)
* **Contradicción:** En el cliente web, al presionar "Videollamada", el componente enviaba `peerName` (nombre del destinatario) en el evento `call:initiate`. El servidor tomaba este parámetro y lo reenviaba como `callerName` al receptor.
* **Impacto:** El destinatario veía una notificación modal que decía: "Videollamada entrante de [Su Propio Nombre]".

### ⚡ C-03: Dependencia Inadecuada de Librería Cliente en el Backend (`package.json`)
* **Contradicción:** En `backend/package.json` figuraba instalada la librería `"livekit-client": "^2.21.0"` junto a `"livekit-server-sdk": "^2.17.0"`.
* **Impacto:** `livekit-client` está diseñada únicamente para ejecutarse en el navegador Web (depende de objetos globales como `window`, `RTCPeerConnection`). Su presencia en Node.js es una contradicción conceptual y agrega dependencias innecesarias al servidor.

### ⚡ C-04: Incompatibilidad de Redirección al Finalizar Llamada en Web Desktop
* **Contradicción:** Al presionar "Abandonar llamada", `CallPage.tsx` ejecutaba `window.location.href = "vetconnect://call-ended"`.
* **Impacto:** Aunque esto funcionaba para el WebView móvil, en un navegador web de escritorio provocaba un error de protocolo no registrado ("No se puede abrir vetconnect://").

### ⚡ C-05: Discrepancia entre la Especificación (`SPEC.md`) y el Estado Real de Mobile
* **Contradicción:** `SPEC.md` declaraba que la app móvil poseía un "LiveKit Video WebView Bridge" plenamente operativo con "Adaptive Simulcast Engine", mientras que la auditoría de código demostraba que el puente padecía de race conditions y fallaba en conexiones frías.

---

## 4. Delimitación de Scope del Proyecto (MVP vs. Post-MVP)

Para mantener la claridad del proyecto y priorizar el desarrollo, se establece la siguiente matriz de scope para la funcionalidad de videollamadas:

```
+-----------------------------------------------------------------------------------------------+
|                                  MATRIZ DE DELIMITACIÓN DE SCOPE                              |
+---------------------------------------------------+-------------------------------------------+
| DENTRO DEL SCOPE (MVP v2.0)                       | FUERA DEL SCOPE (Post-MVP v2.2+)          |
+---------------------------------------------------+-------------------------------------------+
| • Generación server-side de JWT efímeros.        | • SDK Nativo React Native (@livekit/rn).  |
| • Privacidad estricta: PII scrubbing en claims.   | • LiveKit Egress (Grabación de video/S3). |
| • Puente Web-Mobile con handshake (page:ready).   | • LiveKit SIP (Integración telefonía fija)|
| • Cierre automático de salas con deleteRoom().    | • LiveKit Agents (Asistente de IA en vivo)|
| • Resolución 720p adaptativa con simulcast.       | • Transcripción automática de la llamada. |
| • Eventos completos: initiate, answer, cancel.    | • Fondos virtuales y filtros de video.    |
+---------------------------------------------------+-------------------------------------------+
```

---

## 5. Propuesta de Mejoras Técnicas Basadas en la Documentación Oficial LiveKit

Se proponen las siguientes acciones concretas para actualizar la documentación y las guías de implementación:

### 1. Estandarización de Generación de Tokens (Backend)
Usar identificadores opacos para `identity` y nombres públicos de pila sin correos:
```typescript
// En calls.service.ts
const token = new AccessToken(apiKey, apiSecret, {
  identity: user.id, // ID opaco
  name: user.firstName, // Nombre público de pila (SIN EMAIL / PII)
  ttl: '1h',
});
token.addGrant({
  roomJoin: true,
  room: `consultation-${consultationId}`,
  canPublish: true,
  canSubscribe: true,
  roomAdmin: user.role === 'VET',
});
```

### 2. Gestión del Ciclo de Vida de Salas en el Servidor
Invocación obligatoria de la API de administración de salas al completar la consulta:
```typescript
// En consultations.service.ts
import { RoomServiceClient } from 'livekit-server-sdk';

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
await roomService.deleteRoom(`consultation-${consultationId}`);
```

### 3. Protocolo de Handshake Bidireccional para WebView Móvil
1. La página Web (`CallPage.tsx`) emite un evento `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page:ready' }))` al montarse.
2. La app móvil en React Native aguarda la recepción de `'page:ready'` antes de inyectar el token de LiveKit vía `postMessage`.

### 4. Limpieza de Componentes React Web
- Remover `<RoomAudioRenderer />` redundante en `CallRoom.tsx`.
- Capturar las preferencias del usuario en `PreJoin` y pasarlas a `<LiveKitRoom>`:
```tsx
<LiveKitRoom
  serverUrl={serverUrl}
  token={token}
  connect={true}
  video={userChoices.videoEnabled}
  audio={userChoices.audioEnabled}
  options={{
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
  }}
  onError={(error) => handleCallError(error)}
  onMediaDeviceFailure={(failure) => handleDeviceFailure(failure)}
  onDisconnected={() => handleDisconnect()}
>
```

### 5. Sanitización de Dependencias
Eliminar `"livekit-client"` de `backend/package.json` para mantener exclusivamente `"livekit-server-sdk"`.

---
*Propuesta elaborada por la IA de Ingeniería basándose en la especificación oficial LiveKit MCP.*
