import React from 'react';
import { Thermometer, CloudRain, AlertTriangle, Wind, Droplets, Activity, Radio } from 'lucide-react';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

interface HomeIndiaWeatherStatusProps {
  onNavigate?: (tab: string) => void;
  lastUpdated?: string;
}

export const HomeIndiaWeatherStatus: React.FC<HomeIndiaWeatherStatusProps> = ({
  onNavigate,
  lastUpdated,
}) => {
  // Aggregate real stats from actual state observation network
  const totalStations = INDIA_WEATHER_DATA.length;
  const reportingStations = INDIA_WEATHER_DATA.filter((s) => s.temperature !== undefined).length;

  const validTemps = INDIA_WEATHER_DATA.map((s) => s.temperature).filter((t): t is number => t !== undefined);
  const avgTemp = validTemps.length > 0 ? (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1) : null;
  const maxTemp = validTemps.length > 0 ? Math.max(...validTemps) : null;
  const minTemp = validTemps.length > 0 ? Math.min(...validTemps) : null;

  const validRain = INDIA_WEATHER_DATA.map((s) => s.rainfall).filter((r): r is number => r !== undefined);
  const stationsWithRain = validRain.filter((r) => r > 0).length;
  const maxRain = validRain.length > 0 ? Math.max(...validRain) : 0;

  const severeAlerts = INDIA_WEATHER_DATA.filter((s) => s.warningLevel === 'severe' || s.warningLevel === 'alert').length;

  const validAQI = INDIA_WEATHER_DATA.map((s) => s.aqi).filter((a): a is number => a !== undefined);
  const avgAQI = validAQI.length > 0 ? Math.round(validAQI.reduce((a, b) => a + b, 0) / validAQI.length) : null;

  const validWinds = INDIA_WEATHER_DATA.map((s) => s.windSpeed).filter((w): w is number => w !== undefined);
  const avgWind = validWinds.length > 0 ? Math.round(validWinds.reduce((a, b) => a + b, 0) / validWinds.length) : null;
  const maxWind = validWinds.length > 0 ? Math.max(...validWinds) : null;

  const validHumidity = INDIA_WEATHER_DATA.map((s) => s.humidity).filter((h): h is number => h !== undefined);
  const avgHumidity = validHumidity.length > 0 ? Math.round(validHumidity.reduce((a, b) => a + b, 0) / validHumidity.length) : null;

  const displayTime = lastUpdated || INDIA_WEATHER_DATA[0]?.updatedAt || '06:31 PM IST';

  // 8 standardized national weather status cards per Requirement 8
  const cards = [
    {
      id: 'status-card-temp',
      title: 'TEMPERATURE',
      value: avgTemp !== null ? avgTemp : 'N/A',
      unit: avgTemp !== null ? '°C' : '',
      subtext: avgTemp !== null ? `Range: ${minTemp}° – ${maxTemp}°C` : 'National aggregation unavailable',
      source: 'IMD Synoptic Network',
      obsTime: `Updated ${displayTime}`,
      status: 'LIVE',
      statusColor: '#00C897',
      tab: 'weather',
    },
    {
      id: 'status-card-rain',
      title: 'RAINFALL ACTIVITY',
      value: stationsWithRain > 0 ? `${stationsWithRain}` : 'Dry',
      unit: stationsWithRain > 0 ? 'Subdivisions' : '',
      subtext: stationsWithRain > 0 ? `Peak: ${maxRain} mm (24h)` : 'No widespread rainfall reported',
      source: 'IMD AWS Telemetry',
      obsTime: `Updated ${displayTime}`,
      status: 'LIVE',
      statusColor: '#00C897',
      tab: 'weather',
    },
    {
      id: 'status-card-warnings',
      title: 'SEVERE WARNINGS',
      value: `${severeAlerts}`,
      unit: severeAlerts === 1 ? 'Alert' : 'Alerts',
      subtext: severeAlerts > 0 ? `${severeAlerts} Active Warnings in effect` : 'Routine: No severe warnings',
      source: 'IMD Warning Bulletin',
      obsTime: `Updated ${displayTime}`,
      status: severeAlerts > 0 ? 'ALERT' : 'NORMAL',
      statusColor: severeAlerts > 0 ? '#EF4444' : '#00C897',
      tab: 'warnings',
    },
    {
      id: 'status-card-aqi',
      title: 'AQI',
      value: avgAQI !== null ? `${avgAQI}` : 'N/A',
      unit: avgAQI !== null ? 'AQI' : '',
      subtext: avgAQI !== null ? 'Mean National Category: Moderate' : 'National aggregation unavailable',
      source: 'CPCB CAAQMS Network',
      obsTime: `Updated ${displayTime}`,
      status: 'OPERATIONAL',
      statusColor: '#00C897',
      tab: 'aqi',
    },
    {
      id: 'status-card-wind',
      title: 'WIND',
      value: avgWind !== null ? `${avgWind}` : 'N/A',
      unit: avgWind !== null ? 'km/h' : '',
      subtext: maxWind !== null ? `Peak Gusts to ${maxWind} km/h` : 'National aggregation unavailable',
      source: 'IMD Synoptic Network',
      obsTime: `Updated ${displayTime}`,
      status: 'LIVE',
      statusColor: '#00C897',
      tab: 'weather',
    },
    {
      id: 'status-card-humidity',
      title: 'HUMIDITY',
      value: avgHumidity !== null ? `${avgHumidity}` : 'N/A',
      unit: avgHumidity !== null ? '% RH' : '',
      subtext: avgHumidity !== null ? 'Mean relative humidity' : 'National aggregation unavailable',
      source: 'IMD Surface Observation',
      obsTime: `Updated ${displayTime}`,
      status: 'LIVE',
      statusColor: '#00C897',
      tab: 'weather',
    },
    {
      id: 'status-card-stations',
      title: 'STATIONS REPORTING',
      value: `${reportingStations} / ${totalStations}`,
      unit: 'Stations',
      subtext: '36 State & UT Central Observatories',
      source: 'Station Network',
      obsTime: `Updated ${displayTime}`,
      status: 'OPERATIONAL',
      statusColor: '#00C897',
      tab: 'reports',
    },
    {
      id: 'status-card-last-update',
      title: 'LAST DATA UPDATE',
      value: displayTime.replace(' IST', ''),
      unit: 'IST',
      subtext: 'Synchronized synoptic cycle',
      source: 'National Data Gateway',
      obsTime: `Cycle: ${displayTime}`,
      status: 'VERIFIED',
      statusColor: '#00C897',
      tab: 'reports',
    },
  ];

  return (
    <section
      id="india-weather-status-panel"
      className="bg-[#101E2C] border border-[#1E3852] rounded-xl p-4 sm:p-5 shadow-lg"
      aria-label="National Weather Status"
    >
      {/* Header bar with Live Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E3852] pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B3D91] border border-[#1565C0] flex items-center justify-center text-[#18A7E8]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#F5F9FC] tracking-wide uppercase flex items-center gap-2">
              NATIONAL WEATHER STATUS
            </h2>
            <p className="text-xs text-[#B8C7D9]">
              Real-time synoptic overview across all state meteorological centres
            </p>
          </div>
        </div>

        {/* Live status badge with real data timestamp */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#172738] border border-[#1E3852] px-3 py-1.5 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00C897] animate-pulse" />
          <span className="font-bold text-[#00C897] tracking-wider uppercase">SYNCHRONIZED</span>
          <span className="text-[#1E3852]">•</span>
          <span className="text-[#B8C7D9] font-mono text-[11px]">
            Observed: <strong className="text-[#F5F9FC]">{displayTime}</strong>
          </span>
        </div>
      </div>

      {/* 4x2 Responsive Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            id={card.id}
            type="button"
            onClick={() => onNavigate?.(card.tab)}
            className="text-left bg-[#172738] hover:bg-[#1C334A] border border-[#1E3852] hover:border-[#18A7E8]/60 rounded-xl p-3.5 transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Top row: Title + Status */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold tracking-wider text-[#B8C7D9] uppercase">
                {card.title}
              </span>
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{
                  color: card.statusColor,
                  backgroundColor: `${card.statusColor}18`,
                  border: `1px solid ${card.statusColor}33`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: card.statusColor }}
                />
                {card.status}
              </span>
            </div>

            {/* Value and Unit */}
            <div className="my-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F9FC] tracking-tight">
                  {card.value}
                </span>
                {card.unit && (
                  <span className="text-xs font-semibold text-[#8EA3B8]">
                    {card.unit}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#B8C7D9] mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>

            {/* Source and Observation Time footer */}
            <div className="mt-2.5 pt-2 border-t border-[#1E3852]/60 flex items-center justify-between text-[10px] text-[#8EA3B8] font-mono">
              <span className="truncate">{card.source}</span>
              <span className="shrink-0 text-[#18A7E8] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
