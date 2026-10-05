# Registro de Cambios: Implementación del Sistema de Diseño "Clinical Calm" en Mobile

**Fecha:** 2026-10-04  
**Workspace:** `@vetconnect/mobile`  
**Referencia de Diseño:** Google Stitch (`projects/10196025336902191126`), Figma (*"Pet Shop App Full admin website dashboard mobile app"*).  
**Estilo:** "Clinical Calm" (Duolingo táctil 3D + Credenciales y pasaportes estilo MiArgentina + Vector Icons nativos).

---

## 1. Resumen de la Intervención

Se realizó una modernización integral de la aplicación React Native (`mobile/`), eliminando el aspecto utilitario inicial y reemplazando el 100% de los caracteres emoji por iconografía vectorial profesional (`@expo/vector-icons` / `Ionicons`). Asimismo, se preservó intacto el bridge de videoconsulta WebRTC (`react-native-webview`), respetando la regla arquitectónica de **ADR-012** y **AGENT_CODING_SPEC_MOBILE (§6)**.

---

## 2. Cambios Implementados por Fase

### Fase 1: Fundaciones, Tokens y Componentes Base
- **Tokens (`mobile/src/theme/tokens.ts`):**
  - Incorporación de la paleta *Clinical Calm*: azul médico `#0284C7`, fondo de pasaporte sanitario `#0F172A`, verde SENASA `#059669`, tintes de advertencia y radios de credencial (24px).
- **Botón Táctil 3D (`mobile/src/components/PrimaryButton.tsx`):**
  - Implementación del botón tridimensional estilo Duolingo con borde inferior engrosado, estado de pulsación, variantes semánticas e integración de íconos vectoriales.
- **Home del Tutor (`mobile/app/(app)/index.tsx`):**
  - Credencial digital de pasaporte sanitario con datos reales de la mascota.
  - Botón táctil de solicitud de urgencia.
  - Listados de mascotas y consultas con estados limpios.

### Fase 2: Erradicación de Emojis e Iconografía Vectorial
- **Instalación:** Dependencia `@expo/vector-icons` configurada e integrada en Jest con mocks en `components.test.ts`.
- **Chat (`mobile/app/(app)/chat/[consultationId].tsx`):** Íconos vectoriales para cámara de llamada (`videocam`), adjuntos (`attach`) y envío (`send`).
- **Modal de Llamada Entrante (`mobile/src/components/IncomingCallModal.tsx`):** Botones con `Ionicons` (`close` y `checkmark`).
- **Calificación por Estrellas (`mobile/src/components/Stars.tsx` y `profile.tsx`):** Estrellas vectoriales interactivas en reemplazo de caracteres unicode.
- **Notificaciones y Adjuntos (`notifications.tsx`, `AttachmentView.tsx`):** Campana e íconos de clip vectoriales.

### Fase 3: Guardia Veterinaria y Permisos de Videollamada
- **Guardia (`mobile/src/components/VetWorkspace.tsx`):** Indicador de disponibilidad en tiempo real con íconos de radio verde/pausa y botón "Tomar caso".
- **Permisos de Videollamada (`mobile/app/(app)/call/[consultationId].tsx`):** Pantalla de solicitud de cámara y micrófono con ícono y botón táctil `PrimaryButton`. Se mantuvo el bridge `WebView` inyectando credenciales por `injectedJavaScriptBeforeContentLoaded` conforme al ADR-012.

### Fase 4: Flujos de Consulta, Receta, Historial y Mascotas
- **Triage (`mobile/app/(app)/consultation/new.tsx`):** Selector de 3 niveles de urgencia (Rojo, Ámbar, Verde) con tarjetas y radios vectoriales.
- **Ficha de Mascota (`mobile/app/(app)/pets/[id].tsx`):** Pasaporte sanitario oscuro con microchip ISO y desglose clínico en filas iconográficas.
- **Historial (`mobile/app/(app)/history.tsx`):** Chips de filtro con bordes redondeados y diálogo de cancelación estilizado.
- **Detalle de Consulta (`mobile/app/(app)/consultation/[id].tsx`):** Integración de `StatusBadge`, `TriageBadge`, tarjetas de prescripción y botones de navegación rápida.
- **Receta Digital Oficial (`mobile/app/(app)/prescriptions/[id].tsx`):** Cabecera de documento oficial SENASA con código QR y acciones táctiles de compartir.
- **Calificación (`mobile/app/(app)/review/[consultationId].tsx`):** Estrellas interactivas vectoriales y feedback.
- **Nueva Mascota (`mobile/app/(app)/pets/new.tsx`):** Selector de especie interactivo con íconos de huella.

---

## 3. Estado de Verificación y Testing

- **TypeScript (`tsc --noEmit`):** 0 errores.
- **Pruebas Automatizadas Jest (`npm test -w mobile`):** 163 pruebas ejecutadas, **163 pasadas (100% verde)** en 18 suites de pruebas.
- **Integridad de Datos:** Cumplimiento total de la regla contra el "síndrome de la plantilla" (cero métricas falsas, datos 100% dinámicos o estados vacíos honestos).

---

## 4. Historial de Commits Asociados

1. `69bb5db` - `feat(mobile): apply Clinical Calm tokens, vector icons, passport home, triage and pet screens`
2. `31d4458` - `feat(mobile): replace emojis with vector icons in chat, call modal, stars, attachments and profile`
3. `edac3d6` - `feat(mobile): polish call permissions panel and vet workspace with icons and tactile buttons`
4. `56b421e` - `feat(mobile): apply Clinical Calm design to history, consultation detail, prescription, review and pet creation screens`
5. `cd1be3d` - `chore: synchronize lockfile`
