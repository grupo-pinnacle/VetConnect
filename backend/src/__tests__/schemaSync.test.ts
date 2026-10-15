import { ensureDatabaseSchema } from '../server';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock('../realtime/socket.server', () => ({
  initializeSocketServer: jest.fn().mockReturnValue({
    close: jest.fn(),
  }),
}));

describe('Self-Healing Database Schema Synchronization', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should skip schema sync during unit tests (NODE_ENV=test)', async () => {
    process.env.NODE_ENV = 'test';
    await ensureDatabaseSchema();
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it('should execute idempotent DDL statements in non-test runtime', async () => {
    process.env.NODE_ENV = 'development';
    await ensureDatabaseSchema();
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE consultations')
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS consultation_audit_log')
    );
  });
});
