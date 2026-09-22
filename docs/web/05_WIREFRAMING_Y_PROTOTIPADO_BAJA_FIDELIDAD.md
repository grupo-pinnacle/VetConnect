# 📐 05. Wireframing & Prototipado de Baja Fidelidad — VetConnect

> **Documento:** `docs/web/05_WIREFRAMING_Y_PROTOTIPADO_BAJA_FIDELIDAD.md`  
> **Marco Metodológico:** Incorpora formalmente la **Actividad 25 – Prototipo de Baja Fidelidad**  
> **Área:** Maquetado Estructural de Pantallas, Jerarquía de Contenidos y Acciones por Vista  
> **Proyecto:** VetConnect — Telemedicina Veterinaria & Gestión Clínica

---

## 1. Propósito del Prototipado de Baja y Media Fidelidad (Fase 2)

El maquetado estructural mediante **wireframes de baja y media fidelidad** traduce la arquitectura de información abstracta (el árbol web) en interfaces tangibles. En esta etapa, el foco radica exclusivamente en la disposición de los elementos, la jerarquía visual de los datos clínicos y las acciones disponibles para el usuario, sin distraer la atención con ornamentación gráfica innecesaria.

> 🔬 **Diagnóstico de Madurez Actual (Nivel 4.5 / 5 — Pre-Gold Master / Staging-Ready):**  
> Las pantallas implementadas en el código fuente (`web/src/pages/`) operan con éxito como **Wireframes Interactivos de Media Fidelidad Completamente Funcionales**. Cuentan con toda la reactividad, llamadas a endpoints Zod, WebSockets, WebRTC 720p, code-splitting y subida de fotos operativas al 100%.  
> 📌 Ver protocolo metodológico de diseño colaborativo y exportación en [06_SISTEMA_DE_DISENO_UI_KIT.md (§7)](./06_SISTEMA_DE_DISENO_UI_KIT.md#7-metodología-híbrida-storybook--figma).

Cada pantalla representa una hipótesis de solución operativa diseñada para resolver las tareas críticas identificadas en los requerimientos del sistema.

---

## 2. Catálogo de Pantallas Estructurales Clave (Actividad 25)

> 💡 **Relación con la Especificación de Alta Fidelidad (Fase 3):**  
> Este catálogo define la disposición espacial en bloques funcionales (Wireframing). Para especificación visual de Tailwind CSS, referirse a [09_PLANIFICACION_UI_ALTA_FIDELIDAD_CODE_FIRST.md](./09_PLANIFICACION_UI_ALTA_FIDELIDAD_CODE_FIRST.md).

A continuación se detallan las pantallas esenciales del ecosistema web de VetConnect, especificando su maquetación estructural en bloques, los datos que contiene y las acciones disponibles.

---

### Pantalla 1: Landing Page Institucional & Acceso Rápido (`/`)

*Conexión con el Árbol Web: [Nivel 1] Inicio*  
*Archivo Fuente Real:* [`web/src/pages/Landing.tsx`](../../web/src/pages/Landing.tsx)

```
+-------------------------------------------------------------------------------------------------------------+
| [LOGO VetConnect]    Servicios ▾    Directorio Médico    Respaldo SENASA    Ayuda     [Login] [🚨 Auxilio]  |
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|       [ TITULAR PRINCIPAL: ATENCIÓN VETERINARIA TELEMÉDICA OFICIAL EN MENOS DE 5 MINUTOS ]                 |
|       [ Subtítulo explicativo: Conectate con médicos matriculados por videollamada y recibí tu receta con QR ] |
|                                                                                                             |
|                    [ BOTÓN PRIMARIO: SOLICITAR GUARDIA AHORA ]     [ 📱 Descargar App (.apk) ]     [ Ver Cómo Funciona ] |
|                                                                                                             |
|   [ Banner de Métricas: +15.000 Consultas | 100% Veterinarios Verificados SENASA | Atención 24/7 ]           |
+-------------------------------------------------------------------------------------------------------------+
| [ BLOQUE: ¿CÓMO FUNCIONA EN 3 PASOS? ]                                                                      |
|  [ 1. Completá el Triage ]  ──>  [ 2. Videoconsulta HD con el Médico ]  ──>  [ 3. Receta Digital Oficial ]  |
+-------------------------------------------------------------------------------------------------------------+
| [ TESTIMONIOS & CASOS DE ÉXITO ]        |  [ SELLO DE HABILITACIÓN SANITARIA ]                              |
| "Salvaron a mi perro a las 2 AM..."     |  Logos colegios veterinarios y cumplimiento Ley 25.326            |
+-------------------------------------------------------------------------------------------------------------+
| [ FOOTER: Enlaces Legales | Términos y Condiciones | Privacidad | Contacto | Botón Emergencia 911 Vet ]     |
+-------------------------------------------------------------------------------------------------------------+
```

- **Información que contiene:** Propuesta de valor médica, tiempos de atención garantizados, pasos del flujo, credenciales de respaldo sanitario, testimonios verificados y acceso directo a la aplicación móvil.
- **Acciones disponibles:** 
  - Iniciar flujo de auxilio médico inmediato (`[SOLICITAR GUARDIA AHORA]`).
  - Descargar directamente el instalador de la app móvil Android (`.apk`) desde `/downloads/vetconnect-preview.apk` para la fase piloto clínica sin costo.
  - Explorar servicios telemédicos.
  - Iniciar sesión o registrarse.
  - Acceder a los números de emergencia presencial física.

---

### Pantalla 2: Portal de Acceso y Autenticación Unificada (`/login` & `/register`)

*Conexión con el Árbol Web: [Nivel 2] Autenticación de Usuarios*  
*Archivos Fuente Reales:* [`web/src/pages/Login.tsx`](../../web/src/pages/Login.tsx) y [`web/src/pages/Register.tsx`](../../web/src/pages/Register.tsx)

```
+-------------------------------------------------------------------------------------------------------------+
| [ HEADER MINIMALISTA: Logo VetConnect + Enlace 'Volver al Inicio' ]                                         |
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|                                      +------------------------------------+                                 |
|                                      |        INICIAR SESIÓN SEGURA       |                                 |
|                                      +------------------------------------+                                 |
|                                      | Correo Electrónico:                |                                 |
|                                      | [ input: usuario@ejemplo.com     ] |                                 |
|                                      |                                    |                                 |
|                                      | Contraseña:                        |                                 |
|                                      | [ input: ••••••••••••••          ] |                                 |
|                                      |                                    |                                 |
|                                      | [ BOTÓN: INGRESAR A LA PLATAFORMA ]|                                 |
|                                      |                                    |                                 |
|                                      | ¿No tenés cuenta? [Registrate acá] |                                 |
|                                      +------------------------------------+                                 |
|                                                                                                             |
+-------------------------------------------------------------------------------------------------------------+
```

- **Información que contiene:** Formulario unificado de acceso por email y contraseña. El backend resuelve el rol del usuario redirigiendo al dashboard correspondiente. Manejo de errores RFC 7807 en tiempo real.
- **Acciones disponibles:** Validar credenciales de acceso y navegar hacia el registro.

---

### Pantalla 3: Portal del Tutor, Bóveda de Mascotas & Triage (`/client/dashboard`)

*Conexión con el Árbol Web: [Nivel 2] Ficha Médica de la Mascota & Portal Tutor*  
*Archivo Fuente Real:* [`web/src/pages/DashboardClient.tsx`](../../web/src/pages/DashboardClient.tsx)

> 📌 **Aclaración Arquitectónica (ADR-025):** Los siguientes diagramas ASCII representan exploraciones conceptuales tempranas de media fidelidad. En el código vivo de producción, el diseño real opera bajo una cuadrícula limpia de dos columnas (grid-cols-2: Mascotas a la izquierda, Triage y Consultas a la derecha) en DashboardClient.tsx, y una consola unificada sin navegación fragmentada en DashboardVet.tsx. La IA programadora debe guiarse siempre por el código vivo y docs/web/AGENT_CODING_SPEC.md.

```
+-------------------------------------------------------------------------------------------------------------+
| [LOGO VetConnect]    [Mis Mascotas]    [Historial Clínico]             [ 🚨 SOLICITAR ATENCIÓN ]  [Carlos ▾] |
+-------------------------------------------------------------------------------------------------------------+
| Breadcrumbs: Inicio > Mis Mascotas > Portal del Tutor                                                        |
+-------------------------------------------------------------------------------------------------------------+
| [ AVATAR ]  MILO ── Caniche Toy | Macho | 4 años | 8.5 kg                                                    |
|             Microchip ISO: 981098109810981 [✓ Verificado] | Tutor: Laura Gómez (Contacto Autorizado)        |
+-------------------------------------------------------------------------------------------------------------+
| HISTORIAL CRONOLÓGICO DE ATENCIONES                                                                         |
| +---------------------------------------------------------------------------------------------------------+ |
| | FECHA       | MOTIVO DE CONSULTA       | VETERINARIO INTERVINIENTE | RECETA EMITIDA     | ACCIONES      | |
| +-------------+--------------------------+---------------------------+--------------------+---------------+ |
| | 20/09/2026  | Gastroenteritis aguda    | Dr. Juan Mendoza (MP 8492)| [📄 Descargar PDF] | [Ver Detalle] | |
| | 14/05/2026  | Vacuna Antirrábica Anual | Dra. Camila Silva (MP 910)| [📄 Descargar PDF] | [Ver Detalle] | |
| | 10/01/2026  | Control de peso general  | Dr. Juan Mendoza (MP 8492)| —                  | [Ver Detalle] | |
| +-------------+--------------------------+---------------------------+--------------------+---------------+ |
+-------------------------------------------------------------------------------------------------------------+
```

- **Información que contiene:** Datos biométricos del animal, validación de microchip, antecedentes clínicos, acceso a solicitud de triage interactivo y archivo descargable de recetas previas.
- **Acciones disponibles:** Solicitar consulta de guardia inmediata vía modal de triage, descargar recetas históricas en PDF, consultar notas de evolución anteriores y registrar nuevas mascotas.

---

### Pantalla 4: Tablero de Guardia del Veterinario (`/vet/dashboard`)

*Conexión con el Árbol Web: [Nivel 1] Tablero de Guardia (Portal VET)*  
*Archivo Fuente Real:* [`web/src/pages/DashboardVet.tsx`](../../web/src/pages/DashboardVet.tsx)

```
+-------------------------------------------------------------------------------------------------------------+
| [LOGO Vet]  [Inicio] [Pacientes] [Recetas]         [ Switch: ● ESTOY ONLINE ]    [Dr. Mendoza ▾] [Salir]    |
+-------------------------------------------------------------------------------------------------------------+
| Breadcrumbs: Inicio > Tablero de Guardia Profesional                                                        |
+-------------------------------------------------------------------------------------------------------------+
| RESUMEN DEL TURNO                                                                                           |
| [ 🕒 Pacientes Atendidos Hoy: 8 ]   [ ⏱️ Espera Promedio: 2.4 min ]   [ ⭐ Calificación: 4.95 / 5 ]         |
+-------------------------------------------------------------------------------------------------------------+
| COLA DE PACIENTES EN ESPERA (Actualización en tiempo real vía Socket.io)                                    |
| +---------------------------------------------------------------------------------------------------------+ |
| | PACIENTE           | MOTIVO / SÍNTOMAS        | URGENCIA       | ESPERA  | ACCIÓN                       | |
| +--------------------+--------------------------+----------------+---------+------------------------------+ |
| | 🐶 Milo (Caniche)  | Vómitos recurrentes (4x) | [🔴 ROJO/ALTA] | 01:12 m | [ 📞 INICIAR CONSULTA AHORA ]| |
| | 🐱 Luna (Siamés)   | Claudicación pata trasera| [🟡 AMARILLO]  | 03:45 m | [ Ver Antecedentes ]         | |
| | 🐶 Thor (Bulldog)  | Consulta por dermatitis  | [🟢 VERDE/BAJA]| 05:20 m | [ Ver Antecedentes ]         | |
| +--------------------+--------------------------+----------------+---------+------------------------------+ |
+-------------------------------------------------------------------------------------------------------------+
```

- **Información que contiene:** Estado de presencia (`isOnline`), métricas del turno de guardia, cola dinámica de pacientes con priorización por triage y tiempos de espera.
- **Acciones disponibles:** Conmutar estado de guardia (Online/Offline), atender paciente prioritario, revisar antecedentes clínicos previos y acceder al historial de consultas finalizadas.

---

### Pantalla 5: Consola de Videoconsulta Telemédica HD (`/call/:id`)

*Conexión con el Árbol Web: [Nivel 3] Sala de Atención Médica Activa*  
*Archivos Fuente Reales:* [`web/src/pages/ConsultationRoom.tsx`](../../web/src/pages/ConsultationRoom.tsx) y [`web/src/components/call/CallRoom.tsx`](../../web/src/components/call/CallRoom.tsx) (con handshake `ReactNativeWebView.postMessage`)

#### Estado A: Sala de Espera Interactiva (`ConsultationRoom.tsx` cuando `status === 'WAITING'`)

```
+-----------------------------------------------------------------------------+
| [🐾 VetConnect]                                            Tutor: En Espera |
+-----------------------------------------------------------------------------+
|                                                                             |
|                       🔄 CONECTANDO CON LA GUARDIA                          |
|              Aguardando que un veterinario tome tu consulta...              |
|                                                                             |
|       [ Animación de Pulso / Spinner ]   Tiempo transcurrido: 02:45        |
|                                                                             |
|       Paciente: Milo (Canino) | Prioridad: [ ROJO - EMERGENCIA VITAL ]      |
|       Síntomas reportados: Dificultad respiratoria leve observada...        |
|                                                                             |
|                   [ ✕ CANCELAR SOLICITUD DE GUARDIA ]                       |
|                                                                             |
+-----------------------------------------------------------------------------+
```
Si el tutor presiona `[ CANCELAR SOLICITUD ]`, ejecuta `PATCH /api/consultations/:id/cancel` y navega a `/client/dashboard`.

#### Estado B: Videoconsulta Activa (`ConsultationRoom.tsx` cuando `status === 'ACTIVE'`)

```
+-------------------------------------------------------------------------------------------------------------+
| Breadcrumbs: Inicio > Tablero de Guardia > Consulta Médica Activa #3492                                     |
+--------------------------------------------------------------------+----------------------------------------+
| ÁREA DE VIDEOLLAMADA WEBRTC (720p - LiveKit)                       | PANEL LATERAL CLÍNICO MULTIMODAL       |
|                                                                    | [ Tab: Chat & Fotos ]  [ Tab: Ficha ]  |
| +----------------------------------------------------------------+ | +------------------------------------+ |
| |                                                                | | | HISTORIAL DEL CHAT EN VIVO:        | |
| |                    [ VIDEO DEL PACIENTE ]                      | | |                                    | |
| |                                                                | | | [Tutor 23:14]: Doctor, acá le subo | |
| |                                                                | | | la foto de cómo tiene las encías:  | |
| |                                                                | | | [ 📷 FOTO_MACRO_01.JPG (Ver Zoom) ]| |
| |                                                                | | |                                    | |
| |                                                                | | | [Vet 23:15]: Veo las mucosas pálidas| |
| |   [ PiP: Video Propio del Veterinario ]                        | | +------------------------------------+ |
| +----------------------------------------------------------------+ | | Escribir mensaje o adjuntar imagen: | |
| | CONTROLES: [ 🎙️ Silenciar ] [ 📹 Cámara ] [ 🔴 FINALIZAR CONSULTA ]| | [ Input mensaje...         ] [📎 Adj]| |
+--------------------------------------------------------------------+----------------------------------------+
| ÁREA INFERIOR: NOTAS CLÍNICAS DE EVOLUCIÓN (Sincronización en tiempo real)                                   |
| [ Diagnóstico Presuntivo / Síntomas observados / Indicaciones preliminares...                             ] |
| [ BOTÓN: CONFECCIONAR RECETA MÉDICA SENASA ]                                                                |
+-------------------------------------------------------------------------------------------------------------+
```

- **Información que contiene:** Flujo de video bidireccional en alta definición (LiveKit SFU), chat sincrónico lateral con visor Lightbox de imágenes clínicas y bloque de redacción de evolución clínica.
- **Acciones disponibles:** Silenciar/activar micrófono y cámara, inspeccionar macro-fotografías en zoom completo, redactar notas médicas, emitir receta oficial y finalizar la atención médica.
- **Estado Técnico de Implementación & Frontend Hardening:**
  1. *WebRTC LiveKit & Audio:* ✅ **100% Operativo** sin duplicar renderers de audio.
  2. *Inyección Dinámica de `wsUrl`:* ✅ **100% Implementado** en `ConsultationRoom.tsx`, inyectando dinámicamente `serverUrl={livekitWsUrl}` en `<CallRoom />`.
  3. *Chat Clínico Multimodal con Macro-Fotos:* ✅ **100% Implementado**, con subida segura a `POST /api/media` (validación de Magic Bytes), visualizador modal *Lightbox* en pantalla completa y soporte de cierre con tecla `Escape`.

---

### Pantalla 6A: Modal Clínico de Emisión de Receta Oficial (`PrescriptionModal`)

*Conexión con el Árbol Web: [Nivel 3] Emisión de Receta (Modal Flotante)*
*Componente Objetivo:* `web/src/components/ui/PrescriptionModal.tsx` (pendiente de extracción atómica — ver §10 de `06_SISTEMA_DE_DISENO_UI_KIT.md`).

> ⚠️ **Estado Real de Implementación (Gap Conocido):**
> La lógica de emisión de receta (`PrescriptionModal`) está **actualmente implementada SOLO en [`web/src/pages/DashboardVet.tsx`](../../web/src/pages/DashboardVet.tsx)** (estado `isPrescriptionModalOpen`, handler `handlePrescription`, formulario JSX en líneas ~16-93 y ~322-397).
> **En [`web/src/pages/ConsultationRoom.tsx`](../../web/src/pages/ConsultationRoom.tsx) NO existe el modal de receta.** El botón `[ CONFECCIONAR RECETA MÉDICA SENASA ]` mostrado en el wireframe del Estado B es un **gap de implementación pendiente en ConsultationRoom.tsx**.
> La tarea de desarrollo consiste en extraer la lógica a un componente atómico `PrescriptionModal.tsx` e invocarlo desde ambas pantallas (`ConsultationRoom.tsx` y `DashboardVet.tsx`), según la Fase 3 del CDD Roadmap en `06_SISTEMA_DE_DISENO_UI_KIT.md §10`.

- **Acciones disponibles:** Completar campos de medicamento (`medication`), dosis (`dosage`), frecuencia (`frequency`), duración (`durationDays`) e indicaciones (`indications`, mínimo 5 caracteres). Al confirmar, el frontend ejecuta `POST /api/consultations/:id/prescriptions`.

---

### Pantalla 6B: Vista Pública de Verificación QR de Receta (`/prescriptions/:id`)

*Conexión con el Árbol Web: [Nivel 2] Receta Digital Oficial SENASA (/prescriptions/:id)*
*Archivo Fuente Real:* [`web/src/pages/PrescriptionView.tsx`](../../web/src/pages/PrescriptionView.tsx)
*Acceso:* **Público** — Veterinarias, farmacias y SENASA escanean el QR para verificar la receta.

```
+-------------------------------------------------------------------------------------------------------------+
| [data-testid="prescription-header-title"] RECETA MÉDICA OFICIAL SENASA                                      |
+-------------------------------------------------------------------------------------------------------------+
| Paciente: [nombre de la mascota] | Tutor: [nombre del cliente] | Fecha: [ISO]                               |
| Médico Emisor: Dr. [nombre] | Matrícula: [licenseNumber]                                                    |
+-------------------------------------------------------------------------------------------------------------+
| [data-testid="rx-medication"] Medicamento: [medication]                                                     |
| Dosis: [dosage] | Frecuencia: [frequency] | Duración: [durationDays] días                                  |
| Indicaciones: [indications]                                                                                  |
+-------------------------------------------------------------------------------------------------------------+
| [data-testid="prescription-qr-code"] ████ CÓDIGO QR DE VERIFICACIÓN ████                                  |
| URL del QR: https://app.vetconnect.com.ar/prescriptions/:id                                                 |
+-------------------------------------------------------------------------------------------------------------+
| [data-testid="print-prescription-button"] [ 🖨️ IMPRIMIR RECETA A4 ]                                        |
+-------------------------------------------------------------------------------------------------------------+
```

- **Endpoint consumido:** `GET /api/prescriptions/:id` (Público, no requiere autenticación).
- **Estilo de Impresión:** CSS `@media print` activo — genera hoja A4 médica lista para farmacias.

---

### Pantalla 7: Panel de Administración y Fiscalización SENASA (`/admin/vets`)

*Conexión con el Árbol Web: [Nivel 1] Portal de Administración General*  
*Archivo Fuente Real:* [`web/src/pages/AdminVets.tsx`](../../web/src/pages/AdminVets.tsx)

```
+-------------------------------------------------------------------------------------------------------------+
| [LOGO Admin]  [Solicitudes SENASA]  [Veterinarios Activos]  [Métricas Globales]       [Admin Root ▾]        |
+-------------------------------------------------------------------------------------------------------------+
| SOLICITUDES DE ALTA PROFESIONAL PENDIENTES DE APROBACIÓN SANITARIA (Filtro: vetStatus = PENDING)           |
| +---------------------------------------------------------------------------------------------------------+ |
| | PROFESIONAL          | EMAIL              | MATRÍCULA  | BIO / ESPECIALIDAD   | FECHA REGISTRO | AUDITORÍA      | |
| +----------------------+--------------------+------------+----------------------+----------------+----------------+ |
| | Dr. Martín Palermo   | m.palermo@vet.ar   | MP-55421   | Cirugía              | 20/09/2026     | [APROBAR][RECH]| |
| | Dra. Elena Russo     | e.russo@vet.ar     | MP-88312   | Clínica General      | 21/09/2026     | [APROBAR][RECH]| |
| +----------------------+--------------------+------------+------------------+----------------+----------------+ |
+-------------------------------------------------------------------------------------------------------------+
| TRAZABILIDAD Y AUDITORÍA INMUTABLE (AuditLog Backend - ADR-014):                                             |
Cada acción genera un registro inmutable en audit_logs con admin_id, action ('APPROVE_VET' | 'REJECT_VET'), target_id (ID del veterinario), ip_address y details ({ reason }). El rechazo actualiza vetStatus a 'REJECTED' sin aplicar soft-delete. |
+-------------------------------------------------------------------------------------------------------------+
```

- **Información que contiene:** Cola de validación de veterinarios pendientes (`PENDING`), datos de contacto y número de matrícula profesional SENASA.
- **Acciones disponibles:** Validar matrícula habilitada ante registro oficial, aprobar profesional (`vetStatus = APPROVED`), rechazar con motivo justificado y registrar evento forense inmutable.

---
*Documento de Wireframing y Prototipado de Baja Fidelidad — VetConnect 2026.*
