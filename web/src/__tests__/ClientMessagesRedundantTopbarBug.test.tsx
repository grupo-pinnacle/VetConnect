import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Remoción de cabecera interna redundante (.hc-messages-topbar) en MessagesPage', () => {
  const clientAppPath = path.resolve(__dirname, '../pages/ClientApp.tsx');
  const clientAppCode = fs.readFileSync(clientAppPath, 'utf-8');

  // Extraemos el cuerpo de MessagesPage para acotar las aserciones al componente
  const messagesPageMatch = clientAppCode.match(/export\s+function\s+MessagesPage\s*\([^)]*\)\s*\{[\s\S]*?(?=\nexport\s+function|\nfunction\s+[A-Z]|$)/);
  const messagesPageCode = messagesPageMatch ? messagesPageMatch[0] : clientAppCode;

  it('MessagesPage NO debe renderizar la cabecera redundante <header className="hc-messages-topbar"> ni la píldora "Huelli Cam"', () => {
    expect(messagesPageCode).not.toMatch(/className=["'][^"']*hc-messages-topbar[^"']*["']/);
    expect(messagesPageCode).not.toMatch(/className=["'][^"']*hc-brand-pill[^"']*["']/);
    expect(messagesPageCode).not.toMatch(/className=["'][^"']*hc-hamburger-btn[^"']*["']/);
    expect(messagesPageCode).not.toMatch(/className=["'][^"']*hc-bell-btn[^"']*["']/);
  });

  it('MessagesPage debe conservar intacta la estructura de dos columnas (.hc-messages-page-wrapper y .hc-chat-layout)', () => {
    expect(messagesPageCode).toContain('hc-messages-page-wrapper');
    expect(messagesPageCode).toContain('hc-chat-layout');
    expect(messagesPageCode).toContain('hc-chat-list-column');
  });
});
