import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  WeatherMapMetric,
} from './MapLayerControl';
import { StateWeatherData } from './IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';
import { RadarStation } from '../../types/radar';
import { OFFICIAL_RADAR_STATIONS } from '../../services/radarService';

export interface MausamMapControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

export interface MausamMapProps {
  viewMode?: 'synoptic' | 'radar';
  activeMetric?: WeatherMapMetric;
  selectedState?: string | null;
  onSelectState?: (state: StateWeatherData) => void;
  selectedStation?: RadarStation | null;
  onSelectStation?: (station: RadarStation) => void;
  radarTileUrl?: string | null;
  radarOpacity?: number;
  userCoords?: { lat: number; lng: number } | null;
  onControlsReady?: (controls: MausamMapControls) => void;
  className?: string;
  heightClass?: string;
}

/**
 * Centroid coordinates for Indian states and UTs
 */
const STATE_COORDINATES: Record<string, { lat: number; lng: number; code: string }> = {
  'andhra pradesh': { lat: 15.9129, lng: 79.74, code: 'AP' },
  'arunachal pradesh': { lat: 28.218, lng: 94.7278, code: 'AR' },
  'assam': { lat: 26.2006, lng: 92.9376, code: 'AS' },
  'bihar': { lat: 25.0961, lng: 85.3131, code: 'BR' },
  'chhattisgarh': { lat: 21.2787, lng: 81.8661, code: 'CG' },
  'goa': { lat: 15.2993, lng: 74.124, code: 'GA' },
  'gujarat': { lat: 22.2587, lng: 71.1924, code: 'GJ' },
  'haryana': { lat: 29.0588, lng: 76.0856, code: 'HR' },
  'himachal pradesh': { lat: 31.1048, lng: 77.1734, code: 'HP' },
  'jharkhand': { lat: 23.6102, lng: 85.2799, code: 'JH' },
  'karnataka': { lat: 15.3173, lng: 75.7139, code: 'KA' },
  'kerala': { lat: 10.8505, lng: 76.2711, code: 'KL' },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569, code: 'MP' },
  'maharashtra': { lat: 19.7515, lng: 75.7139, code: 'MH' },
  'manipur': { lat: 24.6637, lng: 93.9063, code: 'MN' },
  'meghalaya': { lat: 25.467, lng: 91.3662, code: 'ML' },
  'mizoram': { lat: 23.1645, lng: 92.9376, code: 'MZ' },
  'nagaland': { lat: 26.1584, lng: 94.5624, code: 'NL' },
  'odisha': { lat: 20.9517, lng: 85.0985, code: 'OD' },
  'punjab': { lat: 31.1471, lng: 75.3412, code: 'PB' },
  'rajasthan': { lat: 27.0238, lng: 74.2179, code: 'RJ' },
  'sikkim': { lat: 27.533, lng: 88.5122, code: 'SK' },
  'tamil nadu': { lat: 11.1271, lng: 78.6569, code: 'TN' },
  'telangana': { lat: 18.1124, lng: 79.0193, code: 'TS' },
  'tripura': { lat: 23.9408, lng: 91.9882, code: 'TR' },
  'uttar pradesh': { lat: 26.8467, lng: 80.9462, code: 'UP' },
  'uttarakhand': { lat: 30.0668, lng: 79.0193, code: 'UK' },
  'west bengal': { lat: 22.9868, lng: 87.855, code: 'WB' },
  'delhi': { lat: 28.7041, lng: 77.1025, code: 'DL' },
  'jammu and kashmir': { lat: 33.7782, lng: 76.5762, code: 'JK' },
  'ladakh': { lat: 34.1526, lng: 77.5771, code: 'LA' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, code: 'CH' },
  'puducherry': { lat: 11.9416, lng: 79.8083, code: 'PY' },
  'andaman and nicobar': { lat: 11.7401, lng: 92.6586, code: 'AN' },
  'lakshadweep': { lat: 10.5667, lng: 72.6417, code: 'LD' },
  'dadra and nagar haveli and daman and diu': { lat: 20.4283, lng: 72.8397, code: 'DD' },
};

/**
 * Leaflet resize problem fix using ResizeObserver as requested
 */
function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const element = map.getContainer();

    const observer = new ResizeObserver(() => {
      map.invalidateSize({
        pan: false,
        animate: false,
      });
    });

    observer.observe(element);

    const timer = setTimeout(() => {
      map.invalidateSize({
        pan: false,
        animate: false,
      });
    }, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}

/**
 * Controller to expose programmatic map controls & handle view changes
 */
function MapController({
  center,
  zoom,
  onControlsReady,
}: {
  center: [number, number];
  zoom: number;
  onControlsReady?: (controls: MausamMapControls) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        resetView: () => map.setView([22.8, 80.5], 4.8, { animate: true }),
        flyTo: (lat: number, lng: number, z = 7) => map.flyTo([lat, lng], z, { animate: true }),
      });
    }
  }, [map, onControlsReady]);

  return null;
}

/**
 * Helper to compute metric color and format
 */
function getMetricBadge(state: StateWeatherData, metric: WeatherMapMetric): { value: string; bg: string; text: string } {
  switch (metric) {
    case 'temperature': {
      const val = state.temperature ?? 0;
      let bg = '#1565C0';
      if (val >= 38) bg = '#EF4444';
      else if (val >= 32) bg = '#F97316';
      else if (val >= 25) bg = '#F59E0B';
      else if (val >= 18) bg = '#00C897';
      return { value: `${val}°C`, bg, text: '#FFFFFF' };
    }
    case 'rainfall': {
      const val = state.rainfall ?? 0;
      let bg = '#334155';
      if (val >= 50) bg = '#8B5CF6';
      else if (val >= 20) bg = '#1565C0';
      else if (val >= 5) bg = '#0284C7';
      else if (val > 0) bg = '#065F46';
      return { value: `${val} mm`, bg, text: '#FFFFFF' };
    }
    case 'aqi': {
      const val = state.aqi ?? 50;
      let bg = '#00C897';
      if (val > 250) bg = '#EF4444';
      else if (val > 150) bg = '#F97316';
      else if (val > 100) bg = '#F59E0B';
      else if (val > 50) bg = '#10B981';
      return { value: `AQI ${val}`, bg, text: '#FFFFFF' };
    }
    case 'humidity': {
      const val = state.humidity ?? 60;
      let bg = '#0284C7';
      if (val >= 80) bg = '#1D4ED8';
      else if (val >= 60) bg = '#0EA5E9';
      else if (val >= 40) bg = '#14B8A6';
      return { value: `${val}%`, bg, text: '#FFFFFF' };
    }
    case 'wind': {
      const val = state.windSpeed ?? 10;
      let bg = '#0EA5E9';
      if (val >= 35) bg = '#EF4444';
      else if (val >= 20) bg = '#F59E0B';
      return { value: `${val} km/h`, bg, text: '#FFFFFF' };
    }
    case 'warnings': {
      const level = state.warningLevel || 'normal';
      let bg = '#00C897';
      let label = 'Normal';
      if (level === 'severe') {
        bg = '#EF4444';
        label = 'Severe';
      } else if (level === 'alert') {
        bg = '#F97316';
        label = 'Alert';
      } else if (level === 'watch') {
        bg = '#F59E0B';
        label = 'Watch';
      }
      return { value: label, bg, text: '#FFFFFF' };
    }
    default:
      return { value: `${state.temperature ?? '--'}°C`, bg: '#1565C0', text: '#FFFFFF' };
  }
}

export const MausamMap: React.FC<MausamMapProps> = ({
  viewMode = 'synoptic',
  activeMetric = 'temperature',
  selectedState = null,
  onSelectState,
  selectedStation = null,
  onSelectStation,
  radarTileUrl,
  radarOpacity = 0.85,
  userCoords,
  onControlsReady,
  className = '',
  heightClass = 'h-[440px] md:h-[520px] lg:h-[620px]',
}) => {
  const INDIA_CENTER: [number, number] = [22.8, 80.5];
  const DEFAULT_ZOOM = 4.8;

  // Determine center based on selection
  const center = useMemo<[number, number]>(() => {
    if (viewMode === 'radar' && selectedStation) {
      return [selectedStation.latitude, selectedStation.longitude];
    }
    if (viewMode === 'synoptic' && selectedState) {
      const match = STATE_COORDINATES[selectedState.toLowerCase()];
      if (match) {
        return [match.lat, match.lng];
      }
    }
    return INDIA_CENTER;
  }, [viewMode, selectedStation, selectedState]);

  const zoom = useMemo<number>(() => {
    if (viewMode === 'radar' && selectedStation) {
      return 7;
    }
    if (viewMode === 'synoptic' && selectedState) {
      return 6;
    }
    return DEFAULT_ZOOM;
  }, [viewMode, selectedStation, selectedState]);

  // Create custom DivIcon for state markers in synoptic mode
  const createStateMarkerIcon = useCallback(
    (state: StateWeatherData, isSelected: boolean) => {
      const metricInfo = getMetricBadge(state, activeMetric);
      const stateName = state.name;
      const key = stateName.toLowerCase();
      const code = STATE_COORDINATES[key]?.code || state.id.replace('IN-', '');

      const html = `
        <div class="cursor-pointer group flex flex-col items-center select-none" style="transform: translate(-50%, -50%);">
          <div class="flex items-center gap-1 px-1.5 py-0.5 rounded shadow-lg text-[10px] font-bold font-mono transition-transform duration-150 ${
            isSelected
              ? 'ring-2 ring-white scale-110 shadow-[0_0_12px_rgba(21,101,192,0.8)]'
              : 'group-hover:scale-105'
          }" style="background-color: ${metricInfo.bg}; color: ${metricInfo.text}; border: 1px solid rgba(255,255,255,0.3);">
            <span class="opacity-90">${code}</span>
            <span class="opacity-40">|</span>
            <span>${metricInfo.value}</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-white/70 mt-0.5 shadow-sm"></div>
        </div>
      `;

      return L.divIcon({
        className: 'custom-state-marker',
        html,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });
    },
    [activeMetric]
  );

  // Create custom DivIcon for Doppler radar stations
  const createRadarStationIcon = useCallback(
    (station: RadarStation, isSelected: boolean) => {
      const isS = station.band.includes('S-Band');
      const isC = station.band.includes('C-Band');
      const bandTag = isS ? 'S' : isC ? 'C' : 'X';
      const badgeBg = isSelected ? '#1565C0' : '#0B263D';
      const borderCol = isSelected ? '#38BDF8' : '#1D5278';

      const html = `
        <div class="cursor-pointer group flex flex-col items-center select-none" style="transform: translate(-50%, -50%);">
          <div class="relative flex items-center justify-center">
            ${
              isSelected
                ? '<div class="absolute -inset-2 rounded-full border-2 border-[#38BDF8] animate-ping opacity-60 pointer-events-none"></div>'
                : ''
            }
            <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-md font-bold text-[10px] text-white transition-transform ${
              isSelected ? 'scale-110 ring-2 ring-white' : 'group-hover:scale-105'
            }" style="background-color: ${badgeBg}; border: 2px solid ${borderCol};">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/>
                <path d="M4 6h.01"/>
                <path d="M2.29 9.62A10 10 0 0 0 21.42 17.5"/>
                <path d="M16.24 7.76A6 6 0 0 0 8.23 6.67"/>
                <path d="M12 18v4"/>
                <path d="M8 22h8"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
          </div>
          <div class="bg-[#061A2B]/90 text-[9px] font-mono px-1 py-0.2 rounded border border-[#1D5278] text-[#F5F9FC] font-semibold mt-0.5 whitespace-nowrap shadow-sm">
            ${station.id.replace('DWR-', '')} <span class="text-[#38BDF8]">${bandTag}</span>
          </div>
        </div>
      `;

      return L.divIcon({
        className: 'custom-radar-marker',
        html,
        iconSize: [40, 44],
        iconAnchor: [20, 22],
      });
    },
    []
  );

  return (
    <div
      className={`relative w-full ${heightClass} bg-[#061A2B] rounded-lg overflow-hidden border border-[#1D5278] shadow-inner ${className}`}
      style={{ zIndex: 0 }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: '#061A2B' }}
      >
        <MapResizeFix />
        <MapController center={center} zoom={zoom} onControlsReady={onControlsReady} />

        {/* Base Cartographic Tile Layer */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={18}
          opacity={0.88}
        />

        {/* Real RainViewer Doppler Radar Tile Overlay in Radar Mode */}
        {viewMode === 'radar' && radarTileUrl && (
          <TileLayer
            key={radarTileUrl}
            url={radarTileUrl}
            opacity={radarOpacity}
            zIndex={300}
            attribution='Weather radar data by RainViewer'
          />
        )}

        {/* Radar Station Range Perimeter & Station Markers */}
        {viewMode === 'radar' && (
          <>
            {/* Surveillance circle for selected station */}
            {selectedStation && (
              <Circle
                center={[selectedStation.latitude, selectedStation.longitude]}
                radius={selectedStation.maxRangeKm * 1000}
                pathOptions={{
                  color: '#1565C0',
                  fillColor: '#0B3D91',
                  fillOpacity: 0.08,
                  weight: 1.8,
                  dashArray: '4, 4',
                }}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent={false}>
                  <div className="text-xs font-sans text-white p-1">
                    <span className="font-bold">{selectedStation.name}</span>
                    <br />
                    <span>Surveillance Coverage Radius: {selectedStation.maxRangeKm} km</span>
                  </div>
                </Tooltip>
              </Circle>
            )}

            {/* Radar station markers */}
            {OFFICIAL_RADAR_STATIONS.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              return (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  icon={createRadarStationIcon(station, isSelected)}
                  eventHandlers={{
                    click: () => onSelectStation?.(station),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                    <div className="text-xs font-sans text-white py-0.5 px-1 font-semibold">
                      <span>{station.name}</span>
                      <span className="text-[#38BDF8] ml-1">({station.id})</span>
                      <div className="text-[10px] text-[#AFC4D8] font-normal">
                        {station.band} • Max Range: {station.maxRangeKm} km
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        {/* Synoptic State Observations in Synoptic Mode */}
        {viewMode === 'synoptic' && (
          <>
            {INDIA_WEATHER_DATA.map((state) => {
              const coords = STATE_COORDINATES[state.name.toLowerCase()];
              if (!coords) return null;
              const isSelected =
                selectedState?.toLowerCase() === state.name.toLowerCase() ||
                selectedState?.toLowerCase() === state.id.toLowerCase();

              return (
                <Marker
                  key={state.id}
                  position={[coords.lat, coords.lng]}
                  icon={createStateMarkerIcon(state, isSelected)}
                  eventHandlers={{
                    click: () => onSelectState?.(state),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                    <div className="text-xs font-sans text-white p-1">
                      <div className="font-bold border-b border-[#334155] pb-0.5 mb-1 text-[#F5F9FC]">
                        {state.name} ({coords.code})
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-[#AFC4D8]">
                        <span>Temp: <strong className="text-white">{state.temperature ?? 'N/A'}°C</strong></span>
                        <span>Rain: <strong className="text-white">{state.rainfall ?? 'N/A'} mm</strong></span>
                        <span>AQI: <strong className="text-white">{state.aqi ?? 'N/A'}</strong></span>
                        <span>Humidity: <strong className="text-white">{state.humidity ?? 'N/A'}%</strong></span>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        {/* User GPS location marker if provided */}
        {userCoords && (
          <Marker
            position={[userCoords.lat, userCoords.lng]}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
                  <div class="absolute w-6 h-6 rounded-full bg-[#00C897]/30 animate-ping"></div>
                  <div class="w-3.5 h-3.5 rounded-full bg-[#00C897] border-2 border-white shadow-lg"></div>
                </div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Tooltip direction="top">
              <span className="text-xs font-bold text-white">Your Current Position</span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MausamMap;
