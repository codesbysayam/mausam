import React from 'react';
import { WeatherMapMetric } from './MapLayerControl';

interface MapLegendProps {
  metric: WeatherMapMetric;
}

export const MapLegend: React.FC<MapLegendProps> = ({ metric }) => {
  const getLegendItems = () => {
    switch (metric) {
      case 'temperature':
        return [
          { label: '≤ 15°C Cold', color: '#5AC8E0' },
          { label: '16–22°C Mild', color: '#3A6EA5' },
          { label: '23–26°C Optimal', color: '#4FA8E0' },
          { label: '27–30°C Warm', color: '#FFC93C' },
          { label: '31–34°C Hot', color: '#FF8C42' },
          { label: '≥ 35°C Heatwave', color: '#E74C3C' },
        ];
      case 'rainfall':
        return [
          { label: '0 mm (Dry)', color: '#1E2733' },
          { label: '< 5 mm (Light)', color: '#3A6EA5' },
          { label: '5–15 mm (Mod)', color: '#4FA8E0' },
          { label: '15–30 mm (Heavy)', color: '#5AC8E0' },
          { label: '> 30 mm (Very Heavy)', color: '#2ECC71' },
        ];
      case 'aqi':
        return [
          { label: '0–50 Good', color: '#2ECC71' },
          { label: '51–100 Satisfactory', color: '#F1C40F' },
          { label: '101–200 Moderate', color: '#FF8C42' },
          { label: '201–300 Poor', color: '#E74C3C' },
          { label: '> 300 Severe', color: '#7F1D1D' },
        ];
      case 'humidity':
        return [
          { label: '< 40% Dry', color: '#FF8C42' },
          { label: '40–55% Comfortable', color: '#FFC93C' },
          { label: '55–70% Normal', color: '#4FA8E0' },
          { label: '70–85% Humid', color: '#3A6EA5' },
          { label: '> 85% Very Humid', color: '#5AC8E0' },
        ];
      case 'pollen':
        return [
          { label: '1–2 Low', color: '#2ECC71' },
          { label: '3 Moderate', color: '#F1C40F' },
          { label: '4 High', color: '#FF8C42' },
          { label: '5 Severe', color: '#E74C3C' },
        ];
      default:
        return [];
    }
  };

  const items = getLegendItems();

  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8A94A6] bg-[#17212B]/90 p-2 rounded border border-[#334155]">
      <span className="font-bold text-white text-[10px] uppercase tracking-wider">
        Legend:
      </span>
      {items.map((it, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm border border-[#334155]"
            style={{ backgroundColor: it.color }}
          />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
};
