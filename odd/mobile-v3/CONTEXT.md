# CONTEXT — Decisiones congeladas de Mobile v3

> Todo chat de fase lee este archivo completo. Es corto a propósito.

## 1. Por qué se reconstruye

1. **El diseño visual no es profesional.** La web comparte colores y fuentes, pero también arrastra carencias de diseño.
2. **La videollamada nunca funcionó:** el bridge WebView invocaba `window.initLiveKitCall`, una función que no existe en `web/`.
3. **Las push no se podían probar:** desde SDK 53, Expo Go no soporta push remoto. **Expo Go es el problema, no Expo.**

## 2. ADRs congelados

| ADR | Decisión |
|---|---|
| **M-01 Build** | Expo SDK 54 con CNG + **Development Build** (`expo-dev-client`). **Expo Go queda prohibido** como entorno de prueba. `android/` e `ios/` son generados (`npx expo prebuild`) y están en `.gitignore`. Una sola config: `mobile/app.config.ts` + `mobile/eas.json`. Package: `com.vetconnect.app`. Android-first. |
| **M-02 Video** | **LiveKit nativo**: `@livekit/react-native`, `@livekit/react-native-webrtc`, `@livekit/react-native-expo-plugin`, `@config-plugins/react-native-webrtc`. **Sin WebView.** El token sale de `POST /api/calls/:consultationId/token` y el timbre de `POST /api/calls/:consultationId/ring`. Señalización por socket (`call:incoming`, `call:answered`, `call:rejected`). CallKit/ConnectionService quedan fuera de v3. |
| **M-03 Estado** | **TanStack Query** para el estado del servidor. `zustand` **solo** para sesión y UI efímera. Los query keys se centralizan por feature. |
| **M-04 Estructura** | Screaming architecture por features (ver §4). Las rutas de `app/` son delgadas: solo componen features. Patrón container-presentational. |
| **M-05 Diseño** | Design system primero (`DESIGN_SYSTEM.md`). NativeWind v4. Ninguna pantalla usa colores o tamaños sueltos: todo sale de tokens. |
| **M-06 Roles** | Grupos `(auth)`, `(tutor)`, `(vet)`. ADMIN → pantalla "Usar el panel web". Gate SENASA con polling de `/api/auth/me`. |

## 3. Reglas anteriores que estos ADRs REEMPLAZAN

Si un documento antiguo dice lo contrario, **manda esta tabla**:

| Documento antiguo | Regla obsoleta | Reemplazo |
|---|---|---|
| `odd/tasks/mobile-completion.md` | "Never `@tanstack/react-query`" / "WebView bridge only" | M-03 / M-02 |
| `.agents/mobile/AGENT.md` §1.1.3 | Handshake WebView `page:ready` | M-02 |
| `docs/mobile/README.md` (fila 3) | "Sin TanStack Query" | M-03 |
| `docs/mobile/AGENT_CODING_SPEC_MOBILE.md` | Bridge LiveKit por WebView | M-02 |
| `docs/mobile/03_ESTADO_Y_DEUDA_MOBILE.md` D-01 | "El backend nunca crea `Notification`" | **Falso hoy:** `notifications.service.ts` crea filas y despacha a `exp.host`. F0 verifica los callers |

Se mantienen vigentes: auth dual (`X-Client-Platform: mobile`, refresh token en `expo-secure-store`, access token en memoria), FSM `WAITING/ACTIVE/COMPLETED/CANCELLED`, mensajes **solo por socket** + `GET …/messages?after=`, `GET /api/media/:id` = 302 a URL prefirmada, cero `any`, cero PII en tokens/logs/push, soft deletes, nada de v2.1+ (lista en `docs/mobile/README.md`).

## 4. Estructura objetivo de `mobile/`

```
mobile/
├── app/                      # Expo Router — solo rutas
│   ├── _layout.tsx           # providers: QueryClient, theme, session gate
│   ├── (auth)/               # login, register
│   ├── (tutor)/              # tabs del tutor
│   ├── (vet)/                # tabs del veterinario
│   └── call/[consultationId].tsx
├── src/
│   ├── features/
│   │   └── <feature>/        # auth, pets, consultations, chat, calls, notifications, profile, vet
│   │       ├── api/          # funciones axios + query keys
│   │       ├── hooks/        # useQuery/useMutation
│   │       ├── components/   # presentacionales de la feature
│   │       ├── schemas/      # zod
│   │       └── __tests__/
│   └── shared/
│       ├── ui/               # átomos y moléculas del design system
│       ├── theme/            # tokens
│       ├── lib/              # api client, socket, secure storage, netinfo
│       └── types/
├── app.config.ts
└── eas.json
```

## 5. Reutilizable del código legado (`mobile-legacy/`, solo lectura)

Solo después de auditarlo contra `schema.prisma`: `src/validation/*`, `src/lib/triage.ts`, `src/types/index.ts`. **Todo lo demás se reescribe.**

## 6. Verificación estándar (toda fase)

```powershell
npm run typecheck -w mobile
npm test -w mobile
```
