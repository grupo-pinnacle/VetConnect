# 🏛️ Decisiones de Arquitectura (ADRs) — VetConnect

Este registro documenta las 24 decisiones arquitectónicas clave tomadas durante el diseño y evolución del sistema VetConnect (ADR-001 al ADR-024 — FAANG Architecture).

---

## Índice de Decisiones (ADRs — ADR-001 al ADR-024)

| ID | Título | Estado | Impacto |
|---|---|---|---|
| **ADR-001** | Monolito Modular vs Microservicios | Aprobado | Backend / Arquitectura |
| **ADR-002** | Prisma ORM 6 vs TypeORM / Drizzle | Aprobado | Base de Datos |
| **ADR-003** | PostgreSQL Cloud (Supabase) | Aprobado | Infraestructura |
| **ADR-004** | Autenticación JWT con Rotación & `tokenVersion` | Aprobado | Seguridad / Auth |
| **ADR-005** | Soft-Deletes & Anonimización Legal (Ley 25.326) | Aprobado | Legal / Compliance |
| **ADR-006** | Singleton de PrismaClient con Connection Pooling | Aprobado | Performance |
| **ADR-007** | Validación de Contratos con Zod | Aprobado | API Design |
| **ADR-008** | Estrategia de Tipos TypeScript Monorepo | Aprobado | Tipado / Mantenibilidad |
| **ADR-009** | Mensajería Tiempo Real con Socket.io & Redis Adapter | Aprobado | Realtime / Escalamiento |
| **ADR-010** | Almacenamiento Resiliente Multi-Cloud (S3 + Fallback Local) | Aprobado | Media / Storage |
| **ADR-011** | Notificaciones Push con Expo Push API & Bandeja In-App | Aprobado | Mobile / Push |
| **ADR-012** | Teleconsulta con WebRTC / LiveKit SFU | Aprobado | Video / Media |
| **ADR-013** | Sala de Espera Profesional para Veterinarios (SENASA) | Aprobado | Legal / Operaciones |
| **ADR-014** | Registro Inmutable de Auditoría (`AuditLog`) | Aprobado | Seguridad / Auditoría |
| **ADR-015** | TanStack React Query v5 para Caché y Sincronización Web | Aprobado | Frontend Web |
| **ADR-016** | Conexión Mobile USB Directa con ADB Reverse para Redes Corporativas | Aprobado | DevOps / DX |
| **ADR-017** | Despliegue Backend Autohosteado en Coolify (VPS) | Aprobado | Infraestructura / Cloud |
| **ADR-018** | Estrategia Tripartita de Distribución Android (EAS Play Store, APK Web y Local Build) | Aprobado | Mobile / Release |
| **ADR-019** | Denormalización Atómica de Calificaciones e Índices Compuestos | Aprobado | Base de Datos / Performance |
| **ADR-020** | Streaming de Archivos Seguros y Mitigación de DoS de Heap | Aprobado | Seguridad / Storage |
| **ADR-021** | Hardening de Contenedores y Pipeline de Integración Continua FAANG | Aprobado | DevOps / Seguridad |
| **ADR-022** | Plataforma Definitiva de Despliegue Web (Vercel Edge vs Hostinger Contingencia) | Aprobado | Infraestructura / Web |
| **ADR-023** | Escala Unificada de Calificación Profesional (1 a 5 Estrellas) | Aprobado | UX / Base de Datos |

---

## Detalle de Decisiones

### ADR-001: Monolito Modular vs Microservicios
- **Contexto:** Se requería definir el estilo arquitectónico del backend para soportar rápida iteración sin sacrificar orden ni modularidad.
- **Decisión:** Monolito modular basado en Domain-Driven Design (`modules/auth`, `modules/users`, `modules/pets`, `modules/consultations`, `modules/calls`, `modules/media`, `modules/notifications`).
- **Consecuencias:** Despliegue simple en un solo contenedor, latencia interna cero entre módulos y separación limpia de responsabilidades.

### ADR-004: Autenticación JWT con Rotación & `tokenVersion`
- **Contexto:** Si un token JWT es emitido y luego el usuario cambia su contraseña o es dado de baja, los tokens tradicionales permanecen válidos hasta su expiración.
- **Decisión:** Implementar un campo `tokenVersion` en el modelo `User`. Cada cambio de credenciales, logout global o baneo incrementa este contador. El middleware valida el payload JWT contra la versión activa en base de datos.
- **Consecuencias:** Revocación instantánea de sesiones sin necesidad de consultar tablas pesadas de listas negras de tokens.

### ADR-005: Soft-Deletes & Anonimización Legal (Ley 25.326)
- **Contexto:** La normativa sanitaria veterinaria y la Ley de Protección de Datos Personales prohíben la destrucción de registros médicos de pacientes, pero exigen el derecho al olvido para los usuarios.
- **Decisión:** Cuando un usuario solicita la baja, se ejecuta una anonimización de sus datos de contacto (email, teléfono, nombre), marcando `deletedAt = now()`. El historial clínico y las consultas de sus mascotas persisten inalterables vinculadas al ID anonimizado.
- **Consecuencias:** Cumplimiento legal pleno ante inspecciones judiciales y del SENASA.

### ADR-008: Estrategia de Tipos TypeScript Monorepo & Exclusión de packages/shared
- **Contexto:** En la planificación de la arquitectura monorepo se evaluó la conveniencia de crear un paquete compartido (`packages/shared`) para tipos, DTOs y validadores Zod, o mantener los workspaces completamente desacoplados.
- **Decisión:** Mantener una estructura limpia de tres workspaces principales (`backend`, `web`, `mobile`) descartando formalmente la creación de `packages/shared`. Los contratos y validaciones se definen como la única fuente de verdad en esquemas Zod y TypeScript dentro del Backend (`backend/src/contracts/` y DTOs modulares), y se consumen/duplican limpiamente en Web y Mobile mediante interfaces sincronizadas sin requerir pipelines de compilación intermedia complejos (Turborepo/Nx no requeridos), ni scripts de transpilación previa.
- **Consecuencias:** Máxima velocidad de compilación e inicialización en desarrollo local, cero fricción de tooling en CI/CD, e independencia absoluta para compilar, probar y desplegar `backend`, `web` y `mobile` de forma aislada.

### ADR-009: Mensajería Tiempo Real con Socket.io & Redis Adapter
- **Contexto:** Necesidad de chat en vivo y notificaciones globales con capacidad de escalar a múltiples nodos backend.
- **Decisión:** Integrar Socket.io acoplado con `@socket.io/redis-adapter` en clúster Redis.
- **Consecuencias:** Comunicación bidireccional instantánea con broadcast sincronizado entre todas las instancias del servidor.

### ADR-011: Notificaciones Push con Expo Push API & Bandeja In-App
- **Contexto:** Los tutores y veterinarios requieren enterarse de llamadas entrantes, mensajes de chat y recetas sin mantener la aplicación permanentemente en primer plano, sin incurrir en costos de servicios de terceros como OneSignal.
- **Decisión:** Implementar el servicio oficial de Expo Push API en el backend (`modules/notifications/`), persistiendo los tokens de dispositivo (`ExponentPushToken[...]`) en la base de datos, complementado con una bandeja de notificaciones persistidas in-app.
- **Consecuencias:** Notificaciones en tiempo real en Android/iOS a costo $0, con historial recuperable en la bandeja de la app ante pérdidas de conectividad.

### ADR-012: Teleconsulta con WebRTC / LiveKit SFU
- **Contexto:** Se requería soporte de videollamadas de alta fidelidad entre el panel Web de veterinarios y la aplicación móvil de tutores.
- **Decisión:** Utilizar LiveKit SFU (Selective Forwarding Unit) con tokens de acceso criptográficos generados por el backend y componentes WebRTC nativos/WebView.
- **Consecuencias:** Transmisión de video fluida con adaptación automática de bitrate ante conexiones móviles inestables.

### ADR-013: Sala de Espera Profesional para Veterinarios
- **Contexto:** Prevenir el ejercicio ilegal de la profesión veterinaria en la plataforma.
- **Decisión:** Nuevas cuentas con rol `VET` inician en estado `PENDING`. El acceso a la sala de atención y chat queda inhabilitado hasta que un Administrador valida la matrícula profesional y activa la cuenta a `APPROVED`.
- **Consecuencias:** Garantía de calidad médica y blindaje legal para la empresa.

### ADR-014: Registro Inmutable de Auditoría (`AuditLog`)
- **Contexto:** Trazabilidad estricta de acciones sensibles (aprobación de médicos, reseteo de usuarios, modificaciones de roles, bajas).
- **Decisión:** Crear tabla `AuditLog` no modificable donde se almacenan todas las mutaciones administrativas con IP y UserAgent.
- **Consecuencias:** Capacidad de auditoría forense en tiempo real.

### ADR-017: Despliegue Backend Autohosteado en Coolify (VPS)
- **Contexto:** Minimizar costos recurrentes en dólares sin perder las comodidades de una plataforma moderna (CI/CD, certificados SSL automáticos, gestión de variables de entorno y servicios auxiliares).
- **Decisión:** Desplegar el Backend Node.js y la instancia de Redis sobre un servidor VPS propio utilizando **Coolify**, y el Frontend Web SPA sobre **Vercel** (o Hosting Web estático de **Hostinger**).
- **Consecuencias:** Costo predecible y bajo (servidor VPS fijo de $8 – $12 USD/mes), control total sobre la infraestructura de WebSockets persistentes (Traefik) y CDN global para la Web.

### ADR-019: Denormalización Atómica de Calificaciones e Índices Compuestos
- **Contexto:** El listado de veterinarios realizaba agregaciones N+1 y filtros de calificación en memoria después del `take`/`skip`, causando discrepancias en la paginación e impidiendo consultas eficientes bajo alta concurrencia.
- **Decisión:** Agregar columnas indexadas `rating_avg` y `rating_count` en la tabla `users`, recalculadas atómicamente en una transacción Prisma al registrar cada `Review`. Indexar compuestos en `(clientId, status, deletedAt)`, `(vetId, status, deletedAt)`, `(role, isOnline, vetStatus, deletedAt)` y `(ownerId, deletedAt)`.
- **Consecuencias:** Paginación y ordenamiento delegado 100% al motor PostgreSQL con tiempo de respuesta constante O(log N) e invalidación reactiva de caché Redis.

### ADR-020: Streaming de Archivos Seguros y Mitigación de DoS de Heap
- **Contexto:** Multer almacenaba archivos en memoria RAM (`memoryStorage`), permitiendo ataques de denegación de servicio (DoS por OOM) con archivos grandes y abriendo riesgo de MIME spoofing.
- **Decisión:** Reemplazar `memoryStorage` por `diskStorage` temporal en `/app/uploads/tmp/`, validación estricta de los primeros 32 bytes (magic bytes para firmas JPEG, PNG, WEBP), streaming directo hacia almacenamiento local o AWS S3, y eliminación inmediata de temporales tras completar la subida.
- **Consecuencias:** Consumo de memoria RAM plano e inmune al tamaño de los archivos, con validación de seguridad a nivel de bits.

### ADR-021: Hardening de Contenedores y Pipeline de Integración Continua FAANG
- **Contexto:** Los contenedores Docker ejecutaban Node.js como superusuario `root`, y no existía un pipeline de integración continua que garantizara que los tres paquetes del monorepo (`backend`, `web`, `mobile`) compilen y pasen pruebas antes del despliegue.
- **Decisión:** Modificar el `Dockerfile` de producción para operar bajo el usuario sin privilegios `USER node` en el puerto estándar 3001, e incorporar GitHub Actions (`.github/workflows/ci.yml`) ejecutando typechecking estricto, suites unitarias e integración en cada push/PR.
- **Consecuencias:** Reducción drástica de superficie de ataque en el servidor y garantía empírica de 0 regresiones en despliegues.

### ADR-022: Plataforma Definitiva de Despliegue Web (Vercel Edge vs Hostinger Contingencia)
- **Contexto:** Se requería definir sin ambigüedades la plataforma de hosting para el Frontend Web SPA (React 19 + Vite) y la integración continua en CI/CD.
- **Decisión:** Adoptar **Vercel** como la plataforma oficial, definitiva y automatizada para producción conectada a GitHub Actions. Se descarta cualquier flujo de despliegue automatizado hacia Hostinger; este último queda documentado exclusivamente como **alternativa de contingencia manual** (subida de artefactos estáticos `web/dist/` a `public_html/` ante indisponibilidad severa de Vercel).
- **Consecuencias:** Despliegues atómicos automáticos con preview URLs en cada PR, CDN global Edge de latencia ultra-baja y SSL automático, manteniendo una contingencia manual documentada para emergencias operativas.

### ADR-023: Escala Unificada de Calificación Profesional (1 a 5 Estrellas)
- **Contexto:** Existía necesidad de armonizar la escala de valoración médica del servicio entre la aplicación móvil de tutores, el panel de veterinarios y el recálculo analítico en base de datos.
- **Decisión:** Estandarizar de forma estricta y universal la escala de **1 a 5 estrellas** (enteros del 1 al 5) en base de datos (`Review.rating`), endpoints REST (`POST /api/consultations/:id/review`), esquemas Zod, UI Kit web, app móvil React Native y recálculo atómico denormalizado (`rating_avg` y `rating_count` en la tabla `users`, conforme a ADR-019). Queda formalmente descartada cualquier escala alternativa (ej. 1 a 10).
- **Consecuencias:** Coherencia de UX/UI alineada con los estándares de la industria y la intuición de usuarios, simplificación de validaciones en frontend y backend, y alineación directa con los KPIs de satisfacción del proyecto (CSAT).

---


### ADR-024: Máquina de Estados Finita de Consultas (FSM de 4 Estados y Auto-Asignación Directa)
- **Contexto:** En el análisis preliminar se evaluó un flujo de 5 estados con oferta intermedia (`WAITING -> PENDING -> ACTIVE`). Dicho flujo exigía temporizadores distribuidos en Redis para expiración de ofertas, gestión de reintentos ante rechazos de profesionales y sincronización compleja de eventos Socket.io propensa a condiciones de carrera.
- **Decisión:** Adoptar formalmente una máquina de estados finita determinista de **4 estados** en PostgreSQL (`ConsultationStatus`: `WAITING`, `ACTIVE`, `COMPLETED`, `CANCELLED`). El algoritmo de triage en `WAITING` realiza auto-asignación directa FIFO hacia el primer veterinario en guardia disponible (`role = VET`, `vetStatus = APPROVED`, `isOnline = true`), transicionando la consulta atómicamente a `ACTIVE`. Las cancelaciones voluntarias antes o durante la atención transicionan a `CANCELLED`.
- **Consecuencias:** Eliminación total de condiciones de carrera por oferta simultánea en WebSockets, simplificación absoluta de las mutaciones relacionales en PostgreSQL (sin estados intermedios ni jobs huérfanos de timeout en Redis), y auditoría inequívoca de tiempos de espera de triage ($P_{50} < 3\text{ min}$, $P_{95} < 5\text{ min}$).

