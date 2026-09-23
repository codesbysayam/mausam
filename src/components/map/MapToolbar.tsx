import React from 'react';
import { WeatherMapMetric } from './MapLayerControl';

export interface MapToolbarProps {
  activeMetric: WeatherMapMetric;
  onSelectMetric: (metric: WeatherMapMetric) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
  onMyLocation?: () => void;
  hasUserLocation?: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  sectorName?: string;
}

const METRICS: { id: WeatherMapMetric; label: string; icon: string }[] = [
  { id: 'temperature', label: 'Temperature', icon: 'thermostat' },
  { id: 'rainfall', label: 'Rainfall', icon: 'rainy' },
  { id: 'aqi', label: 'AQI', icon: 'air' },
  { id: 'humidity', label: 'Humidity', icon: 'humidity_percentage' },
  { id: 'wind', label: 'Wind', icon: 'airwave' },
  { id: 'warnings', label: 'Warnings', icon: 'warning' },
];

export const MapToolbar: React.FC<MapToolbarProps> = ({
  activeMetric,
  onSelectMetric,
  onZoomIn,
  onZoomOut,
  onResetView,
  onMyLocation,
  hasUserLocation = false,
  isLocked = false,
  onToggleLock,
  sectorName,
}) => {
  return (
    <div className="bg-[#0B263D] border border-[#1D5278] rounded-t-lg px-3 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto no-scrollbar">
      {/* Left: Layer Selector Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] font-bold text-[#AFC4D8] uppercase tracking-wider mr-1 hidden sm:inline">
          Layer:
        </span>
        <div className="flex items-center gap-1 bg-[#102D44] p-0.5 rounded border border-[#1D5278]">
          {METRICS.map((m) => {
            const isActive = activeMetric === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMetric(m.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1565C0] text-white shadow-sm'
                    : 'text-[#AFC4D8] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center/Right: Map Controls & Sector Lock */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        {/* Visual Lock/Unlock Toggle Control */}
        <button
          type="button"
          id="btn-radar-map-lock"
          onClick={onToggleLock}
          aria-label={isLocked ? 'Unlock radar map panning and zooming' : 'Lock radar map to current sector'}
          aria-pressed={isLocked}
          title={
            isLocked
              ? `Map locked to ${sectorName || 'current weather sector'}. Accidental pan/zoom prevented. Click to unlock.`
              : 'Lock view to current weather sector (prevents accidental panning & zooming)'
          }
          className={`px-2.5 h-7 flex items-center gap-1.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
            isLocked
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/70 shadow-sm ring-1 ring-[#F59E0B]/40'
              : 'bg-[#102D44] text-[#AFC4D8] hover:text-white hover:bg-[#1D5278] border border-[#1D5278]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isLocked ? 'lock' : 'lock_open'}
          </span>
          <span className="font-mono uppercase tracking-wider text-[10px]">
            {isLocked ? 'Sector Locked' : 'Lock View'}
          </span>
          {isLocked && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          )}
        </button>

        <div className="h-4 w-px bg-[#1D5278] mx-0.5 hidden sm:block" />

        <button
          type="button"
          onClick={isLocked ? undefined : onZoomIn}
          disabled={isLocked}
          title={isLocked ? 'Map is locked to sector. Unlock to zoom.' : 'Zoom In'}
          className={`w-7 h-7 flex items-center justify-center rounded border transition-colors ${
            isLocked
              ? 'bg-[#102D44]/50 text-[#8A94A6]/50 border-[#1D5278]/40 cursor-not-allowed'
              : 'bg-[#102D44] text-[#AFC4D8] hover:text-white border-[#1D5278] cursor-pointer'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>

        <button
          type="button"
          onClick={isLocked ? undefined : onZoomOut}
          disabled={isLocked}
          title={isLocked ? 'Map is locked to sector. Unlock to zoom.' : 'Zoom Out'}
          className={`w-7 h-7 flex items-center justify-center rounded border transition-colors ${
            isLocked
              ? 'bg-[#102D44]/50 text-[#8A94A6]/50 border-[#1D5278]/40 cursor-not-allowed'
              : 'bg-[#102D44] text-[#AFC4D8] hover:text-white border-[#1D5278] cursor-pointer'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>

        <button
          type="button"
          onClick={isLocked ? undefined : onResetView}
          disabled={isLocked}
          title={isLocked ? 'Map is locked to sector. Unlock to reset view.' : 'Reset Map to All India View'}
          className={`px-2 h-7 flex items-center gap-1 rounded border text-[11px] font-semibold transition-colors ${
            isLocked
              ? 'bg-[#102D44]/50 text-[#8A94A6]/50 border-[#1D5278]/40 cursor-not-allowed'
              : 'bg-[#102D44] text-[#AFC4D8] hover:text-white border-[#1D5278] cursor-pointer'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          <span className="hidden md:inline">Reset View</span>
        </button>

        {hasUserLocation && (
          <button
            type="button"
            onClick={isLocked ? undefined : onMyLocation}
            disabled={isLocked}
            title={isLocked ? 'Map is locked to sector. Unlock to pan to location.' : 'Pan to My Detected Coordinates'}
            className={`px-2 h-7 flex items-center gap-1 rounded border text-[11px] font-semibold transition-colors ${
              isLocked
                ? 'bg-[#1565C0]/10 text-[#38BDF8]/40 border-[#1565C0]/20 cursor-not-allowed'
                : 'bg-[#1565C0]/20 text-[#38BDF8] hover:bg-[#1565C0] hover:text-white border-[#1565C0]/40 cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">my_location</span>
            <span className="hidden md:inline">My Location</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MapToolbar;
