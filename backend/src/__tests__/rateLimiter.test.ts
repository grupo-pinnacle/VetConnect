import request from 'supertest';
import express from 'express';
import { mediaUploadRateLimiter, consultationRateLimiter } from '../middlewares/rateLimiter';

describe('Dedicated Rate Limiters Middleware', () => {
  it('should export mediaUploadRateLimiter and consultationRateLimiter functions', () => {
    expect(mediaUploadRateLimiter).toBeDefined();
    expect(consultationRateLimiter).toBeDefined();
    expect(typeof mediaUploadRateLimiter).toBe('function');
    expect(typeof consultationRateLimiter).toBe('function');
  });

  it('should attach rate limit headers on express responses', async () => {
    const testApp = express();
    testApp.use('/test-rate', consultationRateLimiter, (req, res) => {
      res.json({ ok: true });
    });

    const res = await request(testApp).get('/test-rate');
    expect(res.status).toBe(200);
    expect(res.headers['ratelimit-limit']).toBeDefined();
  });
});
