# 🔌 Guía de Integración Mobile -> Google Jules vía MCP

> **Propósito:** Pautas para formular pedidos de desarrollo móvil a **Google Jules**.

---

## 📦 Estructura del Task Packet Mobile para Jules

1. **Definición de Ruta en Expo Router:**
   - Ubicación en `mobile/app/(app)/` o `mobile/app/(auth)/`.
   - Utilizar componentes de NativeWind v4 (`className="p-4 bg-white"`) o tokens de `src/theme/tokens.ts`.
2. **Requisitos de UI y Accesibilidad:**
   - Superficies táctiles con altura mínima de 44pt (`min-h-[44px]`).
   - Identificadores de testing `testID` en todos los elementos interactivos clave para Jest Expo.
3. **Casos de Prueba (Jest Expo):**
   - Ubicación: `mobile/src/__tests__/<nombre>.test.ts`.
   - Mockear `expo-secure-store` y `react-native-webview` utilizando los utilitarios existentes.
4. **Comando de Auto-Verificación:**
   ```bash
   npm test -w mobile -- -t "<nombre>"
   npm run typecheck -w mobile
   ```
