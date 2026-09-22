# 💎 09. Planificación de UI de Alta Fidelidad — Estrategia "Code-First con Antigravity"

> **Documento:** `docs/web/09_PLANIFICACION_UI_ALTA_FIDELIDAD_CODE_FIRST.md`  
> **Marco Metodológico:** Incorpora formalmente el **Paso 6: Especificación de Mockups de Alta Fidelidad & Prototipado Interactivo**  
> **Estrategia Adoptada:** 🏆 **"Code-First con Antigravity → y luego exportar a Figma con Plugin (`html.to.design`)"**  
> **Área:** Especificación de UI de Alta Fidelidad, Tokens Tailwind CSS, Microinteracciones y Puente a Figma  
> **Proyecto:** VetConnect — Telemedicina Veterinaria & Gestión Clínica  
> **Estado:** `APPROVED & MASTERED HIGH-FIDELITY SPECIFICATION` | Septiembre 2026

---

## 🧭 1. Fundamentación Estratégica: Modelo Híbrido Virtuoso (Storybook + Figma)

> 📌 Ver protocolo metodológico de diseño colaborativo y exportación en [06_SISTEMA_DE_DISENO_UI_KIT.md (§7)](./06_SISTEMA_DE_DISENO_UI_KIT.md#7-metodología-híbrida-storybook--figma).

---

## 🎨 2. Catálogo de Pantallas en Alta Fidelidad (Especificación Detallada)

> 📐 **Relación con Wireframes Estructurales (Fase 2):**  
> La disposición funcional en bloques de cada pantalla se encuentra diagramada en [05_WIREFRAMING_Y_PROTOTIPADO_BAJA_FIDELIDAD.md](./05_WIREFRAMING_Y_PROTOTIPADO_BAJA_FIDELIDAD.md). El presente catálogo detalla las clases atómicas de Tailwind CSS, jerarquía DOM y microinteracciones.

> 🤖 **Directiva Imperativa para Agentes de IA:**  
> Toda nueva vista o refactorización de pantallas en `web/src/pages/` DEBE estructurarse consumiendo los componentes atómicos y moleculares reutilizables de `web/src/components/ui/` (`<Button>`, `<Input>`, `<Badge>`, etc.) en lugar de escribir elementos HTML nativos con clases Tailwind duplicadas en línea.  
> ⚠️ **Protocolo No Destructivo:** Las pantallas funcionales actuales (Nivel 4.5) no deben borrarse ni reescribirse masivamente de golpe. Se debe seguir la **Estrategia de Refactorización Progresiva** ([`11_INTEGRACION_STORYBOOK_Y_TESTSPRITE_QA.md#24-estrategia-de-refactorización-progresiva-de-páginas-monolíticas-a-componentes-atómicos`](./11_INTEGRACION_STORYBOOK_Y_TESTSPRITE_QA.md#24-estrategia-de-refactorización-progresiva-de-páginas-monolíticas-a-componentes-atómicos)), extrayendo cada componente a `components/ui/`, probándolo en Storybook (`.stories.tsx`), y luego reemplazándolo limpiamente en la página preservando en todo momento los 29 tests web en verde.

A continuación se detalla la especificación visual, la disposición de elementos, las clases de Tailwind CSS, los estados interactivos y la accesibilidad para las 7 pantallas clave de VetConnect Web.

---

### 🖥️ Pantalla 1: Landing Page Institucional & Urgencias (`/`)
- **Archivo Fuente:** [`web/src/pages/Landing.tsx`](../../web/src/pages/Landing.tsx)
- **Rol de Usuario:** Público general, tutores de mascotas y veterinarios postulantes.

#### 📐 Estructura Visual y Secciones:
1. **Header Fijo de Navegación (`bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50`):**
   - *Izquierda:* Isotipo vectorial VetConnect (Cruz Médica + Huella en azul `#2563EB`) y tipografía *Plus Jakarta Sans Bold* `text-slate-900`.
   - *Centro:* Enlaces de navegación con hover sutil (`text-slate-600 hover:text-blue-600 transition-colors`): "Servicios", "Directorio Médico", "Respaldo SENASA", "Ayuda".
   - *Derecha:* Acceso rápido con botón secundario `[Iniciar Sesión]` (`border border-slate-300 text-slate-700 hover:bg-slate-50`) y botón primario de auxilio `[🚨 Guardia Médica]` (`bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm animate-pulse`).
2. **Hero Section de Alto Impacto (`bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-16 lg:py-24`):**
   - *Badge de Triage Superior:* `bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2`.
   - *Titular Principal (H1):* *Plus Jakarta Sans ExtraBold* (`text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight`). Texto de enganche: *"Atención Veterinaria Oficial por Telemedicina en Menos de 5 Minutos"*.
   - *Bajada Explicativa:* *Inter Regular* (`text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mt-4`).
   - *Grupo de Botones de Acción (CTA):*
     - Botón Principal: `[ SOLICITAR GUARDIA AHORA ]` (`bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95`).
     - Botón Descarga Piloto App Móvil: `[ 📱 Descargar App Android (.apk) ]` (`bg-slate-900 hover:bg-slate-800 text-white font-medium text-base px-6 py-4 rounded-xl flex items-center gap-2`). Enlace directo al `.apk` para fase piloto sin costo en Google Play Console.
     - Botón Educativo: `[ Ver Cómo Funciona ]` (`bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-4 rounded-xl`).
3. **Barra de Métricas de Confianza (`bg-white border-y border-slate-200 py-8`):**
   - Cuadrícula de 4 columnas:
     - `+15.000` Teleconsultas Realizadas con Éxito.
     - `100%` Veterinarios Matriculados Verificados ante SENASA.
     - `< 3 Minutos` Tiempo Promedio de Respuesta en Guardia.
     - `4.9 / 5 ⭐` Calificación Promedio de Tutores.
4. **Bloque "Cómo Funciona en 3 Pasos" (`py-16 bg-slate-50`):**
   - Tarjetas blancas con borde redondeado `rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow`:
     - *Paso 1:* `Triage Inteligente` (Icono `Activity` en círculo azul).
     - *Paso 2:* `Videoconsulta HD 720p` (Icono `Video` en círculo azul).
     - *Paso 3:* `Receta Digital con QR` (Icono `FileCheck` en círculo verde).
5. **Sellos Legales y Footer Institucional (`bg-slate-900 text-slate-400 py-12`):**
   - Ley 25.326 de Protección de Datos Personales de Salud.
   - Certificación de Receta Oficial Electrónica SENASA.
   - Enlaces a Políticas de Privacidad, Términos y Soporte.

---

### 🔐 Pantalla 2: Portal de Autenticación Unificada (`/login` & `/register`)
- **Archivos Fuente:** [`web/src/pages/Login.tsx`](../../web/src/pages/Login.tsx) y [`web/src/pages/Register.tsx`](../../web/src/pages/Register.tsx)
- **Rol de Usuario:** Tutores y Veterinarios iniciando sesión o registrándose.

#### 📐 Estructura Visual y Componentes:
1. **Contenedor Flotante Centrado (`min-h-screen bg-slate-50 flex items-center justify-center p-4`):**
   - Tarjeta principal: `w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8`.
2. **Cabecera de Marca:**
   - Logotipo centrado con icono de huella médica.
   - Título: *Plus Jakarta Sans Bold* `text-2xl text-slate-900 text-center`.
   - Subtítulo empático: *"Ingresá a tu portal de salud veterinaria"*.
3. **Selector de Rol por Pestañas (Segmented Control):**
   - `flex bg-slate-100 p-1 rounded-xl mb-6`:
     - Pestaña `[ 🐾 Tutor ]`: `w-1/2 py-2 text-center text-sm font-semibold rounded-lg transition-all` (`bg-white text-slate-900 shadow-sm` cuando está activo).
     - Pestaña `[ 🩺 Veterinario ]`: `w-1/2 py-2 text-center text-sm font-semibold rounded-lg transition-all`.
4. **Campos de Formulario:**
   - Label flotante o superior: `text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5`.
   - Input de correo: `w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors text-slate-900`.
   - Input de contraseña con botón para alternar visibilidad (icono `Eye` / `EyeOff` de Lucide).
   - En registro de Veterinario: Campo condicional de `Matrícula Profesional` y `Provincia de Colegiación`.
5. **Manejo de Errores RFC 7807:**
   - Contenedor de error reactivo: `bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2`.
6. **Botón de Envío Primario:**
   - `w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2`:
   - Estado de carga: Spinner circular SVG y texto *"Verificando credenciales..."*.

---

### 🐾 Pantalla 3: Bóveda del Tutor & Triage Reactivo (`/client/dashboard`)
- **Archivo Fuente:** [`web/src/pages/DashboardClient.tsx`](../../web/src/pages/DashboardClient.tsx)
- **Rol de Usuario:** Tutor de mascotas (`CLIENT`).

#### 📐 Estructura Visual y Módulos:
1. **Header Clínico del Tutor:**
   - Saludo personalizado: *"Hola, Carlos. ¿Cómo están tus mascotas hoy?"*.
   - Botón destacado de acción rápida: `[ 🚨 Solicitar Consulta de Guardia ]` (`bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm`).
2. **Carrusel / Cuadrícula de Mascotas ("Mis Pacientes Peludos"):**
   - Tarjetas clínicas individuales (`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors`):
     - Avatar circular de la mascota con borde temático según especie (Perro/Gato).
     - Nombre en *Plus Jakarta Sans Bold* `text-lg text-slate-900`.
     - Badges informativos: `Raza`, `Edad (3 años)`, `Peso (14.2 kg)`.
     - Indicador de Microchip ISO: `inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md` con icono `ShieldCheck`.
     - Botón para ver carnet de vacunación y recetas previas.
   - Tarjeta para agregar mascota: `border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 hover:border-blue-500 cursor-pointer`.
3. **Modal Interactivo de Triage Reactivo en 3 Pasos:**
   - *Paso 1: Selección de Mascota:* Selector radial simple.
   - *Paso 2: Síntomas y Motivo:* Lista de chequeo con opciones directas (Vómitos, Claudicación, Dificultad respiratoria, Herida cortante, Decaimiento).
   - *Paso 3: Evaluación Semántica de Urgencia:*
     - El sistema calcula el triage automáticamente:
       - **🔴 Triage Rojo (Urgencia Vital):** Cartel de advertencia prioritario, conexión directa con el primer médico libre.
       - **🟡 Triage Amarillo (Moderado):** Cola regular de espera estimada (< 5 min).
       - **🟢 Triage Verde (Leve / Consulta General):** Opción de espera o agendamiento diferido.
4. **Redirección Inmediata a Telemedicina en Tiempo Real:**
   - Al enviar el formulario de triage en `DashboardClient.tsx`, el sistema navega inmediatamente a `/call/:id`, conectando al tutor a la sala telemédica (`ConsultationRoom.tsx`).

---

### 🩺 Pantalla 4: Tablero de Guardia Profesional del Veterinario (`/vet/dashboard`)
- **Archivo Fuente:** [`web/src/pages/DashboardVet.tsx`](../../web/src/pages/DashboardVet.tsx)
- **Rol de Usuario:** Médico Veterinario de Guardia (`VET`).

#### 📐 Estructura Visual y Consola Operativa:
1. **Barra Superior de Control de Guardia:**
   - Datos del profesional: Nombre, foto de perfil clínico y número de matrícula SENASA.
   - **Switch de Presencia en Tiempo Real (`isOnline`):**
     - Botón interactivo con estado visual claro:
       - *Online:* `bg-emerald-600 text-white` con punto pulsante verde (`animate-ping`).
       - *Offline:* `bg-slate-200 text-slate-700`.
2. **Panel de Métricas del Turno:**
   - 3 tarjetas KPI (`bg-white rounded-xl border border-slate-200 p-4`):
     - `Consultas Realizadas Hoy`: Contador numérico grande (`text-2xl font-bold text-slate-900`).
     - `Tiempo Medio de Consulta`: `14 min`.
     - `Satisfacción del Tutor`: `4.95 / 5 ⭐`.
3. **Cola de Espera de Pacientes (Triage Prioritario):**
   - Tabla clínica interactiva con actualización en vivo vía WebSockets:
     - *Columnas:* `Paciente (Especie/Raza)`, `Tutor`, `Motivo de Consulta`, `Nivel de Triage`, `Tiempo en Espera`, `Acción`.
     - *Priorización cromática:* Las consultas rojas se fijan automáticamente en la primera posición con borde izquierdo rojo de 4px y badge `bg-red-100 text-red-800`.
     - *Botón de Acción:* `[ Atender Ahora ]` (`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg`, navega a `/call/:id`).
4. **Bóveda Rápida de Emisión de Recetas Digitales:**
   - Acceso inmediato para generar recetas oficiales durante o después de la videoconsulta (modal embebido con vista previa directa).

---

### 🎥 Pantalla 5: Consola de Videoconsulta Telemédica HD & Chat Clínico (`/call/:id`)
- **Archivos Fuente:** [`web/src/pages/ConsultationRoom.tsx`](../../web/src/pages/ConsultationRoom.tsx) y [`web/src/components/call/CallRoom.tsx`](../../web/src/components/call/CallRoom.tsx)
- **Rol de Usuario:** Médico Veterinario y Tutor en teleconsulta activa.

#### 📐 Estructura Dividida (Split Screen 65% / 35%):
1. **Lado Izquierdo: Viewport WebRTC LiveKit (65% del ancho):**
   - Contenedor con fondo oscuro (`bg-slate-950 rounded-2xl overflow-hidden relative aspect-video lg:aspect-auto h-[600px]`):
     - Video remoto del paciente / médico en resolución nativa 720p a 30 fps.
     - Video local en miniatura flotante (Picture-in-Picture) en la esquina inferior derecha.
     - Badge superior de estado de conexión: `Calidad de señal: Excelente (Ping 28ms)` en texto verde.
   - **Barra de Controles Flotante Inferior:**
     - Contenedor con efecto cristal (`bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4`):
       - Botón Microfono: Alterna entre `Mic` y `MicOff` (`bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full`).
       - Botón Cámara: Alterna entre `Video` y `VideoOff`.
       - Botón Pantalla Completa: Icono `Maximize2`.
       - Botón Destructivo: `[ Finalizar Consulta ]` (`bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full font-semibold`).
2. **Lado Derecho: Panel Clínico Multitarea (35% del ancho):**
   - Sistema de 2 pestañas superiores:
     - `Pestaña 1: Chat Sincrónico & Fotos` (Icono `MessageSquare`).
     - `Pestaña 2: Ficha Médica & Receta` (Icono `ClipboardList`).
3. **Pestaña de Chat Sincrónico:**
   - Lista de mensajes con burbujas diferenciadas:
     - Tutor: Burbuja blanca con borde pizarra a la izquierda.
     - Médico: Burbuja azul con texto blanco a la derecha.
   - **Envío de Fotos Macroscópicas:**
     - Botón de clip 📎 para seleccionar archivos JPEG/PNG/WebP.
     - Indicador de subida asíncrona a `POST /api/media` con validación de Magic Bytes.
     - Miniatura de la foto en el chat con click para abrir el visor modal (*Lightbox*) en pantalla completa y cierre con la tecla `Escape`.
4. **Pestaña de Ficha Médica & Receta Rápida:**
   - Editor de notas clínicas de evolución durante la llamada (anamnesis, diagnóstico presuntivo y tratamiento).
   - Botón directo para emitir la receta digital oficial sin salir de la llamada.

---

### 📄 Pantalla 6: Receta Médica Digital Oficial SENASA (`/prescriptions/:id`)
- **Archivo Fuente:** [`web/src/pages/PrescriptionView.tsx`](../../web/src/pages/PrescriptionView.tsx)
- **Rol de Usuario:** Tutor imprimiendo la receta o farmacéutico escaneando el código QR.

#### 📐 Estructura Visual y Diseño Clínico Oficial:
1. **Hoja A4 Médica (`max-w-3xl mx-auto bg-white border border-slate-300 shadow-lg p-8 sm:p-12 my-8 rounded-xl print:shadow-none print:border-none print:m-0`):**
2. **Membrete Sanitario Superior:**
   - Isotipo VetConnect y leyenda oficial: *"Sistema Oficial de Prescripción Veterinaria Digital"*.
   - Cumplimiento normativo SENASA y Ley 25.326.
3. **Datos del Profesional Emisor:**
   - Nombre completo del veterinario, Matrícula Provincial (ej. MP 8492) y Matrícula Nacional (MN).
   - Fecha y hora exacta de emisión.
4. **Datos del Paciente y Tutor:**
   - Nombre de la mascota, especie, raza, peso y microchip ISO.
   - Nombre completo del tutor, correo de contacto y teléfono registrado.
5. **Cuerpo de Prescripción (Rp/):**
   - Tipografía médica de alta legibilidad estructurada conforme al modelo canónico:
     - Fármaco (`medication`): Nombre genérico y comercial.
     - Dosis (`dosage`): Concentración y cantidad por toma.
     - Frecuencia (`frequency`): Intervalo horario de administración.
     - Duración (`durationDays`): Cantidad de días de tratamiento.
     - Indicaciones especiales (`indications`): Recomendaciones clínicas de administración.
6. **Validación Criptográfica y Código QR:**
   - Código QR de alta resolución generado dinámicamente (`qrCodeUrl`):
     - Al escanearlo con cualquier teléfono móvil, redirige a `https://app.vetconnect.com.ar/prescriptions/:id` confirmando la autenticidad e inmutabilidad de la receta.
   - Firma electrónica y sello digital del veterinario con su número de matrícula profesional habilitante.
7. **Barra de Acciones Flotante (No Imprimible `print:hidden`):**
   - Botón Primario: `[ 🖨️ Imprimir / Guardar en PDF ]` (`window.print()`).
   - Botón Secundario: `[ ← Volver ]` para retornar al dashboard.

---

### 🛡️ Pantalla 7: Tablero de Fiscalización y Auditoría SENASA (`/admin/vets`)
- **Archivo Fuente:** [`web/src/pages/AdminVets.tsx`](../../web/src/pages/AdminVets.tsx)
- **Rol de Usuario:** Administrador del sistema (`ADMIN`) y reguladores.

#### 📐 Estructura Visual y Herramientas de Auditoría:
1. **Header Administrativo:**
   - Título: *"Fiscalización de Matrículas Veterinarias & Validación SENASA"*.
   - Contador dinámico de profesionales en espera de validación: `Veterinarios Pendientes de Aprobación (N)`.
2. **Alertas y Notificaciones Contextuales:**
   - Banner de confirmación Toast (`admin-toast-notification`) para decisiones procesadas exitosamente o mensajes de error.
3. **Tabla de Verificación Profesional:**
   - Columnas: `Nombre Profesional`, `Email`, `Matrícula` (destacada en tipografía monoespaciada), `Especialidad`, `Fecha Registro`, `Acciones de Auditoría`.
   - Estado vacío (*Empty State*): *"Sin registros de veterinarios pendientes de aprobación"* cuando la cola está al día.
4. **Modales y Acciones de Decisión:**
   - **Aprobación Directa:** Habilita el estado `APPROVED` (`vetStatus: 'APPROVED'`) notificando inmediatamente al profesional para iniciar guardias activas.
   - **Modal de Rechazo Motivado:** Requiere justificación formal del rechazo (`vetStatus: 'REJECTED'`), registrando la auditoría y aplicando soft-delete si corresponde.

---

## ⚡ 3. Protocolo de Exportación a Figma vía `html.to.design`

> 📌 Ver protocolo metodológico de diseño colaborativo y exportación en [06_SISTEMA_DE_DISENO_UI_KIT.md (§7)](./06_SISTEMA_DE_DISENO_UI_KIT.md#7-metodología-híbrida-storybook--figma).

---
*Documento de Planificación de UI de Alta Fidelidad — VetConnect 2026.*
