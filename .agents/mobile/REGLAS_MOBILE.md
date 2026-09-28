# 🛡️ Reglas de Ingeniería & Guardarraíles de Mobile

> **Ubicación:** `.agents/mobile/REGLAS_MOBILE.md`  
> **Cumplimiento:** Obligatorio para cualquier desarrollo en `mobile/`.

---

## 🚫 1. Prohibiciones Explícitas en Mobile

1. **❌ Prohibido instalar LiveKit SDK nativo en v2.0:**
   - La teleconsulta se realiza exclusivamente mediante el **Puente WebView (`react-native-webview`)**. No instalar `@livekit/react-native` pues rompe Expo Go y managed workflow.
2. **❌ Prohibido omitir el header de plataforma:**
   - Toda petición de red debe incluir `X-Client-Platform: mobile`. De lo contrario, el backend no transmitirá el `refreshToken` en el cuerpo JSON.
3. **❌ Prohibido usar `AsyncStorage` para tokens criptográficos:**
   - El refresh token debe persistirse obligatoriamente en `expo-secure-store` bajo la clave `vetconnect_refresh_token`. El access token vive solo en memoria RAM (`authStore`).
4. **❌ Prohibido forzar React 18 en Mobile:**
   - Mobile requiere **React 19.1.0** para operar bajo Expo SDK 54 y React Native 0.81.4. No intentar unificar la versión de React con la Web SPA.
5. **❌ Prohibido hardcodear IPs locales en código:**
   - En desarrollo corporativo por cable USB, utilizar `adb reverse tcp:3001 tcp:3001` (automatizado en `start.ps1`) y variables de entorno `EXPO_PUBLIC_API_URL=http://localhost:3001`.

---

## 🧭 2. Convención de Rutas y Nomenclatura

* **Chat:** `mobile/app/(app)/chat/[consultationId].tsx`
* **Videollamada:** `mobile/app/(app)/call/[consultationId].tsx`
* **Consulta Detalle:** `mobile/app/(app)/consultation/[id].tsx`
* **Mascota Detalle:** `mobile/app/(app)/pets/[id].tsx`
* **Receta QR:** `mobile/app/(app)/prescriptions/[id].tsx`
* **Calificación Post-Consulta:** `mobile/app/(app)/review/[consultationId].tsx`
