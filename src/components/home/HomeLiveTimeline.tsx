import React from 'react';
import { Clock, Cloud, Sun, CloudRain, Wind, AlertCircle } from 'lucide-react';
import { HourlyForecastItem } from '../../types';

interface HomeLiveTimelineProps {
  hourly?: HourlyForecastItem[];
  locationName?: string;
}

export const HomeLiveTimeline: React.FC<HomeLiveTimelineProps> = ({
  hourly = [],
  locationName = 'Selected Station',
}) => {
  // Check if real hourly forecast data is available
  const hasData = Array.isArray(hourly) && hourly.length > 0;

  // We want to map to slots: NOW, +1h, +2h, +3h, +6h, +12h, +24h
  const offsets = [
    { label: 'NOW', index: 0 },
    { label: '+1h', index: 1 },
    { label: '+2h', index: 2 },
    { label: '+3h', index: 3 },
    { label: '+6h', index: 6 },
    { label: '+12h', index: 12 },
    { label: '+24h', index: 24 },
  ];

  const getWeatherIcon = (condition?: string) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className="w-5 h-5 text-[#4FA8E0]" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className="w-5 h-5 text-[#93A4B8]" />;
    }
    if (c.includes('wind') || c.includes('breeze')) {
      return <Wind className="w-5 h-5 text-[#4FA8E0]" />;
    }
    return <Sun className="w-5 h-5 text-[#F1C40F]" />;
  };

  return (
    <section
      id="live-weather-timeline"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 shadow-lg"
      aria-label="Live Weather Timeline"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#4FA8E0]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              LIVE WEATHER TIMELINE
            </h3>
            <p className="text-xs text-[#8A94A6]">
              Deterministic hourly numerical weather prediction for <span className="text-[#D7DEE8] font-medium">{locationName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8A94A6]">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
          <span>WRF-GFS Model Run: Valid IST</span>
        </div>
      </div>

      {!hasData ? (
        <div className="p-6 bg-[#0F141A] rounded-lg border border-[#334155] flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-[#8A94A6] mb-2" />
          <p className="text-xs text-[#D7DEE8] font-medium">Hourly data unavailable for current observation coordinate</p>
          <p className="text-[11px] text-[#8A94A6] mt-1">N/A — awaiting next synoptic NWP cycle upload</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-stretch gap-2.5 min-w-[680px]">
            {offsets.map((slot, i) => {
              const item = hourly[slot.index];
              const isNow = slot.label === 'NOW';

              return (
                <div
                  key={slot.label}
                  className={`flex-1 min-w-[85px] p-3 rounded-lg border flex flex-col items-center justify-between text-center transition-all ${
                    isNow
                      ? 'bg-[#0B72B9]/20 border-[#0B72B9] shadow-md'
                      : 'bg-[#0F141A] border-[#334155]/70 hover:border-[#4FA8E0]/60'
                  }`}
                >
                  {/* Step label */}
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isNow ? 'bg-[#0B72B9] text-white font-mono' : 'bg-[#1E2733] text-[#8A94A6] font-mono'
                      }`}
                    >
                      {slot.label}
                    </span>
                  </div>

                  {/* Hour display */}
                  <span className="text-xs text-[#D7DEE8] font-mono font-medium">
                    {item?.time || 'N/A'}
                  </span>

                  {/* Weather Icon */}
                  <div className="my-2.5">
                    {item ? getWeatherIcon(item.condition) : <span className="text-xs text-[#8A94A6]">N/A</span>}
                  </div>

                  {/* Temperature */}
                  <span className="text-base sm:text-lg font-bold font-mono text-white">
                    {item?.temp !== undefined ? `${Math.round(item.temp)}°C` : 'N/A'}
                  </span>

                  {/* Condition label */}
                  <span className="text-[11px] text-[#8A94A6] mt-1 truncate max-w-[80px]" title={item?.condition || 'N/A'}>
                    {item?.condition || 'N/A'}
                  </span>

                  {/* Rain probability if present */}
                  <div className="mt-2 pt-1.5 border-t border-[#334155]/60 w-full flex items-center justify-center gap-1 text-[10px] text-[#4FA8E0] font-mono">
                    <CloudRain className="w-3 h-3" />
                    <span>{item?.rainProb !== undefined ? `${item.rainProb}%` : 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
