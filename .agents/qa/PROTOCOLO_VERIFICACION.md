# 🧪 Protocolo de Verificación & Comandos de Certificación

> **Ubicación:** `.agents/qa/PROTOCOLO_VERIFICACION.md`  
> **Propósito:** Comandos exactos que deben ejecutarse localmente y en CI para certificar un commit o Pull Request.

---

## ⚡ Secuencia Canónica de Verificación

```bash
# 1. Validación de esquema y relaciones de base de datos
cd backend && npx prisma validate && cd ..

# 2. Typechecking estricto en todas las capas (Backend, Web y Mobile)
npm run typecheck --workspaces

# 3. Suite completa de pruebas automatizadas (160 tests)
npm test --workspaces

# 4. Verificación de compilación de producción (Bundle Vite & Express)
npm run build --workspaces

# 5. Auditoría de gobernanza dual y consistencia semántica
npm run check:governance
```

---

## 📊 Matriz de Fallos y Diagnóstico Rápido

| Síntoma / Error | Causa Probable | Acción Correctiva |
|---|---|---|
| `error: Environment variable not found: DATABASE_URL` | Falta archivo `.env` en `backend/` | Ejecutar `copy .env.example backend\.env` |
| `P2002 Unique constraint failed` en tests de chat | `clientMsgId` no generado con entropía | Usar timestamp + sufijo aleatorio |
| `Cannot find module 'expo-router'` en typecheck | Conflicto de resolución monorepo | Revisar `extraNodeModules` en `metro.config.js` |
| `RoomAudioRenderer` error en tests de web | Duplicación de audio en LiveKit | Usar exclusivamente `<VideoConference />` |
