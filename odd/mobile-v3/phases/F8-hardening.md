# F8 — Hardening, documentación y release

> **Objetivo:** dejar la app lista para distribuir y la documentación alineada con lo construido.

## Definition of Ready
- [ ] F7 `HECHA`.

## Lecturas
- `AGENTS.md` §1.4 (DoD de producción)
- `odd/mobile-v3/DESIGN_SYSTEM.md` §2 (checklist de diseño profesional)
- `docs/mobile/02_QA_DISTRIBUCION_Y_SEGURIDAD.md`
- Handoffs F0–F7: solo las secciones "Hallazgos para fases futuras" y "Bloqueos"

## Tareas
1. **Auditoría de diseño:** recorrer cada pantalla contra `DESIGN_SYSTEM.md §2` (tokens, jerarquía, estados, a11y). Corregir los desvíos.
2. **Auditoría DoD (AGENTS.md §1.4):** cero placeholders, métricas falsas o ramas de mock.
3. **Accesibilidad:** TalkBack en los flujos críticos (login, nueva consulta, chat, llamada).
4. **Performance:** listas virtualizadas, imágenes con `expo-image`, sin re-renders evitables en el chat.
5. **Hallazgos pendientes** de F0–F7: resolverlos o moverlos a un backlog explícito.
6. **Release:** build `preview` (APK) con EAS, instalarlo en un dispositivo limpio y hacer un smoke test completo.
7. **Documentación:** reescribir `docs/mobile/README.md`, `01_TECH_REFERENCE_MOBILE.md`, `AGENT_CODING_SPEC_MOBILE.md`, `03_ESTADO_Y_DEUDA_MOBILE.md` y `.agents/mobile/AGENT.md` según la v3. Archivar `odd/tasks/mobile-completion.md`.
8. **Borrar `mobile-legacy/`.**

## Criterio de salida
- [ ] APK preview instalado y smoke test completo como tutor y como vet.
- [ ] `npm run typecheck && npm test` en verde en todo el monorepo.
- [ ] Documentación mobile sin referencias a WebView ni a "sin TanStack Query".
- [ ] PR de `feat/mobile-v3` → `main` listo para revisión.

## Handoff
_Pendiente._
