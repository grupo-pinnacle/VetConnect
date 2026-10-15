import request from 'supertest';
import app from '../app';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

describe('CORS Preflight & Header Policy', () => {
  it('should allow X-Device-Id in CORS preflight response headers', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type, x-device-id');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-headers']).toBeDefined();
    
    const allowedHeaders = res.headers['access-control-allow-headers'].toLowerCase();
    expect(allowedHeaders).toContain('x-device-id');
    expect(allowedHeaders).toContain('content-type');
  });

  it('should allow GET /api/auth/me preflight from localhost:5173', async () => {
    const res = await request(app)
      .options('/api/auth/me')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization, x-device-id');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const allowedHeaders = res.headers['access-control-allow-headers'].toLowerCase();
    expect(allowedHeaders).toContain('x-device-id');
    expect(allowedHeaders).toContain('authorization');
  });
});
