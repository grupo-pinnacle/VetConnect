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
| **ADR-024** | Máquina de Estados Finita (FSM) en Consultas, Timeout de Triage (15 min) y Ventana de Reconexión WebRTC (3 min) | Aprobado | Backend / FSM |

---

## Detalle de Decisiones

### ADR-001: Monolito Modular vs Microservicios
- **Contexto:** Se requería definir el estilo arquitectónico del backend para soportar rápida iteración sin sacrificar orden ni modularidad.
- **Decisión:** Monolito modular basado en Domain-Driven Design (`modules/auth`, `modules/users`, `modules/pets`, `modules/consultations`, `modules/calls`, `modules/media`, `modules/notifications`).
- **Consecuencias:** Despliegue simple en un solo contenedor, latencia interna cero entre módulos y separación limpia de responsabilidades.

### ADR-002: Prisma ORM 6 vs TypeORM / Drizzle
- **Contexto:** Se requería un ORM moderno para Node.js y TypeScript que garantizara tipado de datos estricto de extremo a extremo, soporte nativo de migraciones reproducibles y mapeo transparente a PostgreSQL.
- **Decisión:** Adoptar **Prisma ORM 6**. Su cliente autogenerado a partir de `schema.prisma` garantiza type-safety absoluto en consultas relacionales complejas, con generación estricta de DTOs y mapeos explícitos a `snake_case` mediante directivas `@map`.
- **Consecuencias:** Cero discrepancias de tipos en tiempo de compilación entre TypeScript y PostgreSQL, migraciones reproducibles en CI/CD con `prisma migrate`, y eliminación de modelos fragmentados con decoradores propensos a errores en tiempo de ejecución.

### ADR-003: PostgreSQL Cloud (Supabase) vs Local/RDS
- **Contexto:** Se evaluó si alojar la base de datos de producción en AWS RDS, en contenedores autohospedados en el VPS o en un servicio administrado especializado en PostgreSQL.
- **Decisión:** Utilizar **Supabase Managed PostgreSQL** como proveedor de persistencia relacional principal, aprovechando su capa gratuita generosa (500 MB), backups automáticos diarios, pooling de conexiones integrado (PgBouncer) y métricas de rendimiento en tiempo real.
- **Consecuencias:** Ahorro total de costos fijos de base de datos en fase MVP ($0 USD), delegación de la seguridad y copias de seguridad a una infraestructura cloud resiliente, con plan de contingencia de fallback a PostgreSQL local en Docker dentro del VPS Coolify (ADR-017).

### ADR-004: Autenticación JWT con Rotación & `tokenVersion` (Estrategia Dual Web/Mobile)
- **Contexto:** Si un token JWT es emitido y luego el usuario cambia su contraseña o es dado de baja, los tokens tradicionales permanecen válidos hasta su expiración. Adicionalmente, Web SPA y Mobile App tienen mecanismos de almacenamiento de credenciales radicalmente distintos: los navegadores soportan cookies `HttpOnly` como protección nativa contra XSS, mientras que React Native no gestiona cookies automáticamente sin una biblioteca de cookie-jar compleja.
- **Decisión:** Implementar dos sub-estrategias complementarias bajo un único contrato de autenticación:
  1. **Web SPA:** El Refresh Token se transmite exclusivamente en una cookie `HttpOnly`. En producción cross-domain (Vercel `app.vetconnect.com.ar` → VPS `api.vetconnect.com.ar`) usa `Secure; SameSite=None` para permitir cookies en subdominios distintos bajo HTTPS. En desarrollo local usa `SameSite=Lax` (sin `Secure`). El backend detecta el entorno vía `NODE_ENV === 'production'` y soporte de override por variable `COOKIE_SAME_SITE`.
  2. **Mobile App (React Native / Expo):** Cuando la petición incluye el header `X-Client-Platform: mobile`, el backend retorna el Refresh Token (TTL 7 días) **también** en el JSON body (`{ accessToken, refreshToken, user }`). La app lo almacena cifrado en el hardware secure enclave del dispositivo mediante `expo-secure-store`. El endpoint `/api/auth/refresh` en mobile lee el `refreshToken` desde el payload `{ refreshToken }` en lugar de la cookie.
  3. **Campo `tokenVersion`:** Implementado en el modelo `User`. Cada cambio de credenciales, logout global o baneo incrementa este contador. El middleware valida el payload JWT contra la versión activa en base de datos, garantizando revocación instantánea en ambas plataformas.
- **Consecuencias:** Revocación instantánea de sesiones sin listas negras de tokens; compatibilidad nativa con el modelo de almacenamiento seguro de iOS/Android; protección XSS preservada en la Web SPA sin requerir configuración adicional de cookie-jar en React Native.


### ADR-005: Soft-Deletes & Anonimización Legal (Ley 25.326)
- **Contexto:** La normativa sanitaria veterinaria y la Ley de Protección de Datos Personales prohíben la destrucción de registros médicos de pacientes, pero exigen el derecho al olvido para los usuarios.
- **Decisión:** Cuando un usuario solicita la baja, se ejecuta una anonimización de sus datos de contacto (email, teléfono, nombre), marcando `deletedAt = now()`. El historial clínico y las consultas de sus mascotas persisten inalterables vinculadas al ID anonimizado.
- **Consecuencias:** Cumplimiento legal pleno ante inspecciones judiciales y del SENASA.

### ADR-006: Singleton de PrismaClient con Connection Pooling
- **Contexto:** En desarrollo con recarga en caliente (Hot Reload / `tsx watch`) y en entornos serverless o de múltiples workers, instanciar repetidamente `new PrismaClient()` satura rápidamente el pool de conexiones de PostgreSQL, arrojando errores críticos de `FATAL: too many connections`.
- **Decisión:** Implementar un patrón **Singleton estricto** en `src/lib/prisma.ts` que almacena la instancia de `PrismaClient` en el objeto global de Node.js (`globalThis.prisma`) durante el modo desarrollo, y reutiliza una única conexión en producción.
- **Consecuencias:** Consumo predecible de conexiones al pool de base de datos (límite fijo de 10 conexiones en pool local), prevención total de fugas de descriptores de sockets y arranque limpio de pruebas sin advertencias de colisión de clientes.

### ADR-007: Validación de Contratos con Zod
- **Contexto:** Toda entrada de datos a la API REST (`req.body`, `req.query`, `req.params`) debe ser rigurosamente sanitizada para evitar inyecciones maliciosas, errores por tipos inesperados y fallos en cascada en la capa de servicios.
- **Decisión:** Estandarizar **Zod** como la librería exclusiva de validación de esquemas y contratos para todo el backend. Todo endpoint REST cuenta con un middleware Zod (`validateBody`, `validateQuery`) que valida y tipa estáticamente la carga útil antes de invocar los controladores.
- **Consecuencias:** Validación declarativa con mensajes de error descriptivos estandarizados en formato RFC 7807, inferencia estática automática de tipos TypeScript con `z.infer<typeof schema>` (eliminando la necesidad de duplicar interfaces manuales) y prevención total de campos extraños o contaminantes (`strict()` mode).

### ADR-008: Estrategia de Tipos TypeScript Monorepo & Exclusión de packages/shared
- **Contexto:** En la planificación de la arquitectura monorepo se evaluó la conveniencia de crear un paquete compartido (`packages/shared`) para tipos, DTOs y validadores Zod, o mantener los workspaces completamente desacoplados.
- **Decisión:** Mantener una estructura limpia de tres workspaces principales (`backend`, `web`, `mobile`) descartando formalmente la creación de `packages/shared`. Los contratos y validaciones se definen como la única fuente de verdad en esquemas Zod y TypeScript dentro del Backend (`backend/src/contracts/` y DTOs modulares), y se consumen/duplican limpiamente en Web y Mobile mediante interfaces sincronizadas sin requerir pipelines de compilación intermedia complejos (Turborepo/Nx no requeridos), ni scripts de transpilación previa.
- **Consecuencias:** Máxima velocidad de compilación e inicialización en desarrollo local, cero fricción de tooling en CI/CD, e independencia absoluta para compilar, probar y desplegar `backend`, `web` y `mobile` de forma aislada.

### ADR-009: Mensajería Tiempo Real con Socket.io & Redis Adapter
- **Contexto:** Necesidad de chat en vivo y notificaciones globales con capacidad de escalar a múltiples nodos backend.
- **Decisión:** Integrar Socket.io acoplado con `@socket.io/redis-adapter` en clúster Redis.
- **Consecuencias:** Comunicación bidireccional instantánea con broadcast sincronizado entre todas las instancias del servidor.

### ADR-010: Almacenamiento Resiliente Multi-Cloud (S3 + Fallback Local) & Acceso Autenticado a Archivos Clínicos
- **Contexto:** Los archivos clínicos (estudios de laboratorio, recetas, imágenes de chat y avatares) deben guardarse de forma duradera, pero no pueden exponerse públicamente como archivos estáticos sin autenticación. Un atacante que conozca o adivine una URL podría acceder a documentación médica sensible de pacientes (Ley 25.326, Art. 9).
- **Decisión:**
  1. **Almacenamiento:** Implementar un adaptador desacoplado con **Amazon S3** como almacenamiento primario y **Fallback Local Automático** hacia `/app/uploads/` en Docker (Coolify VPS).
  2. **Prohibición de Serving Estático Público:** El directorio `/uploads` NO debe ser expuesto como carpeta estática de Express ni accesible directamente por URL. Todo acceso a archivos médicos debe realizarse a través del endpoint protegido `GET /api/media/:id`.
  3. **Endpoint de Descarga Autenticado (`GET /api/media/:id`):** El backend verifica que el solicitante sea el dueño de la mascota, el veterinario asignado a la consulta vinculada o un ADMIN. Si no cumple, responde `403 Forbidden`. En producción S3, emite una Presigned URL con TTL de 5 minutos para streaming directo sin pasar por el backend.
- **Consecuencias:** Cumplimiento de Ley 25.326 de protección de datos médicos; resiliencia operativa 100% ante fallas de S3; superficie de ataque reducida al cero archivos accesibles públicamente.


### ADR-011: Notificaciones Push con Expo Push API & Bandeja In-App
- **Contexto:** Los tutores y veterinarios requieren enterarse de llamadas entrantes, mensajes de chat y recetas sin mantener la aplicación permanentemente en primer plano, sin incurrir en costos de servicios de terceros como OneSignal.
- **Decisión:** Implementar el servicio oficial de Expo Push API en el backend (`modules/notifications/`), persistiendo los tokens de dispositivo (`ExponentPushToken[...]`) en la base de datos, complementado con una bandeja de notificaciones persistidas in-app.
- **Consecuencias:** Notificaciones en tiempo real en Android/iOS a costo $0, con historial recuperable en la bandeja de la app ante pérdidas de conectividad.

### ADR-012: Teleconsulta con WebRTC / LiveKit SFU (Perfil Liviano 720p Adaptativo & Multicanal Sincrónico)
- **Contexto:** Se requería soporte de videollamadas de alta fidelidad entre el panel Web de veterinarios y la aplicación móvil de tutores. En dispositivos móviles de gama baja y redes 4G/5G con fluctuaciones de señal, una implementación WebRTC P2P tradicional sufre de congelamientos, desincronización de audio y sobrecalentamiento por falta de adaptación dinámica de bitrate. Adicionalmente, el examen clínico veterinario exige que ambos participantes puedan comunicarse por voz y video mientras simultáneamente intercambian mensajes de chat y macro-fotografías en alta resolución (para lesiones dermatológicas, mucosas gingivales o vómitos) sin pausar ni degradar la llamada.
- **Decisión:**
  1. **LiveKit Cloud / SFU con Perfil Adaptativo Liviano:** Adoptar LiveKit SFU configurado en resolución balanceada **720p a 24-30 fps** (bitrate máximo 1.2 Mbps, códec acelerado por hardware H.264/VP8), con adaptación automática de bitrate (Simulcast dinámico) que prioriza la continuidad del audio ante caídas de señal 4G.
  2. **Conmutación Obligatoria de Cámara (Frontal / Trasera):** La interfaz móvil debe incluir control directo de conmutación a la cámara trasera (`facingMode: 'environment'`) con autoenfoque activo para que el tutor examine a la mascota cómodamente sin posturas forzadas.
  3. **Multicanal Sincrónico (Video + Chat + Captura de Imágenes en Paralelo):**
     - **Web (Veterinario):** Layout de pantalla dividida con área de video central y panel lateral acoplado de chat/archivos con visor lightbox para zoom 100%.
     - **Mobile (Tutor):** Modo Picture-in-Picture / Bottom Sheet deslizante que permite chatear o capturar y adjuntar fotografías mediante `POST /api/media` sin suspender la transmisión de video ni el audio de la llamada.
  4. **Cero PII en Tokens:** Tokens generados exclusivamente con `identity: user.id` y `name: user.firstName`.
- **Consecuencias:** Rendimiento fluido garantizado en celulares de gama baja (Android Go / 2-3 GB RAM) sin sobrecalentamiento de CPU; examen clínico visual de alta precisión gracias al soporte de fotos macro de alta resolución; y eliminación de caídas de llamada por degradación de red móvil.

### ADR-013: Sala de Espera Profesional para Veterinarios
- **Contexto:** Prevenir el ejercicio ilegal de la profesión veterinaria en la plataforma.
- **Decisión:** Nuevas cuentas con rol `VET` inician en estado `PENDING`. El acceso a la sala de atención y chat queda inhabilitado hasta que un Administrador valida la matrícula profesional y activa la cuenta a `APPROVED`.
- **Consecuencias:** Garantía de calidad médica y blindaje legal para la empresa.

### ADR-014: Registro Inmutable de Auditoría (`AuditLog`)
- **Contexto:** Trazabilidad estricta de acciones sensibles (aprobación de médicos, reseteo de usuarios, modificaciones de roles, bajas).
- **Decisión:** Crear tabla `AuditLog` no modificable donde se almacenan todas las mutaciones administrativas con IP y UserAgent.
- **Consecuencias:** Capacidad de auditoría forense en tiempo real.

### ADR-015: TanStack React Query v5 para Caché y Sincronización Web
- **Contexto:** La interfaz web de veterinarios y administradores requiere consultar continuamente el estado de consultas, mensajes y pacientes, evitando llamadas REST redundantes y gestionando estados asíncronos complejos (carga, error, reconexión, datos obsoletos).
- **Decisión:** Adoptar **TanStack React Query v5** como la capa estándar de gestión de estado del servidor en la aplicación Web SPA (React 18.3.1 LTS). El provider global (`QueryClientProvider`) se inicializa en `web/src/App.tsx`, y la migración desde `useEffect` hacia hooks declarativos (`useQuery`/`useMutation`) se ejecuta de manera progresiva durante la elevación de componentes en Storybook.
- **Consecuencias:** Caché inteligente en memoria con deduplicación de peticiones en vuelo, invalidación reactiva de queries ante eventos Socket.io (`queryClient.invalidateQueries({ queryKey: ['consultations'] })`), actualizaciones optimistas en la UI y sincronización automática en segundo plano al recuperar el foco de la ventana.

### ADR-016: Conexión Mobile USB Directa con ADB Reverse para Redes Corporativas
- **Contexto:** En oficinas, hospitales veterinarios o redes Wi-Fi corporativas con aislamiento de clientes (Client Isolation) o firewalls estrictos, los celulares no pueden comunicarse vía Wi-Fi local con la máquina de desarrollo en el puerto 3001, bloqueando el testing con Expo Go.
- **Decisión:** Implementar un flujo de desarrollo mobile por cable USB directo utilizando **ADB Reverse** (`adb reverse tcp:3001 tcp:3001`), automatizado en el script `start.ps1` y accesible en terminal mediante comandos multiplataforma.
- **Consecuencias:** Tráfico de red ruteado 100% por cable USB con latencia cero, independencia total de la red Wi-Fi o proxies corporativos, y recarga en caliente de Expo instantánea y reproducible.

### ADR-017: Despliegue Backend Autohosteado en Coolify (VPS)
- **Contexto:** Minimizar costos recurrentes en dólares sin perder las comodidades de una plataforma moderna (CI/CD, certificados SSL automáticos, gestión de variables de entorno y servicios auxiliares).
- **Decisión:** Desplegar el Backend Node.js y la instancia de Redis sobre un servidor VPS propio utilizando **Coolify**, y el Frontend Web SPA sobre **Vercel** (o Hosting Web estático de **Hostinger**).
- **Consecuencias:** Costo predecible y bajo (servidor VPS fijo de $8 – $12 USD/mes), control total sobre la infraestructura de WebSockets persistentes (Traefik) y CDN global para la Web.

### ADR-018: Estrategia Tripartita de Distribución Android (EAS Play Store, APK Web y Local Build)
- **Contexto:** Se requería una estrategia de despliegue móvil que permitiera validar rápidamente el MVP con clínicas beta sin quedar bloqueados por los tiempos de revisión de Google Play Store (que pueden demorar días o semanas), pero manteniendo la vía formal para producción.
- **Decisión:** Establecer una **estrategia tripartita de empaquetado y distribución**:
  1. *Camino 1 (Producción Oficial):* Compilación en la nube con EAS Build en formato Android App Bundle (`.aab`) firmado para Google Play Store.
  2. *Camino 2 (Beta Privada Inmediata):* Compilación directa de instalable APK (`.apk`) distribuido desde la web oficial de VetConnect para instalación directa (sideloading) por clínicas aliadas.
  3. *Camino 3 (Desarrollo Local Offline):* Compilación de APK en la máquina local mediante `npx expo prebuild` y Gradle sin consumir créditos de EAS Cloud.
- **Consecuencias:** Cero fricción para pruebas piloto con usuarios reales desde el Sprint 6, independencia frente a políticas de tiendas para betas y preparación formal para la publicación final en Google Play Store en el Sprint 10.

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
- **Contexto:** Se requería definir sin ambigüedades la plataforma de hosting para el Frontend Web SPA (React 18.3.1 LTS + Vite) y la integración continua en CI/CD.
- **Decisión:** Adoptar **Vercel** como la plataforma oficial, definitiva y automatizada para producción conectada a GitHub Actions. Se descarta cualquier flujo de despliegue automatizado hacia Hostinger; este último queda documentado exclusivamente como **alternativa de contingencia manual** (subida de artefactos estáticos `web/dist/` a `public_html/` ante indisponibilidad severa de Vercel).
- **Consecuencias:** Despliegues atómicos automáticos con preview URLs en cada PR, CDN global Edge de latencia ultra-baja y SSL automático, manteniendo una contingencia manual documentada para emergencias operativas.

### ADR-023: Escala Unificada de Calificación Profesional (1 a 5 Estrellas)
- **Contexto:** Existía necesidad de armonizar la escala de valoración médica del servicio entre la aplicación móvil de tutores, el panel de veterinarios y el recálculo analítico en base de datos.
- **Decisión:** Estandarizar de forma estricta y universal la escala de **1 a 5 estrellas** (enteros del 1 al 5) en base de datos (`Review.rating`), endpoints REST (`POST /api/consultations/:id/review`), esquemas Zod, UI Kit web, app móvil React Native y recálculo atómico denormalizado (`rating_avg` y `rating_count` en la tabla `users`, conforme a ADR-019). Queda formalmente descartada cualquier escala alternativa (ej. 1 a 10).
- **Consecuencias:** Coherencia de UX/UI alineada con los estándares de la industria y la intuición de usuarios, simplificación de validaciones en frontend y backend, y alineación directa con los KPIs de satisfacción del proyecto (CSAT).

---


### ADR-024: Máquina de Estados Finita de Consultas (FSM de 4 Estados, Auto-Asignación FIFO y Gestión Determinista de Timeouts)
- **Contexto:** En el análisis preliminar se evaluó un flujo de 5 estados con oferta intermedia (`WAITING -> PENDING -> ACTIVE`). Dicho flujo exigía temporizadores distribuidos en Redis para expiración de ofertas, gestión de reintentos ante rechazos de profesionales y sincronización compleja de eventos Socket.io propensa a condiciones de carrera. Adicionalmente, el diseño original no documentaba el comportamiento ante dos casos borde críticos: (a) ausencia total de veterinarios online en el momento del triage y (b) desconexión abrupta del veterinario durante una consulta activa.
- **Decisión:**
  1. **FSM de 4 estados** en PostgreSQL (`ConsultationStatus`: `WAITING`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
  2. **Auto-asignación FIFO directa:** El algoritmo de triage en `WAITING` busca el primer veterinario disponible (`role = VET`, `vetStatus = APPROVED`, `isOnline = true`) y transiciona atómicamente a `ACTIVE`.
  3. **Timeout de Triage (WAITING → CANCELLED):** Si al momento de ingresar a triage no hay veterinarios online, la consulta permanece en `WAITING`. Transcurridos **15 minutos** sin asignación, el servicio de triage transiciona automáticamente la consulta a `CANCELLED` con código de auditoría `TIMEOUT_NO_VET_AVAILABLE`, notificando al tutor vía Socket.io y Push Notification con sugerencia de reintento o contacto urgente.
  4. **Ventana de Gracia por Desconexión (ACTIVE → CANCELLED o WAITING):** Si el veterinario pierde la conexión socket durante una consulta `ACTIVE`, se abre una ventana de gracia de **3 minutos** controlada por heartbeat y presencia Redis. Si reconecta dentro del intervalo, la sesión continúa sin interrupción. Si la ventana expira, la consulta transiciona a `CANCELLED` (`VET_DISCONNECTED_TIMEOUT`) con opción de reencolado prioritario en `WAITING` para el tutor.
  5. **Cancelaciones voluntarias:** Antes o durante la atención, cualquier participante puede cancelar hacia `CANCELLED` (código `VOLUNTARY_CANCELLATION`).
- **Consecuencias:** Eliminación total de condiciones de carrera por oferta simultánea en WebSockets; comportamiento predecible y auditado ante los 5 escenarios posibles de la FSM; auditoría inequívoca de tiempos de espera ($P_{50} < 3\text{ min}$, $P_{95} < 5\text{ min}$); y experiencia de usuario resiliente ante cortes de red transitorios sin pérdida de la consulta.
