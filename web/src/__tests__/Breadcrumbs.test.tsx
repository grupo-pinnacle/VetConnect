import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

describe('Breadcrumbs Component', () => {
  it('should render navigation links and chevron separators with aria-hidden="true"', () => {
    const items = [
      { label: 'Inicio', path: '/' },
      { label: 'Mascotas', path: '/pets' },
      { label: 'Milo' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    // Verify navigation landmarks and links
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeDefined();

    const firstLink = screen.getByTestId('breadcrumb-link-0');
    expect(firstLink.textContent).toBe('Inicio');
    expect(firstLink.getAttribute('href')).toBe('/');

    const secondLink = screen.getByTestId('breadcrumb-link-1');
    expect(secondLink.textContent).toBe('Mascotas');
    expect(secondLink.getAttribute('href')).toBe('/pets');

    // Verify chevron separators with aria-hidden="true"
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBe(2);
  });

  it('should mark the last item with aria-current="page" and non-interactive text', () => {
    const items = [
      { label: 'Inicio', path: '/' },
      { label: 'Triage' },
    ];

    render(<Breadcrumbs items={items} />);

    const currentItem = screen.getByTestId('breadcrumb-current');
    expect(currentItem).toBeDefined();
    expect(currentItem.textContent).toBe('Triage');
    expect(currentItem.getAttribute('aria-current')).toBe('page');
    // Ensure the last item is not an anchor tag
    expect(currentItem.tagName.toLowerCase()).toBe('span');
  });
});
