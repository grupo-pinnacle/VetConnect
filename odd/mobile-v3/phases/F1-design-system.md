# F1 — Design system

> **Objetivo:** tokens + catálogo atómico profesional. Ninguna pantalla de producto todavía.

## Definition of Ready
- [ ] F0 en estado `HECHA` en `STATUS.md`.

## Lecturas
- `odd/mobile-v3/DESIGN_SYSTEM.md` (completo)
- `web/tailwind.config.js`
- `docs/SISTEMA_DE_DISENO.md` §2 (paleta, tipografía, iconografía); solo esa sección
- `docs/ESTILO_Y_PALETA_DE_COLORES.md` §2

## Tareas
1. **Resolver el conflicto del color de triage VERDE** con evidencia (`SISTEMA_DE_DISENO.md`) y anotar la decisión en el Handoff.
2. NativeWind v4 + `tailwind.config.js` de mobile, generado **desde** `src/shared/theme/tokens.ts` (una sola fuente; el config de Tailwind importa los tokens).
3. Fuentes: `@expo-google-fonts/plus-jakarta-sans` + `@expo-google-fonts/inter`, con splash hasta que carguen.
4. Íconos: `lucide-react-native` (requiere `react-native-svg`). Wrapper `Icon` con tamaños tokenizados.
5. Átomos y moléculas del catálogo de `DESIGN_SYSTEM.md §3`, en `src/shared/ui/`. TDD: primero el test de render y de props y estados (disabled, loading, error), después el componente.
6. `ScreenState` con los 5 estados: cargando (skeleton), error + reintentar, vacío + CTA, offline, contenido.
7. Pantalla `app/dev/catalog.tsx`, visible solo si `__DEV__`, que muestre cada componente en todas sus variantes.
8. Accesibilidad: `accessibilityRole`/`accessibilityLabel`, objetivos táctiles de 44px, `allowFontScaling` con tope 1.3×.

## Fuera de alcance
Llamadas a la API, navegación de producto.

## Criterio de salida
- [ ] Catálogo navegable en el dev build (adjuntar captura o descripción en el Handoff).
- [ ] Cada componente con test de render; typecheck y tests en verde.
- [ ] Cero HEX o tamaños sueltos fuera de `tokens.ts` (`git grep -n "#[0-9A-Fa-f]\{6\}" mobile/src mobile/app` solo devuelve `tokens.ts`).

## Handoff
_Pendiente._
