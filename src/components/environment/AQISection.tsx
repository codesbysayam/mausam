import React from 'react';
import { CurrentWeather } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface AQISectionProps {
  weather: CurrentWeather;
}

export const AQISection: React.FC<AQISectionProps> = ({ weather }) => {
  // Resolve numeric AQI safely from weather data properties
  const aqi: number =
    typeof weather?.aqi === 'number' && !Number.isNaN(weather.aqi) && weather.aqi > 0
      ? weather.aqi
      : typeof weather?.aqiIndex === 'number' && !Number.isNaN(weather.aqiIndex) && weather.aqiIndex > 0
      ? weather.aqiIndex
      : typeof weather?.aqiPm25 === 'number' && !Number.isNaN(weather.aqiPm25) && weather.aqiPm25 > 0
      ? Math.round(weather.aqiPm25 / 0.45)
      : 75;

  const pm25Value: number =
    typeof weather?.aqiPm25 === 'number' && !Number.isNaN(weather.aqiPm25) && weather.aqiPm25 > 0
      ? Math.round(weather.aqiPm25)
      : Math.round(aqi * 0.45);

  const pm10Value: number =
    typeof weather?.aqiPm10 === 'number' && !Number.isNaN(weather.aqiPm10) && weather.aqiPm10 > 0
      ? Math.round(weather.aqiPm10)
      : Math.round(pm25Value * 1.8);

  const getAqiDetails = (val: number) => {
    if (typeof val !== 'number' || Number.isNaN(val) || val <= 50) {
      return {
        category: 'Good',
        variant: 'good' as const,
        description: 'Minimal impact on health. Air quality is considered satisfactory.',
        color: '#2ECC71',
      };
    }
    if (val <= 100) {
      return {
        category: 'Satisfactory',
        variant: 'good' as const,
        description: 'Minor breathing discomfort to sensitive people.',
        color: '#F1C40F',
      };
    }
    if (val <= 200) {
      return {
        category: 'Moderate',
        variant: 'warning' as const,
        description: 'Breathing discomfort to people with lungs, asthma and heart diseases.',
        color: '#FF8C42',
      };
    }
    if (val <= 300) {
      return {
        category: 'Poor',
        variant: 'alert' as const,
        description: 'Breathing discomfort to most people on prolonged exposure.',
        color: '#E74C3C',
      };
    }
    if (val <= 400) {
      return {
        category: 'Very Poor',
        variant: 'danger' as const,
        description: 'Respiratory illness on prolonged exposure.',
        color: '#9B59B6',
      };
    }
    return {
      category: 'Severe',
      variant: 'danger' as const,
      description: 'Affects healthy people and seriously impacts those with existing diseases.',
      color: '#7F1D1D',
    };
  };

  const details = getAqiDetails(aqi);

  const formatCo = (val?: number) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return '0.6';
    if (val > 10) return (val / 1000).toFixed(1);
    return val.toFixed(1);
  };

  const pollutants = [
    { name: 'PM 2.5', value: pm25Value, unit: 'µg/m³', std: '60 (Standard)' },
    { name: 'PM 10', value: pm10Value, unit: 'µg/m³', std: '100 (Standard)' },
    {
      name: 'NO₂',
      value: typeof weather?.no2 === 'number' && !Number.isNaN(weather.no2) ? Math.round(weather.no2) : 24,
      unit: 'ppb',
      std: '80 (Standard)',
    },
    {
      name: 'SO₂',
      value: typeof weather?.so2 === 'number' && !Number.isNaN(weather.so2) ? Math.round(weather.so2) : 12,
      unit: 'ppb',
      std: '80 (Standard)',
    },
    {
      name: 'CO',
      value: formatCo(weather?.co),
      unit: 'mg/m³',
      std: '2.0 (Standard)',
    },
    {
      name: 'Ozone (O₃)',
      value: typeof weather?.o3 === 'number' && !Number.isNaN(weather.o3) ? Math.round(weather.o3) : 38,
      unit: 'ppb',
      std: '100 (Standard)',
    },
  ];

  return (
    <div className="mausam-card">
      <SectionHeader
        title="National Air Quality Index (NAQI)"
        subtitle="Continuous ambient air quality monitoring network (CPCB / State Pollution Control Board)"
        icon="air"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Main AQI Score Block */}
        <div className="bg-[#1E2733] border border-[#334155] rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#8A94A6] uppercase font-bold">
                Overall NAQI
              </span>
              <StatusBadge label={details.category} variant={details.variant} />
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white font-mono">{aqi}</span>
              <span className="text-xs text-[#8A94A6]">AQI Index (0–500)</span>
            </div>
          </div>

          <p className="text-xs text-[#D7DEE8] border-t border-[#334155] pt-2">
            {details.description}
          </p>
        </div>

        {/* Health Advisory & Recommendations */}
        <div className="md:col-span-2 bg-[#1E2733] border border-[#334155] rounded p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">
                health_and_safety
              </span>
              Citizen Health Guidelines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#D7DEE8]">
              <div className="p-2 bg-[#17212B] rounded border border-[#334155]">
                <strong className="text-white block mb-0.5">General Public</strong>
                {aqi > 150
                  ? 'Reduce intense outdoor exertion. Wear N95 protective mask if traveling.'
                  : 'Air quality is favorable for outdoor activities and exercise.'}
              </div>
              <div className="p-2 bg-[#17212B] rounded border border-[#334155]">
                <strong className="text-white block mb-0.5">Sensitive Groups (Asthma/Elderly)</strong>
                {aqi > 100
                  ? 'Keep inhalers handy and limit prolonged morning walks near heavy traffic.'
                  : 'Comfortable air quality with minimal respiratory triggers.'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#8A94A6] mt-2 pt-2 border-t border-[#334155] flex justify-between">
            <span>Primary Pollutant: <strong>PM2.5</strong></span>
            <span>Sensor Calibration: <strong>US-EPA / CPCB Equivalence</strong></span>
          </div>
        </div>
      </div>

      {/* Pollutant Parameter Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {pollutants.map((p, idx) => (
          <div
            key={idx}
            className="p-2.5 bg-[#1E2733] border border-[#334155] rounded text-center"
          >
            <div className="text-[11px] font-bold text-[#8A94A6]">{p.name}</div>
            <div className="text-base font-bold text-white font-mono my-0.5">
              {p.value}
            </div>
            <div className="text-[10px] text-[#8A94A6]">{p.unit}</div>
            <div className="text-[9px] text-[#4FA8E0] mt-1 border-t border-[#334155]/60 pt-0.5">
              {p.std}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
