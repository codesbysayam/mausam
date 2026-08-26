import React, { useState } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { DailyForecast } from '../components/weather/DailyForecast';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DataTable, ColumnDef } from '../components/common/DataTable';

interface ForecastPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const [modelType, setModelType] = useState<'WRF' | 'GEFS' | 'ECMWF'>('WRF');
  const { hourly, daily } = weatherBundle;

  const hourlyColumns: ColumnDef<any>[] = [
    {
      header: 'Time (IST)',
      render: (item) => (
        <span className="font-bold text-white font-mono">{item.time}</span>
      ),
      width: '100px',
    },
    {
      header: 'Temp (°C)',
      render: (item) => (
        <span className="font-mono text-white font-bold">{Math.round(item.temp)}°C</span>
      ),
      width: '100px',
    },
    {
      header: 'Weather Condition',
      render: (item) => (
        <span className="text-xs text-[#D7DEE8]">{item.condition}</span>
      ),
    },
    {
      header: 'Precipitation Prob',
      render: (item) => (
        <span className="font-mono text-[#4FA8E0] font-bold">
          {item.precipitationProbability || 0}%
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Wind Speed & Dir',
      render: (item) => (
        <span className="font-mono text-xs text-[#D7DEE8]">
          {item.windSpeed || 10} km/h {item.windDirection || 'ESE'}
        </span>
      ),
    },
    {
      header: 'Cloud Cover',
      render: (item) => (
        <span className="font-mono text-xs text-[#8A94A6]">
          {item.cloudCover || 40}%
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Model & Header banner */}
      <div className="mausam-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold text-lg">
            Numerical Weather Prediction Forecast — {selectedLocation.city}, {selectedLocation.state}
          </h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            High-resolution ensemble model forecasts (GCM/WRF/IMD MOS post-processing).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1E2733] p-1 rounded border border-[#334155]">
          <span className="text-[11px] text-[#8A94A6] px-2 font-bold uppercase">
            Model:
          </span>
          {(['WRF', 'GEFS', 'ECMWF'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModelType(m)}
              className={`px-2.5 py-1 text-xs font-bold rounded ${
                modelType === m
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Strip */}
      <HourlyForecast hourly={hourly} />

      {/* 7-Day Medium Range Forecast */}
      <DailyForecast daily={daily} />

      {/* Full Detailed Tabular Hourly Output */}
      <div className="mausam-card">
        <SectionHeader
          title="Complete 24-Hour Synoptic Time-Series Matrix"
          subtitle="Point-wise meteorological parameter projections"
          icon="table_chart"
        />

        <DataTable
          data={hourly}
          columns={hourlyColumns}
          keyExtractor={(item, idx) => item.time || String(idx)}
        />
      </div>
    </div>
  );
};
