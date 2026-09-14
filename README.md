<div align="center">

# 🐾 VetConnect v2.0
### *Plataforma Integral de Telemedicina Veterinaria & Gestión Clínica de Alta Disponibilidad*
**Arquitectura Greenfield & Agent-First (Optimizada para Google Jules & Agentes de IA Autónomos)**

[![Node.js](https://img.shields.io/badge/Node.js-20.x_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![React Native / Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC_SFU-00D1B2?style=for-the-badge&logo=webrtc&logoColor=white)](https://livekit.io)
[![Google Jules](https://img.shields.io/badge/Agent--First-Jules_Ready-4285F4?style=for-the-badge&logo=google&logoColor=white)](.jules/instructions.md)
[![Jest Suite](https://img.shields.io/badge/Tests-Meta:_120+_Tests-blue?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io)

</div>

---

## 📖 Índice General de Documentación & Sistema de Agentes

> **Enfoque Greenfield & Agent-First:** Este repositorio está estructurado para que tanto desarrolladores humanos como agentes de IA autónomos (**Google Jules**, Antigravity, Cursor, Claude Code) puedan trazar sus propios flujos de trabajo, ejecutar el ciclo TDD y construir el monorepo paso a paso mediante paquetes de tareas atómicas (*Task Packets*).

Toda la documentación técnica, operativa y de agentes de VetConnect se encuentra organizada en los siguientes documentos maestros:

### 🤖 Gobernanza de Agentes de IA & Ejecución
| Documento | Descripción y Contenido | Enlace |
|---|---|---|
| 🤖 **Agent Operating System (AOS)** | Protocolo de autonomía para agentes de IA: ciclo TDD, antipatrones explícitos y comandos de verificación. | [Ver AGENTS.md](AGENTS.md) |
| 📋 **Backlog Greenfield para Agentes** | Backlog maestro de ejecución por Fases (F0 a F7) estructurado en Task Packets listos para Jules/GitHub Issues. | [Ver Plan de Acción](PLAN_ACCION_VETCONNECT.md) |
| 🧭 **Brief del Tech Lead Orquestador** | Contexto maestro para IA actuando como Tech Lead o supervisora de subagentes de desarrollo. | [Ver Tech Lead Brief](AI_TECHLEAD_BRIEF.md) |
| 🎯 **Instrucciones para Google Jules** | Guía de ejecución nativa para tareas y Pull Requests abiertos por Google Jules. | [Ver Jules Instructions](.jules/instructions.md) |

### 📚 Arquitectura & Especificaciones Técnicas
| Documento | Descripción y Contenido | Enlace |
|---|---|---|
| 📜 **Project Charter** | Carta fundamental del proyecto: visión, misión, OKRs, matriz funcional y roadmap FAANG. | [Ver Project Charter](docs/PROJECT_CHARTER.md) |
| 📋 **Plan de Proyecto y Gestión** | RACI, Mapa de Stakeholders, Gestión del Cambio, DCU (ISO 9241-210), UX/UI, Sprints y KPIs. | [Ver Plan de Proyecto](docs/PLAN_DE_PROYECTO_Y_GESTION.md) |
| 🏛️ **Arquitectura del Sistema** | Topología distribuida, Domain-Driven Design, Sockets en clúster y marco legal (SENASA / Ley 25.326). | [Ver Arquitectura](docs/ARCHITECTURE.md) |
| ⚖️ **Registro de Decisiones (ADRs)** | 21 Architecture Decision Records detallando el porqué técnico de cada tecnología adoptada. | [Ver Decisiones](docs/DECISIONS.md) |
| 📚 **Referencia Técnica & APIs** | Mapa completo de endpoints REST, matriz de eventos Socket.io y modelos de datos Prisma. | [Ver Referencia Técnica](docs/TECH_REFERENCE.md) |
| 📘 **Guía Oficial de Buenas Prácticas & Sistema** | Puntos ciegos, antipatrones (ejemplos de NO uso), LiveKit y estándares de código por módulo. | [Ver Guía de Buenas Prácticas](docs/GUIA_OFICIAL_BUENAS_PRACTICAS_Y_SISTEMA.md) |
| 📱 **Guía de Ejecución Local** | Tutorial paso a paso para encender todo el sistema y conectar un celular por cable USB con ADB. | [Ver Guía de Ejecución](GUIA_EJECUCION_VETCONNECT.md) |
| 🚀 **Guía de Despliegue & Ops** | Guía de producción: Coolify (VPS) para Backend, Vercel para Web (Hostinger contingencia) y 3 vías para Android (EAS / APK web / Local). | [Ver Guía de Deploy & Ops](docs/DEPLOY.md) |
| 📑 **Minuta de Stakeholder & Backlog v2.1** | Requerimientos de producto acordados con stakeholder interno (vacunas, VetDrive, microchip, ciclo de vida, calendario). | [Ver Minuta de Stakeholder](docs/MINUTA_STAKEHOLDER_2026-09.md) |
| 🖥️ **Presentación Ejecutiva** | Diapositivas ejecutivas de alta densidad visual sintetizando las decisiones clave del proyecto (problema, PMV, arquitectura, Scrumban y KPIs). | [Ver Presentación](docs/PRESENTACION_EJECUTIVA.md) |
| 🎨 **Sistema de Diseño (Design System)** | Guía integral de UX/UI: flujos clínicos, Clean Clinical Modernism, paleta 60-30-10, tipografías Inter/Jakarta, UI Kit y WCAG 2.1 AA. | [Ver Sistema de Diseño](docs/SISTEMA_DE_DISENO.md) |


---

## 🌟 Propuesta de Valor & Características Principales

**VetConnect** es una solución telemédica integral que digitaliza la interacción clínica entre tutores de mascotas y médicos veterinarios:

- **🚨 Triage Inteligente & Cola de Atención:** Solicitud de atención inmediata o programada con auto-asignación hacia veterinarios disponibles (`isOnline = true`).
- **💬 Chat en Vivo con Idempotencia:** Mensajería en tiempo real (<100ms) vía WebSockets, deduplicación por `clientMsgId`, imágenes clínicas con zoom y acuses de recibo.
- **📹 Teleconsulta por Videollamada (WebRTC / LiveKit):** Transmisión de audio y video de 720p adaptativa con timbrado bidireccional y tokens criptográficos sin exposición de PII.
- **💊 Recetas Digitales Estructuradas:** Prescripciones con dosificación, frecuencia y duración persistidas en la historia clínica del paciente.
- **🛡️ Blindaje Legal & Sala de Espera (SENASA):** Verificación manual de matrícula profesional (`vetStatus: PENDING → APPROVED`) antes de habilitar la atención médica; cumplimiento estricto de la **Ley de Protección de Datos Personales N° 25.326** con *Soft-Deletes* y minimización de PII.
- **📊 Registro Inmutable de Auditoría:** Registro de todas las mutaciones administrativas críticas (`AuditLog`) para trazabilidad total.

---

## 🏗️ Topología del Sistema (FAANG Architecture)

```mermaid
flowchart TB
    subgraph Frontend["Capas de Cliente (Monorepo Workspaces)"]
        Mobile["📱 Mobile App (React Native + Expo 54)\n• NativeWind Tailwind\n• SecureStore\n• TanStack Query"]
        WebClient["💻 Web App & Pro Dashboard (React 19 + Vite)\n• Layered Shadows Craft\n• GlobalCallListener\n• LiveKit Components"]
    end

    subgraph Backend["Cerebro Backend (Node.js + Express 5 + TypeScript)"]
        API["⚙️ Express REST API\n• Zod Schema Validation\n• Strict JWT + TokenVersion Rotation\n• Rate Limiting & Helmet"]
        SocketEngine["⚡ Socket.io Clustered Engine\n• Room Multiplexing\n• Redis Adapter Sync"]
    end

    subgraph DataLayer["Servicios de Datos & Multimedia"]
        PostgreSQL[("🐘 PostgreSQL (Docker / Supabase)\n• Prisma ORM 6\n• Soft-Deletes & AuditLogs")]
        RedisCache[("🔴 Redis Cache 7\n• Rate Limiter & Socket Sync")]
        S3Bucket[("🪣 Amazon S3 / Local Fallback\n• Magic Bytes MIME Verification")]
        LiveKitServer["🎥 LiveKit WebRTC SFU\n• Ultra Low Latency Video Engine"]
    end

    Frontend --> Backend
    Backend --> DataLayer
```

---

## 💻 Requisitos Previos

| Requisito | Versión Mínima | Instalación |
|---|---|---|
| **Node.js** | `>= 20.x LTS` | [nodejs.org](https://nodejs.org) |
| **npm** | `>= 10.x` | Incluido con Node.js |
| **Docker & Docker Compose** | Reciente | [docker.com](https://docker.com) |
| **Git** | `>= 2.30` | [git-scm.com](https://git-scm.com) |
| **Expo Go** (para Mobile) | SDK 54 | [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| **ADB (Android Platform Tools)** | Opcional | [developer.android.com](https://developer.android.com/tools/releases/platform-tools) |

---

## ⚡ Guía de Inicio Rápido (Local Setup)

### 1. Clonar e Iniciar Servicios de Base de Datos y Cache
```bash
# 1. Iniciar PostgreSQL 16 y Redis 7 locales en Docker
docker compose up -d

# 2. Instalar dependencias en todo el monorepo
npm install

# 3. Configurar variables de entorno iniciales
cp .env.example backend/.env
```

### 2. Ejecutar la Plataforma en Modo Desarrollo

#### Opción A: Inicio Automatizado (Scripts DX)
- **Backend y Web (Terminal 1):**
  ```powershell
  .\run.bat
  # O mediante npm: npm run dev
  ```
  *Inicia el backend en el puerto 3001 y la Web en el puerto 5173 simultáneamente.*

- **Mobile App (Terminal 2):**
  ```powershell
  .\start.ps1
  # O mediante npm: npm run dev:mobile
  ```
  *Detecta automáticamente tu celular por USB, configura ADB Reverse e inicia Expo Go sin depender de Wi-Fi.*

#### Opción B: Inicio por Módulo Específico
```bash
npm run dev:backend   # Inicia únicamente la API Express
npm run dev:web       # Inicia únicamente la SPA Web en Vite
npm run dev:mobile    # Inicia el bundler Metro de Expo
```

---

## 🧪 Pruebas Automatizadas & Calidad de Código

El proyecto adopta desarrollo dirigido por pruebas (TDD) con una meta de más de **120 pruebas automatizadas proyectadas** (>80% de cobertura):

```bash
# Ejecutar la suite de pruebas en todo el monorepo
npm test

# Ejecutar typecheck estricto de TypeScript en todas las capas
npm run typecheck

# Validar esquema relacional de Prisma
cd backend && npx prisma validate
```

---

## 👥 Equipo de Desarrollo & Créditos

- **Tobias Vera** — *Tech Lead & Backend Developer*
- **Juan Mendoza** — *Mobile Lead Developer*
- **Damian Orellana** — *Web Frontend Developer*
- **Ezequiel Charca** — *QA Automation Engineer & Product Designer*
- **Lara Bouso** — *Project Manager & Compliance Specialist*

*VetConnect — Grupo Pinnacle 2026. Todos los derechos reservados.*
