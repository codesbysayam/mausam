import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import India from '@svg-maps/india';
import { StateWeatherData } from './IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';
import imdStationsData from '../../data/imdStations.json';
import { LocationRecord } from '../../types';

export type MausamMapLayer =
  | 'base'
  | 'stations'
  | 'temperature'
  | 'rainfall'
  | 'aqi'
  | 'warnings'
  | 'radar'
  | 'wind'
  | 'activity';

export interface MausamMapProps {
  center?: [number, number];
  zoom?: number;
  layers?: MausamMapLayer[];
  selectedLocation?: LocationRecord | null;
  selectedState?: string | null;
  onSelectState?: (state: StateWeatherData) => void;
  onSelectStation?: (station: any) => void;
  activeMetric?: 'temperature' | 'rainfall' | 'aqi' | 'wind' | 'humidity' | 'warnings';
  onMetricChange?: (metric: any) => void;
  height?: number | string;
  showLayerControls?: boolean;
  className?: string;
  showFullscreenButton?: boolean;
}

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

// Map lat/lng roughly to SVG coordinate space (612 x 700 viewBox of @svg-maps/india)
// India approx lat: 8 - 37, lng: 68 - 97
export function projectLatLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLng = 68.0;
  const maxLng = 97.4;
  const minLat = 8.0;
  const maxLat = 37.2;

  const svgWidth = 612;
  const svgHeight = 675;

  const x = ((lng - minLng) / (maxLng - minLng)) * (svgWidth - 60) + 30;
  const y = ((maxLat - lat) / (maxLat - minLat)) * (svgHeight - 60) + 30;

  return { x, y };
}

export const MausamMap: React.FC<MausamMapProps> = ({
  center,
  zoom = 1,
  layers = ['base', 'temperature'],
  selectedLocation,
  selectedState,
  onSelectState,
  onSelectStation,
  activeMetric = 'temperature',
  onMetricChange,
  height = 560,
  showLayerControls = true,
  className = '',
  showFullscreenButton = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(zoom);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredState, setHoveredState] = useState<StateWeatherData | null>(null);
  const [hoveredStation, setHoveredStation] = useState<any | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<MausamMapLayer>>(new Set(layers));

  // Sync layers prop
  useEffect(() => {
    setActiveLayers(new Set(layers));
  }, [layers]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      // Trigger resize for SVG containers
      window.dispatchEvent(new Event('resize'));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle not permitted:', err);
    }
  };

  const toggleLayer = (layer: MausamMapLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (layer === 'base') return next; // base must stay
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  // Map state database
  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateWeatherData>();
    INDIA_WEATHER_DATA.forEach((s) => {
      map.set(s.id.toLowerCase(), s);
      map.set(s.name.toLowerCase(), s);
      map.set(s.id.toLowerCase().replace('in-', ''), s);
    });
    return map;
  }, []);

  const getStateColor = useCallback(
    (stateId: string, stateName: string): string => {
      const s = stateDataMap.get(stateId.toLowerCase()) || stateDataMap.get(stateName.toLowerCase());
      if (!s) return '#1E2733';

      if (activeLayers.has('warnings') || activeMetric === 'warnings') {
        if (s.warningLevel === 'severe') return '#E74C3C';
        if (s.warningLevel === 'alert') return '#F39C12';
        if (s.warningLevel === 'watch') return '#F1C40F';
        return '#1E3A2F';
      }

      if (activeLayers.has('rainfall') || activeMetric === 'rainfall') {
        const rain = s.rainfall ?? 0;
        if (rain > 40) return '#0D47A1';
        if (rain > 20) return '#1565C0';
        if (rain > 10) return '#1976D2';
        if (rain > 2) return '#2196F3';
        if (rain > 0) return '#64B5F6';
        return '#172A3D';
      }

      if (activeLayers.has('aqi') || activeMetric === 'aqi') {
        const aqi = s.aqi ?? 50;
        if (aqi > 300) return '#7E0023';
        if (aqi > 200) return '#8F3F97';
        if (aqi > 100) return '#E85D4C';
        if (aqi > 50) return '#FFB703';
        return '#2ECC71';
      }

      if (activeLayers.has('wind') || activeMetric === 'wind') {
        const wind = s.windSpeed ?? 10;
        if (wind > 45) return '#D9381E';
        if (wind > 30) return '#E67E22';
        if (wind > 20) return '#2980B9';
        return '#1B354D';
      }

      // Default: Temperature
      const temp = s.temperature ?? 28;
      if (temp >= 42) return '#990000';
      if (temp >= 38) return '#CC3300';
      if (temp >= 34) return '#E65100';
      if (temp >= 30) return '#F57C00';
      if (temp >= 26) return '#388E3C';
      if (temp >= 20) return '#0288D1';
      return '#01579B';
    },
    [stateDataMap, activeLayers, activeMetric]
  );

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Station markers
  const stations = useMemo(() => {
    return (imdStationsData as any[]).map((st) => {
      const pos = projectLatLngToSvg(st.latitude, st.longitude);
      const stateObj = stateDataMap.get(st.state.toLowerCase());
      return {
        ...st,
        x: pos.x,
        y: pos.y,
        temperature: stateObj?.temperature ?? 28,
        rainfall: stateObj?.rainfall ?? 0,
        aqi: stateObj?.aqi ?? 65,
        windSpeed: stateObj?.windSpeed ?? 12,
        windDir: stateObj?.windDir ?? 'SW',
        warningLevel: stateObj?.warningLevel ?? 'normal',
      };
    });
  }, [stateDataMap]);

  return (
    <div
      ref={containerRef}
      id="unified-mausam-map-container"
      className={`relative flex flex-col rounded-xl overflow-hidden bg-[#07131E] border border-[#162331] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''
      } ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#0B1A28] border-b border-[#162331] z-20 text-xs">
        {/* Layer Checkboxes */}
        {showLayerControls && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider mr-1 hidden sm:inline">
              MAP LAYERS:
            </span>
            {[
              { id: 'base' as MausamMapLayer, label: 'Base Map', required: true },
              { id: 'stations' as MausamMapLayer, label: 'Stations' },
              { id: 'temperature' as MausamMapLayer, label: 'Temperature' },
              { id: 'rainfall' as MausamMapLayer, label: 'Rainfall' },
              { id: 'aqi' as MausamMapLayer, label: 'AQI' },
              { id: 'wind' as MausamMapLayer, label: 'Wind' },
              { id: 'warnings' as MausamMapLayer, label: 'Warnings' },
              { id: 'activity' as MausamMapLayer, label: 'Activity' },
            ].map((layer) => {
              const checked = activeLayers.has(layer.id);
              return (
                <label
                  key={layer.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer select-none transition-colors ${
                    checked
                      ? 'bg-[#1565C0]/30 text-[#90CAF9] border border-[#1565C0]'
                      : 'text-[#8A94A6] hover:text-white bg-[#0F2236]/60 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={layer.required}
                    onChange={() => toggleLayer(layer.id)}
                    className="w-3 h-3 accent-[#1565C0] cursor-pointer"
                  />
                  <span className="text-[11px] font-medium">{layer.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Map View Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
            className="w-7 h-7 rounded bg-[#16283D] hover:bg-[#1E3A59] text-white flex items-center justify-center font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.8))}
            className="w-7 h-7 rounded bg-[#16283D] hover:bg-[#1E3A59] text-white flex items-center justify-center font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2 h-7 rounded bg-[#16283D] hover:bg-[#1E3A59] text-[#8A94A6] hover:text-white text-[10px] uppercase font-mono"
            title="Reset Map"
          >
            Reset
          </button>

          {showFullscreenButton && (
            <button
              type="button"
              id="btn-mausam-map-fullscreen"
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-2.5 h-7 rounded bg-[#0B72B9] hover:bg-[#1565C0] text-white text-[11px] font-bold shadow cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span>{isFullscreen ? 'Exit Fullscreen' : '⛶ FULLSCREEN'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 612 690"
          className="w-full h-full object-contain pointer-events-auto"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Base India SVG Boundaries */}
          <g id="svg-india-state-layers">
            {India.locations.map((loc: any) => {
              const isSelected =
                selectedState &&
                (loc.name.toLowerCase().includes(selectedState.toLowerCase()) ||
                  selectedState.toLowerCase().includes(loc.name.toLowerCase()));
              const fillColor = getStateColor(loc.id, loc.name);

              return (
                <path
                  key={loc.id}
                  id={`map-state-${loc.id}`}
                  d={loc.path}
                  fill={fillColor}
                  stroke={isSelected ? '#FFFFFF' : '#334155'}
                  strokeWidth={isSelected ? '2.5' : '1'}
                  className="transition-colors duration-150 cursor-pointer hover:brightness-125"
                  onMouseEnter={() => {
                    const data = stateDataMap.get(loc.id.toLowerCase()) || stateDataMap.get(loc.name.toLowerCase());
                    if (data) setHoveredState(data);
                  }}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => {
                    const data = stateDataMap.get(loc.id.toLowerCase()) || stateDataMap.get(loc.name.toLowerCase());
                    if (data && onSelectState) onSelectState(data);
                  }}
                >
                  <title>{loc.name}</title>
                </path>
              );
            })}
          </g>

          {/* Wind Vectors Overlay (Direction Arrows) */}
          {(activeLayers.has('wind') || activeMetric === 'wind') && (
            <g id="svg-wind-vectors">
              {Object.entries(MAJOR_CENTROIDS).map(([code, pt]) => {
                const s = stateDataMap.get(code.replace('in-', '')) || stateDataMap.get(code);
                const windSpeed = s?.windSpeed ?? 14;
                const windDir = s?.windDir ?? 'SW';

                // Direction angle to rotation degrees
                const dirMap: Record<string, number> = {
                  N: 0,
                  NNE: 22.5,
                  NE: 45,
                  ENE: 67.5,
                  E: 90,
                  ESE: 112.5,
                  SE: 135,
                  SSE: 157.5,
                  S: 180,
                  SSW: 202.5,
                  SW: 225,
                  WSW: 247.5,
                  W: 270,
                  WNW: 292.5,
                  NW: 315,
                  NNW: 337.5,
                };
                const rot = dirMap[windDir] ?? 225;

                return (
                  <g key={`wind-${code}`} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle r="9" fill="#0B1A28" stroke="#4FA8E0" strokeWidth="1.2" opacity="0.85" />
                    <g transform={`rotate(${rot})`}>
                      <line x1="0" y1="5" x2="0" y2="-6" stroke="#4FA8E0" strokeWidth="1.8" strokeLinecap="round" />
                      <polyline points="-3,-3 0,-7 3,-3" fill="none" stroke="#4FA8E0" strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Weather Activity Markers */}
          {activeLayers.has('activity') && (
            <g id="svg-weather-activity">
              {Object.entries(MAJOR_CENTROIDS).map(([code, pt]) => {
                const s = stateDataMap.get(code.replace('in-', '')) || stateDataMap.get(code);
                if (!s) return null;

                const rainfall = s.rainfall ?? 0;
                const wind = s.windSpeed ?? 0;
                const temp = s.temperature ?? 28;
                const warning = s.warningLevel;

                const weatherType =
                  rainfall > 20
                    ? 'heavy_rain'
                    : rainfall > 2
                    ? 'rain'
                    : wind > 35
                    ? 'wind'
                    : warning === 'severe' || warning === 'alert'
                    ? 'warning'
                    : temp > 38
                    ? 'heat'
                    : 'normal';

                const config = {
                  heavy_rain: { color: '#0D47A1', char: '🌧', label: 'Heavy Rain' },
                  rain: { color: '#1E88E5', char: '🌦', label: 'Rain' },
                  wind: { color: '#00897B', char: '💨', label: 'Squall' },
                  warning: { color: '#D32F2F', char: '⚠', label: 'Severe Alert' },
                  heat: { color: '#C62828', char: '🔥', label: 'High Temp' },
                  normal: { color: '#2E7D32', char: '●', label: 'Calm' },
                }[weatherType];

                return (
                  <g
                    key={`act-${code}`}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer"
                    onClick={() => onSelectState && onSelectState(s)}
                  >
                    <circle r="8" fill={config.color} stroke="#FFFFFF" strokeWidth="1.2" />
                    <text
                      textAnchor="middle"
                      dy="3"
                      fontSize="9"
                      fill="#FFFFFF"
                      fontWeight="bold"
                    >
                      {config.char}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Verified IMD Station Network Pins */}
          {activeLayers.has('stations') && (
            <g id="svg-station-pins">
              {stations.map((st, idx) => (
                <g
                  key={`st-${st.stationId || idx}-${idx}`}
                  transform={`translate(${st.x}, ${st.y})`}
                  className="cursor-pointer"
                  onClick={() => onSelectStation && onSelectStation(st)}
                  onMouseEnter={() => setHoveredStation(st)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  <circle
                    r="4.5"
                    fill={st.active ? '#2ECC71' : '#E74C3C'}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    className="hover:scale-150 transition-transform"
                  />
                  <circle r="1.5" fill="#FFFFFF" />
                </g>
              ))}
            </g>
          )}

          {/* Centroid Labels for Major Cities */}
          <g id="svg-city-centroids" pointerEvents="none">
            {Object.entries(MAJOR_CENTROIDS).map(([code, pt]) => (
              <text
                key={`lbl-${code}`}
                x={pt.x}
                y={pt.y + 14}
                textAnchor="middle"
                fontSize="8"
                fill="#E2E8F0"
                fontWeight="600"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              >
                {pt.city}
              </text>
            ))}
          </g>
        </svg>

        {/* Hover Inspector Tooltip */}
        {(hoveredState || hoveredStation) && (
          <div className="absolute bottom-3 left-3 bg-[#0B1C2E]/95 border border-[#1E3A59] backdrop-blur-md rounded-lg p-3 text-xs shadow-xl pointer-events-none max-w-xs z-30">
            {hoveredStation ? (
              <div>
                <div className="text-[10px] uppercase font-bold text-[#64B5F6]">
                  IMD OBSERVATORY STATION
                </div>
                <div className="text-white font-bold text-sm">{hoveredStation.stationName}</div>
                <div className="text-[#8A94A6] text-[11px] mb-1">
                  {hoveredStation.city}, {hoveredStation.state} (ID: {hoveredStation.stationId})
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#1E3A59] text-[11px]">
                  <div>
                    <span className="text-[#8A94A6]">Temp:</span>{' '}
                    <strong className="text-white">{hoveredStation.temperature}°C</strong>
                  </div>
                  <div>
                    <span className="text-[#8A94A6]">Rain:</span>{' '}
                    <strong className="text-white">{hoveredStation.rainfall} mm</strong>
                  </div>
                  <div>
                    <span className="text-[#8A94A6]">Wind:</span>{' '}
                    <strong className="text-white">
                      {hoveredStation.windSpeed} km/h {hoveredStation.windDir}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#8A94A6]">Elevation:</span>{' '}
                    <strong className="text-white">{hoveredStation.elevation}m</strong>
                  </div>
                </div>
              </div>
            ) : hoveredState ? (
              <div>
                <div className="text-[10px] uppercase font-bold text-[#64B5F6]">
                  {hoveredState.name}
                </div>
                <div className="text-white font-bold text-sm">
                  {hoveredState.temperature}°C • {hoveredState.condition}
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                  <div>Rain: {hoveredState.rainfall} mm</div>
                  <div>AQI: {hoveredState.aqi}</div>
                  <div>Wind: {hoveredState.windSpeed} km/h {hoveredState.windDir}</div>
                  <div>RH: {hoveredState.humidity}%</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default MausamMap;
