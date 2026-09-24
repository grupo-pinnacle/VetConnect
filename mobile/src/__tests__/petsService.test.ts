import { fetchPets, createPet, removePet } from '../services/pets.service';
import api from '../lib/api';

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  getApiErrorMessage: jest.fn((err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback
  ),
}));

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};

describe('Mobile pets.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch pet list on success', async () => {
    mockedApi.get.mockResolvedValue({ data: { success: true, data: [{ id: 'p1' }] } });
    await expect(fetchPets()).resolves.toEqual([{ id: 'p1' }]);
    expect(mockedApi.get).toHaveBeenCalledWith('/api/pets');
  });

  it('should reject invalid create payloads before hitting the network', async () => {
    await expect(
      createPet({ name: '', species: 'Canino', breed: 'Labrador' })
    ).rejects.toThrow();
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('should surface backend errors on remove', async () => {
    mockedApi.delete.mockResolvedValue({
      data: { success: false, error: { message: 'No autorizado', code: 'X', timestamp: '' } },
    });
    await expect(removePet('p1')).rejects.toThrow('No autorizado');
  });
});
