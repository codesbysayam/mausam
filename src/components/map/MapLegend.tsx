import React from 'react';
import { WeatherMapMetric } from './MapLayerControl';

interface MapLegendProps {
  metric: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ metric }) => {
  const normalizedMetric = (metric || '').toLowerCase();

  const getLegendItems = () => {
    if (normalizedMetric.includes('temp')) {
      return [
        { label: '≤ 15°C Cold', color: '#5AC8E0' },
        { label: '16–22°C Mild', color: '#3A6EA5' },
        { label: '23–26°C Optimal', color: '#4FA8E0' },
        { label: '27–30°C Warm', color: '#FFC93C' },
        { label: '31–34°C Hot', color: '#FF8C42' },
        { label: '≥ 35°C Heatwave', color: '#E74C3C' },
      ];
    }
    if (normalizedMetric.includes('rain')) {
      return [
        { label: '0 mm (Dry)', color: '#1E2733' },
        { label: '< 5 mm (Light)', color: '#3A6EA5' },
        { label: '5–15 mm (Moderate)', color: '#4FA8E0' },
        { label: '15–30 mm (Heavy)', color: '#5AC8E0' },
        { label: '> 30 mm (Very Heavy)', color: '#2ECC71' },
      ];
    }
    if (normalizedMetric.includes('aqi') || normalizedMetric.includes('air')) {
      return [
        { label: '0–50 Good', color: '#2ECC71' },
        { label: '51–100 Satisfactory', color: '#F1C40F' },
        { label: '101–200 Moderate', color: '#FF8C42' },
        { label: '201–300 Poor', color: '#E74C3C' },
        { label: '301–400 Very Poor', color: '#9B59B6' },
        { label: '> 400 Severe', color: '#7F1D1D' },
      ];
    }
    if (normalizedMetric.includes('humid') || normalizedMetric.includes('rh')) {
      return [
        { label: '< 40% Dry', color: '#FF8C42' },
        { label: '40–55% Comfortable', color: '#FFC93C' },
        { label: '55–70% Normal', color: '#4FA8E0' },
        { label: '70–85% Humid', color: '#3A6EA5' },
        { label: '> 85% Very Humid', color: '#5AC8E0' },
      ];
    }
    if (normalizedMetric.includes('wind')) {
      return [
        { label: '≤ 10 km/h Light', color: '#5AC8E0' },
        { label: '11–20 km/h Moderate', color: '#4FA8E0' },
        { label: '21–35 km/h Fresh', color: '#FFC93C' },
        { label: '36–50 km/h Strong', color: '#FF8C42' },
        { label: '> 50 km/h Squall', color: '#E74C3C' },
      ];
    }
    if (normalizedMetric.includes('warn')) {
      return [
        { label: '🟢 Normal (Routine)', color: '#2ECC71' },
        { label: '🟡 Watch (Advisory)', color: '#F1C40F' },
        { label: '🟠 Alert (Be Prepared)', color: '#FF8C42' },
        { label: '🔴 Severe (Action)', color: '#E74C3C' },
      ];
    }
    return [
      { label: '≤ 15°C Cold', color: '#5AC8E0' },
      { label: '16–22°C Mild', color: '#3A6EA5' },
      { label: '23–26°C Optimal', color: '#4FA8E0' },
      { label: '27–30°C Warm', color: '#FFC93C' },
      { label: '31–34°C Hot', color: '#FF8C42' },
      { label: '≥ 35°C Heatwave', color: '#E74C3C' },
    ];
  };

  const items = getLegendItems();

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#8A94A6] bg-[#17212B] p-2.5 rounded border border-[#334155]">
      <span className="font-bold text-white text-[10px] uppercase tracking-wider shrink-0">
        LEGEND:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-1.5 bg-[#0F141A]/80 px-2 py-0.5 rounded border border-[#334155]/60">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: it.color }}
            />
            <span className="text-[10px] text-[#D7DEE8] font-medium whitespace-nowrap">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

