import { useState, useEffect, useCallback, useRef } from 'react';
import { imdService, IMDRainfallRecord, IMDResponse } from '../services/imdService';

export function useRainfall(stateId?: string, districtId?: string, pollIntervalMs: number = 300000) {
  const [data, setData] = useState<IMDRainfallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState<boolean>(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res: IMDResponse<IMDRainfallRecord[]> = districtId
        ? await imdService.getDistrictRainfall(districtId)
        : await imdService.getStateRainfall(stateId);

      if (!mountedRef.current) return;

      if (res.status === 'success' || res.status === 'stale') {
        setData(res.data || []);
        setStale(res.stale);
        setFetchedAt(res.fetchedAt);
        setError(res.error ? res.error.message : null);
      } else {
        setError(res.error?.message || 'IMD rainfall statistics unavailable');
        setStale(false);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.message || 'Error fetching IMD rainfall data');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [stateId, districtId]);

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
