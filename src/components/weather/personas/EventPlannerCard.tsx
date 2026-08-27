import React from 'react';

interface EventPlannerCardProps {
  extendedForecast: Array<{
    date: string;
    dayOfWeek: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
    rainProbabilityPercent: number;
    comfortIndexValue: number;
    comfortCategory: 'Pleasant' | 'Comfortable' | 'Warm & Humid' | 'Uncomfortable' | 'Stifling';
  }>;
  comfortIndexToday: number;
  comfortCategoryToday: 'Pleasant' | 'Comfortable' | 'Warm & Humid' | 'Uncomfortable' | 'Stifling';
  eventRecommendation: string;
  city: string;
}

export const EventPlannerCard: React.FC<EventPlannerCardProps> = ({
  extendedForecast,
  comfortIndexToday,
  comfortCategoryToday,
  eventRecommendation,
  city,
}) => {
  const getComfortBadge = (cat: string) => {
    switch (cat) {
      case 'Pleasant':
        return 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40';
      case 'Comfortable':
        return 'bg-[#27AE60]/15 text-[#27AE60] border-[#27AE60]/40';
      case 'Warm & Humid':
        return 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40';
      case 'Uncomfortable':
        return 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40';
      default:
        return 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';
    }
  };

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#16A085]/15 text-[#1ABC9C] flex items-center justify-center border border-[#16A085]/30">
              <span className="material-symbols-outlined text-[20px]">event</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Event Planners &amp; Organizers
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                Extended 7-Day Forecast &amp; Thermal Comfort Index • {city}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getComfortBadge(comfortCategoryToday)}`}>
            Comfort: {comfortCategoryToday} ({comfortIndexToday})
          </span>
        </div>

        {/* 7-Day Extended Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#334155] text-[10px] uppercase text-[#8A94A6]">
                <th className="pb-2 font-bold">Day</th>
                <th className="pb-2 font-bold text-center">Condition</th>
                <th className="pb-2 font-bold text-right">Temp (Max/Min)</th>
                <th className="pb-2 font-bold text-right">Rain Prob</th>
                <th className="pb-2 font-bold text-right">Comfort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {extendedForecast.slice(0, 7).map((item, idx) => (
                <tr key={idx} className="hover:bg-[#17212B]/80 transition-colors">
                  <td className="py-2 text-white font-medium">
                    <span>{item.dayOfWeek}</span>
                    <span className="text-[10px] text-[#8A94A6] block">{item.date}</span>
                  </td>
                  <td className="py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">
                        {item.icon}
                      </span>
                      <span className="text-[11px] text-[#D7DEE8] hidden sm:inline">{item.condition}</span>
                    </div>
                  </td>
                  <td className="py-2 text-right font-mono font-bold">
                    <span className="text-white">{item.tempMax}°</span>
                    <span className="text-[#8A94A6] text-[10px] ml-1">/ {item.tempMin}°</span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    <span
                      className={`text-xs font-bold ${
                        item.rainProbabilityPercent > 50
                          ? 'text-[#4FA8E0]'
                          : item.rainProbabilityPercent > 25
                          ? 'text-[#F1C40F]'
                          : 'text-[#2ECC71]'
                      }`}
                    >
                      {item.rainProbabilityPercent}%
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block ${getComfortBadge(
                        item.comfortCategory
                      )}`}
                    >
                      {item.comfortCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Venue Planning Guidance */}
        <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#1ABC9C] text-[18px] shrink-0 mt-0.5">
            insights
          </span>
          <div className="text-xs">
            <p className="text-white font-semibold">
              Venue Logistics &amp; Setup Advisory:
            </p>
            <p className="text-[11px] text-[#8A94A6] mt-0.5 leading-relaxed">
              {eventRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>IMD Extended Numerical Forecast &amp; Steadman Thermal Comfort Model</strong></span>
        <span>Horizon: <strong>7–14 Day Projection</strong></span>
      </div>
    </div>
  );
};
