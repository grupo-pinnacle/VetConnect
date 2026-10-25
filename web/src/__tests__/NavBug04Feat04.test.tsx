import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell, isRouteActive, mobileRoutes, routes, ConsultationsPage } from '../pages/ClientApp';
import * as shared from '../shared';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { success: true, data: [] } })),
    post: vi.fn(),
    patch: vi.fn(),
  },
  getAccessToken: vi.fn(() => 'mock-token'),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', firstName: 'Lara', lastName: 'Bouso', role: 'CLIENT', email: 'lara@vetconnect.com.ar' },
    refreshSession: vi.fn(),
    logout: vi.fn(() => Promise.resolve()),
  }),
}));

describe('BUG-04: Active Navigation Underline & Routing Logic', () => {
  it('correctly calculates active state with isRouteActive without locking onto Inicio', () => {
    // When path is /client/dashboard or /client
    expect(isRouteActive('/client/dashboard', '/client/dashboard')).toBe(true);
    expect(isRouteActive('/client/dashboard', '/client')).toBe(true);
    expect(isRouteActive('/client/pets', '/client/dashboard')).toBe(false);
    expect(isRouteActive('/client/consultations', '/client/dashboard')).toBe(false);

    // When path is /client/pets
    expect(isRouteActive('/client/dashboard', '/client/pets')).toBe(false);
    expect(isRouteActive('/client/pets', '/client/pets')).toBe(true);
    expect(isRouteActive('/client/pets', '/client/pets/pet-123')).toBe(true);
    expect(isRouteActive('/client/messages', '/client/pets')).toBe(false);

    // When path is /client/messages
    expect(isRouteActive('/client/dashboard', '/client/messages')).toBe(false);
    expect(isRouteActive('/client/pets', '/client/messages')).toBe(false);
    expect(isRouteActive('/client/messages', '/client/messages')).toBe(true);

    // When path is /client/consultations or /client/appointments
    expect(isRouteActive('/client/dashboard', '/client/consultations')).toBe(false);
    expect(isRouteActive('/client/consultations', '/client/consultations')).toBe(true);
    expect(isRouteActive('/client/consultations', '/client/appointments')).toBe(true);
  });

  it('renders is-active ONLY on the current route in mobile bottom nav', () => {
    const queryClient = new QueryClient();

    // Render AppShell with path="/client/pets"
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AppShell path="/client/pets">
          <div>Contenido Mascotas</div>
        </AppShell>
      </QueryClientProvider>
    );

    const inicioBtn = screen.getByTestId('mobile-nav-dashboard');
    const petsBtn = screen.getByTestId('mobile-nav-pets');
    const messagesBtn = screen.getByTestId('mobile-nav-messages');
    const consultationsBtn = screen.getByTestId('mobile-nav-consultations');

    // "Inicio" must NOT have is-active
    expect(inicioBtn.classList.contains('is-active')).toBe(false);
    expect(inicioBtn.getAttribute('aria-current')).toBeNull();

    // "Mascotas" must have is-active
    expect(petsBtn.classList.contains('is-active')).toBe(true);
    expect(petsBtn.getAttribute('aria-current')).toBe('page');

    expect(messagesBtn.classList.contains('is-active')).toBe(false);
    expect(consultationsBtn.classList.contains('is-active')).toBe(false);

    // Rerender with path="/client/consultations"
    rerender(
      <QueryClientProvider client={queryClient}>
        <AppShell path="/client/consultations">
          <div>Contenido Consultas</div>
        </AppShell>
      </QueryClientProvider>
    );

    expect(inicioBtn.classList.contains('is-active')).toBe(false);
    expect(petsBtn.classList.contains('is-active')).toBe(false);
    expect(consultationsBtn.classList.contains('is-active')).toBe(true);
    expect(consultationsBtn.getAttribute('aria-current')).toBe('page');
  });
});

describe('FEAT-04: Reestructuración UX de Navegación y Menú Lateral', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  it('replaces Notificaciones with Mis consultas in mobile bottom nav (5 items total)', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AppShell path="/client/dashboard">
          <div>Contenido</div>
        </AppShell>
      </QueryClientProvider>
    );

    const mobileNav = screen.getByTestId('mobile-bottom-nav');
    const buttons = mobileNav.querySelectorAll('button');

    expect(buttons.length).toBe(5);

    // Ensure labels match: Inicio, Mascotas, Atención, Mensajes, Consultas
    const buttonTexts = Array.from(buttons).map(b => b.textContent?.trim());
    expect(buttonTexts).toContain('Inicio');
    expect(buttonTexts).toContain('Mascotas');
    expect(buttonTexts).toContain('Atención');
    expect(buttonTexts).toContain('Mensajes');
    expect(buttonTexts).toContain('Consultas');

    // Notificaciones must NOT be in the bottom nav
    expect(buttonTexts).not.toContain('Notificaciones');
    expect(screen.queryByTestId('mobile-nav-notifications')).toBeNull();
  });

  it('navigates to /client/profile when clicking user profile card at the top of Drawer', () => {
    const goSpy = vi.spyOn(shared, 'go').mockImplementation(() => {});

    render(
      <QueryClientProvider client={queryClient}>
        <AppShell path="/client/dashboard">
          <div>Contenido</div>
        </AppShell>
      </QueryClientProvider>
    );

    const drawerProfileCard = screen.getByTestId('drawer-profile-card');
    expect(drawerProfileCard).toBeDefined();
    expect(drawerProfileCard.textContent).toContain('Lara Bouso');
    expect(drawerProfileCard.textContent).toContain('Tutor');

    fireEvent.click(drawerProfileCard);

    expect(goSpy).toHaveBeenCalledWith('/client/profile');
  });

  it('removes standalone Agenda and Mi perfil from sidebar nav links', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AppShell path="/client/dashboard">
          <div>Contenido</div>
        </AppShell>
      </QueryClientProvider>
    );

    // Standalone "Agenda" link should not be present in sidebar nav
    expect(screen.queryByTestId('sidebar-nav-appointments')).toBeNull();

    // "Mi perfil" link should not be present in sidebar nav list
    expect(screen.queryByTestId('sidebar-nav-profile')).toBeNull();

    // Verify allowed routes in sidebar
    expect(screen.getByTestId('sidebar-nav-dashboard')).toBeDefined();
    expect(screen.getByTestId('sidebar-nav-pets')).toBeDefined();
    expect(screen.getByTestId('sidebar-nav-consultations')).toBeDefined();
    expect(screen.getByTestId('sidebar-nav-messages')).toBeDefined();
    expect(screen.getByTestId('sidebar-nav-prescriptions')).toBeDefined();
    expect(screen.getByTestId('sidebar-nav-notifications')).toBeDefined();
  });

  it('integrates Agenda as a tab inside ConsultationsPage', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ConsultationsPage />
      </QueryClientProvider>
    );

    // Verify tabs include Agenda
    expect(screen.getByText('Próximas')).toBeDefined();
    expect(screen.getByText('En curso')).toBeDefined();
    expect(screen.getByText('Finalizadas')).toBeDefined();
    const agendaTab = screen.getByText('Agenda');
    expect(agendaTab).toBeDefined();

    // Click Agenda tab
    fireEvent.click(agendaTab);

    // Should display calendar heading
    expect(screen.getByText('Calendario')).toBeDefined();
    expect(screen.getByRole('heading', { name: /Tus turnos/i })).toBeDefined();
  });
});
