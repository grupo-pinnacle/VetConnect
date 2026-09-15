# 🖥️ Presentación Ejecutiva del Proyecto — VetConnect

> 🧊 **DOCUMENTO DE ARCHIVO HISTÓRICO / BASELINE INICIAL (READ-ONLY)**  
> *Este documento representa la línea base conceptual aprobada para el Kickoff del 1 de octubre de 2026. A partir de esa fecha, toda modificación o evolución técnica se gobierna exclusivamente en las 5 Fuentes Vivas de Ejecución (Tier 1: `docs/TECH_REFERENCE.md`, `docs/DECISIONS.md`, `PLAN_ACCION_VETCONNECT.md`, `docs/PLAN_DE_PROYECTO_Y_GESTION.md` y `AGENTS.md`). No editar este archivo de forma activa durante los sprints.*

---


> **Sistemas de Información & Gestión de Proyectos de Software**  
> **Formato:** Diapositivas Ejecutivas de Alta Densidad Visual  
> **Proyecto:** VetConnect — Plataforma Integral de Telemedicina Veterinaria & Gestión Clínica  
> **Equipo:** Tobias Vera (Tech Lead), Damian Orellana (Web), Juan Mendoza (Mobile), Ezequiel Charca (QA)  
> **Stakeholders:** Médicos Veterinarios, Tutores de Mascotas, SENASA  
> **Fecha:** Septiembre 2026

---

<!-- SLIDE 1: PORTADA -->
```
====================================================================================================
  DIAPOSITIVA 1 | IDENTIDAD & VISIÓN DEL PROYECTO
====================================================================================================
```

# 🐾 VetConnect
### *Plataforma Integral de Telemedicina Veterinaria & Gestión Clínica de Alta Disponibilidad*

```mermaid
mindmap
  root((🐾 VetConnect))
    Telemedicina en Vivo
      Videoconsulta WebRTC 720p
      Chat Medico Idempotente
    Triaje Inteligente
      Clasificacion de Urgencias
      Espera P95 menor a 5 min
    Salud Animal Digital
      Ficha Medica con Soft-Delete
      Microchip Estandar ISO
    Legal & Seguridad
      Matriculas SENASA Auditables
      Recetas Digitales con QR
      Cumplimiento Ley 25.326
```

> **Misión:** Democratizar el acceso a la atención médica veterinaria primaria mediante telemedicina regulada, reduciendo la espera clínica y erradicando la automedicación de mascotas.

---

<!-- SLIDE 2: EL PROBLEMA VS LA OPORTUNIDAD -->
```
====================================================================================================
  DIAPOSITIVA 2 | DIAGNÓSTICO: PROBLEMA VS. OPORTUNIDAD
====================================================================================================
```

## ⚠️ La Problemática Actual vs. La Solución VetConnect

```
+-------------------------------------------------------+-------------------------------------------------------+
|              🔴 SITUACIÓN ACTUAL (PROBLEMA)           |           🟢 PROPUESTA VETCONNECT (OPORTUNIDAD)        |
+-------------------------------------------------------+-------------------------------------------------------+
| • Guardias presenciales saturadas por consultas leves.| • Triage remoto en vivo: derivación en < 5 minutos.   |
| • Tutores sin transporte o con barreras geográficas.  | • Atención omnicanal instantánea (Web + Móvil).       |
| • Automedicación animal y consultas por WhatsApp.     | • Canal médico regulado con trazabilidad legal.       |
| • Pérdida recurrente de historias clínicas en papel.  | • Historia clínica digital unificada e inmutable.     |
| • Ejercicio profesional sin resguardo legal formal.   | • Validación SENASA y recetas electrónicas con QR.   |
+-------------------------------------------------------+-------------------------------------------------------+
```

```mermaid
graph LR
    P["🚨 Urgencia del Tutor"] --> W["❌ WhatsApp Informal\n(Sin historial ni validez)"]
    P --> C["❌ Guardia Colapsada\n(Horas de espera y estres)"]
    P --> V["✅ VetConnect\n(Triage <5min + Video HD + Receta QR)"]
    style V fill:#059669,stroke:#047857,color:#ffffff
    style W fill:#ef4444,stroke:#b91c1c,color:#ffffff
    style C fill:#f59e0b,stroke:#d97706,color:#ffffff
```

---

<!-- SLIDE 3: USUARIOS Y NECESIDADES -->
```
====================================================================================================
  DIAPOSITIVA 3 | USUARIOS OBJETIVO & MAPA DE VALOR
====================================================================================================
```

## 👥 Arquetipos de Usuario & Propuesta de Valor

```mermaid
flowchart TD
    subgraph Users["Ecosistema de Usuarios"]
        T["🐶 TUTOR DE MASCOTA\n(CLIENT)"]
        V["🩺 MÉDICO VETERINARIO\n(VET)"]
        A["⚖️ AUDITOR / REGULADOR\n(ADMIN)"]
    end

    subgraph Value["Valor Generado"]
        VT["• Orientación médica inmediata\n• Historial en su celular 24/7\n• Recetas digitales con QR"]
        VV["• Consultas remotas organizadas\n• Resguardo de matrícula profesional\n• Emisión ágil de recetas"]
        VA["• Fiscalización de matrículas SENASA\n• Auditoría de logs inmutables\n• Cumplimiento Ley 25.326"]
    end

    T --> VT
    V --> VV
    A --> VA
```

---

<!-- SLIDE 4: PRODUCTO MÍNIMO VIABLE (PMV) -->
```
====================================================================================================
  DIAPOSITIVA 4 | ALCANCE DEL PRODUCTO MÍNIMO VIABLE (PMV v2.0)
====================================================================================================
```

## 🎯 Arquitectura de Alcance: En Alcance vs. Fuera de Alcance

```mermaid
flowchart LR
    subgraph InScope["✅ En Alcance (PMV v2.0)"]
        direction TB
        I1["🔐 Autenticación JWT con tokenVersion"]
        I2["🐾 Ficha Digital de Mascotas (CRUD Soft-Delete)"]
        I3["⏱️ Cola Triage y Auto-Asignación Médica"]
        I4["💬 Chat Sockets con Idempotencia (clientMsgId)"]
        I5["📹 Videoconsulta WebRTC LiveKit SFU (720p)"]
        I6["📋 Receta Médica Digital con Firma y QR"]
        I7["🛡️ Panel Admin con Aprobación SENASA"]
        I8["🚀 Deploy VPS Coolify + Vercel Edge"]
    end

    subgraph OutScope["❌ Fuera de Alcance (Roadmap v2.1+)"]
        direction TB
        O1["🚑 Despacho de Ambulancias de Rescate"]
        O2["🛒 Tienda E-commerce de Alimentos"]
        O3["💉 Reemplazo de Vacunas Presenciales"]
        O4["💳 Pasarela de Pagos Compleja / Split"]
    end
```

---

<!-- SLIDE 5: REQUERIMIENTOS PRIORITARIOS -->
```
====================================================================================================
  DIAPOSITIVA 5 | REQUERIMIENTOS DEL SISTEMA
====================================================================================================
```

## 📋 Pirámide de Requerimientos Funcionales y No Funcionales

```
+---------------------------------------------------------------------------------------------------+
| [NIVEL 1: CRÍTICOS]    RF-01 (Auth JWT) | RF-03 (Triage) | RF-05 (Chat) | RF-07 (Video LiveKit)    |
| [NIVEL 2: OPERATIVOS]  RF-02 (CRUD Pets) | RF-04 (Auto-Asignación) | RF-08 (Receta QR) | RF-09 (Admin)|
| [NIVEL 3: EXPERIENCIA] RF-06 (Magic Bytes) | RF-10 (Review 1-5 Estrellas) | Soft-Deletes Clínicos |
+---------------------------------------------------------------------------------------------------+
```

```mermaid
graph TD
    subgraph RNF["⚡ Requerimientos No Funcionales Clave"]
        R1["⚡ Latencia Chat: RTT < 80 ms"]
        R2["📹 Video WebRTC: Handshake < 1500 ms"]
        R3["🛡️ Seguridad: Cookies HttpOnly + HS256"]
        R4["🔒 Privacidad: Cero PII en LiveKit & Sockets"]
        R5["♿ Accesibilidad: Norma WCAG 2.1 Nivel AA"]
        R6["🧪 Calidad: Cobertura > 80% (120+ Tests Jest)"]
    end
```

---

<!-- SLIDE 6: ARQUITECTURA TÉCNICA & ACTIVIDAD 24 -->
```
====================================================================================================
  DIAPOSITIVA 6 | DISEÑO DE ARQUITECTURA DEL SISTEMA (ACTIVIDAD 24)
====================================================================================================
```

## 🏛️ Organización del Sistema, Consenso del Equipo & Stack Tecnológico

```
+---------------------------------------------------------------------------------------------------+
| PROCESO METODOLÓGICO DE TOMA DE DECISIÓN (ACTIVIDAD 24 — 6 ETAPAS):                              |
| 1. Análisis: Triage en vivo, videoconsulta, tutores/vets, complejidad media-alta, equipo de 4 devs.|
| 2. Modelos: Comparación Cliente-Servidor, 3 Capas, Monolito Modular vs Microservicios (Descartado)|
| 3. Decisión: Monolito Modular en 3 Capas (DDD) + Servicios Especializados de Tiempo Real (SFU).    |
| 4. Justificación: Consistencia ACID estricta, cero latencia inter-módulos y TypeScript compartido.|
| 5. Tecnologías: React 19, Expo SDK 54, Node 20/Express 5, Prisma 6, Postgres 16, LiveKit & Redis 7|
| 6. Gráfico: Arquitectura desacoplada con protocolos REST/HTTPS, WebSockets WSS y WebRTC UDP.      |
+---------------------------------------------------------------------------------------------------+
```

```mermaid
graph TB
    subgraph Clientes["Capas de Presentación (Clientes Heterogéneos)"]
        W["💻 Web Pro Portal\nReact 19 + Vite + Tailwind"]
        M["📱 Mobile App Tutores\nExpo SDK 54 + NativeWind"]
    end

    subgraph API["Capa de Lógica de Negocio (Backend Monolito Modular)"]
        E["🚀 Node.js 20 LTS + Express 5 (TypeScript Estricto)"]
        Z["🛡️ Validación de Contratos Zod + Middleware JWT"]
        S["⚡ Clúster Socket.io + Redis Adapter"]
        L["📹 LiveKit SFU (WebRTC 720p Adaptativo)"]
    end

    subgraph Datos["Capa de Persistencia & Almacenamiento"]
        P["🗄️ PostgreSQL 16 (Relacional ACID)"]
        ORM["💎 Prisma ORM 6 (Snake_case Mappings)"]
        R["🔴 Redis 7 (Sesiones & Pub/Sub)"]
    end

    W -->|REST / HTTPS| Z
    M -->|REST / HTTPS| Z
    W -->|WebSockets| S
    M -->|WebSockets| S
    W -.->|WebRTC UDP| L
    M -.->|WebRTC UDP| L
    Z --> E
    E --> ORM
    ORM --> P
    S --> R
```


---

<!-- SLIDE 7: SISTEMA DE DISEÑO UX/UI (ACTIVIDAD 26) -->
```
====================================================================================================
  DIAPOSITIVA 7 | SISTEMA DE DISEÑO DEL PRODUCTO (ACTIVIDAD 26)
====================================================================================================
```

## 🎨 Experiencia de Usuario (UX) & Sistema de Diseño (UI)

```mermaid
graph LR
    subgraph UX["1. Experiencia de Usuario (UX)"]
        F1["🐶 Tutor con Urgencia"] --> F2["⏱️ Triage Guiado < 60s"]
        F2 --> F3["📹 Videoconsulta 720p"]
        F3 --> F4["📋 Receta Digital QR"]
    end

    subgraph UI["2. Interfaz de Usuario (UI)"]
        C1["🎨 Estilo Clean Clinical Modernism"]
        C2["📐 Regla 60-30-10: Slate 50 / Slate 900 / Med Blue"]
        C3["🔤 Tipografía: Inter + Plus Jakarta Sans"]
        C4["🧩 UI Kit: Lucide Icons + Badges Triage + Cards"]
    end

    UX --> UI
```

```
+---------------------------------------------------------------------------------------------------+
| SÍNTESIS DEL SISTEMA DE DISEÑO (ACTIVIDAD 26):                                                    |
| • Estilo Visual: Clean Clinical Modernism (superficies asépticas, bordes rounded-xl, sin fricción)|
| • Paleta 60-30-10: 60% Slate 50 (#F8FAFC) | 30% Slate 900 (#0F172A) | 10% Medical Blue (#2563EB)  |
| • Tipografía: Inter (cuerpo/datos clínicos) + Plus Jakarta Sans (títulos cálidos y legibles)      |
| • Fundamento Teórico: Leyes de Fitts (botones 48px), Hick (triage cerrado), Miller y WCAG 2.1 AA  |
+---------------------------------------------------------------------------------------------------+
```

---

<!-- SLIDE 8: METODOLOGÍA & ORGANIZACIÓN DEL EQUIPO -->
```
====================================================================================================
  DIAPOSITIVA 8 | METODOLOGÍA SCRUMBAN & EQUIPO DE TRABAJO
====================================================================================================
```

## 🔄 Marco Metodológico Scrumban & Gobernanza del Equipo

```mermaid
graph LR
    subgraph Scrumban["Flujo Continuo con WIP Limits"]
        B["Backlog"] --> T["To Do\n(Sprint)"]
        T --> P["In Progress\n(WIP: 2/dev)"]
        P --> R["Code Review\n(WIP: 2)"]
        R --> Q["QA / CI\n(WIP: 3)"]
        Q --> D["Done\n(DoD)"]
    end
```

### 👥 Integrantes & Estrategia de Rotación de Roles

```
+-------------------+-----------------------------------+---------------------------------------+
| Integrante        | Rol Especializado Principal       | Estrategia de Rotación Activa         |
+-------------------+-----------------------------------+---------------------------------------+
| Tobias Vera       | Tech Lead & Solutions Architect   | Facilitador Ágil (S1-S2); CI Mentor.  |
| Damian Orellana   | Frontend Web Lead (React 19)      | Facilitador Ágil (S3-S4); Cross-Test. |
| Juan Mendoza      | Mobile App Lead (Expo SDK 54)     | Facilitador Ágil (S5-S6); Cross-Test. |
| Ezequiel Charca   | QA Automation & Security Lead     | Facilitador Ágil (S7-S8); Security PR.|
+-------------------+-----------------------------------+---------------------------------------+
```

---

<!-- SLIDE 9: PLANIFICACIÓN ÁGIL DE SPRINTS -->
```
====================================================================================================
  DIAPOSITIVA 9 | PLANIFICACIÓN ÁGIL POR SPRINTS (1 AL 10)
====================================================================================================
```

## 🚀 Hoja de Ruta de los 10 Sprints de Desarrollo

```mermaid
timeline
    title Hoja de Ruta de los 10 Sprints de VetConnect
    section Cimientos & Auth
      Sprint 1 : Scaffolding Monorepo & Docker
      Sprint 2 : Autenticacion JWT & Sesiones
    section UI & Gestion
      Sprint 3 : Landing Page & Navbar
      Sprint 4 : Panel Admin & Validacion SENASA
    section Core Medico
      Sprint 5 : CRUD Mascotas & Soft-Delete
      Sprint 6 : Formularios Triage en Vivo
    section Realtime & Video
      Sprint 7 : Chat Sockets & Magic Bytes
      Sprint 8 : Videoconsulta LiveKit WebRTC
    section Calidad & Deploy
      Sprint 9 : Usabilidad ISO 9241 & Recetas QR
      Sprint 10 : 120+ Tests Jest & Deploy Coolify
```

```
+---------------------------------------------------------------------------------------------------+
| MÉTRICAS DEL BACKLOG:  40 Tareas Técnicas (PB-01 a PB-40) | 139 Story Points Totales              |
| VELOCIDAD ESTIMADA:    ~14 SP por Sprint (Equipo de 4 Desarrolladores)                            |
+---------------------------------------------------------------------------------------------------+
```

---

<!-- SLIDE 10: CUADRO DE MANDO DE KPIS -->
```
====================================================================================================
  DIAPOSITIVA 10 | CUADRO DE MANDO DE KPIS (ACTIVIDAD 21)
====================================================================================================
```

## 📊 Tablero Integral de Control y Rendimiento

```
+----------+----------------------------+-----------------------+--------------------+------------------+
| KPI      | Indicador Clave            | Ámbito Estratégico    | Registro / Fuente  | Meta Objetivo    |
+----------+----------------------------+-----------------------+--------------------+------------------+
| KPI-01   | Sprint Completion Rate     | ⚡ Sprint Específico   | Burndown Chart     | >= 90% tareas    |
| KPI-02   | Delayed Tasks & Spillover  | ⚡ Sprint y Proyecto   | Tablero Kanban     | < 5% atrasos     |
| KPI-03   | Team Participation Index   | 👥 Equipo de Trabajo  | RACI / Git PRs     | Desviación <=15% |
| KPI-04   | Test Coverage & CI Pass    | 🚀 Calidad Producto   | Jest / CI Pipeline | 100% verde (>80%)|
| KPI-05   | Triage Queue P95           | 🚀 Producto y Negocio | Logs Backend REST  | P95 < 5 minutos  |
| KPI-06   | Realtime & WebRTC Latency  | 🚀 Rendimiento Técnico| APM / LiveKit Tele | WS<80ms ICE<1.5s |
| KPI-07   | CSAT & Retención           | 🌐 Proyecto General   | Calificación 1 a 5 | CSAT >= 4.7 / 5  |
+----------+----------------------------+-----------------------+--------------------+------------------+
```

> **Protocolo de Ajuste Dinámico:** Dos sprints consecutivos sin alcanzar meta $\to$ Acción correctiva inmediata en la Sprint Retrospective (reducción de alcance, refactorización técnica o redistribución de carga RACI).

---

<!-- SLIDE 11: GOBERNANZA FORMAL & GANTT -->
```
====================================================================================================
  DIAPOSITIVA 11 | GOBERNANZA FORMAL, MATRIZ RACI & HITOS
====================================================================================================
```

## 📅 Cronograma Maestro de 20 Semanas & Matriz RACI

```mermaid
gantt
    title Cronograma Estrategico de Hitos VetConnect
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section M0: Scaffolding & Auth
    Sprints 1 y 2 - Monorepo, DB & JWT        :crit, m0, 2026-10-01, 2026-10-28

    section M1: UI & Admin SENASA
    Sprints 3 y 4 - Layouts & Auditoria       :m1, 2026-10-29, 2026-11-25

    section M2: Core Clinico & Triage
    Sprints 5 y 6 - CRUD Mascotas & Cola Viva :m2, 2026-11-26, 2026-12-23

    section M3: Realtime & WebRTC
    Sprints 7 y 8 - Chat Sockets & LiveKit SFU:m3, 2026-12-24, 2027-01-20

    section M4: Calidad & Despliegue
    Sprints 9 y 10 - Recetas QR, Tests & Prod :crit, m4, 2027-01-21, 2027-02-17
```

```
+---------------------------------------------------------------------------------------------------+
| RESUMEN DE RESPONSABILIDADES RACI:                                                                |
| • Arquitectura & Backend Core: Tobias Vera (A/R) | Damian (C) | Juan (C) | Ezequiel (C)           |
| • Experiencia Web Pro (React 19): Damian Orellana (A/R) | Tobias (A) | Ezequiel (C)               |
| • App Móvil Tutores (Expo SDK 54): Juan Mendoza (A/R) | Tobias (A) | Ezequiel (C)                 |
| • Testing Automatizado & Seguridad: Ezequiel Charca (A/R) | Tobias (A) | Damian (C) | Juan (C)    |
| • Auditoría Legal & Aprobación SENASA: Lara / Sponsor (A/R) | Tobias (C)                          |
+---------------------------------------------------------------------------------------------------+
```

---

## 🎯 Conclusión Ejecutiva

VetConnect cuenta con una planificación exhaustiva, blindaje normativo (SENASA y Ley 25.326), arquitectura de alta disponibilidad y una hoja de ruta ágil de 10 Sprints perfectamente delimitada para iniciar la ejecución del código con calidad de nivel FAANG.
