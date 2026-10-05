# 📝 ANOTACIONES TÉCNICAS Y BITÁCORA DE DESARROLLO (VetConnect)

Este documento registra decisiones de flujo de trabajo, problemas encontrados durante el desarrollo, diagnósticos de causa raíz y sus soluciones definitivas para el equipo y futuros agentes.

---

## 📱 1. Previsualización Móvil en PC sin Compilación de APKs

* **Fecha:** Octubre 2026
* **Módulo afectado:** `mobile/` (React Native + Expo SDK 54 + Expo Router)
* **Contexto:** El desarrollador requería probar y previsualizar la interfaz de la aplicación móvil en tiempo real mientras programa, sin la fricción de tener que generar un APK (`eas build --local`) e instalarlo manualmente en el celular en cada iteración.

### 🎯 Decisión de Flujo
Se optó por habilitar la **previsualización en PC dentro del IDE/Navegador** mediante el adaptador web de Expo (`react-native-web` + `@expo/metro-runtime`), permitiendo abrir la app en un panel lateral dividido con marco de dispositivo móvil (*Device Simulator / Simple Browser*).

---

### ❌ Problema Encontrado
Al ejecutar la instalación recomendada por Expo en PowerShell:
```powershell
cd mobile
npx expo install react-native-web @expo/metro-runtime
```

El proceso abortó con el siguiente error:
```text
env: load .env
env: export EXPO_PUBLIC_API_URL EXPO_PUBLIC_WS_URL
Unable to fetch compatibility data from React Native Directory. Skipping check.
TypeError: fetch failed
TypeError: fetch failed
    at async getVersionedNativeModulesAsync (...)
    at async getCombinedKnownVersionsAsync (...)
    at async getVersionedPackagesAsync (...)
    at async installPackagesAsync (...)
```

---

### 🔍 Diagnóstico de Causa Raíz
1. **Entorno de ejecución:** Windows 11 + Node.js **v24.x**.
2. **Falla TLS/SSL:** En Node.js v24, el motor nativo de `fetch` (`undici`) utiliza por defecto un almacén empaquetado de certificados de Mozilla en lugar de consultar los certificados raíz de confianza del sistema operativo Windows.
3. Al consultar los metadatos de compatibilidad de paquetes en `https://api.expo.dev`, la negociación TLS falló internamente con:
   ```text
   code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' (unable to verify the first certificate)
   ```
   provocando que el `fetch` nativo abortara con `TypeError: fetch failed`.

---

### ✅ Solución Aplicada

1. **Uso de Certificados del Sistema Operativo:**
   Se indicó a Node.js que utilice el almacén de certificados nativo de Windows mediante la variable de entorno `NODE_OPTIONS`:
   ```powershell
   $env:NODE_OPTIONS = "--use-system-ca"
   ```
   *(Esto resolvió inmediatamente el handshake SSL con la API de Expo retornando HTTP 200 OK).*

2. **Instalación de Dependencias Compatibles (Expo SDK 54):**
   Se instalaron las versiones exactas verificadas en el workspace `mobile`:
   ```powershell
   npm install react-native-web@0.21.3 @expo/metro-runtime@6.1.2 -w mobile
   ```

3. **Verificación de Tipos:**
   Se ejecutó `npm run typecheck -w mobile` (`tsc --noEmit`), confirmando 0 errores de tipado.

4. **Blindaje Definitivo en Scripts (`package.json` y `run.bat`):**
   Para evitar que cualquier desarrollador tenga que configurar manualmente variables en su terminal, se configuraron los scripts `"web"` y `"start"` en `mobile/package.json` llamando directamente a `node --use-system-ca ../node_modules/expo/bin/cli`, y se incluyó `set NODE_OPTIONS=--use-system-ca` en `run.bat`. Así, `npm run web -w mobile` funciona de forma 100% autónoma en cualquier consola.

---

### 🚀 Cómo Previsualizar la App con Marco de Celular (Guía Rápida)

#### Método A: En el IDE (VS Code / Antigravity IDE) al lado del código
1. En la terminal de la raíz o de `mobile`, iniciá el servidor web:
   ```powershell
   npm run web -w mobile
   ```
   *(Quedará corriendo en `http://localhost:8081`)*.
2. En tu editor (VS Code o Antigravity IDE):
   * Presioná `Ctrl + Shift + P`.
   * Escribí **`Simple Browser: Show`** y pegá: `http://localhost:8081`.
   * Arrastrá la pestaña hacia el lateral derecho (`Split Right`) para tener el código a la izquierda y la pantalla del celular a la derecha.
3. **Para marco estético de celular:**
   * Podés instalar la extensión de VS Code llamada **Device Simulator** o **Responsive Viewer**, o abrir `http://localhost:8081` en Google Chrome / Edge y presionar `F12` activando el modo "Toggle device toolbar" (emulando un Pixel 8 o iPhone 15 con marco).

#### Método B: En tu Celular Físico (Expo Go - 100% Nativo sin APKs)
Si necesitás probar cámara o gestos nativos reales:
1. Instalá la app **Expo Go** desde Google Play Store en tu celular.
2. En tu PC ejecutá:
   ```powershell
   npm run dev:mobile
   ```
3. Escaneá el código QR desde la app Expo Go.
4. Cada vez que guardes cambios en el código (`Ctrl + S`), la pantalla de tu celular se actualizará en 200 ms gracias a *Fast Refresh*.
