// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Ask MAUSAM Drawer Container
// Hosts the canonical Tool-Grounded Meteorological Assistant Panel
// ====================================================================

import React from 'react';
import { CurrentWeather, WeatherStation, LocationRecord } from '../types';
import { WeatherDataBundle } from '../services/weatherService';
import { AskMausamPanel } from './AskMausam/AskMausamPanel';

interface AskMausamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeather;
  weatherBundle?: WeatherDataBundle;
  selectedLocation?: LocationRecord;
  currentStation: WeatherStation;
  onSelectLocation?: (location: LocationRecord) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const AskMausamDrawer: React.FC<AskMausamDrawerProps> = ({
  isOpen,
  onClose,
  weather,
  weatherBundle,
  selectedLocation,
  currentStation,
  onSelectLocation,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const locName = selectedLocation?.name || selectedLocation?.city || currentStation?.name || 'Bhubaneswar, Odisha';
  const locState = selectedLocation?.state || currentStation?.state || 'Odisha';
  const locCity = selectedLocation?.city || currentStation?.district || currentStation?.name || 'Bhubaneswar';
  const locLat = selectedLocation?.lat || currentStation?.lat || 20.2961;
  const locLng = selectedLocation?.lng || currentStation?.lng || 85.8245;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-mausam-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-[#090E17] h-full shadow-2xl flex flex-col z-10 transition-transform transform duration-300 ease-in-out border-l border-[#1F2C3F]">
        <AskMausamPanel
          currentLocation={{
            name: locName,
            city: locCity,
            state: locState,
            district: selectedLocation?.district || locCity,
            lat: locLat,
            lng: locLng,
          }}
          onClose={onClose}
          onSelectLocation={(locStr) => {
            if (onSelectLocation) {
              onSelectLocation({
                id: `loc-${Date.now()}`,
                name: locStr,
                displayName: locStr,
                city: locStr,
                state: locState,
                district: locStr,
                lat: locLat,
                lng: locLng,
                timezone: 'Asia/Kolkata',
                weatherStation: `${locStr} Observatory`,
                radarCoverage: 'Bhubaneswar DWR',
              });
            }
          }}
        />
      </div>
    </div>
  );
};
