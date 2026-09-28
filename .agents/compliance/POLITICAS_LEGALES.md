# 📜 Textos Maestros de Políticas Legales & Consentimiento Informado

> **Documento:** `.agents/compliance/POLITICAS_LEGALES.md`  
> **Ámbito de Aplicación:** Web SPA, Mobile App, Documentación y Contratos de Servicio de VetConnect.  
> **Marco Jurídico:** República Argentina (Ley 25.326 de Protección de Datos Personales, Ley 24.240 de Defensa del Consumidor, Ley 14.072 de Ejercicio Veterinario, Resoluciones SENASA y estándares internacionales GDPR/ePrivacy).

---

## 🍪 1. Análisis Técnico y Regulatorio de Cookies: ¿Se requiere consentimiento?

### Diagnóstico Técnico:
VetConnect utiliza dos categorías de cookies en su cliente Web:
1. **Cookies Estrictamente Necesarias / Técnicas:**
   * Cookie `refreshToken`: Transmitida en canal seguro `HttpOnly; Secure; SameSite=None` (producción) o `SameSite=Lax` (desarrollo local) por el backend Express en `/api/auth`.
   * **Dictamen Legal:** **NO requieren consentimiento previo (opt-in)** conforme a la directiva ePrivacy y las resoluciones de la AAIP, dado que son imprescindibles para la autenticación y la seguridad de la sesión. Sin embargo, **deben ser obligatoriamente divulgadas e informadas** en la Política de Cookies.
2. **Cookies y Almacenamiento de Analíticas / Telemetría:**
   * Sentry Error Tracking (`@sentry/react`): Envío de reportes de fallos en producción.
   * **Dictamen Legal:** **SÍ requieren consentimiento explícito** si se activan herramientas de telemetría de comportamiento, métricas o marketing. VetConnect debe implementar un **Banner de Consentimiento de Cookies (Cookie Consent Banner)** con opción de "Aceptar Todo", "Rechazar no esenciales" o "Configurar", bloqueando la carga de analíticas hasta que el usuario exprese su voluntad afirmativa.

---

## 🔒 2. Resumen Canónico de Términos y Condiciones de Uso

* **Identificación del Prestador:** VetConnect es una plataforma operada por **Pinnacle Group S.A.** (CUIT: 30-71234567-8), con domicilio legal en Av. Santa Fe 1234, Ciudad Autónoma de Buenos Aires, Argentina. Correo de contacto legal: `legal@vetconnect.com.ar`.
* **Naturaleza del Servicio:** VetConnect es una herramienta tecnológica de comunicación que facilita el contacto sincrónico (audio, video, chat) entre tutores de animales y profesionales médicos veterinarios matriculados e independientes.
* **Descargo Sanitario Obligatorio (Emergency Disclaimer):**  
  > ⚠️ **ATENCIÓN TUTOR:** La teleorientación veterinaria es un servicio de triaje primario, orientación preventiva y seguimiento post-quirúrgico. **NO constituye un servicio de urgencias médicas para pacientes con riesgo inminente de vida.** Si su mascota presenta convulsiones, hemorragias profusas, dificultad respiratoria severa, inconsciencia o traumatismos graves, debe acudir de inmediato al hospital o clínica veterinaria con guardia física más cercana.
* **Responsabilidad Profesional:** Las prescripciones médicas digitales son emitidas bajo la matrícula habilitante exclusiva y responsabilidad civil del profesional veterinario actuante, validado en la Sala de Espera Profesional de VetConnect.
* **Derecho de Arrepentimiento (Ley 24.240, Art. 34):** El tutor tiene derecho a revocar la solicitud de consulta y obtener el reintegro total en cualquier momento previo al inicio efectivo de la atención médica por parte del profesional.

---

## 🛡️ 3. Resumen Canónico de Política de Privacidad (Ley 25.326)

* **Responsable del Tratamiento:** Pinnacle Group S.A.
* **Minimización de Datos Recolectados:**
  * Datos del Tutor: Nombre, apellido, correo electrónico, teléfono (únicamente visible para el veterinario durante una consulta activa).
  * Datos del Paciente: Nombre de la mascota, especie, raza, peso aproximado, chip identificatorio ISO (opcional), historial de consultas y recetas.
  * Datos del Veterinario: Matrícula habilitante, bio profesional, fotografía y registro de aprobación.
* **Cero PII en Video y Logs:** Los flujos WebRTC de LiveKit operan exclusivamente con identificadores opacos (`user.id`) y nombre de pila.
* **Plazo de Conservación y Deber Sanitario:** En cumplimiento de la normativa veterinaria y judicial, los registros de historia clínica y recetas se preservan de forma inmutable. La solicitud de "Derecho al Olvido" ejecuta la anonimización de los datos de contacto personales (`deletedAt = now()`), desvinculando la identidad del tutor del historial clínico que debe conservarse por razones de salud pública.
* **Canal ARCO:** Cualquier usuario puede ejercer sus derechos de acceso, rectificación, actualización o supresión escribiendo a `privacidad@vetconnect.com.ar`.

---

## 💰 4. Política de Reembolsos y Cancelaciones (SLA de Triage)

1. **Cancelación Voluntaria del Tutor:** Si el tutor cancela una consulta que se encuentra en estado `WAITING` antes de ser atendida, el cobro se cancela instantáneamente sin retención alguna.
2. **Timeout de Triage (15 Minutos sin Veterinario):** Conforme a **ADR-024**, si transcurren 15 minutos sin que ningún veterinario tome el caso, el sistema cancela automáticamente la solicitud con código `TIMEOUT_NO_VET_AVAILABLE` y ejecuta el reembolso automático del 100% del importe.
3. **Cortes de Conexión y Ventana de Gracia (3 Minutos):** Si el veterinario experimenta una desconexión técnica durante una consulta activa y no reconecta dentro de la ventana de 3 minutos, la consulta transiciona a cancelada por fallo de servicio con reintegro íntegro al tutor o reencolado prioritario sin costo.

---

## 📝 5. Consentimiento Informado en Formularios

* En el formulario de **Registro (`Register.tsx`)**, es requisito legal una casilla de verificación obligatoria no pre-marcada:
  ```html
  [X] He leído y acepto los Términos y Condiciones, la Política de Privacidad y el Consentimiento de Teleorientación Veterinaria.
  ```
* En la solicitud de **Nueva Consulta (`consultation/new`)**:
  ```html
  [X] Comprendo que este servicio es de teleorientación y que ante una emergencia médica crítica debo acudir a un centro presencial de urgencias.
  ```
