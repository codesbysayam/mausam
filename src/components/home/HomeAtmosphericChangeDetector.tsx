import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Info,
  Navigation,
} from 'lucide-react';
import { CurrentWeather, LocationRecord } from '../../types';
import { observationHistoryService, AtmosphericDelta } from '../../services/observationHistoryService';

interface HomeAtmosphericChangeDetectorProps {
  current?: CurrentWeather | null;
  selectedLocation: LocationRecord;
  lastUpdated?: string;
}

export const HomeAtmosphericChangeDetector: React.FC<HomeAtmosphericChangeDetectorProps> = ({
  current,
  selectedLocation,
  lastUpdated,
}) => {
  // Generate real consecutive observation report isolated to this location/station
  const report = useMemo(() => {
    return observationHistoryService.getObservationReport(selectedLocation, current);
  }, [
    selectedLocation.id,
    current?.lastUpdatedTimestamp,
    current?.temp,
    current?.humidity,
    current?.windSpeed,
    current?.pressure,
    current?.precipitation,
  ]);

  const { hasValidComparison, deltas, overallStatus, sourceText, timeDifferenceMinutes, previousObs } = report;

  // Render a compact change indicator for each row
  const renderChangeCell = (delta: AtmosphericDelta) => {
    if (delta.direction === 'unavailable' || !hasValidComparison) {
      return (
        <span className="text-[11px] text-[#8A94A6] italic">
          Comparison unavailable
        </span>
      );
    }

    if (delta.direction === 'stable') {
      return (
        <div className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#D7DEE8]">
          <Minus className="w-3.5 h-3.5 text-[#8A94A6]" />
          <span>{delta.displayDiff}</span>
        </div>
      );
    }

    const isUp = delta.direction === 'up';
    const isWarmOrRain = delta.parameter === 'Temperature' || delta.parameter === 'Rainfall';
    const colorClass =
      delta.severity === 'warning'
        ? 'text-[#FF4444]'
        : delta.severity === 'caution'
        ? 'text-[#FFA500]'
        : isUp
        ? (isWarmOrRain ? 'text-[#FF8C42]' : 'text-[#4FA8E0]')
        : (isWarmOrRain ? 'text-[#4FA8E0]' : 'text-[#2ECC71]');

    return (
      <div className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold ${colorClass}`}>
        {isUp ? (
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 shrink-0" />
        )}
        <span>{delta.displayDiff}</span>
        {delta.trendLabel && (
          <span className="text-[10px] font-sans font-normal text-[#8A94A6] hidden lg:inline">
            ({delta.trendLabel})
          </span>
        )}
      </div>
    );
  };

  const metricRows = [
    {
      icon: Thermometer,
      iconColor: 'text-[#FF8C42]',
      delta: deltas.temperature,
    },
    {
      icon: Droplets,
      iconColor: 'text-[#4FA8E0]',
      delta: deltas.humidity,
    },
    {
      icon: Wind,
      iconColor: 'text-[#64B5F6]',
      delta: deltas.wind,
    },
    {
      icon: Gauge,
      iconColor: 'text-[#9B59B6]',
      delta: deltas.pressure,
      extra: deltas.pressure.trendLabel ? `Trend: ${deltas.pressure.trendLabel}` : undefined,
    },
    {
      icon: CloudRain,
      iconColor: 'text-[#4FA8E0]',
      delta: deltas.rainfall,
      extra: current?.rainfallLast1h !== undefined
        ? `1h: ${current.rainfallLast1h.toFixed(1)}mm · 24h: ${(current.rainfallLast24h ?? 0).toFixed(1)}mm`
        : undefined,
    },
  ];

  const displayTime = lastUpdated || current?.lastUpdated || 'Current Cycle';

  return (
    <div
      id="atmospheric-change-detector-panel"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md transition-all"
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#334155] pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                overallStatus === 'LIVE' ? 'bg-[#FF8C42] animate-pulse' :
                overallStatus === 'RECENT' ? 'bg-[#4FA8E0]' : 'bg-[#8A94A6]'
              }`}
            />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              ATMOSPHERIC CHANGE
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                overallStatus === 'LIVE' ? 'bg-[#FF8C42]/20 text-[#FF8C42] border-[#FF8C42]/40' :
                overallStatus === 'RECENT' ? 'bg-[#0B72B9]/20 text-[#4FA8E0] border-[#0B72B9]/40' :
                'bg-[#334155]/30 text-[#8A94A6] border-[#334155]'
              }`}
            >
              {overallStatus}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#8A94A6] font-mono">
              <Clock className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span>{hasValidComparison && timeDifferenceMinutes ? `Δ vs -${timeDifferenceMinutes}m` : 'Δ vs Previous'}</span>
            </div>
          </div>
        </div>

        {/* Station Subtitle */}
        <div className="text-xs text-[#8A94A6] mb-3 flex items-center justify-between">
          <span>
            Telemetry delta for <strong className="text-white">{selectedLocation.city}</strong>
          </span>
          {previousObs && (
            <span className="text-[11px] text-[#B8C7D9] font-mono">
              Ref: {previousObs.timeString}
            </span>
          )}
        </div>

        {/* Structured Compact Telemetry Delta Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#334155] text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">
                <th className="pb-2 pl-2">PARAMETER</th>
                <th className="pb-2 text-right">CURRENT</th>
                <th className="pb-2 text-right hidden sm:table-cell">PREVIOUS</th>
                <th className="pb-2 text-right pr-2">CHANGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/50">
              {metricRows.map((row) => {
                const IconComponent = row.icon;
                const { delta } = row;

                return (
                  <tr
                    key={delta.parameter}
                    className="hover:bg-[#0F141A]/50 transition-colors"
                  >
                    {/* Parameter Name */}
                    <td className="py-2.5 pl-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-3.5 h-3.5 ${row.iconColor} shrink-0`} />
                        <div>
                          <span className="font-semibold text-white">{delta.parameter}</span>
                          {row.extra && (
                            <span className="text-[10px] text-[#8A94A6] block font-mono">
                              {row.extra}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Current Telemetry */}
                    <td className="py-2.5 text-right font-mono font-bold text-white text-xs">
                      {delta.currentVal}
                    </td>

                    {/* Previous Telemetry */}
                    <td className="py-2.5 text-right font-mono text-[#8A94A6] text-xs hidden sm:table-cell">
                      {hasValidComparison ? delta.previousVal : '—'}
                    </td>

                    {/* Delta / Change Indicator */}
                    <td className="py-2.5 text-right pr-2">
                      {renderChangeCell(delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Status Callout if Awaiting Telemetry */}
        {!hasValidComparison && (
          <div className="mt-3 p-2.5 bg-[#0F141A] rounded-lg border border-[#334155] flex items-start gap-2 text-xs text-[#8A94A6]">
            <Info className="w-4 h-4 text-[#4FA8E0] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-medium block">Baseline telemetry initialized for {selectedLocation.city}</span>
              <p className="text-[11px] text-[#8A94A6] mt-0.5">
                Delta calculations require two consecutive observation cycles. Subsequent updates will display real-time barometric, thermal, and wind differentials.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status Info */}
      <div className="mt-3 pt-2.5 border-t border-[#334155] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A94A6]">
        <div className="flex items-center gap-1.5 truncate max-w-[280px]" title={sourceText}>
          <Navigation className="w-3.5 h-3.5 text-[#FF8C42] shrink-0" />
          <span className="truncate">Source: {sourceText}</span>
        </div>
        <span className="text-[#8A94A6] font-mono text-[10px]">
          Formula: Δ = Current - Previous
        </span>
      </div>
    </div>
  );
};
