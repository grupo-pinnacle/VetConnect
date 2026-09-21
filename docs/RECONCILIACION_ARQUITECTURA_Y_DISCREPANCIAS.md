# 📜 Informe de Reconciliación Arquitectónica & Cierre de Discrepancias — VetConnect

> 🧊 **DOCUMENTO DE ARCHIVO HISTÓRICO / BASELINE INICIAL (READ-ONLY)**  
> *Este documento representa la línea base conceptual aprobada para el Kickoff del 1 de octubre de 2026. A partir de esa fecha, toda modificación o evolución técnica se gobierna exclusivamente en las 5 Fuentes Vivas de Ejecución (Tier 1: `docs/TECH_REFERENCE.md`, `docs/DECISIONS.md`, `PLAN_ACCION_VETCONNECT.md`, `docs/PLAN_DE_PROYECTO_Y_GESTION.md` y `AGENTS.md`). No editar este archivo de forma activa durante los sprints.*

---


> **Fecha:** Septiembre 2026  
> **Estado:** `RESOLVED & RATIFIED (FINAL GOVERNANCE RECORD)`  
> **Autores:** Senior Technical Program Manager & Solutions Architect (FAANG Tier)  
> **Propósito:** Documentar formalmente la resolución de las 4 discrepancias históricas detectadas en la auditoría de planificación y ratificar el alineamiento integral del repositorio en estado **100% Greenfield (pre-desarrollo desde cero)**.

---

## 🧭 1. Resumen Ejecutivo & Encuadre Greenfield

Durante la revisión exhaustiva de la documentación de VetConnect, se identificó que borradores iniciales de `AI_TECHLEAD_BRIEF.md` y `PLAN_ACCION_VETCONNECT.md` conservaban citas residuales a un prototipo previo (código descartado de laboratorios preliminares, menciones a commits históricos, líneas de archivos inexistentes y debates de cobertura de tests).

### Acciones de Corrección Ejecutadas:
1. **Purga Radical de Referencias a Código Previo:**  
   Se eliminó toda referencia a commits pasados (`commit 36d76f0`), auditorías antiguas ("2026-08-18"), referencias a líneas de archivos (`pets.service.ts:114-122`, `auth.middleware.ts:36`) y supuestos tests preexistentes ("159 vs 173 tests").
2. **Reencuadre como Backlog Greenfield y Guía Preventiva:**  
   [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md) fue completamente reestructurado como un backlog prescriptivo de **8 Fases (F0 a F7)** con **Task Packets** atómicos listos para su ejecución autónoma por **Google Jules** o desarrolladores. Cada tarea especifica los archivos a crear desde cero y los **antipatrones de diseño a prevenir**.
3. **Estatus de Madurez del Monorepo:**
   El repositorio se encuentra en **Nivel 4.5: Pre-Gold Master** con las Fases 0 a 5 completadas y verificadas (123 tests automatizados pasando al 100%). El foco activo es la elevación atómica de componentes en Storybook (`components/ui/`), QA E2E y hardening final.

---

## ⚖️ 2. Resolución de las 4 Contradicciones Arquitectónicas

A continuación se detalla la resolución definitiva de las 4 inconsistencias detectadas:

```
+----------------------------------------------------------------------------------------------------+
|                                MATRIZ DE RESOLUCIÓN DE DISCREPANCIAS                               |
+-----------------------------------+-----------------------------------+----------------------------+
| Discrepancia Detectada            | Estado Anterior (Borrador)        | Resolución Oficial Ratificada|
+-----------------------------------+-----------------------------------+----------------------------+
| 1. Choque de Numeración de ADRs   | Proponía crear ADR-009 a 011      | Preservados ADR-009 a 011  |
|                                   | colisionando con decisiones ya    | oficiales. Nuevas adiciones|
|                                   | existentes en DECISIONS.md.       | numeradas como ADR-022 y   |
|                                   |                                   | ADR-024 (24 ADRs en total).|
+-----------------------------------+-----------------------------------+----------------------------+
| 2. Registro de Veterinarios       | Conflicto: ADR-013 (bloqueante)   | Ratificado ADR-013: Flujo  |
|    (Sala de Espera SENASA)        | vs propuesta de auto-registro no  | estrictamente bloqueante   |
|                                   | bloqueante en borrador.           | (PENDING hasta aprobación).|
+-----------------------------------+-----------------------------------+----------------------------+
| 3. Plataforma de Deploy Web       | Cita cruzada como "ADR-015" o     | Vercel ratificado como     |
|                                   | ambigüedad Vercel/Hostinger.      | oficial (ADR-022). Hostinger|
|                                   |                                   | queda como contingencia.   |
+-----------------------------------+-----------------------------------+----------------------------+
| 4. Escala de Calificación         | AI_TECHLEAD_BRIEF decía 1–10;     | Estandarizado universalmente|
|    (Review médica)                | PLAN_ACCION trataba 1–5.          | en 1 a 5 estrellas (ADR-023)|
|                                   |                                   | en DB, API, Web y Mobile.  |
+-----------------------------------+-----------------------------------+----------------------------+
```

---

### 2.1 Contradicción 1: Numeración de ADRs Unificada (ADR-001 al ADR-024)
* **Diagnóstico:** El registro oficial en [`docs/DECISIONS.md`](DECISIONS.md) ya contaba con 21 decisiones aprobadas, entre ellas:
  - **ADR-009:** *Mensajería Tiempo Real con Socket.io & Redis Adapter*.
  - **ADR-010:** *Almacenamiento Resiliente Multi-Cloud (S3 + Fallback Local)*.
  - **ADR-011:** *Notificaciones Push con Expo Push API & Bandeja In-App*.
* **Resolución Oficial:** Se mantuvieron intactos los ADR-001 al ADR-021. Las decisiones arquitectónicas de despliegue web, calificación médica y máquina de estados se numeraron secuencialmente como **ADR-022**, **ADR-023** y **ADR-024**, erradicando cualquier solapamiento o sobreescritura.

---

### 2.2 Contradicción 2: Registro de Veterinarios Estrictamente Bloqueante (ADR-013)
* **Diagnóstico:** Existía una contradicción entre la arquitectura oficial de cumplimiento legal (SENASA) y una propuesta de borrador de auto-registro no bloqueante.
* **Resolución Oficial:** Se ratificó el diseño **bloqueante** de la Sala de Espera Profesional ([`docs/DECISIONS.md`](DECISIONS.md) — ADR-013):
  - Todo usuario que se registra con rol `VET` inicia con `vetStatus: 'PENDING'`.
  - El sistema **bloquea el acceso a la sala de atención médica, colas de triage, chat sincrónico, videollamadas y emisión de recetas** hasta que un Administrador valida manualmente la matrícula profesional habilitante en el panel de control (`PATCH /api/admin/vets/:id/approve`).
  - Queda formalmente **descartado y superseded** cualquier diseño de auto-registro no bloqueante, blindando la responsabilidad médico-legal de la plataforma.

---

### 2.3 Contradicción 3: Despliegue Web Definitivo en Vercel (ADR-022)
* **Diagnóstico:** Ambigüedad sobre la plataforma principal de hosting web y confusión en el número de ADR (se citaba erróneamente ADR-015, el cual corresponde formalmente a TanStack React Query v5).
* **Resolución Oficial:**
  - **ADR-017:** Gobierna el despliegue del Backend Node.js y clúster Redis sobre un servidor VPS autohosteado con **Coolify** y proxy reverso Traefik (SSL automático).
  - **ADR-022:** Establece formalmente a **Vercel** como la plataforma oficial de producción para el Frontend Web SPA (React 18.3.1 LTS + Vite), integrada de forma nativa al pipeline de CI/CD (`.github/workflows/ci.yml`) con preview deployments por Pull Request.
  - **Hostinger:** Se cataloga formalmente **fuera del pipeline de CI/CD**, como una **alternativa de contingencia manual** (subida manual de `web/dist/` vía SFTP a `public_html/` ante caídas mayores de Vercel).

---

### 2.4 Contradicción 4: Escala de Calificación Médica Unificada en 1 a 5 Estrellas (ADR-023)
* **Diagnóstico:** Discrepancia entre menciones de escala 1–10 en briefs preliminares frente a 1–5 estrellas en planes de UX y KPIs.
* **Resolución Oficial:** Se formalizó la escala universal de **1 a 5 estrellas** (enteros del 1 al 5) mediante **ADR-023**:
  - **Modelo Relacional (`docs/SPEC.md`):** Entidad `Review` con clave foránea a `Consultation`, `User` (cliente), `User` (veterinario), y campo `int rating "1 a 5 estrellas"`.
  - **Contratos REST (`docs/TECH_REFERENCE.md`):** Endpoint `POST /api/consultations/:id/review` con validación Zod `z.number().int().min(1).max(5)`.
  - **Recálculo Denormalizado (ADR-019):** Actualización atómica en transacción Prisma de los campos `rating_avg` (Float) y `rating_count` (Int) en la tabla `users`.
  - **Alineación de KPIs:** Coherencia total con el indicador de satisfacción CSAT de [`docs/PLAN_DE_PROYECTO_Y_GESTION.md`](PLAN_DE_PROYECTO_Y_GESTION.md) (KPI-07).

---

## 📊 3. Matriz de Concordancia Documental del Repositorio

Todos los documentos del repositorio han sido verificados y se encuentran 100% alineados:

| Archivo | Rol en el Ecosistema | Estado de Concordancia |
|---|---|:---:|
| [`README.md`](../README.md) | Portal maestro del proyecto y quickstart Greenfield | ✅ 100% Alineado |
| [`AGENTS.md`](../AGENTS.md) | Sistema Operativo de Agentes de IA y Antipatrones | ✅ 100% Alineado |
| [`AI_TECHLEAD_BRIEF.md`](../AI_TECHLEAD_BRIEF.md) | Brief del Agente Orquestador (cero asunción de código) | ✅ 100% Alineado |
| [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md) | Backlog de Tareas Greenfield F0 a F7 (Jules-Ready) | ✅ 100% Alineado |
| [`GUIA_EJECUCION_VETCONNECT.md`](../GUIA_EJECUCION_VETCONNECT.md) | Manual de ejecución local DX y ADB reverse | ✅ 100% Alineado |
| [`docs/PROJECT_CHARTER.md`](PROJECT_CHARTER.md) | Gobernanza, WBS y cronograma (Kick-off 01-Oct-2026) | ✅ 100% Alineado |
| [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitectura de Sistemas, Monolito Modular y C4 | ✅ 100% Alineado |
| [`docs/DECISIONS.md`](DECISIONS.md) | Registro oficial de 24 ADRs (ADR-001 al ADR-024) | ✅ 100% Alineado |
| [`docs/SPEC.md`](SPEC.md) | ERD, FSM, contratos REST y eventos Socket.io | ✅ 100% Alineado |
| [`docs/TECH_REFERENCE.md`](TECH_REFERENCE.md) | Referencia técnica de endpoints, Prisma y Zod | ✅ 100% Alineado |
| [`docs/LIVEKIT_AUDIT.md`](LIVEKIT_AUDIT.md) | Guía Maestra & Checklist Preventivo LiveKit SFU | ✅ 100% Alineado |
| [`docs/PROPUESTA_MEJORAS_LIVEKIT.md`](PROPUESTA_MEJORAS_LIVEKIT.md) | Hoja de ruta consolidada hacia la Guía Maestra | ✅ 100% Alineado |
| [`docs/DEPLOY.md`](DEPLOY.md) | Infraestructura: Coolify (VPS) + Vercel (ADR-022) | ✅ 100% Alineado |
| [`docs/SISTEMA_DE_DISENO.md`](SISTEMA_DE_DISENO.md) | Sistema de Diseño UX/UI (60-30-10, Inter/Jakarta) | ✅ 100% Alineado |
| [`docs/PRESENTACION_EJECUTIVA.md`](PRESENTACION_EJECUTIVA.md) | Deck ejecutivo de 11 diapositivas de alta densidad | ✅ 100% Alineado |
| [`docs/PLAN_DE_PROYECTO_Y_GESTION.md`](PLAN_DE_PROYECTO_Y_GESTION.md) | Plan de Proyecto, Product Backlog, Sprints y KPIs | ✅ 100% Alineado |
| [`docs/MINUTA_STAKEHOLDER_2026-09.md`](MINUTA_STAKEHOLDER_2026-09.md) | Requerimientos acordados y Roadmap v2.1+ | ✅ 100% Alineado |



---

## 📅 4. Reconciliación del Cronograma & Gobernanza Dual de Backlogs

### 4.1 Alineamiento Definitivo del Cronograma (Project Charter vs. Plan de Proyecto)
- **Diagnóstico:** En borradores preliminares del Project Charter subsistía un diagrama Gantt de 7 semanas derivado de una estimación temprana de laboratorio, mientras que el texto narrativo y el Plan de Proyecto establecían el estándar canónico de **20 semanas (10 Sprints de 2 semanas)** culminando el **17 de Febrero de 2027**.
- **Resolución Oficial:** El diagrama Gantt y la tabla de hitos de [`docs/PROJECT_CHARTER.md`](PROJECT_CHARTER.md) §4 fueron formalmente sincronizados con [`docs/PLAN_DE_PROYECTO_Y_GESTION.md`](PLAN_DE_PROYECTO_Y_GESTION.md) §8.2. Los 5 hitos (M0 a M4) mapean exactamente a los 10 Sprints del 01-Oct-2026 al 17-Feb-2027, con dos buffers de contingencia técnica integrados (Sprint 8 y Sprint 10).

### 4.2 Modelo de Gobernanza Dual: Product Backlog (PB) ↔ Agent Backlog (TASK)
- **Diagnóstico:** Coexistencia de 40 ítems de backlog (`PB-01` a `PB-40`) organizados por Sprints para humanos frente a 20 paquetes de tareas (`TASK-0.1` a `TASK-7.2`) organizados por Fases para agentes de IA.

- **Resolución Oficial:** Se estableció formalmente el principio de **Gobernanza Dual**:
  - **Lente Humana / Scrumban (`PB-01..40`):** Destinada al seguimiento del equipo, métricas de avance por sprint y reporting de producto a stakeholders en [`docs/PLAN_DE_PROYECTO_Y_GESTION.md`](PLAN_DE_PROYECTO_Y_GESTION.md).
  - **Lente Agéntica / TDD (`TASK-0.1..7.2`):** Destinada a la ejecución técnica autónoma por agentes de IA (**Google Jules**) con criterios de aceptación atómicos y comandos de verificación en [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md).
  - **Matriz de Equivalencia Biunívoca:** Incorporada en ambos documentos para asegurar que cualquier avance de un agente en un Task Packet impacte directamente sobre su ítem PB correspondiente en el tablero Scrumban.

### 4.3 Protocolo de Gobernanza Documental Post-Kickoff (01 de Octubre de 2026)
Para evitar sobrecarga de mantenimiento en un equipo ágil de 5 personas durante la fase de construcción de código:
1. **Documentos Fundacionales Congelados (Baselines):** [`docs/BRIEF.md`](BRIEF.md), [`docs/PROJECT_CHARTER.md`](PROJECT_CHARTER.md) y este informe de reconciliación quedan como actas aprobadas y estables de la fase pre-desarrollo.
2. **Documentos Vivos de Ejecución (Living Truth):**  
   - Gestión y Sprints: [`docs/PLAN_DE_PROYECTO_Y_GESTION.md`](PLAN_DE_PROYECTO_Y_GESTION.md).
   - Backlog Técnico para Agentes: [`PLAN_ACCION_VETCONNECT.md`](../PLAN_ACCION_VETCONNECT.md).
   - Decisiones de Arquitectura: [`docs/DECISIONS.md`](DECISIONS.md) (ADRs 001 al 024).

   - Contratos Técnicos: [`docs/TECH_REFERENCE.md`](TECH_REFERENCE.md) y [`docs/LIVEKIT_AUDIT.md`](LIVEKIT_AUDIT.md).

---
*VetConnect Governance Record — Documento Oficial de Reconciliación de Arquitectura 2026.*
