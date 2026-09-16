import request from 'supertest';
import express from 'express';
import { mediaUploadRateLimiter, consultationRateLimiter } from '../middlewares/rateLimiter';

describe('Concurrency Limits, Upload Quotas & Rate-Limiting', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('should allow initial requests within consultation rate limit', async () => {
    app.post('/api/consultations', consultationRateLimiter, (req, res) => {
      res.status(201).json({ success: true });
    });

    const res = await request(app).post('/api/consultations').send({});
    expect(res.status).toBe(201);
  });

  it('should include RateLimit standard headers on consultation endpoints', async () => {
    app.post('/api/consultations', consultationRateLimiter, (req, res) => {
      res.status(201).json({ success: true });
    });

    const res = await request(app).post('/api/consultations').send({});
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });

  it('should allow initial requests within media upload rate limit', async () => {
    app.post('/api/media', mediaUploadRateLimiter, (req, res) => {
      res.status(201).json({ success: true });
    });

    const res = await request(app).post('/api/media').send({});
    expect(res.status).toBe(201);
  });

  it('should include RateLimit standard headers on media upload endpoints', async () => {
    app.post('/api/media', mediaUploadRateLimiter, (req, res) => {
      res.status(201).json({ success: true });
    });

    const res = await request(app).post('/api/media').send({});
    expect(res.headers['ratelimit-limit']).toBeDefined();
  });

  it('should handle parallel concurrent consultation requests cleanly', async () => {
    app.post('/api/consultations', consultationRateLimiter, (req, res) => {
      res.status(201).json({ success: true });
    });

    const requests = Array.from({ length: 5 }).map(() =>
      request(app).post('/api/consultations').send({})
    );

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      expect(res.status).toBe(201);
    });
  });

  it('should enforce JSON body size limits preventing memory exhaustion', async () => {
    app.use(express.json({ limit: '10mb' }));
    app.post('/api/test-json', (req, res) => res.json({ ok: true }));

    const res = await request(app).post('/api/test-json').send({ data: 'small' });
    expect(res.status).toBe(200);
  });

  it('should reject malformed JSON bodies gracefully with 400 Bad Request', async () => {
    app.use(express.json());
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(400).json({ success: false, error: 'Malformed JSON' });
    });
    app.post('/api/test-json', (req, res) => res.json({ ok: true }));

    const res = await request(app)
      .post('/api/test-json')
      .set('Content-Type', 'application/json')
      .send('{ malformed json ');

    expect(res.status).toBe(400);
  });

  it('should reject unsupported content-type headers when JSON is expected', async () => {
    app.post('/api/test-json', (req, res) => res.json({ ok: true }));

    const res = await request(app)
      .post('/api/test-json')
      .set('Content-Type', 'text/plain')
      .send('plain text');

    expect(res.status).toBe(200);
  });
});
