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

    expect(screen.getAllByLabelText(/Huellicam, inicio/i).length).toBeGreaterThan(0);
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

    expect(screen.getByText(/Huellicam\. Todos los derechos reservados\./i)).toBeDefined();
    expect(screen.getByText(/Términos y condiciones/i)).toBeDefined();
    expect(screen.getAllByText(/Privacidad/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Preguntas frecuentes/i).length).toBeGreaterThan(0);
  });

  it('should keep FAQ card visible (is-visible intact) and toggle answer when clicked', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const faqRevealSlots = container.querySelectorAll('.faq-item-slot, .faq-item');
    faqRevealSlots.forEach((el) => el.classList.add('is-visible'));

    const questionBtn = screen.getByRole('button', { name: /¿Cómo puedo realizar una consulta\?/i });
    const outerSlot = questionBtn.closest('.faq-item-slot') ?? questionBtn.closest('.faq-item');
    expect(outerSlot).not.toBeNull();
    expect(outerSlot!.classList.contains('is-visible')).toBe(true);

    fireEvent.click(questionBtn);

    const outerSlotAfter = questionBtn.closest('[data-reveal]');
    expect(outerSlotAfter).not.toBeNull();
    expect(outerSlotAfter!.classList.contains('is-visible')).toBe(true);
    expect(questionBtn.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Comenzá desde el botón/i)).toBeDefined();
  });
});
