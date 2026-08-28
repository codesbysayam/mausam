import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { IndiaWeatherMap, StateWeatherData } from '../components/map/IndiaWeatherMap';
import { WeatherMapMetric, MapLayerControl } from '../components/map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import {
  DopplerRadarViewer,
  RADAR_STATIONS_DATA,
  RadarProduct,
  RadarStationInfo,
} from '../components/radar/DopplerRadarViewer';

export const RadarPage: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<RadarStationInfo>(
    RADAR_STATIONS_DATA.find((s) => s.code === 'DWR-MUM') || RADAR_STATIONS_DATA[0]
  );
  const [selectedState, setSelectedState] = useState<string>('Odisha');
  const [activeMetric, setActiveMetric] = useState<WeatherMapMetric>('rainfall');
  const [productType, setProductType] = useState<RadarProduct>('MAXZ');
  const [viewMode, setViewMode] = useState<'synoptic-map' | 'station-scope'>('synoptic-map');
  const [stationFilter, setStationFilter] = useState<'all' | 'coastal' | 'inland'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      {/* 1. Header & Primary Radar Controller */}
      <div className="mausam-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white font-bold text-lg">
              National Doppler Weather Radar (DWR) Imagery &amp; Synoptic Maps
            </h2>
            <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[10px] font-bold px-2 py-0.5 rounded border border-[#0B72B9]/40">
              IMD RADAR NETWORK
            </span>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Continuous dual-polarization atmospheric reflectivity (dBZ), radial hydrometeor velocity (m/s), and precipitation estimation (SRI).
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

          {/* Product Selector for Radar */}
          {viewMode === 'station-scope' && (
            <div className="flex bg-[#1E2733] border border-[#334155] rounded p-1">
              {(['MAXZ', 'PPZ', 'PPV', 'SRI'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProductType(p)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                    productType === p
                      ? 'bg-[#0B72B9] text-white shadow'
                      : 'text-[#8A94A6] hover:text-white'
                  }`}
                  title={
                    p === 'MAXZ'
                      ? 'MAXZ: Maximum Reflectivity (0 to 65+ dBZ)'
                      : p === 'PPZ'
                      ? 'PPZ: PPI Plan Position Indicator Reflectivity at 0.5° cut'
                      : p === 'PPV'
                      ? 'PPV: Doppler Radial Velocity (-32 to +32 m/s)'
                      : 'SRI: Surface Rainfall Intensity (mm/hr)'
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <StatusBadge label="Doppler Network 100% Operational" variant="good" icon="check_circle" />
        </div>
      </div>

      {/* 2. Main Radar Imagery & Station Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: Active Synoptic Meteorological Map or Doppler Radar Scope */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {viewMode === 'synoptic-map' ? (
            <IndiaWeatherMap
              data={INDIA_WEATHER_DATA}
              metric={activeMetric}
              onMetricChange={setActiveMetric}
              selectedState={selectedState}
              onStateSelect={handleStateSelect}
            />
          ) : (
            <DopplerRadarViewer
              selectedStation={selectedStation}
              productType={productType}
              onProductChange={setProductType}
              onSelectStation={setSelectedStation}
            />
          )}

          {/* Real-time Storm Cell & Severe Weather Diagnostics */}
          <div className="mausam-card">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#334155] mb-3">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[16px]">thunderstorm</span>
                Live Hydrometeor &amp; Severe Storm Cell Diagnostics ({selectedStation.code} • {selectedStation.state})
              </h3>
              <span className="text-[10px] text-[#2ECC71] font-mono bg-[#2ECC71]/15 px-2 py-0.5 rounded border border-[#2ECC71]/30">
                SCIT Algorithmic Tracking Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Peak Reflectivity</span>
                <span className="text-[#FF8C42] font-bold text-sm font-mono">56.4 dBZ</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Severe Convective Core</span>
              </div>

              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Max Radial Velocity</span>
                <span className="text-[#4FA8E0] font-bold text-sm font-mono">±24.5 m/s</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Inbound/Outbound Dipole</span>
              </div>

              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Est. Peak Rain Rate</span>
                <span className="text-[#2ECC71] font-bold text-sm font-mono">52.0 mm/hr</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Torrential Downpour</span>
              </div>

              <div className="bg-[#1E2733] p-3 rounded-lg border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block mb-0.5">Max Echo Top (ET)</span>
                <span className="text-white font-bold text-sm font-mono">14.8 km ASL</span>
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Tropopause Penetration</span>
              </div>
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


