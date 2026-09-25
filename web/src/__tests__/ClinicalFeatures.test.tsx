import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OfflineBanner from '../components/common/OfflineBanner';
import PetDossierModal from '../components/dashboard/PetDossierModal';
import { startRingtone, stopRingtone } from '../lib/ringtone';
import { Pet } from '../types';

describe('Web Audio Ringtone Synthesizer (Zero External Assets)', () => {
  beforeEach(() => {
    stopRingtone();
  });

  afterEach(() => {
    stopRingtone();
  });

  it('initializes AudioContext and stops cleanly without errors', () => {
    // Mock Web Audio API
    const mockOscillator = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockAudioContext = {
      currentTime: 0,
      state: 'running',
      createOscillator: vi.fn(() => ({ ...mockOscillator })),
      createGain: vi.fn(() => ({ ...mockGain })),
      destination: {},
      close: vi.fn(),
    };

    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

    expect(() => startRingtone()).not.toThrow();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();

    expect(() => stopRingtone()).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe('OfflineBanner Component (Network Resilience)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders offline alert when window fires offline event', () => {
    render(<OfflineBanner />);

    // Initially online, banner should not be in the document
    expect(screen.queryByTestId('offline-network-banner')).toBeNull();

    // Trigger offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByTestId('offline-network-banner')).toBeDefined();
    expect(screen.getByText(/Sin conexión a internet/i)).toBeDefined();

    // Trigger online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByTestId('online-reconnected-banner')).toBeDefined();
    expect(screen.getByText(/Conexión restablecida/i)).toBeDefined();

    // After 3.5s auto dismiss
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByTestId('online-reconnected-banner')).toBeNull();
  });
});

describe('PetDossierModal Component (Ley 25.326 & SENASA Compliance)', () => {
  const mockPet: Pet = {
    id: 'pet-clinical-001',
    name: 'Atila',
    species: 'Canino',
    breed: 'Pastor Alemán',
    weightKg: 34.5,
    microchip: '981098109810981',
    allergies: 'Cefalexina, Polen',
    chronicConditions: 'Displasia de Cadera Grado I',
    createdAt: '2021-03-15T10:00:00.000Z',
    updatedAt: '2021-03-15T10:00:00.000Z',
    ownerId: 'user-tutor-001',
    owner: {
      id: 'user-tutor-001',
      firstName: 'Martina',
      lastName: 'Gómez',
      role: 'CLIENT',
      email: 'martina@example.com',
      phone: '+54 11 5555-4321',
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
    },
  };

  it('renders complete clinical dossier with honest calculated data and without PII leakage', () => {
    render(
      <PetDossierModal
        pet={mockPet}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('pet-dossier-modal')).toBeDefined();
    expect(screen.getByTestId('dossier-pet-name').textContent).toContain('Atila');
    expect(screen.getByTestId('dossier-microchip').textContent).toContain('981098109810981');
    expect(screen.getByTestId('dossier-weight').textContent).toContain('34.5 kg');
    expect(screen.getByTestId('dossier-age')).toBeDefined();

    // Allergies and Chronic conditions badges
    expect(screen.getByText(/Cefalexina/i)).toBeDefined();
    expect(screen.getByText('Displasia de Cadera Grado I')).toBeDefined();

    // Tutor name is shown without exposing private sensitive emails in printable header
    expect(screen.getByText(/Martina Gómez/i)).toBeDefined();
    expect(screen.queryByText('martina@example.com')).toBeNull();
  });

  it('handles copy microchip to clipboard with feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <PetDossierModal
        pet={mockPet}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const copyBtn = screen.getByTestId('copy-microchip-btn');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('981098109810981');
    expect(screen.getByText(/¡Copiado!/i)).toBeDefined();
  });
});
