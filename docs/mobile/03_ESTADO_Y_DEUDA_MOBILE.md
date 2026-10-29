# 📱 03_ESTADO_Y_DEUDA_MOBILE — Diagnóstico y Hoja de Ruta del Wrapper (Nivel 3)

> **Rol del Documento:**  
> Ofrece la radiografía verificada de la aplicación móvil de VetConnect bajo el modelo de **WebView Shell**, documenta los problemas de integración resueltos y enumera la deuda técnica remanente del contenedor.

---

## 1. Estado Verificado del Workspace Mobile

| Componente | Versión / Estado | Verificación Técnica |
|---|---|---|
| **Expo SDK** | `~54.0.0` | Compatible con Android 15 e iOS 18 (CNG) |
| **Motor Web Embebido** | `react-native-webview ^13.15.0` | Configurado con flags de hardware y almacenamiento (`HARDENED_WEBVIEW_CONFIG`) |
| **Sincronización de Auth** | `buildAuthSeedScript` | Inyección en `injectedJavaScriptBeforeContentLoaded` |
| **Pruebas de Bridge** | `npm test -w mobile` | Suites verdes para bridge, permisos y detección de loopback |
| **Typecheck** | `npm run typecheck -w mobile` | Cero errores de TypeScript, tipado estricto |

---

## 2. Deuda Histórica Resuelta (Bugs de Integración WebView Corregidos)

Durante la estabilización del wrapper móvil sobre la web, se cerraron los principales puntos de fricción del navegador embebido:

| ID | Incidencia Original | Causa Raíz | Solución Verificada |
|---|---|---|---|
| **BUG-01** | Crash o recarga del WebView al tomar foto de mascota | En Android, abrir la app de cámara del sistema suspende el WebView; al volver por baja memoria, la actividad se reiniciaba perdiendo el formulario | Implementación de persistencia automática del borrador en `localStorage` (`vetconnect_new_pet_draft`), rehidratando los campos al recargar |
| **BUG-02** | Pérdida de datos en el registro al cambiar de aplicación | Reciclado del proceso del navegador al consultar contraseñas o apps de correo | Persistencia reactiva del borrador (`vetconnect_register_draft`) con limpieza automática post-registro exitoso |
| **BUG-06** | Suspensión de pantalla y pérdida de video en consulta | Los navegadores móviles apagan la pantalla por inactividad táctil durante llamadas | Integración de Screen WakeLock bidireccional (`ConsultationRoom` emite `wakelock:request` y el contenedor activa `expo-keep-awake`) |
| **D-03** | Llamada rota por inyección tardía de credenciales | Se intentaba llamar a una función global post-carga (`window.initLiveKitCall`) que no existía en la web | La web utiliza su componente estándar LiveKit Room leyendo credenciales de `localStorage` sembradas previamente vía `buildAuthSeedScript` |

---

## 3. Deuda Técnica Remanente del Contenedor (Backlog)

### 3.1 Prioridad Alta (Operatividad)
- **D-W01: Limpieza de Pantallas Nativas Huérfanas en `mobile/app/`**  
  *Contexto:* Aún existen archivos en `mobile/app/(app)/*` (ej. `pets/[id].tsx`, `chat/[consultationId].tsx`) del intento previo de implementar pantallas nativas duplicadas.  
  *Acción requerida:* Consolidar la navegación móvil en una pantalla principal de WebView que controle las rutas web dinámicamente y archivar/remover las vistas nativas que ya no se utilizan.
- **D-W02: Deep Linking Bidireccional Completo**  
  *Contexto:* `app.json` declara el esquema `vetconnect://`, pero se debe asegurar que al abrir un enlace externo (ej. `vetconnect://call/123`), el WebView navegue directamente a `${EXPO_PUBLIC_WEB_URL}/call/123`.

### 3.2 Prioridad Media (Experiencia de Usuario)
- **D-W03: Pantalla Offline Nativa Resiliente**  
  *Contexto:* Si el dispositivo pierde la señal de red o el servidor web está temporalmente caído, el WebView muestra la pantalla de error genérica del sistema.  
  *Acción requerida:* Renderizar un componente nativo de `OfflineScreen` con botón de "Reintentar conexión" y detección de conectividad con NetInfo.
- **D-W04: Despacho de Push Notifications desde Backend**  
  *Contexto:* El registro del token push en mobile ya está implementado, pero los servicios de backend deben asegurar el envío del trigger ante eventos clínicos importantes (llamada entrante de telemedicina).

---

## 4. Hoja de Ruta para Mantenimiento del Wrapper

1. **Sprint 1 (Consolidación):** Remover o archivar las rutas nativas redundantes en `mobile/app/` para que la estructura refleje inequívocamente que la app es un WebView shell.
2. **Sprint 2 (Deep Links & Push):** Conectar los eventos de `expo-linking` y `expo-notifications` con la instancia activa de `WebView` mediante `postMessage` o navegación controlada de URL.
3. **Sprint 3 (Hardening Offline):** Incorporar banner nativo de desconexión ante pérdida de Wi-Fi o datos celulares.
