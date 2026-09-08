import React from 'react';
import { Clock, Cloud, Sun, CloudRain, Wind, Droplets, AlertCircle } from 'lucide-react';
import { HourlyForecastItem } from '../../types';

interface HomeLiveTimelineProps {
  hourly?: HourlyForecastItem[];
  locationName?: string;
  modelRunTime?: string;
}

export const HomeLiveTimeline: React.FC<HomeLiveTimelineProps> = ({
  hourly = [],
  locationName = 'Selected Station',
  modelRunTime = '00:00 UTC Synoptic Cycle',
}) => {
  const hasData = Array.isArray(hourly) && hourly.length > 0;

  const getWeatherIcon = (condition?: string) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder') || c.includes('lightning')) {
      return <CloudRain className="w-5 h-5 text-[#E74C3C]" />;
    }
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

  // Select deterministic timeline slots: Now, +1h, +2h, +3h, +6h, +12h, +18h, +24h
  const slots = [
    { label: 'NOW', index: 0, isObserved: true },
    { label: '+1h', index: 1, isObserved: false },
    { label: '+2h', index: 2, isObserved: false },
    { label: '+3h', index: 3, isObserved: false },
    { label: '+6h', index: 6, isObserved: false },
    { label: '+12h', index: 12, isObserved: false },
    { label: '+18h', index: 18, isObserved: false },
    { label: '+24h', index: 23, isObserved: false },
  ];

  return (
    <section
      id="live-weather-timeline"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 shadow-lg"
      aria-label="Hourly Atmospheric Timeline"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#4FA8E0]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ATMOSPHERIC TIMELINE (HOURLY)
            </h3>
            <p className="text-xs text-[#8A94A6]">
              Surface telemetry & deterministic prediction for{' '}
              <span className="text-[#D7DEE8] font-medium">{locationName}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#8A94A6]">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
          <span>IMD-GFS / WRF Surface Grid</span>
          <span className="hidden md:inline text-[#334155]">|</span>
          <span className="text-[#4FA8E0]">{modelRunTime}</span>
        </div>
      </div>

      {!hasData ? (
        <div className="p-6 bg-[#0F141A] rounded-lg border border-[#334155] flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-[#8A94A6] mb-2" />
          <p className="text-xs text-[#D7DEE8] font-medium">
            Model forecast data unavailable for current observation coordinates
          </p>
          <p className="text-[11px] text-[#8A94A6] mt-1">
            Awaiting next synoptic NWP cycle upload from meteorological server
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-stretch gap-2.5 min-w-[760px]">
            {slots.map((slot) => {
              const item = hourly[slot.index];
              const isNow = slot.index === 0;

              if (!item && !isNow) return null;

              return (
                <div
                  key={slot.label}
                  className={`flex-1 min-w-[95px] p-3 rounded-lg border flex flex-col items-center justify-between text-center transition-all ${
                    isNow
                      ? 'bg-[#0B72B9]/20 border-[#0B72B9] shadow-md ring-1 ring-[#0B72B9]/40'
                      : 'bg-[#0F141A] border-[#334155]/70 hover:border-[#4FA8E0]/60'
                  }`}
                >
                  {/* Step label & Status Badge */}
                  <div className="w-full flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isNow
                          ? 'bg-[#0B72B9] text-white'
                          : 'bg-[#1E2733] text-[#8A94A6]'
                      }`}
                    >
                      {slot.label}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-bold px-1 rounded uppercase ${
                        isNow
                          ? 'text-[#2ECC71] bg-[#008000]/20'
                          : 'text-[#4FA8E0] bg-[#0B72B9]/15'
                      }`}
                    >
                      {isNow ? 'OBSERVED' : 'FORECAST'}
                    </span>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-[#D7DEE8] font-mono font-medium mt-1">
                    {item?.time || (isNow ? 'Now' : 'N/A')}
                  </span>

                  {/* Weather Icon */}
                  <div className="my-2" title={item?.condition || 'Weather'}>
                    {item ? getWeatherIcon(item.condition) : <span className="text-xs text-[#8A94A6]">N/A</span>}
                  </div>

                  {/* Temperature */}
                  <span className="text-base sm:text-lg font-bold font-mono text-white">
                    {item?.temp !== undefined ? `${Math.round(item.temp)}°C` : 'N/A'}
                  </span>

                  {/* Condition label */}
                  <span
                    className="text-[10px] text-[#8A94A6] mt-0.5 truncate max-w-[90px]"
                    title={item?.condition || 'Conditions'}
                  >
                    {item?.condition || 'N/A'}
                  </span>

                  {/* Metrics footer: Rain & Humidity */}
                  <div className="mt-2 pt-1.5 border-t border-[#334155]/60 w-full flex items-center justify-between text-[10px] font-mono">
                    <div
                      className="flex items-center gap-0.5 text-[#4FA8E0]"
                      title={`Rain Probability: ${item?.rainProb ?? 0}%`}
                    >
                      <CloudRain className="w-3 h-3 shrink-0" />
                      <span>{item?.rainProb !== undefined ? `${item.rainProb}%` : '—'}</span>
                    </div>

                    <div
                      className="flex items-center gap-0.5 text-[#B8C7D9]"
                      title={`Humidity: ${item?.humidity ?? 0}%`}
                    >
                      <Droplets className="w-3 h-3 shrink-0" />
                      <span>{item?.humidity !== undefined ? `${item.humidity}%` : '—'}</span>
                    </div>
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
