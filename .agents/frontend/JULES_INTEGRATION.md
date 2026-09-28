# 🔌 Guía de Integración Frontend Web -> Google Jules vía MCP

> **Propósito:** Pautas para formular pedidos de implementación web a **Google Jules**.

---

## 📦 Estructura del Task Packet Frontend para Jules

1. **Ubicación de Archivos:**
   - Componentes UI: `web/src/components/ui/` con su respectivo archivo Storybook `.stories.tsx`.
   - Vistas / Páginas: `web/src/pages/`.
   - Servicios de API: `web/src/services/api.ts` o llamadas vía `useQuery` de TanStack Query.
2. **Requisitos de TDD:**
   - Cada componente o página nueva debe contar con su prueba en `web/src/__tests__/<Componente>.test.tsx` usando `@testing-library/react` y `vitest`.
3. **Comando de Auto-Verificación:**
   ```bash
   npm test -w web -- -t "<Nombre>"
   npm run build -w web
   ```
