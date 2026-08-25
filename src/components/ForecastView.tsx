import React from 'react';
import { DailyForecastItem, HourlyForecastItem } from '../types';
import { HOURLY_FORECAST, DAILY_FORECAST } from '../data/weatherData';

interface ForecastViewProps {
  hourly?: HourlyForecastItem[];
  daily?: DailyForecastItem[];
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  hourly = HOURLY_FORECAST,
  daily = DAILY_FORECAST,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* 24-Hour Timeline */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-[rgba(225,230,235,0.12)] mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              schedule
            </span>
            <h3 className="font-h4 text-sm font-semibold text-[#FFFFFF]">
              24-Hour Synoptic Hourly Projection
            </h3>
          </div>
          <span className="text-xs text-[#4FA8E0] font-semibold">
            Hourly Intervals (IMD WRF 3km Model)
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {hourly.map((h, i) => (
            <div
              key={i}
              className="bg-[#0F141A] p-3 rounded-lg card-border flex flex-col items-center gap-2 min-w-[95px] shrink-0 hover:border-[#0B72B9] transition-colors"
            >
              <span className="text-xs text-[#8A94A6] font-semibold">{h.time}</span>
              <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
                {h.icon}
              </span>
              <span className="text-base font-bold text-[#FFFFFF]">
                {h.temp}°
              </span>
              <div className="flex items-center gap-1 text-[11px] text-[#4FA8E0] font-semibold">
                <span className="material-symbols-outlined text-[12px]">water_drop</span>
                <span>{h.rainProb}%</span>
              </div>
              <span className="text-[10px] text-[#8A94A6]">{h.windSpeed} km/h</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Extended Outlook */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-[rgba(225,230,235,0.12)] mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              calendar_month
            </span>
            <h3 className="font-h4 text-sm font-semibold text-[#FFFFFF]">
              7-Day Subcontinental Extended Forecast
            </h3>
          </div>
          <span className="text-xs text-[#2ECC71] font-semibold">
            Global Ensemble Forecast System (GEFS)
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {daily.map((d, idx) => (
            <div
              key={idx}
              className="bg-[#0F141A] p-4 rounded-lg card-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#0B72B9] transition-colors"
            >
              <div className="flex items-center gap-4 min-w-[160px]">
                <div className="w-8 h-8 rounded-lg bg-[#1E2733] flex items-center justify-center text-[#4FA8E0]">
                  <span className="material-symbols-outlined text-[20px]">
                    {d.icon}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#FFFFFF]">
                    {d.day} <span className="text-xs text-[#8A94A6] font-normal">({d.date})</span>
                  </h4>
                  <span className="text-xs text-[#8A94A6]">
                    {d.condition}
                  </span>
                </div>
              </div>

              {/* Rain prob and wind */}
              <div className="flex items-center gap-4 text-xs text-[#8A94A6]">
                <div className="flex items-center gap-1 text-[#4FA8E0] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">water_drop</span>
                  <span>{d.rainProb}% Rain</span>
                </div>
                <div className="hidden md:flex items-center gap-1 text-[#8A94A6]">
                  <span className="material-symbols-outlined text-[14px]">air</span>
                  <span>{d.wind}</span>
                </div>
              </div>

              {/* Min - Max Temp bar */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-xs text-[#8A94A6] font-semibold">{d.low}°C</span>
                <div className="w-28 sm:w-36 h-2 rounded-full bg-[#1E2733] relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#4FA8E0] via-[#FFB703] to-[#FF8C42]"
                    style={{
                      left: `${Math.max(0, (d.low - 15) * 3)}%`,
                      right: `${Math.max(0, 100 - (d.high - 15) * 3)}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs text-[#FFFFFF] font-bold">{d.high}°C</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
