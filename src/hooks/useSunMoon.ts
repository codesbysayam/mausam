import { useState, useEffect, useCallback, useRef } from 'react';
import { imdService, IMDSunMoon, IMDResponse } from '../services/imdService';

export function useSunMoon(lat: number = 20.2961, lon: number = 85.8245) {
  const [data, setData] = useState<IMDSunMoon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res: IMDResponse<IMDSunMoon> = await imdService.getSunMoon(lat, lon);
      if (!mountedRef.current) return;

      if (res.status === 'success' || res.status === 'stale') {
        setData(res.data);
        setFetchedAt(res.fetchedAt);
      } else {
        setError(res.error?.message || 'IMD Sun/Moon data unavailable');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err.message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [lat, lon]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, fetchedAt, refresh: fetchData };
}
