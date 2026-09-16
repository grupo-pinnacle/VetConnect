import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '../pages/NotFound';

describe('NotFound Page', () => {
  it('should render 404 code and home navigation button', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByTestId('not-found-code')).toBeDefined();
    expect(screen.getByTestId('not-found-title')).toBeDefined();
    expect(screen.getByTestId('not-found-home-button')).toBeDefined();
  });
});
