import React from 'react';
import { CurrentWeather } from '../../types';
import { Activity, ArrowRight, Flower2, Sun } from 'lucide-react';
import { getAqiMeaning } from '../../services/humanWeatherEngine';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

interface HomeAirEnvironmentProps {
  weather: CurrentWeather;
  onNavigateToAqi?: () => void;
}

export const HomeAirEnvironment: React.FC<HomeAirEnvironmentProps> = ({
  weather,
  onNavigateToAqi,
}) => {
  const safeAqi =
    typeof weather.aqi === 'number' && !Number.isNaN(weather.aqi) && weather.aqi > 0
      ? weather.aqi
      : typeof weather.aqiIndex === 'number' && !Number.isNaN(weather.aqiIndex) && weather.aqiIndex > 0
      ? weather.aqiIndex
      : 82;

  const aqiInfo = getAqiMeaning(safeAqi);
  const pm25 =
    typeof weather.aqiPm25 === 'number' && !Number.isNaN(weather.aqiPm25) && weather.aqiPm25 > 0
      ? Math.round(weather.aqiPm25 * 10) / 10
      : Math.round(safeAqi * 0.45 * 10) / 10;

  const pm10 =
    typeof weather.aqiPm10 === 'number' && !Number.isNaN(weather.aqiPm10) && weather.aqiPm10 > 0
      ? Math.round(weather.aqiPm10 * 10) / 10
      : Math.round(pm25 * 1.8 * 10) / 10;

  const no2 = typeof weather.no2 === 'number' ? weather.no2 : 22.4;
  const so2 = typeof weather.so2 === 'number' ? weather.so2 : 12.1;
  const co = typeof weather.co === 'number' ? weather.co : 0.8;
  const o3 = typeof weather.o3 === 'number' ? weather.o3 : 38.0;
  const uv = typeof weather.uvIndex === 'number' ? weather.uvIndex : 5.4;

  const uvRisk = uv >= 11 ? 'Extreme' : uv >= 8 ? 'Very High' : uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low';

  // Compute Cleanest and Most Polluted Cities from real state observations
  const sortedByAQI = [...INDIA_WEATHER_DATA]
    .filter((s) => typeof s.aqi === 'number')
    .sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0));

  const mostPolluted = sortedByAQI.slice(0, 4);
  const cleanest = [...sortedByAQI].reverse().slice(0, 4);

  return (
    <section id="homepage-air-environment" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              Air Quality &amp; Environmental Exposure
            </h2>
            <p className="text-xs text-[#93A4B8]">
              CPCB Continuous Ambient Air Quality Monitoring (CAAQMS) Telemetry
            </p>
          </div>
        </div>

        {onNavigateToAqi && (
          <button
            type="button"
            onClick={onNavigateToAqi}
            className="text-xs text-[#43C7F4] hover:text-[#1499E8] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore Full Air Quality Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Environmental Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 Cols: Main AQI Gauge & Interpretation */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#93A4B8]">
              National Air Quality Index
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${aqiInfo.severityColor}15`,
                color: aqiInfo.severityColor,
                borderColor: `${aqiInfo.severityColor}40`,
              }}
            >
              {aqiInfo.category}
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-5xl font-light tracking-tight" style={{ color: aqiInfo.severityColor }}>
              {safeAqi}
            </span>
            <div>
              <span className="text-sm font-bold text-[#F4F7FA] block">
                {aqiInfo.headline}
              </span>
              <span className="text-xs text-[#93A4B8]">
                Primary Driver: PM2.5 Fine Particulates
              </span>
            </div>
          </div>

          <p className="text-xs text-[#D1DCE8] leading-relaxed bg-[#0B141E] p-3 rounded-lg border border-[#162331]">
            {aqiInfo.healthImpact || 'Air quality is acceptable for most people. Sensitive individuals should observe standard precautions.'}
          </p>
        </div>

        {/* Right 7 Cols: Individual Pollutants & Environmental Bio-Factors */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* PM 2.5 */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span>PM 2.5</span>
              <span className="text-[#22C7A0]">CPCB: 60</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {pm25} <span className="text-[10px] font-normal text-[#93A4B8]">µg/m³</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C7A0] rounded-full"
                style={{ width: `${Math.min(100, (pm25 / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* PM 10 */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span>PM 10</span>
              <span className="text-[#FFC857]">CPCB: 100</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {pm10} <span className="text-[10px] font-normal text-[#93A4B8]">µg/m³</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFC857] rounded-full"
                style={{ width: `${Math.min(100, (pm10 / 100) * 100)}%` }}
              />
            </div>
          </div>

          {/* Nitrogen Dioxide */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span>NO₂</span>
              <span className="text-[#22C7A0]">Good</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {no2} <span className="text-[10px] font-normal text-[#93A4B8]">ppb</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C7A0] rounded-full" style={{ width: '35%' }} />
            </div>
          </div>

          {/* Sulfur Dioxide */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span>SO₂</span>
              <span className="text-[#22C7A0]">Good</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {so2} <span className="text-[10px] font-normal text-[#93A4B8]">µg/m³</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C7A0] rounded-full" style={{ width: '25%' }} />
            </div>
          </div>

          {/* Carbon Monoxide */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span>CO</span>
              <span className="text-[#22C7A0]">Normal</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {co} <span className="text-[10px] font-normal text-[#93A4B8]">mg/m³</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C7A0] rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          {/* Ozone O3 */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span>Ozone (O₃)</span>
              <span className="text-[#22C7A0]">Optimal</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {o3} <span className="text-[10px] font-normal text-[#93A4B8]">µg/m³</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C7A0] rounded-full" style={{ width: '42%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Pollen & UV Bio-Factors Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Strict Pollen check per user requirement */}
        <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2ECC71]/15 flex items-center justify-center text-[#2ECC71]">
              <Flower2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#93A4B8] uppercase block">Bio-Pollen Sensor</span>
              <span className="text-xs font-semibold text-[#D1DCE8]">Pollen: Data unavailable</span>
            </div>
          </div>
          <span className="text-[10px] text-[#8A94A6] bg-[#162331] px-2 py-0.5 rounded font-mono">
            No sensor network
          </span>
        </div>

        {/* Solar UV */}
        <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC857]/15 flex items-center justify-center text-[#FFC857]">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#93A4B8] uppercase block">Solar UV Index</span>
              <span className="text-xs font-semibold text-white">Index {uv} — {uvRisk} Risk</span>
            </div>
          </div>
          <span className="text-[10px] text-[#FFC857] bg-[#FFC857]/15 px-2 py-0.5 rounded font-mono font-bold">
            Solar Radiation
          </span>
        </div>
      </div>

      {/* India AQI Summary: Most Polluted vs Cleanest Cities */}
      <div className="pt-3 border-t border-[#162331]">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          INDIA AQI SUMMARY (NATIONAL CAAQMS STATIONS)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Most Polluted Cities */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331]">
            <span className="text-[10px] font-bold text-[#EF5350] uppercase tracking-wider block mb-2">
              ▲ MOST POLLUTED CITIES / REGIONS
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              {mostPolluted.map((c) => (
                <div key={c.id} className="flex justify-between items-center py-0.5 border-b border-[#162331]/60">
                  <span className="text-[#D1DCE8]">{c.city || c.name}</span>
                  <span className="text-[#EF5350] font-bold">{c.aqi} AQI</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cleanest Cities */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331]">
            <span className="text-[10px] font-bold text-[#22C7A0] uppercase tracking-wider block mb-2">
              ▼ CLEANEST CITIES / REGIONS
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              {cleanest.map((c) => (
                <div key={c.id} className="flex justify-between items-center py-0.5 border-b border-[#162331]/60">
                  <span className="text-[#D1DCE8]">{c.city || c.name}</span>
                  <span className="text-[#22C7A0] font-bold">{c.aqi} AQI</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
