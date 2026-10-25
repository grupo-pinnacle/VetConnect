import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { NewPetModal } from '../pages/ClientApp';
import { DashboardClient } from '../pages/DashboardClient';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', firstName: 'Lucia', lastName: 'Perez', role: 'CLIENT' },
    logout: vi.fn(),
  }),
}));

describe('BUG-01 (WebView Ready): Pet Image Picker & Draft Recovery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('NewPetModal (ClientApp.tsx)', () => {
    it('dispatches file chooser with type="button", preventDefault, stopPropagation, and safe image formats without capture="environment"', () => {
      const onClose = vi.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <NewPetModal open={true} onClose={onClose} />
        </QueryClientProvider>
      );

      const uploadBtn = screen.getByRole('button', { name: /subir imagen de mascota|subir foto real de tu mascota/i });
      expect(uploadBtn).toBeDefined();
      expect(uploadBtn.getAttribute('type')).toBe('button');

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeDefined();
      expect(fileInput.getAttribute('accept')).toBe('image/jpeg,image/png,image/webp');
      expect(fileInput.getAttribute('capture')).toBeNull();

      // Spy on click of file input
      const clickSpy = vi.spyOn(fileInput, 'click');

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      uploadBtn.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('persists draft to localStorage under "vetconnect_new_pet_draft" when open', async () => {
      const onClose = vi.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <NewPetModal open={true} onClose={onClose} />
        </QueryClientProvider>
      );

      const nameInput = screen.getByPlaceholderText('Ej: Milo');
      fireEvent.change(nameInput, { target: { value: 'Bobby' } });

      await waitFor(() => {
        const saved = localStorage.getItem('vetconnect_new_pet_draft');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.name).toBe('Bobby');
        expect(parsed.isModalOpen).toBe(true);
      });
    });

    it('rehydrates draft automatically from localStorage if WebView reloaded', () => {
      localStorage.setItem(
        'vetconnect_new_pet_draft',
        JSON.stringify({
          name: 'Toby Rehydrated',
          species: 'Perro',
          sex: 'Macho',
          breed: 'Labrador',
          weightKg: '15',
          isModalOpen: true,
        })
      );

      const onClose = vi.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <NewPetModal open={true} onClose={onClose} />
        </QueryClientProvider>
      );

      const nameInput = screen.getByPlaceholderText('Ej: Milo') as HTMLInputElement;
      expect(nameInput.value).toBe('Toby Rehydrated');
    });

    it('clears "vetconnect_new_pet_draft" when modal is closed voluntarily', async () => {
      localStorage.setItem(
        'vetconnect_new_pet_draft',
        JSON.stringify({
          name: 'Draft to delete',
          isModalOpen: true,
        })
      );

      const onClose = vi.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <NewPetModal open={true} onClose={onClose} />
        </QueryClientProvider>
      );

      const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelBtn);

      expect(onClose).toHaveBeenCalled();
      expect(localStorage.getItem('vetconnect_new_pet_draft')).toBeNull();
    });
  });

  describe('DashboardClient (DashboardClient.tsx)', () => {
    it('rehydrates open modal and form data if "vetconnect_new_pet_draft" has isModalOpen: true', async () => {
      vi.mocked(api.get).mockImplementation((url) => {
        if (url === '/api/pets') return Promise.resolve({ data: { success: true, data: [] } } as any);
        if (url === '/api/consultations/mine') return Promise.resolve({ data: { success: true, data: [] } } as any);
        return Promise.reject(new Error('Not found'));
      });

      localStorage.setItem(
        'vetconnect_new_pet_draft',
        JSON.stringify({
          name: 'Draft Pet In Dashboard',
          species: 'Canine',
          breed: 'Beagle',
          isModalOpen: true,
        })
      );

      render(
        <MemoryRouter>
          <DashboardClient />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-pet-modal')).toBeDefined();
        const input = screen.getByTestId('input-pet-name') as HTMLInputElement;
        expect(input.value).toBe('Draft Pet In Dashboard');
      });
    });

    it('clears draft when closing modal in DashboardClient', async () => {
      vi.mocked(api.get).mockImplementation((url) => {
        if (url === '/api/pets') return Promise.resolve({ data: { success: true, data: [] } } as any);
        if (url === '/api/consultations/mine') return Promise.resolve({ data: { success: true, data: [] } } as any);
        return Promise.reject(new Error('Not found'));
      });

      localStorage.setItem(
        'vetconnect_new_pet_draft',
        JSON.stringify({
          name: 'Draft Pet',
          isModalOpen: true,
        })
      );

      render(
        <MemoryRouter>
          <DashboardClient />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-pet-modal')).toBeDefined();
      });

      fireEvent.click(screen.getByTestId('cancel-add-pet-button'));

      await waitFor(() => {
        expect(localStorage.getItem('vetconnect_new_pet_draft')).toBeNull();
      });
    });
  });
});
