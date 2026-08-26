import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { IndiaWeatherMap } from '../components/map/IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';

const RADAR_STATIONS = [
  { code: 'DWR-PDR', name: 'Paradip Doppler Radar', state: 'Odisha', band: 'S-Band', range: '500 km', status: 'Operational' },
  { code: 'DWR-GOP', name: 'Gopalpur Doppler Radar', state: 'Odisha', band: 'S-Band', range: '500 km', status: 'Operational' },
  { code: 'DWR-KOL', name: 'Kolkata Doppler Radar', state: 'West Bengal', band: 'S-Band', range: '500 km', status: 'Operational' },
  { code: 'DWR-DEL', name: 'New Delhi (Palam) Radar', state: 'Delhi', band: 'C-Band', range: '250 km', status: 'Operational' },
  { code: 'DWR-MUM', name: 'Mumbai (Colaba) Radar', state: 'Maharashtra', band: 'S-Band', range: '500 km', status: 'Operational' },
  { code: 'DWR-CHN', name: 'Chennai (Port) Radar', state: 'Tamil Nadu', band: 'S-Band', range: '500 km', status: 'Operational' },
];

export const RadarPage: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState(RADAR_STATIONS[0]);
  const [productType, setProductType] = useState<'MAXZ' | 'PPZ' | 'PPV' | 'SRI'>('MAXZ');

  return (
    <div className="flex flex-col gap-5">
      {/* Header & Product Controller */}
      <div className="mausam-card flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold text-lg">
            National Doppler Weather Radar (DWR) Imagery &amp; Synoptic Maps
          </h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Continuous atmospheric reflectivity, precipitation estimation, and radial hydrometeor velocity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#1E2733] border border-[#334155] rounded p-1">
            {(['MAXZ', 'PPZ', 'PPV', 'SRI'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProductType(p)}
                className={`px-2.5 py-1 text-xs font-bold rounded ${
                  productType === p
                    ? 'bg-[#0B72B9] text-white'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <StatusBadge label="Doppler Network 100% Operational" variant="good" icon="check_circle" />
        </div>
      </div>

      {/* Radar Imagery & State Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <IndiaWeatherMap
            data={INDIA_WEATHER_DATA}
            metric="rainfall"
          />
        </div>

        {/* Radar Station Selector & Technical Specifications */}
        <div className="flex flex-col gap-4">
          <div className="mausam-card">
            <SectionHeader
              title="Coastal &amp; Inland Radar Stations"
              subtitle="Select active Doppler station"
              icon="cell_tower"
            />

            <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto">
              {RADAR_STATIONS.map((station) => (
                <div
                  key={station.code}
                  onClick={() => setSelectedStation(station)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    selectedStation.code === station.code
                      ? 'bg-[#0B72B9]/20 border-[#4FA8E0]'
                      : 'bg-[#1E2733] border-[#334155] hover:border-[#4FA8E0]/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{station.name}</span>
                    <span className="text-[10px] text-[#4FA8E0] font-mono font-bold">
                      {station.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8A94A6] mt-1 flex justify-between">
                    <span>{station.state} • {station.band}</span>
                    <span className="text-[#2ECC71]">Range: {station.range}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Station Parameters */}
          <div className="mausam-card">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Observational Sweep Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Scan Frequency</span>
                <span className="text-white font-bold font-mono">Every 10 Minutes</span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Elevation Angles</span>
                <span className="text-white font-bold font-mono">0.5° to 19.5° (10 cuts)</span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Transmitter Type</span>
                <span className="text-white font-bold font-mono">Klystron 500kW</span>
              </div>
              <div className="p-2 bg-[#1E2733] rounded border border-[#334155]">
                <span className="text-[10px] text-[#8A94A6] block">Current Product</span>
                <span className="text-white font-bold font-mono">{productType} Reflection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
