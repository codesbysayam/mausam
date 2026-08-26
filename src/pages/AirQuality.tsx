import React from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { AQISection } from '../components/environment/AQISection';
import { PollenSection } from '../components/environment/PollenSection';
import { IndiaWeatherMap } from '../components/map/IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { SectionHeader } from '../components/common/SectionHeader';

interface AirQualityPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const AirQualityPage: React.FC<AirQualityPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const { current } = weatherBundle;

  const cityAqiData = [
    { city: 'Bhubaneswar', state: 'Odisha', aqi: current.aqi, category: 'Moderate', pm25: 48, pm10: 88 },
    { city: 'Cuttack', state: 'Odisha', aqi: 112, category: 'Moderate', pm25: 52, pm10: 94 },
    { city: 'Rourkela', state: 'Odisha', aqi: 145, category: 'Moderate', pm25: 64, pm10: 120 },
    { city: 'Puri', state: 'Odisha', aqi: 45, category: 'Good', pm25: 18, pm10: 42 },
    { city: 'New Delhi', state: 'Delhi', aqi: 240, category: 'Poor', pm25: 110, pm10: 215 },
    { city: 'Mumbai', state: 'Maharashtra', aqi: 92, category: 'Satisfactory', pm25: 38, pm10: 76 },
    { city: 'Kolkata', state: 'West Bengal', aqi: 135, category: 'Moderate', pm25: 58, pm10: 110 },
    { city: 'Bengaluru', state: 'Karnataka', aqi: 62, category: 'Satisfactory', pm25: 26, pm10: 54 },
  ];

  const cityColumns: ColumnDef<any>[] = [
    {
      header: 'Station / City',
      render: (item) => (
        <div>
          <span className="font-bold text-white text-xs">{item.city}</span>
          <span className="text-[11px] text-[#8A94A6] ml-2">({item.state})</span>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'NAQI Index',
      render: (item) => (
        <span className="font-mono font-bold text-white text-sm">{item.aqi}</span>
      ),
      width: '110px',
    },
    {
      header: 'Category',
      render: (item) => (
        <StatusBadge
          label={item.category}
          variant={
            item.aqi <= 50
              ? 'good'
              : item.aqi <= 100
              ? 'good'
              : item.aqi <= 200
              ? 'warning'
              : item.aqi <= 300
              ? 'alert'
              : 'danger'
          }
        />
      ),
      width: '140px',
    },
    {
      header: 'PM2.5 (µg/m³)',
      render: (item) => <span className="font-mono text-xs text-[#D7DEE8]">{item.pm25}</span>,
      width: '130px',
    },
    {
      header: 'PM10 (µg/m³)',
      render: (item) => <span className="font-mono text-xs text-[#D7DEE8]">{item.pm10}</span>,
      width: '130px',
    },
    {
      header: 'Monitoring Agency',
      render: () => <span className="text-xs text-[#8A94A6]">CPCB Continuous Ambient Station</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Primary AQI Section */}
      <AQISection weather={current} />

      {/* Pollen Section */}
      <PollenSection weather={current} />

      {/* India AQI Map Layer */}
      <IndiaWeatherMap
        data={INDIA_WEATHER_DATA}
        metric="aqi"
      />

      {/* Regional Station Table */}
      <div className="mausam-card">
        <SectionHeader
          title="Regional Continuous Ambient Air Quality Monitoring Stations"
          subtitle="Real-time 24-hour rolling averages from Central & State Pollution Control Board monitors"
          icon="location_city"
        />

        <DataTable
          data={cityAqiData}
          columns={cityColumns}
          keyExtractor={(item) => item.city}
        />
      </div>
    </div>
  );
};
