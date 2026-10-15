import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewPetModal } from '../pages/ClientApp';

describe('NewPetModal Hook Order & Lifecycle (QA 15/10 Problema 1)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('should transition from open={false} to open={true} without React hook order error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const onClose = vi.fn();

    // 1. Initial render with open={false}
    const { rerender, container } = render(
      <QueryClientProvider client={queryClient}>
        <NewPetModal open={false} onClose={onClose} />
      </QueryClientProvider>
    );

    expect(container.firstChild).toBeNull();

    // 2. Transition to open={true} (Hook count and order must remain 100% stable)
    rerender(
      <QueryClientProvider client={queryClient}>
        <NewPetModal open={true} onClose={onClose} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Nueva mascota')).toBeDefined();
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByLabelText('Cerrar')).toBeDefined();

    // 3. Transition back to open={false}
    rerender(
      <QueryClientProvider client={queryClient}>
        <NewPetModal open={false} onClose={onClose} />
      </QueryClientProvider>
    );

    expect(container.firstChild).toBeNull();

    // Verify no "Rendered more hooks than during the previous render" error was logged
    const hookErrorCalls = consoleErrorSpy.mock.calls.filter((args) =>
      args.some(
        (arg) =>
          typeof arg === 'string' &&
          (arg.includes('Rendered more hooks') ||
            arg.includes('Rendered fewer hooks') ||
            arg.includes('order of Hooks'))
      )
    );
    expect(hookErrorCalls).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});
