# 📋 Plan de Proyecto, Gestión, Organización y Cronograma — ConectaVet (VetConnect)

> **Documento Maestro de Gestión de Proyecto, Planificación Ágil & Diseño DCU/UX**
> **Alineado con:** Estándares PMI (Project Management Institute), ISO 9241-210 (DCU), ISO 9241-11 (Usabilidad), WCAG 2.1 y Scrum/Scrumban Framework.
> **Proyecto:** ConectaVet (VetConnect) v2.0 — Plataforma Integral de Telemedicina Veterinaria
> **Fecha de Emisión:** Septiembre 2026
> **Estado:** `APPROVED (ACTIVE PROJECT MANAGEMENT PLAN)`

---

## 📑 Índice General

1. [Descripción General del Proyecto, Objetivos & PMV](#1-descripción-general-del-proyecto-objetivos--pmv)
2. [Análisis & Mapa de Stakeholders (Poder / Influencia vs. Interés)](#2-análisis--mapa-de-stakeholders-poder--influencia-vs-interés)
3. [Organización de Responsabilidades: Matriz RACI](#3-organización-de-responsabilidades-matriz-raci)
4. [Gestión del Cambio (Change Management) & Generación de Valor Agregado](#4-gestión-del-cambio-change-management--generación-de-valor-agregado)
5. [Diseño Centrado en el Usuario (DCU - ISO 9241-210) & Design Thinking](#5-diseño-centrado-en-el-usuario-dcu---iso-9241-210--design-thinking)
6. [Sistema de Diseño UX/UI, Usabilidad (ISO 9241-11) & Accesibilidad (WCAG)](#6-sistema-de-diseño-uxui-usabilidad-iso-9241-11--accesibilidad-wcag)
7. [Planificación Ágil por Sprints, Entregables & Incremento de Producto](#7-planificación-ágil-por-sprints-entregables--incremento-de-producto)
8. [Metodología de Seguimiento Scrumban, Flujo de Trabajo & WIP Limits](#8-metodología-de-seguimiento-scrumban-flujo-de-trabajo--wip-limits)
9. [Indicadores Clave de Rendimiento (KPIs del Proyecto)](#9-indicadores-clave-de-rendimiento-kpis-del-proyecto)
10. [Arquitectura de Software & Matriz de Selección Tecnológica](#10-arquitectura-de-software--matriz-de-selección-tecnológica)

---

## 1. Descripción General del Proyecto, Objetivos & PMV

### 1.1 El Problema a Resolver
La atención médica veterinaria tradicional presenta barreras geográficas, tiempos de espera elevados en salas de urgencias para consultas no críticas, y falta de digitalización e inmutabilidad en historias clínicas y recetas medicamentosas.

### 1.2 Objetivos del Proyecto
- **Objetivo General:** Desarrollar una plataforma telemédica omnicanal (Web y Mobile) de alta disponibilidad que digitalice y optimice la atención clínica entre tutores de mascotas y profesionales veterinarios.
- **Objetivos Específicos:**
  1. Reducir el tiempo P95 de espera en cola de triage a menos de 5 minutos.
  2. Ofrecer comunicación por chat en tiempo real (<100ms) y videollamadas WebRTC ultra baja latencia (<1500ms).
  3. Garantizar el 100% de cumplimiento del marco legal de protección de datos personales (Ley N° 25.326) y normativas de verificación profesional (SENASA).

### 1.3 Producto Mínimo Viable (PMV / MVP v2.0)
El PMV comprende:
- Registro/Login diferenciado por rol (`CLIENT`, `VET`, `ADMIN`).
- Registro y Ficha Clínica Digital de Mascotas con Soft-Delete.
- Cola de Triage en vivo y asignación de veterinarios matriculados.
- Chat médico bidireccional con idempotencia (`clientMsgId`) y adjuntos.
- Videollamadas WebRTC mediante LiveKit SFU (720p).
- Generación e inmutabilidad de Recetas Digitales estructuradas con firma/QR.
- Panel de Administración y Auditoría SENASA.

---

## 2. Análisis & Mapa de Stakeholders (Poder / Influencia vs. Interés)

Se identifican y analizan los actores internos y externos del proyecto según la matriz de **Poder/Influencia** (Eje Vertical) vs. **Interés** (Eje Horizontal):

```
+-----------------------------------------------------------------------------------------------+
|                                MATRIZ DE ANÁLISIS DE STAKEHOLDERS                             |
+-------------------+---------------------------------------+-----------------------------------+
| PODER / INFLUENCIA| BAJO INTERÉS                          | ALTO INTERÉS                      |
+-------------------+---------------------------------------+-----------------------------------+
| ALTO PODER        | 🟡 MANTENER SATISFECHOS               | 🔴 GESTIONAR ATENTAMENTE          |
|                   | • Organismos Reguladores (SENASA/DNPDP)| • Stakeholders Internos / Sponsor  |
|                   | • Proveedores Cloud (Supabase/LiveKit)| • Tech Lead / Equipo de Desarrollo|
+-------------------+---------------------------------------+-----------------------------------+
| BAJO PODER        | ⚪ MONITOREAR (MÍNIMO ESFUERZO)       | 🔵 MANTENER INFORMADOS            |
|                   | • Proveedores de Infraestructura gral | • Médicos Veterinarios (VETs)     |
|                   | • Auditores externos ocasionales      | • Tutores de Mascotas (CLIENTs)   |
|                   |                                       | • Comunidad de Clinicas Asoc.     |
+-------------------+---------------------------------------+-----------------------------------+
```

### Clasificación de Stakeholders:
1. **Stakeholders Internos:**
   - **Equipo de Desarrollo (Tech Lead, Mobile Lead, Web Lead, QA):** Alto Poder / Alto Interés $\to$ Ejecutores directos.
   - **Directivos / Sponsors:** Alto Poder / Alto Interés $\to$ Aprueban recursos y presupuesto.
2. **Stakeholders Externos:**
   - **Médicos Veterinarios:** Bajo Poder / Alto Interés $\to$ Usuarios clave de la plataforma profesional.
   - **Tutores de Mascotas:** Bajo Poder / Alto Interés $\to$ Beneficiarios finales de la atención.
   - **SENASA & Organismo de Protección de Datos (Ley 25.326):** Alto Poder / Bajo Interés $\to$ Cumplimiento legal y normativo obligatorio.

---

## 3. Organización de Responsabilidades: Matriz RACI

Para evitar duplicación de tareas, omisiones o sobrecargas, se define la asignación formal de responsabilidades mediante la **Matriz RACI**:
- **R - Responsible (Responsable):** Quien realiza efectivamente la tarea.
- **A - Accountable (Aprobador / Responsable Final):** Quien asume la responsabilidad última y aprueba.
- **C - Consulted (Consultado):** Experto consultado previo a la ejecución.
- **I - Informed (Informado):** Quien debe ser notificado del avance/resultado.

```
+-----------------------------------------------------------------------------------------------+
|                                  MATRIZ RACI DE CONECTAVET                                    |
+------------------------------------+-----------+------------+----------+----------+-----------+
| Entregables / Actividades          | Tech Lead | Backend Dev| Mobile Dev| Web Dev | QA / Test |
+------------------------------------+-----------+------------+----------+----------+-----------+
| Arquitectura del Sistema & SPEC    |   A / R   |     C      |    C     |    C     |     I     |
| Modelo de Datos Prisma & Migración |     A     |     R      |    I     |    I     |     I     |
| API REST Autenticación & Authz     |     A     |     R      |    I     |    I     |     C     |
| Socket.io Realtime Engine & Redis  |     A     |     R      |    C     |    C     |     C     |
| Integración LiveKit WebRTC Token   |     A     |     R      |    C     |    C     |     I     |
| Frontend Web Pro Portal (React 19) |     A     |     I      |    I     |    R     |     C     |
| Mobile App Native (Expo SDK 54)    |     A     |     I      |    R     |    I     |     C     |
| Pruebas Automatizadas (119+ tests) |     A     |     C      |    C     |    C     |     R     |
| Despliegue en Producción (Coolify) |   A / R   |     R      |    I     |    I     |     I     |
+------------------------------------+-----------+------------+----------+----------+-----------+
```

---

## 4. Gestión del Cambio (Change Management) & Generación de Valor Agregado

### 4.1 Gestión del Cambio (Change Management - PMI Framework)
Los cambios en proyectos tecnológicos son inevitables. ConectaVet aplica un protocolo de control de cambios:
1. **Evaluación de Impacto:** Todo requerimiento nuevo (ej. extensiones v2.1 de vacunas/calendario) se analiza en términos de costo, tiempo, arquitectura y riesgo.
2. **Aprobación de Cambio (CCB - Change Control Board):** El Tech Lead y el Product Owner aprueban o rechazan el cambio.
3. **Acompañamiento y Adopción:** Capacitación en interfaz para veterinarios y tutores mediante herramientas intuitivas de onboarding.

### 4.2 Generación de Valor Agregado
El valor del sistema no radica únicamente en la capacidad técnica de conectar video y chat, sino en su impacto real:
- **Experiencia UX Intuitiva:** Reducción de pasos para solicitar atención a menos de 3 clics.
- **Inclusión y Accesibilidad:** Cumplimiento de pautas WCAG 2.1 (alto contraste, compatibilidad con lectores de pantalla).
- **Eficiencia e Integridad:** Recetas médicas digitales inmutables con código QR que eliminan el uso de papel y previenen adulteraciones.

---

## 5. Diseño Centrado en el Usuario (DCU - ISO 9241-210) & Design Thinking

El desarrollo se fundamenta en la norma **ISO 9241-210** (Diseño Centrado en el Usuario para Sistemas Interactivos) y la metodología de 5 fases de **Design Thinking**:

```
+-----------------------------------------------------------------------------------------------+
|                                CICLO ITERATIVO DESIGN THINKING                                |
+------------------+----------------------------------------------------------------------------+
| Fase             | Descripción y Aplicación en ConectaVet                                     |
+------------------+----------------------------------------------------------------------------+
| 1. Empatizar     | Entrevistas con veterinarios y tutores. Mapeo de frustraciones y contexto. |
| 2. Definir       | Delimitación del problema de espera en emergencias y gestión de historias.|
| 3. Idear         | Sesiones de diseño para triage automático y llamadas en 1 solo clic.      |
| 4. Prototipar    | Creación de Wireframes y Mockups interactivos en Figma (Alta Fidelidad).   |
| 5. Evaluar       | Pruebas de usabilidad con usuarios reales para detectar barreras cognitivas.|
+------------------+----------------------------------------------------------------------------+
```

### Mapa de Empatía del Tutor de Mascota:
- **¿Qué piensa y siente?:** Preocupación por la salud de su mascota; necesidad de atención inmediata sin traslados estresantes.
- **¿Qué ve?:** Salas de espera abarrotadas; falta de historial médico unificado.
- **¿Qué oye?:** Recomendaciones contradictorias en internet.
- **¿Qué dice y hace?:** Busca atención rápida en su celular; valora la calidez del veterinario.
- **Frustraciones:** Perder tiempo en desplazamientos para dudas menores.
- **Necesidades:** Respuestas rápidas, recetas claras en su móvil e historial accesible.

---

## 6. Sistema de Diseño UX/UI, Usabilidad (ISO 9241-11) & Accesibilidad (WCAG)

### 6.1 Usabilidad (ISO 9241-11)
La usabilidad se evalúa en tres dimensiones:
1. **Eficacia:** 100% de éxito en la solicitud de consultas y emisión de recetas.
2. **Eficiencia:** Completar la solicitud de atención en menos de 60 segundos.
3. **Satisfacción:** Puntaje promedio de calificación (Review System) mayor a 4.5 / 5 estrellas.

### 6.2 Sistema de Diseño & Regla Cromática 60-30-10
Para garantizar consistencia visual y jerarquía clara:
- **60% Color Predominante (Fondos y Superficies):** `#F8FAFC` (Slate 50 / Blanco Neutro) — Sensación de limpieza clínica.
- **30% Color Secundario (Paneles, Tarjetas, Menús):** `#0F172A` (Slate 900) y `#1E293B` (Slate 800) — Estructura y contraste.
- **10% Color de Acento (Botones Principales, Llamados a la Acción):** `#2563EB` (Emerald / Medical Blue) y `#059669` (Teal Clínico) — Acciones primarias y estados activos.

### 6.3 Principios de Percepción Visual (Gestalt)
- **Proximidad:** Agrupamiento de datos del paciente y motivos de consulta en tarjetas aisladas.
- **Similitud:** Botones primarios, secundarios y destructivos con estilos idénticos en toda la app.
- **Continuidad:** Indicadores de paso (Stepper) para el proceso de triage y recetas.

---

## 7. Planificación Ágil por Sprints, Entregables & Incremento de Producto

El desarrollo se organiza en Sprints de 2 semanas, generando un **Incremento de Producto** funcional al final de cada ciclo:

```
+-----------------------------------------------------------------------------------------------+
|                                  CRONOGRAMA DE SPRINTS & ENTREGABLES                          |
+----------+------------------------------------+-----------------------------------------------+
| Sprint   | Objetivo Principal                 | Entregable Concreto / Incremento de Producto  |
+----------+------------------------------------+-----------------------------------------------+
| Sprint 1 | Arquitectura Base, Auth & DB       | Backend API funcional con JWT, Prisma & Seed. |
| Sprint 2 | Ficha de Mascotas & Cola Triage    | CRUD Mascotas y cola de espera WAITING/PENDING|
| Sprint 3 | Chat Médico Realtime & Idempotencia| Chat bidireccional Socket.io con clientMsgId. |
| Sprint 4 | Videollamadas LiveKit SFU          | Integración WebRTC 720p en Web y Mobile Bridge|
| Sprint 5 | Recetas Digitales, QR & SENASA Admin| Generador de recetas, firma, QR y auditoría. |
| Sprint 6 | Polish UX/UI, QA & Deploy Prod     | Aplicación desplegada en Coolify y Vercel.    |
+----------+------------------------------------+-----------------------------------------------+
```

---

## 8. Metodología de Seguimiento Scrumban, Flujo de Trabajo & WIP Limits

Se adopta **Scrumban** (combinación de ciclos por Sprints de Scrum con tablero visual Kanban):

### 8.1 Columnas del Tablero Kanban:
1. `Backlog` (Tareas priorizadas)
2. `To Do` (Seleccionadas para el Sprint)
3. `In Progress` (WIP Limit: Máximo 2 tareas por desarrollador)
4. `In Review / PR` (Código bajo revisión)
5. `Testing / QA` (Verificación de tests automatizados)
6. `Done` (Completado y verificado)

### 8.2 Eventos Ágiles:
- **Daily Standup (15 min):** ¿Qué hice ayer? ¿Qué haré hoy? ¿Hay bloqueos?
- **Sprint Review:** Demostración del incremento funcional a los stakeholders.
- **Sprint Retrospective:** Análisis de oportunidades de mejora del equipo.

---

## 9. Indicadores Clave de Rendimiento (KPIs del Proyecto)

Se definen **6 KPIs oficiales** para el seguimiento cuantitativo del proyecto:

```
+-----------------------------------------------------------------------------------------------+
|                                     MATRIZ DE KPIs DEL PROYECTO                               |
+-------------------+-----------------------------------+--------------------+------------------+
| Nombre del KPI    | Aspecto Medido                    | Forma de Registro  | Valor Objetivo   |
+-------------------+-----------------------------------+--------------------+------------------+
| KPI-01: Velocity  | Tareas completadas por Sprint     | Burndown Chart     | >= 90% estimadas |
| KPI-02: TestPass  | Cobertura de pruebas automatizadas| Jest / CI Pipeline | 100% pasando     |
| KPI-03: TriageP95 | Tiempo de espera en cola de triage| Logs Backend REST  | < 5 minutos      |
| KPI-04: ChatP95   | Latencia mensaje WebSocket (RTT)  | APM / Socket Metrics| < 80 ms         |
| KPI-05: WebRTC ICE| Tiempo de conexión a primer frame | LiveKit Telemetry  | < 1500 ms        |
| KPI-06: CSAT      | Satisfacción del tutor post-atención| Reseñas (Reviews)  | >= 4.7 / 5.0     |
+-------------------+-----------------------------------+--------------------+------------------+
```

---

## 10. Arquitectura de Software & Matriz de Selección Tecnológica

```
+-----------------------------------------------------------------------------------------------+
|                                  MATRIZ DE SELECCIÓN TECNOLÓGICA                              |
+-------------------+-----------------------+---------------------------------------------------+
| Componente        | Tecnología Adoptada   | Justificación Técnica / Criterio                  |
+-------------------+-----------------------+---------------------------------------------------+
| Backend Runtime   | Node.js 20 LTS        | Non-blocking I/O, alto rendimiento en E/S async.  |
| Web Framework     | Express 5 TypeScript  | Robustez, tipado estricto Zod y gran ecosistema.  |
| Persistencia      | PostgreSQL (Supabase) | Consistencia ACID, relacional e índices JSONB.    |
| ORM Layer         | Prisma ORM 6          | Migraciones seguras, type-safe query builder.     |
| Realtime Sockets  | Socket.io + Redis     | Múltiples salas, reconexión automática y cluster.|
| Video SFU         | LiveKit Cloud / SFU   | Ultra baja latencia WebRTC, simulcast adaptativo. |
| Web Frontend      | React 19 + Vite       | Renderizado veloz, concurrencia y SPA moderna.    |
| Mobile Frontend   | Expo SDK 54 / RN      | Desarrollo multiplataforma nativo con Expo Router.|
+-------------------+-----------------------+---------------------------------------------------+
```

---
*Plan de Proyecto y Gestión elaborado bajo estándares FAANG/PMI — Grupo Pinnacle 2026.*
