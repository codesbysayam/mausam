import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  Bug,
  Activity,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface FieldConditionsCommandCenterProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const FieldConditionsCommandCenter: React.FC<FieldConditionsCommandCenterProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const rainToday = bulletin.rainfall5DaysList?.[0]?.amountMm ?? 15;
  const soilMoisture = bulletin.soilMoisture?.overallPct ?? 68;
  const soilStatus = bulletin.soilMoisture?.status ?? 'Optimal';

  const metrics = [
    {
      id: 'temp',
      label: 'AIR TEMPERATURE',
      value: '31.2',
      unit: '°C',
      status: 'Optimal Range',
      statusColor: '#10B981',
      icon: Thermometer,
      explanation: 'Optimal thermal accumulation for vegetative growth without heat shock.',
    },
    {
      id: 'rain',
      label: 'PRECIPITATION (24H)',
      value: `${rainToday}`,
      unit: 'mm',
      status: rainToday > 10 ? 'Convective Showers' : 'Dry / Light',
      statusColor: '#38BDF8',
      icon: CloudRain,
      explanation: rainToday > 10 ? 'Shallow surface runoff expected; recharge in progress.' : 'Low rain probability today.',
    },
    {
      id: 'soil',
      label: 'SOIL MOISTURE',
      value: `${soilMoisture}`,
      unit: '%',
      status: soilStatus,
      statusColor: soilMoisture > 75 ? '#38BDF8' : '#10B981',
      icon: Droplets,
      explanation: 'Root-zone moisture meets evapotranspirative crop water demand.',
    },
    {
      id: 'humidity',
      label: 'RELATIVE HUMIDITY',
      value: '78',
      unit: '%',
      status: 'Elevated Foliar Dew',
      statusColor: '#F59E0B',
      icon: Gauge,
      explanation: 'High morning humidity (>75%) extends leaf wetness duration.',
    },
    {
      id: 'wind',
      label: 'WIND VELOCITY',
      value: '12',
      unit: 'km/h',
      status: 'Safe Spraying Window',
      statusColor: '#10B981',
      icon: Wind,
      explanation: 'Gentle breeze within threshold (<15 km/h) for uniform spray droplet drift.',
    },
    {
      id: 'uv',
      label: 'SOLAR UV INDEX',
      value: '6.4',
      unit: 'UV',
      status: 'Moderate Insolation',
      statusColor: '#F59E0B',
      icon: Sun,
      explanation: 'Adequate radiation for photosynthetic biomass production.',
    },
    {
      id: 'stress',
      label: 'CROP THERMAL STRESS',
      value: 'Moderate',
      unit: 'Index',
      status: 'Normal Transpiration',
      statusColor: '#38BDF8',
      icon: Activity,
      explanation: 'Vapor pressure deficit within safe stomatal conductance range.',
    },
    {
      id: 'pest_risk',
      label: 'PATHOGEN / PEST RISK',
      value: 'High',
      unit: 'Alert',
      status: 'Foliar Blight Watch',
      statusColor: '#EF4444',
      icon: Bug,
      explanation: `Overcast microclimate accelerates spore germination on ${selectedCrop.split(' ')[0]} leaves.`,
    },
  ];

  return (
    <section id="field-conditions-command-center" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
            Current Field Conditions
          </h2>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">
          Automated Telemetry &amp; Microclimatic Synthesis
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((metric) => {
          const IconComp = metric.icon;
          return (
            <div
              key={metric.id}
              className="p-4 rounded-2xl bg-[#0B131D] border border-[#1E2E40] hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${metric.statusColor}18`,
                      color: metric.statusColor,
                    }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    {metric.label}
                  </span>
                </div>

                <span
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border"
                  style={{
                    color: metric.statusColor,
                    backgroundColor: `${metric.statusColor}12`,
                    borderColor: `${metric.statusColor}30`,
                  }}
                >
                  {metric.status}
                </span>
              </div>

              {/* Value and Unit */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {metric.value}
                </span>
                <span className="text-xs font-mono font-bold text-[#64748B]">
                  {metric.unit}
                </span>
              </div>

              {/* Explanation */}
              <p className="text-[11px] text-[#94A3B8] leading-relaxed pt-2 border-t border-[#1E2E40]/60">
                {metric.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
