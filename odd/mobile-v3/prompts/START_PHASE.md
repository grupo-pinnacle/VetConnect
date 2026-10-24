# Prompt de inicio de fase

Copiá el bloque, reemplazá `F<N>` (ej. `F0`, `F3a`) y pegalo como primer mensaje de un chat nuevo.

```text
Vamos a ejecutar la fase F<N> de la reconstrucción de VetConnect Mobile v3.

Protocolo (obligatorio, en este orden):
1. Leé odd/mobile-v3/README.md, odd/mobile-v3/STATUS.md y odd/mobile-v3/CONTEXT.md.
2. Leé odd/mobile-v3/phases/F<N>-*.md completo, incluido el Handoff de la fase anterior.
3. Leé SOLO los archivos de la sección "Lecturas" de la fase. No explores el repo de forma amplia.
4. Verificá la Definition of Ready de la fase. Si algo falta, detenete y decímelo.
5. Ejecutá las tareas en orden, con TDD donde aplique. No implementes nada fuera del alcance:
   anotalo en "Hallazgos para fases futuras".
6. Si encontrás evidencia que contradice un ADR de CONTEXT.md, detenete y reportalo. No lo cambies por tu cuenta.
7. Al terminar: corré la verificación, completá el Handoff con odd/mobile-v3/HANDOFF_TEMPLATE.md,
   actualizá STATUS.md y hacé un commit convencional en la rama feat/mobile-v3.
```
