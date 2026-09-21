import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initSentry, Sentry } from '../lib/sentry';

describe('Sentry Instrumentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export Sentry instance', () => {
    expect(Sentry).toBeDefined();
    expect(typeof Sentry.init).toBe('function');
  });

  it('should gracefully handle missing VITE_SENTRY_DSN without error', () => {
    expect(() => initSentry()).not.toThrow();
  });
});
