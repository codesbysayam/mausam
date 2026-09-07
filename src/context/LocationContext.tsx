import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LocationRecord } from '../types';
import {
  useUserLocation,
  LocatingPhase,
} from '../hooks/useUserLocation';
import {
  GeolocationServiceError,
  NearestStationResult,
} from '../services/geolocationService';

export type GpsStatus =
  | 'GPS ACTIVE'
  | 'LOCATION DETECTED'
  | 'REQUESTING LOCATION'
  | 'LOCATION PERMISSION DENIED'
  | 'LOCATION UNAVAILABLE';

export interface LocationContextType {
  // Required stored fields per user specification
  latitude: number;
  longitude: number;
  placeName: string;
  state: string;
  country: string;
  nearestObservationStation: string;
  gpsStatus: GpsStatus;
  lastUpdatedTime: Date | null;

  // Additional context metadata & helpers
  location: LocationRecord;
  coordinatesFormatted: string;
  accuracyMeters: number | null;
  locationSource: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  isLocating: boolean;
  locatePhase: LocatingPhase;
  locateError: GeolocationServiceError | null;
  nearestStationInfo: NearestStationResult | null;
  isGeolocationSupported: boolean;

  // Actions
  refreshLocation: (forceGps?: boolean) => Promise<LocationRecord | null>;
  changeLocation: (location: LocationRecord, source?: 'DEVICE_GPS' | 'MANUAL_SEARCH') => void;
  clearSavedLocation: () => void;
  resetError: () => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  isLocationModalOpen: boolean;
  openPrivacyModal: () => void;
  closePrivacyModal: () => void;
  isPrivacyModalOpen: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

function formatCoordinates(lat?: number, lng?: number): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') return '20.29°N, 85.82°E';
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

export function formatNearestObservation(
  location: LocationRecord,
  nearestStation?: NearestStationResult | null
): string {
  if (nearestStation?.station) {
    const st = nearestStation.station;
    const city = st.city || st.district || st.name;
    const state = st.state;
    if (city && state) return `${city}, ${state}`;
    return city || state || 'Local Observatory';
  }

  if (location.weatherStation) {
    const raw = location.weatherStation;
    // If format is like "State (City - Code)" or "State (City)"
    const parenthesized = raw.match(/([a-zA-Z\s]+)\s*\(([a-zA-Z\s]+)(?:\s*-\s*[a-zA-Z0-9]+)?\)/);
    if (parenthesized) {
      const statePart = parenthesized[1].trim();
      const cityPart = parenthesized[2].trim();
      return `${cityPart}, ${statePart}`;
    }
    // Format "IMD MC Bhubaneswar (Airport Met Observatory)" -> "Bhubaneswar, Odisha"
    if (raw.includes('Bhubaneswar')) return `Bhubaneswar, ${location.state || 'Odisha'}`;
    if (raw.includes('Safdarjung') || raw.includes('Palam')) return `New Delhi, Delhi`;
    return raw;
  }

  const defaultCity = location.city || location.district || location.name;
  return `${defaultCity}, ${location.state}`;
}

interface LocationProviderProps {
  children: ReactNode;
  onLocationChange?: (location: LocationRecord) => void;
  onRefreshTriggered?: () => Promise<void>;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
  onLocationChange,
  onRefreshTriggered,
}) => {
  const userLocation = useUserLocation(onLocationChange);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Compute GPS status strictly using browser geolocation state
  let gpsStatus: GpsStatus = 'LOCATION DETECTED';
  if (
    userLocation.isLocating ||
    userLocation.locatePhase === 'locating' ||
    userLocation.locatePhase === 'prompting' ||
    userLocation.locatePhase === 'geocoding'
  ) {
    gpsStatus = 'REQUESTING LOCATION';
  } else if (userLocation.locateError) {
    if (userLocation.locateError.code === 'PERMISSION_DENIED') {
      gpsStatus = 'LOCATION PERMISSION DENIED';
    } else {
      gpsStatus = 'LOCATION UNAVAILABLE';
    }
  } else if (userLocation.locationSource === 'DEVICE_GPS') {
    gpsStatus = 'GPS ACTIVE';
  } else {
    gpsStatus = 'LOCATION DETECTED';
  }

  const refreshLocation = useCallback(
    async (forceGps: boolean = true): Promise<LocationRecord | null> => {
      const updated = await userLocation.detectLocation(forceGps);
      if (onRefreshTriggered) {
        await onRefreshTriggered();
      }
      return updated;
    },
    [userLocation, onRefreshTriggered]
  );

  const placeName =
    userLocation.selectedLocation.city ||
    userLocation.selectedLocation.district ||
    userLocation.selectedLocation.name;
  const state = userLocation.selectedLocation.state || 'India';
  const country = 'India';
  const nearestObservationStation = formatNearestObservation(
    userLocation.selectedLocation,
    userLocation.nearestStationInfo
  );
  const coordinatesFormatted = formatCoordinates(
    userLocation.selectedLocation.lat,
    userLocation.selectedLocation.lng
  );

  const value: LocationContextType = {
    latitude: userLocation.selectedLocation.lat,
    longitude: userLocation.selectedLocation.lng,
    placeName,
    state,
    country,
    nearestObservationStation,
    gpsStatus,
    lastUpdatedTime: userLocation.lastDetectedAt || new Date(),

    location: userLocation.selectedLocation,
    coordinatesFormatted,
    accuracyMeters: userLocation.accuracyMeters,
    locationSource: userLocation.locationSource,
    isLocating: userLocation.isLocating,
    locatePhase: userLocation.locatePhase,
    locateError: userLocation.locateError,
    nearestStationInfo: userLocation.nearestStationInfo,
    isGeolocationSupported: userLocation.isGeolocationSupported,

    refreshLocation,
    changeLocation: userLocation.selectLocation,
    clearSavedLocation: userLocation.clearSavedLocation,
    resetError: userLocation.resetError,
    openLocationModal: () => setIsLocationModalOpen(true),
    closeLocationModal: () => setIsLocationModalOpen(false),
    isLocationModalOpen,
    openPrivacyModal: () => setIsPrivacyModalOpen(true),
    closePrivacyModal: () => setIsPrivacyModalOpen(false),
    isPrivacyModalOpen,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export function useLocationSafe(): LocationContextType | null {
  return useContext(LocationContext) || null;
}
