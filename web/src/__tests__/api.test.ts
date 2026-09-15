import { describe, it, expect, vi } from 'vitest';
import api from '../services/api';

describe('Web API Client (Axios Interceptor)', () => {
  it('should be configured with withCredentials true', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('should have default headers Content-Type application/json', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});
