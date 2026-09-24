import api, { getApiErrorMessage } from '../lib/api';
import { ApiResponse, User } from '../types';
import { profileUpdateSchema, ProfileUpdateInput } from '../validation/profile';
import { useAuthStore } from '../lib/authStore';

export async function updateProfile(input: ProfileUpdateInput): Promise<User> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Datos de perfil inválidos');
  }
  try {
    const res = await api.patch<ApiResponse<User>>('/api/users/profile', parsed.data);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error actualizando perfil');
    }
    useAuthStore.setState({ user: res.data.data });
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error actualizando perfil'));
  }
}

export async function refreshMe(): Promise<User> {
  try {
    const res = await api.get<ApiResponse<User>>('/api/auth/me');
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error?.message || 'Error cargando perfil');
    }
    useAuthStore.setState({ user: res.data.data });
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Error cargando perfil'));
  }
}
