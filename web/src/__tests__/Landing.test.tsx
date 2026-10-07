import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';

describe('Landing Page', () => {
  it('should render brand logo, navigation and hero title', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getAllByLabelText(/VetConnect, inicio/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Atención veterinaria online/i)).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText(/Conectados\./i)).toBeDefined();
  });

  it('should render CTA buttons for registration and login', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Comenzar consulta/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ingresar/i)).toBeDefined();
    expect(screen.getAllByText(/Cómo funciona/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Para veterinarios/i).length).toBeGreaterThan(0);
  });

  it('should render footer sections, copyright and terms', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText(/VetConnect\. Todos los derechos reservados\./i)).toBeDefined();
    expect(screen.getByText(/Términos y condiciones/i)).toBeDefined();
    expect(screen.getAllByText(/Privacidad/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Preguntas frecuentes/i).length).toBeGreaterThan(0);
  });
});
