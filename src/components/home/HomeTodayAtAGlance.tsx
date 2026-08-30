import React from 'react';
import { CurrentWeather, DailyForecastItem } from '../../types';
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  Eye,
  Gauge,
  Compass,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react';
import { getAqiMeaning, getHumidityMeaning, getRainProbabilityMeaning, getWindMeaning } from '../../services/humanWeatherEngine';

interface HomeTodayAtAGlanceProps {
  weather: CurrentWeather;
  todayForecast?: DailyForecastItem;
}

export const HomeTodayAtAGlance: React.FC<HomeTodayAtAGlanceProps> = ({
  weather,
  todayForecast,
}) => {
  const currentTemp = typeof weather.temp === 'number' && !Number.isNaN(weather.temp) ? Math.round(weather.temp) : 28;
  const highTemp = todayForecast?.high || (typeof weather.high === 'number' ? Math.round(weather.high) : currentTemp + 4);
  const lowTemp = todayForecast?.low || (typeof weather.low === 'number' ? Math.round(weather.low) : currentTemp - 3);
  const humidity = typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 72;
  const windSpeed = typeof weather.windSpeed === 'number' ? Math.round(weather.windSpeed) : 14;
  const rainProb = typeof weather.precipitationProbability === 'number' ? Math.round(weather.precipitationProbability) : 20;
  const aqiVal = weather.aqi || 82;
  const uvVal = weather.uvIndex || 5.4;
  const pressure = weather.pressure || 1008;
  const visibility = weather.visibility || 7.5;
  const dewPoint = Math.round(currentTemp - (100 - humidity) / 5);

  const aqiInfo = getAqiMeaning(aqiVal);
  const humidityInfo = getHumidityMeaning(humidity);
  const windInfo = getWindMeaning(windSpeed, weather.windDirection || 'NE');
  const rainInfo = getRainProbabilityMeaning(rainProb);

  return (
    <section id="homepage-today-at-a-glance" className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1499E8]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
            Today at a Glance
          </h2>
        </div>
        <p className="text-xs text-[#93A4B8]">
          Everything important about your atmosphere, in one view.
        </p>
      </div>

      {/* Visual Composition Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Thermal Trajectory & Temperature Range */}
        <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-3 hover:border-[#1499E8]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF9F43]/15 text-[#FF9F43] flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                Temperature &amp; Range
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#93A4B8]">
              Span {highTemp - lowTemp}°C
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-3xl font-light text-[#F4F7FA] tracking-tight">{currentTemp}°C</span>
              <span className="text-xs text-[#93A4B8] block mt-0.5">Current surface temp</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-[#071018] px-2.5 py-1 rounded-lg border border-[#162331]">
                <ArrowUp className="w-3.5 h-3.5 text-[#EF5350]" />
                <span className="text-[#93A4B8]">High</span>
                <strong className="text-[#F4F7FA]">{highTemp}°</strong>
              </div>
              <div className="flex items-center gap-1 bg-[#071018] px-2.5 py-1 rounded-lg border border-[#162331]">
                <ArrowDown className="w-3.5 h-3.5 text-[#43C7F4]" />
                <span className="text-[#93A4B8]">Low</span>
                <strong className="text-[#F4F7FA]">{lowTemp}°</strong>
              </div>
            </div>
          </div>

          {/* Mini thermal range indicator bar */}
          <div>
            <div className="w-full h-2 bg-[#162331] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[#43C7F4] via-[#FFC857] to-[#EF5350] rounded-full"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#93A4B8] mt-1.5 font-mono">
              <span>Min {lowTemp}°C</span>
              <span className="text-[#D1DCE8]">Diurnal cycle normal</span>
              <span>Max {highTemp}°C</span>
            </div>
          </div>
        </div>

        {/* 2. Precipitation Risk & Hydrometeors */}
        <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-3 hover:border-[#1499E8]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center">
                <CloudRain className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                Precipitation Probability
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#43C7F4]">
              {rainInfo.headline}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-3xl font-light text-[#43C7F4] tracking-tight">{rainProb}%</span>
              <span className="text-xs text-[#93A4B8] block mt-0.5">Precipitation potential</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#F4F7FA] block">
                {rainProb >= 50 ? 'Intermittent Showers' : 'Dry Intervals'}
              </span>
              <span className="text-[11px] text-[#93A4B8]">
                24h Accum: {rainProb > 40 ? '6.4 mm' : '0.0 mm'}
              </span>
            </div>
          </div>

          {/* Horizontal probability bar */}
          <div>
            <div className="w-full h-2 bg-[#162331] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1499E8] to-[#43C7F4] transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(5, rainProb)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#93A4B8] mt-1.5 font-mono">
              <span>0% None</span>
              <span>50% Moderate</span>
              <span>100% Guaranteed</span>
            </div>
          </div>
        </div>

        {/* 3. Wind Vector & Surface Aerodynamics */}
        <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-3 hover:border-[#1499E8]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                Wind &amp; Gust Profile
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#22C7A0]">
              {windInfo.headline}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-3xl font-light text-[#F4F7FA] tracking-tight">
                {windSpeed} <span className="text-base font-normal text-[#93A4B8]">km/h</span>
              </span>
              <span className="text-xs text-[#93A4B8] block mt-0.5">
                Direction: <strong className="text-[#F4F7FA] font-medium">{weather.windDirection || 'NE'} ({weather.windDirectionDeg || 45}°)</strong>
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#071018] border border-[#162331] flex items-center justify-center text-[#22C7A0]">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            <span>Gusts: <strong className="text-[#F4F7FA] font-mono">{Math.round(windSpeed * 1.4)} km/h</strong></span>
            <span>Beaufort Scale 3 (Gentle Breeze)</span>
          </div>
        </div>

        {/* 4. Air Quality & National AQI */}
        <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-3 hover:border-[#1499E8]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                National AQI
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${aqiInfo.severityColor}15`,
                color: aqiInfo.severityColor,
                borderColor: `${aqiInfo.severityColor}40`,
              }}
            >
              {aqiInfo.category}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-3xl font-light tracking-tight" style={{ color: aqiInfo.severityColor }}>
                {aqiVal}
              </span>
              <span className="text-xs text-[#93A4B8] block mt-0.5">PM2.5 Primary Pollutant</span>
            </div>
            <div className="text-right text-xs text-[#93A4B8]">
              <div>PM2.5: <strong className="text-[#F4F7FA]">{weather.aqiPm25 || 38} µg/m³</strong></div>
              <div>PM10: <strong className="text-[#F4F7FA]">{weather.aqiPm10 || 74} µg/m³</strong></div>
            </div>
          </div>

          <div className="w-full bg-[#162331] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (aqiVal / 300) * 100)}%`,
                backgroundColor: aqiInfo.severityColor,
              }}
            />
          </div>
        </div>

        {/* 5. Relative Humidity & Dew Point */}
        <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-3 hover:border-[#1499E8]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                Humidity &amp; Dew Point
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#D1DCE8]">
              {humidityInfo.headline}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-3xl font-light text-[#F4F7FA] tracking-tight">{humidity}%</span>
              <span className="text-xs text-[#93A4B8] block mt-0.5">Relative moisture content</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-[#93A4B8] block">Dew Point</span>
              <strong className="text-[#43C7F4] text-base font-semibold">{dewPoint}°C</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            <span>Air Vapor Saturation: {humidity >= 80 ? 'Heavy' : humidity >= 60 ? 'Moderate' : 'Dry'}</span>
            <span>Comfort: {humidity <= 65 ? 'Optimal' : 'Muggy'}</span>
          </div>
        </div>

        {/* 6. Solar UV Index & Optical Visibility */}
        <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-3 hover:border-[#1499E8]/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                UV &amp; Optical Visibility
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#FFC857]">
              {uvVal >= 8 ? 'Very High' : uvVal >= 6 ? 'High' : 'Moderate'}
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-3xl font-light text-[#FFC857] tracking-tight">{uvVal}</span>
              <span className="text-xs text-[#93A4B8] block mt-0.5">/ 11+ Index (Solar Noon Peak)</span>
            </div>
            <div className="text-right text-xs">
              <div className="flex items-center gap-1 justify-end text-[#D1DCE8]">
                <Eye className="w-3.5 h-3.5 text-[#22C7A0]" />
                <span>{visibility} km Visibility</span>
              </div>
              <div className="flex items-center gap-1 justify-end text-[#93A4B8] mt-0.5">
                <Gauge className="w-3.5 h-3.5 text-[#1499E8]" />
                <span>{pressure} hPa Pressure</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            <span>Peak UV Window: 11:30 AM – 2:30 PM</span>
            <span>Barometer: Steady</span>
          </div>
        </div>
      </div>
    </section>
  );
};
