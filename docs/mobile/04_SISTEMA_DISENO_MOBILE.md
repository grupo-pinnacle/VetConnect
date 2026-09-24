# 📱 04_SISTEMA_DISENO_MOBILE — Tokens → Migración NativeWind v4

## Tokens canónicos (heredados de `SISTEMA_DE_DISENO.md`, 60-30-10)

* Primary `#0284C7` (mobile real) ≈ `#2563eb/#3b82f6` web; fondo `#F8FAFC`, texto `#0F172A/#334155`, muted `#64748B/#94A3B8`, borde `#E2E8F0/#CBD5E1`. Burbuja propia `#0284C7` texto `#FFF`, ajena `#E2E8F0` texto `#0F172A` (`chat/[id].tsx:131-134`).
* Radio 8, cards `padding 16, borderWidth 1`, header 16 bold. Tipografía sistema (Inter en web, nativa en mobile).

## Estado real → objetivo

* Hoy: `StyleSheet.create` por pantalla con hex duplicados (`index.tsx:96-113`, `chat:122-139`, `call:138-162`). Válido hasta upgrade, pero prohibido añadir nuevos hex fuera de `src/theme/tokens.ts` (TODO).
* Tras upgrade SDK 54: NativeWind v4 + `tailwind.config.js` (`content: app/**, src/**`), `babel-preset-expo + nativewind/babel`, `metro withNativeWind`, `global.css`. Migrar `style=` → `className` por pantalla, manteniendo `testID` y snapshot visual. No mezclar v2 + v4.
