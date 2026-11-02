import prisma from '../lib/prisma';
import { adminCreateUserSchema } from '../modules/admin/admin.schemas';
import { AdminService } from '../modules/admin/admin.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
}));

describe('Bugfix: Admin Create User Email Normalization & Empty Fields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe normalizar email a minúsculas sin espacios y convertir strings vacíos opcionales a null en el schema', () => {
    const rawInput = {
      email: '  Tester.Vet@Ejemplo.com ',
      password: 'Password123!',
      firstName: 'Tester',
      lastName: 'Vet',
      role: 'CLIENT',
      phone: '',
      licenseNumber: '   ',
      bio: '',
    };

    const parsed = adminCreateUserSchema.parse(rawInput);
    expect(parsed.email).toBe('tester.vet@ejemplo.com');
    expect(parsed.phone).toBeNull();
    expect(parsed.licenseNumber).toBeNull();
    expect(parsed.bio).toBeNull();
  });

  it('adminService.createUser debe buscar y persistir el email normalizado en minúsculas', async () => {
    const service = new AdminService();
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      email: 'tester.vet@ejemplo.com',
      firstName: 'Tester',
      lastName: 'Vet',
      phone: null,
      role: 'CLIENT',
      vetStatus: null,
      licenseNumber: null,
      bio: null,
    } as any);

    await service.createUser('admin-1', {
      email: 'Tester.Vet@Ejemplo.com',
      password: 'Password123!',
      firstName: 'Tester',
      lastName: 'Vet',
      role: 'CLIENT',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'tester.vet@ejemplo.com' },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'tester.vet@ejemplo.com',
        }),
      })
    );
  });
});
