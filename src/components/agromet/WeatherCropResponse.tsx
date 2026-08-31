import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  GitBranch,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Thermometer,
  CloudRain,
  Droplets,
  ShieldAlert,
} from 'lucide-react';

interface WeatherCropResponseProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const WeatherCropResponse: React.FC<WeatherCropResponseProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'rain' | 'soil' | 'risk'>('all');

  const chartData = [
    { day: 'Today (31 Aug)', temp: 31, rain: 15, soilMoisture: 68, cropRisk: 72 },
    { day: 'Tue (01 Sep)', temp: 32, rain: 10, soilMoisture: 74, cropRisk: 75 },
    { day: 'Wed (02 Sep)', temp: 33, rain: 0, soilMoisture: 66, cropRisk: 55 },
    { day: 'Thu (03 Sep)', temp: 34, rain: 0, soilMoisture: 58, cropRisk: 38 },
    { day: 'Fri (04 Sep)', temp: 33, rain: 5, soilMoisture: 62, cropRisk: 48 },
    { day: 'Sat (05 Sep)', temp: 32, rain: 8, soilMoisture: 67, cropRisk: 58 },
    { day: 'Sun (06 Sep)', temp: 31, rain: 2, soilMoisture: 60, cropRisk: 42 },
  ];

  return (
    <section id="weather-crop-response-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E2E40]">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              Causal Agronomic Synthesis
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            How Weather Affects Your Crop
          </h2>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">
          Predictive multi-variable causal modeling for {selectedCrop}
        </span>
      </div>

      {/* 1. VISUAL FLOW CONNECTOR: WEATHER -> SOIL -> CROP -> RISK -> ACTION */}
      <div className="rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Live Agronomic Causal Chain
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
            Real-Time Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* STEP 1: WEATHER */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#38BDF8]/40 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#38BDF8]">01 • WEATHER</span>
              <CloudRain className="w-3.5 h-3.5 text-[#38BDF8]" />
            </div>
            <h4 className="text-sm font-bold text-white">RH 78% &amp; 15mm Rain</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Warm convective rain with sustained morning leaf wetness.
            </p>
          </div>

          {/* STEP 2: SOIL */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#10B981]/40 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#10B981]">02 • SOIL</span>
              <Droplets className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <h4 className="text-sm font-bold text-white">68% Field Capacity</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Topsoil fully saturated; root-zone moisture surplus.
            </p>
          </div>

          {/* STEP 3: CROP */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#F59E0B]/40 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#F59E0B]">03 • CROP STAGE</span>
              <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <h4 className="text-sm font-bold text-white">Active Tillering</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Dense canopy closure creates high humidity microclimate.
            </p>
          </div>

          {/* STEP 4: RISK */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#EF4444]/40 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#EF4444]">04 • RISK</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
            </div>
            <h4 className="text-sm font-bold text-white">Fungal Sheath Rot</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              High risk of Rhizoctonia spore colonization on leaf sheaths.
            </p>
          </div>

          {/* STEP 5: ACTION */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#8B5CF6]/40 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#A78BFA]">05 • ACTION</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#A78BFA]" />
            </div>
            <h4 className="text-sm font-bold text-white">Hold Irrigation</h4>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Postpone water &amp; spray Streptocycline upon dry foliage.
            </p>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE 7-DAY WEATHER X CROP RESPONSE CHART */}
      <div className="rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2E40]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              7-Day Weather × Crop Response Matrix
            </h3>
            <p className="text-xs font-mono text-[#94A3B8] mt-0.5">
              Simulated inter-relationship between Rainfall, Soil Hydrology, Temperature &amp; Pathogen Pressure
            </p>
          </div>

          {/* Metric Toggle Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveMetric('all')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeMetric === 'all'
                  ? 'bg-[#38BDF8] text-[#0A1017]'
                  : 'bg-[#080E16] text-[#94A3B8] border border-[#1E2E40]'
              }`}
            >
              All Signals
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('rain')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeMetric === 'rain'
                  ? 'bg-[#38BDF8] text-[#0A1017]'
                  : 'bg-[#080E16] text-[#94A3B8] border border-[#1E2E40]'
              }`}
            >
              Rainfall (mm)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('soil')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeMetric === 'soil'
                  ? 'bg-[#10B981] text-[#0A1017]'
                  : 'bg-[#080E16] text-[#94A3B8] border border-[#1E2E40]'
              }`}
            >
              Soil Moisture (%)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('risk')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeMetric === 'risk'
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#080E16] text-[#94A3B8] border border-[#1E2E40]'
              }`}
            >
              Crop Risk Index
            </button>
          </div>
        </div>

        {/* Recharts Multi-Axis Graph */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E2E40" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#334155"
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#334155"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#334155"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#080E16',
                  borderColor: '#1E2E40',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              {(activeMetric === 'all' || activeMetric === 'rain') && (
                <Bar
                  yAxisId="left"
                  dataKey="rain"
                  name="Rainfall (mm)"
                  fill="#38BDF8"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              )}
              {(activeMetric === 'all' || activeMetric === 'soil') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="soilMoisture"
                  name="Soil Moisture (%)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              )}
              {(activeMetric === 'all' || activeMetric === 'risk') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cropRisk"
                  name="Crop Risk Index"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#EF4444' }}
                />
              )}
              {activeMetric === 'all' && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  name="Air Temp (°C)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};
