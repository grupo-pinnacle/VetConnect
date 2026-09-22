# 📘 Guía Oficial de Buenas Prácticas de Desarrollo, Antipatrones (Ejemplos de NO uso), Puntos Ciegos y Propuesta LiveKit — VetConnect

> **Documento Oficial de Estándares de Ingeniería & Arquitectura (FAANG Tier)**
> **Aplica a:** Backend API, Web Client, Mobile App y Servicios de Infraestructura
> **Fecha de Emisión:** Septiembre 2026
> **Estado:** `APPROVED (OFFICIAL DOCUMENTATION STANDARD)`

---

## 📑 Índice General

1. [Visión General & Propósito](#1-visión-general--propósito)
2. [Módulo 1: Autenticación, Gestión de Identidad e IAM](#2-módulo-1-autenticación-gestión-de-identidad-e-iam)
3. [Módulo 2: Mascotas, Historias Clínicas y Protección de Datos PII](#3-módulo-2-mascotas-historias-clínicas-y-protección-de-datos-pii)
4. [Módulo 3: Consultas Telemáticas, Triage & Máquinas de Estado (FSM)](#4-módulo-3-consultas-telemáticas-triage--máquinas-de-estado-fsm)
5. [Módulo 4: Comunicación en Tiempo Real (Socket.io & Redis Adapter)](#5-módulo-4-comunicación-en-tiempo-real-socketio--redis-adapter)
6. [Módulo 5: Recetas Digitales Estructuradas & Firma Médica](#6-módulo-5-recetas-digitales-estructuradas--firma-médica)
7. [Módulo 6: Almacenamiento de Adjuntos, Media & Inspección Binaria](#7-módulo-6-almacenamiento-de-adjuntos-media--inspección-binaria)
8. [Módulo 7: Notificaciones Push, Preferencias & Eventos Async](#8-módulo-7-notificaciones-push-preferencias--eventos-async)
9. [Módulo 8: Auditoría Inmutable & Cumplimiento Legal SENASA](#9-módulo-8-auditoría-inmutable--cumplimiento-legal-senasa)
10. [Módulo 9: Integración de Videollamadas WebRTC (Propuesta Oficial LiveKit)](#10-módulo-9-integración-de-videollamadas-webrtc-propuesta-oficial-livekit)
11. [Matriz Global de Scope (MVP v2.0 vs Post-MVP v2.2+)](#11-matriz-global-de-scope-mvp-v20-vs-post-mvp-v22)

---

## 1. Visión General & Propósito

Esta guía establece el marco normativo de ingeniería de software para todo el ecosistema **VetConnect**. Define de manera explícita las **buenas prácticas obligatorias**, los **antipatrones o ejemplos de NO uso** que deben evitarse o corregirse en el código, los **puntos ciegos y contradicciones identificadas**, y la propuesta completa de integración de videollamadas con **LiveKit**.

---

## 2. Módulo 1: Autenticación, Gestión de Identidad e IAM

### 🟢 Buenas Prácticas Obligatorias
- **Fijación de Algoritmo JWT:** Verificar firmas JWT especificando explícitamente el algoritmo permitido (`algorithms: ['HS256']`).
- **Revocación Atómica (`tokenVersion`):** Incrementar el campo entero `tokenVersion` en el modelo `User` ante cambios de contraseña, cierres de sesión globales o baneo administrativo.
- **Cookies Seguras:** Transmitir refresh tokens únicamente en cookies `HttpOnly`, `Secure` y `SameSite` (`isProduction ? 'none' : 'lax'`). En producción cross-domain (`app.vetconnect.com.ar` hacia `api.vetconnect.com.ar`), se exige `SameSite=None; Secure` para permitir el envío de cookies entre subdominios bajo HTTPS.
- **Mensajes de Error Genéricos:** Prevenir la enumeración de usuarios respondiendo `"Credenciales inválidas"` tanto para correos no registrados como para contraseñas incorrectas.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Devolver tokens de refresco en el body JSON
app.post('/api/auth/login', async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);
  // BAD: El refresh token queda expuesto a scripts maliciosos (XSS) en localStorage o memoria cliente
  return res.json({ accessToken, refreshToken });
});

// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Decodificar token sin verificar firma ni algoritmo
import jwt from 'jsonwebtoken';
const payload = jwt.decode(token); // BAD: Vulnerable a falsificación de JWT ("alg": "none")

// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Revelar existencia de cuenta en errores de login
if (!user) {
  return res.status(404).json({ message: "El correo usuario@gmail.com no existe" }); // BAD: Permite enumeración de usuarios
}
```

---

## 3. Módulo 2: Mascotas, Historias Clínicas y Protección de Datos PII

### 🟢 Buenas Prácticas Obligatorias
- **Acceso Basado en Relación Clínica (Least Privilege PII Redaction):** Un veterinario solo puede acceder a la PII completa del tutor (teléfono, email, dirección) si tiene o tuvo una consulta activa con la mascota.
- **Soft-Delete Inmutable:** Utilizar banderas `deletedAt` y mapeo `@map("deleted_at")` para cumplir con el período legal de conservación de historias clínicas sin borrar datos.
- **Saneamiento de PII:** Cuando un usuario solicita la eliminación de su cuenta (Ley N° 25.326), anonimizar los datos personales (`email = anon_${uuid}@deleted.vetconnect.internal`) conservando la ficha clínica inalterada.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Exponer PII del tutor sin validar relación de consulta
app.get('/api/pets/:id', async (req, res) => {
  // BAD: Cualquier usuario o veterinario autenticado puede ver el teléfono y email privado del tutor
  const pet = await prisma.pet.findUnique({
    where: { id: req.params.id },
    include: { owner: true } // Revela PII completa
  });
  return res.json(pet);
});

// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Borrado físico de mascotas con DELETE SQL
await prisma.pet.delete({ where: { id: petId } }); // BAD: Destruye el historial médico inmutable
```

---

## 4. Módulo 3: Consultas Telemáticas, Triage & Máquinas de Estado (FSM)

### 🟢 Buenas Prácticas Obligatorias
- **Transiciones Estrictas de Estado (ADR-024):** La consulta debe seguir la máquina de estados finita determinista de 4 estados: `WAITING` $\to$ `ACTIVE` $\to$ `COMPLETED` (o `CANCELLED`). La auto-asignación desde `WAITING` a veterinarios online aprobados transiciona atómicamente a `ACTIVE` sin estados intermedios ambiguos de oferta.
- **Verificación de Matrícula SENASA:** Un veterinario solo puede tomar una consulta de la cola si su estado profesional es `vetStatus === 'APPROVED'`.
- **Transacciones Atómicas:** Ejecutar las asignaciones y cierres dentro de un bloque `prisma.$transaction`.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Asignar consulta sin validar estado profesional SENASA
app.patch('/api/consultations/:id/assign', async (req, res) => {
  // BAD: Permite que un veterinario con matrícula rechazada o PENDING atienda pacientes
  const updated = await prisma.consultation.update({
    where: { id: req.params.id },
    data: { vetId: req.user.id, status: 'ACTIVE' }
  });
});

// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Saltear estados en la máquina de estados
// Pasar de WAITING directamente a COMPLETED sin haber estado en ACTIVE
```

---

## 5. Módulo 4: Comunicación en Tiempo Real (Socket.io & Redis Adapter)

### 🟢 Buenas Prácticas Obligatorias
- **Idempotencia por `clientMsgId`:** La API de chat y el gateway de Sockets deben tratar los reintentos de mensajes con la misma clave `clientMsgId` de forma transparente (retornando HTTP 200 con el mensaje existente en lugar de error 500).
- **Clustering con Redis Adapter:** Sincronizar salas de WebSocket entre réplicas del backend usando `@socket.io/redis-adapter`.
- **CORS Restrictivo:** Validar el orígen de las conexiones Socket en producción contra la lista blanca oficial.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Lanza error 500 al recibir un mensaje duplicado por reintento de red
try {
  await prisma.message.create({ data: { clientMsgId, content, consultationId } });
} catch (error) {
  // BAD: Retorna 500 Internal Server Error cuando la BD arroja P2002 (Unique constraint failed)
  return res.status(500).json({ error: "Database error" });
}

// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): CORS totalmente abierto en WebSockets de producción
const io = new Server(httpServer, {
  cors: { origin: "*" } // BAD: Vulnerable a Cross-Site WebSocket Hijacking
});
```

---

## 6. Módulo 5: Recetas Digitales Estructuradas & Firma Médica

### 🟢 Buenas Prácticas Obligatorias
- **Restricción de Emisión:** Solo el veterinario asignado a una consulta activa o completada puede emitir prescripciones.
- **Generación de Hash/QR:** Incluir código QR y firma con hash SHA-256 para validación en farmacias.
- **Inmutabilidad:** Las recetas una vez creadas no pueden ser modificadas ni eliminadas (`UPDATE` y `DELETE` bloqueados).

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Permitir edición de una receta ya emitida
app.patch('/api/prescriptions/:id', async (req, res) => {
  // BAD: Violación legal de trazabilidad de medicamentos controlados
  await prisma.prescription.update({ where: { id: req.params.id }, data: req.body });
});
```

---

## 7. Módulo 6: Almacenamiento de Adjuntos, Media & Inspección Binaria

### 🟢 Buenas Prácticas Obligatorias
- **Verificación por Magic Bytes:** Inspeccionar los primeros bytes del buffer en memoria para validar la firma binaria real del archivo (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, PDF: `25 50 44 46`).
- **Sanitización de Nombres:** Sanitizar el nombre del archivo para prevenir ataques de Path Traversal (`../../`).
- **Almacenamiento Persistente en S3:** Utilizar Amazon S3 o S3-compatible con URLs firmadas (`presigned URLs`) de expiración corta.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Confiar únicamente en la extensión o MIME Type del cliente
app.post('/api/media', upload.single('file'), (req, res) => {
  // BAD: Un atacante puede subir malware.exe renombrado a foto.jpg si solo se evalúa req.file.mimetype
  if (req.file.mimetype === 'image/jpeg') { saveFile(req.file); }
});

// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Vulnerabilidad a Path Traversal al servir archivos
app.get('/uploads/:filename', (req, res) => {
  // BAD: Un request a /uploads/../../.env expone secretos del servidor
  res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
});
```

---

## 8. Módulo 7: Notificaciones Push, Preferencias & Eventos Async

### 🟢 Buenas Prácticas Obligatorias
- **Ejecución Asíncrona (Fire-and-Forget / Queue):** El envío de notificaciones push no debe bloquear la respuesta HTTP de las llamadas a la API REST.
- **Sanitización de Tokens Expirados:** Remover automáticamente de la base de datos los tokens Expo que retornen error `DeviceNotRegistered`.
- **Respeto de Ocultamiento (`isHidden`):** Omitir el envío de recordatorios o alertas automáticas si el tutor marcó la mascota como oculta.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Bloquear la API REST esperando respuesta del servicio Push externo
app.post('/api/consultations', async (req, res) => {
  const consultation = await createConsultation(req.body);
  // BAD: Si Expo Push API tarda 3 segundos o falla, la API REST se demora o cae
  await expoPushClient.sendPushNotification(vetToken, "Nueva consulta");
  return res.json(consultation);
});
```

---

## 9. Módulo 8: Auditoría Inmutable & Cumplimiento Legal SENASA

### 🟢 Buenas Prácticas Obligatorias
- **AuditLog Inmutable:** Registrar en la tabla `AuditLog` toda acción administrativa sensible (aprobación/rechazo de veterinario, modificación de roles, baneo de usuarios) incluyendo IP, ID de administrador, timestamp y detalles.
- **Trazabilidad Legal:** Almacenar de forma inalterable las historias clínicas y atenciones por el plazo dispuesto por la regulación sanitaria veterinaria.

### ❌ Ejemplos de NO Uso (Antipatrones a Evitar)

```typescript
// ❌ EJEMPLO DE NO USO (ANTIPATRÓN): Modificar datos administrativos sin generar registro de auditoría
app.patch('/api/admin/vets/:id/approve', async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { vetStatus: 'APPROVED' } });
  // BAD: No se genera AuditLog. Imposible saber qué administrador aprobó la matrícula en una auditoría SENASA.
});
```

---

## 10. Módulo 9: Integración de Videollamadas WebRTC (Propuesta Oficial LiveKit)

### 🟢 Normativa Oficial LiveKit ([https://docs.livekit.io/mcp](https://docs.livekit.io/mcp))

#### 1. PII Scrubbing en Tokens
```typescript
// ✅ BUENA PRÁCTICA: Usar IDs opacos y nombres públicos sin emails
const token = new AccessToken(apiKey, apiSecret, {
  identity: user.id,          // ID opaco (NO poner req.user.email)
  name: user.firstName,        // Nombre de pila (NO poner email ni teléfono)
  ttl: '1h',
});
```

#### 2. Cierre Server-Side de Salas (`deleteRoom`)
```typescript
// ✅ BUENA PRÁCTICA: Destruir la sala en LiveKit Server al completar la consulta médica
import { RoomServiceClient } from 'livekit-server-sdk';
const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

await prisma.consultation.update({ where: { id: consultationId }, data: { status: 'COMPLETED' } });
await roomService.deleteRoom(`consultation-${consultationId}`); // Desconecta a todos los pares
```

#### 3. Frontend Web (`CallRoom.tsx`) & Evitar Eco
- **NO USO:** NUNCA agregar `<RoomAudioRenderer />` cuando ya se renderiza `<VideoConference />` (produce eco).
- **BUENA PRÁCTICA:** Propagar las elecciones de `PreJoin` (`LocalUserChoices`) a `<LiveKitRoom>` y capturar errores de WebRTC:

```tsx
<LiveKitRoom
  serverUrl={serverUrl}
  token={token}
  connect={true}
  video={userChoices.videoEnabled}
  audio={userChoices.audioEnabled}
  options={{
    videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
  }}
  onError={(err) => handleWebRTCError(err)}
  onMediaDeviceFailure={(device) => handleHardwareError(device)}
/>
```

#### 4. Handshake WebView Móvil
Para evitar race conditions, la página web emite `page:ready` al estar montada, y el cliente móvil envía el token por `postMessage` solo tras recibir `page:ready`.

---

## 11. Matriz Global de Scope (MVP v2.0 vs Post-MVP v2.2+)

```
+-----------------------------------------------------------------------------------------------+
|                                  MATRIZ GLOBAL DE DELIMITACIÓN DE SCOPE                       |
+---------------------------------------------------+-------------------------------------------+
| DENTRO DEL SCOPE (MVP v2.0)                       | FUERA DEL SCOPE (Post-MVP v2.2+)          |
+---------------------------------------------------+-------------------------------------------+
| • Autenticación JWT con tokenVersion.             | • Login Biométrico Nativo (FaceID/Passkey)|
| • Ficha Clínica Digital y Soft-Delete.            | • Sincronización HL7 / FHIR con clínicas. |
| • Triage y Cola de Atención en tiempo real.       | • Asignación automatizada por IA/ML.      |
| • Chat Médico con deduplicación por clientMsgId.  | • Traducción automática de chat.          |
| • Recetas Digitales con QR y firma inmutable.     | • Integración directa con farmacias online|
| • Verificación binaria de adjuntos (Magic Bytes).| • Reconocimiento de imágenes médicas por IA|
| • Notificaciones Push asíncronas vía Expo.        | • WhatsApp Business API Integration.      |
| • Videollamadas LiveKit 720p con deleteRoom().   | • SDK Nativo React Native (@livekit/rn).  |
| • Registros de Auditoría para Administradores.    | • Grabación de videollamadas (LiveKit Egress)|
+---------------------------------------------------+-------------------------------------------+
```

---
*Documentación oficial de ingeniería VetConnect — Grupo Pinnacle 2026.*
