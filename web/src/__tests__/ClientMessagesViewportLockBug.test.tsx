import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Encaje 100vh/100dvh y scroll interno independiente en /client/messages', () => {
  const clientAppPath = path.resolve(__dirname, '../pages/ClientApp.tsx');
  const clientCssPath = path.resolve(__dirname, '../styles/client.css');
  const clientAppCode = fs.readFileSync(clientAppPath, 'utf-8');
  const clientCssCode = fs.readFileSync(clientCssPath, 'utf-8');

  it('AppShell en ClientApp.tsx debe aplicar la clase modificadora content--messages en el elemento <main> cuando la ruta es /client/messages', () => {
    expect(clientAppCode).toMatch(/content--messages/);
    expect(clientAppCode).toMatch(/<main[^>]*className=\{[^}]*content--messages[^}]*\}/);
  });

  it('client.css debe restringir la altura del layout de mensajes al viewport (overflow: hidden + min-height: 0) y delegar overflow-y: auto a la lista de chats', () => {
    // Verifica que .content--messages y .hc-messages-page-wrapper contengan el alto sin desbordar la página
    expect(clientCssCode).toMatch(/\.content--messages\s*\{[^}]*overflow:\s*hidden/s);
    expect(clientCssCode).toMatch(/\.hc-messages-page-wrapper\s*\{[^}]*min-height:\s*0/s);
    expect(clientCssCode).toMatch(/\.hc-chat-layout\s*\{[^}]*min-height:\s*0/s);
    // Verifica que la columna de lista de chats o su contenedor de items tenga scroll interno controlado
    expect(clientCssCode).toMatch(/\.hc-chat-list-column[^{]*\{[^}]*min-height:\s*0/s);
  });
});
