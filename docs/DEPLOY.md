# 🚀 Guía de Despliegue en Producción — VetConnect

Esta guía detalla la infraestructura de producción seleccionada para VetConnect: **Coolify (Self-hosted)** para el Backend, **Vercel** como plataforma oficial definitiva para el Frontend Web (con **Hostinger** como contingencia manual), y las **estrategias de distribución para Android**.

---

## 1. Topología de Infraestructura de Producción

```mermaid
flowchart TD
    subgraph Internet["Tráfico Global"]
        Users["📱 Usuarios Móviles (Android)\n💻 Veterinarios & Admins (Web)"]
    end

    subgraph WebHosting["Capa Frontend Web"]
        Vercel["⚡ Vercel (Oficial Definitivo - ADR-022)\n• Dominio: app.vetconnect.com\n• SPA React 18.3.1 (LTS) + Vite\n• CDN Global & SSL Automático\n(Hostinger: Contingencia Manual)"]
    end

    subgraph CoolifyVPS["Capa Backend (Coolify en VPS Propio)"]
        Traefik["🛡️ Traefik Reverse Proxy\n• SSL Let's Encrypt Automático\n• WebSocket Gateway (WSS)"]
        NodeApp["⚙️ VetConnect API (Node.js 20 / Docker)\n• Express 5 + Socket.io + Prisma\n• Puerto interno: 3001"]
        RedisServ["🔴 Redis Server (Coolify One-Click Service)\n• Socket.io Adapter & Rate Limiter"]
    end

    subgraph DataCloud["Bases de Datos & Media"]
        SupabasePostgres[("🐘 Supabase PostgreSQL (o Postgres en Coolify)")]
        LiveKitCloud["🎥 LiveKit Cloud (WebRTC SFU)"]
        S3Storage["🪣 Amazon S3 / Cloudinary (Media Cifrada)"]
    end

    Users -->|HTTPS| Vercel
    Users -->|HTTPS / WSS| Traefik
    Traefik --> NodeApp
    NodeApp --> RedisServ
    NodeApp --> SupabasePostgres
    NodeApp --> LiveKitCloud
    NodeApp --> S3Storage
```

---

## 2. Despliegue del Backend en Coolify (Self-Hosted VPS)

**Coolify** es una plataforma PaaS autohosteada de código abierto (alternativa a Heroku/Railway) que corre sobre tu propio servidor VPS (Hostinger VPS, Hetzner, DigitalOcean, AWS, etc.).

### 2.1 Requisitos del Servidor VPS
- **SO:** Ubuntu 22.04 / 24.04 LTS.
- **Hardware Mínimo:** 2 vCPU, 4 GB RAM, 40 GB SSD.
- **Instalación de Coolify en el VPS (comando único):**
  ```bash
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
  ```

### 2.2 Configuración del Proyecto en Coolify
1. **Crear Nuevo Recurso:** En el panel de Coolify, añade una nueva aplicación seleccionando tu repositorio de GitHub (`grupo-pinnacle/VetConnect`).
2. **Directorio Base:** Configura el *Base Directory* en `/backend`.
3. **Build Pack:** Selecciona `Dockerfile` (o `Nixpacks / Node.js`).
4. **Dominio Público:** Asigna tu subdominio (ej: `https://api.vetconnect.com`). Coolify y Traefik generarán automáticamente el certificado SSL (HTTPS/WSS).
5. **Variables de Entorno en Coolify:**
   ```env
   PORT=3001
   NODE_ENV=production
   DATABASE_URL="postgresql://postgres:tu_password@db_host:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:tu_password@db_host:5432/postgres"
   JWT_SECRET="genera_un_secreto_seguro_de_64_caracteres_con_openssl"
   JWT_REFRESH_SECRET="genera_otro_secreto_seguro_para_refresh"
   REDIS_URL="redis://default:password@coolify-redis-service:6379"
   FRONTEND_URL="https://app.vetconnect.com"
   LIVEKIT_API_KEY="APxxxxxxxxxxxx"
   LIVEKIT_API_SECRET="secretxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   LIVEKIT_HOST="https://vetconnect.livekit.cloud"
   ```
6. **Comando de Inicio (Start Command):**
   ```bash
   npx prisma migrate deploy && node dist/server.js
   ```

---

## 3. Despliegue del Frontend Web

### 3.1 Plataforma Oficial Definitiva: Vercel (ADR-022)
**Vercel** es la plataforma oficial y estandarizada para el Frontend Web (`web/`). Se encuentra plenamente integrada con el pipeline de GitHub Actions (`.github/workflows/ci.yml`).

1. Conecta tu repositorio de GitHub a [Vercel](https://vercel.com).
2. **Root Directory:** Selecciona `web`.
3. **Framework Preset:** `Vite`.
4. **Variables de Entorno en Vercel:**
   ```env
   VITE_API_URL="https://api.vetconnect.com"
   VITE_SOCKET_URL="https://api.vetconnect.com"
   VITE_LIVEKIT_HOST="https://vetconnect.livekit.cloud"
   ```
5. **Automatización:** Cada push a `main` dispara un despliegue de producción con CDN global Edge, compresión Brotli y SSL automático. Cada Pull Request genera una URL de previsualización (Preview Deployment) para QA.

### 3.2 Alternativa de Contingencia Manual: Hostinger (Sin CI/CD)
> ⚠️ **Nota de Contingencia:** Hostinger **no** forma parte del pipeline de integración continua y se documenta exclusivamente como plan de contingencia manual ante contingencias de red, caídas de Vercel o restricciones administrativas de cuenta.

1. Compila el proyecto manualmente en local:
   ```bash
   cd web
   npm install
   npm run build
   ```
2. Sube manualmente vía SFTP el contenido de `web/dist/` al directorio `public_html/` de Hostinger.
3. Asegura el archivo `.htaccess` para soportar el enrutamiento de React Router (SPA):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## 4. Estrategia de Compilación y Distribución para Android

Para la aplicación móvil de Android, existen **3 caminos posibles** según el objetivo del proyecto:

### 🛣️ Camino 1: Publicación Oficial en Google Play Store (Producción Masiva)
- **Formato de Salida:** Android App Bundle (`.aab`).
- **Cómo se compila:**
  ```bash
  cd mobile
  npm install -g eas-cli
  eas login
  eas build --platform android --profile production
  ```
- **Requisitos:** Cuenta de desarrollador en Google Play Console (pago único de $25 USD).
- **Ventaja:** Máxima confianza para los usuarios, actualizaciones automáticas desde la Play Store y firma criptográfica gestionada por Google.

### 🛣️ Camino 2: Distribución Directa de APK (Sideloading / Beta Privada / Testing sin Play Store)
- **Formato de Salida:** Archivo instalable directo (`.apk`).
- **Cómo se compila con EAS:**
  ```bash
  # En mobile/eas.json configura "buildType": "apk" en el perfil preview
  eas build --platform android --profile preview
  ```
- **Distribución:** Se sube el archivo `.apk` a tu propio servidor o landing page en Hostinger (`https://vetconnect.com/descargar-app.apk`). Los tutores lo descargan e instalan directamente en su celular Android activando "Permitir orígenes desconocidos".
- **Ventaja:** Cero costo de Play Store, despliegue inmediato sin tiempos de revisión de Google (ideal para validar el MVP y hacer pruebas piloto con clínicas reales).

### 🛣️ Camino 3: Compilación Local de APK con Android SDK (Sin usar EAS Cloud)
- **Cómo se compila:**
  ```bash
  cd mobile
  npx expo prebuild --platform android
  cd android
  ./gradlew assembleRelease
  ```
- **Resultado:** Genera el archivo APK en `mobile/android/app/build/outputs/apk/release/app-release.apk` sin consumir minutos de compilación en la nube de Expo.

---

## 5. Resumen de Costos y Mantenimiento

| Servicio | Plataforma | Costo Estimado |
|---|---|---|
| **Backend & Redis** | Coolify en VPS Hostinger / Hetzner | $8 – $12 USD / mes (servidor fijo) |
| **Frontend Web** | Vercel (Plan Hobby) / Hostinger | Gratis / Incluido en hosting |
| **Base de Datos** | Supabase (Tier Free / Pro) o Postgres en Coolify | $0 a $25 USD / mes |
| **Videollamadas** | LiveKit Cloud (10.000 min/mes gratis) | $0 USD (hasta escalar) |
| **App Android (APK)** | Descarga directa desde web | $0 USD |
