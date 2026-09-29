import * as Sentry from '@sentry/react';

export const initSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  // Verificar consentimiento de analíticas y telemetría (Ley 25.326 / Cookie Consent)
  let analyticsAllowed = false;
  try {
    const consent = localStorage.getItem('vetconnect_cookie_consent');
    if (consent) {
      const parsed = JSON.parse(consent);
      analyticsAllowed = Boolean(parsed.analytics);
    }
  } catch {
    analyticsAllowed = false;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring (solo habilitado si el usuario consintió analíticas)
    tracesSampleRate: analyticsAllowed ? (import.meta.env.PROD ? 0.2 : 1.0) : 0,
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/api\.vetconnect\.com\.ar/,
      /^https:\/\/.*\.vercel\.app/,
    ],
    // Session Replay (cero grabación sin consentimiento expreso)
    replaysSessionSampleRate: analyticsAllowed ? 0.1 : 0,
    replaysOnErrorSampleRate: analyticsAllowed ? 1.0 : 0,
    environment: import.meta.env.MODE || 'production',
    beforeSend(event) {
      // Minimización de PII: Redactar correos, teléfonos y datos de usuario en eventos
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
      }
      return event;
    },
  });
};

export { Sentry };
