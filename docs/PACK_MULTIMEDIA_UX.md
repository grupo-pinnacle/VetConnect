# 🎨 VetConnect — Dossier Canónico de Diseño, UX/UI y Contenido Multimedia

> **Destinatarios:** Equipo de Diseño Multimedia, UX/UI, Creadores de Contenido y Especialistas en IA Generativa.  
> **Propósito:** Servir como contexto maestro y fuente única de verdad para la creación de piezas gráficas, interfaces en Figma, diseño de assets y prompts para modelos de IA generativa (Midjourney, Claude, ChatGPT, Figma AI).  
> **Versión:** 2.0 (Alineada con la implementación Gold Master de la Web)  
> **Fecha:** Octubre 2026

---

## 🧭 1. Resumen Ejecutivo y Personalidad de Marca

### 1.1 ¿Qué es VetConnect?
VetConnect es la plataforma líder de telemedicina veterinaria y gestión clínica integral en Argentina. Conecta a tutores de mascotas con profesionales veterinarios matriculados en tiempo real mediante videollamadas de alta definición, triaje clínico guiado, chat sincrónico y recetas digitales oficiales homologadas con código QR para validación farmacéutica según normativas de SENASA y la Ley 25.326.

### 1.2 Filosofía Visual: Clean Clinical Modernism
* **Sensación Principal:** El usuario llega habitualmente en un momento de vulnerabilidad, estrés o preocupación por la salud de su animal. La interfaz **DEBE transmitir calma, confianza médica, higiene visual y calidez empática**.
* **Anti-patrones visuales:** Evitar estéticas sobrecargadas, colores estridentes tipo neón, animaciones bruscas o elementos "glossy" con excesivo desenfoque (*blur*). Se priorizan superficies limpias, legibilidad instantánea y componentes con propósito funcional.

---

## 🎨 2. Paleta Cromática Canónica (Regla 60-30-10)

La paleta cromática está calibrada para cumplir estrictamente con los estándares de contraste y accesibilidad **WCAG 2.1 Nivel AA y AAA**:

| Proporción | Rol de Diseño | Token / Código HEX | Uso en Interfaz y Contenido |
|---|---|---|---|
| **60% Fondo / Base** | Fondo cálido institucional | `#FAF8F5` (`bg-cream`) | Fondo general del portal de tutores y veterinarios. Transmite cercanía orgánica. |
| | Superficie de Tarjetas | `#FFFFFF` (`bg-white`) | Tarjetas de mascotas, modales, hojas clínicas y contenedores de contenido. |
| | Separadores y Bordes | `#E2E8F0` (`border-slate-200`) | Líneas divisorias tenues y bordes de input. |
| **30% Identidad y Salud** | Esmeralda Principal | `#059669` (`emerald-600`) | Botones de acción primaria, badges de veterinario online, confirmaciones y recetas. |
| | Esmeralda Claro / Hover | `#10B981` (`emerald-500`) | Estados hover, iconos de bienestar y elementos de acento en landing page. |
| | Esmeralda Tenue (Fondo) | `#ECFDF5` (`emerald-50`) | Fondos de alertas de éxito, badges de estado y selecciones activas. |
| **10% Contraste y Texto** | Texto Principal | `#0F172A` (`text-slate-900`) | Títulos, tipografía primaria y datos clínicos. Contraste 14.2:1 (WCAG AAA). |
| | Texto Secundario | `#64748B` (`text-slate-500`) | Subtítulos, etiquetas de formulario, metadatos y fechas. |
| | Acento de Urgencia (Triage) | `#DC2626` (`red-600`) | Exclusivo para emergencias vitales, banderas rojas clínicas y botones de colgar llamada. |
| | Acento de Alerta | `#F59E0B` (`amber-500`) | Consultas prioritarias intermedias y avisos de conectividad. |

---

## ✍️ 3. Tipografía y Estándares de Componentes

### 3.1 Familias Tipográficas
* **Primaria (UI y Lectura):** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.
* **Alternativa para Títulos:** `Plus Jakarta Sans` (empleada en la Landing Page institucional para transmitir modernidad y cercanía).
* **Escala Tipográfica:**
  - Títulos H1 (Hero / Portadas): `32px` a `40px` (Font-weight: `700` Bold / `800` ExtraBold).
  - Títulos H2 (Secciones): `24px` a `28px` (Font-weight: `600` SemiBold).
  - Títulos H3 (Tarjetas): `18px` a `20px` (Font-weight: `600` SemiBold).
  - Texto de Cuerpo (Body): `14px` a `16px` (Font-weight: `400` Regular / `500` Medium).
  - Metadatos y Badges: `12px` (Font-weight: `500` Medium).

### 3.2 Reglas de Forma y Espaciado
* **Bordes redondeados:** `rounded-xl` (12px) para tarjetas y modales; `rounded-lg` (8px) para botones y controles; `rounded-full` para avatares, badges e indicadores de presencia.
* **Elevación y Sombras:** Sutiles por capas (`shadow-sm` y `shadow-md`). Prohibido usar sombras negras opacas o saturadas.
* **Cero Placeholders Engañosos:** Nunca simular métricas fijas como "4.95 ⭐" en profesionales recién registrados. Si un profesional no tiene valoraciones, mostrar badge `Nuevo` con estrellas vacías.

---

## 👥 4. Arquetipos de Usuario (User Personas)

### Persona A: El Tutor de Mascota
* **Nombre:** Lucía Méndez (32 años, CABA).
* **Contexto:** Su gato Simón (4 años) presenta vómitos repentinos a las 23:30 hs. Lucía está preocupada y necesita saber con urgencia si requiere traslado a guardia física 24hs o si puede estabilizarse en casa.
* **Necesidad UX:** Navegación guiada, sin tecnicismos médicos que la abrumen, acceso instantáneo al botón de triage, visualización clara del tiempo de espera y llamada en video fluida.

### Persona B: El Profesional Veterinario
* **Nombre:** Dr. Alejandro Romero (44 años, Matrícula SENASA / MP 4892).
* **Contexto:** Atiende teleconsultas desde su clínica o consultorio privado entre turnos presenciales.
* **Necesidad UX:** Consola rápida, agenda sincronizada, visualización inmediata de antecedentes de la mascota durante la videollamada, chat ágil estilo WhatsApp para recibir fotos de lesiones y emisión de recetas oficiales con QR en menos de 2 minutos.

### Persona C: El Auditor SENASA / Administrador
* **Contexto:** Fiscaliza la legalidad de las atenciones y la validez de las matrículas provinciales.
* **Necesidad UX:** Tablas de búsqueda rápida con debounce, trazabilidad inmutable (`AuditLog`), aprobación/rechazo de matrículas con justificación y visualizador público de recetas digitales.

---

## 🗺️ 5. Arquitectura de Pantallas de la Web Real Actual

1. **Landing Page (`/`):**
   - Encabezado con logo institucional, selector de acceso y badge de guardia 24hs activa.
   - Hero Section con propuesta de valor empática, llamado a la acción principal ("Iniciar Consulta de Guardia") y mockup de la aplicación.
   - Grid de beneficios clínicos, testimonios transparentes y footer con enlaces de cumplimiento legal.
2. **Centro de Autenticación (`/login`, `/register`):**
   - Selector de perfil: Tutor o Veterinario.
   - Para veterinarios: campo mandatorio de matrícula profesional y bio clínica.
3. **Portal del Tutor (`/client`):**
   - Fondo crema unificado (`#FAF8F5`).
   - Carrusel/grilla de mascotas del tutor con especie, raza, peso y microchip ISO.
   - Formulario de Triage Guiado (`ClinicalIntakeForm`): selección por signos observables (decaimiento, vómitos, tos, heridas), tiempo de evolución y subida de fotos.
4. **Portal del Veterinario (`/vet`):**
   - Agenda semanal/diaria interactiva.
   - Fila de consultas en espera ordenadas por prioridad de triage inferida (`ROJO`, `AMARILLO`, `VERDE`).
   - Padrón de pacientes con acceso al historial clínico y recetas previas.
5. **Sala de Videoconsulta e Interacción (`/call/:id`):**
   - Modal previo de verificación de cámara y micrófono (*Pre-join*).
   - Videollamada WebRTC sólida en alta definición mediante LiveKit SFU.
   - Panel lateral de chat interactivo con diseño tipo **WhatsApp Web** (burbujas de conversación, doble tilde de entrega, envío de fotos clínicas y notas médicas).
6. **Receta Médica Digital Oficial (`/prescriptions/:id` / `/verify-rx`):**
   - Formato institucional A4 homologado para impresión o guardado en PDF.
   - Datos del profesional, matrícula, diagnóstico, fármacos prescriptos (Rp/), posología y código QR de validación pública para farmacias.

---

## 🤖 6. Prompt Maestro de Contexto para Modelos de IA Generativa

Copia y pega el siguiente bloque como instrucción de sistema o contexto inicial cada vez que interactúes con una IA para diseñar pantallas, banners, ilustraciones o copies para VetConnect:

```text
Actúa como Diseñador de Producto Senior y Director de Arte especializado en HealthTech y Telemedicina Veterinaria para la plataforma "VetConnect".

Debes seguir rigurosamente los siguientes lineamientos de marca y diseño:
1. IDENTIDAD Y TONO: Tono clínico, cálido, empático y profesional. Prioriza la calma y la claridad para reducir la ansiedad de tutores con animales enfermos.
2. PALETA CROMÁTICA (Regla 60-30-10):
   - 60% Fondo: Crema cálido (#FAF8F5) y Blanco puro (#FFFFFF) para tarjetas limpias.
   - 30% Estructura y Salud: Verde Esmeralda (#059669 y #10B981).
   - 10% Contraste y Acentos: Texto Slate Oscuro (#0F172A) y acento de alerta Roja (#DC2626) únicamente para emergencias vitales.
3. TIPOGRAFÍA Y FORMA: Tipografías limpias y altamente legibles (Inter / Plus Jakarta Sans). Bordes amigables de 12px (rounded-xl) y sombras suaves por capas (shadow-sm).
4. CONTENIDO HONESTO: Cero métricas ficticias o inventadas. Si un profesional es nuevo, se indica "Nuevo / Sin calificaciones aún". El triaje para tutores se basa en signos observables cotidianos, no en tecnicismos de laboratorio.
5. ARQUITECTURA DE PRODUCTO: El ecosistema incluye Landing Page comercial, Portal de Tutores con fichas de mascotas, Portal Veterinario con agenda y sala de teleconsulta híbrida (WebRTC + Chat tipo WhatsApp) con recetas oficiales con QR.

Aplica estos principios en cada respuesta, diseño de wireframe, código CSS/Tailwind o texto publicitario que generes.
```
