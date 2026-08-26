/**
 * Unified IMD Weather Hook
 * Implements centralized polling manager (60,000ms interval), AbortController,
 * cache-first immediate rendering, and normalized weather state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { imdClient, IMDResponse } from '../services/imd/imdClient';
import {
  IMDNormalizedCurrentWeather,
  IMDNormalizedCityForecast,
  IMDNormalizedDistrictWarning,
} from '../services/imd/imdNormalizer';

export interface IMDLocationInfo {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  type?: string;
}

export interface IMDWeatherState {
  status: 'live' | 'cached' | 'loading' | 'error';
  location: IMDLocationInfo;
  currentWeather: IMDNormalizedCurrentWeather | null;
  forecast: IMDNormalizedCityForecast | null;
  warnings: IMDNormalizedDistrictWarning[];
  rainfall: any | null;
  lastUpdated: string | null;
  error: { code: string; message: string } | null;
  refetch: () => Promise<void>;
  isLoading: boolean;
  isRaining: boolean;
}

const DEFAULT_STATION: IMDLocationInfo = {
  id: '42971',
  name: 'Bhubaneswar',
  state: 'Odisha',
  latitude: 20.2961,
  longitude: 85.8245,
  type: 'city',
};

const POLL_INTERVAL = 60000; // 60,000 ms per specification

export function useIMDWeather(targetLocation?: Partial<IMDLocationInfo>): IMDWeatherState {
  const station: IMDLocationInfo = {
    id: targetLocation?.id || '42971',
    name: targetLocation?.name || 'Bhubaneswar',
    state: targetLocation?.state || 'Odisha',
    latitude: targetLocation?.latitude || 20.2961,
    longitude: targetLocation?.longitude || 85.8245,
    type: targetLocation?.type || 'city',
  };

  const [state, setState] = useState<{
    status: 'live' | 'cached' | 'loading' | 'error';
    currentWeather: IMDNormalizedCurrentWeather | null;
    forecast: IMDNormalizedCityForecast | null;
    warnings: IMDNormalizedDistrictWarning[];
    rainfall: any | null;
    lastUpdated: string | null;
    error: { code: string; message: string } | null;
  }>({
    status: 'loading',
    currentWeather: null,
    forecast: null,
    warnings: [],
    rainfall: null,
    lastUpdated: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchWeatherData = useCallback(async () => {
    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Fetch current weather and city forecast concurrently via central connector
      const [currentRes, forecastRes, warningsRes] = await Promise.allSettled([
        imdClient.getCurrentWeather(station.id),
        imdClient.getCityForecast(station.id),
        fetch(`/api/imd/district-warning?id=${station.id}`).then((r) => r.json()),
      ]);

      if (!isMountedRef.current) return;

      const currentData = currentRes.status === 'fulfilled' ? currentRes.value.data : null;
      const forecastData = forecastRes.status === 'fulfilled' ? forecastRes.value.data : null;
      const warningsData =
        warningsRes.status === 'fulfilled' && warningsRes.value?.data ? warningsRes.value.data : [];

      const hasError =
        (currentRes.status === 'rejected' || (currentRes.status === 'fulfilled' && currentRes.value.status === 'error')) &&
        (forecastRes.status === 'rejected' || (forecastRes.status === 'fulfilled' && forecastRes.value.status === 'error'));

      const isCached =
        (currentRes.status === 'fulfilled' && currentRes.value.status === 'cached') ||
        (forecastRes.status === 'fulfilled' && forecastRes.value.status === 'cached');

      const latestTimestamp =
        (currentRes.status === 'fulfilled' && currentRes.value.lastUpdated) ||
        (forecastRes.status === 'fulfilled' && forecastRes.value.lastUpdated) ||
        new Date().toISOString();

      setState((prev) => ({
        status: hasError ? 'error' : isCached ? 'cached' : 'live',
        currentWeather: currentData || prev.currentWeather,
        forecast: forecastData || prev.forecast,
        warnings: Array.isArray(warningsData) ? warningsData : prev.warnings,
        rainfall: currentData?.rainfall24hMm ?? prev.rainfall,
        lastUpdated: latestTimestamp,
        error: hasError
          ? {
              code: 'IMD_DATA_UNAVAILABLE',
              message: 'IMD live telemetry is temporarily unavailable. Displaying cached data if available.',
            }
          : null,
      }));
    } catch (err: any) {
      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          status: prev.currentWeather ? 'cached' : 'error',
          error: {
            code: 'FETCH_ERROR',
            message: err.message || 'Failed to communicate with IMD connector.',
          },
        }));
      }
    }
  }, [station.id]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchWeatherData();

    // Single polling loop every 60s
    const timer = setInterval(() => {
      fetchWeatherData();
    }, POLL_INTERVAL);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchWeatherData]);

  const isRaining = Boolean(
    state.currentWeather?.isRaining ||
    (state.currentWeather?.rainfall24hMm && state.currentWeather.rainfall24hMm > 0) ||
    state.forecast?.today?.forecast?.toLowerCase().includes('rain')
  );

  return {
    status: state.status,
    location: station,
    currentWeather: state.currentWeather,
    forecast: state.forecast,
    warnings: state.warnings,
    rainfall: state.rainfall,
    lastUpdated: state.lastUpdated,
    error: state.error,
    refetch: fetchWeatherData,
    isLoading: state.status === 'loading',
    isRaining,
  };
}
