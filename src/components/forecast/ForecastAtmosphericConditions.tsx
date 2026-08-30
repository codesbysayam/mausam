import React from 'react';
import { CurrentWeather } from '../../types';
import { Droplets, Sun, Eye, Gauge, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { getHumidityMeaning, getUvMeaning } from '../../services/humanWeatherEngine';

interface ForecastAtmosphericConditionsProps {
  weather: CurrentWeather;
}

export const ForecastAtmosphericConditions: React.FC<ForecastAtmosphericConditionsProps> = ({
  weather,
}) => {
  const humidity = typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 84;
  const uvVal = typeof weather.uvIndex === 'number' ? weather.uvIndex : 5.8;
  const visibility = weather.visibility ? String(weather.visibility) : '10 km';
  const visibilityNum = parseFloat(visibility) || 10;
  const pressure = typeof weather.pressure === 'number' ? Math.round(weather.pressure) : 1006;

  const humidityInfo = getHumidityMeaning(humidity);
  const uvInfo = getUvMeaning(uvVal);

  // Pressure tendency calculation
  const pressureTendency = pressure > 1010 ? 'High' : pressure < 1002 ? 'Low Barometric' : 'Normal Steady';

  return (
    <div
      id="forecast-atmospheric-conditions"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col gap-4 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center border border-[#1499E8]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F4F7FA] tracking-tight">
              Atmospheric &amp; Biometeorology
            </h3>
            <p className="text-[11px] text-[#93A4B8]">
              Boundary layer micro-physics and sensory comfort indicators
            </p>
          </div>
        </div>
      </div>

      {/* 4 Distinct Aesthetic Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {/* 1. HUMIDITY - Semi-Circular / Linear Moisture Envelope Indicator */}
        <div className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#1499E8]" />
              Relative Humidity
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1499E8]/15 text-[#43C7F4] border border-[#1499E8]/30">
              {humidityInfo.moistureLevel.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#F4F7FA]">{humidity}%</span>
            <span className="text-xs text-[#93A4B8]">Dew point ~{Math.round(humidity * 0.28 + 2)}°C</span>
          </div>

          {/* Moisture Bar Gauge */}
          <div className="flex flex-col gap-1">
            <div className="w-full bg-[#162331] h-2 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#43C7F4] to-[#1499E8]"
                style={{ width: `${humidity}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#93A4B8] font-mono">
              <span>Dry (20%)</span>
              <span>Optimal (50%)</span>
              <span>Humid (90%)</span>
            </div>
          </div>
        </div>

        {/* 2. UV INDEX - Semantic Stepped Scale Indicator */}
        <div className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#FFC857]" />
              Solar UV Index
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                uvVal >= 8
                  ? 'bg-[#EF5350]/15 text-[#EF5350] border-[#EF5350]/30'
                  : uvVal >= 6
                  ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30'
                  : uvVal >= 3
                  ? 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30'
                  : 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/30'
              }`}
            >
              {uvInfo.category.toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#F4F7FA]">{uvVal}</span>
            <span className="text-xs text-[#93A4B8]">
              {uvVal >= 6 ? 'Peak 11:30 AM – 2:30 PM' : 'Low sun damage risk'}
            </span>
          </div>

          {/* Stepped UV Scale */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {['1-2', '3-5', '6-7', '8-10', '11+'].map((step, idx) => {
              const active =
                (idx === 0 && uvVal < 3) ||
                (idx === 1 && uvVal >= 3 && uvVal < 6) ||
                (idx === 2 && uvVal >= 6 && uvVal < 8) ||
                (idx === 3 && uvVal >= 8 && uvVal < 11) ||
                (idx === 4 && uvVal >= 11);
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      active
                        ? idx === 0
                          ? 'bg-[#22C7A0]'
                          : idx === 1
                          ? 'bg-[#FFC857]'
                          : idx === 2
                          ? 'bg-[#FF9F43]'
                          : 'bg-[#EF5350]'
                        : 'bg-[#162331]'
                    }`}
                  />
                  <span className={`text-[8px] font-mono ${active ? 'text-[#F4F7FA] font-bold' : 'text-[#93A4B8]'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. OPTICAL VISIBILITY - Range Scale Indicator */}
        <div className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#22C7A0]" />
              Optical Visibility
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C7A0]/15 text-[#22C7A0] border border-[#22C7A0]/30">
              {visibilityNum >= 8 ? 'EXCELLENT' : visibilityNum >= 4 ? 'MODERATE' : 'POOR HAZE'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#F4F7FA]">{visibility}</span>
            <span className="text-xs text-[#93A4B8]">
              {visibilityNum >= 8 ? 'Full horizon clarity' : 'Atmospheric haze present'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="w-full bg-[#162331] h-2 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full bg-[#22C7A0]"
                style={{ width: `${Math.min(100, (visibilityNum / 10) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#93A4B8] font-mono">
              <span>Fog (&lt;2km)</span>
              <span>Standard (6km)</span>
              <span>Clear (10km)</span>
            </div>
          </div>
        </div>

        {/* 4. BAROMETRIC PRESSURE - Barometer Trend Indicator */}
        <div className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#FFC857]" />
              Barometric Pressure
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFC857]/15 text-[#FFC857] border border-[#FFC857]/30">
              {pressureTendency.toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#F4F7FA]">{pressure}</span>
            <span className="text-xs font-mono text-[#93A4B8]">hPa (MSLP)</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0B141E] border border-[#162331] text-[11px] text-[#D1DCE8]">
            <span className="w-2 h-2 rounded-full bg-[#22C7A0]" />
            <span>
              {pressure < 1002
                ? 'Depression trough risk'
                : pressure > 1012
                ? 'Anticyclonic fair weather ridge'
                : 'Steady mean seasonal gradient'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
