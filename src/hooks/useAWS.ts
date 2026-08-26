import { useState, useEffect, useCallback, useRef } from 'react';
import { imdService, IMDAWSStation, IMDResponse } from '../services/imdService';

export function useAWS(stationId?: string, stateId?: string, pollIntervalMs: number = 60000) {
  const [stations, setStations] = useState<IMDAWSStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState<boolean>(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res: IMDResponse<IMDAWSStation[]> = await imdService.getAWSData(stationId, stateId);
      if (!mountedRef.current) return;

      if (res.status === 'success' || res.status === 'stale') {
        setStations(res.data || []);
        setStale(res.stale);
        setFetchedAt(res.fetchedAt);
        setError(res.error ? res.error.message : null);
      } else {
        setError(res.error?.message || 'IMD AWS network telemetry unavailable');
        setStale(false);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Error connecting to IMD AWS network');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [stationId, stateId]);

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
    stations,
    loading,
    error,
    stale,
    fetchedAt,
    isRefreshing,
    refresh: () => fetchData(true),
  };
}
