import React, { useState } from 'react';
import { downloadRadarIntensityCsv } from '../../utils/radarCsvExporter';

export type LegendMetricMode = 'all' | 'precipitation' | 'wind';
export type PrecipUnit = 'dBZ' | 'mm/h' | 'in/h';
export type WindUnit = 'km/h' | 'kt' | 'mph';
export type PrecipLevelId = 'trace' | 'light' | 'moderate' | 'heavy' | 'intense' | 'extreme';

export interface PrecipInterval {
  id: PrecipLevelId;
  dbzRange: string;
  rateRange: string;
  rateRangeIn: string;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  description: string;
  minDbz: number;
  maxDbz: number;
  minRateMm: number;
  maxRateMm: number;
  minRateIn: number;
  maxRateIn: number;
}

export interface WindInterval {
  id: string;
  kmhRange: string;
  ktRange: string;
  mphRange: string;
  label: string;
  color: string;
  textColor: string;
  description: string;
}

export const PRECIP_INTERVALS: PrecipInterval[] = [
  {
    id: 'trace',
    dbzRange: '< 15',
    rateRange: '< 0.5',
    rateRangeIn: '< 0.02',
    label: 'Trace / Drizzle',
    shortLabel: 'Drizzle',
    color: '#0284C7',
    textColor: '#FFFFFF',
    description: 'Very light drizzle, mist, or non-precipitating cloud echoes',
    minDbz: 0,
    maxDbz: 15,
    minRateMm: 0,
    maxRateMm: 0.5,
    minRateIn: 0,
    maxRateIn: 0.02,
  },
  {
    id: 'light',
    dbzRange: '15 – 30',
    rateRange: '0.5 – 4',
    rateRangeIn: '0.02 – 0.16',
    label: 'Light Rain',
    shortLabel: 'Light',
    color: '#10B981',
    textColor: '#FFFFFF',
    description: 'Steady light rain; wet surfaces with minimal road spray',
    minDbz: 15,
    maxDbz: 30,
    minRateMm: 0.5,
    maxRateMm: 4,
    minRateIn: 0.02,
    maxRateIn: 0.16,
  },
  {
    id: 'moderate',
    dbzRange: '30 – 40',
    rateRange: '4 – 15',
    rateRangeIn: '0.16 – 0.60',
    label: 'Moderate Rain',
    shortLabel: 'Moderate',
    color: '#FACC15',
    textColor: '#0B1E30',
    description: 'Moderate steady showers; reduced visibility on roadways',
    minDbz: 30,
    maxDbz: 40,
    minRateMm: 4,
    maxRateMm: 15,
    minRateIn: 0.16,
    maxRateIn: 0.6,
  },
  {
    id: 'heavy',
    dbzRange: '40 – 50',
    rateRange: '15 – 50',
    rateRangeIn: '0.60 – 2.0',
    label: 'Heavy Rain',
    shortLabel: 'Heavy',
    color: '#FB923C',
    textColor: '#0B1E30',
    description: 'Heavy downpour, convective thunderstorm cores, localized waterlogging',
    minDbz: 40,
    maxDbz: 50,
    minRateMm: 15,
    maxRateMm: 50,
    minRateIn: 0.6,
    maxRateIn: 2.0,
  },
  {
    id: 'intense',
    dbzRange: '50 – 60',
    rateRange: '50 – 100',
    rateRangeIn: '2.0 – 4.0',
    label: 'Very Heavy',
    shortLabel: 'Very Heavy',
    color: '#EF4444',
    textColor: '#FFFFFF',
    description: 'Intense cloudburst or squall line; severe flash-flood potential',
    minDbz: 50,
    maxDbz: 60,
    minRateMm: 50,
    maxRateMm: 100,
    minRateIn: 2.0,
    maxRateIn: 4.0,
  },
  {
    id: 'extreme',
    dbzRange: '> 60',
    rateRange: '> 100',
    rateRangeIn: '> 4.0',
    label: 'Extreme / Hail',
    shortLabel: 'Hail / Squall',
    color: '#C026D3',
    textColor: '#FFFFFF',
    description: 'Violent convective core; large hail, severe downbursts or microbursts',
    minDbz: 60,
    maxDbz: 90,
    minRateMm: 100,
    maxRateMm: 300,
    minRateIn: 4.0,
    maxRateIn: 12.0,
  },
];

export const WIND_INTERVALS: WindInterval[] = [
  {
    id: 'breeze',
    kmhRange: '< 20',
    ktRange: '< 11',
    mphRange: '< 12',
    label: 'Light Breeze',
    color: '#38BDF8',
    textColor: '#0B1E30',
    description: 'Gentle breeze; leaves rustle; normal outdoor activity',
  },
  {
    id: 'moderate',
    kmhRange: '20 – 40',
    ktRange: '11 – 21',
    mphRange: '12 – 25',
    label: 'Moderate Wind',
    color: '#00C897',
    textColor: '#0B1E30',
    description: 'Moderate to fresh breeze; dust raised; small branches move',
  },
  {
    id: 'strong',
    kmhRange: '40 – 60',
    ktRange: '22 – 33',
    mphRange: '25 – 37',
    label: 'Strong / Squall',
    color: '#F59E0B',
    textColor: '#0B1E30',
    description: 'Strong breeze to near-gale; umbrella difficult; choppy coastal waters',
  },
  {
    id: 'gale',
    kmhRange: '60 – 90',
    ktRange: '34 – 48',
    mphRange: '37 – 56',
    label: 'Gale Force (IMD Alert)',
    color: '#EA580C',
    textColor: '#FFFFFF',
    description: 'IMD Cyclonic warning threshold; structural damage, snapped tree twigs',
  },
  {
    id: 'storm',
    kmhRange: '90 – 120',
    ktRange: '49 – 64',
    mphRange: '56 – 75',
    label: 'Storm Force',
    color: '#DC2626',
    textColor: '#FFFFFF',
    description: 'Severe storm; high structural damage; fishermen advisory in full effect',
  },
  {
    id: 'violent',
    kmhRange: '> 120',
    ktRange: '> 64',
    mphRange: '> 75',
    label: 'Severe Cyclone',
    color: '#7E22CE',
    textColor: '#FFFFFF',
    description: 'Extremely Severe Cyclonic Storm / Hurricane Force; catastrophic gust risk',
  },
];

export const ALL_PRECIP_LEVEL_IDS: PrecipLevelId[] = [
  'trace',
  'light',
  'moderate',
  'heavy',
  'intense',
  'extreme',
];

export interface RadarMapLegendPanelProps {
  initialMetric?: LegendMetricMode;
  initialCollapsed?: boolean;
  className?: string;
  positionClass?: string;
  onMetricChange?: (mode: LegendMetricMode) => void;
  showToggleOnly?: boolean;
  activePrecipLevels?: PrecipLevelId[];
  onPrecipLevelsChange?: (levels: PrecipLevelId[]) => void;
  sectorName?: string;
  stationName?: string;
  timestamp?: string | number;
}

export const RadarMapLegendPanel: React.FC<RadarMapLegendPanelProps> = ({
  initialMetric = 'all',
  initialCollapsed = false,
  className = '',
  positionClass = 'top-3 left-3',
  onMetricChange,
  activePrecipLevels,
  onPrecipLevelsChange,
  sectorName,
  stationName,
  timestamp,
}) => {
  const [metricMode, setMetricMode] = useState<LegendMetricMode>(initialMetric);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);
  const [precipUnit, setPrecipUnit] = useState<PrecipUnit>('dBZ');
  const [windUnit, setWindUnit] = useState<WindUnit>('km/h');
  const [hoveredInterval, setHoveredInterval] = useState<string | null>(null);

  // Export CSV state
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle');
  const [exportedFilename, setExportedFilename] = useState<string>('');

  // Internal state if parent is uncontrolled
  const [internalLevels, setInternalLevels] = useState<PrecipLevelId[]>(ALL_PRECIP_LEVEL_IDS);
  const effectiveLevels = activePrecipLevels !== undefined ? activePrecipLevels : internalLevels;

  const handleExportCsv = () => {
    try {
      const filename = downloadRadarIntensityCsv({
        activePrecipLevels: effectiveLevels,
        precipUnit,
        windUnit,
        metricMode,
        sectorName,
        stationName,
        timestamp,
      });
      setExportedFilename(filename);
      setExportStatus('success');
      setTimeout(() => {
        setExportStatus('idle');
      }, 3500);
    } catch (err) {
      console.error('Failed to export radar intensity CSV:', err);
    }
  };

  const updateLevels = (newLevels: PrecipLevelId[]) => {
    if (activePrecipLevels === undefined) {
      setInternalLevels(newLevels);
    }
    onPrecipLevelsChange?.(newLevels);
  };

  const handleToggleLevel = (id: PrecipLevelId) => {
    if (effectiveLevels.includes(id)) {
      // If it's the last one, still allow toggling (or keep empty)
      const next = effectiveLevels.filter((lvl) => lvl !== id);
      updateLevels(next);
    } else {
      const next = [...effectiveLevels, id];
      // Maintain sort order
      next.sort(
        (a, b) => ALL_PRECIP_LEVEL_IDS.indexOf(a) - ALL_PRECIP_LEVEL_IDS.indexOf(b)
      );
      updateLevels(next);
    }
  };

  const handleSelectAll = () => {
    updateLevels(ALL_PRECIP_LEVEL_IDS);
  };

  const handleSelectPreset = (preset: 'all' | 'modPlus' | 'severe' | 'clear') => {
    switch (preset) {
      case 'all':
        updateLevels(ALL_PRECIP_LEVEL_IDS);
        break;
      case 'modPlus':
        updateLevels(['moderate', 'heavy', 'intense', 'extreme']);
        break;
      case 'severe':
        updateLevels(['heavy', 'intense', 'extreme']);
        break;
      case 'clear':
        updateLevels([]);
        break;
    }
  };

  const isFilteringActive = effectiveLevels.length < ALL_PRECIP_LEVEL_IDS.length;

  const handleSelectMetric = (mode: LegendMetricMode) => {
    setMetricMode(mode);
    onMetricChange?.(mode);
  };

  const activeHoverInfo = (() => {
    if (!hoveredInterval) return null;
    if (hoveredInterval.startsWith('precip-')) {
      const id = hoveredInterval.replace('precip-', '') as PrecipLevelId;
      const item = PRECIP_INTERVALS.find((p) => p.id === id);
      if (!item) return null;
      const isAct = effectiveLevels.includes(id);
      const valStr =
        precipUnit === 'dBZ'
          ? `${item.dbzRange} dBZ`
          : precipUnit === 'in/h'
          ? `${item.rateRangeIn} in/hr`
          : `${item.rateRange} mm/hr`;
      return {
        title: `${item.label} (${valStr})`,
        description: `${item.description} • ${isAct ? 'Currently visible on map' : 'Filtered out on map'} (Click to toggle)`,
        color: item.color,
      };
    }
    if (hoveredInterval.startsWith('wind-')) {
      const id = hoveredInterval.replace('wind-', '');
      const item = WIND_INTERVALS.find((w) => w.id === id);
      if (!item) return null;
      const valStr =
        windUnit === 'km/h'
          ? `${item.kmhRange} km/h`
          : windUnit === 'mph'
          ? `${item.mphRange} mph`
          : `${item.ktRange} kt`;
      return {
        title: `${item.label} (${valStr})`,
        description: item.description,
        color: item.color,
      };
    }
    return null;
  })();

  return (
    <aside
      id="radar-map-persistent-legend"
      role="region"
      aria-label="Radar Reflectivity and Wind Speed Intensity Scale"
      className={`absolute z-[400] pointer-events-auto select-none transition-all duration-200 ${positionClass} ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Collapsed Pill State */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071727]/90 hover:bg-[#0A2238]/95 backdrop-blur-md border text-[#E1EEF8] shadow-2xl transition-all group cursor-pointer max-w-[calc(100vw-24px)] ${
            isFilteringActive
              ? 'border-[#F59E0B] ring-1 ring-[#F59E0B]/50'
              : 'border-[#19456B]/90'
          }`}
          title="Expand persistent radar intensity legend panel and filter map layers"
          aria-expanded={false}
        >
          <span className="material-symbols-outlined text-[16px] text-[#38BDF8] group-hover:rotate-45 transition-transform">
            layers
          </span>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-white">
                RADAR LEGEND
              </span>
              {isFilteringActive && (
                <span className="text-[8px] font-bold px-1 rounded bg-[#F59E0B] text-black">
                  FILTERED ({effectiveLevels.length}/6)
                </span>
              )}
            </div>
            <span className="text-[9px] text-[#8AA1B7]">
              🌧️ Precip ({precipUnit === 'in/h' ? 'in/hr' : precipUnit === 'mm/h' ? 'mm/hr' : 'dBZ'}) • 💨 Wind ({windUnit})
            </span>
          </div>
          {/* Mini Gradient Preview Bar showing filtered or active dots */}
          <div className="flex items-center gap-0.5 ml-1">
            {PRECIP_INTERVALS.map((intv) => {
              const isAct = effectiveLevels.includes(intv.id);
              return (
                <div
                  key={intv.id}
                  className={`w-2 h-2.5 rounded-xs transition-opacity ${
                    isAct ? 'opacity-100 shadow-xs' : 'opacity-20 grayscale'
                  }`}
                  style={{ backgroundColor: intv.color }}
                  title={`${intv.label}: ${isAct ? 'Visible' : 'Hidden'}`}
                />
              );
            })}
          </div>
          {/* Quick Export CSV icon button in collapsed pill */}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleExportCsv();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleExportCsv();
              }
            }}
            className="w-5 h-5 rounded hover:bg-[#102C48] text-[#38BDF8] hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-0.5"
            title="Download currently filtered radar intensity data as CSV"
            aria-label="Export filtered data as CSV"
          >
            <span className="material-symbols-outlined text-[13px]">
              {exportStatus === 'success' ? 'check_circle' : 'download'}
            </span>
          </span>
          <span className="material-symbols-outlined text-[14px] text-[#38BDF8]">
            expand_more
          </span>
        </button>
      ) : (
        /* Expanded Full Glassmorphism Panel */
        <div className="w-[300px] sm:w-[340px] max-w-[calc(100vw-24px)] rounded-xl bg-[#071727]/90 backdrop-blur-md border border-[#19456B]/90 text-[#E1EEF8] shadow-2xl p-2.5 sm:p-3 flex flex-col gap-2">
          {/* 1. Header with Title, Mode Switcher & Collapse Button */}
          <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-[#143755]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#38BDF8]">
                filter_drama
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-bold text-[#F0F6FC] tracking-wider leading-none">
                  RADAR INTENSITY
                </span>
                <span className="text-[8.5px] text-[#7E96AE] font-mono leading-tight">
                  Interactive Layer Filter
                </span>
              </div>
            </div>

            {/* Metric Mode Switcher Tabs */}
            <div className="flex items-center bg-[#0B2136] p-0.5 rounded-md border border-[#163B5D]">
              <button
                type="button"
                onClick={() => handleSelectMetric('all')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  metricMode === 'all'
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-[#8AA1B7] hover:text-white'
                }`}
                title="Show both precipitation and wind speed legends"
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => handleSelectMetric('precipitation')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  metricMode === 'precipitation'
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-[#8AA1B7] hover:text-white'
                }`}
                title="Show precipitation reflectivity and rain rate filter"
              >
                PRECIP
              </button>
              <button
                type="button"
                onClick={() => handleSelectMetric('wind')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  metricMode === 'wind'
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-[#8AA1B7] hover:text-white'
                }`}
                title="Show wind speed and gale warning scales"
              >
                WIND
              </button>
            </div>

            {/* Minimize / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-5 h-5 rounded hover:bg-[#102C48] text-[#8AA1B7] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Collapse legend panel"
              aria-expanded={true}
            >
              <span className="material-symbols-outlined text-[15px]">expand_less</span>
            </button>
          </div>

          {/* 2. Precipitation Section & Interactive Layer Filter */}
          {(metricMode === 'all' || metricMode === 'precipitation') && (
            <div className="flex flex-col gap-1.5">
              {/* Subheader with Unit Switcher & Active Filter Count */}
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  <span className="font-mono font-bold text-[#38BDF8]">PRECIPITATION</span>
                  <span className="text-[#8AA1B7] text-[8.5px] hidden xs:inline">
                    ({precipUnit === 'dBZ' ? 'Reflectivity' : precipUnit === 'in/h' ? 'Imperial' : 'Metric'})
                  </span>
                </div>
                {/* Unit Switcher: segmented buttons (dBZ / mm/hr / in/hr) */}
                <div
                  className="flex items-center bg-[#061421] p-0.5 rounded border border-[#19456B] text-[8.5px] font-mono shadow-inner"
                  role="group"
                  aria-label="Precipitation unit toggle"
                >
                  <button
                    type="button"
                    onClick={() => setPrecipUnit('dBZ')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                      precipUnit === 'dBZ'
                        ? 'bg-[#38BDF8] text-[#031322] shadow-xs'
                        : 'text-[#8AA1B7] hover:text-white hover:bg-[#0E2840]'
                    }`}
                    title="Radar Echo Reflectivity: Decibels of Z (dBZ)"
                  >
                    dBZ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrecipUnit('mm/h')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                      precipUnit === 'mm/h'
                        ? 'bg-[#38BDF8] text-[#031322] shadow-xs'
                        : 'text-[#8AA1B7] hover:text-white hover:bg-[#0E2840]'
                    }`}
                    title="Metric Rain Rate: Millimeters per hour (mm/hr)"
                  >
                    mm/hr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrecipUnit('in/h')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                      precipUnit === 'in/h'
                        ? 'bg-[#38BDF8] text-[#031322] shadow-xs'
                        : 'text-[#8AA1B7] hover:text-white hover:bg-[#0E2840]'
                    }`}
                    title="Imperial Rain Rate: Inches per hour (in/hr) for international users"
                  >
                    in/hr
                  </button>
                </div>
              </div>

              {/* Intensity Layer Filter Presets Bar */}
              <div className="flex items-center justify-between bg-[#061421] px-2 py-1 rounded-md border border-[#143755] text-[9px] font-mono">
                <span className="text-[#8AA1B7] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#38BDF8]">
                    tune
                  </span>
                  <span>Filter:</span>
                  <strong
                    className={
                      isFilteringActive ? 'text-[#F59E0B]' : 'text-[#22C7A0]'
                    }
                  >
                    {effectiveLevels.length}/6 active
                  </strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('all')}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] transition-colors cursor-pointer ${
                      effectiveLevels.length === 6
                        ? 'bg-[#1565C0] text-white font-bold'
                        : 'text-[#8AA1B7] hover:text-white bg-[#0A2238]'
                    }`}
                    title="Enable all precipitation intensity levels"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('modPlus')}
                    className="px-1.5 py-0.5 rounded text-[8.5px] text-[#8AA1B7] hover:text-white bg-[#0A2238] hover:bg-[#123352] transition-colors cursor-pointer"
                    title={
                      precipUnit === 'in/h'
                        ? 'Filter to Moderate and above (≥0.16 in/hr)'
                        : precipUnit === 'mm/h'
                        ? 'Filter to Moderate and above (≥4 mm/hr)'
                        : 'Filter to Moderate and above (≥30 dBZ)'
                    }
                  >
                    {precipUnit === 'in/h' ? '≥0.16 in/hr' : precipUnit === 'mm/h' ? '≥4 mm/hr' : '≥30 dBZ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('severe')}
                    className="px-1.5 py-0.5 rounded text-[8.5px] text-[#8AA1B7] hover:text-white bg-[#0A2238] hover:bg-[#123352] transition-colors cursor-pointer"
                    title={
                      precipUnit === 'in/h'
                        ? 'Filter to Severe / Storms only (≥0.60 in/hr)'
                        : precipUnit === 'mm/h'
                        ? 'Filter to Severe / Storms only (≥15 mm/hr)'
                        : 'Filter to Severe / Storms only (≥40 dBZ)'
                    }
                  >
                    {precipUnit === 'in/h' ? '≥0.60 in/hr' : precipUnit === 'mm/h' ? '≥15 mm/hr' : '≥40 dBZ'}
                  </button>
                  {isFilteringActive && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-1 py-0.5 rounded text-[8.5px] text-[#F59E0B] hover:text-white underline cursor-pointer"
                      title="Reset layer filter to display all intensities"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-1.5 py-0.5 rounded text-[8.5px] text-[#38BDF8] hover:text-white bg-[#0A2238] hover:bg-[#123352] border border-[#19456B] transition-colors cursor-pointer flex items-center gap-0.5"
                    title="Download currently filtered intensity data as CSV"
                  >
                    <span className="material-symbols-outlined text-[10px]">
                      {exportStatus === 'success' ? 'check_circle' : 'download'}
                    </span>
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Continuous Visual Gradient Bar showing active bands */}
              <div className="relative">
                <div
                  className="h-2 rounded-sm shadow-xs border border-[#163B5D]/60"
                  style={{
                    background:
                      'linear-gradient(to right, #0284C7 0%, #10B981 20%, #FACC15 40%, #FB923C 60%, #EF4444 80%, #C026D3 100%)',
                  }}
                  title="RainViewer & IMD Reflectivity Spectrum: Blue (Trace) to Magenta (Severe Hail)"
                />
              </div>

              {/* Interactive Color-Coded Toggle Buttons Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {PRECIP_INTERVALS.map((interval) => {
                  const isHovered = hoveredInterval === `precip-${interval.id}`;
                  const isActive = effectiveLevels.includes(interval.id);
                  const displayValue =
                    precipUnit === 'dBZ'
                      ? `${interval.dbzRange} dBZ`
                      : precipUnit === 'in/h'
                      ? `${interval.rateRangeIn} in/hr`
                      : `${interval.rateRange} mm/hr`;

                  return (
                    <button
                      key={interval.id}
                      type="button"
                      onClick={() => handleToggleLevel(interval.id)}
                      onMouseEnter={() => setHoveredInterval(`precip-${interval.id}`)}
                      onMouseLeave={() => setHoveredInterval(null)}
                      aria-pressed={isActive}
                      aria-label={`Toggle ${interval.label} (${displayValue}) map layer`}
                      className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? isHovered
                            ? 'bg-[#0E2C48] border-[#38BDF8] ring-1 ring-[#38BDF8]/50 shadow-md'
                            : 'bg-[#0A1F33]/90 border-[#19456B]'
                          : 'bg-[#05111D]/60 border-[#142B3F] opacity-50 grayscale-[0.4]'
                      }`}
                      title={`${interval.label} (${displayValue}): ${
                        isActive
                          ? 'Visible on map. Click to filter out.'
                          : 'Filtered out. Click to show on map.'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0 shadow-xs flex items-center justify-center text-[8px] font-black"
                            style={{
                              backgroundColor: interval.color,
                              color: interval.textColor,
                            }}
                          >
                            {isActive ? '✓' : ''}
                          </span>
                          <span
                            className={`font-mono font-bold text-[9.5px] truncate ${
                              isActive ? 'text-[#F0F6FC]' : 'text-[#8AA1B7] line-through'
                            }`}
                          >
                            {displayValue}
                          </span>
                        </div>

                        {/* Interactive Toggle Switch Button Indicator */}
                        <span
                          className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded transition-colors shrink-0 ${
                            isActive
                              ? 'bg-[#1565C0] text-white'
                              : 'bg-[#162738] text-[#6E8294]'
                          }`}
                        >
                          {isActive ? 'ON' : 'OFF'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[8.5px] text-[#8AA1B7] font-medium leading-tight truncate">
                        <span className="truncate">{interval.shortLabel}</span>
                        <span className="text-[10px] opacity-70">
                          {isActive ? '👁️' : '👁️‍🗨️'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Wind Speed Section */}
          {(metricMode === 'all' || metricMode === 'wind') && (
            <div
              className={`flex flex-col gap-1.5 ${
                metricMode === 'all' ? 'pt-2 border-t border-[#143755]' : ''
              }`}
            >
              {/* Subheader with Unit Switcher */}
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C897]" />
                  <span className="font-mono font-bold text-[#00C897]">WIND SPEED</span>
                  <span className="text-[#8AA1B7] text-[8.5px] hidden xs:inline">
                    ({windUnit === 'km/h' ? 'Radial Vel.' : windUnit === 'mph' ? 'Statute' : 'Knots'})
                  </span>
                </div>
                {/* Wind Unit Switcher: segmented control (km/h / kt / mph) */}
                <div
                  className="flex items-center bg-[#061421] p-0.5 rounded border border-[#19456B] text-[8.5px] font-mono shadow-inner"
                  role="group"
                  aria-label="Wind speed unit toggle"
                >
                  <button
                    type="button"
                    onClick={() => setWindUnit('km/h')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                      windUnit === 'km/h'
                        ? 'bg-[#00C897] text-[#031322] shadow-xs'
                        : 'text-[#8AA1B7] hover:text-white hover:bg-[#0E2840]'
                    }`}
                    title="Metric: Kilometers per hour (km/h)"
                  >
                    km/h
                  </button>
                  <button
                    type="button"
                    onClick={() => setWindUnit('kt')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                      windUnit === 'kt'
                        ? 'bg-[#00C897] text-[#031322] shadow-xs'
                        : 'text-[#8AA1B7] hover:text-white hover:bg-[#0E2840]'
                    }`}
                    title="Aviation / Nautical: Knots (kt)"
                  >
                    kt
                  </button>
                  <button
                    type="button"
                    onClick={() => setWindUnit('mph')}
                    className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold ${
                      windUnit === 'mph'
                        ? 'bg-[#00C897] text-[#031322] shadow-xs'
                        : 'text-[#8AA1B7] hover:text-white hover:bg-[#0E2840]'
                    }`}
                    title="Imperial: Miles per hour (mph) for international users"
                  >
                    mph
                  </button>
                </div>
              </div>

              {/* Continuous Visual Gradient Bar */}
              <div className="relative">
                <div
                  className="h-2 rounded-sm shadow-xs border border-[#163B5D]/60"
                  style={{
                    background:
                      'linear-gradient(to right, #38BDF8 0%, #00C897 20%, #F59E0B 40%, #EA580C 60%, #DC2626 80%, #7E22CE 100%)',
                  }}
                  title="Doppler Velocity Spectrum: Cyan (Light) to Purple (Cyclone Force)"
                />
              </div>

              {/* Color-Coded Intensity Grid for Wind */}
              <div className="grid grid-cols-3 gap-1">
                {WIND_INTERVALS.map((interval) => {
                  const isHovered = hoveredInterval === `wind-${interval.id}`;
                  const displayValue =
                    windUnit === 'km/h'
                      ? `${interval.kmhRange} km/h`
                      : windUnit === 'mph'
                      ? `${interval.mphRange} mph`
                      : `${interval.ktRange} kt`;

                  return (
                    <div
                      key={interval.id}
                      onMouseEnter={() => setHoveredInterval(`wind-${interval.id}`)}
                      onMouseLeave={() => setHoveredInterval(null)}
                      className={`p-1 rounded border transition-all cursor-default ${
                        isHovered
                          ? 'bg-[#0E2C48] border-[#00C897] ring-1 ring-[#00C897]/40 scale-[1.02]'
                          : 'bg-[#0A1F33]/80 border-[#143755]'
                      }`}
                      title={`${interval.label} (${interval.kmhRange} km/h | ${interval.ktRange} kt | ${interval.mphRange} mph): ${interval.description}`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: interval.color }}
                        />
                        <span className="font-mono font-bold text-[9px] text-[#F0F6FC] truncate">
                          {displayValue}
                        </span>
                      </div>
                      <div className="text-[8.5px] text-[#8AA1B7] font-medium leading-tight truncate">
                        {interval.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Hover Insight Callout */}
          {activeHoverInfo && (
            <div className="bg-[#051424] border border-[#1A4E7E] p-1.5 rounded-md text-[9.5px] text-[#D1E6F7] flex items-center gap-1.5 transition-all">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: activeHoverInfo.color }}
              />
              <div className="truncate">
                <strong className="text-white mr-1">{activeHoverInfo.title}:</strong>
                <span className="text-[#A4BFD8]">{activeHoverInfo.description}</span>
              </div>
            </div>
          )}

          {/* 4. Export Filtered Data Action Card & Meteorological Footer */}
          <div className="pt-2 border-t border-[#143755] flex flex-col gap-1.5">
            {/* Primary 'Export Data' Button */}
            <button
              type="button"
              id="btn-export-radar-legend-csv"
              onClick={handleExportCsv}
              className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer select-none active:scale-[0.98] ${
                exportStatus === 'success'
                  ? 'bg-[#064E3B] border-[#10B981] text-[#A7F3D0] shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'bg-[#0A243D] hover:bg-[#12385C] border-[#1E507D] hover:border-[#38BDF8] text-[#E0F2FE] hover:text-white'
              }`}
              title="Download currently filtered precipitation intensity, reflectivity thresholds & synoptic observations as a properly formatted CSV file"
            >
              <span className="material-symbols-outlined text-[15px] text-[#38BDF8]">
                {exportStatus === 'success' ? 'check_circle' : 'download'}
              </span>
              <span>
                {exportStatus === 'success'
                  ? 'CSV Exported Successfully!'
                  : `Export Data (CSV) • ${effectiveLevels.length} of 6 Active`}
              </span>
            </button>

            {exportStatus === 'success' && exportedFilename && (
              <div className="text-[8.5px] font-mono text-[#34D399] flex items-center justify-center gap-1 bg-[#062D24] px-2 py-0.5 rounded border border-[#0B624E]/80 animate-fadeIn">
                <span className="material-symbols-outlined text-[11px]">task_alt</span>
                <span className="truncate">Saved as {exportedFilename}</span>
              </div>
            )}

            {/* Meteorological Insight Footer */}
            <div className="flex items-center justify-between text-[8.5px] font-mono text-[#7A93AA] pt-0.5">
              <span>
                {isFilteringActive ? (
                  <span className="text-[#F59E0B] font-bold">
                    Filter Active ({effectiveLevels.length}/6)
                  </span>
                ) : (
                  <span>IMD Doppler DWR Standard</span>
                )}
              </span>
              <span className="text-[#38BDF8]">Calibrated S/C-Band</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RadarMapLegendPanel;
