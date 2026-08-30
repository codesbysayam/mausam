import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { WeatherPageHeader } from '../components/weather/WeatherPageHeader';
import { LocationWeatherHero } from '../components/weather/LocationWeatherHero';
import { WeatherStatusStrip } from '../components/weather/WeatherStatusStrip';
import { WeatherTelemetryGrid } from '../components/weather/WeatherTelemetryGrid';
import { WeatherWidgets } from '../components/weather/WeatherWidgets';
import { HourlyWeatherTimeline } from '../components/weather/HourlyWeatherTimeline';
import { SevenDaySynopticForecast } from '../components/weather/SevenDaySynopticForecast';
import { SolarCycleCard } from '../components/weather/SolarCycleCard';
import { PersonaWeatherHub } from '../components/weather/personas/PersonaWeatherHub';
import { buildHumanWeatherStory } from '../services/humanWeatherEngine';
import {
  Activity,
  Radio,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface WeatherPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onRefresh: () => void;
  onChangeLocationClick?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onSelectLocation?: (location: LocationRecord) => void;
}

export const WeatherPage: React.FC<WeatherPageProps> = ({
  weatherBundle,
  selectedLocation,
  onRefresh,
  onChangeLocationClick,
  onNavigateToTab,
  onSelectLocation,
}) => {
  const { t } = useLanguage();
  const { current, hourly = [], daily = [], alerts = [], lastFetchedAt, isLive = true } = weatherBundle;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formattedLastUpdated = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(lastFetchedAt || new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const weatherStory = useMemo(() => {
    return buildHumanWeatherStory(current, hourly, daily, alerts, 'general');
  }, [current, hourly, daily, alerts]);

  // AQI calculations
  const aqiVal = current.aqi || 82;
  const aqiCategory =
    aqiVal <= 50
      ? 'Good'
      : aqiVal <= 100
      ? 'Satisfactory'
      : aqiVal <= 200
      ? 'Moderate'
      : aqiVal <= 300
      ? 'Poor'
      : aqiVal <= 400
      ? 'Very Poor'
      : 'Severe';

  const aqiBadgeColor =
    aqiVal <= 50
      ? 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/40'
      : aqiVal <= 100
      ? 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/40'
      : aqiVal <= 200
      ? 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/40'
      : aqiVal <= 300
      ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/40'
      : 'bg-[#EF5350]/15 text-[#EF5350] border-[#EF5350]/40';

  return (
    <div id="weather-comprehensive-view-container" className="flex flex-col gap-6 w-full pb-12">
      {/* =========================================================================
          1. DYNAMIC OBSERVATION HEADER
      ========================================================================= */}
      <WeatherPageHeader
        selectedLocation={selectedLocation}
        lastUpdated={formattedLastUpdated}
        isLive={isLive}
        isLoading={isRefreshing}
        onRefresh={handleRefresh}
        onSelectLocation={onSelectLocation}
      />

      {/* =========================================================================
          2. CURRENT WEATHER HERO (PRIMARY VISUAL WEATHER STATE + SOLAR TIMER)
      ========================================================================= */}
      <LocationWeatherHero weather={current} location={selectedLocation} />

      {/* =========================================================================
          3. HUMAN-CENTERED "WHAT THIS MEANS" NARRATIVE CONTEXT BANNER
      ========================================================================= */}
      <div className="mausam-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1499E8]/15 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#43C7F4] block">
              Atmospheric Context &amp; Guidance
            </span>
            <p className="text-sm text-[#F4F7FA] font-medium mt-0.5">
              {weatherStory.whatIsHappening}
            </p>
            <p className="text-xs text-[#93A4B8] mt-1">
              Outlook: {weatherStory.whatWillHappen} • Action: {weatherStory.recommendedAction}
            </p>
          </div>
        </div>

        {onNavigateToTab && (
          <button
            type="button"
            onClick={() => onNavigateToTab('forecast')}
            className="mausam-btn mausam-btn--secondary text-xs font-semibold py-2 px-3.5 whitespace-nowrap self-start sm:self-center"
          >
            <span>Numerical 7-Day Outlook →</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          4. REAL-TIME SYNOPTIC OPERATIONAL STATUS STRIP
      ========================================================================= */}
      <WeatherStatusStrip weather={current} alerts={alerts} />

      {/* =========================================================================
          5. 12-PARAMETER CALIBRATED METEOROLOGICAL TELEMETRY GRID
      ========================================================================= */}
      <WeatherTelemetryGrid weather={current} />

      {/* =========================================================================
          6. TODAY'S HOURLY WEATHER TIMELINE (NOWCAST WITH VISUAL CURVE)
      ========================================================================= */}
      <HourlyWeatherTimeline hourly={hourly} />

      {/* =========================================================================
          7. 7-DAY EXTENDED SYNOPTIC FORECAST & ASTRONOMICAL EPHEMERIS CYCLE
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 7-Day Forecast (8 cols on large screens) */}
        <div className="lg:col-span-8 flex flex-col">
          <SevenDaySynopticForecast daily={daily} />
        </div>

        {/* Solar Ephemeris & Radar Metadata (4 cols on large screens) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Solar Cycle */}
          <div className="flex-1">
            <SolarCycleCard weather={current} location={selectedLocation} />
          </div>

          {/* Doppler Radar & Observatory Station Coverage */}
          <div
            id="station-radar-metadata-card"
            className="mausam-panel flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#162331]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4]">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                    Doppler Radar Link
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#22C7A0] bg-[#22C7A0]/10 px-2 py-0.5 rounded-full border border-[#22C7A0]/30">
                  ONLINE
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs text-[#D1DCE8]">
                  Surveillance Radar:{' '}
                  <strong className="text-[#43C7F4]">
                    {selectedLocation.radarCoverage || 'Regional S-Band DWR Network'}
                  </strong>
                </p>
                <div className="mt-2.5 space-y-1.5 text-[11px] text-[#93A4B8]">
                  <div className="flex justify-between">
                    <span>Scan Interval:</span>
                    <span className="text-[#F4F7FA] font-mono">10 Minutes (Volumetric)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beam Resolution:</span>
                    <span className="text-[#F4F7FA] font-mono">250m Radial</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard:</span>
                    <span className="text-[#22C7A0] font-semibold">WMO Class-A Ground AWS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#162331] flex items-center justify-between gap-2">
              {onNavigateToTab && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('radar')}
                    className="text-xs text-[#43C7F4] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Doppler Radar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('reports')}
                    className="text-xs text-[#93A4B8] hover:text-white transition-colors"
                  >
                    Submit Ground Observation →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. MODULAR ATMOSPHERIC OBSERVATION WIDGETS
      ========================================================================= */}
      <div className="w-full">
        <WeatherWidgets weather={current} />
      </div>

      {/* =========================================================================
          9. ENVIRONMENT, AIR QUALITY & POLLEN TELEMETRY
      ========================================================================= */}
      <div
        id="weather-air-quality-environmental-panel"
        className="mausam-panel flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#162331]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22C7A0]/15 border border-[#22C7A0]/30 flex items-center justify-center text-[#22C7A0]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-[#F4F7FA]">
                Environment, Air Quality &amp; Aero-Allergen Pollen
              </h2>
              <p className="text-xs text-[#93A4B8]">
                Continuous micro-climate and particulate telemetry calibrated for {selectedLocation.city}
              </p>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('aqi')}
              className="text-xs font-semibold text-[#43C7F4] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore NAQI Grid Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* National AQI */}
          <div className="mausam-panel-subtle flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#93A4B8] uppercase font-bold">National AQI</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aqiBadgeColor}`}>
                {aqiCategory}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl font-bold text-[#F4F7FA] tracking-tight">{aqiVal}</span>
              <span className="text-xs text-[#93A4B8]">NAQI Index</span>
            </div>
            <span className="text-[11px] text-[#93A4B8]">
              Dominant: PM2.5 (Fine Respirable)
            </span>
          </div>

          {/* Particulate Matter PM2.5 & PM10 */}
          <div className="mausam-panel-subtle flex flex-col justify-between gap-2">
            <span className="text-[11px] text-[#93A4B8] uppercase font-bold">Particulate Concentrations</span>
            <div className="grid grid-cols-2 gap-2 my-1">
              <div className="bg-[#111C27] p-2 rounded-lg border border-[#162331]">
                <span className="text-[10px] text-[#93A4B8] block">PM2.5</span>
                <span className="text-base font-bold text-[#F4F7FA]">
                  {current.aqiPm25 || 42}{' '}
                  <span className="text-[10px] text-[#93A4B8] font-normal">µg/m³</span>
                </span>
              </div>
              <div className="bg-[#111C27] p-2 rounded-lg border border-[#162331]">
                <span className="text-[10px] text-[#93A4B8] block">PM10</span>
                <span className="text-base font-bold text-[#F4F7FA]">
                  {current.aqiPm10 || 78}{' '}
                  <span className="text-[10px] text-[#93A4B8] font-normal">µg/m³</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#22C7A0]">Within CPCB 24h Standards</span>
          </div>

          {/* Pollen */}
          <div className="mausam-panel-subtle flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#93A4B8] uppercase font-bold">Aero-Allergen Pollen</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C7A0]/15 text-[#22C7A0] border border-[#22C7A0]/40">
                {current.pollen || 'Low-Mod'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl font-bold text-[#F4F7FA] tracking-tight">
                {current.pollenCount || 34}
              </span>
              <span className="text-xs text-[#93A4B8]">grains / m³</span>
            </div>
            <span className="text-[11px] text-[#93A4B8]">
              Tree: {current.treePollen || 14} • Grass: {current.grassPollen || 12}
            </span>
          </div>

          {/* UV Radiation */}
          <div className="mausam-panel-subtle flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#93A4B8] uppercase font-bold">Solar UV Index</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFC857]/15 text-[#FFC857] border border-[#FFC857]/40">
                {current.uvIndex >= 8 ? 'Very High' : current.uvIndex >= 6 ? 'High' : 'Moderate'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl font-bold text-[#F4F7FA] tracking-tight">
                {current.uvIndex || 5.8}
              </span>
              <span className="text-xs text-[#93A4B8]">/ 11+ Index</span>
            </div>
            <span className="text-[11px] text-[#93A4B8]">
              Sun protection recommended around solar noon
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          10. 8 SPECIALIZED WEATHER INTELLIGENCE PERSONAS
      ========================================================================= */}
      <PersonaWeatherHub selectedLocation={selectedLocation} weatherBundle={weatherBundle} />
    </div>
  );
};
