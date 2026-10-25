import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register, REGISTER_DRAFT_KEY, getRegisterDraft, saveRegisterDraft, clearRegisterDraft } from '../pages/Register';
import AuthExperience from '../pages/AuthExperience';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockRegister = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    register: mockRegister,
    refreshSession: vi.fn(),
  }),
}));

describe('BUG-02 (WebView Ready): Register Draft Persistence & Background Revalidation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Draft helpers and security', () => {
    it('saves draft but never persists plain text password', () => {
      saveRegisterDraft({
        firstName: 'Carlos',
        lastName: 'Perez',
        email: 'carlos@test.com',
        phone: '+541112345678',
        role: 'CLIENT',
        // @ts-expect-error test security exclusion
        password: 'SuperSecretPassword123!',
      });

      const draft = getRegisterDraft();
      expect(draft).not.toBeNull();
      expect(draft?.firstName).toBe('Carlos');
      expect(draft?.email).toBe('carlos@test.com');
      expect((draft as any)?.password).toBeUndefined();

      const raw = localStorage.getItem(REGISTER_DRAFT_KEY);
      expect(raw).not.toContain('SuperSecretPassword123!');
    });
  });

  describe('Register component (Register.tsx)', () => {
    it('restores draft inputs on mount when returning to the form', () => {
      localStorage.setItem(
        REGISTER_DRAFT_KEY,
        JSON.stringify({
          firstName: 'Mariana',
          lastName: 'Lopez',
          email: 'mariana@vet.com',
          phone: '+5491122334455',
          role: 'VET',
          licenseNumber: 'MP-9941',
          acceptedTerms: true,
        })
      );

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      const firstNameInput = screen.getByPlaceholderText('Ej. Lucía') as HTMLInputElement;
      const lastNameInput = screen.getByPlaceholderText('Ej. Gómez') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('tu@email.com') as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText('+54 11 1234-5678') as HTMLInputElement;
      const licenseInput = screen.getByPlaceholderText('Ej. MP-8921') as HTMLInputElement;

      expect(firstNameInput.value).toBe('Mariana');
      expect(lastNameInput.value).toBe('Lopez');
      expect(emailInput.value).toBe('mariana@vet.com');
      expect(phoneInput.value).toBe('+5491122334455');
      expect(licenseInput.value).toBe('MP-9941');
    });

    it('flushes draft to localStorage on visibilitychange (when minimizing app to background)', () => {
      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      const firstNameInput = screen.getByPlaceholderText('Ej. Lucía');
      fireEvent.change(firstNameInput, { target: { value: 'Federico' } });

      const emailInput = screen.getByPlaceholderText('tu@email.com');
      fireEvent.change(emailInput, { target: { value: 'fede@example.com' } });

      // Simulate app minimizing / background event
      document.dispatchEvent(new Event('visibilitychange'));

      const saved = getRegisterDraft();
      expect(saved?.firstName).toBe('Federico');
      expect(saved?.email).toBe('fede@example.com');
    });

    it('clears draft from localStorage ONLY after successful registration', async () => {
      mockRegister.mockResolvedValueOnce({ id: 'u1', role: 'CLIENT' });

      localStorage.setItem(
        REGISTER_DRAFT_KEY,
        JSON.stringify({
          firstName: 'Ana',
          lastName: 'Rios',
          email: 'ana@example.com',
          role: 'CLIENT',
        })
      );

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      );

      const passwordInput = screen.getByPlaceholderText('Mínimo 8 caracteres');
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });

      const termsCheckbox = screen.getByRole('checkbox');
      fireEvent.click(termsCheckbox);

      const submitBtn = screen.getByRole('button', { name: /crear cuenta/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Ana',
            lastName: 'Rios',
            email: 'ana@example.com',
          })
        );
        expect(getRegisterDraft()).toBeNull();
      });
    });
  });

  describe('AuthExperience (AuthExperience.tsx multi-step draft)', () => {
    it('restores step and professional fields in VetRegister from draft', () => {
      // Mock window.location.pathname for AuthExperience
      window.history.pushState({}, '', '/register/veterinarian');

      localStorage.setItem(
        REGISTER_DRAFT_KEY,
        JSON.stringify({
          role: 'VET',
          firstName: 'Doctora',
          lastName: 'Sanchez',
          email: 'doctora@clinica.com',
          phone: '+541155554444',
          licenseNumber: 'MN-4412',
          province: 'CABA',
          specialty: 'Clínica general',
          experienceYears: '8',
          step: 2,
        })
      );

      render(
        <MemoryRouter>
          <AuthExperience />
        </MemoryRouter>
      );

      expect(screen.getAllByText('Información profesional').length).toBeGreaterThan(0);
      const licenseInput = screen.getByPlaceholderText('Ej. MP 12345') as HTMLInputElement;
      expect(licenseInput.value).toBe('MN-4412');
    });
  });
});
