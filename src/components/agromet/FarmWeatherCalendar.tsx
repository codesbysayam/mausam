import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { Calendar, CloudRain, Sun, Cloud, Droplets, Clock, Layers, CheckCircle2 } from 'lucide-react';

interface FarmWeatherCalendarProps {
  bulletin: ExtendedAgrometBulletin;
}

export const FarmWeatherCalendar: React.FC<FarmWeatherCalendarProps> = ({ bulletin }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const calendarDays = bulletin.sevenDayCalendar.slice(0, 5); // 5-Day Connected Timeline

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

  const getSoilStatusColor = (soilCondition: string) => {
    if (soilCondition.toLowerCase().includes('saturated') || soilCondition.toLowerCase().includes('wet')) {
      return 'text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/30';
    }
    if (soilCondition.toLowerCase().includes('drying') || soilCondition.toLowerCase().includes('moderate')) {
      return 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30';
    }
    return 'text-[#2ECC71] bg-[#2ECC71]/15 border-[#2ECC71]/30';
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'rain_heavy':
      case 'rain':
        return <CloudRain className="w-6 h-6 text-[#38BDF8]" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-[#94A3B8]" />;
      case 'sunny':
      default:
        return <Sun className="w-6 h-6 text-[#F59E0B]" />;
    }
  };

  const activeDay = calendarDays[selectedDayIdx] || calendarDays[0];

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#101A26] to-[#0A1017] border border-[#1E2E40] p-6 sm:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Next 5 Days on Your Farm
            </h3>
          </div>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Sequential day-by-day soil moisture, precipitation influx, and operational windows in {bulletin.district}.
          </p>
        </div>

        <div className="text-xs text-[#64748B] self-start sm:self-auto font-mono flex items-center gap-2">
          <span>Connected Synoptic Sequence</span>
          <span className="text-[#334155]">•</span>
          <span className="text-[#38BDF8]">5-Day Horizon</span>
        </div>
      </div>

      {/* Connected Horizontal Timeline Container (Horizontally scrollable on mobile) */}
      <div className="relative mb-6">
        {/* Continuous connector line behind nodes (desktop) */}
        <div className="hidden lg:block absolute top-[52px] left-[5%] right-[5%] h-1 bg-gradient-to-r from-[#2ECC71] via-[#38BDF8] to-[#1E2E40] rounded-full z-0" />

        <div className="flex lg:grid lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4 pt-2 scrollbar-none relative z-10">
          {calendarDays.map((item, idx) => {
            const isSelected = selectedDayIdx === idx;
            const isToday = idx === 0;

            return (
              <button
                key={item.date}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`min-w-[210px] lg:min-w-0 flex-1 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 text-left cursor-pointer focus:outline-none relative group ${
                  isSelected
                    ? 'bg-[#152332] border-2 border-[#38BDF8] shadow-xl shadow-[#38BDF8]/10 scale-[1.02]'
                    : isToday
                    ? 'bg-[#121E2C] border-2 border-[#2ECC71]/60 hover:border-[#2ECC71]'
                    : 'bg-[#0E1722] border border-[#1E2E40] hover:border-[#2A405A] hover:bg-[#121B27]'
                }`}
              >
                {/* Node Connector Bullet */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono transition-colors ${
                        isToday
                          ? 'bg-[#2ECC71] text-[#0A1017]'
                          : isSelected
                          ? 'bg-[#38BDF8] text-[#0A1017]'
                          : 'bg-[#182635] text-[#94A3B8] border border-[#263C52]'
                      }`}
                    >
                      {item.day.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      {isToday ? 'TODAY' : item.day}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#64748B] font-mono">
                    {item.date}
                  </span>
                </div>

                {/* Weather Condition Icon & Rain */}
                <div className="my-2 flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#182736] border border-[#22354A]">
                    {getWeatherIcon(item.icon)}
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black font-mono block ${item.rainMm > 0 ? 'text-[#38BDF8]' : 'text-[#64748B]'}`}>
                      {item.rainMm > 0 ? `${item.rainMm} mm` : '0 mm'}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono font-medium">
                      {item.rainProb}% rain prob
                    </span>
                  </div>
                </div>

                {/* Diurnal Thermal Range */}
                <div className="my-2">
                  <span className="text-sm font-black font-mono text-white">
                    {item.tempMax}°
                  </span>
                  <span className="text-xs font-bold font-mono text-[#64748B]"> / {item.tempMin}°C</span>
                </div>

                {/* Soil & Field Work Status Indicators */}
                <div className="pt-3 border-t border-[#1E2E40]/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B] font-mono uppercase">SOIL:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase font-mono ${getSoilStatusColor(item.soilCondition)}`}>
                      {item.soilCondition.slice(0, 12)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B] font-mono uppercase">FIELD WORK:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase font-mono ${getSuitabilityBadge(item.farmSuitability)}`}>
                      {item.farmSuitability}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Expanded Diagnostic Bar */}
      <div className="p-4 rounded-2xl bg-[#0B131C] border border-[#1E2E40] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#162230] text-[#38BDF8] shrink-0 border border-[#22354A]">
            {getWeatherIcon(activeDay.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                Detailed Outlook for {activeDay.day}, {activeDay.date}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase ${getSuitabilityBadge(activeDay.farmSuitability)}`}>
                {activeDay.farmSuitability} OPERATIONAL SUITABILITY
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Condition: <strong className="text-white">{activeDay.condition}</strong> • Expected precipitation: <strong className="text-[#38BDF8]">{activeDay.rainMm} mm</strong>. Soil Status: <span className="text-[#2ECC71] font-semibold">{activeDay.soilCondition}</span>.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right text-xs">
            <span className="text-[#64748B] block text-[10px] uppercase font-mono">Operations Directive</span>
            <span className="font-bold text-white font-mono">
              {activeDay.farmSuitability === 'RESTRICTED'
                ? 'Drain low fields & hold machinery'
                : activeDay.farmSuitability === 'LIMITED'
                ? 'Schedule light intercultural work'
                : 'Optimal window for all operations'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
