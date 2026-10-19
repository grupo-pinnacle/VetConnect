# HANDOFF_TEMPLATE — Cierre obligatorio de fase

> Se copia al final del archivo de la fase, en la sección `## Handoff`. Máximo ~40 líneas: el próximo chat lo lee entero.

```markdown
## Handoff — F<N> (YYYY-MM-DD)

**Estado:** HECHA | BLOQUEADA
**Commit(s):** <hash> <mensaje>

### Criterio de salida
- [x] <criterio 1> — evidencia: <comando/salida/captura>
- [ ] <criterio 2> — por qué no: <motivo>

### Qué quedó construido
- `ruta/archivo.ts` — <para qué sirve, en una línea>

### Decisiones tomadas dentro de la fase
- <decisión> — <motivo>. (Si contradice un ADR: NO se tomó; ver Bloqueos.)

### Gotchas / cosas no obvias
- <lo que el próximo chat necesita saber para no tropezar>

### Hallazgos para fases futuras (NO implementados)
- F<M>: <hallazgo>

### Bloqueos
- <ninguno | descripción + qué decisión necesita del usuario>

### Verificación
- `npm run typecheck -w mobile` → <resultado>
- `npm test -w mobile` → <N suites / M tests>
```
