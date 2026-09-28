# 🔌 Guía de Integración Backend -> Google Jules vía MCP

> **Propósito:** Cómo el Agente Backend empaqueta y prepara tareas para que **Google Jules** las programe de forma autónoma.

---

## 📦 Estructura del Task Packet Backend para Jules

Cuando se delega una tarea a Jules a través del Agente Orquestador, se debe estructurar el prompt con los siguientes componentes:

1. **Definición de Esquema Prisma (si aplica):**
   - Si se requiere una nueva relación o índice, detallar el bloque exacto para `schema.prisma`.
   - Incluir `@map("snake_case")` en cada columna nueva y `@@map("plural")` en tablas.
2. **Esquemas Zod & DTOs:**
   - Ubicación: `backend/src/modules/<modulo>/<modulo>.schemas.ts`.
   - Definir validaciones estrictas (`z.string().min(1)`, `z.number().int()`).
3. **Casos de Prueba (Jest TDD):**
   - Ubicación: `backend/src/__tests__/<modulo>.test.ts`.
   - Incluir pruebas de éxito (200/201), validación fallida (400), no autorizado (401), prohibido (403) y no encontrado (404).
4. **Comando de Verificación para Jules:**
   ```bash
   npm test -w backend -- -t "<nombre_del_modulo>"
   npm run typecheck -w backend
   ```

---

## 🚫 Qué NUNCA encargar a Jules en Backend

* No pedirle que borre o migre destructivamente la base de datos de producción (`prisma migrate reset` está terminantemente prohibido).
* No pedirle que cree un workspace `packages/shared` (vetado formalmente por ADR-008).
* No pedirle que modifique archivos `.env` (solo `.env.example`).
