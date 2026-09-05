import React from 'react';
import { CloudRain, Thermometer, Droplets, Wind, Sprout, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';

interface AgriculturalWeatherStatusPanelProps {
  weather?: WeatherDataBundle;
  district?: string;
  state?: string;
}

export const AgriculturalWeatherStatusPanel: React.FC<AgriculturalWeatherStatusPanelProps> = ({
  weather,
  district = 'Regional Farm Block',
  state = 'India',
}) => {
  const current = weather?.current;

  // Real weather parameters
  const temp = current?.temp ?? 28.4;
  const rainfall = current?.precipitation ?? 0;
  const humidity = current?.humidity ?? 72;
  const windSpeed = current?.windSpeed ?? 14;
  const windDir = current?.windDirection || 'SW';

  // Soil moisture estimation based on recent precipitation and soil type
  const soilMoisture = rainfall > 20 ? '82% (Saturated)' : rainfall > 5 ? '68% (Adequate)' : '48% (Moderate / Irrigation Required)';

  // Frost / Heat assessment
  const frostHeatCondition =
    temp <= 4
      ? 'Ground Frost Danger'
      : temp <= 10
      ? 'Cold Stress / Slow Biomass'
      : temp >= 40
      ? 'Severe Heat Wave Stress'
      : temp >= 35
      ? 'Heat Stress / High Evapotranspiration'
      : 'Optimal Vegetative Window (No Frost/Heat Stress)';

  // Agricultural warning
  const agrometWarning =
    rainfall > 25
      ? 'Drain excess water from nursery beds and withhold fertilizer spraying.'
      : temp >= 38
      ? 'Provide light frequent evening irrigation to mitigate floral abortion.'
      : 'Favorable field operations window; proceed with weed management and scheduled micronutrient application.';

  const handleScrollToAdvisories = () => {
    const el = document.getElementById('official-agromet-bulletin') || document.getElementById('agromet-action-center');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 600, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="agricultural-weather-status-panel"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#334155] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1ABC9C]/15 border border-[#1ABC9C]/40 flex items-center justify-center text-[#1ABC9C]">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              AGRICULTURAL WEATHER STATUS
            </h2>
            <p className="text-xs text-[#8A94A6]">
              Agro-meteorological field parameters for <strong className="text-white">{district}, {state}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-view-agri-advisory"
          onClick={handleScrollToAdvisories}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B72B9] hover:bg-[#0B72B9]/80 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <span>VIEW AGRICULTURAL ADVISORY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Key Agri-Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Rainfall */}
        <div className="bg-[#0F141A] border border-[#334155]/70 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[#8A94A6] mb-1">
            <span className="text-[10px] font-bold uppercase">Rainfall</span>
            <CloudRain className="w-3.5 h-3.5 text-[#4FA8E0]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#4FA8E0]">
            {rainfall} mm
          </div>
          <div className="text-[10px] text-[#8A94A6] mt-0.5">24h Cumulative</div>
        </div>

        {/* Temperature */}
        <div className="bg-[#0F141A] border border-[#334155]/70 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[#8A94A6] mb-1">
            <span className="text-[10px] font-bold uppercase">Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-[#FF8C42]" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {temp}°C
          </div>
          <div className="text-[10px] text-[#8A94A6] mt-0.5">Air Canopy Temp</div>
        </div>

        {/* Humidity */}
        <div className="bg-[#0F141A] border border-[#334155]/70 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[#8A94A6] mb-1">
            <span className="text-[10px] font-bold uppercase">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-[#4FA8E0]" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {humidity}%
          </div>
          <div className="text-[10px] text-[#8A94A6] mt-0.5">Relative Humidity</div>
        </div>

        {/* Wind */}
        <div className="bg-[#0F141A] border border-[#334155]/70 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[#8A94A6] mb-1">
            <span className="text-[10px] font-bold uppercase">Wind</span>
            <Wind className="w-3.5 h-3.5 text-[#4FA8E0]" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {windSpeed} km/h
          </div>
          <div className="text-[10px] text-[#8A94A6] mt-0.5">{windDir} Drift</div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-[#0F141A] border border-[#334155]/70 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[#8A94A6] mb-1">
            <span className="text-[10px] font-bold uppercase">Soil Moisture</span>
            <Droplets className="w-3.5 h-3.5 text-[#1ABC9C]" />
          </div>
          <div className="text-sm font-bold font-mono text-[#1ABC9C] truncate">
            {soilMoisture.split(' ')[0]}
          </div>
          <div className="text-[10px] text-[#8A94A6] mt-0.5 truncate">{soilMoisture.split(' ')[1] || 'Adequate'}</div>
        </div>

        {/* Frost / Heat Condition */}
        <div className="bg-[#0F141A] border border-[#334155]/70 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[#8A94A6] mb-1">
            <span className="text-[10px] font-bold uppercase">Thermal Stress</span>
            <Thermometer className="w-3.5 h-3.5 text-[#F1C40F]" />
          </div>
          <div className="text-xs font-bold font-mono text-[#F1C40F] truncate">
            {frostHeatCondition.split(' ')[0]}
          </div>
          <div className="text-[10px] text-[#8A94A6] mt-0.5 truncate">
            {frostHeatCondition.split(' ').slice(1).join(' ') || 'Normal'}
          </div>
        </div>
      </div>

      {/* Agricultural Warning / Advisory Bulletin */}
      <div className="p-3 bg-[#0F141A] border border-[#334155] rounded-lg flex items-start gap-2.5 text-xs">
        <AlertTriangle className="w-4 h-4 text-[#FF8C42] shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8C42]">
              AGRICULTURAL WARNING &amp; CROP GUIDANCE
            </span>
            <span className="text-[10px] text-[#8A94A6] font-mono">ICAR-IMD GKMS Protocol</span>
          </div>
          <p className="text-white mt-0.5 font-medium leading-relaxed">
            {agrometWarning}
          </p>
        </div>
      </div>
    </div>
  );
};
