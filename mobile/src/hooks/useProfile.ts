import { useCallback, useState } from 'react';
import { updateProfile } from '../services/users.service';
import { useAuthStore } from '../lib/authStore';
import { ProfileUpdateInput } from '../validation/profile';

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (input: ProfileUpdateInput) => {
    setSaving(true);
    setError(null);
    try {
      return await updateProfile(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error actualizando perfil';
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const setOnline = useCallback(
    (isOnline: boolean) => save({ isOnline }),
    [save]
  );

  return { user, saving, error, save, setOnline };
}
