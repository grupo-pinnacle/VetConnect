# VetConnect Mobile v3 — Espacio de trabajo por fases

> **Punto de entrada único** para reconstruir la app mobile desde cero, una fase por chat.
> Cada chat lee **solo** lo que necesita su fase. Así el contexto se mantiene chico y el modelo no colapsa.

## Cómo funciona

```
odd/mobile-v3/
├── README.md            ← este archivo (protocolo)
├── STATUS.md            ← tablero: qué fase está activa, qué está hecho (ÚNICA fuente de progreso)
├── CONTEXT.md           ← decisiones congeladas (ADRs M-01..M-06) y reglas que reemplazan a las anteriores
├── DESIGN_SYSTEM.md     ← dirección visual, tokens y estándar "profesional"
├── HANDOFF_TEMPLATE.md  ← formato obligatorio de cierre de cada fase
├── prompts/
│   └── START_PHASE.md   ← prompt para copiar y pegar al abrir un chat nuevo
└── phases/
    ├── F0-spikes.md … F8-hardening.md   ← un paquete de tareas autocontenido por fase
```

## Protocolo por chat (siempre igual)

1. **Abrir un chat nuevo** y pegar el prompt de `prompts/START_PHASE.md`, reemplazando `F<N>`.
2. El agente lee, **en este orden y nada más**: `STATUS.md` → `CONTEXT.md` → `phases/F<N>-*.md` → el `Handoff` de la fase anterior → los archivos listados en "Lecturas" de la fase.
3. El agente trabaja **solo** dentro del alcance de la fase. Lo que descubre fuera de alcance va a "Hallazgos para fases futuras" del handoff, **no se implementa**.
4. Al terminar: corre los comandos de verificación, completa el `Handoff` en su archivo de fase (con el formato de `HANDOFF_TEMPLATE.md`), actualiza `STATUS.md` y hace un commit convencional.
5. **Un chat = una fase.** Si una fase es muy grande, se parte en sub-chats (`F3a`, `F3b`), y cada uno deja su propio handoff.

## Reglas de oro

- **No se abre la fase N+1 si la fase N no cumplió su criterio de salida.** Sin excepciones.
- **Las decisiones de `CONTEXT.md` no se rediscuten dentro de una fase.** Si un chat encuentra evidencia que invalida un ADR, se detiene y lo reporta. El ADR se cambia en un chat dedicado y recién después se continúa.
- **La verdad es el código del backend** (`backend/prisma/schema.prisma`, `backend/src/modules/**`). Ningún endpoint, campo o evento se inventa a partir de documentación narrativa.
- **Rama de trabajo:** `feat/mobile-v3`. Commits convencionales, sin atribución a IA.
