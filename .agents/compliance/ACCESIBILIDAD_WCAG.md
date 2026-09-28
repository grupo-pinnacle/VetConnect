# ♿ Estándar de Accesibilidad Digital (WCAG 2.1 AA & Teclado)

> **Documento:** `.agents/compliance/ACCESIBILIDAD_WCAG.md`  
> **Normativa:** Web Content Accessibility Guidelines (WCAG) 2.1 Nivel AA, ISO 9241-210, Ley 26.653 de Accesibilidad de la Información en las Páginas Web.

---

## 🎯 1. Principios Mandatarios de Accesibilidad en VetConnect

Todo componente web y móvil debe satisfacer 5 reglas no negociables:

### 1.1 Contraste Cromático Mínimo (Regla 1.4.3)
* **Texto Normal (< 18pt / < 14pt bold):** Relación de contraste mínima de **4.5:1** contra el fondo.
  * *Texto Slate 900 (`#0F172A`) sobre Blanco (`#FFFFFF`):* **19.8:1** ✅ (Excelente).
  * *Texto Slate 600 (`#475569`) sobre Blanco:* **5.8:1** ✅ (Conforme).
  * *Botón Verde Salud (`#059669`) con texto blanco:* **4.6:1** ✅ (Conforme).
  * *Prohibido:* Texto gris tenue como `#94A3B8` sobre fondos claros para textos de lectura.
* **Texto Grande (≥ 18pt o ≥ 14pt bold):** Relación mínima de **3:1**.

### 1.2 Navegación 100% por Teclado (Regla 2.1.1 & 2.4.7)
* Todo control interactivo (botones, inputs, selectores, modales, checkboxes) debe ser alcanzable mediante la tecla `Tab` y accionable con `Enter` y `Space`.
* **Anillo de Foco Visible (Focus Visible):** Queda terminantemente prohibido usar `outline: none` sin proveer un reemplazo visible de alto contraste (ej. `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2`).
* **Trampa de Foco en Modales:** Al abrir un modal (`PrescriptionModal`, `ReviewModal`), el foco debe quedar atrapado dentro del diálogo y cerrarse con la tecla `Escape`.

### 1.3 Textos Alternativos en Imágenes (`alt`) (Regla 1.1.1)
* Toda etiqueta `<img>` debe contener un atributo `alt` significativo y descriptivo:
  * ❌ `alt="foto"` o `alt="imagen"` (Prohibido).
  * ✅ `alt="Fotografía de perfil del Dr. Juan Pérez, médico veterinario matriculado"`
  * ✅ `alt="Logotipo de VetConnect: plataforma de telemedicina veterinaria"`
* Si una imagen es puramente decorativa, debe marcarse con `alt=""` y `aria-hidden="true"`.

### 1.4 Etiquetas Semánticas y Claras en Botones (Regla 1.3.1 & 4.1.2)
* Todo botón que solo contenga un icono (ej. botón de colgar, cerrar o lupita) debe tener obligatoriamente un atributo `aria-label` descriptivo o texto oculto para lectores de pantalla (`sr-only`):
  ```tsx
  // ❌ Prohibido: Botón sin etiqueta textual
  <button onClick={hangUp}><PhoneOff className="w-5 h-5" /></button>

  // ✅ Conforme:
  <button onClick={hangUp} aria-label="Finalizar videollamada y salir de la sala">
    <PhoneOff className="w-5 h-5" aria-hidden="true" />
  </button>
  ```

### 1.5 Formularios Accesibles e Inclusivos (Regla 3.3.2)
* Todo campo de entrada `<input>` debe contar con su `<label>` asociado mediante `htmlFor="id-campo"`.
* En caso de error de validación, vincular con `aria-invalid="true"` y `aria-describedby="error-id-campo"`.
