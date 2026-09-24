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

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el adjunto'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

/**
 * Descarga autenticada (sigue el 302 a presigned/S3 o stream local) y la
 * expone como data URL para <Image/>. Evita URLs firmadas en logs/estado.
 */
export async function fetchMediaDataUrl(mediaId: string): Promise<{ dataUrl: string; mime: string }> {
  try {
    const res = await api.get<ArrayBuffer>(`/api/media/${mediaId}`, {
      responseType: 'arraybuffer',
    });
    const mime = String(res.headers?.['content-type'] || 'image/jpeg');
    const bytes = new Uint8Array(res.data);
    const blob = new Blob([bytes], { type: mime });
    return { dataUrl: await blobToDataUrl(blob), mime };
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'No se pudo descargar el adjunto'));
  }
}
