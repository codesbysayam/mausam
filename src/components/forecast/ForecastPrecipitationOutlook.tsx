import React, { useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { normalizeHourlyForecast } from '../../services/forecastNormalizer';
import { CloudRain, Droplets, ShieldAlert, Sparkles, Activity, ArrowRight } from 'lucide-react';

interface ForecastPrecipitationOutlookProps {
  hourly: HourlyForecastItem[];
}

export const ForecastPrecipitationOutlook: React.FC<ForecastPrecipitationOutlookProps> = ({
  hourly,
}) => {
  const normalized = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  const maxProb = normalized.length > 0
    ? Math.max(...normalized.map((h) => h.validRainProb))
    : 40;

  const totalQpf = normalized.length > 0
    ? Math.round(normalized.reduce((acc, h) => acc + h.validPrecipMm, 0) * 10) / 10
    : 4.2;

  const timelineHours = normalized.slice(0, 12);

  // Peak window detection
  const peakWindow = useMemo(() => {
    if (normalized.length === 0) return null;
    const highRainHours = normalized.filter((h) => h.validRainProb >= 50);
    if (highRainHours.length === 0) return null;
    return {
      start: highRainHours[0].time,
      end: highRainHours[highRainHours.length - 1].time,
      peakProb: Math.max(...highRainHours.map((h) => h.validRainProb)),
    };
  }, [normalized]);

  const riskCategory =
    maxProb >= 75
      ? { label: 'High Rain Likelihood', color: 'text-[#43C7F4] bg-[#1499E8]/15 border-[#1499E8]/40' }
      : maxProb >= 40
      ? { label: 'Scattered Showers', color: 'text-[#22C7A0] bg-[#22C7A0]/15 border-[#22C7A0]/40' }
      : maxProb >= 20
      ? { label: 'Isolated Passing Drizzle', color: 'text-[#FFC857] bg-[#FFC857]/15 border-[#FFC857]/40' }
      : { label: 'Predominantly Dry', color: 'text-[#93A4B8] bg-[#162331] border-[#223547]' };

  return (
    <div
      id="forecast-precipitation-outlook"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center shrink-0 border border-[#1499E8]/30">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F4F7FA] tracking-tight">
                Rain &amp; Precipitation Outlook
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskCategory.color}`}>
                {riskCategory.label}
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Quantitative precipitation forecast (QPF) &amp; convective probability timeline
            </p>
          </div>
        </div>

        {/* Peak Prob Badge */}
        <div className="flex items-center gap-2 bg-[#071018] px-3 py-1.5 rounded-xl border border-[#162331] self-start sm:self-auto">
          <span className="text-xs text-[#93A4B8]">Peak Risk:</span>
          <span className="text-sm font-black font-mono text-[#43C7F4]">{maxProb}%</span>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#1499E8]" />
            Expected 24h Accumulation
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black font-mono text-[#F4F7FA]">{totalQpf}</span>
            <span className="text-xs font-mono text-[#93A4B8]">mm total</span>
          </div>
          <span className="text-[10px] text-[#93A4B8] mt-1">
            {totalQpf > 15 ? 'Heavy accumulation risk' : totalQpf > 5 ? 'Moderate shower volume' : 'Light to negligible total'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#22C7A0]" />
            Peak Intensity Period
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-lg font-bold font-mono text-[#43C7F4]">
              {peakWindow ? `${peakWindow.start} – ${peakWindow.end}` : 'No Major Peak'}
            </span>
          </div>
          <span className="text-[10px] text-[#93A4B8] mt-1">
            {peakWindow ? `Max chance ${peakWindow.peakProb}% during this slot` : 'Evenly dispersed atmospheric moisture'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#FFC857]" />
            Drainage &amp; Transit Impact
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-lg font-bold text-[#F4F7FA]">
              {totalQpf > 20 ? 'High Surface Runoff' : totalQpf > 5 ? 'Wet Road Spray' : 'Normal Transit Flow'}
            </span>
          </div>
          <span className="text-[10px] text-[#93A4B8] mt-1">
            {totalQpf > 5 ? 'Caution on elevated roads' : 'No urban waterlogging threat'}
          </span>
        </div>
      </div>

      {/* Visual Timeline of Intensity & Probability Across Next 12 Hours */}
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#071018] border border-[#162331]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#93A4B8]">
            Precipitation Intensity &amp; Probability Bands (Next 12 Hours)
          </span>
          <div className="flex items-center gap-2 text-[10px] text-[#93A4B8]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1499E8]" /> Heavy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#43C7F4]" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#43C7F4]/40" /> Light
            </span>
          </div>
        </div>

        {/* 12-Hour Micro Bar Timeline */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
          {timelineHours.map((h, i) => {
            const prob = h.validRainProb;
            const qpf = h.validPrecipMm;

            let intensityColor = 'bg-[#162331] text-[#93A4B8]';
            let label = 'Dry';

            if (prob >= 70 || qpf >= 4) {
              intensityColor = 'bg-[#1499E8] text-white shadow-md shadow-[#1499E8]/30';
              label = 'Heavy';
            } else if (prob >= 40 || qpf >= 1) {
              intensityColor = 'bg-[#43C7F4] text-black';
              label = 'Mod';
            } else if (prob >= 20) {
              intensityColor = 'bg-[#43C7F4]/35 text-[#D1DCE8]';
              label = 'Light';
            }

            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-[#0B141E] border border-[#162331]"
              >
                <span className="text-[10px] font-mono text-[#93A4B8]">{h.time}</span>
                <div
                  className={`w-full py-1 rounded text-[9px] font-bold font-mono text-center transition-all ${intensityColor}`}
                >
                  {prob}%
                </div>
                <span className="text-[8px] text-[#93A4B8] font-mono">{qpf > 0 ? `${qpf}mm` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
