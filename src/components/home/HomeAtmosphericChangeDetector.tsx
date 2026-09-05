import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { CurrentWeather } from '../../types';

interface HomeAtmosphericChangeDetectorProps {
  current?: CurrentWeather | null;
  locationKey?: string;
}

interface StoredObservation {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  timestamp: number;
  timeString: string;
}

export const HomeAtmosphericChangeDetector: React.FC<HomeAtmosphericChangeDetectorProps> = ({
  current,
  locationKey = 'default_station',
}) => {
  const [previousObs, setPreviousObs] = useState<StoredObservation | null>(null);

  // Maintain real observation cache in sessionStorage to compare consecutive real updates
  useEffect(() => {
    if (!current || current.temp === undefined) return;

    const storageKey = `mausam_prev_obs_${locationKey}`;
    const saved = sessionStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed: StoredObservation = JSON.parse(saved);
        // Only consider it a valid previous observation if it's from an earlier time or different reading
        if (parsed.timestamp && parsed.timestamp !== current.lastUpdatedTimestamp) {
          setPreviousObs(parsed);
        }
      } catch (e) {
        // invalid JSON
      }
    }

    // Save current as latest for the next update cycle
    const currentEntry: StoredObservation = {
      temp: current.temp,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      precipitation: current.precipitation ?? 0,
      timestamp: current.lastUpdatedTimestamp || Date.now(),
      timeString: current.lastUpdated || 'Earlier Cycle',
    };
    sessionStorage.setItem(storageKey, JSON.stringify(currentEntry));
  }, [current?.temp, current?.humidity, current?.windSpeed, current?.lastUpdatedTimestamp, locationKey]);

  const hasComparison = previousObs !== null && current !== null && current !== undefined;

  let tempChange: number | null = null;
  let humidityChange: number | null = null;
  let windChange: number | null = null;
  let rainStatusChange = '';

  if (hasComparison && current) {
    tempChange = current.temp - previousObs.temp;
    humidityChange = current.humidity - previousObs.humidity;
    windChange = current.windSpeed - previousObs.windSpeed;

    const prevRain = previousObs.precipitation;
    const currRain = current.precipitation ?? 0;
    if (prevRain === 0 && currRain > 0) {
      rainStatusChange = 'Rainfall Started';
    } else if (prevRain > 0 && currRain === 0) {
      rainStatusChange = 'Rainfall Ceased';
    } else if (currRain !== prevRain) {
      const diff = currRain - prevRain;
      rainStatusChange = diff > 0 ? `Rainfall +${diff.toFixed(1)} mm` : `Rainfall ${diff.toFixed(1)} mm`;
    } else {
      rainStatusChange = currRain > 0 ? 'Rainfall Steady' : 'No Rain (Steady)';
    }
  }

  const formatDiff = (diff: number | null, unit: string) => {
    if (diff === null) return 'N/A';
    const sign = diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? diff.toFixed(1) : '0';
    return `${sign}${unit}`;
  };

  return (
    <div
      id="atmospheric-change-detector-panel"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md"
    >
      <div>
        <div className="flex items-center justify-between border-b border-[#334155] pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C42]"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ATMOSPHERIC CHANGE
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#FF8C42]" />
            <span>Delta vs. Previous Cycle</span>
          </div>
        </div>

        {!hasComparison ? (
          <div className="p-4 bg-[#0F141A] rounded-lg border border-[#334155] text-center my-auto">
            <Minus className="w-6 h-6 text-[#8A94A6] mx-auto mb-1.5" />
            <span className="text-xs font-semibold text-[#D7DEE8] block">Comparison unavailable</span>
            <p className="text-[11px] text-[#8A94A6] mt-1">
              Awaiting subsequent telemetry transmission to measure differential barometric & thermal variance.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            {/* Temperature Change */}
            <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155] flex items-center justify-between">
              <span className="text-[#8A94A6] font-medium">Temperature:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                {tempChange! > 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#FF8C42]" />
                ) : tempChange! < 0 ? (
                  <TrendingDown className="w-4 h-4 text-[#4FA8E0]" />
                ) : (
                  <Minus className="w-4 h-4 text-[#8A94A6]" />
                )}
                <span className={tempChange! > 0 ? 'text-[#FF8C42]' : tempChange! < 0 ? 'text-[#4FA8E0]' : 'text-white'}>
                  {formatDiff(tempChange, '°C')}
                </span>
              </div>
            </div>

            {/* Humidity Change */}
            <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155] flex items-center justify-between">
              <span className="text-[#8A94A6] font-medium">Humidity:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                {humidityChange! > 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#4FA8E0]" />
                ) : humidityChange! < 0 ? (
                  <TrendingDown className="w-4 h-4 text-[#FF8C42]" />
                ) : (
                  <Minus className="w-4 h-4 text-[#8A94A6]" />
                )}
                <span className="text-white">
                  {formatDiff(humidityChange, '%')}
                </span>
              </div>
            </div>

            {/* Wind Change */}
            <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155] flex items-center justify-between">
              <span className="text-[#8A94A6] font-medium">Wind:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                {windChange! > 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#FF8C42]" />
                ) : windChange! < 0 ? (
                  <TrendingDown className="w-4 h-4 text-[#2ECC71]" />
                ) : (
                  <Minus className="w-4 h-4 text-[#8A94A6]" />
                )}
                <span className="text-white">
                  {formatDiff(windChange, ' km/h')}
                </span>
              </div>
            </div>

            {/* Rainfall Status Change */}
            <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155] flex items-center justify-between">
              <span className="text-[#8A94A6] font-medium">Rainfall:</span>
              <span className="font-mono font-bold text-[#4FA8E0]">
                {rainStatusChange}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#334155] text-[10px] text-[#8A94A6] flex justify-between">
        <span>Differential Formula: Δ = Current - Previous</span>
        <span>No synthetic modeling</span>
      </div>
    </div>
  );
};
