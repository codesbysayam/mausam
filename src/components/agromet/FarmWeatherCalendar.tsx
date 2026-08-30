import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { Calendar, CloudRain, Sun, Cloud, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface FarmWeatherCalendarProps {
  bulletin: ExtendedAgrometBulletin;
}

export const FarmWeatherCalendar: React.FC<FarmWeatherCalendarProps> = ({ bulletin }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const calendarDays = bulletin.sevenDayCalendar;

  const getSuitabilityBadge = (suitability: string) => {
    switch (suitability) {
      case 'EXCELLENT':
        return 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40';
      case 'GOOD':
        return 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40';
      case 'LIMITED':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
      case 'RESTRICTED':
      default:
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
    }
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'rain_heavy':
      case 'rain':
        return <CloudRain className="w-5 h-5 text-[#38BDF8]" />;
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-[#93A4B8]" />;
      case 'sunny':
      default:
        return <Sun className="w-5 h-5 text-[#F59E0B]" />;
    }
  };

  const activeDay = calendarDays[selectedDayIdx] || calendarDays[0];

  return (
    <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
              7-Day Agricultural Weather Planning Calendar
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Forward operational planning for sowing, spraying, intercultural hoeing, and harvesting in {bulletin.district}.
          </p>
        </div>

        <div className="text-[11px] text-[#93A4B8] self-start sm:self-auto font-mono">
          Click any day to inspect operational suitability
        </div>
      </div>

      {/* 7-Day Horizontal Strip Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-5">
        {calendarDays.map((item, idx) => {
          const isSelected = selectedDayIdx === idx;

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`rounded-xl p-3 flex flex-col items-center justify-between transition-all text-center cursor-pointer focus:outline-none ${
                isSelected
                  ? 'bg-[#182736] border-2 border-[#38BDF8] shadow-lg scale-[1.02]'
                  : 'bg-[#111A24] border border-[#1E2E40] hover:border-[#38BDF8]/40 hover:bg-[#14202E]'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {item.day}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono block mb-2">
                  {item.date}
                </span>

                <div className="my-1.5 flex justify-center">
                  {getWeatherIcon(item.icon)}
                </div>

                <span className="text-[11px] font-bold text-white block">
                  {item.tempMax}° / {item.tempMin}°C
                </span>
              </div>

              <div className="mt-2 w-full pt-2 border-t border-[#1E2E40]/60 space-y-1">
                <span className={`text-[10px] font-mono font-bold block ${item.rainMm > 0 ? 'text-[#38BDF8]' : 'text-[#64748B]'}`}>
                  {item.rainMm > 0 ? `${item.rainMm} mm` : '0 mm'}
                </span>

                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase block truncate ${getSuitabilityBadge(item.farmSuitability)}`}>
                  {item.farmSuitability}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Day Farm Recommendation Details */}
      <div className="p-4 rounded-xl bg-[#131D28] border border-[#1E2E40] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#182635] text-[#38BDF8] shrink-0">
            {getWeatherIcon(activeDay.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {activeDay.day}, {activeDay.date} • Farm Schedule
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getSuitabilityBadge(activeDay.farmSuitability)}`}>
                {activeDay.farmSuitability} SUITABILITY
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
              Expected: <strong className="text-white">{activeDay.condition}</strong> with <strong className="text-[#38BDF8]">{activeDay.rainMm} mm rainfall</strong> ({activeDay.rainProb}% probability). Soil Status: <span className="text-[#2ECC71]">{activeDay.soilCondition}</span>.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <div className="text-right text-xs">
            <span className="text-[#64748B] block text-[10px] uppercase font-mono">Day Guidance</span>
            <span className="font-semibold text-white">
              {activeDay.farmSuitability === 'RESTRICTED'
                ? 'Drain low fields'
                : activeDay.farmSuitability === 'LIMITED'
                ? 'Light morning work'
                : 'Full field operations'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
