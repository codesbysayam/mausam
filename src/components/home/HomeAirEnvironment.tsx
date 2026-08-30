import React from 'react';
import { CurrentWeather } from '../../types';
import { Activity, Wind, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Flower2, Sun } from 'lucide-react';
import { getAqiMeaning } from '../../services/humanWeatherEngine';

interface HomeAirEnvironmentProps {
  weather: CurrentWeather;
  onNavigateToAqi?: () => void;
}

export const HomeAirEnvironment: React.FC<HomeAirEnvironmentProps> = ({
  weather,
  onNavigateToAqi,
}) => {
  const aqiVal = weather.aqi || 82;
  const aqiInfo = getAqiMeaning(aqiVal);
  const pm25 = weather.aqiPm25 || 38;
  const pm10 = weather.aqiPm10 || 74;
  const no2 = weather.no2 || 22;
  const o3 = weather.o3 || 45;
  const uv = weather.uvIndex || 5.4;

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
              {aqiVal}
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
              <span>NO₂ Gas</span>
              <span className="text-[#22C7A0]">Good</span>
            </div>
            <div className="text-xl font-bold text-[#F4F7FA] my-1">
              {no2} <span className="text-[10px] font-normal text-[#93A4B8]">ppb</span>
            </div>
            <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C7A0] rounded-full" style={{ width: '35%' }} />
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

          {/* Aero-Allergen Pollen Risk */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span className="flex items-center gap-1">
                <Flower2 className="w-3 h-3 text-[#22C7A0]" />
                Pollen
              </span>
              <span className="text-[#22C7A0]">Low</span>
            </div>
            <div className="text-xl font-bold text-[#22C7A0] my-1">
              18 <span className="text-[10px] font-normal text-[#93A4B8]">gr/m³</span>
            </div>
            <span className="text-[10px] text-[#93A4B8] truncate">Grass &amp; Tree count</span>
          </div>

          {/* UV Radiation Index */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#93A4B8] uppercase">
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-[#FFC857]" />
                Solar UV
              </span>
              <span className="text-[#FFC857]">Index {uv}</span>
            </div>
            <div className="text-xl font-bold text-[#FFC857] my-1">
              {uv >= 8 ? 'Very High' : uv >= 6 ? 'High' : 'Moderate'}
            </div>
            <span className="text-[10px] text-[#93A4B8] truncate">SPF 30+ recommended</span>
          </div>
        </div>
      </div>
    </section>
  );
};
