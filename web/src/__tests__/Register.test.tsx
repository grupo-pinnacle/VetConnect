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
  });
});
