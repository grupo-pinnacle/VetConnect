# 📋 Plan de Consolidación Documental y Roadmap de Desarrollo Remanente (VetConnect)

## Descripción del Objetivo
Revisar minuciosamente la totalidad del acervo documental del repositorio (`/`, `/docs`, `/docs/web`, `/docs/mobile`), identificar y depurar las especificaciones y planificaciones temporales de etapas que ya fueron implementadas físicamente en el código (Scaffolding, Modelos Prisma, Backend REST Express 5, WebSockets, LiveKit SFU base, Web SPA funcional y Mobile Expo SDK 54 base con 206 tests en verde), y unificar la visión técnica y el **plan de desarrollo restante** en un único archivo Markdown canónico y depurado (`docs/PLAN_DESARROLLO_REMANENTE.md`).

---

## Estado Real Verificado del Repositorio (Línea Base Empírica)

Una inspección directa del código fuente y ejecución de suites de pruebas arrojó el estado real de la base de código (muy por delante de lo que describen las planificaciones tempranas):

1. **Backend (100% Core v2.0 Implementado / 17 suites / 88 tests PASSED):**
   - Modelado Prisma 6 con PostgreSQL, mappings snake_case, soft-deletes y AuditLog.
   - Autenticación dual JWT (HttpOnly cookies en Web, `X-Client-Platform` en Mobile), revocación instantánea por `tokenVersion`.
   - CRUD Mascotas con validación ISO 11784/11785 de microchip.
   - Triaje y FSM de consultas (`WAITING` ➔ `ACTIVE` ➔ `COMPLETED` / `CANCELLED`) con asignación FIFO y timeouts.
   - WebSockets con Redis Adapter y deduplicación idempotente (`clientMsgId`).
   - LiveKit SFU con tokens criptográficos Zero PII y destrucción server-side de salas.
   - Almacenamiento con validación binaria de *Magic Bytes* y serving autenticado (`GET /api/media/:id`).
   - Recetas médicas oficiales SENASA con código QR de validación pública.
2. **Frontend Web (95% Implementado / Vitest + Vite 6):**
   - React 18.3.1 LTS + Tailwind CSS + TanStack Query v5 + LiveKit Components.
   - Todas las páginas operativas: Landing, Login, Register, Dashboard Tutor, Dashboard Veterinario, Auditoría Admin SENASA, Sala de Consulta WebRTC con pre-join modal, Receta imprimible A4 y páginas legales.
   - Telemetría en vivo con Sentry y Code-Splitting optimizado (bundle inicial 20.38 kB).
3. **Mobile App (85% Implementado / 14 suites / 118 tests PASSED):**
   - React Native Expo SDK 54 + Expo Router v6 + NativeWind v4.
   - Sesión segura con `expo-secure-store`, redirección por rol y guard SENASA.
   - Deep linking (`vetconnect://`), sincronización de chat incremental con watermark, permisos de hardware para videollamada y manejo de expiración de sesión.
4. **Total de Pruebas Automatizadas Verificadas:** **206 tests pasando** (88 Backend + 118 Mobile).

---

## Diagnóstico del Ecosistema Documental Existente (46 Archivos Auditados)

Actualmente existen más de 45 documentos dispersos con solapamientos y planificaciones temporales caducas:

| Categoría | Archivos Actuales | Contenido & Estado de Obsolescencia |
|---|---|---|
| **Raíz (`/`)** | `PLAN_ACCION_VETCONNECT.md`, `JULES_ORCHESTRATION.md`, `AI_TECHLEAD_BRIEF.md`, `GUIA_EJECUCION_VETCONNECT.md`, `protocolo-nueva-feature-v3.md` | El 90% de las tareas de los task packets (TASK-0.1 a TASK-6.3) ya están implementadas en el código. Tienen prompts temporales para microVMs de Jules de fases ya concluidas. |
| **Docs Generales (`docs/`)** | `PLAN_DE_PROYECTO_Y_GESTION.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TECH_REFERENCE.md`, `SPEC.md`, `LIVEKIT_AUDIT.md`, `DEPLOY.md`, `SISTEMA_DE_DISENO.md`, `COMPLIANCE_LEGAL_Y_ACCESIBILIDAD.md`, etc. | `PLAN_DE_PROYECTO_Y_GESTION.md` describe 10 sprints y PB-01 a PB-40 como si estuvieran por desarrollarse, cuando del PB-01 al PB-34 ya están terminados. |
| **Docs Mobile (`docs/mobile/`)** | `01_TECH_REFERENCE_MOBILE.md`, `02_QA_DISTRIBUCION_Y_SEGURIDAD.md`, `03_ESTADO_Y_DEUDA_MOBILE.md`, `AGENT_CODING_SPEC_MOBILE.md`, `README.md` | `03_ESTADO_Y_DEUDA_MOBILE.md` ya resolvió parte de su deuda en commits recientes (deep linking, sesión expirada, tests pasaron de 29 a 118). |
| **Docs Web (`docs/web/`)** | `00_AUDITORIA...` a `12_ANALISIS...` (15 archivos) | 12 de estos archivos eran planes de relevamiento inicial, wireframing de baja fidelidad narrativo previo al código y comparativas con ConectaVet. |

---

## User Review Required

> [!IMPORTANT]
> **Compatibilidad con `scripts/verify-governance.js`:**  
> El script de gobernanza automatizada del repositorio (`npm run check:governance`) valida estrictamente la existencia y estructura de:
> - `PLAN_ACCION_VETCONNECT.md` (con los 20 encabezados `### 📦 TASK-X.Y` y mapeo PB-01..40)
> - `docs/PLAN_DE_PROYECTO_Y_GESTION.md`
> - `docs/TECH_REFERENCE.md` y `docs/SPEC.md`
>
> Para no romper el pipeline de CI (`npm run verify:predeploy` que ejecuta `check:governance`), el nuevo archivo consolidado maestro será la **Fuente Única de Verdad Operativa** (`docs/PLAN_DESARROLLO_REMANENTE.md`), y actualizaremos `scripts/verify-governance.js` para que valide el nuevo estándar o mantendremos los archivos históricos marcados como [ARCHIVADOS / COMPLETADOS] según tu preferencia.

---

## Open Questions

> [!WARNING]
> ¿Deseas que los 45 archivos de documentación existentes se conserven en una carpeta de archivo histórico (ej. `docs/archive/`) para no perder el dossier de la ET20 y decisiones pasadas, o prefieres eliminarlos físicamente del disco y dejar **únicamente** el nuevo archivo Markdown maestro consolidado junto con las guías operativas esenciales?

---

## Cambios Propuestos

### Fase 1: Creación del Documento Maestro Consolidado
Crear `docs/PLAN_DESARROLLO_REMANENTE.md` que unifique de forma quirúrgica:
1. **Línea Base del Sistema Construido (Lo que ya existe y está probado):** Resumen ejecutivo con referencias directas al código (`backend/`, `web/`, `mobile/`) y tests validados.
2. **Contratos Técnicos Esenciales Congelados:** Modelos Prisma v2.0, Endpoints REST canónicos y eventos de WebSockets.
3. **Backlog de Desarrollo Remanente (Lo ÚNICO que falta para el Gold Master v2.0 y v2.1):**
   - **Módulo 1: Frontend Web — Elevación Visual Atómica (Storybook & Figma):**
     - Integración del catálogo atómico en Storybook 8 con diseño de alta fidelidad de Damian Orellana.
     - Extracción de modales (`PrescriptionModal`, `ReviewModal`) a componentes independientes con tests a11y.
     - Automatización de pruebas E2E con Playwright / TestSprite.
   - **Módulo 2: Mobile App — Señalización, Push y Completitud de Producto:**
     - Fase 2: Timbre y UI de llamada entrante (`call:incoming`, `POST /calls/:id/ring`, aceptar/rechazar).
     - Fase 3: Ajuste de envelope en `/api/auth/me`, renderizado de recetas y reviews en detalle de consulta, validación estricta de 10 MB en fotos.
     - Fase 4: Cobertura de tests de render para las pantallas de la app.
     - Fase 5: Tabs dinámicos por rol (ocultar tabs de tutor al veterinario), biometría (`expo-local-authentication`), captura directa de cámara y subida de PDFs.
   - **Módulo 3: Backend — Despachador Real de Notificaciones Push & Filas DB:**
     - Creación de registros en tabla `Notification` en eventos clave (cambio de estado de consulta, mensaje nuevo, llamada entrante).
     - Despacho de notificaciones push móviles mediante Expo Push API SDK.
   - **Módulo 4: Infraestructura y Despliegue a Producción (Staging ➔ Gold Master):**
     - Configuración Coolify en VPS para API Express + PostgreSQL + Redis.
     - Despliegue Web en Vercel con subdominios SSL (`app.vetconnect.com.ar` y `api.vetconnect.com.ar`).
     - Almacenamiento S3 / Cloudflare R2 con Presigned URLs en lugar de storage local.
     - Pipeline de compilación EAS Build para APK/AAB de Android.
   - **Módulo 5: Roadmap Evolutivo v2.1+ (Post-Lanzamiento):**
     - Pasarela de pagos (MercadoPago / Stripe).
     - Carnet de vacunación digital, recordatorios de medicación, veterinarios favoritos.

### Fase 2: Sincronización o Limpieza de Archivos Obsoletos
- Depurar las secciones ya implementadas en la raíz y en `docs/`.
- Actualizar `scripts/verify-governance.js` para que apunte a la nueva estructura sin alertas falsas.

---

## Plan de Verificación

### Pruebas Automatizadas
- Ejecutar la suite de gobernanza: `node scripts/verify-governance.js`.
- Ejecutar los tests unitarios e integración:
  - `npm.cmd test -w backend` (verificar 88 tests pasando).
  - `npm.cmd test -w mobile` (verificar 118 tests pasando).
- Ejecutar typecheck general: `npm.cmd run typecheck`.

### Verificación Manual
- Revisar que el nuevo archivo Markdown maestro consolidado contenga de punta a punta todo el plan de desarrollo restante sin tareas duplicadas ni código ya implementado.
