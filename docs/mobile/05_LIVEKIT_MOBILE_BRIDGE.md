# 📱 05_LIVEKIT_MOBILE_BRIDGE — Video + Chat + Foto en Paralelo (ADR-012)

## Flujo implementado (no cambiar sin ADR)

1. `POST /api/calls/:consultationId/token → { token, wsUrl }` (`call/[consultationId].tsx:25-27`). Solo `ACTIVE`, participantes. Token `identity:user.id, name:firstName`, 0 PII.
2. `WebView uri=${WEB_CALL_URL}/call/${consultationId}` (`:114,124-133`) con `allowsInlineMediaPlayback`, `mediaPlaybackRequiresUserAction=false`, `javaScriptEnabled`, `domStorageEnabled`.
3. `page:ready → inject window.initLiveKitCall(token)` (`:57-69`); overlay `Preparando cámara…` hasta ready (`:118-123`); `call:ended → Alert → router.back()` (`:70-74`); `loading → Conectando con sala…` (`:80-87`); `hasPermission=false → pantalla permisos` (`:89-112`).
4. Web embebida monta solo `<VideoConference/>` (nunca `RoomAudioRenderer`), 720p 24-30fps ≤1.2Mbps H.264/VP8, simulcast, prioriza audio en 4G.

## UX clínica exigida (PiP / BottomSheet)

* Tutor narra mientras enfoca con trasera (`facingMode:'environment'` + autoenfoque en web). BottomSheet chat + botón cámara → `POST /api/media` → enviar `attachmentUrl` por `message:send` sin desmontar WebView. Vet en web ve split video + chat + lightbox zoom 100%.
* Ventana gracia 3min ante corte vet (`VET_DISCONNECTED_TIMEOUT` → reencolado `WAITING` prioritario); timeout triage 15min (`TIMEOUT_NO_VET_AVAILABLE`) vía push + socket.
* `ring`: `POST /calls/:id/ring` emite `call:incoming { consultationId, callerName:firstName, roomName }` + fallback Expo Push.
