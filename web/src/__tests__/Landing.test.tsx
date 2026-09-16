import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';

describe('Landing Page', () => {
  it('should render brand logo and SENASA trust badge', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByTestId('brand-logo')).toBeDefined();
    expect(screen.getByTestId('trust-badge-senasa')).toBeDefined();
    expect(screen.getByTestId('hero-title')).toBeDefined();
  });

  it('should render all portal CTA buttons and mobile APK download link', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByTestId('cta-client-portal')).toBeDefined();
    expect(screen.getByTestId('cta-vet-portal')).toBeDefined();
    expect(screen.getByTestId('cta-admin-portal')).toBeDefined();
    expect(screen.getByTestId('download-apk-link')).toBeDefined();
  });
});
