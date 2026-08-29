import React from 'react';
import { CurrentWeather } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface WeatherMetricsProps {
  weather: CurrentWeather;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ weather }) => {
  const getAqiStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', variant: 'good' as const };
    if (aqi <= 100) return { label: 'Satisfactory', variant: 'good' as const };
    if (aqi <= 200) return { label: 'Moderate', variant: 'warning' as const };
    if (aqi <= 300) return { label: 'Poor', variant: 'alert' as const };
    return { label: 'Severe', variant: 'danger' as const };
  };

  const getPollenStatus = (pollen: number) => {
    if (pollen <= 2) return { label: 'Low Risk', variant: 'good' as const };
    if (pollen <= 3) return { label: 'Moderate', variant: 'warning' as const };
    return { label: 'High Risk', variant: 'alert' as const };
  };

  const safeAqi =
    typeof weather.aqi === 'number' && !Number.isNaN(weather.aqi) && weather.aqi > 0
      ? weather.aqi
      : typeof weather.aqiIndex === 'number' && !Number.isNaN(weather.aqiIndex) && weather.aqiIndex > 0
      ? weather.aqiIndex
      : typeof weather.aqiPm25 === 'number' && !Number.isNaN(weather.aqiPm25) && weather.aqiPm25 > 0
      ? Math.round(weather.aqiPm25 / 0.45)
      : 75;

  const aqiStatus = getAqiStatus(safeAqi);
  const pollenStatus = getPollenStatus(weather.pollenCount || 2);

  const metrics = [
    {
      label: 'Air Quality (AQI)',
      value: String(safeAqi),
      unit: 'PM2.5 / PM10',
      badge: <StatusBadge label={aqiStatus.label} variant={aqiStatus.variant} />,
      desc: weather.aqiDescription || 'National Air Monitoring Program (CPCB)',
      icon: 'air',
    },
    {
      label: 'Pollen Count',
      value: `${weather.pollenCount || 3}/5`,
      unit: 'Index',
      badge: <StatusBadge label={pollenStatus.label} variant={pollenStatus.variant} />,
      desc: 'Dominant Grass & Tree Bio-aerosol allergens',
      icon: 'grain',
    },
    {
      label: 'Precipitation (24h)',
      value: String(weather.precipitationMm || 0),
      unit: 'mm',
      badge: (
        <StatusBadge
          label={weather.precipitationMm > 0 ? `${weather.precipitationMm} mm Recorded` : 'Nil'}
          variant={weather.precipitationMm > 0 ? 'info' : 'neutral'}
        />
      ),
      desc: `Rain Probability: ${weather.precipitationProbability || 10}%`,
      icon: 'rainy',
    },
    {
      label: 'Relative Humidity',
      value: `${weather.humidity}%`,
      unit: 'RH',
      badge: (
        <StatusBadge
          label={weather.humidity > 80 ? 'High' : weather.humidity < 40 ? 'Dry' : 'Normal'}
          variant={weather.humidity > 80 ? 'info' : 'good'}
        />
      ),
      desc: `Dew Point: ${weather.dewPoint || 22}°C`,
      icon: 'water_drop',
    },
    {
      label: 'Wind Telemetry',
      value: `${weather.windSpeed} km/h`,
      unit: weather.windDirection,
      badge: (
        <StatusBadge
          label={`Gusts: ${weather.windGusts || weather.windSpeed + 5} km/h`}
          variant="neutral"
        />
      ),
      desc: 'Anemometer 10m Ground Observation',
      icon: 'air',
    },
    {
      label: 'Atmospheric Pressure',
      value: `${weather.pressure}`,
      unit: 'hPa',
      badge: (
        <StatusBadge
          label={weather.pressure >= 1013 ? 'Steady / High' : 'Low Depression'}
          variant={weather.pressure < 1005 ? 'warning' : 'neutral'}
        />
      ),
      desc: 'Barometric Sea Level Equivalent',
      icon: 'compress',
    },
  ];

  return (
    <div className="mausam-card">
      <SectionHeader
        title="Synoptic Observational Telemetry"
        subtitle="Standardized ground and atmospheric instrument readings"
        icon="tune"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-[#1E2733] border border-[#334155] rounded p-3 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5 text-xs text-[#8A94A6]">
                <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">
                  {m.icon}
                </span>
                <span className="font-semibold">{m.label}</span>
              </div>
              {m.badge}
            </div>

            <div className="mt-2 mb-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">{m.value}</span>
              <span className="text-xs text-[#8A94A6]">{m.unit}</span>
            </div>

            <p className="text-[11px] text-[#8A94A6] mt-1 border-t border-[#334155]/60 pt-1.5">
              {m.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
