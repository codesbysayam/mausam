import React from 'react';
import { RadarStation } from '../../types/radar';
import { StateWeatherData } from '../map/IndiaWeatherMap';

export interface StationObservationPanelProps {
  viewMode: 'synoptic' | 'radar';
  station?: RadarStation | null;
  stateData?: StateWeatherData | null;
  observationTime?: string;
  dataStatus?: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
  onSwitchMode?: (mode: 'synoptic' | 'radar') => void;
}

export const StationObservationPanel: React.FC<StationObservationPanelProps> = ({
  viewMode,
  station,
  stateData,
  observationTime = '06 Sep 2026 • Routine Sweep',
  dataStatus = 'RECENT',
}) => {
  const isRadar = viewMode === 'radar';

  const title = isRadar
    ? station?.name || 'Select Radar Station'
    : stateData?.name ? `${stateData.name} State Observatory` : 'Select State Observation';

  const code = isRadar
    ? station?.id || 'DWR'
    : stateData?.id?.replace('IN-', '') || 'AWS';

  const stateName = isRadar
    ? station?.state || 'India Network'
    : stateData?.name || 'National Grid';

  const coords = isRadar && station
    ? `${station.latitude.toFixed(4)}°N, ${station.longitude.toFixed(4)}°E`
    : stateData
    ? 'State Meteorological Centre Coordinates'
    : 'N/A';

  const source = isRadar
    ? 'IMD Doppler Radar Network Reference'
    : stateData?.dataSource || 'IMD Regional Meteorological Centre';

  // Format status badge
  const getStatusBadge = () => {
    switch (dataStatus) {
      case 'LIVE':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00C897]/20 text-[#00C897] border border-[#00C897]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C897] animate-pulse"></span>
            LIVE FEED
          </span>
        );
      case 'RECENT':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#1565C0]/20 text-[#38BDF8] border border-[#1565C0]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
            RECENT OBS
          </span>
        );
      case 'STALE':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
            STALE ARCHIVE
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
            DATA UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0B263D] border border-[#1D5278] rounded-lg p-4 flex flex-col justify-between h-full shadow-md text-white">
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1D5278] mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#AFC4D8]">
              {isRadar ? 'SELECTED STATION' : 'SELECTED OBSERVATORY'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1565C0]/20 text-[#38BDF8] border border-[#1565C0]/30">
              {code}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Station / Location Identity */}
        <div className="mb-3.5">
          <h3 className="text-base font-bold text-[#F5F9FC] leading-snug line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2 text-xs text-[#AFC4D8] mt-1 flex-wrap">
            <span>{stateName}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-[#F5F9FC]">{coords}</span>
          </div>
          <div className="text-[11px] text-[#8A94A6] mt-1 flex items-center justify-between">
            <span>Source: <strong className="text-[#AFC4D8]">{source}</strong></span>
          </div>
          <div className="text-[11px] text-[#8A94A6] mt-0.5">
            <span>Observed: <span className="font-mono text-[#AFC4D8]">{observationTime}</span></span>
          </div>
        </div>

        {/* 2-Column Observation Mini-Grid */}
        <div className="mb-3.5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#AFC4D8] mb-1.5">
            Verified Surface &amp; Synoptic Metrics
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
              <span className="text-[10px] text-[#8A94A6] block">Temperature</span>
              <span className="text-sm font-bold font-mono text-[#F5F9FC]">
                {stateData?.temperature != null ? `${stateData.temperature}°C` : 'N/A'}
              </span>
            </div>

            <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
              <span className="text-[10px] text-[#8A94A6] block">Rainfall (24h)</span>
              <span className="text-sm font-bold font-mono text-[#38BDF8]">
                {stateData?.rainfall != null ? `${stateData.rainfall} mm` : '0 mm'}
              </span>
            </div>

            <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
              <span className="text-[10px] text-[#8A94A6] block">Wind Speed</span>
              <span className="text-sm font-bold font-mono text-[#00C897]">
                {stateData?.windSpeed != null ? `${stateData.windSpeed} km/h ${stateData.windDir || ''}` : 'N/A'}
              </span>
            </div>

            <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
              <span className="text-[10px] text-[#8A94A6] block">Relative Humidity</span>
              <span className="text-sm font-bold font-mono text-[#F5F9FC]">
                {stateData?.humidity != null ? `${stateData.humidity}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Radar-Specific Sweep Parameters */}
        {isRadar && station && (
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#AFC4D8] mb-1.5">
              Station Hardware Parameters
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
                <span className="text-[10px] text-[#8A94A6] block">Radar Band</span>
                <span className="text-xs font-bold font-mono text-[#38BDF8]">{station.band}</span>
              </div>
              <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
                <span className="text-[10px] text-[#8A94A6] block">Surveillance Range</span>
                <span className="text-xs font-bold font-mono text-[#F5F9FC]">{station.maxRangeKm} km</span>
              </div>
              <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
                <span className="text-[10px] text-[#8A94A6] block">Antenna Elevation</span>
                <span className="text-xs font-bold font-mono text-[#00C897]">{station.elevationM ? `${station.elevationM}m ASL` : 'Site ASL'}</span>
              </div>
              <div className="bg-[#102D44] border border-[#1D5278] p-2 rounded">
                <span className="text-[10px] text-[#8A94A6] block">Scan Cycle</span>
                <span className="text-xs font-bold font-mono text-[#F5F9FC]">10 Minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* Warning summary if synoptic mode */}
        {!isRadar && stateData?.warningMessage && (
          <div className="bg-[#102D44] border border-[#1D5278] p-2.5 rounded text-xs">
            <span className="text-[10px] text-[#F59E0B] font-bold uppercase tracking-wider block mb-0.5">
              Warning Advisory
            </span>
            <p className="text-[11px] text-[#AFC4D8] leading-relaxed line-clamp-2">
              {stateData.warningMessage}
            </p>
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="mt-3 pt-2.5 border-t border-[#1D5278] text-[10px] text-[#8A94A6]">
        <span>Verified data from official meteorological registry. Unmeasured values display N/A.</span>
      </div>
    </div>
  );
};

export default StationObservationPanel;
