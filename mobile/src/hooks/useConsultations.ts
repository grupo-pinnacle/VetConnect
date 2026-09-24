import { useCallback, useEffect, useState } from 'react';
import { fetchMine } from '../services/consultations.service';
import { Consultation } from '../types';

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setConsultations(await fetchMine());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando consultas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { consultations, loading, refreshing, error, refresh, setRefreshing };
}
