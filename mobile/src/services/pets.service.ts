import api, { getApiErrorMessage } from '../lib/api';
import { ApiResponse, Pet } from '../types';
import { petCreateSchema, petUpdateSchema, PetCreateInput, PetUpdateInput } from '../validation/pet';

export async function fetchPets(): Promise<Pet[]> {
  try {
    const res = await api.get<ApiResponse<Pet[]>>('/api/pets');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error cargando mascotas');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error cargando mascotas'));
  }
}

export async function fetchPet(petId: string): Promise<Pet> {
  try {
    const res = await api.get<ApiResponse<Pet>>(`/api/pets/${petId}`);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Mascota no encontrada');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error cargando mascota'));
  }
}

export async function createPet(input: PetCreateInput): Promise<Pet> {
  const parsed = petCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Datos de mascota inválidos');
  }
  try {
    const res = await api.post<ApiResponse<Pet>>('/api/pets', parsed.data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error registrando mascota');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error registrando mascota'));
  }
}

export async function updatePet(petId: string, input: PetUpdateInput): Promise<Pet> {
  const parsed = petUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Datos de mascota inválidos');
  }
  try {
    const res = await api.patch<ApiResponse<Pet>>(`/api/pets/${petId}`, parsed.data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error actualizando mascota');
    }
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error actualizando mascota'));
  }
}

/** Baja lógica (deletedAt). Responde { success, message } sin data. */
export async function removePet(petId: string): Promise<void> {
  try {
    const res = await api.delete<ApiResponse<unknown>>(`/api/pets/${petId}`);
    if (!res.data.success) {
      throw new Error(res.data.error?.message || 'Error eliminando mascota');
    }
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error eliminando mascota'));
  }
}
