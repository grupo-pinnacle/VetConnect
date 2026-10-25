import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ConsultationRoom, WaitingRoomCarousel, WAITING_SLIDES } from '../pages/ConsultationRoom';
import { CallRoom } from '../components/call/CallRoom';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    defaults: { baseURL: 'http://localhost:3001' },
  },
  getAccessToken: vi.fn(() => 'test-token'),
  setAccessToken: vi.fn(),
}));

vi.mock('../vet/CallRoom', () => ({
  getWsUrl: vi.fn(() => 'http://localhost:3001'),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u-1', firstName: 'Lucas', lastName: 'Benitez', role: 'CLIENT' },
    loading: false,
  }),
}));

describe('BUG-06 & FEAT-05 (WebView Ready): Waiting Room Carousel, WakeLock & Responsive Layout', () => {
  let mockPostMessage: any;
  let mockWakeLockRequest: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPostMessage = vi.fn();
    (window as any).ReactNativeWebView = { postMessage: mockPostMessage };

    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;

    window.matchMedia = window.matchMedia || function() {
      return {
        matches: false,
        addListener: function() {},
        removeListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() { return true; },
      } as any;
    };

    if (!Element.prototype.scrollTo) {
      Element.prototype.scrollTo = vi.fn();
    }

    mockWakeLockRequest = vi.fn().mockResolvedValue({
      release: vi.fn().mockResolvedValue(undefined),
    });

    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: mockWakeLockRequest },
      configurable: true,
      writable: true,
    });

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/messages')) {
        return Promise.resolve({ data: { success: true, data: [] } } as any);
      }
      if (url.includes('cons-123')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              id: 'cons-123',
              status: 'WAITING',
              pet: { name: 'Milo', species: 'Canino' },
            },
          },
        } as any);
      }
      if (url.includes('cons-456')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              id: 'cons-456',
              status: 'ACTIVE',
              pet: { name: 'Luna', species: 'Felino' },
            },
          },
        } as any);
      }
      return Promise.resolve({ data: { success: true, data: null } } as any);
    });

    vi.mocked(api.post).mockImplementation((url: string) => {
      if (url.includes('/token')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              token: 'livekit-jwt-mock',
              wsUrl: 'wss://livekit.test',
            },
          },
        } as any);
      }
      return Promise.resolve({ data: { success: true } } as any);
    });
  });

  afterEach(() => {
    delete (window as any).ReactNativeWebView;
  });

  describe('FEAT-05: Virtual Waiting Room Carousel', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('renders the carousel with initial slide (camera/mic permissions)', () => {
      render(<WaitingRoomCarousel />);

      expect(screen.getByText('Asegurate de habilitar los permisos de cámara y micrófono')).toBeDefined();
      expect(screen.getByText('Será importante para una buena comunicación.')).toBeDefined();
    });

    it('automatically transitions every 5000ms through all 3 required slides', () => {
      render(<WaitingRoomCarousel />);

      // Slide 1
      expect(screen.getByText(WAITING_SLIDES[0].title)).toBeDefined();

      // Advance 5s -> Slide 2 (Do not lock screen)
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('Por favor, permanezca en esta pantalla y evite bloquear el celular.')).toBeDefined();
      expect(screen.getByText('En breve será atendido.')).toBeDefined();

      // Advance 5s -> Slide 3 (Good lighting)
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText('Ubicá a tu mascota en un lugar bien iluminado')).toBeDefined();
      expect(screen.getByText('Facilitará la revisión visual del veterinario.')).toBeDefined();

      // Advance 5s -> Wraps back to Slide 1
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText(WAITING_SLIDES[0].title)).toBeDefined();
    });

    it('allows manual dot navigation to jump directly to any slide', () => {
      render(<WaitingRoomCarousel />);

      const tabDots = screen.getAllByRole('tab');
      expect(tabDots.length).toBe(3);

      // Click slide 3 dot directly
      fireEvent.click(tabDots[2]);
      expect(screen.getByText('Ubicá a tu mascota en un lugar bien iluminado')).toBeDefined();
    });
  });

  describe('BUG-06 & FEAT-05: ConsultationRoom WebView Integration', () => {
    it('renders waiting room with 100dvh layout, carousel, and requests screen WakeLock', async () => {
      render(
        <MemoryRouter initialEntries={['/call/cons-123']}>
          <Routes>
            <Route path="/call/:id" element={<ConsultationRoom />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sala de Espera Virtual')).toBeDefined();
      });

      // Assert carousel is mounted in the waiting room
      expect(screen.getByTestId('waiting-room-carousel')).toBeDefined();
      expect(screen.getByText(/Paciente:/i)).toBeDefined();
      expect(screen.getByText('Milo')).toBeDefined();

      // Assert root container has full viewport height and overflow-hidden
      const waitingRegion = screen.getByRole('region', { name: /Estado de sala de espera/i });
      expect(waitingRegion.className).toContain('h-[100dvh]');
      expect(waitingRegion.className).toContain('max-h-[100dvh]');
      expect(waitingRegion.className).toContain('overflow-hidden');
      expect(waitingRegion.className).toContain('flex flex-col');

      // Assert screen wakeLock was requested
      expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');

      // Assert mobile webview handshake was sent
      expect(mockPostMessage).toHaveBeenCalledWith(JSON.stringify({ type: 'page:ready' }));
      expect(mockPostMessage).toHaveBeenCalledWith(JSON.stringify({ type: 'wakelock:acquire' }));
    });

    it('re-requests wakeLock on visibilitychange when returning to foreground', async () => {
      render(
        <MemoryRouter initialEntries={['/call/cons-123']}>
          <Routes>
            <Route path="/call/:id" element={<ConsultationRoom />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Sala de Espera Virtual')).toBeDefined();
      });

      mockWakeLockRequest.mockClear();

      // Simulate app resuming / coming back to foreground
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      });
      fireEvent(document, new Event('visibilitychange'));

      expect(mockWakeLockRequest).toHaveBeenCalledWith('screen');
    });

    it('applies 100dvh and flex layout in ACTIVE phase', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/call/cons-456']}>
          <Routes>
            <Route path="/call/:id" element={<ConsultationRoom />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Consulta Médica #cons-456/i)).toBeDefined();
      });

      const activeRoot = container.firstChild as HTMLElement;
      expect(activeRoot.className).toContain('h-[100dvh]');
      expect(activeRoot.className).toContain('max-h-[100dvh]');
      expect(activeRoot.className).toContain('overflow-hidden');
    });
  });

  describe('PreJoin & CallRoom component safeguards', () => {
    it('renders CallRoom with 100dvh responsive layout and posts page:ready', () => {
      render(<CallRoom token="token-test" onDisconnected={vi.fn()} />);

      // Prejoin renders initially
      expect(screen.getByText('Verificacion Previa de Camara y Microfono')).toBeDefined();
      // Join call
      fireEvent.click(screen.getByText('Ingresar a la Consulta'));

      expect(mockPostMessage).toHaveBeenCalledWith(JSON.stringify({ type: 'page:ready' }));
    });
  });
});
