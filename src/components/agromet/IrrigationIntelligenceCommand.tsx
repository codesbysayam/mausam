import React from 'react';
import {
  Droplets,
  CloudRain,
  Thermometer,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
  Waves,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { CropType, PhenologicalStage, getCropPhenologyProfile } from '../../services/agronomicEngine';

interface IrrigationIntelligenceCommandProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const IrrigationIntelligenceCommand: React.FC<IrrigationIntelligenceCommandProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const current = weather?.current;
  const temp = current?.temp ?? 30;
  const humidity = current?.humidity ?? 70;
  const rain24h = current?.precipitation ?? 0;
  const rainProb = current?.precipitationProbability ?? (weather?.daily?.[0]?.rainProb ?? 25);
  const forecastRainDay1 = (weather?.daily?.[0]?.rainProb ?? 0) > 50 ? 12 : 0;
  const forecastRainDay2 = (weather?.daily?.[1]?.rainProb ?? 0) > 50 ? 8 : 0;
  const totalForecastRain = Math.round((forecastRainDay1 + forecastRainDay2) * 10) / 10;

  const profile = getCropPhenologyProfile(selectedCrop, selectedStage, weather);
  const etDemand = profile.criticalETdemandMm;

  // Hydrological Status Calculation
  const isWet = rain24h > 15 || totalForecastRain > 15 || rainProb > 60;
  const isMoist = rain24h > 5 || totalForecastRain > 5;

  let decisionState: 'DEFER IRRIGATION' | 'PROCEED WITH IRRIGATION' | 'LIGHT DEFICIT SUPPLEMENT' = 'PROCEED WITH IRRIGATION';
  let decisionBg = 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]';
  let decisionReason = `Standard irrigation rotation recommended to meet ${etDemand} mm/day evapotranspiration demand for ${selectedCrop}.`;
  let pumpWindow = '05:30 – 08:30 IST / 17:00 – 19:00 IST';

  if (isWet) {
    decisionState = 'DEFER IRRIGATION';
    decisionBg = 'bg-[#06B6D4]/15 border-[#06B6D4]/30 text-[#06B6D4]';
    decisionReason = `Natural precipitation (${rain24h} mm observed, ${totalForecastRain} mm forecast) adequately satisfies root-zone moisture tension. Suspend tubewell pumps to conserve energy and avoid waterlogging.`;
    pumpWindow = 'Pumps Powered Down / Hold for 48 Hours';
  } else if (isMoist) {
    decisionState = 'LIGHT DEFICIT SUPPLEMENT';
    decisionBg = 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]';
    decisionReason = `Moderate soil moisture available. Apply short cycle drip irrigation only if topsoil tension indicates drying.`;
    pumpWindow = 'Short 45-min morning cycle (06:00 – 07:00 IST)';
  }

  const soilMoistureEst = Math.min(95, Math.max(35, Math.round(55 + (rain24h * 1.5) - (temp - 25) * 0.8)));

  return (
    <section
      id="agromet-irrigation-intelligence"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              PRECISION IRRIGATION &amp; SOIL HYDROLOGY COMMAND
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Evapotranspiration balancing &amp; pump scheduling decision support for {selectedCrop} ({selectedStage}) in {district}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${decisionBg}`}>
          <Waves className="w-4 h-4" />
          <span>{decisionState}</span>
        </div>
      </div>

      {/* 2-Column Hydrology & Recommendation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 4 Data Telemetry Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3.5">
          {/* Tile 1: 24h & Cumulative Precip */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block">
              PRECIPITATION RECHARGE
            </span>
            <div className="text-xl font-black font-mono text-white">
              {rain24h} mm <span className="text-xs text-[#38BDF8] font-normal">(24h)</span>
            </div>
            <div className="text-[11px] font-mono text-[#38BDF8]">
              48h Forecast: {totalForecastRain} mm
            </div>
          </div>

          {/* Tile 2: Root Zone Soil Moisture */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block">
              SOIL MOISTURE STATUS
            </span>
            <div className="text-xl font-black font-mono text-[#10B981]">
              {soilMoistureEst}%
            </div>
            <div className="text-[11px] font-mono text-[#94A3B8]">
              Status: {soilMoistureEst > 80 ? 'Saturated / Adequate' : 'Field Capacity'}
            </div>
          </div>

          {/* Tile 3: Evapotranspiration (ET) */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block">
              CROP ET DEMAND (ETc)
            </span>
            <div className="text-xl font-black font-mono text-white">
              {etDemand} mm/day
            </div>
            <div className="text-[11px] font-mono text-[#64748B]">
              Stage: {profile.waterRequirement} Demand
            </div>
          </div>

          {/* Tile 4: Atmosphere Moisture */}
          <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider block">
              MICROCLIMATE VAPOR DEFICIT
            </span>
            <div className="text-xl font-black font-mono text-white">
              {humidity}% RH
            </div>
            <div className="text-[11px] font-mono text-[#64748B]">
              Ambient Temp: {temp}°C
            </div>
          </div>
        </div>

        {/* Right: Operational Decision & Pumping Schedule */}
        <div className="lg:col-span-5 rounded-xl bg-[#0F172A] border border-[#1E293B] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span>Operational Guidance &amp; Scheduling</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {decisionReason}
            </p>
          </div>

          <div className="bg-[#090D16] border border-[#1E293B] rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
              Recommended Pump Schedule:
            </span>
            <div className="text-xs font-mono font-bold text-[#38BDF8] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{pumpWindow}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
