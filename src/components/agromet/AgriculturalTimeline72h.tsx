import React from 'react';
import {
  Clock,
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { generate72HourTimeline, Timeline72hItem } from '../../services/agronomicEngine';

interface AgriculturalTimeline72hProps {
  weather?: WeatherDataBundle;
  district: string;
}

export const AgriculturalTimeline72h: React.FC<AgriculturalTimeline72hProps> = ({
  weather,
  district,
}) => {
  const timelineItems = generate72HourTimeline(weather);

  const getSuitabilityPill = (suitability: Timeline72hItem['fieldSuitability']) => {
    if (suitability === 'OPTIMAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-[10px] font-mono font-bold">
          <CheckCircle2 className="w-3 h-3" />
          OPTIMAL
        </span>
      );
    }
    if (suitability === 'MODERATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] font-mono font-bold">
          <AlertTriangle className="w-3 h-3" />
          MODERATE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px] font-mono font-bold">
        <XCircle className="w-3 h-3" />
        RESTRICTED
      </span>
    );
  };

  return (
    <section
      id="agromet-72h-timeline"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              72-HOUR AGRICULTURAL OPERATION TIMELINE
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            High-resolution micro-meteorological forecast &amp; suitable operational windows across {district}
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Hourly WRF/GFS Interpolation</span>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Cards */}
      <div className="overflow-x-auto pb-3 -mx-2 px-2 scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent">
        <div className="flex items-stretch gap-3 min-w-[840px]">
          {timelineItems.map((item, idx) => {
            const isNow = idx === 0;

            return (
              <div
                key={item.offsetLabel}
                id={`timeline-72h-card-${idx}`}
                className={`flex-1 rounded-xl p-4 flex flex-col justify-between space-y-3.5 border transition-all ${
                  isNow
                    ? 'bg-[#1E293B] border-[#38BDF8] shadow-lg ring-1 ring-[#38BDF8]/40'
                    : 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155]'
                }`}
              >
                {/* Time header */}
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <div>
                    <span className={`text-xs font-mono font-bold ${isNow ? 'text-[#38BDF8]' : 'text-white'}`}>
                      {item.offsetLabel}
                    </span>
                    <div className="text-[10px] font-mono text-[#94A3B8]">
                      {item.hourTime}
                    </div>
                  </div>
                  {getSuitabilityPill(item.fieldSuitability)}
                </div>

                {/* Weather Metrics */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-[#F59E0B]" />
                      Temp:
                    </span>
                    <span className="text-white font-bold">{item.tempC}°C</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-[#38BDF8]" />
                      Rain:
                    </span>
                    <span className="text-[#38BDF8] font-bold">
                      {item.rainMm} mm ({item.rainProbPct}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-[#06B6D4]" />
                      RH:
                    </span>
                    <span className="text-white">{item.humidityPct}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#94A3B8]" />
                      Wind:
                    </span>
                    <span className="text-white">{item.windKmh} km/h</span>
                  </div>
                </div>

                {/* Recommended Field Operation */}
                <div className="pt-2 border-t border-[#1E293B]">
                  <div className="text-[9px] font-mono font-bold text-[#10B981] uppercase">
                    Field Suitability:
                  </div>
                  <p className="text-[11px] text-[#CBD5E1] leading-tight mt-0.5">
                    {item.recommendedOperation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
