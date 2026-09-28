# 🧠 Integración con NotebookLM vía MCP (Ingesta de Conocimiento & Síntesis)

> **Documento:** `.agents/orquestador/INTEGRACION_NOTEBOOKLM_MCP.md`  
> **Propósito:** Definir cómo el Agente Orquestador interactúa con **NotebookLM** a través del protocolo MCP para consultar libretas de notas, especificaciones técnicas, directivas clínicas y fuentes de investigación generadas en otras instancias de Antigravity o entornos de desarrollo.

---

## 🧭 1. El Rol de NotebookLM en la Arquitectura de VetConnect

NotebookLM actúa como el **cerebro de investigación y base de conocimiento profunda**. Contiene:
* Directivas médico-sanitarias y normativas de SENASA.
* Mapas de empatía, arquetipos de usuarios tutores y médicos veterinarios.
* Decisiones de diseño y notas preliminares de arquitectura de telemedicina.
* Criterios de evaluación de proyectos integradores y modelos de negocio.

El Agente Orquestador utiliza NotebookLM durante el **ESTADIO 1 (Masterización Documental)** para consolidar esos conocimientos y plasmarlos como especificaciones de ingeniería estrictas en la carpeta `docs/` de VetConnect.

---

## 🔌 2. Configuración del Servidor MCP de NotebookLM

En el entorno donde esté habilitada la integración con NotebookLM (sea en la máquina local o mediante bridge remoto), se registra el servidor MCP en `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-notebooklm"
      ],
      "env": {
        "NOTEBOOKLM_AUTH_TOKEN": "${NOTEBOOKLM_TOKEN}"
      }
    }
  }
}
```

---

## 🛠️ 3. Herramientas MCP y Flujo de Ingesta

El Orquestador utiliza las siguientes herramientas cuando el servidor MCP de NotebookLM está activo:

| Herramienta MCP | Entrada | Salida | Propósito |
|---|---|---|---|
| `notebooklm_list_notebooks` | `{}` | Lista de libretas y sus IDs | Identificar libretas sobre VetConnect, SENASA o Telemedicina |
| `notebooklm_query` | `{ notebookId, query }` | Respuesta fundamentada con citas | Extraer reglas clínicas, modelos y criterios de producto |
| `notebooklm_get_notes` | `{ notebookId }` | Notas estructuradas del usuario | Recuperar directivas de desarrollo redactadas en otra PC |

### Algoritmo de Ingesta y Transferencia a `docs/`:

```
1. Consultar NotebookLM con query temática:
   notebooklm_query({
     notebookId: "vetconnect-master",
     query: "¿Cuáles son los requisitos de validación de recetas SENASA y tiempo de prescripción?"
   })

2. El Orquestador sintetiza la respuesta y la traduce a:
   a) Un esquema Zod en backend/src/modules/prescriptions/prescriptions.schemas.ts
   b) Un contrato REST en docs/TECH_REFERENCE.md (§2.5)
   c) Un escenario BDD en docs/SPEC.md

3. Verificar que no existan contradicciones con la base de datos (schema.prisma).
```

---

## 🌉 4. Escenario de Convivencia Multi-PC

Dado que las notas de investigación de NotebookLM pueden residir en otra máquina o sesión:

1. **Si el bridge MCP está conectado en la sesión actual:**
   * El Orquestador consulta directamente las herramientas MCP de NotebookLM para enriquecer la documentación viva.
2. **Si las notas fueron exportadas a Markdown:**
   * El usuario o un agente puede copiar los archivos exportados a la carpeta temporal `docs/research/` o pegarlos en el chat.
   * El Orquestador absorbe el contenido, lo pasa por el filtro de coherencia con los 26 ADRs, actualiza la documentación canónica (`docs/TECH_REFERENCE.md`) y elimina borradores temporales.
3. **Persistencia en el Repositorio:**
   * Una vez masterizado un concepto proveniente de NotebookLM, este **debe quedar cristalizado en el repositorio Git** (en `docs/` o `backend/prisma/schema.prisma`). De este modo, tanto los agentes locales como **Google Jules** pueden leerlo sin depender de servicios externos en tiempo de compilación.
