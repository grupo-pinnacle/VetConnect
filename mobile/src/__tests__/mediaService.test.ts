import {
  MAX_FILE_BYTES,
  validateFileSize,
  validateFileType,
  mimeFromExtension,
  uploadMediaFile,
} from '../services/media.service';
import api from '../lib/api';

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
  getApiErrorMessage: jest.fn((err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback
  ),
}));

const mockedApi = api as unknown as {
  post: jest.Mock;
  get: jest.Mock;
};

describe('Mobile media.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFileSize', () => {
    it('accepts file sizes within limit', () => {
      expect(() => validateFileSize(1024)).not.toThrow();
      expect(() => validateFileSize(MAX_FILE_BYTES)).not.toThrow();
      expect(() => validateFileSize(undefined)).not.toThrow();
    });

    it('rejects file sizes exceeding 10 MB', () => {
      expect(() => validateFileSize(MAX_FILE_BYTES + 1)).toThrow(
        'El archivo supera el tamaño máximo permitido de 10 MB.'
      );
    });
  });

  describe('validateFileType', () => {
    it('accepts allowed mime types (jpeg, png, pdf)', () => {
      expect(() => validateFileType('image/jpeg')).not.toThrow();
      expect(() => validateFileType('image/png')).not.toThrow();
      expect(() => validateFileType('application/pdf')).not.toThrow();
    });

    it('rejects disallowed mime types', () => {
      expect(() => validateFileType('video/mp4')).toThrow(
        'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y PDF.'
      );
      expect(() => validateFileType('application/zip')).toThrow(
        'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y PDF.'
      );
    });
  });

  describe('mimeFromExtension', () => {
    it('resolves correct mime types by file extension', () => {
      expect(mimeFromExtension('photo.png')).toBe('image/png');
      expect(mimeFromExtension('doc.pdf')).toBe('application/pdf');
      expect(mimeFromExtension('image.jpg')).toBe('image/jpeg');
      expect(mimeFromExtension('image.jpeg')).toBe('image/jpeg');
      expect(mimeFromExtension('unknown')).toBe('image/jpeg');
    });
  });

  describe('uploadMediaFile', () => {
    it('rejects oversized file before hitting the network', async () => {
      await expect(
        uploadMediaFile('file://path/test.png', 'test.png', 'image/png', undefined, MAX_FILE_BYTES + 10)
      ).rejects.toThrow('El archivo supera el tamaño máximo permitido de 10 MB.');
      expect(mockedApi.post).not.toHaveBeenCalled();
    });

    it('rejects invalid mime type before hitting the network', async () => {
      await expect(
        uploadMediaFile('file://path/test.exe', 'test.exe', 'application/x-msdownload')
      ).rejects.toThrow('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y PDF.');
      expect(mockedApi.post).not.toHaveBeenCalled();
    });

    it('uploads file successfully with multipart/form-data', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 'media-1',
            fileName: 'sample.pdf',
            fileSize: 2048,
            mimeType: 'application/pdf',
            createdAt: '2026-09-30T00:00:00.000Z',
          },
        },
      });

      const result = await uploadMediaFile(
        'file://path/sample.pdf',
        'sample.pdf',
        'application/pdf',
        'cons-123',
        2048
      );

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/media',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result.id).toBe('media-1');
      expect(result.mimeType).toBe('application/pdf');
    });
  });
});
