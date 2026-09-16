import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../pages/Login';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ role: 'CLIENT' }),
  }),
}));

describe('Login Page', () => {
  it('should render login form inputs and submit button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('ejemplo@vetconnect.com')).toBeDefined();
    expect(screen.getByPlaceholderText('********')).toBeDefined();
    expect(screen.getByText('Iniciar Sesión')).toBeDefined();
  });
});
