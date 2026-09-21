# Protocolo de Implementación de Nuevas Funcionalidades (v3)
## El Método del Quirófano de Código para Features (AI-First)

Este protocolo adapta el flujo estructurado de debugging en **5 Fases con Cerco de Seguridad y Blindaje Anti-Regresiones** para el desarrollo de **Nuevas Funcionalidades (Features)**. Su objetivo es garantizar que cualquier nuevo requerimiento se incorpore de manera limpia, predecible y sin alterar la estabilidad del proyecto existente ni romper código en producción [23, 101, 3, 26, 38].

---

## El Flujo del Protocolo en 5 Fases

```
  [ Fase 1: Especificación y Capas ] ──> [ Fase 2: El Cerco (Plan Mode) ] ──> [ Fase 3: Blindaje Anti-Regresiones ]
                                                                                         │
  [ Fase 5: Bucle de Validación ]    <── [ Fase 4: Quirófano de Feature ] <──────────────┘
```

---

### FASE 1: Especificación del Escenario y Mapeo de Capas
Antes de permitir que la IA proponga o escriba código, debemos definir formalmente el requerimiento y aislar su impacto en la arquitectura [15].

1. **Definir el Escenario de la Feature (Gherkin/BDD):**
   * **Nombre y sección:** `FEATURE-[ID]: [Título descriptivo]`, `seccion: [Módulo/Capa afectada]`.
   * **Pasos para reproducir / Criterios de Aceptación:**
     * **Given (Dado que):** Estado inicial del sistema y prerrequisitos del usuario.
     * **When (Cuando):** Acción exacta que desencadena la nueva funcionalidad.
     * **Then (Entonces):** Resultado esperado, datos retornados, cambios en la UI o eventos emitidos.

   #### Ejemplo de Aplicación Práctica (Empresarial / Juegos / General):
   * **Nombre y sección:** `FEATURE-02: Notificación y Registro de Recetas Médicas en PDF`, `seccion: Consultas / Media`.
   * **Descripción:** Al finalizar una consulta, el sistema debe generar una receta firmada en PDF, notificar al cliente y permitir su descarga desde el historial.
   * **Escenario Gherkin/BDD:**
     * **Given:** El veterinario ha completado los campos de diagnóstico en una consulta con estado `ACTIVE`.
     * **When:** El veterinario presiona el botón "Finalizar y Emitir Receta".
     * **Then:** El sistema genera el archivo PDF, actualiza la consulta a estado `COMPLETED`, emite una notificación al cliente y el PDF queda disponible para descarga bajo "Mis Recetas".
   * **Causas / Capas Involucradas:** Capa UI (Botón y Modal), Capa de Hooks/Estado, Capa de Red/API (Endpoint POST), Capa de Servicio (Generador PDF) y Base de Datos (Persistencia y `AuditLog`).

2. **Aislar en Capas de Arquitectura:**
   Mapeá explícitamente en cuáles de estas capas habitará la nueva lógica [14]:
   * **Capa UI/Vista:** ¿Qué nuevos componentes visuales, botones o modales se deben crear?
   * **Capa de Hooks/Estado:** ¿Qué nuevo estado global o caché de consultas (ej. React Query / Zustand) se requiere?
   * **Capa de Red/Request:** ¿Qué nuevo endpoint REST o evento Socket/WebSocket se debe definir? [12]
   * **Capa Backend/API:** ¿Qué nuevos controladores, DTOs de entrada/salida y servicios procesarán la lógica? [12]
   * **Capa de Base de Datos:** ¿Se requieren nuevas tablas, migraciones de esquema o relaciones entre entidades? [12]

3. **Mapeo de Dependencias Directas e Indirectas:**
   Pídele a la IA con acceso global al proyecto que analice la arquitectura y liste los archivos involucrados:
   * **Directos:** Archivos nuevos a crear o componentes existentes donde se incrustará la feature.
   * **Indirectos:** Tipos compartidos (TypeScript), esquemas de validación (Zod/Prisma), middlewares de autenticación o contratos de eventos intermodulares [28, 71].

---

### FASE 2: Diseño del "Cerco de Seguridad" (Plan Mode)
El "cerco" delimita de forma metodológica y conceptual la frontera exacta de la nueva funcionalidad. Evita que la IA modifique partes del sistema no relacionadas [53, 54].

#### Acción Práctica: Invocación de "Plan Mode" [110, 111]
Antes de escribir código, exige a la IA un documento de planificación estructurado con el siguiente prompt:

> 📝 **Prompt para crear el "Cerco de Seguridad" de la Feature:**
> ```text
> Actuá como un Staff Systems Architect e Ingeniero de Software Senior. Vamos a implementar una NUEVA FUNCIONALIDAD.
> No escribas ni modifiques ningún archivo de código todavía.
> Analizá el proyecto y definí el "Cerco de Seguridad" para la feature [Nombre y Descripción de la Feature].
>
> Proporcioname un plan estructurado que incluya:
> 1. ARCHIVOS A CREAR: Lista exacta de archivos nuevos (componentes, servicios, DTOs, tests).
> 2. ARCHIVOS A MODIFICAR: Lista estricta de archivos existentes que deben extenderse.
> 3. ARCHIVOS FUERA DEL ALCANCE: Archivos relacionados que bajo ninguna circunstancia se deben alterar.
> 4. EVALUACIÓN DE RIESGOS: ¿Qué servicios o módulos existentes se conectarán a esta feature?
> 5. PLAN DE IMPLEMENTACIÓN EN PASOS ATÓMICOS: Secuencia paso a paso para desarrollar la feature sin romper nada.
>
> Esperá mi aprobación explícita del plan antes de continuar.
> ```

---

### FASE 3: Análisis de Impacto Global (El Blindaje Anti-Regresiones)
Antes de escribir el primer archivo, la IA debe demostrar que la incorporación de la nueva característica no romperá ni alterará los módulos existentes [38].

1. **Rastreo de Referencias Cruzadas (Find-All-References):**
   * El agente debe identificar mediante búsquedas (como `rg` o `grep`) qué componentes o servicios existentes consumirán la nueva función.
2. **Preservación de Contratos y Retrocompatibilidad:**
   * **Regla estricta:** La nueva feature debe extender el sistema de manera aditiva (agregando nuevos endpoints, nuevos tipos o parámetros opcionales) sin alterar las firmas de funciones previas ni romper a los consumidores existentes.
3. **Mapeo de Efectos Secundarios en Cascada:**
   * La IA debe responder explícitamente: *¿Cómo afectará este nuevo estado o tabla a los flujos de trabajo actuales y a la base de datos?*

---

### FASE 4: El Quirófano (Minimal Feature Implementation en Rama Aislada)
Una vez aprobado el plan y el análisis de impacto, se abre el "quirófano". El desarrollo se realiza estrictamente dentro del cerco delimitado.

#### Reglas de Oro del Quirófano de Código:
1. **Trabajar en Rama Dedicada (Git como Red de Seguridad):**
   * Nunca trabajes directamente sobre `main` [29, 79]. Crea la rama `feature/[nombre-feature]` [92].
2. **Aplicar el "Minimal Feature Implementation":**
   * Construye únicamente lo especificado en los Criterios de Aceptación [19].
   * **Prohibición absoluta:** No permitas que la IA aproveche para refactorizar módulos viejos, cambiar configuraciones globales o agregar librerías externas no aprobadas [101, 102].
3. **Bucle de Autocorrección y Explicación (Agent Loop):**
   * Si una interfaz compila mal, el agente debe usar **Reflection & Self-Correction** [32] para corregir la firma y explicarte qué ajustó [6].

---

### FASE 5: El Bucle de Validación (Testing Global, Typechecking y Verificación)
La feature no se da por terminada porque "se vea bien" en pantalla. La validación requiere pruebas empíricas de extremo a extremo [85, 38].

1. **Testing de Tres Capas (Unitario, Integración y Regresión):**
   * **Tests Unitarios de la Feature:** Pruebas para la lógica de negocio nueva (casos felices, errores y bordes) [74].
   * **Tests de Integración de Frontera:** Verificar que la nueva feature se comunica correctamente con los módulos vecinos.
   * **Suite de Regresión Global:** Ejecutar la suite completa de pruebas para confirmar un 100% de éxito en todo el proyecto [26].
2. **Verificación Estricta del Compilador (Typechecking):**
   * Ejecutar `tsc --noEmit` (o el verificador correspondiente) para asegurar 0 errores de tipos en todo el repositorio [48].
3. **Revisión Humana del Diff (No al "Accept All"):**
   * Inspeccionar cada línea agregada en `git diff` antes del commit [88, 79].
4. **Git Commit y PR Descriptiva:**
   * Generar el Pull Request detallando los criterios de aceptación cumplidos y los tests que respaldan la nueva funcionalidad [6].

---

## Matriz de Control de Calidad de la Nueva Feature

- [ ] **Escenario BDD Definido:** Criterios de aceptación (Given/When/Then) claros antes de programar.
- [ ] **Cerco de Seguridad Aprobado:** Se respetaron los límites de archivos a crear y modificar.
- [ ] **Blindaje Anti-Regresiones:** Ningún contrato previo fue roto; las adiciones son retrocompatibles.
- [ ] **Tests de Regresión Globales:** La suite de pruebas de todo el proyecto pasó con 0 fallos.
- [ ] **Validación de Tipos (Typechecking):** Compilación limpia sin errores de tipos globales.
- [ ] **Revisión de Diff:** Un humano revisó y aprobó cada línea del PR.
