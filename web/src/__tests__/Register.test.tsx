import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from '../pages/Register';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn().mockResolvedValue({ role: 'CLIENT' }),
  }),
}));

describe('Register Page', () => {
  it('should render registration form inputs', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Registro en VetConnect')).toBeDefined();
    expect(screen.getByText('Crear Cuenta')).toBeDefined();
    expect(screen.getByLabelText(/He leído y acepto los/i)).toBeDefined();
  });

  it('should require accepting terms and conditions before submitting', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const checkbox = screen.getByLabelText(/He leído y acepto los/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(checkbox.required).toBe(true);
  });
});
