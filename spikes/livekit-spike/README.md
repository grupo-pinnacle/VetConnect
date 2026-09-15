# 🔬 Spike Técnico: Integración LiveKit WebRTC & Teardown Determinista (VetConnect)

> **Objetivo del Spike:** Mitigar el riesgo técnico **R-06** antes del inicio del Sprint 7 y la Fase 4 (`TASK-4.1`).  
> **Ámbito:** Prueba de concepto aislada fuera del monorepo productivo para validar empíricamente las 3 directivas críticas de LiveKit SFU.

---

## 🎯 Criterios de Validación del Spike (Gates)

1. **Gate 1 — Emisión de Tokens Opacos sin PII (Directiva 1 & Antipatrón 2):**
   - El token JWT emitido utiliza como `identity` el identificador opaco del usuario (`user.id`), nunca su dirección de correo electrónico o número telefónico.
   - El campo `name` contiene únicamente el nombre de pila público del usuario.
   - La metadata del token se encuentra estrictamente vacía o anonimizada.
   - Si se detecta un intento de incluir `@` o formato telefónico en el identity, el emisor rechaza la solicitud de inmediato.

2. **Gate 2 — Teardown Determinista del Lado del Servidor (Directiva 3):**
   - Al finalizar una videoconsulta médica, el backend invoca `RoomServiceClient.deleteRoom(roomName)`.
   - Se destruye la sala en el SFU, forzando la desconexión limpia de todos los participantes y previniendo salas huérfanas con pistas de audio/video zombis.

3. **Gate 3 — Handshake Bidireccional para WebView Mobile (Directiva 5):**
   - El contenedor móvil en React Native espera el mensaje `{ type: 'page:ready' }` emitido por el WebView antes de inyectar el token WebRTC.
   - Se eliminan las condiciones de carrera (*race conditions*) durante la carga de la página.

---

## 🚀 Cómo Ejecutar el Spike

### 1. Variables de Entorno (Opcional para conexión a LiveKit Cloud)
Si se desea probar contra LiveKit Cloud Sandbox real, configurar:
```bash
LIVEKIT_API_KEY="devkey"
LIVEKIT_API_SECRET="secret"
LIVEKIT_URL="wss://vetconnect-dev.livekit.cloud"
```
*(Nota: El script incluye un emulador interno para ejecutarse sin credenciales de internet).*

### 2. Ejecutar la Prueba Automatizada
```bash
cd spikes/livekit-spike
npm test
```

### 3. Probar el Handshake del WebView
Abrir `spike-webview-bridge.html` en cualquier navegador para visualizar el ciclo de vida de conexión, simulación del bridge con React Native y renderizado de video.
