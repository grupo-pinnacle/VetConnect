import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bugfix: Messages Full-height Scroll & Prescriptions Cache', () => {
  const clientAppPath = path.resolve(__dirname, '../pages/ClientApp.tsx');
  const clientAppCode = fs.readFileSync(clientAppPath, 'utf-8');

  it('Bug A: AppShell debe aplicar "app-main--messages" a .app-main cuando isMessagesPage es true para habilitar el layout inmersivo y el scroll vertical', () => {
    // Debe condicionar la clase app-main con app-main--messages
    expect(clientAppCode).toMatch(/app-main\s+\$\{isMessagesPage\s*\?\s*['"]app-main--messages['"]/);
  });

  it('Bug B: MessagesPage debe almacenar y recuperar mensajes de localStorage ("vetconnect_chat_") para persistir la conversación ante recargas', () => {
    // Debe buscar y persistir en localStorage los mensajes de chat
    expect(clientAppCode).toMatch(/vetconnect_chat_/);
    expect(clientAppCode).toMatch(/localStorage\.setItem\([`'"]vetconnect_chat_/);
  });

  it('Bug C: PrescriptionsPage / useClientData debe cachear recetas con useQuery para evitar latencia de 3s al reingresar a la sección', () => {
    // Debe usar useQuery con queryKey de prescriptions
    expect(clientAppCode).toMatch(/queryKey:\s*\[['"]prescriptions['"]/);
  });
});
