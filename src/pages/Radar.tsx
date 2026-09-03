import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { IndiaWeatherMap, StateWeatherData } from '../components/map/IndiaWeatherMap';
import { WeatherMapMetric, MapLayerControl } from '../components/map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { LocationRecord } from '../types';
import { LocatingPhase } from '../services/geolocationService';
import { CurrentLocationBanner } from '../components/location/CurrentLocationBanner';
import {
  DopplerRadarViewer,
  RADAR_STATIONS_DATA,
  RadarProduct,
  RadarProductType,
  RadarStationInfo,
} from '../components/radar/DopplerRadarViewer';
import { RadarProductAlert, RadarProductAlertInfo } from '../components/radar/RadarProductAlert';

export interface RadarPageProps {
  selectedLocation?: LocationRecord;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

export const RadarPage: React.FC<RadarPageProps> = ({
  selectedLocation,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const [selectedStation, setSelectedStation] = useState<RadarStationInfo>(
    RADAR_STATIONS_DATA.find((s) => s.code === 'DWR-MUM') || RADAR_STATIONS_DATA[0]
  );
  const [selectedState, setSelectedState] = useState<string>('Odisha');
  const [activeMetric, setActiveMetric] = useState<WeatherMapMetric>('rainfall');
  const [productType, setProductType] = useState<RadarProductType>('MAXZ');
  const [viewMode, setViewMode] = useState<'synoptic-map' | 'station-scope'>('station-scope');
  const [stationFilter, setStationFilter] = useState<'all' | 'coastal' | 'inland'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Radar product error & fallback alert notification state (non-blocking)
  const [radarAlert, setRadarAlert] = useState<RadarProductAlertInfo | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [isRetryingProduct, setIsRetryingProduct] = useState<boolean>(false);

  const handleRetryProduct = () => {
    setIsRetryingProduct(true);
    setRefreshCounter((c) => c + 1);
    setTimeout(() => setIsRetryingProduct(false), 900);
  };

  const handleDismissAlert = () => {
    setRadarAlert(null);
  };

  const handleSwitchProduct = (newProduct: RadarProductType) => {
    setProductType(newProduct);
  };

  // Sync radar station if selectedLocation changes
  useEffect(() => {
    if (!selectedLocation) return;
    setSelectedState(selectedLocation.state);

    // Try finding exact city or matching state station
    const exactCity = RADAR_STATIONS_DATA.find(
      (st) =>
        st.name.toLowerCase().includes(selectedLocation.city.toLowerCase()) ||
        st.surroundingPlaces?.some((p) => p.name.toLowerCase().includes(selectedLocation.city.toLowerCase()))
    );
    if (exactCity) {
      setSelectedStation(exactCity);
      return;
    }

    const stateMatch = RADAR_STATIONS_DATA.find(
      (st) => st.state.toLowerCase() === selectedLocation.state.toLowerCase()
    );
    if (stateMatch) {
      setSelectedStation(stateMatch);
    }
  }, [selectedLocation]);

  const filteredStations = RADAR_STATIONS_DATA.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.state.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (stationFilter === 'coastal') return s.isCoastal;
    if (stationFilter === 'inland') return !s.isCoastal;
    return true;
  });

  const handleStateSelect = (state: StateWeatherData) => {
    setSelectedState(state.name);
    // Auto-match nearest radar station if exists
    const matchingStation = RADAR_STATIONS_DATA.find(
      (st) => st.state.toLowerCase() === state.name.toLowerCase()
    );
    if (matchingStation) {
      setSelectedStation(matchingStation);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto w-full">
      {/* Real Geolocation & Active Radar Station Banner */}
      {selectedLocation && (
        <CurrentLocationBanner
          location={selectedLocation}
          source={locationSource}
          isLocating={isLocating}
          onDetectLocation={onDetectLocation ? () => onDetectLocation(true) : undefined}
          onChangeLocationClick={onOpenLocationCenter}
        />
      )}

      {/* 1. Header & Primary Radar Controller */}
      <div className="mausam-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white font-bold text-lg">
              National Weather Radar Imagery &amp; IMD Station Grid
            </h2>
            <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[10px] font-bold px-2 py-0.5 rounded border border-[#0B72B9]/40">
              WEATHER RADAR &amp; IMD DIRECTORY
            </span>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Open composite Doppler reflectivity overlay (via RainViewer) mapped across India Meteorological Department (IMD) Doppler Weather Radar coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex bg-[#1E2733] border border-[#334155] rounded p-1">
            <button
              type="button"
              onClick={() => setViewMode('synoptic-map')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'synoptic-map'
                  ? 'bg-[#0B72B9] text-white shadow'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">public</span>
              <span>All-India Synoptic Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('station-scope')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'station-scope'
                  ? 'bg-[#0B72B9] text-white shadow'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">radar</span>
              <span>Station Scope ({selectedStation.code})</span>
            </button>
          </div>

          <StatusBadge label="Open Composite Radar Active" variant="info" icon="sensors" />
        </div>
      </div>

      {/* Radar Product Fetch Failure / Offline Alert Banner (Non-blocking: map & controls remain fully functional) */}
      {radarAlert && (
        <RadarProductAlert
          alert={radarAlert}
          onDismiss={handleDismissAlert}
          onRetry={handleRetryProduct}
          onSwitchProduct={handleSwitchProduct}
          isRetrying={isRetryingProduct}
        />
      )}

      {/* 2. Main Radar Imagery & Station Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: Active Synoptic Meteorological Map or Doppler Radar Scope */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className={viewMode === 'synoptic-map' ? 'block' : 'hidden'}>
            <IndiaWeatherMap
              data={INDIA_WEATHER_DATA}
              metric={activeMetric}
              onMetricChange={setActiveMetric}
              selectedState={selectedState}
              onStateSelect={handleStateSelect}
            />
          </div>
          <div className={viewMode === 'station-scope' ? 'block' : 'hidden'}>
            <DopplerRadarViewer
              selectedStation={selectedStation}
              productType={productType}
              onProductChange={setProductType}
              onSelectStation={setSelectedStation}
              onProductFetchStatus={setRadarAlert}
              refreshTrigger={refreshCounter}
            />
          </div>

          {/* Genuine IMD Radar Station Technical Specifications */}
          <div className="mausam-card">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#334155] mb-3">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[16px]">sensors</span>
                Station Technical Specifications &amp; Radar Parameters ({selectedStation.name} • {selectedStation.code})
              </h3>
              <span className="text-[10px] text-[#4FA8E0] font-mono bg-[#0B72B9]/15 px-2 py-0.5 rounded border border-[#0B72B9]/30">
                {selectedStation.band} Station Hardware
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Station Coordinates</span>
                <span className="text-white font-bold text-sm font-mono">{selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Geodesic Origin</span>
              </div>

              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Transmitter Band</span>
                <span className="text-[#4FA8E0] font-bold text-sm font-mono">{selectedStation.band}</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">{selectedStation.frequencyGhz ? `${selectedStation.frequencyGhz} GHz Carrier` : 'Dual Polarization'}</span>
              </div>

              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Antenna Elevation</span>
                <span className="text-[#2ECC71] font-bold text-sm font-mono">{selectedStation.elevationMeters}m ASL</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Tower Platform Height</span>
              </div>

              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Surveillance Radius</span>
                <span className="text-[#FF8C42] font-bold text-sm font-mono">{selectedStation.range}</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Footprint Perimeter</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#334155]/60 text-[11px] text-[#8A94A6] flex items-center justify-between">
              <span>Radar reflectivity overlay: <strong>RainViewer open composite</strong></span>
              <span>Station metadata: <strong>IMD Doppler Radar Network Reference</strong></span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Station Directory & Technical Specifications */}
        <div className="flex flex-col gap-4">
          {/* Station Selector with search and filter */}
          <div className="mausam-card">
            <SectionHeader
              title="Coastal &amp; Inland Radar Stations"
              subtitle="Select active Doppler station"
              icon="cell_tower"
            />

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col gap-2 mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search radar stations, cities, states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1E2733] border border-[#334155] rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#4FA8E0]"
                />
                <span className="material-symbols-outlined text-[15px] text-[#8A94A6] absolute left-2.5 top-2">
                  search
                </span>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1.5 text-xs text-[#8A94A6] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                {(['all', 'coastal', 'inland'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStationFilter(f)}
                    className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                      stationFilter === f
                        ? 'bg-[#0B72B9] text-white'
                        : 'bg-[#1E2733] text-[#8A94A6] hover:text-white border border-[#334155]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Station List */}
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredStations.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#8A94A6]">
                  No Doppler radar station matched your search.
                </div>
              ) : (
                filteredStations.map((station) => (
                  <div
                    key={station.code}
                    onClick={() => {
                      setSelectedStation(station);
                      setViewMode('station-scope');
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedStation.code === station.code
                        ? 'bg-[#0B72B9]/25 border-[#4FA8E0] shadow-md ring-1 ring-[#0B72B9]'
                        : 'bg-[#1E2733] border-[#334155] hover:border-[#4FA8E0]/60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xs">{station.name}</span>
                      <span className="text-[10px] text-[#4FA8E0] font-mono font-bold bg-[#0B72B9]/20 px-1.5 py-0.5 rounded border border-[#0B72B9]/40">
                        {station.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8A94A6] mt-1 flex justify-between items-center">
                      <span>{station.state} • {station.band}</span>
                      <span className="text-[#2ECC71] font-semibold text-[10px]">Range: {station.range}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Station Parameters */}
          <div className="mausam-card">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Observational Sweep Parameters</span>
              <span className="text-[10px] text-[#4FA8E0] font-mono">{selectedStation.code}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Scan Frequency</span>
                <span className="text-white font-bold font-mono">Every 10 Minutes</span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Elevation Angles</span>
                <span className="text-white font-bold font-mono">0.5° to 19.5° (10 cuts)</span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Transmitter Type</span>
                <span className="text-white font-bold font-mono">
                  {selectedStation.band} {selectedStation.peakPowerKw}kW
                </span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Current Product</span>
                <span className="text-white font-bold font-mono">
                  {viewMode === 'station-scope' ? productType : 'PPV'} Reflection
                </span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Operating Frequency</span>
                <span className="text-white font-bold font-mono">{selectedStation.frequencyGhz} GHz</span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Site Elevation</span>
                <span className="text-white font-bold font-mono">{selectedStation.elevationMeters}m ASL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


