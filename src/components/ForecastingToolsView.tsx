import React, { useState } from 'react';
import { FORECASTING_TOOLS } from '../data/forecastingToolsData';
import { ForecastingTool } from '../types';

export const ForecastingToolsView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ForecastingTool>(FORECASTING_TOOLS[0]);
  const [interactiveWindSpeed, setInteractiveWindSpeed] = useState<number>(18);
  const [interactivePressure, setInteractivePressure] = useState<number>(1013);
  const [interactiveHumidity, setInteractiveHumidity] = useState<number>(64);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* Top Banner */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#0B72B9]/15 border border-[#0B72B9]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
                precision_manufacturing
              </span>
            </div>
            <h2 className="font-h3 text-base font-bold text-[#FFFFFF]">
              Key Weather Forecasting Instruments &amp; Telemetry
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6] max-w-3xl leading-relaxed">
            Meteorological observation instruments powering numerical weather prediction models and real-time synoptic forecasting across the India Meteorological Department network.
          </p>
        </div>

        <div className="bg-[#0F141A] px-4 py-2 rounded-lg card-border text-xs text-[#2ECC71] font-semibold border border-[#2ECC71]/20">
          6 Core Planetary Instruments
        </div>
      </div>

      {/* Tool Navigation Grid (6 Tools) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FORECASTING_TOOLS.map((tool) => {
          const isSelected = selectedTool.id === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className={`p-3 rounded-xl card-border flex flex-col items-center gap-2 transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-[#242F3D] border-[#0B72B9] ring-1 ring-[#4FA8E0] shadow-lg scale-[1.02]'
                  : 'bg-[#1E2733] hover:bg-[#242F3D] border-[rgba(225,230,235,0.12)]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#0B72B9] text-[#FFFFFF]'
                    : 'bg-[#0F141A] text-[#4FA8E0]'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {tool.icon}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#FFFFFF]">
                {tool.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tool Detailed Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Specification & Definition Column (Span 7) */}
        <div className="lg:col-span-7 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col justify-between gap-6">
          <div>
            <div className="flex justify-between items-start gap-3 pb-4 border-b border-[rgba(225,230,235,0.12)] mb-4">
              <div>
                <span className="text-xs text-[#4FA8E0] font-semibold block mb-0.5">
                  Instrument Profile
                </span>
                <h3 className="font-h2 text-2xl font-bold text-[#FFFFFF]">
                  {selectedTool.name}
                </h3>
                <span className="text-xs text-[#8A94A6]">
                  {selectedTool.subtitle}
                </span>
              </div>

              <span className="px-3 py-1 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-xs font-semibold border border-[#2ECC71]/30">
                {selectedTool.liveStatus}
              </span>
            </div>

            {/* Core Definition */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border mb-4">
              <span className="text-xs text-[#4FA8E0] font-semibold block mb-1">
                Core Function &amp; Mechanism
              </span>
              <p className="text-sm text-[#F4F7FA] leading-relaxed">
                {selectedTool.description}
              </p>
            </div>

            {/* Role in Forecasting */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border mb-4">
              <span className="text-xs text-[#2ECC71] font-semibold block mb-1">
                Role in Weather Forecasting &amp; Early Warning
              </span>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                {selectedTool.roleInForecasting}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border">
              <span className="text-xs text-[#FFB703] font-semibold block mb-2">
                Technical Sensor &amp; Operating Specifications
              </span>
              <ul className="flex flex-col gap-1.5 text-xs text-[#8A94A6]">
                {selectedTool.specifications.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#FFB703]">•</span>
                    <span className="text-[#F4F7FA]">{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Metric Card */}
          <div className="bg-[#0F141A] p-4 rounded-lg card-border flex justify-between items-center">
            <span className="text-xs text-[#8A94A6] font-semibold">
              {selectedTool.keyMetricLabel}
            </span>
            <span className="text-base font-bold text-[#4FA8E0]">
              {selectedTool.keyMetricValue}
            </span>
          </div>
        </div>

        {/* Right Interactive Instrument Simulation Sandbox (Span 5) */}
        <div className="lg:col-span-5 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col justify-between gap-6">
          <div>
            <div className="pb-3 border-b border-[rgba(225,230,235,0.12)] mb-4 flex justify-between items-center">
              <h4 className="font-h4 text-xs text-[#FFFFFF] font-semibold">
                Interactive Instrument Simulator
              </h4>
              <span className="text-xs text-[#4FA8E0] font-semibold">
                Real-time Physics
              </span>
            </div>

            {/* Anemometer Simulator (Spinning Cups) */}
            {selectedTool.id === 'anemometers' && (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Rotating 3-Cup Anemometer Animation */}
                  <div
                    className="w-32 h-32 rounded-full border-2 border-dashed border-[#4FA8E0]/40 flex items-center justify-center transition-all"
                    style={{
                      animation: `spin ${Math.max(0.2, 50 / (interactiveWindSpeed || 1))}s linear infinite`,
                    }}
                  >
                    <div className="absolute w-full h-1 bg-[#4FA8E0]/80"></div>
                    <div className="absolute h-full w-1 bg-[#4FA8E0]/80"></div>
                    {/* Anemometer Cup 1 */}
                    <div className="absolute top-0 w-6 h-6 rounded-full bg-[#0B72B9] shadow-lg"></div>
                    {/* Anemometer Cup 2 */}
                    <div className="absolute bottom-0 w-6 h-6 rounded-full bg-[#0B72B9] shadow-lg"></div>
                    {/* Anemometer Cup 3 */}
                    <div className="absolute right-0 w-6 h-6 rounded-full bg-[#0B72B9] shadow-lg"></div>
                  </div>
                  {/* Center Hub */}
                  <div className="absolute w-8 h-8 rounded-full bg-[#0F141A] border-2 border-[#4FA8E0] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
                  </div>
                </div>

                {/* Speed Slider */}
                <div className="w-full bg-[#0F141A] p-4 rounded-lg card-border">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#8A94A6]">Simulate Wind Velocity</span>
                    <span className="text-[#4FA8E0] font-bold">{interactiveWindSpeed} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={interactiveWindSpeed}
                    onChange={(e) => setInteractiveWindSpeed(Number(e.target.value))}
                    className="w-full accent-[#0B72B9] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#8A94A6] mt-1">
                    <span>Calm (0)</span>
                    <span>Gale (60)</span>
                    <span>Storm (120)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Barometer Simulator (Aneroid Dial) */}
            {selectedTool.id === 'barometers' && (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative w-44 h-44 rounded-full bg-[#0F141A] border-4 border-[#242F3D] flex items-center justify-center shadow-2xl">
                  {/* Dial Marks */}
                  <span className="absolute top-2 text-[10px] text-[#8A94A6]">1013 hPa</span>
                  <span className="absolute bottom-2 text-[10px] text-[#8A94A6]">Standard</span>
                  <span className="absolute left-2 text-[10px] text-[#E74C3C]">Storm 980</span>
                  <span className="absolute right-2 text-[10px] text-[#2ECC71]">Clear 1040</span>

                  {/* Needle Pointer */}
                  <div
                    className="w-1 h-20 bg-[#4FA8E0] origin-bottom rounded-full transition-transform duration-300"
                    style={{
                      transform: `rotate(${((interactivePressure - 1013) / 60) * 120}deg)`,
                      transformOrigin: 'bottom center',
                    }}
                  ></div>
                  <div className="absolute w-4 h-4 rounded-full bg-[#FFFFFF] border-2 border-[#0F141A]"></div>
                </div>

                <div className="w-full bg-[#0F141A] p-4 rounded-lg card-border">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#8A94A6]">Atmospheric Pressure</span>
                    <span className="text-[#4FA8E0] font-bold">{interactivePressure} hPa</span>
                  </div>
                  <input
                    type="range"
                    min="960"
                    max="1050"
                    value={interactivePressure}
                    onChange={(e) => setInteractivePressure(Number(e.target.value))}
                    className="w-full accent-[#0B72B9] cursor-pointer"
                  />
                  <p className="text-xs text-[#FFB703] mt-2 text-center">
                    {interactivePressure < 1000
                      ? '⚠️ Rapid low pressure: Heavy storm / cyclonic surge likely'
                      : interactivePressure > 1020
                      ? '☀️ High anticyclonic pressure: Clear, dry, stable skies'
                      : '⛅ Normal maritime standard atmospheric boundary'}
                  </p>
                </div>
              </div>
            )}

            {/* Hygrometer Simulator */}
            {selectedTool.id === 'hygrometers' && (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-full bg-[#0F141A] p-4 rounded-lg card-border flex flex-col items-center">
                  <div className="w-24 h-44 bg-[#0F141A] rounded-full border-2 border-[#4FA8E0] relative overflow-hidden flex flex-col justify-end p-1">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-[#0B72B9] to-[#4FA8E0] transition-all duration-300"
                      style={{ height: `${interactiveHumidity}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white drop-shadow">
                      {interactiveHumidity}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#0F141A] p-4 rounded-lg card-border">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#8A94A6]">Relative Humidity (RH)</span>
                    <span className="text-[#4FA8E0] font-bold">{interactiveHumidity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={interactiveHumidity}
                    onChange={(e) => setInteractiveHumidity(Number(e.target.value))}
                    className="w-full accent-[#0B72B9] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Satellite, Doppler & Radiosonde Visualizer */}
            {(selectedTool.id === 'weather-satellites' ||
              selectedTool.id === 'doppler-radar' ||
              selectedTool.id === 'radiosondes') && (
              <div className="bg-[#0F141A] p-4 rounded-lg card-border flex flex-col items-center gap-3">
                <div className="w-full h-44 rounded-lg bg-[#0F141A] card-border flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-[#0B72B9]/20 to-transparent animate-pulse"></div>
                  <span className="material-symbols-outlined text-[64px] text-[#4FA8E0] drop-shadow-xl animate-bounce">
                    {selectedTool.icon}
                  </span>
                  <div className="absolute bottom-2 right-2 text-xs text-[#2ECC71] bg-black/60 px-2 py-0.5 rounded font-semibold border border-[#2ECC71]/30">
                    Live Active Telemetry
                  </div>
                </div>
                <p className="text-xs text-[#8A94A6] text-center">
                  Calibrated across IMD high-resolution numerical weather models (WRF &amp; GFS).
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#0F141A] rounded-lg card-border text-center">
            <span className="text-[11px] text-[#8A94A6] font-semibold block mb-0.5">
              Instrument Compliance
            </span>
            <p className="text-xs text-[#2ECC71] font-semibold">
              WMO (World Meteorological Organization) Standard Certified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
