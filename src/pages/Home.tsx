import React, { useState } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { StateWeatherData, IndiaWeatherMap } from '../components/map/IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';

interface HomePageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onRefresh: () => void;
  onStateSelect: (state: StateWeatherData) => void;
  onViewAlertsTab: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  weatherBundle,
  selectedLocation,
  onRefresh,
  onStateSelect,
  onViewAlertsTab,
}) => {
  const { current, hourly = [], daily = [], alerts = [], lastFetchedAt } = weatherBundle;
  const [mapMetric, setMapMetric] = useState<'temp' | 'rainfall' | 'aqi' | 'humidity' | 'pollen'>('temp');

  const formattedLastUpdated = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(lastFetchedAt || new Date());

  const activeAlert = alerts && alerts.length > 0 ? alerts[0] : null;

  // AQI calculations
  const aqiVal = current.aqi || 84;
  const aqiCategory =
    aqiVal <= 50 ? 'Good' :
    aqiVal <= 100 ? 'Satisfactory' :
    aqiVal <= 200 ? 'Moderate' :
    aqiVal <= 300 ? 'Poor' :
    aqiVal <= 400 ? 'Very Poor' : 'Severe';

  const aqiColorClass =
    aqiVal <= 50 ? 'status-good' :
    aqiVal <= 100 ? 'status-good' :
    aqiVal <= 200 ? 'status-warning' :
    aqiVal <= 300 ? 'status-alert' : 'status-danger';

  const aqiBgBadge =
    aqiVal <= 50 ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40' :
    aqiVal <= 100 ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40' :
    aqiVal <= 200 ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40' :
    aqiVal <= 300 ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40' :
    'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* =========================================================================
          1. WEATHER BULLETIN (Official IMD / NDMA Synoptic Alert Banner)
      ========================================================================= */}
      <div className="mausam-section mb-0">
        {activeAlert ? (
          <div
            className={`mausam-alert ${
              activeAlert.severity === 'red'
                ? ''
                : activeAlert.severity === 'orange' || activeAlert.severity === 'yellow'
                ? 'warning'
                : 'normal'
            } justify-between flex-wrap`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#FF8C42]">
                warning
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-xs text-white">
                    IMD SYNOPTIC WARNING: {activeAlert.title || activeAlert.headline}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#17212B] text-[#D7DEE8] border border-[#334155]">
                    Code {activeAlert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#D7DEE8] mt-0.5">
                  {activeAlert.description || 'Special meteorological advisory issued for active district and adjoining sub-divisions.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={onViewAlertsTab}
                className="mausam-button text-xs py-1 px-3"
              >
                View Advisory Matrix
              </button>
            </div>
          </div>
        ) : (
          <div className="mausam-alert normal justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#2ECC71]">
                verified
              </span>
              <div>
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  ALL-INDIA SYNOPTIC STATUS: GREEN (NORMAL)
                </span>
                <p className="text-xs text-[#D7DEE8] mt-0.5">
                  No severe weather convective warnings in effect for {selectedLocation.city}, {selectedLocation.state}. Routine operational surveillance active.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#8A94A6]">
              Ref: IMD-NW-BULLETIN-2026
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. LOCATION / LAST UPDATED HEADER BAR
      ========================================================================= */}
      <div className="mausam-panel py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#17212B] border border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0]">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white leading-none">
                {selectedLocation.city}, {selectedLocation.state}
              </h1>
              <span className="text-[11px] text-[#4FA8E0] font-mono bg-[#1E2733] px-2 py-0.5 rounded border border-[#334155]">
                {selectedLocation.imdStation || 'AWS-IND-01'}
              </span>
            </div>
            <p className="text-[11px] text-[#8A94A6] mt-1">
              Observatory Coordinates: {typeof selectedLocation.lat === 'number' ? selectedLocation.lat.toFixed(2) : '20.29'}°N, {typeof selectedLocation.lng === 'number' ? selectedLocation.lng.toFixed(2) : '85.82'}°E • Elevation: {selectedLocation.elevation || '45m ASL'} • Sub-Division: {selectedLocation.district || selectedLocation.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:self-center self-start">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block">
              Observational Timestamp
            </span>
            <span className="text-xs font-mono font-bold text-[#D7DEE8]">
              {formattedLastUpdated} IST
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="mausam-button mausam-button-outline flex items-center gap-1.5 text-xs py-1.5 px-3"
            title="Refresh latest surface telemetry"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. CURRENT SURFACE WEATHER & TELEMETRY OBSERVATIONS
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              thermostat
            </span>
            <h2 className="mausam-section-title">
              Surface Meteorological Observations &amp; Synoptic Parameters
            </h2>
          </div>
          <span className="text-xs text-[#8A94A6] font-mono">
            Sensor Network: WMO Compliant AWS
          </span>
        </div>

        <div className="mausam-grid">
          {/* Main Primary Temperature & Sky Condition Column */}
          <div className="mausam-col-4">
            <div className="mausam-panel h-full flex flex-col justify-between bg-[#17212B]">
              <div>
                <span className="mausam-data-label uppercase tracking-wider">
                  Surface Dry-Bulb Temperature
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="mausam-temperature">
                    {Math.round(current.temp)}
                  </span>
                  <span className="mausam-temperature-unit">°C</span>
                  <span className="text-xs text-[#8A94A6] font-mono ml-2">
                    ({((current.temp * 9) / 5 + 32).toFixed(1)}°F)
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {current.condition || 'Partly Cloudy'}
                  </span>
                  <span className="text-xs text-[#8A94A6]">
                    • Feels like {Math.round(current.feelsLike || current.temp)}°C
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#334155] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#8A94A6] block">Diurnal High / Low</span>
                  <span className="font-mono font-bold text-white">
                    {Math.round(current.high || current.temp + 3)}°C / {Math.round(current.low || current.temp - 4)}°C
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8A94A6] block">Precipitation (24h)</span>
                  <span className="font-mono font-bold text-[#4FA8E0]">
                    {current.rainfall !== undefined ? `${current.rainfall} mm` : '0.0 mm'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Synoptic Observational Parameters Matrix */}
          <div className="mausam-col-8">
            <div className="mausam-panel bg-[#17212B] h-full">
              <span className="text-xs font-bold text-[#D7DEE8] uppercase tracking-wider block mb-3 pb-2 border-b border-[#334155]">
                Real-Time Surface Telemetry Data Channels
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Relative Humidity</span>
                  <span className="mausam-data-value text-[#4FA8E0] font-mono">
                    {current.humidity}%
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    Hygrometer sensor
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">MSL Pressure</span>
                  <span className="mausam-data-value text-white font-mono">
                    {current.pressure || 1012} hPa
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    Barometric reduction
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Wind Velocity</span>
                  <span className="mausam-data-value text-white font-mono">
                    {current.windSpeed} km/h
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    Dir: {current.windDirection || 'ESE'} ({current.windDeg || 110}°)
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Dew Point</span>
                  <span className="mausam-data-value text-white font-mono">
                    {current.dewPoint || 22}°C
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    Saturation boundary
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Horizontal Visibility</span>
                  <span className="mausam-data-value text-white font-mono">
                    {current.visibility || 6.0} km
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    Transmissometer
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Solar UV Index</span>
                  <span className="mausam-data-value text-[#F1C40F] font-mono">
                    {current.uvIndex || 6} / 12
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    Moderate exposure
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Total Cloud Cover</span>
                  <span className="mausam-data-value text-white font-mono">
                    {current.cloudCover || 45}%
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    3-4 Octas (Cumulus)
                  </span>
                </div>

                <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
                  <span className="mausam-data-label">Solar Ephemeris</span>
                  <span className="text-xs font-mono font-bold text-white block">
                    ↑ {current.sunrise || '05:38'} • ↓ {current.sunset || '18:14'}
                  </span>
                  <span className="text-[10px] text-[#8A94A6] block mt-0.5">
                    IST Astronomical
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. TODAY'S HOURLY FORECAST (Continuous Synoptic Progression)
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              schedule
            </span>
            <h2 className="mausam-section-title">
              24-Hour High-Resolution Numerical Forecast
            </h2>
          </div>
          <span className="text-xs text-[#8A94A6]">
            Model: WRF 3-km Post-Processed Guidance
          </span>
        </div>

        <div className="mausam-panel bg-[#17212B] p-0 overflow-hidden">
          <div className="overflow-x-auto p-4 flex gap-3 scrollbar-thin">
            {hourly.map((hour, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-between p-3 bg-[#1E2733] rounded border border-[#334155] min-w-[100px] text-center shrink-0 hover:border-[#4FA8E0] transition-colors"
              >
                <span className="text-xs font-mono font-bold text-[#8A94A6]">
                  {hour.time}
                </span>

                <span className="text-lg font-bold text-white font-mono my-2">
                  {Math.round(hour.temp)}°C
                </span>

                <span className="text-[11px] text-[#D7DEE8] line-clamp-1 h-4">
                  {hour.condition}
                </span>

                <div className="mt-2 pt-2 border-t border-[#334155] w-full text-[10px] text-[#8A94A6] flex justify-between">
                  <span className="text-[#4FA8E0] font-bold">
                    {hour.precipitationProbability || 0}%
                  </span>
                  <span>{hour.humidity || 65}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. NATIONAL METEOROLOGICAL MAP OF INDIA (Dynamic State Map)
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              map
            </span>
            <h2 className="mausam-section-title">
              National Synoptic Meteorological Observation Map
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-[#1E2733] p-1 rounded border border-[#334155]">
            {(
              [
                { key: 'temp', label: 'Temperature' },
                { key: 'rainfall', label: 'Precipitation' },
                { key: 'aqi', label: 'NAQI Index' },
                { key: 'humidity', label: 'Humidity' },
                { key: 'pollen', label: 'Pollen' },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMapMetric(m.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  mapMetric === m.key
                    ? 'bg-[#0B72B9] text-white'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mausam-panel bg-[#17212B] p-4">
          <IndiaWeatherMap
            data={INDIA_WEATHER_DATA}
            selectedState={selectedLocation.state}
            onStateSelect={onStateSelect}
            metric={mapMetric}
          />
        </div>
      </div>

      {/* =========================================================================
          6. ENVIRONMENTAL CONDITIONS (Air Quality & Aero-Allergens)
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              air
            </span>
            <h2 className="mausam-section-title">
              Environmental Atmospheric Quality &amp; Aero-Allergen Surveillance
            </h2>
          </div>
          <span className="text-xs text-[#8A94A6]">
            Source: CPCB Continuous Ambient Air Quality Monitoring (CAAQMS)
          </span>
        </div>

        <div className="mausam-grid">
          {/* AQI Overview Box */}
          <div className="mausam-col-6">
            <div className="mausam-panel bg-[#17212B] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      National Air Quality Index (NAQI)
                    </span>
                    <span className="text-[11px] text-[#8A94A6] block">
                      Station: {selectedLocation.city} Ambient Monitor
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${aqiBgBadge}`}>
                    {aqiCategory}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 my-4">
                  <span className={`text-5xl font-bold font-mono ${aqiColorClass}`}>
                    {aqiVal}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Category: {aqiCategory}
                    </span>
                    <span className="text-[11px] text-[#8A94A6]">
                      Primary Pollutant: PM2.5 (Fine particulate matter)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <span className="text-[10px] text-[#8A94A6] block">PM2.5</span>
                    <span className="font-mono font-bold text-white">{current.aqiPm25 || 48} µg/m³</span>
                  </div>
                  <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <span className="text-[10px] text-[#8A94A6] block">PM10</span>
                    <span className="font-mono font-bold text-white">{current.aqiPm10 || 92} µg/m³</span>
                  </div>
                  <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <span className="text-[10px] text-[#8A94A6] block">NO₂</span>
                    <span className="font-mono font-bold text-white">24 µg/m³</span>
                  </div>
                  <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <span className="text-[10px] text-[#8A94A6] block">SO₂</span>
                    <span className="font-mono font-bold text-white">12 µg/m³</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#8A94A6] mt-3 pt-2 border-t border-[#334155]">
                Health Prompt: {aqiVal <= 100 ? 'Air quality is acceptable for outdoor activity.' : 'Sensitive groups with respiratory ailments should limit intense outdoor exertion.'}
              </p>
            </div>
          </div>

          {/* Botanical Pollen & Bio-Allergen Registry */}
          <div className="mausam-col-6">
            <div className="mausam-panel bg-[#17212B] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Botanical Aero-Allergen &amp; Pollen Forecast
                    </span>
                    <span className="text-[11px] text-[#8A94A6] block">
                      Bio-Meteorological Aerobiology Network
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#1E2733] text-[#4FA8E0] text-xs font-mono rounded border border-[#334155]">
                    Index: {current.pollenCount || 2} / 5
                  </span>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <div>
                      <span className="font-bold text-white block">Grass Pollen (Poaceae)</span>
                      <span className="text-[10px] text-[#8A94A6]">Peak dispersal: 06:00 AM – 10:00 AM</span>
                    </div>
                    <span className="text-xs font-bold text-[#F1C40F]">Moderate</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <div>
                      <span className="font-bold text-white block">Tree Pollen (Neem, Acacia, Eucalyptus)</span>
                      <span className="text-[10px] text-[#8A94A6]">Peak dispersal: 11:00 AM – 03:00 PM</span>
                    </div>
                    <span className="text-xs font-bold text-[#2ECC71]">Low</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#1E2733] rounded border border-[#334155]">
                    <div>
                      <span className="font-bold text-white block">Weed &amp; Mold Spores (Parthenium)</span>
                      <span className="text-[10px] text-[#8A94A6]">High humidity nocturnal dispersal</span>
                    </div>
                    <span className="text-xs font-bold text-[#2ECC71]">Low</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#8A94A6] mt-3 pt-2 border-t border-[#334155]">
                Advisory: Seasonal floral dispersion is currently low to moderate across the coastal plains.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. PERSONALIZED ADVISORY (Sectoral Directives)
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              assignment_ind
            </span>
            <h2 className="mausam-section-title">
              Sectoral Citizen &amp; Livelihood Advisories
            </h2>
          </div>
          <span className="text-xs text-[#8A94A6]">
            Operational Impact Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#17212B] rounded border border-[#334155] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase mb-2">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  directions_run
                </span>
                <span>Fitness &amp; Sports</span>
              </div>
              <p className="text-xs text-[#D7DEE8] leading-relaxed">
                Favorable morning window between 05:30 AM – 08:00 AM. Keep hydrated during midday solar peaks.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#334155] text-[11px] text-[#2ECC71] font-bold">
              Status: Suitable for outdoor runs
            </div>
          </div>

          <div className="p-3.5 bg-[#17212B] rounded border border-[#334155] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase mb-2">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  agriculture
                </span>
                <span>Agromet &amp; Farming</span>
              </div>
              <p className="text-xs text-[#D7DEE8] leading-relaxed">
                Adequate soil moisture present. Sowing and light fertigation operations can proceed smoothly.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#334155] text-[11px] text-[#4FA8E0] font-bold">
              GKMS Protocol: Proceed with scheduled irrigation
            </div>
          </div>

          <div className="p-3.5 bg-[#17212B] rounded border border-[#334155] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase mb-2">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  commute
                </span>
                <span>Transit &amp; Highway</span>
              </div>
              <p className="text-xs text-[#D7DEE8] leading-relaxed">
                Horizontal visibility above 6.0 km. Normal driving conditions expected along regional national highways.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#334155] text-[11px] text-[#2ECC71] font-bold">
              Status: Clear road visibility
            </div>
          </div>

          <div className="p-3.5 bg-[#17212B] rounded border border-[#334155] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase mb-2">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  medication
                </span>
                <span>Health &amp; Allergy</span>
              </div>
              <p className="text-xs text-[#D7DEE8] leading-relaxed">
                Moderate particulate level. Asthmatic patients should keep standard inhaler medication accessible.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#334155] text-[11px] text-[#F1C40F] font-bold">
              Advisory: Standard precautionary care
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. 7-DAY SYNOPTIC OUTLOOK FORECAST
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              calendar_month
            </span>
            <h2 className="mausam-section-title">
              7-Day Medium-Range Synoptic Outlook
            </h2>
          </div>
          <span className="text-xs text-[#8A94A6]">
            Spatial Resolution: Sub-Divisional Ensemble Grid
          </span>
        </div>

        <div className="mausam-table-wrapper">
          <table className="mausam-table">
            <thead>
              <tr>
                <th>Day / Date</th>
                <th>Sky &amp; Synoptic Condition</th>
                <th>Max / Min Temp</th>
                <th>Rain Probability</th>
                <th>Relative Humidity</th>
                <th>Surface Wind</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((day, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-white font-mono">
                    {day.day}
                  </td>
                  <td>
                    <span className="text-xs text-[#D7DEE8] font-medium">
                      {day.condition}
                    </span>
                  </td>
                  <td className="font-mono">
                    <span className="text-white font-bold">{Math.round(day.high)}°C</span>
                    <span className="text-[#8A94A6] mx-1">/</span>
                    <span className="text-[#8A94A6]">{Math.round(day.low)}°C</span>
                  </td>
                  <td>
                    <span className={`font-mono font-bold text-xs ${day.rainProb > 40 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'}`}>
                      {day.rainProb}%
                    </span>
                  </td>
                  <td className="font-mono text-xs text-[#D7DEE8]">
                    {day.humidity}%
                  </td>
                  <td className="font-mono text-xs text-[#8A94A6]">
                    {day.wind || '12 km/h ESE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          9. DATA SOURCES & SENSORS ARCHITECTURE
      ========================================================================= */}
      <div className="mausam-section">
        <div className="mausam-section-header">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              hub
            </span>
            <h2 className="mausam-section-title">
              National Observational Infrastructure &amp; Sensor Calibration
            </h2>
          </div>
          <span className="text-xs text-[#8A94A6]">
            Telemetry Registry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="font-bold text-white block">Automatic Weather Stations (AWS)</span>
            <span className="text-[#8A94A6] text-[11px] mt-0.5 block">
              Continuous 15-minute telemetry of temperature, humidity, pressure, and tipping-bucket rainfall.
            </span>
          </div>

          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="font-bold text-white block">Doppler Weather Radar (DWR)</span>
            <span className="text-[#8A94A6] text-[11px] mt-0.5 block">
              S-Band and C-Band radar radial velocity and storm reflectivity scans calibrated every 10 minutes.
            </span>
          </div>

          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="font-bold text-white block">INSAT-3DR Geostationary Imager</span>
            <span className="text-[#8A94A6] text-[11px] mt-0.5 block">
              Infrared, Visible, and Water Vapor spectral channels from ISRO MOSDAC Earth Observation.
            </span>
          </div>

          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="font-bold text-white block">NCMRWF Numerical Models</span>
            <span className="text-[#8A94A6] text-[11px] mt-0.5 block">
              Unified Model (NCUM) and Global Ensemble Forecast System (NEPS) high-resolution assimilation.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
