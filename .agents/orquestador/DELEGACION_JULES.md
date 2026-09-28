# ⚡ Protocolo de Delegación hacia Google Jules vía MCP

> **Propósito:** Procedimiento técnico para que el Agente Orquestador despache tareas de codificación e implementación a **Google Jules** mediante el servidor MCP configurado.

---

## 🔌 1. Estado de la Conexión MCP

El servidor `jules-mcp` opera como puente local stdio configurado en:
`~/.gemini/config/mcp_config.json` con la clave de API oficial suministrada.

```bash
# Comprobación de conectividad local
npx -y jules-mcp --version
# Salida esperada: "Jules MCP server running via stdio"
```

---

## 🛠️ 2. Flujo de Invocación MCP Paso a Paso

### Paso 1: Identificar el Source ID del Repositorio
Antes de crear una sesión, se debe consultar el ID del repositorio `grupo-pinnacle/VetConnect` en Jules:
* **Tool MCP:** `jules_list_sources`
* **Parámetros:** `{}`
* **Resultado:** Obtener el `sourceId` correspondiente a `VetConnect`.

### Paso 2: Construir el Payload del Quirófano de Código
El prompt enviado a Jules debe seguir estrictamente la estructura estandarizada en `.jules/instructions.md` y `protocolo-nueva-feature-v3.md`:

```markdown
# TASK PACKET: [ID_TAREA] - [TÍTULO]

## 1. Contexto & BDD
- GIVEN: [Estado inicial del sistema y contratos involucrados]
- WHEN: [Acción o evento disparador]
- THEN: [Comportamiento esperado y respuesta esperada]

## 2. Cerco de Seguridad (Plan Mode Obligatorio)
- ARCHIVOS A CREAR:
  - [ruta/exacta/archivo1.ts]
- ARCHIVOS A MODIFICAR:
  - [ruta/exacta/archivo2.ts]
- ARCHIVOS PROHIBIDOS (OUT OF SCOPE):
  - [Cualquier otro módulo vecino, .env, migraciones destructivas]

## 3. Restricciones Técnicas Absolutas
- Cero `any` en TypeScript.
- Respuestas de error RFC 7807: { success: false, error: { code, message, timestamp } }.
- Soft-deletes con deletedAt (NUNCA prisma.*.delete() físico).
- Cero PII en tokens LiveKit o logs.
- TDD Primero: el test unitario/integración debe escribirse antes de la lógica.

## 4. Comando de Auto-Verificación
npm test -w [workspace] -- -t "[patron]"
npm run typecheck --workspaces
```

### Paso 3: Crear la Sesión en Jules
* **Tool MCP:** `jules_create_session`
* **Parámetros:**
  ```json
  {
    "sourceId": "<SOURCE_ID_OBTENIDO>",
    "prompt": "<PAYLOAD_DEL_QUIROFANO>",
    "requirePlanApproval": true
  }
  ```

### Paso 4: Aprobación del Plan de Ejecución
Jules generará un plan con la lista de archivos que planea modificar. El Orquestador revisa que el plan no viole el Cerco de Seguridad:
* Si el plan es correcto: invocar `jules_approve_plan({ "sessionId": "<SESSION_ID>" })`.
* Si el plan toca archivos prohibidos: enviar mensaje de corrección restringiendo el scope.

### Paso 5: Monitoreo y Recepción de PR
* **Tool MCP:** `jules_list_sessions`
* Monitorear hasta que el estado sea `COMPLETED`.
* Jules genera automáticamente una rama `feat/...` y un Pull Request en GitHub.
* El **Agente QA** ejecuta la suite local (`npm test`, `npm run typecheck`) sobre esa rama antes de aprobar el merge a `main`.
