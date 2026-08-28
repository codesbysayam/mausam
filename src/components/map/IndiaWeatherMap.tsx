import React, { useMemo, useState, useEffect } from 'react';
import India from '@svg-maps/india';
import { WeatherMapMetric, MapLayerControl } from './MapLayerControl';
import { MapLegend } from './MapLegend';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge, StatusVariant } from '../common/StatusBadge';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

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
  data?: StateWeatherData[];
  metric?: WeatherMapMetric | string;
  onMetricChange?: (metric: WeatherMapMetric) => void;
  selectedState?: string | null;
  onStateSelect?: (state: StateWeatherData) => void;
  onSelectState?: (state: StateWeatherData) => void;
}

const MAP_THEME = {
  defaultState: '#1E2733',
  hoverState: '#0B72B9',
  selectedStroke: '#FFFFFF',
  hoverStroke: '#4FA8E0',
  defaultStroke: '#334155',
};

// Normalize any metric string input
export function normalizeMetric(m?: string): WeatherMapMetric {
  if (!m) return 'temperature';
  const lower = m.toLowerCase();
  if (lower.includes('temp')) return 'temperature';
  if (lower.includes('rain')) return 'rainfall';
  if (lower.includes('aqi') || lower.includes('air')) return 'aqi';
  if (lower.includes('humid') || lower.includes('rh')) return 'humidity';
  if (lower.includes('pollen')) return 'pollen';
  return 'temperature';
}

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

// Comprehensive aliases mapping SVG map IDs / names to unified state records
const STATE_ALIAS_MAP: Record<string, string> = {
  an: 'in-an',
  ap: 'in-ap',
  ar: 'in-ar',
  as: 'in-as',
  br: 'in-br',
  ch: 'in-ch',
  ct: 'in-cg',
  cg: 'in-cg',
  dn: 'in-dn',
  dd: 'in-dn',
  dl: 'in-dl',
  ga: 'in-ga',
  gj: 'in-gj',
  hr: 'in-hr',
  hp: 'in-hp',
  jk: 'in-jk',
  jh: 'in-jh',
  ka: 'in-ka',
  kl: 'in-kl',
  la: 'in-la',
  ld: 'in-ld',
  mp: 'in-mp',
  mh: 'in-mh',
  mn: 'in-mn',
  ml: 'in-ml',
  mz: 'in-mz',
  nl: 'in-nl',
  or: 'in-od',
  od: 'in-od',
  py: 'in-py',
  pb: 'in-pb',
  rj: 'in-rj',
  sk: 'in-sk',
  tn: 'in-tn',
  tg: 'in-ts',
  ts: 'in-ts',
  tr: 'in-tr',
  up: 'in-up',
  ut: 'in-uk',
  uk: 'in-uk',
  wb: 'in-wb',
  orissa: 'in-od',
  odisha: 'in-od',
  chhattisgarh: 'in-cg',
  telangana: 'in-ts',
  uttarakhand: 'in-uk',
  uttaranchal: 'in-uk',
  'dadra and nagar haveli': 'in-dn',
  'daman and diu': 'in-dn',
  'dadra and nagar haveli and daman and diu': 'in-dn',
  'andaman and nicobar islands': 'in-an',
  'jammu and kashmir': 'in-jk',
  ladakh: 'in-la',
  pondicherry: 'in-py',
  puducherry: 'in-py',
  delhi: 'in-dl',
  'national capital territory of delhi': 'in-dl',
};

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({
  data = INDIA_WEATHER_DATA,
  metric: controlledMetric,
  onMetricChange,
  selectedState: controlledSelectedState,
  onStateSelect,
  onSelectState,
}) => {
  const handleSelectCallback = onStateSelect || onSelectState;

  const [internalMetric, setInternalMetric] = useState<WeatherMapMetric>('temperature');
  const activeMetric: WeatherMapMetric = normalizeMetric(controlledMetric || internalMetric);

  const handleMetricChange = (newMetric: WeatherMapMetric) => {
    setInternalMetric(newMetric);
    if (onMetricChange) {
      onMetricChange(newMetric);
    }
  };

  const [hoveredState, setHoveredState] = useState<StateWeatherData | null>(null);
  const [internalSelectedState, setInternalSelectedState] = useState<string>('Odisha');

  useEffect(() => {
    if (controlledSelectedState) {
      setInternalSelectedState(controlledSelectedState);
    }
  }, [controlledSelectedState]);

  // Robust Map lookup table
  const stateMap = useMemo(() => {
    const map = new Map<string, StateWeatherData>();
    const safeData = data && data.length > 0 ? data : INDIA_WEATHER_DATA;

    safeData.forEach((s) => {
      const lowerId = s.id.toLowerCase();
      const lowerName = s.name.toLowerCase();
      const cleanId = lowerId.replace('in-', '');

      map.set(lowerId, s);
      map.set(lowerName, s);
      map.set(cleanId, s);

      // Map known aliases
      if (lowerName.includes('odisha') || lowerName.includes('orissa')) {
        map.set('or', s);
        map.set('od', s);
        map.set('orissa', s);
      }
      if (lowerName.includes('chhattisgarh')) {
        map.set('ct', s);
        map.set('cg', s);
      }
      if (lowerName.includes('telangana')) {
        map.set('tg', s);
        map.set('ts', s);
      }
      if (lowerName.includes('uttarakhand') || lowerName.includes('uttaranchal')) {
        map.set('ut', s);
        map.set('uk', s);
      }
      if (lowerName.includes('dadra') || lowerName.includes('daman')) {
        map.set('dn', s);
        map.set('dd', s);
      }
      if (lowerName.includes('andaman')) {
        map.set('an', s);
      }
      if (lowerName.includes('puducherry') || lowerName.includes('pondicherry')) {
        map.set('py', s);
      }
      if (lowerName.includes('delhi')) {
        map.set('dl', s);
      }
    });

    return map;
  }, [data]);

  const findStateData = (location: any): StateWeatherData => {
    const rawId = (location.id || '').toLowerCase();
    const rawName = (location.name || '').toLowerCase();

    // 1. Direct key
    if (stateMap.has(rawId)) return stateMap.get(rawId)!;
    if (stateMap.has(rawName)) return stateMap.get(rawName)!;

    // 2. Alias key
    const aliasTarget = STATE_ALIAS_MAP[rawId] || STATE_ALIAS_MAP[rawName];
    if (aliasTarget && stateMap.has(aliasTarget)) {
      return stateMap.get(aliasTarget)!;
    }

    // 3. Substring match
    for (const [key, val] of stateMap.entries()) {
      if (rawName.includes(key) || key.includes(rawName)) {
        return val;
      }
    }

    // 4. Default fallback
    return {
      id: location.id || 'IN-DEF',
      name: location.name || 'Regional Meteorological Subdivision',
      city: 'Capital City',
      temperature: 28,
      humidity: 65,
      aqi: 75,
      pollen: 2,
      rainfall: 2,
      condition: 'Clear Sky',
    };
  };

  const isStateSelected = (location: any) => {
    const currentSelection = (controlledSelectedState || internalSelectedState || 'Odisha').toLowerCase().trim();
    const sId = (location.id || '').toLowerCase();
    const sName = (location.name || '').toLowerCase();
    const cleanId = sId.replace('in-', '');

    const targetAlias = STATE_ALIAS_MAP[currentSelection] || currentSelection;
    const locAlias = STATE_ALIAS_MAP[sId] || STATE_ALIAS_MAP[sName] || sId;

    return (
      currentSelection === sId ||
      currentSelection === sName ||
      currentSelection === cleanId ||
      targetAlias === locAlias ||
      sName.includes(currentSelection) ||
      currentSelection.includes(sName)
    );
  };

  // Determine currently active state for the details panel
  const activeObservationState = useMemo<StateWeatherData>(() => {
    if (hoveredState) return hoveredState;

    const currentSelection = (controlledSelectedState || internalSelectedState || 'Odisha').toLowerCase().trim();
    const targetAlias = STATE_ALIAS_MAP[currentSelection] || currentSelection;

    if (stateMap.has(currentSelection)) return stateMap.get(currentSelection)!;
    if (stateMap.has(targetAlias)) return stateMap.get(targetAlias)!;

    for (const [key, val] of stateMap.entries()) {
      if (key.includes(currentSelection) || currentSelection.includes(key)) {
        return val;
      }
    }

    return (
      stateMap.get('odisha') ||
      stateMap.get('in-od') ||
      INDIA_WEATHER_DATA[0]
    );
  }, [hoveredState, controlledSelectedState, internalSelectedState, stateMap]);

  const handleStateClick = (stateData: StateWeatherData) => {
    setInternalSelectedState(stateData.name);
    if (handleSelectCallback) {
      handleSelectCallback(stateData);
    }
  };

  // Metric qualitative helpers
  const getMetricBadge = (state: StateWeatherData, m: WeatherMapMetric): { label: string; variant: StatusVariant } => {
    switch (m) {
      case 'temperature': {
        const val = state.temperature ?? 28;
        if (val >= 35) return { label: 'Heatwave Alert', variant: 'danger' };
        if (val >= 31) return { label: 'Hot', variant: 'alert' };
        if (val >= 27) return { label: 'Warm', variant: 'warning' };
        if (val >= 23) return { label: 'Optimal', variant: 'good' };
        return { label: 'Cool', variant: 'neutral' };
      }
      case 'rainfall': {
        const val = state.rainfall ?? 0;
        if (val >= 30) return { label: 'Very Heavy Rain', variant: 'danger' };
        if (val >= 15) return { label: 'Heavy Rain', variant: 'alert' };
        if (val >= 5) return { label: 'Moderate Rain', variant: 'warning' };
        if (val > 0) return { label: 'Light Showers', variant: 'neutral' };
        return { label: 'Dry (0 mm)', variant: 'good' };
      }
      case 'aqi': {
        const val = state.aqi ?? 75;
        if (val > 300) return { label: 'Severe AQI', variant: 'danger' };
        if (val > 200) return { label: 'Poor AQI', variant: 'alert' };
        if (val > 100) return { label: 'Moderate', variant: 'warning' };
        if (val > 50) return { label: 'Satisfactory', variant: 'neutral' };
        return { label: 'Good AQI', variant: 'good' };
      }
      case 'humidity': {
        const val = state.humidity ?? 65;
        if (val > 80) return { label: 'Very Humid', variant: 'warning' };
        if (val < 40) return { label: 'Dry Air', variant: 'neutral' };
        return { label: 'Comfortable', variant: 'good' };
      }
      case 'pollen': {
        const val = state.pollen ?? 2;
        if (val >= 4) return { label: 'High Pollen', variant: 'alert' };
        if (val === 3) return { label: 'Moderate', variant: 'warning' };
        return { label: 'Low Risk', variant: 'good' };
      }
      default:
        return { label: 'Normal', variant: 'neutral' };
    }
  };

  const metricBadge = getMetricBadge(activeObservationState, activeMetric);

  return (
    <div className="mausam-card flex flex-col gap-4">
      {/* Header with Title and Layer Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#334155] gap-3">
        <SectionHeader
          title="National Synoptic Meteorological Map"
          subtitle="All India State & Union Territory Observational Layers"
          icon="map"
        />

        <MapLayerControl
          activeMetric={activeMetric}
          onMetricChange={handleMetricChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG India Map Visualizer */}
        <div className="lg:col-span-2 relative bg-[#0F141A] border border-[#334155] rounded p-4 flex flex-col items-center justify-center min-h-[440px]">
          {/* Active Layer Watermark Badge */}
          <div className="absolute top-3 left-3 bg-[#17212B]/90 border border-[#334155] px-2.5 py-1 rounded text-xs flex items-center gap-2 z-10">
            <span className="w-2 h-2 rounded-full bg-[#1ABC9C] animate-pulse"></span>
            <span className="text-[#8A94A6] text-[11px]">Layer:</span>
            <strong className="text-white uppercase font-mono text-[11px]">
              {activeMetric}
            </strong>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={India.viewBox}
            className="w-full max-h-[450px] select-none"
            aria-label="National Meteorological Map of India"
          >
            {India.locations.map((loc: any) => {
              const stateData = findStateData(loc);
              const isSelected = isStateSelected(loc);
              const isHovered = hoveredState?.id === stateData.id || hoveredState?.name === stateData.name;
              const fillColor = getStateColor(stateData, activeMetric);

              return (
                <path
                  key={loc.id}
                  id={loc.id}
                  name={loc.name}
                  d={loc.path}
                  fill={isHovered ? MAP_THEME.hoverState : isSelected ? '#0B72B9' : fillColor}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#4FA8E0' : '#2D3748'}
                  strokeWidth={isSelected ? 2.2 : isHovered ? 1.6 : 0.8}
                  style={{
                    cursor: 'pointer',
                    transition: 'fill 150ms ease, stroke 150ms ease, stroke-width 150ms ease',
                  }}
                  onMouseEnter={() => setHoveredState(stateData)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => handleStateClick(stateData)}
                >
                  <title>
                    {stateData.name}: {stateData.temperature}°C | {stateData.condition || 'Normal'} | AQI {stateData.aqi} | Rain {stateData.rainfall}mm
                  </title>
                </path>
              );
            })}
          </svg>

          {/* Hover Floating Box */}
          {hoveredState && (
            <div className="absolute top-3 right-3 bg-[#17212B]/95 border border-[#4FA8E0] rounded p-3 shadow-xl pointer-events-none text-xs z-20 min-w-[170px] backdrop-blur-sm animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-xs">{hoveredState.name}</span>
                <span className="text-[10px] text-[#4FA8E0] bg-[#4FA8E0]/15 px-1.5 py-0.5 rounded font-mono">
                  {hoveredState.condition || 'Observatory'}
                </span>
              </div>
              <div className="text-[#8A94A6] text-[10px] mt-0.5">Capital: {hoveredState.city || 'Regional AWS'}</div>
              
              <div className="mt-2 pt-2 border-t border-[#334155] flex flex-col gap-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Temperature:</span>
                  <span className="text-white font-bold">{hoveredState.temperature ?? '—'}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Air Quality:</span>
                  <span className="text-[#F1C40F] font-bold">{hoveredState.aqi ?? '—'} AQI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Rainfall (24h):</span>
                  <span className="text-[#4FA8E0] font-bold">{hoveredState.rainfall ?? 0} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Humidity:</span>
                  <span className="text-white font-bold">{hoveredState.humidity ?? '—'}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* State Telemetry Details Panel with ALLOCATED DATA */}
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="bg-[#1E2733] border border-[#334155] rounded p-3.5 flex flex-col gap-3">
            {/* Header of observation card */}
            <div className="flex items-start justify-between gap-2 border-b border-[#334155] pb-2.5">
              <div>
                <span className="text-[10px] text-[#4FA8E0] font-bold uppercase tracking-wider block">
                  SELECTED SUB-DIVISION OBSERVATION
                </span>
                <h3 className="text-white font-bold text-lg leading-tight mt-0.5">
                  {activeObservationState.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#8A94A6]">
                    Capital: <strong className="text-white">{activeObservationState.city || 'Regional Center'}</strong>
                  </span>
                  <span className="text-[#334155]">•</span>
                  <span className="text-xs text-[#1ABC9C]">
                    {activeObservationState.condition || 'Partly Cloudy'}
                  </span>
                </div>
              </div>

              <StatusBadge label={metricBadge.label} variant={metricBadge.variant} />
            </div>

            {/* Primary Highlight Metric */}
            <div className="bg-[#0F141A] p-3 rounded border border-[#334155] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
                  Active Layer Observation ({activeMetric})
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {activeMetric === 'temperature' && `${activeObservationState.temperature}°C (${Math.round((activeObservationState.temperature || 28) * 1.8 + 32)}°F)`}
                  {activeMetric === 'rainfall' && `${activeObservationState.rainfall ?? 0} mm`}
                  {activeMetric === 'aqi' && `${activeObservationState.aqi} AQI`}
                  {activeMetric === 'humidity' && `${activeObservationState.humidity}% RH`}
                  {activeMetric === 'pollen' && `Level ${activeObservationState.pollen} / 5`}
                </div>
              </div>

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: getStateColor(activeObservationState, activeMetric) }}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {activeMetric === 'temperature' && 'thermostat'}
                  {activeMetric === 'rainfall' && 'rainy'}
                  {activeMetric === 'aqi' && 'air'}
                  {activeMetric === 'humidity' && 'water_drop'}
                  {activeMetric === 'pollen' && 'grain'}
                </span>
              </div>
            </div>

            {/* Comprehensive Allocated Data Grid for State */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Surface Temp</span>
                <span className="text-white font-bold font-mono text-sm">
                  {activeObservationState.temperature ?? 28}°C
                </span>
              </div>

              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">24h Rainfall</span>
                <span className="text-[#4FA8E0] font-bold font-mono text-sm">
                  {activeObservationState.rainfall ?? 0} mm
                </span>
              </div>

              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Air Quality Index</span>
                <span className="text-[#F1C40F] font-bold font-mono text-sm">
                  {activeObservationState.aqi ?? 75} AQI
                </span>
              </div>

              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Relative Humidity</span>
                <span className="text-white font-bold font-mono text-sm">
                  {activeObservationState.humidity ?? 65}%
                </span>
              </div>

              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Pollen Risk</span>
                <span className="text-[#2ECC71] font-bold font-mono text-sm">
                  {activeObservationState.pollen ?? 2} / 5 Risk
                </span>
              </div>

              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Station Network</span>
                <span className="text-white font-semibold text-[11px] truncate block">
                  Synoptic AWS
                </span>
              </div>
            </div>

            {/* Action button to select state / focus observatory */}
            {handleSelectCallback && (
              <button
                type="button"
                onClick={() => handleStateClick(activeObservationState)}
                className="w-full py-2 px-3 bg-[#0B72B9] hover:bg-[#0B72B9]/80 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span className="material-symbols-outlined text-[15px]">my_location</span>
                <span>Set {activeObservationState.name} as Active Forecast Station</span>
              </button>
            )}
          </div>

          {/* Dynamic Metric Legend */}
          <MapLegend metric={activeMetric} />

          <div className="p-2.5 bg-[#17212B] border border-[#334155] rounded text-[11px] text-[#8A94A6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#4FA8E0] shrink-0">
              touch_app
            </span>
            <span>Click any Indian state to load its live synoptic observation data.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaWeatherMap;

