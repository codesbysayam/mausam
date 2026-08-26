import { useState, useEffect, useCallback, useRef } from 'react';
import { imdService, IMDDistrictWarning, IMDResponse } from '../services/imdService';

export function useWarnings(districtId?: string, pollIntervalMs: number = 60000) {
  const [warnings, setWarnings] = useState<IMDDistrictWarning[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState<boolean>(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res: IMDResponse<IMDDistrictWarning[]> = await imdService.getDistrictWarnings(districtId);
      if (!mountedRef.current) return;

      if (res.status === 'success' || res.status === 'stale') {
        setWarnings(res.data || []);
        setStale(res.stale);
        setFetchedAt(res.fetchedAt);
        setError(res.error ? res.error.message : null);
      } else {
        setError(res.error?.message || 'IMD warning bulletin unavailable');
        setStale(false);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Error fetching IMD warnings');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [districtId]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchData();

    if (pollIntervalMs > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, pollIntervalMs);
      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, pollIntervalMs]);

  return {
    warnings,
    loading,
    error,
    stale,
    fetchedAt,
    isRefreshing,
    refresh: () => fetchData(true),
  };
}
