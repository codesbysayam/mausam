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

      {/* Center/Right: Map Controls */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          className="w-7 h-7 flex items-center justify-center rounded bg-[#102D44] text-[#AFC4D8] hover:text-white border border-[#1D5278] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          className="w-7 h-7 flex items-center justify-center rounded bg-[#102D44] text-[#AFC4D8] hover:text-white border border-[#1D5278] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>

        <button
          type="button"
          onClick={onResetView}
          title="Reset Map to All India View"
          className="px-2 h-7 flex items-center gap-1 rounded bg-[#102D44] text-[#AFC4D8] hover:text-white border border-[#1D5278] text-[11px] font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          <span className="hidden md:inline">Reset View</span>
        </button>

        {hasUserLocation && (
          <button
            type="button"
            onClick={onMyLocation}
            title="Pan to My Detected Coordinates"
            className="px-2 h-7 flex items-center gap-1 rounded bg-[#1565C0]/20 text-[#38BDF8] hover:bg-[#1565C0] hover:text-white border border-[#1565C0]/40 text-[11px] font-semibold transition-colors"
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
