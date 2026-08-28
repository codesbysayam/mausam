import React, { useState } from 'react';
import { CurrentWeather as CurrentWeatherType } from '../../types';
import { StatusBadge, StatusVariant } from '../common/StatusBadge';

export type UnitSystem = 'metric' | 'imperial';

interface WeatherWidgetsProps {
  weather: CurrentWeatherType;
  defaultUnitSystem?: UnitSystem;
  unitSystem?: UnitSystem;
  onUnitSystemChange?: (unit: UnitSystem) => void;
  className?: string;
  id?: string;
}

export const WeatherWidgets: React.FC<WeatherWidgetsProps> = ({
  weather,
  defaultUnitSystem = 'metric',
  unitSystem: controlledUnitSystem,
  onUnitSystemChange,
  className = '',
  id = 'weather-widgets-section',
}) => {
  const [internalUnitSystem, setInternalUnitSystem] = useState<UnitSystem>(defaultUnitSystem);

  const activeUnitSystem = controlledUnitSystem !== undefined ? controlledUnitSystem : internalUnitSystem;

  const handleUnitToggle = (newUnit: UnitSystem) => {
    if (controlledUnitSystem === undefined) {
      setInternalUnitSystem(newUnit);
    }
    if (onUnitSystemChange) {
      onUnitSystemChange(newUnit);
    }
  };

  const isMetric = activeUnitSystem === 'metric';

  // ==========================================
  // Unit Conversion Helpers
  // ==========================================
  const cToF = (c: number): number => Math.round((c * 9) / 5 + 32);
  const kmToMiles = (km: number): number => +(km * 0.621371).toFixed(1);
  const kmhToMph = (kmh: number): number => Math.round(kmh * 0.621371);
  const hpaToInHg = (hpa: number): number => +(hpa * 0.02953).toFixed(2);

  // Raw values with safe fallbacks
  const rawUv = typeof weather.uvIndex === 'number' && !Number.isNaN(weather.uvIndex) ? weather.uvIndex : 6;
  const rawHumidity = typeof weather.humidity === 'number' && !Number.isNaN(weather.humidity) ? weather.humidity : 62;
  const rawDewPointC = typeof weather.dewPoint === 'number' && !Number.isNaN(weather.dewPoint) ? weather.dewPoint : 18;
  const rawVisibilityKm = typeof weather.visibilityKm === 'number' && !Number.isNaN(weather.visibilityKm)
    ? weather.visibilityKm 
    : typeof weather.visibility === 'number' && !Number.isNaN(weather.visibility)
      ? weather.visibility 
      : 10;
  const rawPressureHpa = typeof weather.pressure === 'number' && !Number.isNaN(weather.pressure) ? weather.pressure : 1012;
  const rawWindSpeedKmh = typeof weather.windSpeed === 'number' && !Number.isNaN(weather.windSpeed) ? weather.windSpeed : 14;
  const rawWindGustsKmh = typeof weather.windGusts === 'number' && !Number.isNaN(weather.windGusts) ? weather.windGusts : rawWindSpeedKmh + 6;
  const rawCloudCover = typeof weather.cloudCover === 'number' && !Number.isNaN(weather.cloudCover) ? weather.cloudCover : 25;

  // Formatted Metric / Imperial Values
  const dewPointDisplay = isMetric ? `${Math.round(rawDewPointC)}°C` : `${cToF(rawDewPointC)}°F`;
  const visibilityDisplay = isMetric ? `${rawVisibilityKm.toFixed(1)} km` : `${kmToMiles(rawVisibilityKm)} mi`;
  const pressureDisplay = isMetric ? `${rawPressureHpa} hPa` : `${hpaToInHg(rawPressureHpa)} inHg`;
  const windSpeedDisplay = isMetric ? `${rawWindSpeedKmh} km/h` : `${kmhToMph(rawWindSpeedKmh)} mph`;
  const windGustsDisplay = isMetric ? `${rawWindGustsKmh} km/h` : `${kmhToMph(rawWindGustsKmh)} mph`;

  // ==========================================
  // UV Index Card Calculations
  // ==========================================
  const getUvDetails = (uv: number): {
    label: string;
    variant: StatusVariant;
    advice: string;
    levelPercentage: number;
    colorHex: string;
  } => {
    if (uv <= 2) {
      return {
        label: 'Low Risk',
        variant: 'good',
        advice: 'No protection needed. Safe for outdoor activities.',
        levelPercentage: Math.min((uv / 12) * 100, 100),
        colorHex: '#2ECC71',
      };
    }
    if (uv <= 5) {
      return {
        label: 'Moderate',
        variant: 'warning',
        advice: 'Protection required. Seek shade during midday hours.',
        levelPercentage: Math.min((uv / 12) * 100, 100),
        colorHex: '#F1C40F',
      };
    }
    if (uv <= 7) {
      return {
        label: 'High',
        variant: 'alert',
        advice: 'SPF 30+ sunscreen, sunglasses, and hat recommended.',
        levelPercentage: Math.min((uv / 12) * 100, 100),
        colorHex: '#FF8C42',
      };
    }
    if (uv <= 10) {
      return {
        label: 'Very High',
        variant: 'danger',
        advice: 'Extra protection necessary. Minimize direct sun 11AM - 3PM.',
        levelPercentage: Math.min((uv / 12) * 100, 100),
        colorHex: '#E74C3C',
      };
    }
    return {
      label: 'Extreme',
      variant: 'danger',
      advice: 'Take all precautions. Unprotected skin can burn quickly.',
      levelPercentage: 100,
      colorHex: '#9B59B6',
    };
  };
  const uvInfo = getUvDetails(rawUv);

  // ==========================================
  // Humidity Card Calculations
  // ==========================================
  const getHumidityDetails = (humidity: number): {
    label: string;
    variant: StatusVariant;
    comfortDesc: string;
  } => {
    if (humidity < 30) {
      return {
        label: 'Dry Air',
        variant: 'neutral',
        comfortDesc: 'Air is dry. Increased hydration and moisturizer advised.',
      };
    }
    if (humidity <= 60) {
      return {
        label: 'Comfortable',
        variant: 'good',
        comfortDesc: 'Ideal moisture balance for optimal respiratory comfort.',
      };
    }
    if (humidity <= 75) {
      return {
        label: 'Humid',
        variant: 'warning',
        comfortDesc: 'Moist atmospheric moisture, noticeably warm outdoors.',
      };
    }
    return {
      label: 'Muggy / Oppressive',
      variant: 'alert',
      comfortDesc: 'High vapor saturation. Sweat evaporates slowly.',
    };
  };
  const humidityInfo = getHumidityDetails(rawHumidity);

  // ==========================================
  // Visibility Card Calculations
  // ==========================================
  const getVisibilityDetails = (visKm: number): {
    label: string;
    variant: StatusVariant;
    opticalDesc: string;
  } => {
    if (visKm >= 10) {
      return {
        label: 'Excellent',
        variant: 'good',
        opticalDesc: 'Crystal clear horizon with unlimited optical range.',
      };
    }
    if (visKm >= 5) {
      return {
        label: 'Good',
        variant: 'good',
        opticalDesc: 'Clear visibility; standard surface transit conditions.',
      };
    }
    if (visKm >= 2) {
      return {
        label: 'Moderate Haze',
        variant: 'warning',
        opticalDesc: 'Light aerosol haze or thin mist detected by sensors.',
      };
    }
    return {
      label: 'Dense Fog / Obscured',
      variant: 'danger',
      opticalDesc: 'Significantly restricted visibility. Exercise caution on roads.',
    };
  };
  const visInfo = getVisibilityDetails(rawVisibilityKm);

  // ==========================================
  // Pressure Card Calculations
  // ==========================================
  const getPressureDetails = (hpa: number): {
    label: string;
    variant: StatusVariant;
    trendDesc: string;
  } => {
    if (hpa >= 1020) {
      return {
        label: 'High Pressure',
        variant: 'good',
        trendDesc: 'Anticyclonic system. Stable atmospheric conditions & clear skies.',
      };
    }
    if (hpa >= 1010) {
      return {
        label: 'Steady Standard',
        variant: 'neutral',
        trendDesc: 'Standard sea-level barometric equilibrium (~1013 hPa / 29.92 inHg).',
      };
    }
    if (hpa >= 1000) {
      return {
        label: 'Moderate Low',
        variant: 'warning',
        trendDesc: 'Sub-standard depression. Increased likelihood of clouds/precipitation.',
      };
    }
    return {
      label: 'Deep Depression',
      variant: 'danger',
      trendDesc: 'Significant low pressure synoptic system / storm front.',
    };
  };
  const pressureInfo = getPressureDetails(rawPressureHpa);

  return (
    <div id={id} className={`mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px] flex flex-col gap-4 ${className}`}>
      {/* Header with Unit Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              dashboard_customize
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              ATMOSPHERIC OBSERVATION WIDGETS
            </h2>
            <span className="text-[10px] text-[#1ABC9C] bg-[#1ABC9C]/15 border border-[#1ABC9C]/40 px-1.5 py-0.5 rounded font-mono">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Modular multi-parameter instruments calibrated for synoptic meteorological analysis
          </p>
        </div>

        {/* Metric vs Imperial Toggle Switch */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-medium text-[#8A94A6] hidden sm:inline">
            Unit System:
          </span>
          <div
            id="unit-system-toggle-group"
            className="inline-flex p-0.5 bg-[#0F141A] border border-[#334155] rounded-md shadow-inner"
            role="group"
            aria-label="Unit system selection"
          >
            <button
              type="button"
              id="unit-toggle-metric"
              onClick={() => handleUnitToggle('metric')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1.5 ${
                isMetric
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#1E2733]'
              }`}
              aria-pressed={isMetric}
            >
              <span className="material-symbols-outlined text-[13px]">straighten</span>
              <span>Metric (°C / hPa)</span>
            </button>

            <button
              type="button"
              id="unit-toggle-imperial"
              onClick={() => handleUnitToggle('imperial')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1.5 ${
                !isMetric
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#1E2733]'
              }`}
              aria-pressed={!isMetric}
            >
              <span className="material-symbols-outlined text-[13px]">tune</span>
              <span>Imperial (°F / inHg)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modular Data Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* =========================================================================
            CARD 1: UV INDEX
        ========================================================================= */}
        <div
          id="widget-uv-index"
          className="mausam-card p-3.5 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between hover:border-[#4FA8E0]/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#F1C40F] text-[18px]">
                  wb_sunny
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  UV Index
                </span>
              </div>
              <StatusBadge label={uvInfo.label} variant={uvInfo.variant} />
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {rawUv}
              </span>
              <span className="text-xs text-[#8A94A6] font-mono">
                / 11+ Max
              </span>
            </div>

            {/* Visual UV Intensity Bar */}
            <div className="mt-2.5">
              <div className="h-1.5 w-full bg-[#0F141A] rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.max(uvInfo.levelPercentage, 8)}%`,
                    backgroundColor: uvInfo.colorHex,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#8A94A6] mt-1">
                <span>0 Low</span>
                <span>6 High</span>
                <span>11+ Ext</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#8A94A6] mt-3 border-t border-[#334155]/60 pt-2 leading-relaxed">
            {uvInfo.advice}
          </p>
        </div>

        {/* =========================================================================
            CARD 2: HUMIDITY DETAILS
        ========================================================================= */}
        <div
          id="widget-humidity-details"
          className="mausam-card p-3.5 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between hover:border-[#4FA8E0]/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  humidity_percentage
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Humidity Details
                </span>
              </div>
              <StatusBadge label={humidityInfo.label} variant={humidityInfo.variant} />
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {rawHumidity}%
              </span>
              <span className="text-xs text-[#8A94A6]">Relative</span>
            </div>

            {/* Dew Point & Vapor Metric Row */}
            <div className="mt-2 flex items-center justify-between text-xs bg-[#0F141A]/60 px-2.5 py-1.5 rounded border border-[#334155]/60">
              <span className="text-[#8A94A6]">Dew Point:</span>
              <strong className="text-white font-mono">{dewPointDisplay}</strong>
            </div>
          </div>

          <p className="text-[11px] text-[#8A94A6] mt-3 border-t border-[#334155]/60 pt-2 leading-relaxed">
            {humidityInfo.comfortDesc}
          </p>
        </div>

        {/* =========================================================================
            CARD 3: VISIBILITY
        ========================================================================= */}
        <div
          id="widget-visibility"
          className="mausam-card p-3.5 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between hover:border-[#4FA8E0]/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#1ABC9C] text-[18px]">
                  visibility
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Visibility
                </span>
              </div>
              <StatusBadge label={visInfo.label} variant={visInfo.variant} />
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {visibilityDisplay.split(' ')[0]}
              </span>
              <span className="text-xs text-[#8A94A6] font-mono">
                {visibilityDisplay.split(' ')[1]}
              </span>
            </div>

            {/* Clarity Range Meter */}
            <div className="mt-2 flex items-center justify-between text-xs bg-[#0F141A]/60 px-2.5 py-1.5 rounded border border-[#334155]/60">
              <span className="text-[#8A94A6]">Horizon State:</span>
              <span className="text-[#1ABC9C] font-semibold text-[11px]">
                {rawVisibilityKm >= 10 ? 'Unrestricted' : 'Moderate'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#8A94A6] mt-3 border-t border-[#334155]/60 pt-2 leading-relaxed">
            {visInfo.opticalDesc}
          </p>
        </div>

        {/* =========================================================================
            CARD 4: PRESSURE
        ========================================================================= */}
        <div
          id="widget-pressure"
          className="mausam-card p-3.5 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between hover:border-[#4FA8E0]/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#9B59B6] text-[18px]">
                  compress
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Barometric Pressure
                </span>
              </div>
              <StatusBadge label={pressureInfo.label} variant={pressureInfo.variant} />
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">
                {pressureDisplay.split(' ')[0]}
              </span>
              <span className="text-xs text-[#8A94A6] font-mono">
                {pressureDisplay.split(' ')[1]}
              </span>
            </div>

            {/* Sea Level Reference Row */}
            <div className="mt-2 flex items-center justify-between text-xs bg-[#0F141A]/60 px-2.5 py-1.5 rounded border border-[#334155]/60">
              <span className="text-[#8A94A6]">Mean Sea Level:</span>
              <strong className="text-white font-mono">
                {isMetric ? '1013.2 hPa' : '29.92 inHg'}
              </strong>
            </div>
          </div>

          <p className="text-[11px] text-[#8A94A6] mt-3 border-t border-[#334155]/60 pt-2 leading-relaxed">
            {pressureInfo.trendDesc}
          </p>
        </div>
      </div>

      {/* Secondary Modular Telemetry Strip (Wind, Cloud Cover, Sun/Dawn Telemetry) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Wind & Gusts */}
        <div
          id="widget-wind-telemetry"
          className="bg-[#0F141A]/70 border border-[#334155]/70 rounded p-2.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0">
              <span className="material-symbols-outlined text-[16px]">air</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
                Wind Velocity &amp; Heading
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold font-mono text-white">
                  {windSpeedDisplay}
                </span>
                <span className="text-[11px] text-[#4FA8E0] font-semibold">
                  {weather.windDirection || 'ENE'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-[#8A94A6]">
            <span>Gusts: </span>
            <strong className="text-white font-mono">{windGustsDisplay}</strong>
          </div>
        </div>

        {/* Cloud Cover */}
        <div
          id="widget-cloud-cover"
          className="bg-[#0F141A]/70 border border-[#334155]/70 rounded p-2.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#1ABC9C]/20 border border-[#1ABC9C]/40 flex items-center justify-center text-[#1ABC9C] shrink-0">
              <span className="material-symbols-outlined text-[16px]">cloud</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
                Cloud Cover / Opacity
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold font-mono text-white">
                  {rawCloudCover}%
                </span>
                <span className="text-[11px] text-[#8A94A6]">
                  {rawCloudCover < 20 ? 'Clear Sky' : rawCloudCover < 60 ? 'Scattered' : 'Overcast'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-[#8A94A6]">
            <span>Ceiling: </span>
            <strong className="text-white font-mono">{isMetric ? '2,400m' : '7,800ft'}</strong>
          </div>
        </div>

        {/* Solar Radiation / Daylight Status */}
        <div
          id="widget-solar-telemetry"
          className="bg-[#0F141A]/70 border border-[#334155]/70 rounded p-2.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#F1C40F]/20 border border-[#F1C40F]/40 flex items-center justify-center text-[#F1C40F] shrink-0">
              <span className="material-symbols-outlined text-[16px]">wb_twilight</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
                Solar Duration &amp; Sunset
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold font-mono text-white">
                  {weather.sunset || '06:14 PM'}
                </span>
                <span className="text-[11px] text-[#F1C40F]">
                  ({weather.daylightDuration || '12h 32m'} day)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-[#8A94A6]">
            <span>Solar Noon: </span>
            <strong className="text-white font-mono">{weather.solarNoon || '11:58 AM'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
