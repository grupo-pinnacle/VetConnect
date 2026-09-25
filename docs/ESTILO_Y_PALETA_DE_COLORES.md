# 🎨 Estilo y Paleta de Colores — Landing Page VetConnect

> **Proyecto:** VetConnect — Plataforma Integral de Telemedicina Veterinaria & Gestión Clínica
> **Alcance:** Identidad visual, paleta cromática 60-30-10 y arquitectura de secciones de la Landing Page pública (`/`).
> **Estado:** `ALINEADO (NIVEL 4 — COMPLEMENTO NARRATIVO)`
> **Jerarquía de Verdad (ADR-025):** Este documento es **Nivel 4 (Wireframes y Diseño Narrativo)**. Ante cualquier contradicción prevalecen:
> 1. Nivel 1 — `backend/prisma/schema.prisma` y controladores en `backend/src/modules/`
> 2. Nivel 2 — `docs/TECH_REFERENCE.md` y `docs/web/AGENT_CODING_SPEC.md`
> 3. Nivel 3 — `docs/ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/DECISIONS.md`
> **SSOT cromática:** La definición canónica de tokens HEX, tipografía y componentes reside en `docs/SISTEMA_DE_DISENO.md` (§2.2–§2.6) y su implementación web en `docs/web/06_SISTEMA_DE_DISENO_UI_KIT.md`. Este archivo no crea tokens nuevos ni endpoints nuevos.
> **Documentos relacionados:** `docs/SISTEMA_DE_DISENO.md`, `docs/FRONTEND_ARCHITECTURE.md` (§10), `docs/web/AGENT_CODING_SPEC.md` (§0–§1), `docs/TECH_REFERENCE.md` (§2.10 — `Landing.tsx`).

---

## 📑 Índice

1. [Identidad de marca y filosofía visual](#1-identidad-de-marca-y-filosofía-visual)
2. [Regla de color 60-30-10](#2-regla-de-color-60---30---10)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura de componentes de la Landing Page](#4-arquitectura-de-componentes-de-la-landing-page)
5. [Prompt de implementación para agente IA](#5-prompt-de-implementación-para-agente-ia)
6. [Referencias cruzadas y gobernanza](#6-referencias-cruzadas-y-gobernanza)

---

## 1. Identidad de marca y filosofía visual

### 1.1 Filosofía visual

* **Inspiración UX/UI:** Estructura moderna, minimalista y fluida con animaciones de desplazamiento suave (*scroll* interactivo), adaptada de referencias de software de alta gama pero ajustada al sector salud.
* **Prioridad emocional:** El sitio debe transmitir **calma, confianza, limpieza clínica y máxima claridad**, reduciendo la ansiedad del usuario ante una situación de urgencia con su mascota.
* **Alineación canónica:** Corresponde al estilo **Clean Clinical Modernism** definido en `docs/SISTEMA_DE_DISENO.md` (§2.2): superficies despejadas, bordes amigables (`rounded-xl` / 12px, `rounded-full` en avatares/badges), sombras suaves por capas (`shadow-sm`, `shadow-md`) y personalidad de marca Clínica / Empática / Ágil / Confiable / Accesible.

---

## 2. Regla de color 60 - 30 - 10

Se preserva íntegramente la distribución original propuesta para la Landing. La columna de correspondencia solo mapea cada valor a su token canónico vigente, sin alterar ningún HEX original.

| Proporción original | Rol original | Código HEX original (preservado) | Correspondencia canónica vigente |
|---|---|---|---|
| **60% Fondo / Base** | `Background` secciones principales | `#FFFFFF` | `bg-white` — Superficie Tarjeta en `docs/SISTEMA_DE_DISENO.md` (§2.3) |
| | `Background` para separar bloques | `#F8FAFC` | `bg-slate-50` — Fondo Base en `docs/SISTEMA_DE_DISENO.md` (§2.3) |
| | `Texto Principal` máxima legibilidad | `#0F172A` | `text-slate-900` — Texto Mayor, contraste 14.2:1 (WCAG AAA) |
| **30% Estructura / Soporte (Verde Salud)** | `Verde Principal` marca, tarjetas de valor, iconos de bienestar y naturaleza | `#10B981` | Familia Esmeralda. Equivalente funcional canónico: `#059669` (`bg-emerald-600`, Éxito / Triage VERDE / vet online) |
| | `Verde Oscuro de Contraste` textos secundarios o acentos de profundidad | `#065F46` | Tono profundo de la misma familia Esmeralda. Uso canónico: texto sobre fondos claros de triage VERDE (`#ECFDF5` / `#A7F3D0`) |
| **10% Llamada a la Acción / Foco (Azul Confianza)** | `Azul Acción` exclusivamente para botones de conversión clave, ej. *Buscar especialista*, *Emergencia 24/7* | `#2563EB` | `bg-blue-600` — Acción / CTA canónico (`docs/SISTEMA_DE_DISENO.md` §2.3, `docs/web/06_SISTEMA_DE_DISENO_UI_KIT.md` §2). `Hover`: `#1D4ED8` |

> **Nota de alineación cromática:** En el sistema canónico el 30% se formaliza como Tipografía & Estructura (`#0F172A` / `#334155` / `#E2E8F0`) y el 10% como Acentos (`#2563EB` / `#059669`, más `#0D9488` como acción secundaria de marca en `Button.tsx`). Los verdes `#10B981` / `#065F46` de este documento se conservan como intención original de “Verde Salud” y se implementan con los tokens Esmeralda/Teal vigentes. Los colores funcionales de triage (`#DC2626` Rojo, `#D97706` Ámbar, `#0284C7` Sky) solo se usan para estados clínicos, nunca como CTA de la Landing.

---

## 3. Stack tecnológico

### 3.1 Propuesta original preservada

* **Framework:** Next.js (App Router) o Astro (para máxima velocidad de carga SEO).
* **Estilos:** Tailwind CSS (permite aplicar la regla de colores de forma estricta mediante clases de utilidad).
* **Interactividad y animaciones:**
  * **Framer Motion:** Para transiciones fluidas de elementos al hacer *scroll* (aparición gradual, escalado de imágenes de la app).
  * **Lenis:** Para lograr un efecto de desplazamiento suave (*smooth scroll*) con inercia elegante.

### 3.2 Adaptación canónica vigente (sin alterar la propuesta original)

> La propuesta del §3.1 se conserva como borrador inicial. La implementación real debe usar el stack congelado del proyecto. Prevalece `docs/web/AGENT_CODING_SPEC.md` (§0) y `docs/FRONTEND_ARCHITECTURE.md`.

| Capa | Stack canónico obligatorio | Notas |
|---|---|---|
| Librería UI | React **18.3.1 LTS** | NO migrar a React 19 (conflicto peer-deps con `@livekit/components-react`) |
| Build | Vite 6 | La Landing (`web/src/pages/Landing.tsx`, ruta `/`) es chunk inicial liviano con code-splitting (`React.lazy` + `Suspense`) |
| Estilos | Tailwind CSS **v3** | Tokens clínicos en `web/tailwind.config.js` (paleta 60-30-10). NO usar Tailwind v4 aún |
| Iconografía | Lucide React (`2px`, esquinas redondeadas) | Ver `docs/SISTEMA_DE_DISENO.md` (§2.5) |
| Tipografía | Inter (cuerpo) + Plus Jakarta Sans (headings) | Ver `docs/SISTEMA_DE_DISENO.md` (§2.4) |
| Animación de scroll | Transiciones CSS / utilidades Tailwind | Framer Motion y Lenis quedan como referencia original; solo incorporarlas si no rompen presupuesto CWV (LCP < 2.5s) ni los 29 tests web en verde (`npm test -w web`) |

**Guardarraíles para esta página:** ruta pública `/` sin autenticación (`docs/TECH_REFERENCE.md` §2.10); HTML semántico + `data-testid` estables; contraste mínimo 4.5:1 (WCAG 2.1 AA); prohibidos `shadcn`, `@radix-ui/*`, `<RoomAudioRenderer />` junto a `<VideoConference />` y PII en tokens LiveKit (no aplican a la Landing estática, se citan para coherencia con `AGENT_CODING_SPEC.md` §0).

---

## 4. Arquitectura de componentes de la Landing Page

La página se divide en secciones verticales orientadas a la conversión y a la empatía con el usuario. Implementación canónica: `web/src/pages/Landing.tsx` (ruta `/`, acceso Público).

### A. Navbar (Navegación Superior)

* **Diseño:** Fondo blanco translúcido con efecto *glassmorphism* (`backdrop-blur-md`).
* **Elementos:**
  * Logotipo (con acento en verde/azul).
  * Enlaces de navegación (*Cómo funciona*, *Especialistas*, *Para veterinarios*).
  * Botón CTA primario en Azul (`#2563EB`): *“Descargar App”* o *“Urgencia Inmediata”*.

### B. Sección Hero (Impacto Inicial)

* **Diseño:** Dos columnas (Texto a la izquierda, Mockup de la app con animación de scroll a la derecha).
* **Copywriting orientador:** Enfocado en la conexión inmediata con especialistas para mascotas comunes y exóticas.
* **Botones de Acción:** Doble botón (CTA principal en azul para dueños de mascotas, secundario estilo borde sutil para veterinarios).

### C. Sección de Propuesta de Valor (Cómo conectamos al especialista)

* **Diseño:** Cuadrícula (*Grid*) de 3 tarjetas con fondo blanco sobre base gris clara (`#F8FAFC`), bordes sutiles y esquinas redondeadas.
* **Contenido de las tarjetas:**
  1. *Especialistas sin fronteras:* Conexión directa con médicos veterinarios calificados de toda la ciudad.
  2. *Especial para mascotas exóticas:* Algoritmo de emparejamiento para especies menos populares que no encuentran atención en clínicas locales comunes.
  3. *Atención Prioritaria:* Canales directos para casos de primera necesidad.

### D. Sección Interactiva “Paso a Paso” (Efecto Scroll)

* **Diseño:** Contenedor oscuro o de alto contraste controlado, donde al hacer scroll hacia abajo, la interfaz de la app muestra de manera secuencial:
  * Paso 1: Seleccionas el perfil de tu mascota (perro, gato, exótica).
  * Paso 2: El sistema filtra el especialista idóneo disponible geográficamente.
  * Paso 3: Videollamada o derivación presencial inmediata en menos de 5 minutos.
* **Nota de alineación de flujo:** El flujo clínico vigente está en `docs/SISTEMA_DE_DISENO.md` (§1.2): selección de mascota → `POST /api/consultations` (triage `[Prioridad: ROJO|AMARILLO|VERDE]`) → cola `WAITING` → asignación `PATCH /api/consultations/:id/assign` → sala `/call/:id` (LiveKit 720p + chat Socket.io) → receta con QR → reseña 1–5 estrellas (ADR-023/ADR-024).

### E. Footer (Pie de Página)

* **Diseño:** Fondo limpio en gris muy oscuro (`#0F172A`) para dar un cierre formal y seguro.
* **Elementos:** Enlaces legales, avisos médicos de descargo de responsabilidad (*Disclaimer*: no reemplaza una cirugía de emergencia extrema presencial inmediata), y redes sociales.
* **Nota de cumplimiento:** Tratamiento de datos personales conforme Ley N.º 25.326; sin listados globales de pacientes; PII mínima en UI pública.

---

## 5. Prompt de implementación para agente IA

Se preserva verbatim el prompt original. La variante canónica solo sustituye el framework para hacerlo ejecutable en el monorepo actual.

> *“Actúa como un desarrollador Frontend Senior experto en UI/UX. Crea la estructura base de una landing page en Next.js utilizando Tailwind CSS con la siguiente paleta de colores: 60% blanco (#FFFFFF / #F8FAFC), 30% verde esmeralda (#10B981) para elementos estructurales y de naturaleza, y 10% azul médico (#2563EB) exclusivamente para los botones de llamada a la acción (CTA). Implementa Framer Motion para asegurar que los bloques de contenido aparezcan suavemente conforme el usuario hace scroll hacia abajo. Diseña un componente Hero orientado a una aplicación móvil de salud veterinaria de urgencia y especialidades para mascotas, priorizando la claridad visual, la empatía y la reducción de la ansiedad del usuario.”*
>
> **Variante canónica ejecutable (misma paleta e intención, stack vigente):** *“…en React 18.3.1 LTS + Vite 6 con Tailwind CSS v3 en `web/src/pages/Landing.tsx` (ruta `/`), manteniendo 60% `#FFFFFF`/`#F8FAFC`, intención verde salud `#10B981`/`#065F46` implementada con tokens `#059669`/`#0D9488`, y `#2563EB` solo para CTA. Respetar `docs/web/AGENT_CODING_SPEC.md` (§0–§1), tokens de `docs/SISTEMA_DE_DISENO.md` (§2.3–§2.4) y 4 estados UI (`loading`/`error`/`empty`/`success`) donde aplique.”*

---

## 6. Referencias cruzadas y gobernanza

* **SSOT visual:** `docs/SISTEMA_DE_DISENO.md` (§2 Identidad, estilo Clean Clinical Modernism, paleta 60-30-10, tipografía, Lucide, componentes `Button`/`PetCard`/`DoctorCard`/badges de triage).
* **Implementación web:** `docs/web/06_SISTEMA_DE_DISENO_UI_KIT.md` (tokens Tailwind, Storybook `npm run storybook -w web`), `docs/FRONTEND_ARCHITECTURE.md` (§2 topología SPA, §5 rutas, §9 CWV, §10 a11y), `docs/web/AGENT_CODING_SPEC.md` (§0 stack no negociable, §1 ruta `/`).
* **Contratos:** `docs/TECH_REFERENCE.md` (§2.10 `Landing.tsx` — assets estáticos, N/A sockets). La Landing no consume API ni emite eventos realtime; no inventar endpoints ni campos (ADR-025).
* **Decisiones vinculadas:** ADR-008 (sin `packages/shared` — tipos como interfaces nativas), ADR-012 (LiveKit 720p, cero PII), ADR-015 (TanStack Query v5 congelado en páginas vivas), ADR-022 (deploy web en Vercel), ADR-023/ADR-024 (reseñas y FSM de consultas, como contexto del “Paso a Paso”), ADR-025 (precedencia canónica).
* **Verificación sugerida:**
  ```bash
  npm test -w web
  npm run typecheck
  npm run build -w web
  ```

---
*Complemento narrativo de Landing — Grupo Pinnacle 2026. No altera tokens, rutas ni contratos canónicos.*
