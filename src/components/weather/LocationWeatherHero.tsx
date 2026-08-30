import React, { useMemo, useState, useEffect } from 'react';
import { CurrentWeather, LocationRecord } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { calculateSolarEphemeris, SolarEphemeris } from '../../utils/solarCalculator';
import {
  Sunrise,
  Sunset,
  Clock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { getAqiMeaning, getHumidityMeaning, getRainProbabilityMeaning } from '../../services/humanWeatherEngine';

interface LocationWeatherHeroProps {
  weather: CurrentWeather;
  location: LocationRecord;
}

export const LocationWeatherHero: React.FC<LocationWeatherHeroProps> = ({
  weather,
  location,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const visualConfig = getWeatherVisualConfig(weather.condition);
  const ConditionIcon = visualConfig.icon;

  const lat = typeof location.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location.lng === 'number' ? location.lng : 85.8245;

  const solarData: SolarEphemeris = useMemo(() => {
    return calculateSolarEphemeris(lat, lng, currentTime);
  }, [lat, lng, currentTime]);

  const currentTemp = typeof weather.temp === 'number' && !Number.isNaN(weather.temp) ? Math.round(weather.temp) : 28;
  const feelsLike = typeof weather.feelsLike === 'number' && !Number.isNaN(weather.feelsLike) ? Math.round(weather.feelsLike) : currentTemp + 2;
  const highTemp = typeof weather.high === 'number' && !Number.isNaN(weather.high) ? Math.round(weather.high) : currentTemp + 4;
  const lowTemp = typeof weather.low === 'number' && !Number.isNaN(weather.low) ? Math.round(weather.low) : currentTemp - 3;
  const humidity = typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 72;
  const windSpeed = typeof weather.windSpeed === 'number' ? Math.round(weather.windSpeed) : 14;
  const rainProb = typeof weather.precipitationProbability === 'number' ? Math.round(weather.precipitationProbability) : 20;

  const aqiInfo = getAqiMeaning(weather.aqi || 82);
  const humidityInfo = getHumidityMeaning(humidity);
  const rainInfo = getRainProbabilityMeaning(rainProb);

  return (
    <div
      id="weather-location-hero-card"
      className="mausam-hero-environment p-6 sm:p-8 lg:p-10 relative overflow-hidden"
    >
      {/* Soft atmospheric background illumination */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1499E8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#22C7A0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section (7 cols): Location, Big Temperature, Condition & Quick Story */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          {/* Eyebrow: Station details */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C7A0] animate-pulse" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F4F7FA] tracking-tight">
                {location.city}, {location.state}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#111C27] text-[#43C7F4] border border-[#162331]">
                {location.imdStation || 'AWS Regional Station'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#22C7A0]/15 text-[#22C7A0] border border-[#22C7A0]/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Feed
              </span>
            </div>
          </div>

          {/* Main Temperature & Weather State Display */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#111C27] border border-[#162331] flex items-center justify-center shadow-lg shrink-0">
                <ConditionIcon className={`w-12 h-12 sm:w-14 sm:h-14 ${visualConfig.iconColor}`} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="text-6xl sm:text-7xl font-light text-[#F4F7FA] tracking-tight">
                    {currentTemp}°
                  </span>
                  <span className="text-2xl sm:text-3xl font-normal text-[#93A4B8] ml-1">C</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#93A4B8] mt-2">
                  <span>Feels like</span>
                  <strong className="text-[#F4F7FA] font-medium text-sm">{feelsLike}°C</strong>
                  <span>•</span>
                  <span>{humidityInfo.headline}</span>
                </div>
              </div>
            </div>

            {/* Condition Headline & Thermal Range */}
            <div className="flex flex-col gap-2 sm:border-l sm:border-[#162331] sm:pl-6">
              <div className="text-lg sm:text-xl font-bold text-[#F4F7FA]">
                {weather.condition || 'Partly Cloudy'}
              </div>
              <p className="text-xs text-[#D1DCE8] leading-relaxed max-w-sm">
                {visualConfig.description || 'Stable atmospheric boundary layer with normal seasonal diurnal progression.'}
              </p>

              {/* Thermal Range Bar */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 bg-[#111C27] px-2.5 py-1 rounded-lg border border-[#162331]">
                  <ArrowUp className="w-3.5 h-3.5 text-[#EF5350]" />
                  <span className="text-[#93A4B8]">High:</span>
                  <strong className="text-[#F4F7FA]">{highTemp}°C</strong>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111C27] px-2.5 py-1 rounded-lg border border-[#162331]">
                  <ArrowDown className="w-3.5 h-3.5 text-[#43C7F4]" />
                  <span className="text-[#93A4B8]">Low:</span>
                  <strong className="text-[#F4F7FA]">{lowTemp}°C</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Inline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#162331]">
            <div>
              <span className="text-[11px] text-[#93A4B8] block font-medium">Precipitation Risk</span>
              <span className="text-base font-bold text-[#43C7F4]">{rainProb}%</span>
              <span className="text-[10px] text-[#93A4B8] block">{rainInfo.headline}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#93A4B8] block font-medium">Relative Humidity</span>
              <span className="text-base font-bold text-[#F4F7FA]">{humidity}%</span>
              <span className="text-[10px] text-[#93A4B8] block">Dew Pt {Math.round(currentTemp - (100 - humidity) / 5)}°C</span>
            </div>
            <div>
              <span className="text-[11px] text-[#93A4B8] block font-medium">Wind Speed</span>
              <span className="text-base font-bold text-[#22C7A0]">{windSpeed} km/h</span>
              <span className="text-[10px] text-[#93A4B8] block">{weather.windDirection || 'NE'} direction</span>
            </div>
            <div>
              <span className="text-[11px] text-[#93A4B8] block font-medium">Air Quality</span>
              <span className="text-base font-bold" style={{ color: aqiInfo.severityColor }}>
                {weather.aqi || 82} AQI
              </span>
              <span className="text-[10px] text-[#93A4B8] block">{aqiInfo.category}</span>
            </div>
          </div>
        </div>

        {/* Right Section (5 cols): LIVE SUNRISE & SUNSET TIMER AND SOLAR EPHEMERIS */}
        <div className="lg:col-span-5 bg-[#111C27]/90 border border-[#162331] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFC857]/15 border border-[#FFC857]/30 flex items-center justify-center text-[#FFC857]">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                  Solar Ephemeris &amp; Countdown
                </h3>
                <span className="text-[11px] text-[#93A4B8]">
                  {lat.toFixed(2)}°N, {lng.toFixed(2)}°E Coordinates
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#071018] border border-[#162331] text-[11px] text-[#D1DCE8]">
              <Clock className="w-3 h-3 text-[#FFC857]" />
              <span>Daylight: <strong className="text-white">{solarData.dayLengthStr}</strong></span>
            </div>
          </div>

          {/* Live countdown card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            solarData.isDaytime
              ? 'bg-[#071018] border-[#FFC857]/30'
              : 'bg-[#071018] border-[#1499E8]/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                solarData.isDaytime
                  ? 'bg-[#FFC857]/15 text-[#FFC857]'
                  : 'bg-[#43C7F4]/15 text-[#43C7F4]'
              }`}>
                <Timer className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8] block">
                  Next Solar Event
                </span>
                <span className="text-sm font-bold text-[#F4F7FA]">
                  {solarData.nextEventName}
                </span>
                <span className="text-xs text-[#93A4B8] block">
                  Expected at <strong className="text-[#FFC857]">{solarData.nextEventTimeStr}</strong>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[#F4F7FA] block bg-[#111C27] px-3 py-1.5 rounded-xl border border-[#162331]">
                {solarData.countdownFormatted}
              </span>
              <span className="text-[10px] text-[#93A4B8] mt-1 block">
                {solarData.isDaytime ? 'Remaining Daylight' : 'Until Morning Dawn'}
              </span>
            </div>
          </div>

          {/* Sun Trajectory Arc */}
          <div className="p-3 bg-[#071018] rounded-xl border border-[#162331] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-[#93A4B8]">
              <div className="flex items-center gap-1">
                <Sunrise className="w-3.5 h-3.5 text-[#FF9F43]" />
                <span>Dawn ({solarData.civilDawnStr})</span>
              </div>
              <div className="flex items-center gap-1 text-[#FFC857] font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Zenith ({solarData.solarNoonStr})</span>
              </div>
              <div className="flex items-center gap-1">
                <Sunset className="w-3.5 h-3.5 text-[#EF5350]" />
                <span>Dusk ({solarData.civilDuskStr})</span>
              </div>
            </div>

            <div className="relative w-full h-6 flex items-center">
              <div className="w-full h-1.5 bg-[#162331] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#FF9F43] via-[#FFC857] to-[#EF5350] transition-all duration-700"
                  style={{ width: `${solarData.progressPercent}%` }}
                />
              </div>

              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-10"
                style={{ left: `${Math.max(4, Math.min(96, solarData.progressPercent))}%` }}
              >
                <div className="w-5 h-5 rounded-full bg-[#FFC857] border-2 border-white shadow-md flex items-center justify-center text-[#071018]">
                  <Sun className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
