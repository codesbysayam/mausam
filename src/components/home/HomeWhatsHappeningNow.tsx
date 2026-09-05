import React from 'react';
import { CloudRain, Thermometer, Wind, AlertTriangle, Activity, Clock } from 'lucide-react';
import { LocationRecord } from '../../types';
import { WeatherDataBundle } from '../../services/weatherService';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

interface HomeWhatsHappeningNowProps {
  weatherBundle?: WeatherDataBundle | null;
  selectedLocation?: LocationRecord | null;
  lastUpdated?: string;
}

export const HomeWhatsHappeningNow: React.FC<HomeWhatsHappeningNowProps> = ({
  weatherBundle,
  selectedLocation,
  lastUpdated,
}) => {
  const current = weatherBundle?.current;

  // Find location-specific or synoptic match
  const locationName = selectedLocation?.name || 'National Overview';
  const matchedState = INDIA_WEATHER_DATA.find(
    (s) =>
      s.name.toLowerCase().includes(locationName.toLowerCase()) ||
      (s.city && locationName.toLowerCase().includes(s.city.toLowerCase()))
  ) || INDIA_WEATHER_DATA[0];

  // Actual values or source data
  const tempVal = current?.temp ?? matchedState?.temperature;
  const tempStatus = tempVal !== undefined
    ? `${tempVal}°C — ${tempVal > 35 ? 'High thermal stress' : tempVal > 28 ? 'Warm tropical conditions' : 'Mild seasonal temperatures'}`
    : 'Data unavailable';

  const rainVal = current?.precipitation ?? matchedState?.rainfall ?? 0;
  const rainStatus = rainVal > 0
    ? `${rainVal} mm active precipitation detected`
    : 'No active rainfall at observation site (Dry conditions)';

  const windVal = current?.windSpeed ?? matchedState?.windSpeed;
  const windDir = current?.windDirection || matchedState?.windDir || 'SW';
  const windStatus = windVal !== undefined
    ? `${windVal} km/h from ${windDir} — ${windVal > 30 ? 'Squally & gusty' : 'Gentle to moderate breeze'}`
    : 'Data unavailable';

  const warnStatus = matchedState?.warningLevel && matchedState.warningLevel !== 'normal'
    ? `${matchedState.warningLevel.toUpperCase()}: ${matchedState.warningMessage || 'Advisory in force'}`
    : 'No severe weather warning in force for immediate zone';

  const aqiVal = current?.aqi ?? matchedState?.aqi;
  const aqiStatus = aqiVal !== undefined
    ? `${aqiVal} AQI (${aqiVal <= 50 ? 'Good' : aqiVal <= 100 ? 'Satisfactory' : aqiVal <= 200 ? 'Moderate' : 'Poor'})`
    : 'Data unavailable';

  const displayTime = lastUpdated || matchedState?.updatedAt || '21:03 IST';

  return (
    <div
      id="whats-happening-now-panel"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md"
    >
      <div>
        <div className="flex items-center justify-between border-b border-[#334155] pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B72B9] animate-pulse"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              WHAT'S HAPPENING NOW?
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#4FA8E0]" />
            <span>{displayTime}</span>
          </div>
        </div>

        <div className="text-xs text-[#8A94A6] mb-3">
          Operational summary for <strong className="text-white">{locationName}</strong>:
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Rainfall */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <CloudRain className="w-4 h-4 text-[#4FA8E0] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">🌧 Rainfall:</span>
              <span className="text-white font-medium">{rainStatus}</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <Thermometer className="w-4 h-4 text-[#FF8C42] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">🌡 Temperature:</span>
              <span className="text-white font-medium">{tempStatus}</span>
            </div>
          </div>

          {/* Wind */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <Wind className="w-4 h-4 text-[#4FA8E0] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">💨 Wind:</span>
              <span className="text-white font-medium">{windStatus}</span>
            </div>
          </div>

          {/* Warnings */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${matchedState?.warningLevel && matchedState.warningLevel !== 'normal' ? 'text-[#E74C3C]' : 'text-[#2ECC71]'}`} />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">⚠ Warnings:</span>
              <span className={`font-medium ${matchedState?.warningLevel && matchedState.warningLevel !== 'normal' ? 'text-[#FF8C42]' : 'text-[#D7DEE8]'}`}>
                {warnStatus}
              </span>
            </div>
          </div>

          {/* Air Quality */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-[#F1C40F] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">🌫 Air Quality:</span>
              <span className="text-white font-medium">{aqiStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#334155] flex items-center justify-between text-[11px] text-[#8A94A6]">
        <span>Station Network: IMD Synoptic AWS</span>
        <span className="text-[#2ECC71] font-bold">● Active Telemetry</span>
      </div>
    </div>
  );
};
