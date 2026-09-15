import prisma from '../lib/prisma';

describe('Prisma Singleton Client', () => {
  it('should instantiate PrismaClient singleton instance', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });

  it('should have all 10 canonical v2.0 models defined on client instance', () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.pet).toBeDefined();
    expect(prisma.consultation).toBeDefined();
    expect(prisma.message).toBeDefined();
    expect(prisma.call).toBeDefined();
    expect(prisma.prescription).toBeDefined();
    expect(prisma.review).toBeDefined();
    expect(prisma.auditLog).toBeDefined();
    expect(prisma.dailyUploadCounter).toBeDefined();
    expect(prisma.mediaFile).toBeDefined();
  });

  it('should have support models defined on client instance', () => {
    expect(prisma.pushToken).toBeDefined();
    expect(prisma.notification).toBeDefined();
  });
});
