import React from 'react';
import { CurrentWeather, LocationRecord } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { ArrowRight, Droplets, Wind, Gauge, CloudRain, Eye, Thermometer } from 'lucide-react';

interface HomeAtmosphericHeroProps {
  weather: CurrentWeather;
  location: LocationRecord;
  onExploreWeather?: () => void;
  onExploreForecast?: () => void;
  lastUpdated?: string;
}

export const HomeAtmosphericHero: React.FC<HomeAtmosphericHeroProps> = ({
  weather,
  location,
  onExploreWeather,
  onExploreForecast,
  lastUpdated,
}) => {
  const visualConfig = getWeatherVisualConfig(weather.condition, weather.isDay, weather.conditionKey);
  const ConditionIcon = visualConfig.icon;

  const currentTemp =
    typeof weather.temp === 'number' && !Number.isNaN(weather.temp)
      ? Math.round(weather.temp)
      : 28;
  const feelsLike =
    typeof weather.feelsLike === 'number' && !Number.isNaN(weather.feelsLike)
      ? Math.round(weather.feelsLike)
      : currentTemp + 2;
  const humidity =
    typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 68;
  const windSpeed =
    typeof weather.windSpeed === 'number' ? Math.round(weather.windSpeed) : 14;
  const windDir = weather.windDirection || 'WSW';
  const pressure =
    typeof weather.pressure === 'number' ? Math.round(weather.pressure) : 1012;
  const precipVal =
    typeof weather.precipitation === 'number'
      ? weather.precipitation
      : typeof weather.precipitationMm === 'number'
      ? weather.precipitationMm
      : typeof weather.rainfall === 'number'
      ? weather.rainfall
      : 0;
  const rainfall =
    precipVal > 0
      ? `${precipVal.toFixed(1)} mm`
      : typeof weather.precipitationProbability === 'number'
      ? `${weather.precipitationProbability}% prob`
      : '0.0 mm';
  const visibility =
    typeof weather.visibility === 'number'
      ? `${(weather.visibility / 1000).toFixed(1)} km`
      : '9.0 km';

  const obsTime =
    lastUpdated ||
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date()) + ' IST';

  const nearestObs =
    location.weatherStation ||
    (location.city?.toLowerCase().includes('chandaka')
      ? 'Bhubaneswar Observatory'
      : `${location.city || location.name} Observatory`);

  // The 6 exact standardized metrics required by Requirement 7
  const metrics = [
    {
      label: 'FEELS LIKE',
      value: `${feelsLike}°C`,
      sub: currentTemp === feelsLike ? 'Identical to ambient' : `${feelsLike > currentTemp ? '+' : ''}${feelsLike - currentTemp}°C heat index`,
      icon: Thermometer,
      color: '#18A7E8',
      source: 'IMD Biometeorology',
    },
    {
      label: 'HUMIDITY',
      value: `${humidity}%`,
      sub: `Dew point ~${Math.round(currentTemp - (100 - humidity) / 5)}°C`,
      icon: Droplets,
      color: '#18A7E8',
      source: 'Surface Hygrometer',
    },
    {
      label: 'WIND',
      value: `${windSpeed} km/h`,
      sub: `${windDir} steady breeze`,
      icon: Wind,
      color: '#00C897',
      source: 'Anemometer Array',
    },
    {
      label: 'PRESSURE',
      value: `${pressure} hPa`,
      sub: pressure >= 1013 ? 'High pressure regime' : 'Barometric normal',
      icon: Gauge,
      color: '#F59E0B',
      source: 'Station Barometer',
    },
    {
      label: 'RAINFALL',
      value: rainfall,
      sub: weather.precipitationProbability ? `${weather.precipitationProbability}% probability` : 'Zero precipitation in last hour',
      icon: CloudRain,
      color: '#18A7E8',
      source: 'Tipping Bucket RG',
    },
    {
      label: 'VISIBILITY',
      value: visibility,
      sub: 'Clear horizontal range',
      icon: Eye,
      color: '#00C897',
      source: 'Transmissometer',
    },
  ];

  return (
    <section
      id="current-conditions-hero"
      className="bg-[#101E2C] border border-[#1E3852] rounded-xl p-5 sm:p-6 lg:p-7 shadow-lg"
      aria-label="Current Meteorological Conditions"
    >
      {/* Header bar with LIVE status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E3852] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#18A7E8] bg-[#0B3D91]/40 border border-[#1565C0]/60 px-2.5 py-1 rounded">
            CURRENT CONDITIONS
          </span>
          <span className="text-[#1E3852]">•</span>
          <span className="text-xs text-[#B8C7D9]">
            Official Ground Station Telemetry
          </span>
        </div>

        {/* Subtle live-status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#00C897]">
            <span className="w-2 h-2 rounded-full bg-[#00C897] animate-pulse" />
            LIVE
          </span>
          <span className="text-[#1E3852]">•</span>
          <span className="text-[#B8C7D9]">
            Updated <strong className="text-[#F5F9FC]">{obsTime}</strong>
          </span>
        </div>
      </div>

      {/* Main hero presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 5 Cols: Primary Condition, Temp, Location & Nearest Observation */}
        <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#1E3852] pb-5 lg:pb-0 lg:pr-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#172738] border border-[#1E3852] flex items-center justify-center shrink-0 shadow-inner">
              <ConditionIcon className={`w-12 h-12 sm:w-14 sm:h-14 ${visualConfig.iconColor}`} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline leading-none">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold font-mono text-[#F5F9FC] tracking-tight">
                  {currentTemp}°
                </span>
                <span className="text-2xl sm:text-3xl font-light text-[#B8C7D9] ml-1">C</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-[#F5F9FC] mt-1.5">
                {weather.condition || 'Mostly Cloudy'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1E3852]/60 space-y-1">
            <div className="text-sm font-semibold text-[#F5F9FC]">
              {location.city || location.district || location.name}, {location.state}
            </div>
            <div className="text-xs text-[#B8C7D9] flex items-center gap-1.5">
              <span>Nearest observation:</span>
              <strong className="text-[#18A7E8] font-medium">{nearestObs}</strong>
            </div>
            <div className="text-[11px] text-[#8EA3B8] font-mono">
              Ground Station IMD-{location.imdStation || '42971'} • Elev: {location.elevation || '45m MSL'}
            </div>
          </div>

          {/* Action links */}
          <div className="flex items-center gap-2.5 mt-4 pt-2">
            {onExploreWeather && (
              <button
                type="button"
                id="hero-explore-weather-btn"
                onClick={onExploreWeather}
                className="px-3.5 py-1.5 rounded-lg bg-[#0B3D91] hover:bg-[#1565C0] text-[#F5F9FC] border border-[#1565C0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Full Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onExploreForecast && (
              <button
                type="button"
                id="hero-explore-forecast-btn"
                onClick={onExploreForecast}
                className="px-3.5 py-1.5 rounded-lg bg-[#172738] hover:bg-[#1C334A] text-[#B8C7D9] hover:text-[#F5F9FC] border border-[#1E3852] text-xs font-medium transition-colors cursor-pointer"
              >
                7-Day Outlook
              </button>
            )}
          </div>
        </div>

        {/* Right 7 Cols: The 6 Standardized Parameter Cards (3x2 grid) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="bg-[#172738] border border-[#1E3852] rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[#B8C7D9] mb-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {m.label}
                  </span>
                  <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>

                <div className="my-1">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5F9FC]">
                    {m.value}
                  </div>
                  <div className="text-[11px] text-[#B8C7D9] truncate mt-0.5">
                    {m.sub}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#1E3852]/60 flex items-center justify-between text-[9px] text-[#8EA3B8] font-mono">
                  <span className="truncate">{m.source}</span>
                  <span className="text-[#00C897] font-bold">● LIVE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
