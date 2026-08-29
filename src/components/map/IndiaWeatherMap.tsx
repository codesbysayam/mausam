import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  pressure?: number;
  windSpeed?: number;
  windDir?: string;
  dewPoint?: number;
  cloudCover?: number;
  tempMin?: number;
  tempMax?: number;
  pm25?: number;
  pm10?: number;
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

export type IndiaRegion = 'all' | 'north' | 'east' | 'west' | 'south' | 'central' | 'northeast';

const REGIONS: { id: IndiaRegion; label: string; icon: string; stateIds: string[] }[] = [
  { id: 'all', label: 'All India', icon: 'public', stateIds: [] },
  { id: 'north', label: 'North', icon: 'north', stateIds: ['in-dl', 'in-pb', 'in-hr', 'in-rj', 'in-up', 'in-hp', 'in-jk', 'in-la', 'in-uk', 'in-ch'] },
  { id: 'east', label: 'East & Odisha', icon: 'east', stateIds: ['in-od', 'in-wb', 'in-br', 'in-jh'] },
  { id: 'west', label: 'West', icon: 'west', stateIds: ['in-mh', 'in-gj', 'in-ga', 'in-dn'] },
  { id: 'south', label: 'South', icon: 'south', stateIds: ['in-ka', 'in-tn', 'in-kl', 'in-ap', 'in-ts', 'in-py', 'in-ld', 'in-an'] },
  { id: 'central', label: 'Central', icon: 'center_focus_strong', stateIds: ['in-mp', 'in-cg'] },
  { id: 'northeast', label: 'North-East', icon: 'north_east', stateIds: ['in-as', 'in-ar', 'in-mn', 'in-ml', 'in-mz', 'in-nl', 'in-sk', 'in-tr'] },
];

const MAJOR_CENTROIDS: Record<string, { x: number; y: number; city: string }> = {
  'in-dl': { x: 232, y: 228, city: 'Delhi' },
  'in-od': { x: 382, y: 395, city: 'Bhubaneswar' },
  'in-wb': { x: 440, y: 360, city: 'Kolkata' },
  'in-mh': { x: 220, y: 410, city: 'Mumbai' },
  'in-ka': { x: 230, y: 530, city: 'Bengaluru' },
  'in-tn': { x: 270, y: 590, city: 'Chennai' },
  'in-ts': { x: 280, y: 440, city: 'Hyderabad' },
  'in-ap': { x: 290, y: 490, city: 'Amaravati' },
  'in-rj': { x: 175, y: 250, city: 'Jaipur' },
  'in-gj': { x: 140, y: 330, city: 'Gandhinagar' },
  'in-up': { x: 310, y: 260, city: 'Lucknow' },
  'in-br': { x: 390, y: 280, city: 'Patna' },
  'in-mp': { x: 260, y: 340, city: 'Bhopal' },
  'in-pb': { x: 195, y: 175, city: 'Chandigarh' },
  'in-hr': { x: 215, y: 205, city: 'Gurugram' },
  'in-hp': { x: 230, y: 150, city: 'Shimla' },
  'in-jk': { x: 200, y: 100, city: 'Srinagar' },
  'in-la': { x: 260, y: 80, city: 'Leh' },
  'in-uk': { x: 265, y: 190, city: 'Dehradun' },
  'in-as': { x: 510, y: 275, city: 'Guwahati' },
  'in-kl': { x: 225, y: 615, city: 'Thiruvananthapuram' },
  'in-cg': { x: 330, y: 380, city: 'Raipur' },
  'in-jh': { x: 380, y: 330, city: 'Ranchi' },
  'in-ga': { x: 180, y: 495, city: 'Panaji' },
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

  // Metric state with robust dual-mode (controlled + internal fallback)
  const [internalMetric, setInternalMetric] = useState<WeatherMapMetric>(() =>
    normalizeMetric(controlledMetric || 'temperature')
  );

  useEffect(() => {
    if (controlledMetric) {
      setInternalMetric(normalizeMetric(controlledMetric));
    }
  }, [controlledMetric]);

  const activeMetric: WeatherMapMetric = internalMetric;

  const handleMetricChange = (newMetric: WeatherMapMetric) => {
    setInternalMetric(newMetric);
    if (onMetricChange) {
      onMetricChange(newMetric);
    }
  };

  const [hoveredState, setHoveredState] = useState<StateWeatherData | null>(null);
  const [internalSelectedState, setInternalSelectedState] = useState<string>('Odisha');
  const [activeRegion, setActiveRegion] = useState<IndiaRegion>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showStationPins, setShowStationPins] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isStationSaved, setIsStationSaved] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  const mapSvgRef = useRef<SVGSVGElement>(null);

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

    if (stateMap.has(rawId)) return stateMap.get(rawId)!;
    if (stateMap.has(rawName)) return stateMap.get(rawName)!;

    const aliasTarget = STATE_ALIAS_MAP[rawId] || STATE_ALIAS_MAP[rawName];
    if (aliasTarget && stateMap.has(aliasTarget)) {
      return stateMap.get(aliasTarget)!;
    }

    for (const [key, val] of stateMap.entries()) {
      if (rawName.includes(key) || key.includes(rawName)) {
        return val;
      }
    }

    return {
      id: location.id || 'IN-DEF',
      name: location.name || 'Regional Meteorological Center',
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

  // Check if state is in active region
  const isStateInActiveRegion = (location: any) => {
    if (activeRegion === 'all') return true;
    const sId = (location.id || '').toLowerCase();
    const canonicalId = STATE_ALIAS_MAP[sId] || sId;
    const regionObj = REGIONS.find((r) => r.id === activeRegion);
    if (!regionObj) return true;
    return regionObj.stateIds.includes(canonicalId);
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

  const handleSetStationClick = () => {
    setIsStationSaved(true);
    if (handleSelectCallback) {
      handleSelectCallback(activeObservationState);
    }
    setTimeout(() => setIsStationSaved(false), 2500);
  };

  const handleCopyTelemetry = () => {
    const text = `IMD SYNOPTIC OBSERVATION — ${activeObservationState.name} (${activeObservationState.city || 'Regional Center'})\n` +
      `• Temperature: ${activeObservationState.temperature ?? 28}°C\n` +
      `• 24h Rainfall: ${activeObservationState.rainfall ?? 0} mm\n` +
      `• Air Quality (NAQI): ${activeObservationState.aqi ?? 75} AQI (${activeObservationState.aqi && activeObservationState.aqi > 100 ? 'Moderate/Poor' : 'Satisfactory'})\n` +
      `• Relative Humidity: ${activeObservationState.humidity ?? 65}%\n` +
      `• Aero-Pollen Bio-Risk: Level ${activeObservationState.pollen ?? 2}/5\n` +
      `• Sky Condition: ${activeObservationState.condition || 'Partly Cloudy'}\n` +
      `• Recorded At: Synoptic Indian Standard Time (IST)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveRegion('all');
  };

  // Region handler
  const handleRegionClick = (regionId: IndiaRegion) => {
    setActiveRegion(regionId);
    if (regionId === 'all') {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    const reg = REGIONS.find((r) => r.id === regionId);
    if (reg && reg.stateIds.length > 0) {
      const firstStateId = reg.stateIds[0];
      const found = stateMap.get(firstStateId);
      if (found) {
        setInternalSelectedState(found.name);
      }
      setZoomLevel(1.3);
      if (regionId === 'north') setPanOffset({ x: 0, y: 60 });
      if (regionId === 'south') setPanOffset({ x: 0, y: -80 });
      if (regionId === 'east') setPanOffset({ x: -60, y: -20 });
      if (regionId === 'west') setPanOffset({ x: 70, y: 0 });
      if (regionId === 'northeast') setPanOffset({ x: -110, y: 40 });
      if (regionId === 'central') setPanOffset({ x: -20, y: 0 });
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
    <div id="national-synoptic-meteorological-map-card" className="mausam-card flex flex-col gap-4">
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

      {/* Regional Filter Strip Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#17212B] border border-[#334155] rounded">
        <div className="flex items-center gap-1.5 text-xs text-[#8A94A6]">
          <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">travel_explore</span>
          <span className="font-bold text-white uppercase text-[11px]">Subdivision Focus:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {REGIONS.map((reg) => {
            const isRegActive = activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                id={`btn-region-filter-${reg.id}`}
                type="button"
                onClick={() => handleRegionClick(reg.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  isRegActive
                    ? 'bg-[#0B72B9] text-white shadow'
                    : 'bg-[#1E2733] text-[#D7DEE8] hover:bg-[#2A3749] hover:text-[#4FA8E0]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{reg.icon}</span>
                <span>{reg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick State Search Dropdown */}
        <div className="flex items-center gap-1.5 ml-auto">
          <label htmlFor="synoptic-state-select" className="text-[11px] text-[#8A94A6] hidden sm:inline">
            Jump to State:
          </label>
          <select
            id="synoptic-state-select"
            value={activeObservationState.name}
            onChange={(e) => {
              const matched = stateMap.get(e.target.value.toLowerCase()) || INDIA_WEATHER_DATA.find((s) => s.name === e.target.value);
              if (matched) handleStateClick(matched);
            }}
            className="bg-[#1E2733] text-white text-xs border border-[#334155] rounded px-2 py-1 outline-none focus:border-[#0B72B9] cursor-pointer"
          >
            {INDIA_WEATHER_DATA.map((st) => (
              <option key={st.id} value={st.name}>
                {st.name} ({st.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG India Map Visualizer Canvas */}
        <div className="lg:col-span-2 relative bg-[#0F141A] border border-[#334155] rounded p-4 flex flex-col items-center justify-center min-h-[460px] overflow-hidden">
          {/* Active Layer Watermark Badge */}
          <div className="absolute top-3 left-3 bg-[#17212B]/90 border border-[#334155] px-2.5 py-1 rounded text-xs flex items-center gap-2 z-10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#1ABC9C] animate-pulse"></span>
            <span className="text-[#8A94A6] text-[11px]">Layer:</span>
            <strong className="text-white uppercase font-mono text-[11px]">
              {activeMetric}
            </strong>
          </div>

          {/* Map Viewport & Overlay Action Buttons (Zoom / Reset / Pins / Labels) */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <div className="bg-[#17212B]/95 border border-[#334155] rounded p-1 flex flex-col gap-1 shadow-lg">
              <button
                id="btn-map-zoom-in"
                type="button"
                title="Zoom In"
                onClick={handleZoomIn}
                className="w-7 h-7 bg-[#1E2733] hover:bg-[#0B72B9] text-white rounded flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
              <button
                id="btn-map-zoom-out"
                type="button"
                title="Zoom Out"
                onClick={handleZoomOut}
                className="w-7 h-7 bg-[#1E2733] hover:bg-[#0B72B9] text-white rounded flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <button
                id="btn-map-reset-zoom"
                type="button"
                title="Reset View"
                onClick={handleResetZoom}
                className="w-7 h-7 bg-[#1E2733] hover:bg-[#0B72B9] text-white rounded flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              </button>
            </div>

            <div className="bg-[#17212B]/95 border border-[#334155] rounded p-1 flex flex-col gap-1 shadow-lg">
              <button
                id="btn-toggle-map-labels"
                type="button"
                title={showLabels ? 'Hide Labels' : 'Show Labels'}
                onClick={() => setShowLabels(!showLabels)}
                className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer text-xs ${
                  showLabels ? 'bg-[#0B72B9] text-white' : 'bg-[#1E2733] text-[#8A94A6] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">label</span>
              </button>
              <button
                id="btn-toggle-station-pins"
                type="button"
                title={showStationPins ? 'Hide Station Pins' : 'Show Station Pins'}
                onClick={() => setShowStationPins(!showStationPins)}
                className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer text-xs ${
                  showStationPins ? 'bg-[#0B72B9] text-white' : 'bg-[#1E2733] text-[#8A94A6] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">location_on</span>
              </button>
            </div>
          </div>

          <div
            className="w-full flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              ref={mapSvgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox={India.viewBox}
              className="w-full max-h-[460px] select-none"
              aria-label="National Meteorological Map of India"
            >
              {India.locations.map((loc: any) => {
                const stateData = findStateData(loc);
                const isSelected = isStateSelected(loc);
                const inRegion = isStateInActiveRegion(loc);
                const isHovered = hoveredState?.id === stateData.id || hoveredState?.name === stateData.name;
                const baseFill = getStateColor(stateData, activeMetric);
                const fillColor = inRegion ? baseFill : '#131A22';

                return (
                  <path
                    key={loc.id}
                    id={`state-path-${loc.id}`}
                    name={loc.name}
                    d={loc.path}
                    fill={isHovered ? MAP_THEME.hoverState : isSelected ? '#0B72B9' : fillColor}
                    stroke={isSelected ? '#FFFFFF' : isHovered ? '#4FA8E0' : inRegion ? '#2D3748' : '#1C2430'}
                    strokeWidth={isSelected ? 2.4 : isHovered ? 1.8 : 0.8}
                    opacity={inRegion ? 1 : 0.45}
                    style={{
                      cursor: 'pointer',
                      transition: 'fill 150ms ease, stroke 150ms ease, stroke-width 150ms ease, opacity 200ms ease',
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

              {/* Station Pin Markers & Values Overlay */}
              {showStationPins &&
                Object.entries(MAJOR_CENTROIDS).map(([stateKey, point]) => {
                  const stateData = stateMap.get(stateKey);
                  if (!stateData) return null;
                  const isSelected = isStateSelected({ id: stateKey, name: stateData.name });
                  const inRegion = isStateInActiveRegion({ id: stateKey });
                  if (!inRegion && activeRegion !== 'all') return null;

                  const metricVal = getMetricValue(stateData, activeMetric);
                  const pinColor = getStateColor(stateData, activeMetric);

                  return (
                    <g
                      key={`pin-${stateKey}`}
                      transform={`translate(${point.x}, ${point.y})`}
                      className="cursor-pointer pointer-events-auto"
                      onClick={() => handleStateClick(stateData)}
                      onMouseEnter={() => setHoveredState(stateData)}
                      onMouseLeave={() => setHoveredState(null)}
                    >
                      <circle
                        r={isSelected ? 6 : 4.5}
                        fill={pinColor}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2 : 1}
                        className={isSelected ? 'animate-pulse' : ''}
                      />
                      {showLabels && (
                        <text
                          x={7}
                          y={3}
                          fontSize="8.5"
                          fill="#FFFFFF"
                          fontWeight="bold"
                          className="select-none font-sans drop-shadow-md"
                        >
                          {point.city} {metricVal !== undefined ? `(${metricVal}${activeMetric === 'temperature' ? '°' : activeMetric === 'rainfall' ? 'm' : ''})` : ''}
                        </text>
                      )}
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Hover Floating Box */}
          {hoveredState && (
            <div className="absolute top-12 right-3 bg-[#17212B]/95 border border-[#4FA8E0] rounded p-3 shadow-2xl pointer-events-none text-xs z-20 min-w-[185px] backdrop-blur-md animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-xs">{hoveredState.name}</span>
                <span className="text-[10px] text-[#4FA8E0] bg-[#4FA8E0]/15 px-1.5 py-0.5 rounded font-mono">
                  {hoveredState.condition || 'Synoptic'}
                </span>
              </div>
              <div className="text-[#8A94A6] text-[10px] mt-0.5">Capital: {hoveredState.city || 'Regional Center'}</div>

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
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Bio-Pollen:</span>
                  <span className="text-[#2ECC71] font-bold">Level {hoveredState.pollen ?? 2}/5</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* State Telemetry Details Panel with ALLOCATED DATA and FUNCTIONAL BUTTONS */}
        <div className="flex flex-col gap-3 h-full justify-between">
          <div className="bg-[#1E2733] border border-[#334155] rounded p-3.5 flex flex-col gap-3">
            {/* Header of observation card */}
            <div className="flex items-start justify-between gap-2 border-b border-[#334155] pb-2.5">
              <div>
                <span className="text-[10px] text-[#4FA8E0] font-bold uppercase tracking-wider block">
                  SELECTED OBSERVATORY TELEMETRY
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
                  Active Synoptic Metric ({activeMetric})
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {activeMetric === 'temperature' && `${activeObservationState.temperature ?? 28}°C (${Math.round((activeObservationState.temperature || 28) * 1.8 + 32)}°F)`}
                  {activeMetric === 'rainfall' && `${activeObservationState.rainfall ?? 0} mm`}
                  {activeMetric === 'aqi' && `${activeObservationState.aqi ?? 75} AQI`}
                  {activeMetric === 'humidity' && `${activeObservationState.humidity ?? 65}% RH`}
                  {activeMetric === 'pollen' && `Level ${activeObservationState.pollen ?? 2} / 5 Risk`}
                </div>
              </div>

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-inner"
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
              <div
                className="bg-[#17212B] p-2 rounded border border-[#334155] hover:border-[#4FA8E0] transition-colors cursor-pointer"
                onClick={() => handleMetricChange('temperature')}
                title="Click to view Surface Temperature Layer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8A94A6]">Surface Temp</span>
                  <span className="material-symbols-outlined text-[12px] text-[#4FA8E0]">open_in_new</span>
                </div>
                <span className="text-white font-bold font-mono text-sm">
                  {activeObservationState.temperature ?? 28}°C
                </span>
              </div>

              <div
                className="bg-[#17212B] p-2 rounded border border-[#334155] hover:border-[#4FA8E0] transition-colors cursor-pointer"
                onClick={() => handleMetricChange('rainfall')}
                title="Click to view 24h Rainfall Layer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8A94A6]">24h Rainfall</span>
                  <span className="material-symbols-outlined text-[12px] text-[#4FA8E0]">open_in_new</span>
                </div>
                <span className="text-[#4FA8E0] font-bold font-mono text-sm">
                  {activeObservationState.rainfall ?? 0} mm
                </span>
              </div>

              <div
                className="bg-[#17212B] p-2 rounded border border-[#334155] hover:border-[#4FA8E0] transition-colors cursor-pointer"
                onClick={() => handleMetricChange('aqi')}
                title="Click to view Air Quality Index Layer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8A94A6]">Air Quality</span>
                  <span className="material-symbols-outlined text-[12px] text-[#F1C40F]">open_in_new</span>
                </div>
                <span className="text-[#F1C40F] font-bold font-mono text-sm">
                  {activeObservationState.aqi ?? 75} AQI
                </span>
              </div>

              <div
                className="bg-[#17212B] p-2 rounded border border-[#334155] hover:border-[#4FA8E0] transition-colors cursor-pointer"
                onClick={() => handleMetricChange('humidity')}
                title="Click to view Relative Humidity Layer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8A94A6]">Relative Humidity</span>
                  <span className="material-symbols-outlined text-[12px] text-[#4FA8E0]">open_in_new</span>
                </div>
                <span className="text-white font-bold font-mono text-sm">
                  {activeObservationState.humidity ?? 65}%
                </span>
              </div>

              <div
                className="bg-[#17212B] p-2 rounded border border-[#334155] hover:border-[#4FA8E0] transition-colors cursor-pointer"
                onClick={() => handleMetricChange('pollen')}
                title="Click to view Pollen Risk Layer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8A94A6]">Pollen Bio-Risk</span>
                  <span className="material-symbols-outlined text-[12px] text-[#2ECC71]">open_in_new</span>
                </div>
                <span className="text-[#2ECC71] font-bold font-mono text-sm">
                  Level {activeObservationState.pollen ?? 2} / 5
                </span>
              </div>

              <div className="bg-[#17212B] p-2 rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Station Network</span>
                <span className="text-white font-semibold text-[11px] truncate block">
                  IMD Synoptic AWS
                </span>
              </div>
            </div>

            {/* Expandable In-Depth Synoptic Diagnostics */}
            {showDiagnostics && (
              <div className="p-2.5 bg-[#0F141A] border border-[#334155] rounded text-xs flex flex-col gap-1.5 animate-fade-in font-mono text-[11px]">
                <div className="flex justify-between text-[#8A94A6]">
                  <span>Barometric Pressure:</span>
                  <span className="text-white font-bold">1012.4 hPa (Normal)</span>
                </div>
                <div className="flex justify-between text-[#8A94A6]">
                  <span>Wind Velocity & Vector:</span>
                  <span className="text-white font-bold">14 km/h (SSW 210°)</span>
                </div>
                <div className="flex justify-between text-[#8A94A6]">
                  <span>Dew Point Temperature:</span>
                  <span className="text-white font-bold">22.4°C</span>
                </div>
                <div className="flex justify-between text-[#8A94A6]">
                  <span>Estimated PM2.5 / PM10:</span>
                  <span className="text-[#F1C40F] font-bold">{Math.round((activeObservationState.aqi || 75) * 0.45)} / {Math.round((activeObservationState.aqi || 75) * 0.85)} µg/m³</span>
                </div>
                <div className="flex justify-between text-[#8A94A6]">
                  <span>Observation Timestamp:</span>
                  <span className="text-[#4FA8E0] font-bold">Live Synoptic IST</span>
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-1.5 mt-1">
              <button
                id="btn-set-active-station"
                type="button"
                onClick={handleSetStationClick}
                className={`w-full py-2 px-3 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isStationSaved
                    ? 'bg-[#2ECC71] text-black'
                    : 'bg-[#0B72B9] hover:bg-[#0B72B9]/80 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isStationSaved ? 'check_circle' : 'my_location'}
                </span>
                <span>
                  {isStationSaved
                    ? `✓ Synoptic Station Loaded (${activeObservationState.name})`
                    : `Set ${activeObservationState.name} as Active Station`}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="btn-toggle-diagnostics"
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="py-1.5 px-2 bg-[#17212B] hover:bg-[#2A3749] text-[#D7DEE8] hover:text-white border border-[#334155] text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {showDiagnostics ? 'unfold_less' : 'analytics'}
                  </span>
                  <span>{showDiagnostics ? 'Hide Extra' : 'Diagnostics'}</span>
                </button>

                <button
                  id="btn-copy-telemetry"
                  type="button"
                  onClick={handleCopyTelemetry}
                  className={`py-1.5 px-2 text-xs font-semibold rounded border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    isCopied
                      ? 'bg-[#2ECC71]/20 border-[#2ECC71] text-[#2ECC71]'
                      : 'bg-[#17212B] hover:bg-[#2A3749] text-[#D7DEE8] hover:text-white border-[#334155]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                  <span>{isCopied ? 'Copied!' : 'Copy Data'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Metric Legend */}
          <MapLegend metric={activeMetric} />

          <div className="p-2.5 bg-[#17212B] border border-[#334155] rounded text-[11px] text-[#8A94A6] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#4FA8E0] shrink-0">
                touch_app
              </span>
              <span>Click any state polygon or city pin to inspect synoptic telemetry.</span>
            </div>
            <span className="text-[10px] text-[#4FA8E0] font-mono shrink-0">36 States/UTs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaWeatherMap;

