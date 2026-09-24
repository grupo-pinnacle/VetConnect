import { useCallback, useEffect, useState } from 'react';
import { fetchPets } from '../services/pets.service';
import { Pet } from '../types';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setPets(await fetchPets());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando mascotas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pets, loading, refreshing, error, refresh, setRefreshing };
}
