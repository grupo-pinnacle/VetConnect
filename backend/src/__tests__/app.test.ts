import request from 'supertest';
import app from '../app';

describe('GET /health', () => {
  it('should return 200 OK with health status information', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('database');
  });
});
