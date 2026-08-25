import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const InsightsView: React.FC = () => {
  // Historical 7-day particulate matter trend
  const historicalData = [
    { day: 'Mon', pm25: 68, humidity: 55, temp: 26 },
    { day: 'Tue', pm25: 74, humidity: 58, temp: 27 },
    { day: 'Wed', pm25: 92, humidity: 62, temp: 28 },
    { day: 'Thu', pm25: 125, humidity: 70, temp: 26 },
    { day: 'Fri', pm25: 118, humidity: 68, temp: 25 },
    { day: 'Sat', pm25: 112, humidity: 64, temp: 24.8 },
    { day: 'Sun (Proj)', pm25: 58, humidity: 52, temp: 27 },
  ];

  const gasDispersion = [
    { gas: 'PM2.5', value: 112, limit: 60, status: 'Elevated' },
    { gas: 'PM10', value: 164, limit: 100, status: 'Elevated' },
    { gas: 'NO2', value: 38, limit: 80, status: 'Normal' },
    { gas: 'SO2', value: 14, limit: 50, status: 'Clean' },
    { gas: 'O3 (Ozone)', value: 45, limit: 100, status: 'Moderate' },
    { gas: 'CO', value: 0.9, limit: 2.0, status: 'Clean' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* Top Banner */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">analytics</span>
            <h2 className="font-h3 text-base font-bold text-[#FFFFFF]">
              Atmospheric &amp; Environmental Intelligence Diagnostics
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Multi-sensor boundary layer inversion models &amp; aerosol dispersion diagnostics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-xs font-semibold border border-[#2ECC71]/30">
            AI DIAGNOSTICS: STABLE
          </span>
        </div>
      </div>

      {/* Grid of 2 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* PM2.5 vs Humidity Correlation (Span 7) */}
        <div className="col-span-1 md:col-span-7 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-h4 text-sm font-semibold text-[#FFFFFF]">
                7-Day Particulate Matter vs. Relative Humidity
              </h3>
              <p className="text-xs text-[#8A94A6]">
                Hygroscopic growth of aerosols under humidity spikes
              </p>
            </div>
            <span className="text-xs text-[#FFB703] font-bold">
              r = +0.78 (Strong Coupling)
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,230,235,0.12)" />
                <XAxis dataKey="day" stroke="#8A94A6" tick={{ fill: '#8A94A6', fontSize: 11 }} />
                <YAxis stroke="#8A94A6" tick={{ fill: '#8A94A6', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F141A',
                    borderColor: 'rgba(225,230,235,0.12)',
                    borderRadius: 8,
                    color: '#F4F7FA',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pm25"
                  stroke="#FFB703"
                  name="PM2.5 (µg/m³)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#FFB703' }}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#4FA8E0"
                  name="Humidity (%)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#4FA8E0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aerosol & Gaseous Species Breakdown (Span 5) */}
        <div className="col-span-1 md:col-span-5 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl">
          <h3 className="font-h4 text-sm font-semibold text-[#FFFFFF] mb-1">
            Gaseous Pollutant &amp; Particulate Vector
          </h3>
          <p className="text-xs text-[#8A94A6] mb-4">
            Current concentration vs. National Ambient Air Quality Limit
          </p>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gasDispersion} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,230,235,0.12)" />
                <XAxis type="number" stroke="#8A94A6" tick={{ fill: '#8A94A6', fontSize: 10 }} />
                <YAxis dataKey="gas" type="category" stroke="#8A94A6" tick={{ fill: '#F4F7FA', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F141A',
                    borderColor: 'rgba(225,230,235,0.12)',
                    borderRadius: 8,
                    color: '#F4F7FA',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#0B72B9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Atmospheric Inversion & Ventilation Index Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-xl">
          <span className="text-xs uppercase text-[#4FA8E0] font-bold">
            Boundary Layer Height
          </span>
          <p className="text-2xl font-bold text-[#FFFFFF] mt-1">
            820 meters
          </p>
          <p className="text-xs text-[#8A94A6] mt-2 leading-relaxed">
            Surface heating is expanding the mixing height, encouraging vertical dispersion of trapped aerosols by 18:00 Local.
          </p>
        </div>

        <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-xl">
          <span className="text-xs uppercase text-[#2ECC71] font-bold">
            Ventilation Index (VI)
          </span>
          <p className="text-2xl font-bold text-[#2ECC71] mt-1">
            4,850 m²/s
          </p>
          <p className="text-xs text-[#8A94A6] mt-2 leading-relaxed">
            Rated "Moderate Clearing". Wind velocity field of 18 km/h is clearing industrial plumes towards southeast corridors.
          </p>
        </div>

        <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-xl">
          <span className="text-xs uppercase text-[#FFB703] font-bold">
            Synoptic Barometric Drift
          </span>
          <p className="text-2xl font-bold text-[#FFB703] mt-1">
            -1.2 hPa / 3h
          </p>
          <p className="text-xs text-[#8A94A6] mt-2 leading-relaxed">
            Slight pressure dip indicates approaching trough, bringing increased cloud cover and chance of convective precipitation.
          </p>
        </div>
      </div>
    </div>
  );
};
