# DESIGN_SYSTEM — Dirección visual Mobile v3

> Misma identidad que la web (colores y fuentes) con un **estándar de ejecución profesional** que la web todavía no tiene.
> Fuentes canónicas de la marca: `web/tailwind.config.js`, `docs/SISTEMA_DE_DISENO.md` §2, `docs/ESTILO_Y_PALETA_DE_COLORES.md` §2.
> **F1 debe verificar cada HEX contra esas fuentes antes de congelar `src/shared/theme/tokens.ts`.**

## 1. Identidad heredada (no se cambia)

| Rol | Token | HEX | Origen |
|---|---|---|---|
| Marca primaria | `primary-900` | `#1E3A8A` | `web/tailwind.config.js` |
| Acción / CTA | `primary-600` | `#2563EB` (pressed `#1D4ED8`) | web + paleta §2 |
| Escala primaria | `primary-50/100/500/800` | `#EFF6FF` `#DBEAFE` `#3B82F6` `#1E40AF` | web |
| Marca secundaria | `secondary-600` | `#0D9488` (`500` `#14B8A6`) | web |
| Éxito / vet online | `success-600` | `#059669` | paleta §2 |
| Fondo base | `slate-50` | `#F8FAFC` | paleta §2 |
| Superficie | `white` | `#FFFFFF` | paleta §2 |
| Texto principal | `slate-900` | `#0F172A` | paleta §2 |
| Texto secundario | `slate-700` | `#334155` | paleta §2 |
| Bordes | `slate-200` | `#E2E8F0` | paleta §2 |
| Triage ROJO | `triage-red` | `#DC2626` | paleta §2 — **solo estados clínicos** |
| Triage AMARILLO | `triage-amber` | `#D97706` | paleta §2 — **solo estados clínicos** |
| Triage VERDE | `triage-green` | ⚠️ conflicto en las fuentes (`#059669` vs `#0284C7`) | **F1 decide con evidencia de `SISTEMA_DE_DISENO.md`** |

**Tipografía:** Plus Jakarta Sans (títulos) + Inter (cuerpo), cargadas con `expo-font` / `@expo-google-fonts/*`. Sin fuentes del sistema como fallback visible.

## 2. Qué significa "profesional" (lo que la web no tiene)

Esto es lo que eleva el diseño. Es obligatorio en F1 y se audita en F8:

1. **Escalas cerradas, no valores sueltos.** Espaciado en base 4 (`4, 8, 12, 16, 20, 24, 32, 40, 48`). Radios: `8` (inputs), `12` (cards), `full` (avatares y badges). Tipografía en 7 pasos: `12/16, 14/20, 16/24, 18/26, 20/28, 24/32, 30/38`, con pesos 400/500/600/700.
2. **Jerarquía por contraste, no por color.** Una sola acción primaria (azul) por pantalla. Las secundarias van en outline o ghost. Los colores de triage nunca se usan como decoración.
3. **Elevación sutil y consistente.** 3 niveles (`sm`, `md`, `lg`) definidos una vez, iguales en iOS (`shadow*`) y Android (`elevation`). Se prefieren bordes `slate-200` a las sombras pesadas.
4. **Estados completos en cada componente:** default, pressed, disabled, loading, error y focus (accesible). Feedback táctil (`expo-haptics`) en las acciones principales.
5. **Los 5 estados de pantalla** con un único componente `ScreenState`: cargando (skeletons, no spinners a pantalla completa), error con reintento, vacío con ilustración/ícono y CTA, offline, contenido.
6. **Movimiento con propósito:** transiciones de 150–250 ms con `react-native-reanimated`. Se respeta "reducir movimiento" del sistema.
7. **Iconografía única:** un solo set (Lucide, `lucide-react-native`, trazo 2px), igual que la web.
8. **Accesibilidad:** contraste ≥ 4.5:1, objetivos táctiles ≥ 44×44, `accessibilityLabel` en todo control sin texto, soporte de tamaño de fuente dinámico hasta 1.3×.
9. **Honestidad de datos (AGENTS.md §1.4):** cero métricas o ratings inventados. Rating 0 → `—` + badge "Nuevo".
10. **Densidad mobile real:** safe areas, teclado que no tapa inputs (`KeyboardAvoidingView` / `react-native-keyboard-controller`), listas virtualizadas (`FlashList` o `FlatList`).

## 3. Catálogo mínimo de F1

**Átomos:** Text (variantes tipográficas), Button (primary/secondary/outline/ghost/danger × sm/md/lg), Input, TextArea, Select, Checkbox, Switch, Badge, Avatar, Icon, Skeleton, Divider.
**Moléculas:** Card, ListItem, FormField (label + input + error), TriageBadge, StatusBadge (FSM), RatingStars, EmptyState, ErrorState, OfflineBanner, ScreenState, Header, BottomSheet.

Cada componente tiene un test de render y aparece en la pantalla `/dev/catalog`, que solo existe en dev.
