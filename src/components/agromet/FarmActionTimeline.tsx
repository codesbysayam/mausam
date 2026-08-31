import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Calendar,
  CloudRain,
  Sun,
  Cloud,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FarmActionTimelineProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const FarmActionTimeline: React.FC<FarmActionTimelineProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const days = [
    {
      dayName: 'TODAY',
      date: '31 Aug 2026',
      weather: 'Rain Likely (Convective)',
      rainMm: 15,
      tempMax: 31,
      tempMin: 24,
      soilCondition: 'Saturated (68%)',
      cropRisk: 'High (Fungal)',
      riskColor: '#EF4444',
      action: 'Hold irrigation; check bund drainage',
      detailedAdvice:
        'Convective showers expected during late afternoon. Avoid electrical pumping. Scout lower tillers in morning for early blight lesions.',
      suitability: 'Caution on Field Ops',
    },
    {
      dayName: 'TOMORROW',
      date: '01 Sep 2026',
      weather: 'Humid & Overcast',
      rainMm: 10,
      tempMax: 32,
      tempMin: 25,
      soilCondition: 'Moist / Wet (74%)',
      cropRisk: 'High (Pest / Blight)',
      riskColor: '#EF4444',
      action: 'Monitor fungal disease on leaf sheaths',
      detailedAdvice:
        'High atmospheric humidity (>80%) with overcast skies. Postpone all chemical spraying until foliage dries. Remove rogue weeds along field borders.',
      suitability: 'Limited Machinery',
    },
    {
      dayName: 'DAY 3',
      date: '02 Sep 2026',
      weather: 'Dry & Partly Sunny',
      rainMm: 0,
      tempMax: 33,
      tempMin: 24,
      soilCondition: 'Optimal Moisture (66%)',
      cropRisk: 'Moderate',
      riskColor: '#F59E0B',
      action: 'Suitable for foliar spray & top dressing',
      detailedAdvice:
        'Clear morning hours provide optimal wind drift conditions (<10 km/h) for bio-pesticides and split nitrogen broadcasting.',
      suitability: 'Excellent for Spraying',
    },
    {
      dayName: 'DAY 4',
      date: '03 Sep 2026',
      weather: 'Clear Skies / Bright',
      rainMm: 0,
      tempMax: 34,
      tempMin: 24,
      soilCondition: 'Drying Topsoil (58%)',
      cropRisk: 'Low',
      riskColor: '#10B981',
      action: 'Full field machinery & weeding window',
      detailedAdvice:
        'Firm soil traction allows inter-cultivation tractors and mechanical weeders without deep soil compaction risk.',
      suitability: 'Optimal Field Work',
    },
    {
      dayName: 'DAY 5',
      date: '04 Sep 2026',
      weather: 'Isolated Light Drizzle',
      rainMm: 5,
      tempMax: 33,
      tempMin: 25,
      soilCondition: 'Adequate Moisture (62%)',
      cropRisk: 'Low / Moderate',
      riskColor: '#10B981',
      action: 'Light irrigation review if dry',
      detailedAdvice:
        'Inspect soil root-zone moisture; provide light sprinkler or furrow irrigation if topsoil moisture drops below 50%.',
      suitability: 'Good Conditions',
    },
  ];

  const activeDay = days[selectedDayIndex] || days[0];

  return (
    <section id="five-day-farm-action-timeline" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E2E40]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              5-Day Medium-Range Outlook
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            5-Day Field Outlook
          </h2>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">
          Interactive chronological agronomic guidance
        </span>
      </div>

      {/* Horizontal Interactive Timeline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {days.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={day.dayName}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer border ${
                isSelected
                  ? 'bg-[#0E1B29] border-[#38BDF8] shadow-xl ring-1 ring-[#38BDF8]/40 scale-[1.02]'
                  : 'bg-[#0B131D] border-[#1E2E40] hover:border-[#38BDF8]/40 hover:bg-[#0E1722]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected ? 'text-[#38BDF8]' : 'text-white'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {day.date.split(' ')[0]} {day.date.split(' ')[1]}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-black text-white">
                    {day.tempMax}°C
                  </span>
                  <span className="text-xs font-mono text-[#64748B]">
                    / {day.tempMin}°
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <CloudRain className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{day.rainMm} mm</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E2E40]/60 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#64748B]">Crop Risk</span>
                  <span
                    className="font-bold"
                    style={{ color: day.riskColor }}
                  >
                    {day.cropRisk.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-[#E2E8F0] font-medium leading-snug line-clamp-2">
                  {day.action}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Drill-Down Interactive Box */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#080E16] border border-[#1E2E40] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2E40]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#38BDF8]">
                  {activeDay.dayName} Breakdown
                </span>
                <span className="text-xs font-mono text-[#64748B]">
                  • {activeDay.date}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {activeDay.action}
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 self-start sm:self-auto">
            {activeDay.suitability}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#0B131D] border border-[#1E2E40] space-y-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">
              Weather &amp; Soil Hydrology
            </span>
            <p className="text-white font-bold">{activeDay.weather}</p>
            <p className="text-[#94A3B8] font-mono">
              Rainfall: {activeDay.rainMm} mm • Soil: {activeDay.soilCondition}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B131D] border border-[#1E2E40] space-y-1 text-xs md:col-span-2">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">
              Agronomic Action Directive for {selectedCrop}
            </span>
            <p className="text-[#D7DEE8] leading-relaxed">
              {activeDay.detailedAdvice}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
