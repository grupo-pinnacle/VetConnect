import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import CookiePolicy from '../pages/CookiePolicy';
import RefundPolicy from '../pages/RefundPolicy';
import CookieConsentBanner from '../components/common/CookieConsentBanner';

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: storageMock,
  writable: true,
});

describe('Legal & Compliance Pages Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should render PrivacyPolicy with statutory Ley 25.326 and business details', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    expect(screen.getByText(/Política de Privacidad y Protección de Datos/i)).toBeDefined();
    expect(screen.getAllByText(/Pinnacle Group S\.A\./i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/30-71234567-8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Ley Nacional N° 25\.326/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should render TermsConditions with emergency disclaimer and professional liability', () => {
    render(
      <MemoryRouter>
        <TermsConditions />
      </MemoryRouter>
    );

    expect(screen.getByText(/Términos y Condiciones de Uso/i)).toBeDefined();
    expect(screen.getByText(/Descargo de Responsabilidad por Emergencias Críticas/i)).toBeDefined();
    expect(screen.getByText(/Ley Nacional N° 14\.072/i)).toBeDefined();
  });

  it('should render CookiePolicy with distinction between technical and analytics cookies', () => {
    render(
      <MemoryRouter>
        <CookiePolicy />
      </MemoryRouter>
    );

    expect(screen.getByText(/Política de Cookies y Tecnologías de Almacenamiento/i)).toBeDefined();
    expect(screen.getByText(/Cookies Técnicas y Estrictamente Necesarias/i)).toBeDefined();
    expect(screen.getByText(/refreshToken/i)).toBeDefined();
  });

  it('should render RefundPolicy with 15m triage timeout SLA and consumer rights', () => {
    render(
      <MemoryRouter>
        <RefundPolicy />
      </MemoryRouter>
    );

    expect(screen.getByText(/Política de Reembolsos y Cancelaciones/i)).toBeDefined();
    expect(screen.getByText(/Timeout de Triage \(15 min\)/i)).toBeDefined();
    expect(screen.getByText(/Ley 24\.240/i)).toBeDefined();
  });

  it('should render CookieConsentBanner, accept preferences, and persist to localStorage', () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>
    );

    const banner = screen.getByTestId('cookie-consent-banner');
    expect(banner).toBeDefined();

    const acceptBtn = screen.getByTestId('cookie-accept-all');
    fireEvent.click(acceptBtn);

    const saved = window.localStorage.getItem('vetconnect_cookie_consent');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.analytics).toBe(true);
    expect(parsed.necessary).toBe(true);
  });
});
