# 🎨 Reglas de Diseño, UI y Accesibilidad Frontend

> **Ubicación:** `.agents/frontend/REGLAS_UI_DISENO.md`  
> **Cumplimiento:** Obligatorio para cualquier desarrollo en `web/`.

---

## 🚫 1. Antipatrones Explícitos de Frontend

1. **❌ Prohibido duplicar `RoomAudioRenderer`:**
   - `<VideoConference />` de LiveKit ya incluye el renderer de audio internamente. Agregar `<RoomAudioRenderer />` causa eco acústico y acople destructivo.
2. **❌ Prohibido hardcodear números cosméticos ("Síndrome de la Plantilla"):**
   - NUNCA escribir `4.95 ⭐` o `18 en guardia` fijos en el JSX.
   - Usar `useMemo` o datos reales de la API.
3. **❌ Prohibido almacenar tokens sensibles en `localStorage`:**
   - El refresh token debe viajar siempre en cookie `HttpOnly`.
4. **❌ Prohibido romper el build por migración no probada a React 19:**
   - La Web SPA permanece en **React 18.3.1 LTS**. No intentar actualizar a React 19 sin aprobación formal del Orquestador.

---

## 📐 2. Paleta de Colores Canónica 60-30-10

* **60% Superficie / Fondo:** `#FFFFFF` y `#F8FAFC` (Slate 50).
* **30% Estructura & Tipografía:** `#0F172A` (Slate 900) para textos primarios y bordes `#E2E8F0` (Slate 200).
* **10% Acento Clínico:** `#059669` (Esmeralda Salud) para badges de estado y éxito; `#0284C7` (Azul Médico) para llamadas a la acción primarias (CTAs) e interactividad.
