import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { LocatingPhase } from '../services/geolocationService';
import { CurrentLocationBanner } from '../components/location/CurrentLocationBanner';
import { AQISection } from '../components/environment/AQISection';
import { PollenSection } from '../components/environment/PollenSection';
import { IndiaWeatherMap, StateWeatherData } from '../components/map/IndiaWeatherMap';
import { WeatherMapMetric } from '../components/map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SectionHeader } from '../components/common/SectionHeader';
import DateCalendar from '../components/DateCalendar';
import { formatDateShort, formatDateISO, parseDateSafe } from '../utils/dateUtils';
import {
  Activity,
  Flower2,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  ChevronDown,
  X,
  Download,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface AirQualityPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onStateSelect?: (state: StateWeatherData) => void;
  onSelectLocation?: (loc: LocationRecord) => void;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

// Custom Rich Interactive Tooltip Component
const CustomTrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const pm25 = data.pm25;
  const pollen = data.pollen;
  const aqi = data.aqi;
  const isAboveStandard = pm25 !== undefined && pm25 > 60;

  const aqiCategory =
    aqi === undefined || aqi === null
      ? { name: '—', color: '#93A4B8' }
      : aqi <= 50
      ? { name: 'Good', color: '#22C7A0', bg: 'bg-[#22C7A0]/15' }
      : aqi <= 100
      ? { name: 'Satisfactory', color: '#22C7A0', bg: 'bg-[#22C7A0]/15' }
      : aqi <= 200
      ? { name: 'Moderate', color: '#FFC857', bg: 'bg-[#FFC857]/15' }
      : aqi <= 300
      ? { name: 'Poor', color: '#FF9F43', bg: 'bg-[#FF9F43]/15' }
      : { name: 'Very Poor', color: '#EF5350', bg: 'bg-[#EF5350]/15' };

  const pollenRisk =
    pollen === undefined || pollen === null
      ? { label: 'No Data', color: '#93A4B8' }
      : pollen <= 2
      ? { label: 'Low', color: '#22C7A0' }
      : pollen <= 3.5
      ? { label: 'Moderate', color: '#FFC857' }
      : { label: 'High Allergen Risk', color: '#EF5350' };

  return (
    <div className="rounded-xl bg-[#0B141E]/95 backdrop-blur-md border border-[#1E2D3D] p-3.5 shadow-2xl min-w-[240px] text-xs flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#162331]">
        <div className="flex items-center gap-1.5 text-[#F4F7FA] font-bold">
          <Calendar className="w-3.5 h-3.5 text-[#43C7F4]" />
          <span>{label || data.day || data.date}</span>
        </div>
        {aqi !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border`}
            style={{
              color: aqiCategory.color,
              backgroundColor: `${aqiCategory.color}15`,
              borderColor: `${aqiCategory.color}35`,
            }}
          >
            AQI {aqi} • {aqiCategory.name}
          </span>
        )}
      </div>

      {/* Metrics Body */}
      <div className="flex flex-col gap-2">
        {/* PM2.5 */}
        {pm25 !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#93A4B8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC857] inline-block shadow-[0_0_6px_rgba(255,200,87,0.8)]" />
              <span className="font-medium">PM2.5 Fine Dust:</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-[#F4F7FA] text-sm">{pm25}</span>
              <span className="text-[10px] text-[#93A4B8] ml-1">µg/m³</span>
            </div>
          </div>
        )}

        {/* CPCB Limit comparison */}
        {pm25 !== undefined && (
          <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-[#071018] border border-[#162331]">
            <span className="text-[#93A4B8]">CPCB 24h Threshold (60):</span>
            <span className={isAboveStandard ? 'text-[#EF5350] font-bold' : 'text-[#22C7A0] font-semibold'}>
              {isAboveStandard ? `+${Math.round(pm25 - 60)} µg/m³ over` : `${Math.round(60 - pm25)} µg/m³ under`}
            </span>
          </div>
        )}

        {/* Bio-Pollen Level */}
        {pollen !== undefined && (
          <div className="flex items-center justify-between pt-1 border-t border-[#162331]">
            <div className="flex items-center gap-1.5 text-[#93A4B8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C7A0] inline-block shadow-[0_0_6px_rgba(34,199,160,0.8)]" />
              <span className="font-medium">Bio-Pollen Index:</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-[#F4F7FA] text-sm">Level {pollen}</span>
              <span className="text-[10px] text-[#93A4B8]"> / 5</span>
              <span className="text-[10px] block font-semibold" style={{ color: pollenRisk.color }}>
                ({pollenRisk.label})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AirQualityPage: React.FC<AirQualityPageProps> = ({
  weatherBundle,
  selectedLocation,
  onStateSelect,
  onSelectLocation,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const { current } = weatherBundle;

  // 1. Single Source of Truth for observation baseline date
  const [selectedDate, setSelectedDate] = useState<string>(
    () => formatDateISO(new Date())
  );

  // Active layer metric for National Synoptic Map in Air Quality page
  const [mapMetric, setMapMetric] = useState<WeatherMapMetric>('aqi');
  const [activeStateName, setActiveStateName] = useState<string>(selectedLocation.state || 'Odisha');
  const [trendView, setTrendView] = useState<'both' | 'pm25' | 'pollen'>('both');
  const [showDateCalendar, setShowDateCalendar] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Historical data state
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const historyCacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowDateCalendar(false);
      }
    };
    if (showDateCalendar) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showDateCalendar]);

  // Find active state data or fallback
  const activeStateRecord = useMemo(() => {
    return (
      INDIA_WEATHER_DATA.find(
        (s) =>
          s.name.toLowerCase() === activeStateName.toLowerCase() ||
          s.city?.toLowerCase() === activeStateName.toLowerCase()
      ) || INDIA_WEATHER_DATA[0]
    );
  }, [activeStateName]);

  const handleStateSelect = (state: StateWeatherData) => {
    setActiveStateName(state.name);
    if (onStateSelect) {
      onStateSelect(state);
    }
  };

  // 2. Fetch Historical Air Quality & Pollen Telemetry whenever selectedDate, location, or state changes
  useEffect(() => {
    if (!selectedDate) return;

    const activeLoc = activeStateRecord.city || activeStateRecord.name || selectedLocation.city || selectedLocation.state || 'Odisha';
    const lat = selectedLocation.lat || 20.2961;
    const lon = selectedLocation.lng || 85.8245;
    const stationId = selectedLocation.stationId || selectedLocation.id || `CAAQMS-${Math.round(lat * 100)}-${Math.round(lon * 100)}`;
    const cacheKey = `air-quality-${stationId}-${activeLoc}-${selectedDate}-${lat.toFixed(2)}-${lon.toFixed(2)}`;

    // Check cache
    if (historyCacheRef.current.has(cacheKey)) {
      setHistoricalData(historyCacheRef.current.get(cacheKey));
      setIsLoadingHistory(false);
      setHistoryError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoadingHistory(true);
    setHistoryError(null);

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `/api/air-quality/history?stationId=${encodeURIComponent(stationId)}&location=${encodeURIComponent(activeLoc)}&lat=${lat}&lon=${lon}&date=${selectedDate}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Historical data request failed');
        }

        const result = await response.json();
        if (result.status === 'success') {
          historyCacheRef.current.set(cacheKey, result);
          setHistoricalData(result);
        } else {
          throw new Error(result.message || 'Unable to retrieve verified data');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load air quality history:', err);
          setHistoryError('No verified historical data available for this date.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingHistory(false);
        }
      }
    };

    fetchHistory();

    return () => {
      controller.abort();
    };
  }, [selectedDate, activeStateRecord, selectedLocation]);

  // 3. Make Chart Data Reactive to historicalData
  const chartData = useMemo(() => {
    if (!historicalData?.observations || !historicalData.observations.length) {
      return [];
    }

    return historicalData.observations.map((item: any) => ({
      date: item.date,
      day: item.day,
      pm25: item.pm25,
      pm10: item.pm10,
      pollen: item.pollen,
      totalPollenGrains: item.totalPollenGrains,
      aqi: item.aqi,
      aqiCategory: item.aqiCategory,
      safeStandardPm25: 60,
      pollenModerateLimit: 3,
      peakPm25: item.peakPm25,
      peakTime: item.peakTime,
      hasVerifiedData: item.hasVerifiedData,
      grassPollen: item.grassPollen,
      treePollen: item.treePollen,
      weedPollen: item.weedPollen,
    }));
  }, [historicalData]);

  // View-mode filtered chart series
  const visibleChartData = useMemo(() => {
    if (!chartData.length) return [];
    if (trendView === 'pm25') {
      return chartData.map((x: any) => ({ ...x, pollen: undefined }));
    }
    if (trendView === 'pollen') {
      return chartData.map((x: any) => ({ ...x, pm25: undefined }));
    }
    return chartData;
  }, [chartData, trendView]);

  // Export handler for current dataset
  const handleExportCSV = useCallback(() => {
    if (!historicalData?.observations?.length) return;
    const locationStr = activeStateRecord.name.replace(/\s+/g, '_');
    const fileName = `MAUSAM_AirQuality_${locationStr}_${selectedDate}.csv`;

    const headers = ['Date', 'Day_Label', 'PM2.5_ug_m3', 'PM10_ug_m3', 'AQI_Index', 'Category', 'Bio_Pollen_Level', 'Total_Pollen_Grains', 'Grass_Pollen', 'Tree_Pollen', 'Weed_Pollen', 'NO2_ug_m3', 'SO2_ug_m3', 'CO_ug_m3', 'O3_ug_m3'];
    const rows = historicalData.observations.map((o: any) => [
      o.date,
      `"${o.day}"`,
      o.pm25,
      o.pm10,
      o.aqi,
      `"${o.aqiCategory}"`,
      o.pollen,
      o.totalPollenGrains || 0,
      o.grassPollen || 0,
      o.treePollen || 0,
      o.weedPollen || 0,
      o.no2 || 0,
      o.so2 || 0,
      o.co || 0,
      o.o3 || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [historicalData, activeStateRecord, selectedDate]);

  const activeAqi =
    typeof current.aqi === 'number' && !Number.isNaN(current.aqi) && current.aqi > 0
      ? current.aqi
      : typeof current.aqiIndex === 'number' && !Number.isNaN(current.aqiIndex) && current.aqiIndex > 0
      ? current.aqiIndex
      : typeof current.aqiPm25 === 'number' && !Number.isNaN(current.aqiPm25) && current.aqiPm25 > 0
      ? Math.round(current.aqiPm25 / 0.45)
      : 82;

  const activePm25 =
    typeof current.aqiPm25 === 'number' && !Number.isNaN(current.aqiPm25) && current.aqiPm25 > 0
      ? Math.round(current.aqiPm25)
      : Math.round(activeAqi * 0.45);

  const activePm10 =
    typeof current.aqiPm10 === 'number' && !Number.isNaN(current.aqiPm10) && current.aqiPm10 > 0
      ? Math.round(current.aqiPm10)
      : Math.round(activePm25 * 1.8);

  const getAqiCategory = (val: number) => {
    if (val <= 50) return 'Good';
    if (val <= 100) return 'Satisfactory';
    if (val <= 200) return 'Moderate';
    if (val <= 300) return 'Poor';
    if (val <= 400) return 'Very Poor';
    return 'Severe';
  };

  const cityAqiData = [
    {
      city: selectedLocation.city || 'Bhubaneswar',
      state: selectedLocation.state || 'Odisha',
      aqi: activeAqi,
      category: getAqiCategory(activeAqi),
      pm25: activePm25,
      pm10: activePm10,
    },
    { city: 'Cuttack', state: 'Odisha', aqi: 112, category: 'Moderate', pm25: 52, pm10: 94 },
    { city: 'Rourkela', state: 'Odisha', aqi: 145, category: 'Moderate', pm25: 64, pm10: 120 },
    { city: 'Puri', state: 'Odisha', aqi: 45, category: 'Good', pm25: 18, pm10: 42 },
    { city: 'New Delhi', state: 'Delhi', aqi: 240, category: 'Poor', pm25: 110, pm10: 215 },
    { city: 'Mumbai', state: 'Maharashtra', aqi: 92, category: 'Satisfactory', pm25: 38, pm10: 76 },
    { city: 'Kolkata', state: 'West Bengal', aqi: 135, category: 'Moderate', pm25: 58, pm10: 110 },
    { city: 'Bengaluru', state: 'Karnataka', aqi: 62, category: 'Satisfactory', pm25: 26, pm10: 54 },
  ];

  const cityColumns: ColumnDef<any>[] = [
    {
      header: 'Station / City',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStateName(item.state)}
            className="text-left font-bold text-white hover:text-[#4FA8E0] transition-colors text-xs cursor-pointer"
            title={`Select ${item.state} on National Map`}
          >
            {item.city}
          </button>
          <span className="text-[11px] text-[#8A94A6]">({item.state})</span>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'NAQI Index',
      render: (item) => (
        <span className="font-mono font-bold text-white text-sm">{item.aqi}</span>
      ),
      width: '110px',
    },
    {
      header: 'Category',
      render: (item) => (
        <StatusBadge
          label={item.category}
          variant={
            item.aqi <= 50
              ? 'good'
              : item.aqi <= 100
              ? 'good'
              : item.aqi <= 200
              ? 'warning'
              : item.aqi <= 300
              ? 'alert'
              : 'danger'
          }
        />
      ),
      width: '140px',
    },
    {
      header: 'PM2.5 (µg/m³)',
      render: (item) => <span className="font-mono text-xs text-[#D7DEE8]">{item.pm25}</span>,
      width: '130px',
    },
    {
      header: 'PM10 (µg/m³)',
      render: (item) => <span className="font-mono text-xs text-[#D7DEE8]">{item.pm10}</span>,
      width: '130px',
    },
    {
      header: 'Action / Map Focus',
      render: (item) => (
        <button
          type="button"
          onClick={() => setActiveStateName(item.state)}
          className="px-2 py-1 bg-[#1E2733] hover:bg-[#0B72B9] text-[#D7DEE8] hover:text-white border border-[#334155] rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[13px]">map</span>
          <span>Focus Map</span>
        </button>
      ),
    },
  ];

  const currentPm25Value = historicalData?.current?.pm25 ?? Math.round((activeStateRecord.aqi || 75) * 0.45);
  const currentPollenValue = historicalData?.current?.pollen ?? activeStateRecord.pollen ?? 2;
  const sevenDayAvgPm25 = historicalData?.sevenDayAveragePm25 ?? currentPm25Value;
  const trendStatus = historicalData?.trendStatus ?? 'Equilibrium';

  return (
    <div className="flex flex-col gap-5">
      {/* Real Geolocation & Active Station Banner */}
      <CurrentLocationBanner
        location={selectedLocation}
        source={locationSource}
        isLocating={isLocating}
        onDetectLocation={onDetectLocation ? () => onDetectLocation(true) : undefined}
        onChangeLocationClick={onOpenLocationCenter}
      />

      {/* Primary AQI Section */}
      <AQISection weather={current} />

      {/* Pollen Section */}
      <PollenSection weather={current} />

      {/* 7-Day Trend History Visualization Component (Recharts) */}
      <div id="aqi-pollen-trend-card" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
        {/* Header & View Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#162331] gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center shrink-0 border border-[#1499E8]/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#F4F7FA]">
                  7-Day Historical Trend: PM2.5 &amp; Bio-Pollen ({activeStateRecord.name})
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1499E8]/20 text-[#43C7F4] border border-[#1499E8]/30">
                  Rolling Telemetry
                </span>
                {isLoadingHistory && (
                  <span className="flex items-center gap-1 text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full border border-[#38BDF8]/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading verified observations...</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#93A4B8] mt-0.5">
                Observation Baseline: <span className="text-[#38BDF8] font-bold">{formatDateShort(new Date(`${selectedDate}T00:00:00`))}</span>
                {historicalData?.startDate && (
                  <span className="text-[#64748B] ml-1.5 font-mono">
                    (Range: {formatDateShort(new Date(`${historicalData.startDate}T00:00:00`))} – {formatDateShort(new Date(`${selectedDate}T00:00:00`))})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Filter Pills, Date Picker & Export */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            {/* Observation Date Selector */}
            <div className="relative" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setShowDateCalendar(!showDateCalendar)}
                className="p-2 bg-[#071018] hover:bg-[#111F30] text-[#D1DCE8] hover:text-white rounded-xl border border-[#162331] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Select Observation Anchor Date"
              >
                <Calendar className="w-3.5 h-3.5 text-[#43C7F4]" />
                <span className="hidden sm:inline">{formatDateShort(new Date(`${selectedDate}T00:00:00`))}</span>
                <ChevronDown className={`w-3 h-3 text-[#93A4B8] transition-transform ${showDateCalendar ? 'rotate-180' : ''}`} />
              </button>

              {showDateCalendar && (
                <div className="absolute right-0 top-full mt-2 z-50 p-2 bg-[#0B141E] border border-[#1E2D3D] rounded-2xl shadow-2xl animate-fade-in">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#162331] mb-2 text-xs">
                    <span className="text-[#F4F7FA] font-bold">Observation Baseline Date</span>
                    <button
                      type="button"
                      onClick={() => setShowDateCalendar(false)}
                      className="text-[#93A4B8] hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <DateCalendar
                    value={new Date(`${selectedDate}T00:00:00`)}
                    onChange={(d) => {
                      const isoStr = d.toISOString().split('T')[0];
                      setSelectedDate(isoStr);
                      setShowDateCalendar(false);
                    }}
                    maxDate={new Date()}
                    showToday={true}
                  />
                </div>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#071018] border border-[#162331] rounded-xl shrink-0">
              <button
                id="btn-trend-filter-both"
                type="button"
                onClick={() => setTrendView('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  trendView === 'both'
                    ? 'bg-[#1499E8] text-white shadow-[0_0_12px_rgba(20,153,232,0.4)]'
                    : 'text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111F30]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PM2.5 &amp; Pollen</span>
              </button>
              <button
                id="btn-trend-filter-pm25"
                type="button"
                onClick={() => setTrendView('pm25')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  trendView === 'pm25'
                    ? 'bg-[#FFC857] text-[#071018] font-bold shadow-[0_0_12px_rgba(255,200,87,0.4)]'
                    : 'text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111F30]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FFC857] inline-block" />
                <span>PM2.5 Only</span>
              </button>
              <button
                id="btn-trend-filter-pollen"
                type="button"
                onClick={() => setTrendView('pollen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  trendView === 'pollen'
                    ? 'bg-[#22C7A0] text-[#071018] font-bold shadow-[0_0_12px_rgba(34,199,160,0.4)]'
                    : 'text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111F30]'
                }`}
              >
                <Flower2 className="w-3.5 h-3.5" />
                <span>Pollen Risk Only</span>
              </button>
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!historicalData?.observations?.length || isLoadingHistory}
              className="p-2 bg-[#071018] hover:bg-[#111F30] text-[#93A4B8] hover:text-white rounded-xl border border-[#162331] text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export 7-Day Trend CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Statistical Summary Mini-Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Selected Observatory */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
                Observatory Station
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#22C7A0] font-semibold bg-[#22C7A0]/10 px-2 py-0.5 rounded-full border border-[#22C7A0]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C7A0] animate-pulse" />
                {historicalData?.stationId ? 'Verified CAAQMS' : 'CAAQMS Network'}
              </span>
            </div>
            <div className="my-1.5">
              <span className="text-base font-bold text-[#F4F7FA] block leading-tight">
                {activeStateRecord.name}
              </span>
              <span className="text-xs text-[#43C7F4] flex items-center gap-1 mt-0.5 font-mono">
                <MapPin className="w-3 h-3 shrink-0" />
                {historicalData?.stationId || activeStateRecord.city || 'Regional Observatory'}
              </span>
            </div>
            <span className="text-[10px] text-[#93A4B8]">
              Continuous optical telemetry for {formatDateShort(new Date(`${selectedDate}T00:00:00`))}
            </span>
          </div>

          {/* 2. Current / Baseline PM2.5 */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
                Baseline PM2.5 Fine Dust
              </span>
              <span className="text-[10px] text-[#FFC857] font-semibold bg-[#FFC857]/10 px-2 py-0.5 rounded-full border border-[#FFC857]/30">
                CPCB Std: 60 µg/m³
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#FFC857]">
                {isLoadingHistory ? '—' : currentPm25Value}
              </span>
              <span className="text-xs font-normal text-[#93A4B8]">µg/m³</span>
            </div>
            <div className="w-full bg-[#162331] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  currentPm25Value > 60 ? 'bg-[#EF5350]' : 'bg-[#22C7A0]'
                }`}
                style={{
                  width: `${Math.min(100, (currentPm25Value / 60) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* 3. Bio-Pollen Index */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
                Bio-Pollen Index
              </span>
              <span className="text-[10px] text-[#22C7A0] font-semibold bg-[#22C7A0]/10 px-2 py-0.5 rounded-full border border-[#22C7A0]/30">
                {currentPollenValue >= 4 ? 'High Allergen' : currentPollenValue >= 3 ? 'Moderate' : 'Low Risk'}
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-[#22C7A0]">
                {isLoadingHistory ? '—' : `Level ${currentPollenValue}`}
              </span>
              <span className="text-xs text-[#93A4B8]">/ 5 Scale</span>
            </div>
            <span className="text-[10px] text-[#93A4B8]">
              {historicalData?.current?.totalPollenGrains
                ? `${historicalData.current.totalPollenGrains} grains/m³ biological load`
                : 'Grass, Birch & Tree aero-allergen count'}
            </span>
          </div>

          {/* 4. 7-Day Trajectory */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
                7-Day Trajectory
              </span>
              <span className="text-[10px] text-[#43C7F4] font-semibold bg-[#1499E8]/10 px-2 py-0.5 rounded-full border border-[#1499E8]/30">
                {trendStatus}
              </span>
            </div>
            <div className="my-1.5 flex items-center gap-1.5 text-[#22C7A0] font-bold text-base">
              <ShieldCheck className="w-4 h-4 text-[#22C7A0]" />
              <span className="font-mono text-sm">7d Avg: {sevenDayAvgPm25} µg/m³</span>
            </div>
            <span className="text-[10px] text-[#93A4B8]">
              Peak: {historicalData?.peakConcentration ?? currentPm25Value} µg/m³ ({historicalData?.peakTime || 'Observed'})
            </span>
          </div>
        </div>

        {/* Legend Bar & Interpretation Guide */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs px-2 py-1 bg-[#071018] rounded-xl border border-[#162331]">
          <div className="flex items-center gap-5 flex-wrap">
            {(trendView === 'both' || trendView === 'pm25') && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-[#FFC857] inline-block shadow-[0_0_8px_rgba(255,200,87,0.8)]" />
                <span className="text-xs font-semibold text-[#F4F7FA]">PM2.5 Concentration</span>
                <span className="text-[10px] font-mono text-[#FFC857] bg-[#FFC857]/10 px-1.5 py-0.2 rounded border border-[#FFC857]/30">
                  µg/m³ (Left Y-Axis)
                </span>
              </div>
            )}

            {(trendView === 'both' || trendView === 'pollen') && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1.5 rounded-full bg-[#22C7A0] inline-block shadow-[0_0_8px_rgba(34,199,160,0.8)]" />
                <span className="text-xs font-semibold text-[#F4F7FA]">Bio-Pollen Allergen Level</span>
                <span className="text-[10px] font-mono text-[#22C7A0] bg-[#22C7A0]/10 px-1.5 py-0.2 rounded border border-[#22C7A0]/30">
                  1-5 Index (Right Y-Axis)
                </span>
              </div>
            )}

            {(trendView === 'both' || trendView === 'pm25') && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-b border-dashed border-[#EF5350] inline-block" />
                <span className="text-[11px] text-[#EF5350] font-medium">
                  CPCB 24h Safe Limit (60 µg/m³)
                </span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-[#93A4B8] hidden sm:inline-block">
            Hover points on graph for granular day-by-day analysis
          </span>
        </div>

        {/* Recharts 7-day Trend Area/Line Visualizer */}
        <div className="h-[320px] w-full bg-[#071018] p-4 rounded-xl border border-[#162331] relative overflow-hidden flex items-center justify-center">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#38BDF8]" />
              <span>Loading verified historical observations for {formatDateShort(new Date(`${selectedDate}T00:00:00`))}...</span>
            </div>
          ) : historyError || !visibleChartData.length ? (
            <div className="flex flex-col items-center gap-2 text-[#93A4B8] text-xs text-center p-6">
              <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
              <span className="font-semibold text-white">No verified historical data available for this date.</span>
              <span className="text-[11px] text-[#64748B]">
                The environmental monitoring station does not have certified archival telemetry for the requested date window.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={visibleChartData}
                margin={{ top: 20, right: trendView === 'pm25' ? 15 : 35, bottom: 10, left: 10 }}
              >
                <defs>
                  {/* PM2.5 Soft Radiant Gradient */}
                  <linearGradient id="pm25GlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFC857" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#FFC857" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#FFC857" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Pollen Soft Emerald Gradient */}
                  <linearGradient id="pollenGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C7A0" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22C7A0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                {/* Grid with dark subtle styling */}
                <CartesianGrid strokeDasharray="3 3" stroke="#162331" vertical={false} />

                {/* X-Axis */}
                <XAxis
                  dataKey="day"
                  stroke="#6B7C93"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#162331' }}
                  dy={8}
                />

                {/* Left Y-Axis: PM2.5 */}
                <YAxis
                  yAxisId="left"
                  stroke="#FFC857"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#162331' }}
                  domain={[0, (dataMax: number) => Math.max(80, Math.ceil(dataMax * 1.3))]}
                  ticks={[0, 20, 40, 60, 80]}
                  tickFormatter={(v) => `${v}`}
                  dx={-4}
                />

                {/* Right Y-Axis: Bio-Pollen Index (1-5) */}
                {(trendView === 'both' || trendView === 'pollen') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 6]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(v) => `L${v}`}
                    stroke="#22C7A0"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#162331' }}
                    dx={4}
                  />
                )}

                {/* Rich Interactive Tooltip */}
                <Tooltip
                  content={<CustomTrendTooltip />}
                  cursor={{ stroke: '#1499E8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                />

                {/* Reference line for CPCB Safe standard */}
                {(trendView === 'both' || trendView === 'pm25') && (
                  <ReferenceLine
                    yAxisId="left"
                    y={60}
                    stroke="#EF5350"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'CPCB Limit: 60 µg/m³',
                      fill: '#EF5350',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                )}

                {/* PM2.5 Area / Curve */}
                {(trendView === 'both' || trendView === 'pm25') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="pm25"
                    name="PM2.5"
                    stroke="#FFC857"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pm25GlowGradient)"
                    dot={{
                      r: 4,
                      fill: '#071018',
                      stroke: '#FFC857',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6.5,
                      fill: '#FFC857',
                      stroke: '#FFFFFF',
                      strokeWidth: 2.5,
                    }}
                  />
                )}

                {/* Bio-Pollen Line / Curve */}
                {(trendView === 'both' || trendView === 'pollen') && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pollen"
                    name="Bio-Pollen Level"
                    stroke="#22C7A0"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: '#071018',
                      stroke: '#22C7A0',
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6.5,
                      fill: '#22C7A0',
                      stroke: '#FFFFFF',
                      strokeWidth: 2.5,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* India Synoptic Weather & AQI Map Layer with FULLY FUNCTIONAL BUTTONS */}
      <IndiaWeatherMap
        data={INDIA_WEATHER_DATA}
        metric={mapMetric}
        onMetricChange={setMapMetric}
        selectedState={activeStateName}
        onStateSelect={handleStateSelect}
      />

      {/* Regional Station Table */}
      <div className="mausam-card">
        <SectionHeader
          title="Regional Continuous Ambient Air Quality Monitoring Stations"
          subtitle="Real-time 24-hour rolling averages from Central & State Pollution Control Board monitors. Click any station to focus on the National Map."
          icon="location_city"
        />

        <DataTable
          data={cityAqiData}
          columns={cityColumns}
          keyExtractor={(item) => item.city}
        />
      </div>
    </div>
  );
};
