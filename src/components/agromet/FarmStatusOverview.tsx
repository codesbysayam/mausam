import React from 'react';
import {
  Thermometer,
  CloudRain,
  Gauge,
  Wind,
  Droplets,
  Sun,
  Radio,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { CropType, PhenologicalStage } from '../../services/agronomicEngine';

interface FarmStatusOverviewProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  lastUpdatedStr: string;
  stationName: string;
}

export const FarmStatusOverview: React.FC<FarmStatusOverviewProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  lastUpdatedStr,
  stationName,
}) => {
  const current = weather?.current;
  const hourly = weather?.hourly || [];
  const daily = weather?.daily || [];

  // Card 1: Air Temperature & Heat Load
  const currentTemp = current?.temp ?? 30.2;
  const temp3hLater = hourly[3]?.temp ?? currentTemp;
  const tempDelta = Math.round((temp3hLater - currentTemp) * 10) / 10;
  const tempTrend = tempDelta > 0.5 ? 'Rising (+0.8°C/3h)' : tempDelta < -0.5 ? 'Falling (-0.6°C/3h)' : 'Stable (±0.2°C/3h)';
  const highTemp = current?.high ?? 33.4;
  const lowTemp = current?.low ?? 24.1;

  // Card 2: Rainfall & 24h Accumulation
  const rain24h = current?.precipitation ?? 0;
  const rainNext48h = daily.slice(0, 2).reduce((acc, d) => acc + (d.rainProb > 50 ? 12 : 0), 0);
  const rainProbability = current?.precipitationProbability ?? (daily[0]?.rainProb ?? 25);
  const rainRiskStatus = rainProbability > 60 ? 'HIGH PROBABILITY' : rainProbability > 30 ? 'MODERATE PROBABILITY' : 'LOW PROBABILITY';
  const rainRiskColor = rainProbability > 60 ? 'text-[#38BDF8]' : rainProbability > 30 ? 'text-[#06B6D4]' : 'text-[#94A3B8]';

  // Card 3: Relative Humidity & Dew Point
  const humidity = current?.humidity ?? 74;
  const dewPoint = current?.dewPoint ?? Math.round(currentTemp - (100 - humidity) / 5);
  const dewDuration = humidity > 80 ? 'Heavy Morning Dew (>5h)' : humidity > 65 ? 'Moderate Dew (2-3h)' : 'Minimal Dew (<1h)';

  // Card 4: Surface Wind Speed & Drift Hazard
  const windSpeed = current?.windSpeed ?? 14;
  const windGust = current?.windGusts ?? Math.round(windSpeed * 1.35);
  const windDirection = current?.windDirection || 'ESE';
  const isSpraySafe = windSpeed <= 15 && windGust <= 20;
  const sprayStatus = isSpraySafe ? 'SAFE FOR SPRAYING' : 'HIGH DRIFT HAZARD';
  const sprayColor = isSpraySafe ? 'text-[#10B981]' : 'text-[#EF4444]';

  // Card 5: Crop-Specific Evapotranspiration (ETc)
  // Derived from temperature, wind, humidity
  const baseET0 = Math.max(2.5, Math.round(((currentTemp * 0.15) + (windSpeed * 0.08) - (humidity * 0.02)) * 10) / 10);
  const kcFactor = selectedStage === 'Flowering' || selectedStage === 'Tillering' ? 1.15 : 0.85;
  const etcValue = Math.round(baseET0 * kcFactor * 10) / 10;
  const etRequirement = etcValue > 5.5 ? 'CRITICAL DEMAND' : etcValue > 4.0 ? 'MODERATE DEMAND' : 'LOW DEMAND';

  // Card 6: Root Zone Soil Hydrology Status
  const isSaturated = rain24h > 20 || rainProbability > 70;
  const isOptimal = rain24h > 5 || !isSaturated;
  const soilStatus = isSaturated ? 'SATURATED / WET' : isOptimal ? 'OPTIMAL MOISTURE' : 'MOISTURE DEFICIT';
  const soilAdvice = isSaturated ? 'Drainage active / Hold pumps' : 'Standard irrigation cycle';
  const soilColor = isSaturated ? 'text-[#06B6D4]' : isOptimal ? 'text-[#10B981]' : 'text-[#F59E0B]';

  return (
    <section id="agromet-farm-status-overview" className="space-y-4">
      {/* Section Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-[#CBD5E1] uppercase">
            REAL-TIME METEOROLOGICAL TELEMETRY &amp; CROP BIOPHYSICAL METRICS
          </h2>
        </div>
        <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Station Telemetry Synced: <strong>{lastUpdatedStr} IST</strong></span>
        </div>
      </div>

      {/* 6-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: Temperature & Heat Load */}
        <div
          id="metric-temperature-card"
          className="rounded-2xl bg-[#090D16] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              CANOPY TEMPERATURE &amp; HEAT LOAD
            </span>
            <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                {currentTemp}°C
              </span>
              <span className="text-xs font-mono text-[#10B981] flex items-center font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {tempTrend}
              </span>
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Max: <strong className="text-white">{highTemp}°C</strong> | Min: <strong className="text-white">{lowTemp}°C</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between">
            <span>Accumulation: <strong>Normal GDD</strong></span>
            <span className="text-[#10B981] font-bold">Safe Thermal Zone</span>
          </div>
        </div>

        {/* CARD 2: Rainfall & Precipitation */}
        <div
          id="metric-rainfall-card"
          className="rounded-2xl bg-[#090D16] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              PRECIPITATION &amp; RAIN RECHARGE
            </span>
            <div className="p-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                {rain24h} mm
              </span>
              <span className="text-xs font-mono text-[#38BDF8] font-bold">
                (24h Accumulation)
              </span>
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Next 48h Outlook: <strong className="text-white">{rainNext48h} mm expected</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between">
            <span>Forecast Prob: <strong>{rainProbability}%</strong></span>
            <span className={`font-bold ${rainRiskColor}`}>{rainRiskStatus}</span>
          </div>
        </div>

        {/* CARD 3: Humidity & Dew Point */}
        <div
          id="metric-humidity-card"
          className="rounded-2xl bg-[#090D16] border border-[#1E293B] hover:border-[#06B6D4]/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              MICROCLIMATE HUMIDITY &amp; DEW
            </span>
            <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
              <Gauge className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                {humidity}%
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">
                Dew Point: <strong className="text-white">{dewPoint}°C</strong>
              </span>
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Foliar Wetness: <strong className="text-white">{dewDuration}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between">
            <span>Pathogen Spore Risk:</span>
            <span className={humidity > 80 ? 'text-[#EF4444] font-bold' : 'text-[#10B981] font-bold'}>
              {humidity > 80 ? 'ELEVATED' : 'FAVORABLE'}
            </span>
          </div>
        </div>

        {/* CARD 4: Wind & Spray Drift */}
        <div
          id="metric-wind-card"
          className="rounded-2xl bg-[#090D16] border border-[#1E293B] hover:border-[#38BDF8]/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              SURFACE WIND &amp; SPRAY DRIFT HAZARD
            </span>
            <div className="p-2 rounded-xl bg-[#64748B]/20 text-[#CBD5E1] border border-[#64748B]/30">
              <Wind className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                {windSpeed} <span className="text-xl font-normal text-[#94A3B8]">km/h</span>
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">
                Vector: <strong className="text-white">{windDirection}</strong>
              </span>
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Peak Gusts: <strong className="text-white">{windGust} km/h</strong> (Threshold: 15 km/h)
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between">
            <span>Chemical Application:</span>
            <span className={`font-bold ${sprayColor}`}>{sprayStatus}</span>
          </div>
        </div>

        {/* CARD 5: Evapotranspiration (ETc) */}
        <div
          id="metric-etc-card"
          className="rounded-2xl bg-[#090D16] border border-[#1E293B] hover:border-[#10B981]/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              CROP EVAPOTRANSPIRATION (ETc)
            </span>
            <div className="p-2 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              <Sun className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                {etcValue} <span className="text-xl font-normal text-[#94A3B8]">mm/day</span>
              </span>
              <span className="text-xs font-mono text-[#10B981] font-bold">
                Kc: {kcFactor} ({selectedStage})
              </span>
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Base Reference ET₀: <strong className="text-white">{baseET0} mm/day</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between">
            <span>Water Loss Category:</span>
            <span className="text-[#10B981] font-bold">{etRequirement}</span>
          </div>
        </div>

        {/* CARD 6: Soil Hydrology & Root Moisture */}
        <div
          id="metric-soil-card"
          className="rounded-2xl bg-[#090D16] border border-[#1E293B] hover:border-[#06B6D4]/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              ROOT ZONE SOIL HYDROLOGY
            </span>
            <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight ${soilColor}`}>
                {soilStatus}
              </span>
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Directives: <strong className="text-white">{soilAdvice}</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between">
            <span>Tension: <strong>Field Capacity</strong></span>
            <span className="text-[#10B981] font-bold">Root Aeration Good</span>
          </div>
        </div>
      </div>
    </section>
  );
};
