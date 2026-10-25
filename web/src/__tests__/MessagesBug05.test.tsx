import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessagesPage } from '../pages/ClientApp';
import * as shared from '../shared';

let mockConsultations: any[] = [];
let mockPets: any[] = [];

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes('/api/consultations/mine')) {
        return Promise.resolve({ data: { success: true, data: mockConsultations } });
      }
      if (url.includes('/api/pets')) {
        return Promise.resolve({ data: { success: true, data: mockPets } });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    patch: vi.fn(),
  },
  getAccessToken: vi.fn(() => 'mock-jwt-token'),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-tutor-1', firstName: 'Lara', lastName: 'Bouso', role: 'CLIENT', email: 'lara@vetconnect.com.ar' },
    refreshSession: vi.fn(),
    logout: vi.fn(() => Promise.resolve()),
  }),
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('BUG-05: Rediseño y limpieza del módulo Mensajes (Anti-clon WhatsApp y chats reales)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    vi.clearAllMocks();
    mockConsultations = [];
    mockPets = [];
  });

  it('renders a clean clinical EmptyState when user has zero consultations (no fake chats)', async () => {
    mockPets = [{ id: 'p1', name: 'Milo', species: 'CANINE' }];
    mockConsultations = [];

    render(
      <QueryClientProvider client={queryClient}>
        <MessagesPage />
      </QueryClientProvider>
    );

    // Empty state must be rendered
    await waitFor(() => {
      expect(screen.getByTestId('messages-empty-state')).toBeDefined();
    });
    expect(screen.getByText('Todavía no tenés conversaciones clínicas activas')).toBeDefined();
    expect(screen.getByText(/Cuando inicies una consulta de telemedicina veterinaria/i)).toBeDefined();
    expect(screen.getByText('Solicitar atención')).toBeDefined();

    // No fake WhatsApp container or WhatsApp text
    expect(screen.queryByTestId('messages-chat-container')).toBeNull();
    expect(screen.queryByText('WhatsApp')).toBeNull();
    expect(screen.queryByText(/cifrados de extremo a extremo/i)).toBeNull();
  });

  it('navigates to triage when clicking Solicitar atención from the empty state', async () => {
    const goSpy = vi.spyOn(shared, 'go').mockImplementation(() => {});

    mockPets = [];
    mockConsultations = [];

    render(
      <QueryClientProvider client={queryClient}>
        <MessagesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('messages-empty-state')).toBeDefined();
    });

    const actionBtn = screen.getByText('Solicitar atención');
    fireEvent.click(actionBtn);

    expect(goSpy).toHaveBeenCalledWith('/client/triage');
  });

  it('lists ONLY real consultations from user data without fake WhatsApp elements', async () => {
    mockPets = [{ id: 'p1', name: 'Milo', species: 'CANINE' }];
    mockConsultations = [
      {
        id: 'cons-real-1',
        clientId: 'user-tutor-1',
        pet: { id: 'p1', name: 'Milo', species: 'Canino' },
        vet: { id: 'vet-1', firstName: 'Valentina', lastName: 'Giménez' },
        status: 'ACTIVE',
        scheduledAt: new Date().toISOString(),
        reason: 'Control cardiológico post-operatorio',
      },
      {
        id: 'cons-real-2',
        clientId: 'user-tutor-1',
        pet: { id: 'p1', name: 'Milo', species: 'Canino' },
        vet: { id: 'vet-2', firstName: 'Lucas', lastName: 'Morales' },
        status: 'COMPLETED',
        scheduledAt: new Date(Date.now() - 86400000).toISOString(),
        reason: 'Consulta preventiva anual',
      },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MessagesPage />
      </QueryClientProvider>
    );

    // Chat container must be rendered
    await waitFor(() => {
      expect(screen.getByTestId('messages-chat-container')).toBeDefined();
    });

    // Must show brand title "Mensajería Clínica", NOT "WhatsApp"
    expect(screen.getByText('Mensajería Clínica')).toBeDefined();
    expect(screen.queryByText('WhatsApp')).toBeNull();

    // Both real consultations should appear in sidebar
    expect(screen.getByTestId('chat-item-cons-real-1')).toBeDefined();
    expect(screen.getByTestId('chat-item-cons-real-2')).toBeDefined();
    expect(screen.getAllByText(/Valentina Giménez/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Lucas Morales/i)).toBeDefined();

    // Verify clinical security note is present instead of fake WhatsApp encryption pill
    expect(screen.getByTestId('clinical-security-note')).toBeDefined();
    expect(screen.getByText(/Canal clínico auditado · Los mensajes forman parte de la historia clínica/i)).toBeDefined();
    expect(screen.queryByText(/cifrados de extremo a extremo\. Nadie fuera de este chat/i)).toBeNull();

    // Verify empty thread message notice for fresh consultation
    expect(screen.getByTestId('empty-conversation-notice')).toBeDefined();
    expect(screen.getByText(/Iniciá la comunicación con/i)).toBeDefined();
  });

  it('allows filtering by chips (Todos, En curso, Finalizadas)', async () => {
    mockPets = [{ id: 'p1', name: 'Milo', species: 'CANINE' }];
    mockConsultations = [
      {
        id: 'cons-1',
        clientId: 'user-tutor-1',
        pet: { id: 'p1', name: 'Milo', species: 'Canino' },
        vet: { id: 'vet-1', firstName: 'Valentina', lastName: 'Giménez' },
        status: 'ACTIVE',
        scheduledAt: new Date().toISOString(),
        reason: 'Urgencia',
      },
      {
        id: 'cons-2',
        clientId: 'user-tutor-1',
        pet: { id: 'p1', name: 'Milo', species: 'Canino' },
        vet: { id: 'vet-2', firstName: 'Lucas', lastName: 'Morales' },
        status: 'COMPLETED',
        scheduledAt: new Date(Date.now() - 86400000).toISOString(),
        reason: 'Vacuna',
      },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MessagesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('messages-chat-container')).toBeDefined();
    });

    const chipFinalizadas = screen.getByTestId('chat-chip-finalizadas');
    fireEvent.click(chipFinalizadas);

    // Under Finalizadas, cons-1 should not be visible in sidebar
    expect(screen.queryByTestId('chat-item-cons-1')).toBeNull();
    expect(screen.getByTestId('chat-item-cons-2')).toBeDefined();

    const chipEnCurso = screen.getByTestId('chat-chip-en-curso');
    fireEvent.click(chipEnCurso);

    // Under En curso, cons-1 is visible and cons-2 is not
    expect(screen.getByTestId('chat-item-cons-1')).toBeDefined();
    expect(screen.queryByTestId('chat-item-cons-2')).toBeNull();
  });

  it('allows sending real messages to the active consultation chat', async () => {
    mockPets = [{ id: 'p1', name: 'Milo', species: 'CANINE' }];
    mockConsultations = [
      {
        id: 'cons-real-1',
        clientId: 'user-tutor-1',
        pet: { id: 'p1', name: 'Milo', species: 'Canino' },
        vet: { id: 'vet-1', firstName: 'Valentina', lastName: 'Giménez' },
        status: 'ACTIVE',
        scheduledAt: new Date().toISOString(),
        reason: 'Tos persistente',
      },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MessagesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('chat-message-input')).toBeDefined();
    });

    const input = screen.getByTestId('chat-message-input');
    const sendBtn = screen.getByTestId('chat-send-btn');

    // Input empty -> button is disabled
    expect((sendBtn as HTMLButtonElement).disabled).toBe(true);

    // Type a clinical message
    fireEvent.change(input, { target: { value: 'Hola Dra., Milo ya tomó la medicación.' } });
    expect((sendBtn as HTMLButtonElement).disabled).toBe(false);

    // Send message
    fireEvent.click(sendBtn);

    // The bubble should appear in the thread
    await waitFor(() => {
      expect(screen.getAllByText('Hola Dra., Milo ya tomó la medicación.').length).toBeGreaterThanOrEqual(1);
    });

    // Input should be cleared
    expect((input as HTMLInputElement).value).toBe('');
  });
});
