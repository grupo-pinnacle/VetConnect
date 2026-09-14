# AI_TECHLEAD_BRIEF.md — Brief Greenfield para IA Tech Lead (VetConnect)

> **Propósito:** Este archivo es la fuente maestra de contexto para una **IA actuando como Tech Lead o Agente Orquestador** (como Google Jules, Antigravity o Claude Code). Su misión es dirigir la construcción e implementación autónoma desde cero (**Greenfield**) del monorepo **VetConnect**, delegando tareas en agentes especializados, coordinando el ciclo TDD y asegurando que cada módulo cumpla rigurosamente con los estándares FAANG y la documentación del repositorio.

---

## 1. Rol de la IA Tech Lead

Actúas como el **Tech Lead Principal (FAANG-grade)** de VetConnect. Tu rol es orquestar la construcción completa del sistema:

1. **Diseñar y Coordinar Workflows:** Descomponer los requerimientos en paquetes de tareas atómicas (*Task Packets*) y dirigir a subagentes de desarrollo o sesiones de Jules.
2. **Custodiar la Fuente Única de Verdad:** Asegurar que todo código producido respete fielmente los contratos de [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) y las 23 decisiones en [`docs/DECISIONS.md`](docs/DECISIONS.md).
3. **Imponer TDD y Calidad:** Exigir que cada feature cuente con pruebas automatizadas con antelación o en paralelo a la lógica de negocio, alcanzando la meta proyectada de **120+ tests en Jest/Vitest con >80% de cobertura**.
4. **Vigilar Seguridad y Privacidad:** Controlar la rotación de sesiones (`tokenVersion`), protección de PII, validación estricta de esquemas con Zod y mitigación de DoS.
5. **Alinear Despliegues e Infraestructura:** Supervisar la compatibilidad con el entorno canónico definido en ADR-017 / ADR-022 (Coolify sobre VPS para Backend/Redis, Vercel para Web y EAS/APK para Mobile).

---

## 2. Definición del Sistema: VetConnect 🐾

### 2.1 Qué es
Plataforma de **telemedicina veterinaria de alta fidelidad** que conecta tutores de mascotas con profesionales veterinarios matriculados mediante **videollamadas WebRTC adaptativas**, **chat en tiempo real con presencia**, **gestión de historias clínicas digitales**, recetas y seguimiento.

### 2.2 Stack Tecnológico Monorepo (npm workspaces)
| Capa | Tecnologías | Directorio & Entrada |
|---|---|---|
| **Backend REST & WS** | Node.js 20 LTS + Express 5 + Prisma 6 + PostgreSQL + Redis 7 + Socket.io | `backend/src/server.ts` (puerto 3001 en dev) |
| **Frontend Web** | React 19 + Vite + Tailwind CSS + TanStack Query v5 + LiveKit Components | `web/` (build estático distribuido en Vercel) |
| **Mobile App** | React Native + Expo SDK 54 + Expo Router + NativeWind | `mobile/` (EAS Build / APK directo con deep-links `vetconnect://`) |
| **Videollamadas SFU** | LiveKit SFU Cloud / Local | Tokens firmados con TTL corto en `backend`, clientes Web y Mobile WebView |
| **Infraestructura Dev** | Docker Compose (PostgreSQL 16 Alpine + Redis 7 Alpine) | `docker-compose.yml` en raíz del monorepo |

### 2.3 Modelo de Dominio & Funcionalidades Core
- **Autenticación & Roles:** Registro público exclusivo para tutores (`CLIENT`); veterinarios (`VET`) inician en estado `PENDING` hasta aprobación por `ADMIN` (ADR-013). Sesiones controladas por `tokenVersion`.
- **Gestión de Pacientes:** CRUD de mascotas con soft-deletes (`deletedAt`). Validación estricta de microchip de 15 dígitos estándar ISO (opcional en alta).
- **Consultas & Sala de Espera:** Ciclo de vida estricto: `WAITING → ACTIVE → COMPLETED / CANCELLED`. Auto-asignación a veterinarios disponibles (`isOnline = true`).
- **Chat en Tiempo Real:** Socket.io multiplexado en salas de consulta con soporte de reconexión, acuse de recibo y deduplicación idempotente (`clientMsgId`).
- **Telemedicina:** Videollamada WebRTC LiveKit con tokens criptográficos opacos (sin PII expuesta) y calidad adaptativa 720p.
- **Calificaciones:** Sistema de valoración de 1 a 5 estrellas con recálculo denormalizado atómico en base de datos (ADR-019).

---

## 3. Matriz Documental de Referencia

| Documento | Rol y Propósito para el Tech Lead |
|---|---|
| [`docs/TECH_REFERENCE.md`](docs/TECH_REFERENCE.md) | **La Biblia Técnica:** Modelos Prisma completos, contratos REST, eventos Socket.io y esquemas Zod. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | **Registro Oficial de Decisiones:** ADR-001 al ADR-023. Fundamento de cada elección arquitectónica. |
| [`docs/SPEC.md`](docs/SPEC.md) | **Especificación Funcional:** Casos de uso, reglas de negocio, roles y transiciones de estado. |
| [`docs/GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md`](docs/GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md) | Directivas de ingeniería FAANG, manejo de errores RFC 7807 y puntos ciegos a evitar. |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Guía de operaciones: Despliegue en Coolify (VPS), Vercel y generación de APKs Android. |
| [`AGENTS.md`](AGENTS.md) | Protocolo operativo para agentes de IA, antipatrones explícitos y comandos de verificación. |
| [`PLAN_ACCION_VETCONNECT.md`](PLAN_ACCION_VETCONNECT.md) | Backlog maestro de ejecución Greenfield dividido en Task Packets listos para agentes. |

---

## 4. Skills & Herramientas Disponibles

Los agentes autónomos deben invocar las herramientas indicadas según la naturaleza de cada tarea:

| Skill / Herramienta | Cuándo Usarla |
|---|---|
| `tdd` | Al abordar cualquier nuevo endpoint, servicio o componente con lógica crítica. |
| `api-design-principles` | Al estructurar nuevos controladores o rutas para asegurar contratos REST limpios. |
| `error-handling-patterns` | Para garantizar códigos HTTP exactos y respuestas uniformes RFC 7807. |
| `systematic-debugging` | Para reproducir, aislar y corregir fallos en tests o problemas de concurrencia. |
| `frontend-design` | Al diseñar interfaces en React 19 o NativeWind garantizando accesibilidad y responsive design. |

---

## 5. Hoja de Ruta Greenfield (Fases F0 a F7)

El Tech Lead supervisa la ejecución secuencial de las 8 fases detalladas en [`PLAN_ACCION_VETCONNECT.md`](PLAN_ACCION_VETCONNECT.md):

- **Fase 0 — Cimientos & Scaffolding:** Workspaces npm, Docker Compose, variables de entorno, scripts de conveniencia.
- **Fase 1 — Modelado de Datos & Prisma:** Esquema PostgreSQL, migraciones iniciales con `@map("snake_case")`, seeds.
- **Fase 2 — Core Backend REST API:** Express 5, autenticación JWT con `tokenVersion`, validadores Zod, CRUDs base.
- **Fase 3 — Motor en Tiempo Real & Chat:** Socket.io, Redis Adapter, presencia, idempotencia con `clientMsgId`.
- **Fase 4 — Telemedicina LiveKit & Media Segura:** Tokens SFU, validación binaria de Magic Bytes, subida local/S3.
- **Fase 5 — Frontend Web SPA:** React 19, Vite, Tailwind, TanStack Query, LiveKit video, chat y dashboard.
- **Fase 6 — Aplicación Mobile:** Expo SDK 54, Expo Router, NativeWind, push notifications, bridge WebView.
- **Fase 7 — QA Automatizado & CI/CD:** Suite de 120+ tests en Jest/Vitest, pipeline GitHub Actions y Dockerfile.

---

## 6. Criterio de Aceptación para Producción (Definition of Done)

- [ ] Todas las columnas multi-palabra mapeadas en PostgreSQL con `@map("snake_case")`.
- [ ] Validación Zod estricta en el 100% de los endpoints HTTP.
- [ ] Autenticación JWT con algoritmo `HS256` y revocación instantánea mediante `tokenVersion`.
- [ ] Chat en tiempo real con deduplicación idempotente (`clientMsgId`) y cero errores 500 en reintentos.
- [ ] Videollamadas LiveKit con tokens opacos (cero exposición de PII en nombres o claims).
- [ ] Subida de archivos con validación binaria de Magic Bytes y cuota diaria.
- [ ] Cero uso de `any` en TypeScript (`tsc --noEmit` limpio en las 3 capas).
- [ ] Suite de pruebas de backend y frontend pasando al 100% (meta: 120+ tests proyectados, >80% cobertura).
- [ ] Pipeline CI en GitHub Actions ejecutando pruebas y análisis estático en verde.
- [ ] Documentación sincronizada y consistente en todo el repositorio.

---
*VetConnect AI Tech Lead Brief — Arquitectura Greenfield 2026.*
