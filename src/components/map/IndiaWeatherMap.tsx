import React, { useMemo, useState } from 'react';
import India from '@svg-maps/india';
import { WeatherMapMetric, MapLayerControl } from './MapLayerControl';
import { MapLegend } from './MapLegend';
import { SectionHeader } from '../common/SectionHeader';

export interface StateWeatherData {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
  aqi?: number;
  pollen?: number;
  rainfall?: number;
  condition?: string;
  city?: string;
  updatedAt?: string;
}

interface IndiaWeatherMapProps {
  data: StateWeatherData[];
  metric?: WeatherMapMetric;
  onMetricChange?: (metric: WeatherMapMetric) => void;
  selectedState?: string | null;
  onStateSelect?: (state: StateWeatherData) => void;
}

const MAP_THEME = {
  defaultState: '#1E2733',
  hoverState: '#0B72B9',
  selectedState: '#4FA8E0',
  stroke: '#334155',
  strokeActive: '#FFFFFF',
};

function getMetricValue(state: StateWeatherData, metric: WeatherMapMetric): number | undefined {
  switch (metric) {
    case 'temperature':
      return state.temperature;
    case 'humidity':
      return state.humidity;
    case 'aqi':
      return state.aqi;
    case 'pollen':
      return state.pollen;
    case 'rainfall':
      return state.rainfall;
    default:
      return undefined;
  }
}

function getTemperatureColor(value?: number) {
  if (value === undefined) return MAP_THEME.defaultState;
  if (value <= 15) return '#5AC8E0';
  if (value <= 22) return '#3A6EA5';
  if (value <= 26) return '#4FA8E0';
  if (value <= 30) return '#FFC93C';
  if (value <= 34) return '#FF8C42';
  return '#E74C3C';
}

function getAQIColor(value?: number) {
  if (value === undefined) return MAP_THEME.defaultState;
  if (value <= 50) return '#2ECC71';
  if (value <= 100) return '#F1C40F';
  if (value <= 200) return '#FF8C42';
  if (value <= 300) return '#E74C3C';
  if (value <= 400) return '#9B59B6';
  return '#7F1D1D';
}

function getHumidityColor(value?: number) {
  if (value === undefined) return MAP_THEME.defaultState;
  if (value < 40) return '#FF8C42';
  if (value < 55) return '#FFC93C';
  if (value < 70) return '#4FA8E0';
  if (value < 85) return '#3A6EA5';
  return '#5AC8E0';
}

function getRainfallColor(value?: number) {
  if (value === undefined) return MAP_THEME.defaultState;
  if (value === 0) return '#1E2733';
  if (value < 5) return '#3A6EA5';
  if (value < 15) return '#4FA8E0';
  if (value < 30) return '#5AC8E0';
  return '#2ECC71';
}

function getPollenColor(value?: number) {
  if (value === undefined) return MAP_THEME.defaultState;
  if (value <= 2) return '#2ECC71';
  if (value <= 3) return '#F1C40F';
  if (value <= 4) return '#FF8C42';
  return '#E74C3C';
}

function getStateColor(state: StateWeatherData, metric: WeatherMapMetric): string {
  const value = getMetricValue(state, metric);
  switch (metric) {
    case 'temperature':
      return getTemperatureColor(value);
    case 'aqi':
      return getAQIColor(value);
    case 'humidity':
      return getHumidityColor(value);
    case 'rainfall':
      return getRainfallColor(value);
    case 'pollen':
      return getPollenColor(value);
    default:
      return MAP_THEME.defaultState;
  }
}

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({
  data,
  metric: controlledMetric,
  onMetricChange,
  selectedState,
  onStateSelect,
}) => {
  const [internalMetric, setInternalMetric] = useState<WeatherMapMetric>('temperature');
  const metric = controlledMetric || internalMetric;
  const handleMetricChange = onMetricChange || setInternalMetric;

  const [hoveredState, setHoveredState] = useState<StateWeatherData | null>(null);

  const stateMap = useMemo(() => {
    const map = new Map<string, StateWeatherData>();
    data.forEach((s) => {
      map.set(s.id.toLowerCase(), s);
      map.set(s.name.toLowerCase(), s);
      const cleanId = s.id.toLowerCase().replace('in-', '');
      map.set(cleanId, s);
    });
    return map;
  }, [data]);

  const findStateData = (location: any): StateWeatherData | undefined => {
    const id = location.id?.toLowerCase();
    const name = location.name?.toLowerCase();
    return stateMap.get(id) || stateMap.get(name) || {
      id: location.id,
      name: location.name,
      temperature: 28,
      humidity: 70,
      aqi: 80,
      pollen: 2,
      rainfall: 0,
      condition: 'Normal',
    };
  };

  const isStateSelected = (location: any) => {
    if (!selectedState) return false;
    const normSelected = selectedState.toLowerCase().trim();
    const sId = location.id?.toLowerCase() || '';
    const sName = location.name?.toLowerCase() || '';
    return normSelected === sId || normSelected === sName || normSelected.includes(sName) || sName.includes(normSelected);
  };

  return (
    <div className="mausam-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#334155] gap-3">
        <SectionHeader
          title="National Synoptic Meteorological Map"
          subtitle="All India State & Union Territory Observational Layers"
          icon="map"
        />

        <MapLayerControl
          activeMetric={metric}
          onMetricChange={handleMetricChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 items-center">
        {/* SVG India Map Visualizer */}
        <div className="lg:col-span-2 relative bg-[#0F141A] border border-[#334155] rounded p-4 flex items-center justify-center min-h-[420px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={India.viewBox}
            className="w-full max-h-[440px] select-none"
            aria-label="National Meteorological Map of India"
          >
            {India.locations.map((loc: any) => {
              const stateData = findStateData(loc);
              const isSelected = isStateSelected(loc);
              const isHovered = hoveredState?.id === loc.id;
              const fillColor = stateData
                ? getStateColor(stateData, metric)
                : MAP_THEME.defaultState;

              return (
                <path
                  key={loc.id}
                  id={loc.id}
                  name={loc.name}
                  d={loc.path}
                  fill={isHovered ? MAP_THEME.hoverState : isSelected ? MAP_THEME.selectedState : fillColor}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#4FA8E0' : '#334155'}
                  strokeWidth={isSelected ? 1.8 : isHovered ? 1.4 : 0.8}
                  style={{
                    cursor: 'pointer',
                    transition: 'fill 140ms ease, stroke 140ms ease',
                  }}
                  onMouseEnter={() => stateData && setHoveredState(stateData)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => stateData && onStateSelect?.(stateData)}
                >
                  <title>
                    {loc.name}: {stateData ? `${getMetricValue(stateData, metric)}` : 'N/A'}
                  </title>
                </path>
              );
            })}
          </svg>

          {/* Hover Floating Box */}
          {hoveredState && (
            <div className="absolute top-4 right-4 bg-[#17212B] border border-[#4FA8E0] rounded p-2.5 shadow-md pointer-events-none text-xs z-10 min-w-[150px]">
              <div className="font-bold text-white text-xs">{hoveredState.name}</div>
              <div className="text-[#8A94A6] text-[11px]">Capital: {hoveredState.city || 'Regional Met'}</div>
              <div className="mt-1.5 pt-1.5 border-t border-[#334155] flex justify-between font-mono">
                <span className="text-[#8A94A6]">Temp:</span>
                <span className="text-white font-bold">{hoveredState.temperature ?? '—'}°C</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8A94A6]">AQI:</span>
                <span className="text-white font-bold">{hoveredState.aqi ?? '—'}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8A94A6]">Rainfall (24h):</span>
                <span className="text-white font-bold">{hoveredState.rainfall ?? 0} mm</span>
              </div>
            </div>
          )}
        </div>

        {/* State Telemetry Details Panel */}
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="bg-[#1E2733] border border-[#334155] rounded p-3">
            <span className="text-[11px] text-[#4FA8E0] font-bold uppercase tracking-wider">
              Selected Sub-Division Observation
            </span>
            <h4 className="text-white font-bold text-base mt-1">
              {hoveredState?.name || selectedState || 'Odisha'}
            </h4>
            <p className="text-xs text-[#8A94A6]">
              Real-time regional telemetry linked with National Automatic Weather Station (AWS) network.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6]">Active Metric</span>
                <div className="text-white font-bold font-mono uppercase text-xs mt-0.5">
                  {metric}
                </div>
              </div>
              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6]">Station Type</span>
                <div className="text-white font-bold text-xs mt-0.5">
                  Synoptic Surface AWS
                </div>
              </div>
            </div>
          </div>

          <MapLegend metric={metric} />

          <div className="p-2.5 bg-[#17212B] border border-[#334155] rounded text-[11px] text-[#8A94A6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">
              info
            </span>
            <span>Click any state on the map to switch your local meteorological forecast observatory.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IndiaWeatherMap;
