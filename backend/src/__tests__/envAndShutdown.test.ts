import { config } from '../config/env';
import { gracefulShutdown } from '../server';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Backend Fail-Fast Environment Validation & Graceful Shutdown', () => {
  it('should load typed immutable config object', () => {
    expect(config).toBeDefined();
    expect(config.PORT).toBeDefined();
    expect(typeof config.PORT).toBe('number');
  });

  it('should freeze config object preventing mutations', () => {
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('should default NODE_ENV to test in test execution context', () => {
    expect(config.NODE_ENV).toBe('test');
  });

  it('should provide default LiveKit configuration parameters', () => {
    expect(config.LIVEKIT_URL).toBeDefined();
    expect(config.LIVEKIT_API_KEY).toBeDefined();
    expect(config.LIVEKIT_API_SECRET).toBeDefined();
  });

  it('should execute gracefulShutdown cleanly on SIGTERM signal without throwing', async () => {
    await expect(gracefulShutdown('SIGTERM')).resolves.not.toThrow();
  });

  it('should handle idempotent consecutive calls to gracefulShutdown', async () => {
    await expect(gracefulShutdown('SIGINT')).resolves.not.toThrow();
  });
});
