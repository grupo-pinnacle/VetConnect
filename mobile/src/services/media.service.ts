import api, { getApiErrorMessage } from '../lib/api';
import { ApiResponse, MediaFile } from '../types';

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB — espejo de media.middleware.ts:27

export async function uploadMediaFile(
  fileUri: string,
  fileName: string,
  mimeType: string,
  consultationId?: string
): Promise<MediaFile> {
  const form = new FormData();
  form.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);
  if (consultationId) form.append('consultationId', consultationId);

  try {
    const res = await api.post<ApiResponse<MediaFile>>('/api/media', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error al subir archivo');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error al subir archivo'));
  }
}

export function mimeFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'pdf') return 'application/pdf';
  return 'image/jpeg';
}
