import React from 'react';
import { WeatherMapMetric } from './MapLayerControl';

export interface MapLegendBarProps {
  viewMode: 'synoptic' | 'radar';
  activeMetric: WeatherMapMetric;
  sourceName?: string;
  observationTime?: string;
  dataStatus?: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
}

export const MapLegendBar: React.FC<MapLegendBarProps> = ({
  viewMode,
  activeMetric,
  sourceName = 'RainViewer Precipitation Radar / IMD State Meteorological Centres',
  observationTime = '06 Sep 2026 • 07:45 PM IST',
  dataStatus = 'RECENT',
}) => {
  // Metric color steps
  const renderMetricScale = () => {
    if (viewMode === 'radar') {
      return (
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#AFC4D8] font-bold">Rainfall Echo (dBZ):</span>
          <div className="flex items-center gap-0.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0284C7] text-white">5 Light</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1565C0] text-white">20 Moderate</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F59E0B] text-white">35 Heavy</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">50+ Intense</span>
          </div>
        </div>
      );
    }

    switch (activeMetric) {
      case 'temperature':
        return (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#AFC4D8] font-bold">Temperature (°C):</span>
            <div className="flex items-center gap-0.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0EA5E9] text-white">&lt;20</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C897] text-white">20–28</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F59E0B] text-white">28–35</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">&gt;35</span>
            </div>
          </div>
        );
      case 'rainfall':
        return (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#AFC4D8] font-bold">Rainfall (24h mm):</span>
            <div className="flex items-center gap-0.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#334155] text-white">0 None</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0284C7] text-white">1–15 Light</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1565C0] text-white">16–50 Mod</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#8B5CF6] text-white">&gt;50 Heavy</span>
            </div>
          </div>
        );
      case 'aqi':
        return (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#AFC4D8] font-bold">Air Quality Index:</span>
            <div className="flex items-center gap-0.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C897] text-white">0–50 Good</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F59E0B] text-white">51–100 Mod</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F97316] text-white">101–200 Poor</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">&gt;200 Severe</span>
            </div>
          </div>
        );
      case 'humidity':
        return (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#AFC4D8] font-bold">Humidity (%):</span>
            <div className="flex items-center gap-0.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#14B8A6] text-white">&lt;40</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0EA5E9] text-white">40–60</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0284C7] text-white">60–80</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1D4ED8] text-white">&gt;80</span>
            </div>
          </div>
        );
      case 'wind':
        return (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#AFC4D8] font-bold">Wind (km/h):</span>
            <div className="flex items-center gap-0.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0EA5E9] text-white">&lt;15 Gentle</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F59E0B] text-white">15–30 Moderate</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">&gt;30 Strong</span>
            </div>
          </div>
        );
      case 'warnings':
        return (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#AFC4D8] font-bold">Hazard Level:</span>
            <div className="flex items-center gap-0.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C897] text-white">Green Normal</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F59E0B] text-white">Yellow Watch</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F97316] text-white">Orange Alert</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#EF4444] text-white">Red Severe</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (dataStatus) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1 font-bold text-[#00C897]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C897] animate-pulse"></span>
            LIVE
          </span>
        );
      case 'RECENT':
        return (
          <span className="flex items-center gap-1 font-bold text-[#38BDF8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
            RECENT
          </span>
        );
      case 'STALE':
        return (
          <span className="flex items-center gap-1 font-bold text-[#F59E0B]">
            STALE
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="flex items-center gap-1 font-bold text-[#EF4444]">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0B263D] border border-t-0 border-[#1D5278] rounded-b-lg px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs text-[#AFC4D8]">
      {/* Metric Scale */}
      <div>{renderMetricScale()}</div>

      {/* Source, Timestamp, and Data Status */}
      <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#8A94A6]">
        <div>
          <span>Source: </span>
          <strong className="text-[#AFC4D8]">{sourceName}</strong>
        </div>
        <span className="hidden sm:inline">•</span>
        <div>
          <span>Observed: </span>
          <span className="font-mono text-[#AFC4D8]">{observationTime}</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <div className="flex items-center gap-1.5">
          <span>Status:</span>
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default MapLegendBar;
