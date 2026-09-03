import { useState, useCallback, useEffect } from 'react';
import { LocationRecord } from '../types';
import { locationService } from '../services/locationService';
import {
  geolocationService,
  ResolvedUserLocation,
  GeolocationServiceError,
  NearestStationResult,
} from '../services/geolocationService';

export type LocatingPhase =
  | 'idle'
  | 'prompting'
  | 'locating'
  | 'geocoding'
  | 'success'
  | 'error';

export interface UseUserLocationReturn {
  selectedLocation: LocationRecord;
  locationSource: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  isLocating: boolean;
  locatePhase: LocatingPhase;
  locateError: GeolocationServiceError | null;
  accuracyMeters: number | null;
  lastDetectedAt: Date | null;
  nearestStationInfo: NearestStationResult | null;
  isGeolocationSupported: boolean;
  detectLocation: (forceRefresh?: boolean) => Promise<LocationRecord | null>;
  selectLocation: (loc: LocationRecord, source?: 'DEVICE_GPS' | 'MANUAL_SEARCH') => void;
  clearSavedLocation: () => void;
  resetError: () => void;
}

export function useUserLocation(
  onLocationChanged?: (loc: LocationRecord) => void
): UseUserLocationReturn {
  const [selectedLocation, setSelectedLocationState] = useState<LocationRecord>(() =>
    locationService.getSelectedLocation()
  );

  const [locationSource, setLocationSource] = useState<'DEVICE_GPS' | 'MANUAL_SEARCH'>(() =>
    locationService.getLocationSource()
  );

  const [isLocating, setIsLocating] = useState(false);
  const [locatePhase, setLocatePhase] = useState<LocatingPhase>('idle');
  const [locateError, setLocateError] = useState<GeolocationServiceError | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(() => {
    const saved = geolocationService.getSavedDetectedLocation();
    return saved ? saved.rawCoordinates.accuracy : null;
  });
  const [lastDetectedAt, setLastDetectedAt] = useState<Date | null>(() => {
    const saved = geolocationService.getSavedDetectedLocation();
    return saved ? saved.detectedAt : null;
  });
  const [nearestStationInfo, setNearestStationInfo] = useState<NearestStationResult | null>(() => {
    const saved = geolocationService.getSavedDetectedLocation();
    return saved ? saved.nearestStation : null;
  });

  const isGeolocationSupported = geolocationService.isGeolocationSupported();

  const resetError = useCallback(() => {
    setLocateError(null);
    setLocatePhase('idle');
  }, []);

  const selectLocation = useCallback(
    (loc: LocationRecord, source: 'DEVICE_GPS' | 'MANUAL_SEARCH' = 'MANUAL_SEARCH') => {
      const updated = locationService.setSelectedLocation(loc, source);
      setSelectedLocationState(updated);
      setLocationSource(source);
      resetError();
      if (source === 'MANUAL_SEARCH') {
        setAccuracyMeters(null);
      }
      if (onLocationChanged) {
        onLocationChanged(updated);
      }
    },
    [onLocationChanged, resetError]
  );

  const detectLocation = useCallback(
    async (forceRefresh = false): Promise<LocationRecord | null> => {
      if (!isGeolocationSupported) {
        const err: GeolocationServiceError = {
          code: 'UNSUPPORTED',
          message: 'Browser Geolocation is not supported in this environment.',
          instruction: 'Please select or search your city manually.',
        };
        setLocateError(err);
        setLocatePhase('error');
        return null;
      }

      setIsLocating(true);
      setLocatePhase('locating');
      setLocateError(null);

      try {
        setLocatePhase('locating');
        const resolved: ResolvedUserLocation = await geolocationService.detectUserLocation(forceRefresh);

        setLocatePhase('geocoding');
        // Brief visual transition for UI responsiveness
        await new Promise((r) => setTimeout(r, 200));

        setAccuracyMeters(resolved.rawCoordinates.accuracy);
        setLastDetectedAt(resolved.detectedAt);
        setNearestStationInfo(resolved.nearestStation);
        setLocationSource('DEVICE_GPS');

        const updated = locationService.setSelectedLocation(resolved.record, 'DEVICE_GPS');
        setSelectedLocationState(updated);
        setLocatePhase('success');

        if (onLocationChanged) {
          onLocationChanged(updated);
        }

        // Return to idle state after showing success feedback
        setTimeout(() => {
          setLocatePhase('idle');
        }, 2500);

        return updated;
      } catch (err: any) {
        console.debug('[useUserLocation] Geolocation info/status:', err);
        const geoError: GeolocationServiceError = err.code
          ? err
          : {
              code: 'UNKNOWN',
              message: err.message || 'Failed to detect location.',
              instruction: 'Please check your device settings or search manually.',
            };
        setLocateError(geoError);
        setLocatePhase('error');
        return null;
      } finally {
        setIsLocating(false);
      }
    },
    [isGeolocationSupported, onLocationChanged]
  );

  const clearSavedLocation = useCallback(() => {
    geolocationService.clearSavedLocation();
    locationService.clearSavedLocation();
    const fallback = locationService.getPrimaryLocation();
    setSelectedLocationState(fallback);
    setLocationSource('MANUAL_SEARCH');
    setAccuracyMeters(null);
    setLastDetectedAt(null);
    setNearestStationInfo(null);
    resetError();
    if (onLocationChanged) {
      onLocationChanged(fallback);
    }
  }, [onLocationChanged, resetError]);

  return {
    selectedLocation,
    locationSource,
    isLocating,
    locatePhase,
    locateError,
    accuracyMeters,
    lastDetectedAt,
    nearestStationInfo,
    isGeolocationSupported,
    detectLocation,
    selectLocation,
    clearSavedLocation,
    resetError,
  };
}
