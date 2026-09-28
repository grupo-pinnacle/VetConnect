# ⚖️ Matriz de Riesgos Legales, Derechos de Autor y Protección Comercial

> **Documento:** `.agents/compliance/MATRIZ_RIESGOS_LEGALES.md`  
> **Propósito:** Identificar y mitigar proactivamente los riesgos de litigios, demandas civiles, infracciones marcarias o denuncias de usuarios y colegios profesionales.

---

## 🏛️ 1. Datos Societarios e Identificación Legal del Negocio

Para cumplir con la legislación mercantil, fiscal y de defensa del consumidor de la República Argentina, el sitio web y la app móvil deben exhibir los siguientes datos legales en el pie de página y en las políticas:

* **Razón Social:** Pinnacle Group S.A.
* **Nombre de Fantasía:** VetConnect Telemedicina Veterinaria
* **CUIT:** 30-71234567-8
* **Domicilio Legal:** Av. Santa Fe 1234, Piso 4, Ciudad Autónoma de Buenos Aires (C1059ABN), Argentina.
* **Correo Electrónico de Contacto Legal & Notificaciones:** `legal@vetconnect.com.ar`
* **Centro de Atención al Usuario / Soporte:** `soporte@vetconnect.com.ar`
* **Jurisdicción:** Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero.

---

## 🚫 2. Prohibición de Reseñas Falsas y Métricas No Respaldadas

### 2.1 Erradicación Total de Fake Reviews (ADR-023 / ADR-025)
* **Riesgo:** Demandas por publicidad engañosa (Ley 24.240) y sanciones de defensa de la competencia si se exhiben testimonios inventados de clientes ficticios.
* **Mitigación Mandataria:**
  * Toda reseña o calificación visible en pantalla debe corresponder con una fila real de la tabla `reviews` en PostgreSQL (`schema.prisma`), vinculada a un `consultationId` con estado `COMPLETED` emitido por un cliente autenticado.
  * Si un profesional veterinario tiene 0 consultas valoradas (`ratingCount === 0`), se prohíbe inventar estrellas. Debe mostrarse `—` con el badge `Nuevo / Sin calificaciones aún`.

### 2.2 Prohibición de Afirmaciones Médicas No Respaldadas
* **Riesgo:** Denuncias por intrusismo médico o promesa de cura ante Colegios Veterinarios.
* **Mitigación Mandataria:**
  * Queda prohibido afirmar que la plataforma "cura" o "reemplaza a los hospitales de urgencias".
  * Las referencias a resoluciones de SENASA deben acotarse a la habilitación y validación de matrículas profesionales de los médicos veterinarios actuantes.

---

## 📸 3. Propiedad Intelectual y Derechos de Autor de Imágenes

* **Riesgo:** Demandas por infracción de copyright de agencias fotográficas (Getty Images, Shutterstock, etc.) por uso de imágenes sin licencia.
* **Política de Activos Visuales:**
  1. **Iconografía & Gráficos:** Utilizar exclusivamente iconos vectoriales de código abierto con licencia MIT/Apache 2.0 (`lucide-react`) y SVGs vectoriales desarrollados internamente.
  2. **Fotografías de Portada / Mascotas:** Utilizar únicamente imágenes de stock libres de derechos con licencia comercial verificable (Unsplash License o Pexels License) o producciones fotográficas propias de Pinnacle Group.
  3. **Fotos Subidas por Usuarios (Avatares y Adjuntos):** Los Términos y Condiciones establecen que el usuario declara ser titular de los derechos de las fotos de sus mascotas que adjunte a la plataforma.

---

## 🔍 4. Matriz de Riesgos y Acciones Preventivas

| Riesgo Identificado | Gravedad | Ley Aplicable | Medida de Mitigación Implementada |
|---|---|---|---|
| Demanda por mala praxis o muerte del animal | 🔴 Crítica | Código Civil y Comercial / Ley 14.072 | Descargo médico de emergencia; la plataforma actúa como intermediario tecnológico; el veterinario asume la responsabilidad con su matrícula profesional validada. |
| Multa por infracción de datos personales | 🔴 Crítica | Ley 25.326 (Protección de Datos) | Política de Privacidad publicada; derechos ARCO garantizados; soft-deletes con anonimización; cero PII en tokens de streaming. |
| Demanda por publicidad engañosa | 🟠 Alta | Ley 24.240 (Defensa del Consumidor) | Cero reseñas falsas; datos reales de DB; botón de cancelación y arrepentimiento. |
| Infracción de derechos de autor de fotos | 🟠 Alta | Ley 11.723 de Propiedad Intelectual | Auditoría de licencias comerciales; uso de SVGs vectoriales y Lucide icons. |
| Sanción por falta de consentimiento de cookies | 🟡 Media | Resoluciones AAIP / ePrivacy | Banner de consentimiento de cookies con opción de rechazo de analíticas no esenciales. |
