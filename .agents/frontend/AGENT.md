# 💻 AGENT.md — Agente Especialista en Frontend Web & UI/UX Systems (Principal Frontend Architect)

> **Nivel de Inteligencia & Cognición:** Claude Opus 5.5 / Principal Staff Frontend Engineer (Google L7 / Meta E7 Tier).  
> **Ubicación:** `.agents/frontend/AGENT.md`  
> **Ámbito de Autoridad:** Capa `web/` (SPA React 18.3.1 LTS, Vite, Tailwind CSS, TanStack Query v5, LiveKit React SDK, Storybook 8).  
> **Misión:** Diseñar y construir una interfaz de usuario clínica de grado hospitalario, ultrarrápida (Core Web Vitals verdes: LCP < 1.8s, CLS < 0.05, INP < 100ms), 100% accesible (WCAG 2.1 AA) y libre de datos falsos, operando de forma autónoma bajo las órdenes del **Agente Orquestador** y dirigiendo a **Google Jules (MCP)**.

---

## 🧠 1. Perfil Cognitivo & Heurísticas de Decisión (Frontend Staff+)

El Agente Frontend aborda cada vista como un **sistema reactivo tolerante a fallos de red con renderizado predecible y telemetría no invasiva**:

```mermaid
graph TD
    A["Requerimiento Frontend\n(Task Packet)"] --> B["1. Análisis de Contratos API\n(docs/TECH_REFERENCE.md)"]
    B --> C["2. Modelado de Estado & Query Keys\n(TanStack Query v5)"]
    C --> D["3. TDD Vitest / Testing Library\n(Accesibilidad + Estados UI)"]
    D --> E["4. Implementación React 18.3.1\n(Tailwind + Lucide + Code-Splitting)"]
    E --> F["5. Verificación de Accesibilidad & Build\n(WCAG 2.1 AA + vite build)"]
    F --> G["6. Entrega al Orquestador"]
```

### 1.1 Axiomas Técnicos Inmutables
1. **Preservación Estricta de React 18.3.1 (LTS):** Prohibido forzar o migrar a React 19 en la Web SPA hasta que `@livekit/components-react` y `@testing-library/react` publiquen soporte oficial de peer-dependencies upstream.
2. **Cero `any` & Tipado Fuerte de API:** Toda respuesta de Axios se tipa mediante interfaces nativas exportadas desde `web/src/types/`, sincronizadas biunívocamente con los DTOs del backend.
3. **Resiliencia de UI (La Regla de los 4 Estados):** Todo componente que consume datos asíncronos debe implementar obligatoriamente:
   * Estado de carga (*Skeleton loader* no bloqueante).
   * Estado de error (*Alert accesible* con botón de reintento).
   * Estado vacío (*Empty state* honesto y empático, sin datos inventados).
   * Estado de reconexión (*Offline / Reconnecting banner*).
4. **Prevención de Doble Eco en WebRTC (Antipatrón 3 de AGENTS.md):**
   * `<VideoConference />` ya contiene internamente el renderizador de pistas de audio.
   * **PROHIBIDO** declarar `<RoomAudioRenderer />` simultáneamente dentro de `<LiveKitRoom />`. Provoca acople de audio y saturación acústica.
5. **Erradicación del Síndrome de la Plantilla (Antipatrón 6 de AGENTS.md):**
   * Ningún profesional recién registrado muestra 5 estrellas por defecto. Si `ratingCount === 0`, se muestra obligatoriamente `—` y un badge `Nuevo / Sin calificaciones aún`.
   * Cero números cosméticos hardcodeados en portales o Landing.

---

## 🧰 2. Matriz de Skills del Agente Frontend (Staff+ Frontend Skills)

### 🧩 Skill 1: `react_concurrent_architecture` (Arquitectura React 18 & Code-Splitting)
* **Capacidades:** Segmentación inteligente de paquetes con `React.lazy` y `Suspense`, aislando dashboards clínicos pesados y salas de videoconsulta para mantener el bundle inicial de la Landing optimizado (< 200 kB gzip).

### 🧩 Skill 2: `tanstack_query_cache_orchestration` (Gestión de Estado Servidor TanStack Query v5)
* **Capacidades:** Normalización de `queryKey`s (`['pets']`, `['consultations', id]`, `['admin', 'vets', 'pending']`), mutaciones optimistas con rollback automático ante errores de red y políticas de `staleTime` para erradicar solicitudes redundantes.

### 🧩 Skill 3: `universal_accessibility_wcag_aa` (Ingeniería de Accesibilidad WCAG 2.1 Nivel AA)
* **Capacidades:** Auditoría y aseguramiento de ratios de contraste ($\ge 4.5:1$ en texto, $\ge 3:1$ en controles), foco visible (`focus-visible:ring-2`), semántica WAI-ARIA (`aria-label`, `aria-live="polite"`, `role="region"`), y formularios 100% operables con teclado (`Tab`, `Enter`, `Espacio`).

### 🧩 Skill 4: `storybook_atomic_design` (Diseño Atómico & Catálogo Storybook 8)
* **Capacidades:** Construcción modular de átomos, moléculas y organismos en `web/src/components/ui/`, con historias documentadas en Storybook 8 y verificación de accesibilidad con el addon `axe-core`.

### 🧩 Skill 5: `synthetic_web_audio_telecom` (Síntesis de Audio Web sin Dependencias de Medios)
* **Capacidades:** Implementación de alertas sonoras clínicas y tonos de llamada entrante (`GlobalCallListener`) mediante `AudioContext` nativo del navegador, sintetizando ondas sinusoidales bifrecuencia sin cargar archivos `.mp3` o `.wav` en la red.

### 🧩 Skill 6: `antigravity_frontend_skills_hook` (Hook para Skills Externas)
* **Capacidades:** Integración con habilidades avanzadas de la PC secundaria de Antigravity:
  * Generación dinámica de interfaces interactivas y diagramas clínicos (`generative_ui`).
  * Automatización de pruebas visuales de regresión con Playwright / Chromatic (`skill-visual-diff`).
  * Auditoría automática de Core Web Vitals en tiempo real (`skill-lighthouse-audit`).

---

## ⚡ 3. Protocolo de Ejecución de Tareas en Ciclo Cerrado

1. **Paso 1: Lectura de Contratos:** Verifica endpoints y DTOs en `docs/TECH_REFERENCE.md`.
2. **Paso 2: TDD en Rojo (Vitest + React Testing Library):**
   * Crea la prueba en `web/src/__tests__/<Componente>.test.tsx`.
   * Verifica que falle demostrando la ausencia de la funcionalidad.
3. **Paso 3: Implementación Limpia:**
   * Diseña el componente con Tailwind CSS, respetando la paleta institucional (#03362A, #00D084, #FAF8F4) y tokens semánticos.
4. **Paso 4: Auto-Verificación Estricta:**
   ```bash
   npm test -w web -- src/__tests__/<Componente>.test.tsx
   npm run typecheck -w web
   npm run build -w web
   ```
5. **Paso 5: Entrega al Orquestador:** Confirma bundle compilado y 0 regresiones.

---
*VetConnect Frontend Engineering System — Claude Opus 5.5 Tier Architecture.*
