# 📝 Plantillas Operativas para el Agente Orquestador (`PROMPTS.md`)

> **Propósito:** Colección de prompts estandarizados para que el Agente Orquestador interactúe con el **Usuario**, con los **Agentes Especialistas** (`backend`, `frontend`, `mobile`, `qa`) y formule órdenes de trabajo para **Google Jules** vía MCP.

---

## 💬 1. Diálogo con el Usuario (Interacción Humano-Orquestador)

### 1.1 Plantilla: Entrevista Inicial & Captura de Visión (Estadio 0)
```markdown
¡Hola! Como Tech Lead y Orquestador del proyecto VetConnect, he revisado los requerimientos que planteas.

Para asegurar que la arquitectura técnica y la documentación queden 100% masterizadas antes de escribir código, necesito alinear estos puntos clave:
1. [Pregunta técnica o de negocio sobre el alcance, ej. flujos de usuario, roles o integraciones].
2. [Pregunta sobre fuentes de conocimiento, ej. notas en NotebookLM o directivas SENASA].
3. [Pregunta sobre prioridades de entrega, ej. backend primero, web o mobile].

Una vez acordemos estos puntos y me des tu visto bueno, procederé a masterizar toda la documentación técnica (contratos, modelos de datos, ADRs y Task Packets BDD).
```

### 1.2 Plantilla: Solicitud de Aprobación Formal de Documentación (Quality Gate 1)
```markdown
# 📋 Solicitud de Aprobación de Arquitectura & Plan de Acción (Gate 1)

He finalizado la masterización completa de la documentación técnica para [Requerimiento / Fase]:

### 🔍 Resumen del Dossier Técnico:
- **Modelos de Datos:** [Cambios o ratificación en Prisma schema].
- **Contratos de API:** [Nuevos endpoints REST y eventos Socket.io mapeados en TECH_REFERENCE].
- **Decisiones Arquitectónicas:** [ADRs asociados, ej. ADR-004, ADR-012].
- **Task Packets:** [Lista de tareas atómicas con criterios BDD Given/When/Then].
- **Seguridad & Cumplimiento:** Cero PII en tokens, soft-deletes, manejo de errores RFC 7807.

> **¿Apruebas formalmente esta documentación para dar inicio a la fase de desarrollo continuo con Google Jules y los agentes especialistas?**
*(Al recibir tu OK, el escuadrón comenzará a trabajar de forma ininterrumpida hasta completar el 100% de las tareas).*
```

### 1.3 Plantilla: Reporte de Avance Continuo de Fases (Estadio 3)
```markdown
🚀 **Actualización de Avance de Fases (Desarrollo Continuo):**
- **Fase en Curso:** [Fase X: Nombre de la fase].
- **Task Packet Completado:** [TASK-X.Y: Nombre de la tarea].
- **Resultado de Pruebas:** [X] tests pasando al 100% en verde.
- **Pull Request Generado por Jules:** [URL o branch `feat/task-X.Y`].
- **Siguiente Paso:** Avanzando de inmediato a [TASK-X.Z] sin detener el pipeline.
```

---

## 🛠️ 2. Comunicación con Agentes Especialistas de Capa

### 2.1 Asignación de Tarea a Agente de Dominio (Backend / Frontend / Mobile)
```markdown
Hola [Agente Backend | Frontend | Mobile | QA],

Se requiere implementar el siguiente requerimiento técnico:
- TÍTULO: [Breve descripción]
- MÓDULO: [auth | consultations | pets | call | etc.]
- ADRs ASOCIADOS: [ADR-004, ADR-012, etc.]

Por favor, elabora:
1. El análisis de impacto y contratos en `docs/TECH_REFERENCE.md`.
2. El Cerco de Seguridad (archivos a crear, modificar y prohibidos).
3. El paquete BDD (Given / When / Then) y la prueba TDD inicial.
4. El comando exacto de verificación local.

No escribas código en `main` hasta que el Cerco de Seguridad sea aprobado.
```

---

## ⚡ 3. Despacho de Sesión a Google Jules (MCP)

### 3.1 Prompt de Invocación para `jules_create_session`
```markdown
ROLE: FAANG Staff Software Engineer (VetConnect Specialist)
OBJECTIVE: Implement Task Packet [TASK-X.Y] on dedicated branch.

STRICT CONTRACTS (SSOT):
- Database & Models: `backend/prisma/schema.prisma`
- REST & Sockets: `docs/TECH_REFERENCE.md`
- Decisions: `docs/DECISIONS.md` (ADR-001 al ADR-026)

SAFETY FENCE:
- CREATING: [Lista estricta de archivos a crear]
- MODIFYING: [Lista estricta de archivos a modificar]
- STRICTLY FORBIDDEN: Any .env file, packages/shared, physical deletes, changing 1-5 star rating scale.

EXECUTION INSTRUCTIONS:
1. Write the failing unit/integration test first (TDD).
2. Implement minimum necessary logic in strict TypeScript (zero `any`).
3. Verify RFC 7807 error responses.
4. Self-verify locally: `npm run typecheck --workspaces` and `npm test --workspaces`.
5. Open PR to main with title `feat([task-id]): [description]`.
```

---

## 🛡️ 4. Auditoría y Aprobación de Pull Request (Code Review / Gate 4)

```markdown
CHECKLIST DE CERTIFICACIÓN DE PULL REQUEST:
- [ ] ¿El diff contiene archivos fuera del Cerco de Seguridad? (Si sí -> RECHAZADO).
- [ ] ¿Contiene algún `any` explícito o implícito? (Si sí -> RECHAZADO).
- [ ] ¿Se introdujo algún hardcode de calificaciones o métricas falsas? (Si sí -> RECHAZADO).
- [ ] ¿Los tests unitarios cubren los escenarios de borde y error RFC 7807?
- [ ] ¿Pasan `npm test` (160+ tests) y `npm run typecheck` sin warnings críticos?
- [ ] ¿El commit sigue la convención Conventional Commits (`feat:`, `fix:`)?
```
