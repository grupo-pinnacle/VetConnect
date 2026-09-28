# 🛡️ Reglas de Ingeniería & Guardarraíles de Backend

> **Ubicación:** `.agents/backend/REGLAS_INGENIERIA.md`  
> **Cumplimiento:** Obligatorio para cualquier agente de IA o desarrollador que modifique `backend/`.

---

## 🚫 1. Prohibiciones Absolutas (Violaciones Críticas de Seguridad)

1. **❌ Prohibido el Borrado Físico:**
   - NUNCA invocar `prisma.<model>.delete()` ni `deleteMany()`.
   - Utilizar siempre borrado lógico mediante `deletedAt = new Date()`.
2. **❌ Prohibido el Serving Estático de Archivos Médicos:**
   - NUNCA configurar `app.use('/uploads', express.static(...))`.
   - Todo archivo clínico debe descargarse mediante `GET /api/media/:id`, validando que el solicitante sea el dueño de la mascota, el veterinario asignado a la consulta o un ADMIN.
3. **❌ Prohibido exponer PII en Tokens o Logs:**
   - NUNCA inyectar correos electrónicos ni teléfonos en los tokens JWT de LiveKit ni en logs de consola.
   - Usar `identity: user.id` y `name: user.firstName`.
4. **❌ Prohibido omitir esquemas Zod:**
   - Ningún controlador Express debe procesar `req.body` o `req.query` sin validación Zod previa.
5. **❌ Prohibido romper la escala de calificación médica:**
   - La escala de calificación es estrictamente de **1 a 5 estrellas** (enteros del 1 al 5, ADR-023).

---

## 🔒 2. Estándar de Autenticación Dual (ADR-004)

```typescript
// Si la petición proviene de la App Móvil (header X-Client-Platform: mobile):
if (req.headers['x-client-platform'] === 'mobile') {
  // Retornar refreshToken en el body para SecureStore
  return res.json({ accessToken, refreshToken, user });
}

// Si proviene de la Web SPA:
// Retornar en cookie HttpOnly + Secure
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth'
});
return res.json({ accessToken, user });
```

---

## ⚡ 3. Idempotencia en Mensajería (Socket.io & Chat)

```typescript
// En caso de reintento de envío con el mismo clientMsgId:
if (error.code === 'P2002') {
  const existing = await prisma.message.findUnique({ where: { clientMsgId } });
  return res.status(200).json({ success: true, data: existing });
}
```
