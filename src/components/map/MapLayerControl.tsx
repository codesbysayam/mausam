import React from 'react';

export type WeatherMapMetric =
  | 'temperature'
  | 'humidity'
  | 'aqi'
  | 'pollen'
  | 'rainfall';

interface MapLayerControlProps {
  activeMetric: WeatherMapMetric;
  onMetricChange: (metric: WeatherMapMetric) => void;
}

const METRIC_LAYERS: { id: WeatherMapMetric; label: string; icon: string }[] = [
  { id: 'temperature', label: 'Temperature (°C)', icon: 'thermostat' },
  { id: 'rainfall', label: '24h Rainfall (mm)', icon: 'rainy' },
  { id: 'aqi', label: 'Air Quality (AQI)', icon: 'air' },
  { id: 'humidity', label: 'Humidity (RH%)', icon: 'water_drop' },
  { id: 'pollen', label: 'Pollen Risk', icon: 'grain' },
];

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  activeMetric,
  onMetricChange,
}) => {
  return (
    <div
      id="synoptic-map-layer-controls"
      className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1E2733] border border-[#334155] rounded"
      role="toolbar"
      aria-label="Meteorological Map Layer Switcher"
    >
      {METRIC_LAYERS.map((layer) => {
        const isActive = activeMetric === layer.id;
        return (
          <button
            key={layer.id}
            id={`btn-map-layer-${layer.id}`}
            type="button"
            onClick={() => onMetricChange(layer.id)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-[#0B72B9] text-white shadow-md'
                : 'text-[#D7DEE8] hover:bg-[#17212B] hover:text-[#4FA8E0]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {layer.icon}
            </span>
            <span>{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
};
