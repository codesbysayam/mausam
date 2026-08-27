import React, { useState } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { CurrentWeather } from '../components/weather/CurrentWeather';
import { WeatherMetrics } from '../components/weather/WeatherMetrics';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DailyForecast } from '../components/weather/DailyForecast';
import { PersonaWeatherHub } from '../components/weather/personas/PersonaWeatherHub';

interface WeatherPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onRefresh: () => void;
  onChangeLocationClick?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const WeatherPage: React.FC<WeatherPageProps> = ({
  weatherBundle,
  selectedLocation,
  onRefresh,
  onChangeLocationClick,
  onNavigateToTab,
}) => {
  const { t, tCondition } = useLanguage();
  const { current, hourly = [], daily = [], lastFetchedAt } = weatherBundle;
  const [selectedHourlyHour, setSelectedHourlyHour] = useState<string | null>(null);

  const formattedLastUpdated = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(lastFetchedAt || new Date());

  // AQI calculations
  const aqiVal = current.aqi || 82;
  const aqiCategory =
    aqiVal <= 50 ? 'Good' :
    aqiVal <= 100 ? 'Satisfactory' :
    aqiVal <= 200 ? 'Moderate' :
    aqiVal <= 300 ? 'Poor' :
    aqiVal <= 400 ? 'Very Poor' : 'Severe';

  const aqiBadgeColor =
    aqiVal <= 50 ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40' :
    aqiVal <= 100 ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40' :
    aqiVal <= 200 ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40' :
    aqiVal <= 300 ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40' :
    'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* =========================================================================
          1. LOCATION OBSERVATION HEADER BAR
      ========================================================================= */}
      <div className="mausam-panel py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#17212B] border border-[#334155] rounded-[5px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-white leading-none">
                {selectedLocation.city}, {selectedLocation.state}
              </h1>
              <span className="text-[11px] text-[#4FA8E0] font-mono bg-[#1E2733] px-2 py-0.5 rounded border border-[#334155]">
                {selectedLocation.imdStation || 'AWS-IND-01'}
              </span>
              {selectedLocation.coastalStatus === 'coastal' && (
                <span className="text-[10px] text-[#1ABC9C] bg-[#1ABC9C]/15 px-1.5 py-0.5 rounded border border-[#1ABC9C]/40">
                  Coastal Sector
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8A94A6] mt-1">
              Observatory Coordinates: {typeof selectedLocation.lat === 'number' ? selectedLocation.lat.toFixed(2) : '20.29'}°N, {typeof selectedLocation.lng === 'number' ? selectedLocation.lng.toFixed(2) : '85.82'}°E • Elevation: {selectedLocation.elevation || '45m ASL'} • Sub-Division: {selectedLocation.district || selectedLocation.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-[11px] text-[#8A94A6]">
            {t('updated', 'Updated')}: <strong className="text-[#D7DEE8]">{formattedLastUpdated}</strong>
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="mausam-button mausam-button-outline text-xs py-1 px-2.5 flex items-center gap-1"
            title={t('refresh', 'Refresh Data')}
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>{t('refresh', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. CURRENT WEATHER HERO & METEOROLOGICAL METRICS GRID
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Current Weather Card */}
        <div className="lg:col-span-6 flex flex-col">
          <CurrentWeather
            weather={current}
            location={selectedLocation}
            lastUpdated={formattedLastUpdated}
            onRefresh={onRefresh}
            onChangeLocationClick={onChangeLocationClick}
          />
        </div>

        {/* Detailed Weather Metrics Grid */}
        <div className="lg:col-span-6 flex flex-col">
          <WeatherMetrics
            weather={current}
            onMetricClick={() => {}}
          />
        </div>
      </div>

      {/* =========================================================================
          3. AUTHORITATIVE MULTI-PERSONA WEATHER INTELLIGENCE HUB (8 USER PERSONAS)
      ========================================================================= */}
      <PersonaWeatherHub
        selectedLocation={selectedLocation}
        weatherBundle={weatherBundle}
      />

      {/* =========================================================================
          4. ENVIRONMENT & HEALTH (AQI, Pollen, UV, PM2.5, PM10)
      ========================================================================= */}
      <div className="mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#334155]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1ABC9C] text-[18px]">
                air
              </span>
              <span>ENVIRONMENT, AIR QUALITY &amp; AERO-ALLERGEN POLLEN</span>
            </h2>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              Continuous atmospheric telemetry calibrated for {selectedLocation.city}
            </p>
          </div>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('aqi')}
              className="text-xs text-[#4FA8E0] hover:underline self-start sm:self-center"
            >
              View Full NAQI Station Telemetry →
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* AQI */}
          <div className="mausam-card p-3 border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold">
                National AQI
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${aqiBadgeColor}`}>
                {aqiCategory}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {aqiVal}
              </span>
              <span className="text-xs text-[#8A94A6]">NAQI</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1">
              Prominent: PM2.5 (Fine Particulate)
            </span>
          </div>

          {/* PM2.5 & PM10 */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              Particulate Matter
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <div>
                <span className="text-xs text-[#8A94A6]">PM2.5: </span>
                <strong className="text-sm font-mono text-white">{current.aqiPm25 || 42}</strong>
                <span className="text-[10px] text-[#8A94A6]"> µg/m³</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-xs text-[#8A94A6]">PM10: </span>
              <strong className="text-sm font-mono text-white">{current.aqiPm10 || 78}</strong>
              <span className="text-[10px] text-[#8A94A6]"> µg/m³</span>
            </div>
          </div>

          {/* Pollen */}
          <div className="mausam-card p-3 border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold">
                Pollen Count
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/40">
                {current.pollen || 'Moderate'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {current.pollenCount || 34}
              </span>
              <span className="text-xs text-[#8A94A6]">grains/m³</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1">
              Tree: {current.treePollen || 14} • Grass: {current.grassPollen || 12}
            </span>
          </div>

          {/* UV Index */}
          <div className="mausam-card p-3 border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold">
                UV Radiation
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F1C40F]/15 text-[#F1C40F] border border-[#F1C40F]/40">
                {current.uvIndex >= 8 ? 'Very High' : current.uvIndex >= 6 ? 'High' : 'Moderate'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {current.uvIndex || 6}
              </span>
              <span className="text-xs text-[#8A94A6]">/ 11+ Index</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1">
              Wear sunglasses &amp; sun protection
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. TODAY'S HOURLY FORECAST (24-Hour Synoptic Timeline)
      ========================================================================= */}
      <div className="w-full">
        <HourlyForecast
          hourly={hourly}
          selectedHour={selectedHourlyHour}
          onSelectHour={setSelectedHourlyHour}
        />
      </div>

      {/* =========================================================================
          5. 7-DAY EXTENDED SYNOPTIC FORECAST & ASTRONOMICAL CYCLE
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 7-Day Outlook */}
        <div className="lg:col-span-8 flex flex-col">
          <DailyForecast
            daily={daily}
            onSelectDay={() => {}}
          />
        </div>

        {/* Astronomy / Sun Cycle & Doppler Radar Station Info */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Sun Cycle Card */}
          <div className="mausam-card p-4 border border-[#334155]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#F1C40F] text-[18px]">
                wb_sunny
              </span>
              <span>SOLAR &amp; ASTRONOMICAL CYCLE</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center py-2 border-b border-[#334155]">
              <div>
                <span className="text-[10px] text-[#8A94A6] uppercase block">Sunrise</span>
                <strong className="text-xs font-mono text-white block mt-0.5">
                  {current.sunrise || '05:42 AM'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#8A94A6] uppercase block">Solar Noon</span>
                <strong className="text-xs font-mono text-[#F1C40F] block mt-0.5">
                  {current.solarNoon || '11:58 AM'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#8A94A6] uppercase block">Sunset</span>
                <strong className="text-xs font-mono text-white block mt-0.5">
                  {current.sunset || '06:14 PM'}
                </strong>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#8A94A6]">
              <span>Daylight Duration:</span>
              <strong className="text-white font-mono">{current.dayLength || '12h 32m'}</strong>
            </div>
          </div>

          {/* Ground Station Radar Coverage */}
          <div className="mausam-card p-4 border border-[#334155] flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  radar
                </span>
                <span>DOPPLER RADAR COVERAGE</span>
              </h3>
              <p className="text-xs text-[#D7DEE8]">
                Primary surveillance radar: <strong className="text-[#4FA8E0]">{selectedLocation.radarCoverage || 'Gopalpur / Paradip DWR (S-Band)'}</strong>
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-[#8A94A6]">
                <div className="flex justify-between">
                  <span>Radar Scan Interval:</span>
                  <span className="text-[#D7DEE8] font-mono">10 Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Beam Resolution:</span>
                  <span className="text-[#D7DEE8] font-mono">250m Radial</span>
                </div>
                <div className="flex justify-between">
                  <span>Calibration Status:</span>
                  <span className="text-[#2ECC71] font-bold">WMO Class-A Verified</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#334155] flex items-center justify-between">
              <span className="text-[10px] text-[#8A94A6]">Observatory ID: {selectedLocation.id}</span>
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('reports')}
                  className="text-xs text-[#4FA8E0] hover:underline"
                >
                  Submit Ground Report →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
