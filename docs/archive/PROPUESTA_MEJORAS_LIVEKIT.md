# 🎥 Integración de LiveKit en VetConnect: Hoja de Ruta Consolidada

> 📦 **ESTADO DE ARCHIVO & HISTORIAL:** Este documento es un **Registro Histórico de Consolidación**. Su contenido técnico preliminar fue absorbido y elevado a normativa definitiva de ingeniería en [`docs/LIVEKIT_AUDIT.md`](LIVEKIT_AUDIT.md). La referencia viva oficial y única para videollamadas es **[`docs/LIVEKIT_AUDIT.md`](LIVEKIT_AUDIT.md)**.

> **Referencia Oficial de Documentación:** [LiveKit Official Docs & MCP Reference](https://docs.livekit.io/mcp)  
> **Estado:** **DOCUMENTO INTEGRADO Y CONSOLIDADO**  
> **Fuente de Verdad Única:** Todos los análisis de diseño, puntos ciegos, delimitaciones de alcance y patrones de código preventivos han sido formalmente unificados y elevados a normativa de ingeniería en:  
> 👉 **[`docs/LIVEKIT_AUDIT.md`](LIVEKIT_AUDIT.md): Guía Maestra & Checklist Preventivo de Implementación LiveKit SFU (WebRTC)**

---

## 📌 Resumen de la Consolidación Técnica

Durante la fase de especificación y arquitectura pre-desarrollo (Greenfield) del sistema VetConnect, se evaluaron exhaustivamente las directivas oficiales de LiveKit SFU. Para evitar dispersión documental o duplicidad de mantenimiento entre informes preliminares y guías preventivas, este documento formaliza el traspaso definitivo al documento maestro.

A continuación se resumen los 5 ejes canónicos integrados en la guía maestra:

### 1. Privacidad y Minimización de PII (Directiva 04)
- Prohibición estricta de incluir correos electrónicos (`user.email`) o números de teléfono en los claims del token (`identity` o `name`).
- Uso de identificadores opacos (`user.id`) y nombres de pila públicos (`user.firstName`).
- *Detalles y código en:* [`LIVEKIT_AUDIT.md §3 Directiva-04`](LIVEKIT_AUDIT.md#directiva-04-protección-de-pii-en-tokens-criptográficos-de-livekit).

### 2. Gestión del Ciclo de Vida de Salas Server-Side (Directiva 12)
- Integración de `RoomServiceClient.deleteRoom()` en `consultations.service.ts` para invalidar la sala WebRTC en el servidor al completar la consulta.
- *Detalles y código en:* [`LIVEKIT_AUDIT.md §3 Directiva-12`](LIVEKIT_AUDIT.md#directiva-12-destrucción-server-side-de-salas-deleteroom-al-finalizar-consulta).

### 3. Audio Limpio y Respeto a Preferencias del Usuario (Directivas 05 y 06)
- Supresión de cualquier elemento `<RoomAudioRenderer />` redundante fuera de `<VideoConference />` para erradicar el eco y la distorsión.
- Propagación directa de `LocalUserChoices` desde la pantalla `PreJoinModal` hacia `<LiveKitRoom>`.
- *Detalles y código en:* [`LIVEKIT_AUDIT.md §3 Directivas 05 y 06`](LIVEKIT_AUDIT.md#directiva-05-cero-duplicación-de-renderizadores-de-audio-roomaudiorenderer).

### 4. Protocolo de Handshake WebView para Mobile (Directiva 07)
- Erradicación de condiciones de carrera mediante el protocolo reactivo:
  1. La Web emite `page:ready` al montarse en el cliente.
  2. La App React Native en Expo aguarda dicho evento antes de transferir el token mediante `postMessage`.
- *Detalles y código en:* [`LIVEKIT_AUDIT.md §3 Directiva-07`](LIVEKIT_AUDIT.md#directiva-07-protocolo-de-handshake-bidireccional-web--mobile-webview).

### 5. Delimitación Estricta de Alcance (MVP v2.0 vs. Post-MVP)
- Definición de capacidades contempladas en los Sprints 7 y 8 (MVP) frente a extensiones futuras (grabación Egress, integración SIP, fondos virtuales).
- *Detalles y matriz en:* [`LIVEKIT_AUDIT.md §2 Delimitación de Alcance`](LIVEKIT_AUDIT.md#2-delimitación-de-alcance-scope-mvp-v20-vs-post-mvp-v22).

---

> ℹ️ **Instrucción para Agentes y Desarrolladores:**  
> Consultar e implementar exclusivamente las directivas prescritas en [`docs/LIVEKIT_AUDIT.md`](LIVEKIT_AUDIT.md) para cualquier tarea vinculada a videollamadas.
