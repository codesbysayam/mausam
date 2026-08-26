import { useState, useEffect, useCallback, useRef } from 'react';
import { imdService, IMDCurrentWeather, IMDResponse } from '../services/imdService';

export function useCurrentWeather(stationId?: string, pollIntervalMs: number = 60000) {
  const [data, setData] = useState<IMDCurrentWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState<boolean>(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res: IMDResponse<IMDCurrentWeather> = await imdService.getCurrentWeather(stationId);
      if (!mountedRef.current) return;

      if (res.status === 'success' || res.status === 'stale') {
        setData(res.data);
        setStale(res.stale);
        setFetchedAt(res.fetchedAt);
        setError(res.error ? res.error.message : null);
      } else {
        setError(res.error?.message || 'IMD current weather data unavailable');
        setStale(false);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Network error fetching IMD current weather');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [stationId]);

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
    data,
    loading,
    error,
    stale,
    fetchedAt,
    isRefreshing,
    refresh: () => fetchData(true),
  };
}
