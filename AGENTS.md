# 🤖 AGENTS.md — Guía de Operación para Agentes de IA & Estándar de Codificación (ConectaVet)

> **Propósito:** Este documento es la fuente primaria de instrucciones para cualquier agente de IA (Jules, Claude Code, Cursor, Copilot, etc.) que trabaje en el repositorio **ConectaVet (VetConnect)**. Define reglas para prevenir la alucinación por exceso de contexto, el estándar de codificación obligatorio, los antipatrones ("ejemplos de NO uso") y el plan de ejecución por fases para la codificación.

---

## 🛑 1. Reglas Anti-Alucinación y Gestión de Contexto

Para evitar que el agente alucine, asuma archivos inexistentes o tome decisiones fuera de estándar:

1. **Fuente Única de Verdad (Single Source of Truth):**
   - No asumir rutas ni nombres de archivos. Usar `list_files` y `read_file` antes de editar.
   - Toda norma técnica y de gestión debe alinearse con `docs/PLAN_DE_PROYECTO_Y_GESTION.md`, `docs/GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md`, `docs/PROPUESTA_MEJORAS_LIVEKIT.md` y `docs/TECH_REFERENCE.md`.
2. **Límite de Modificaciones:**
   - Realizar cambios pequeños, específicos y verificables.
   - Confirmar el resultado de cada edición mediante herramientas de lectura antes de avanzar.
3. **Manejo de Secretos y Variables de Entorno (`.env` Guardrail):**
   - **NUNCA** leer, editar, commitear ni imprimir claves secretas o archivos `.env`.
   - Modificar únicamente archivos `.env.example`.
4. **Validación de Dependencias:**
   - No agregar paquetes `npm` sin verificar si la funcionalidad ya está cubierta por la plataforma (`zod`, `prisma`, `jsonwebtoken`, `socket.io`, `livekit-server-sdk`).

---

## 🏗️ 2. Arquitectura & Estructura del Monorepo

```
conectavet/
├── backend/                        # API REST Node.js + Express 5 + TypeScript + Prisma 6
│   ├── prisma/schema.prisma        # Modelo PostgreSQL con mappings snake_case
│   └── src/modules/                # Módulos DDD: auth, users, pets, consultations, calls, media, notifications
├── web/                            # Frontend Web React 19 + Vite + Tailwind CSS + LiveKit Components
├── mobile/                         # Mobile React Native + Expo SDK 54 + Expo Router + NativeWind
└── docs/                           # Documentación maestra y guías técnicas
```

---

## 📏 3. Estándar de Codificación Obligatorio

### 3.1 Base de Datos & Prisma ORM
- **Mapeo Explicito SQL:** Todas las columnas multi-palabra deben usar `@map("nombre_columna")` en `schema.prisma`.
- **Soft-Deletes:** Usar `deletedAt DateTime? @map("deleted_at")`. NUNCA ejecutar borrado físico (`delete`).
- **Indexación:** Mantener índices compuestos para búsquedas frecuentes: `@@index([role, isOnline, deletedAt])`.

### 3.2 Backend API REST & Sockets
- **Validación Estricta:** Todo payload HTTP de entrada debe validarse con esquemas **Zod**.
- **Manejo de Errores Uniforme:** Errores HTTP estructurados con patrón RFC 7807 (`{ success: false, error: { code, message, timestamp } }`).
- **Autenticación JWT:** Validar firmas indicando explícitamente `algorithms: ['HS256']`. Controlar validez mediante `tokenVersion`.
- **Idempotencia en Chat:** Reintentos con `clientMsgId` existente deben retornar HTTP 200 con el registro preexistente, nunca HTTP 500.

### 3.3 Frontend Web & Mobile App
- **Tipado TypeScript:** Prohibido el uso de `any` explícito o implícito. Utilizar interfaces estrictas.
- **Acceso PII Cauteloso:** Redactar datos personales (email, teléfono) excepto cuando exista relación médica activa.
- **Manejo de UI Asíncrono:** Manejar estados de carga, error y reconexión en la interfaz.

---

## 🚫 4. Antipatrones Explícitos (Ejemplos de NO Uso)

### ❌ NO USO 1: Devolver Refresh Tokens en el JSON de respuesta
```typescript
// BAD: Expone el token de refresco a ataques XSS
app.post('/api/auth/login', async (req, res) => {
  return res.json({ accessToken, refreshToken });
});

// GOOD: Transmitir en cookie HttpOnly + Secure
res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
```

### ❌ NO USO 2: Exponer correos o PII en los tokens JWT de LiveKit
```typescript
// BAD: Inyecta email privado en los logs inmutables de LiveKit Cloud
const token = new AccessToken(apiKey, apiSecret, { name: req.user.email });

// GOOD: Usar ID opaco y nombre de pila público
const token = new AccessToken(apiKey, apiSecret, { identity: user.id, name: user.firstName });
```

### ❌ NO USO 3: Duplicar `RoomAudioRenderer` en llamadas WebRTC con React
```tsx
// BAD: Provoca eco, doble acople y distorsión de audio
<LiveKitRoom token={token}>
  <VideoConference />
  <RoomAudioRenderer /> {/* BAD: VideoConference ya incluye el renderer */}
</LiveKitRoom>

// GOOD: Usar exclusivamente VideoConference
<LiveKitRoom token={token}>
  <VideoConference />
</LiveKitRoom>
```

### ❌ NO USO 4: Devolver Error 500 ante colisión de `clientMsgId` en Chat
```typescript
// BAD: Asume que un reintento de red es un fallo catastrófico del servidor
catch (error) { return res.status(500).json({ error: "DB Error" }); }

// GOOD: Responder con HTTP 200 y el mensaje existente (Idempotencia)
if (error.code === 'P2002') {
  const existing = await prisma.message.findUnique({ where: { clientMsgId } });
  return res.status(200).json({ success: true, data: existing });
}
```

---

## 🚀 5. Plan de Ejecución para Empezar la Codificación (Fases 0 a 6)

El agente o desarrollador debe seguir estas fases ordenadas para implementar los cambios en el código:

```
+---------------------------------------------------------------------------------------------------+
|                                  PLAN DE EJECUCIÓN DE CODIFICACIÓN (F0 -> F6)                     |
+---------------+---------------------------------------------------+-------------------------------+
| Fase          | Objetivo Principal                                | Entregables Clave             |
+---------------+---------------------------------------------------+-------------------------------+
| FASE 0        | Guardarraíles & Verificación de Entorno          | Setup local, tests base ok    |
| FASE 1        | Correcciones P0 (Mapeos Prisma & JWT)             | Schema fix @map, algorithms   |
| FASE 2        | Corrección de PII, Paginación & Idempotencia      | PII Scrubbing, clientMsgId    |
| FASE 3        | LiveKit Refactoring (Server & Client)             | deleteRoom(), CallRoom fix    |
| FASE 4        | Bridge Mobile-Web Handshake                       | Handshake page:ready          |
| FASE 5        | Verificación Binaria Magic Bytes & S3 Storage     | Buffer magic bytes check      |
| FASE 6        | Pruebas Automatizadas & CI Validation             | Backend tests 100% passing    |
+---------------+---------------------------------------------------+-------------------------------+
```

### Detalle de Tareas por Fase:

#### 🔹 FASE 0: Guardarraíles y Verificación Inicial
1. Confirmar entorno local corriendo `cd backend && npm install`.
2. Verificar la suite de pruebas existente con `npm test`.

#### 🔹 FASE 1: Mapeos de Prisma y Seguridad Base (P0)
1. Corregir cualquier columna camelCase en `prisma/schema.prisma` agregando `@map("snake_case")`.
2. Fijar `algorithms: ['HS256']` en la verificación de tokens JWT en `auth.middleware.ts`.
3. Retornar respuestas genéricas en `auth.controller.ts` para prevenir la enumeración de usuarios.

#### 🔹 FASE 2: Protección de PII, Paginación e Idempotencia
1. Redactar email/teléfono del tutor en `pets.controller.ts` cuando el veterinario no posea consulta activa con la mascota.
2. Implementar captura de colisión `P2002` en `consultations.controller.ts` para devolver HTTP 200 con el mensaje existente ante duplicados de `clientMsgId`.

#### 🔹 FASE 3: Refactorización de Videollamadas LiveKit (Backend & Web)
1. Actualizar `calls.controller.ts` y `calls.service.ts` para pasar `identity: user.id` y `name: user.firstName` (eliminando emails de los claims).
2. Agregar `RoomServiceClient.deleteRoom()` en `consultations.service.ts` dentro de `completeConsultation`.
3. Remover `<RoomAudioRenderer />` duplicado en `web/src/components/call/CallRoom.tsx`.
4. Transmitir `LocalUserChoices` de `PreJoin` a `<LiveKitRoom>` y configurar calidad a 720p.

#### 🔹 FASE 4: Handshake Bidireccional Mobile-Web
1. Modificar `CallPage.tsx` para emitir `page:ready` al montarse.
2. Actualizar el contenedor `WebView` en `mobile/app/(app)/call/[consultationId].tsx` para aguardar `page:ready` antes de inyectar el token.

#### 🔹 FASE 5: Inspección de Archivos & Seguridad Media
1. Implementar la verificación binaria de Magic Bytes en `media.middleware.ts` (JPEG `FF D8 FF`, PNG `89 50 4E 47`, PDF `25 50 44 46`).
2. Sanitizar nombres de archivos para neutralizar Path Traversal.

#### 🔹 FASE 6: Pruebas Automatizadas & Validación Final
1. Ejecutar la suite completa de pruebas unitarias e integración en `backend`: `npm test`.
2. Validar que el typecheck de TypeScript pase en todo el monorepo sin errores: `npx tsc --noEmit`.

---
*Documento de Operación de Agentes ConectaVet — Grupo Pinnacle 2026.*
