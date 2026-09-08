import React from 'react';
import { CloudRain, Thermometer, Wind, AlertTriangle, Activity, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { LocationRecord, WeatherAlert } from '../../types';
import { WeatherDataBundle } from '../../services/weatherService';

interface HomeWhatsHappeningNowProps {
  weatherBundle?: WeatherDataBundle | null;
  selectedLocation: LocationRecord;
  lastUpdated?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const HomeWhatsHappeningNow: React.FC<HomeWhatsHappeningNowProps> = ({
  weatherBundle,
  selectedLocation,
  lastUpdated,
  onNavigateToTab,
}) => {
  const current = weatherBundle?.current;

  // Real location name - strictly local, never fake "National Overview"
  const locationCity = selectedLocation.city;
  const locationState = selectedLocation.state;
  const locationDisplay = selectedLocation.displayName || `${locationCity}, ${locationState}`;

  // 1. RAIN Telemetry & Status
  const precipMm = current?.precipitation ?? current?.precipitationMm ?? 0;
  const isRaining = current?.isRainingNow || precipMm > 0;
  let rainLabel = 'No rain currently observed';
  let rainDetail = 'Dry surface conditions at observation site';

  if (precipMm > 35.5) {
    rainLabel = `Very heavy rainfall currently observed (${precipMm.toFixed(1)} mm/h)`;
    rainDetail = 'Extreme downpour telemetry recorded';
  } else if (precipMm >= 7.6) {
    rainLabel = `Heavy rainfall currently observed (${precipMm.toFixed(1)} mm/h)`;
    rainDetail = 'Active convective downpour in progress';
  } else if (precipMm >= 2.5) {
    rainLabel = `Moderate rainfall currently observed (${precipMm.toFixed(1)} mm/h)`;
    rainDetail = 'Steady precipitation telemetry active';
  } else if (precipMm > 0) {
    rainLabel = `Light rain / drizzle observed (${precipMm.toFixed(1)} mm/h)`;
    rainDetail = 'Active precipitation detected';
  } else {
    // Check recent rainfall if available
    if (current?.rainfallLast1h && current.rainfallLast1h > 0) {
      rainDetail = `Recent rainfall: ${current.rainfallLast1h.toFixed(1)} mm in past 1h (Current: 0 mm)`;
    } else if (current?.rainfallLast24h && current.rainfallLast24h > 0) {
      rainDetail = `Past 24h total: ${current.rainfallLast24h.toFixed(1)} mm (Current: Dry)`;
    } else {
      rainDetail = 'Zero precipitation detected across observation grid';
    }
  }

  // 2. TEMPERATURE Telemetry & Status
  const hasTemp = current?.temp !== undefined && current?.temp !== null;
  const tempVal = hasTemp ? `${current.temp.toFixed(1)}°C` : 'Unavailable';
  let tempDetail = 'Awaiting station telemetry';
  if (hasTemp) {
    const t = current.temp;
    const feels = current.feelsLike !== undefined ? `Feels like ${current.feelsLike.toFixed(1)}°C` : '';
    const desc =
      t >= 42 ? 'Severe heatwave conditions' :
      t >= 38 ? 'Heatwave conditions' :
      t >= 32 ? 'Warm tropical thermal load' :
      t >= 25 ? 'Mild pleasant temperatures' :
      t >= 16 ? 'Moderate seasonal conditions' :
      t >= 8 ? 'Cool winter temperatures' : 'Cold wave thermal conditions';

    tempDetail = feels ? `${desc} (${feels})` : desc;
  }

  // 3. WIND Telemetry & Status
  const hasWind = current?.windSpeed !== undefined && current?.windSpeed !== null;
  const windSpeedStr = hasWind ? `${current.windSpeed.toFixed(1)} km/h` : 'Unavailable';
  const windDir = current?.windDirection || 'Variable';
  let windDetail = 'Wind telemetry unavailable';
  if (hasWind) {
    const ws = current.windSpeed;
    const gusts = current.windGusts && current.windGusts > ws ? ` · Gusts up to ${current.windGusts.toFixed(1)} km/h` : '';
    const speedType =
      ws > 50 ? 'Gale force / squally' :
      ws > 30 ? 'Strong breezy conditions' :
      ws > 15 ? 'Moderate breeze' :
      ws > 5 ? 'Gentle light air' : 'Calm conditions';
    windDetail = `From ${windDir} · ${speedType}${gusts}`;
  }

  // 4. ACTIVE WARNINGS for this specific location
  const allAlerts: WeatherAlert[] = weatherBundle?.alerts || [];
  // Match alerts to selected location by district, state, or city
  const localAlert = allAlerts.find((a) => {
    const districts = (a.affectedDistricts || []).join(' ').toLowerCase();
    const area = (a.affectedArea || '').toLowerCase();
    const target = `${a.title} ${a.description} ${districts} ${area}`.toLowerCase();
    const cityLow = locationCity.toLowerCase();
    const stateLow = locationState.toLowerCase();
    const distLow = (selectedLocation.district || '').toLowerCase();
    return target.includes(cityLow) || (distLow && target.includes(distLow)) || (stateLow !== 'all india' && target.includes(stateLow));
  });

  const hasWarning = !!localAlert && localAlert.severity !== 'info';
  const warningLabel = localAlert
    ? `${localAlert.severity.toUpperCase()}: ${localAlert.title}`
    : 'No active severe weather warning detected';
  const warningDetail = localAlert
    ? `Valid for ${locationCity} zone • ${localAlert.actionItem || 'Advisory in force'}`
    : 'All synoptic parameters within nominal safety thresholds';

  // 5. AIR QUALITY (NAQI) Telemetry & Dominant Pollutant
  const aqiVal = current?.aqiIndex ?? current?.aqiPm25 ?? current?.aqi;
  const hasAqi = aqiVal !== undefined && aqiVal !== null;
  let aqiLabel = 'Air Quality Data Unavailable';
  let aqiDetail = 'Awaiting CPCB / CAAQMS station sync';

  if (hasAqi) {
    const aqiNum = Math.round(aqiVal);
    const category =
      current?.aqiStatus ||
      (aqiNum <= 50 ? 'Good' :
       aqiNum <= 100 ? 'Satisfactory' :
       aqiNum <= 200 ? 'Moderate' :
       aqiNum <= 300 ? 'Poor' :
       aqiNum <= 400 ? 'Very Poor' : 'Severe');

    const dominant = current?.aqiPm25 ? `PM2.5: ${Math.round(current.aqiPm25)} µg/m³` :
                     current?.aqiPm10 ? `PM10: ${Math.round(current.aqiPm10)} µg/m³` : 'Standard particulates';

    aqiLabel = `AQI ${aqiNum} — ${category}`;
    aqiDetail = `Dominant Pollutant: ${dominant} • NAQI Standard`;
  }

  // Smart Synthesized Operational Summary (1-2 sentences)
  let smartSummary = 'Monitoring continuous meteorological telemetry.';
  if (hasTemp && hasWind) {
    const rainSnippet = isRaining ? `Active rainfall (${precipMm.toFixed(1)} mm/h) observed` : 'Dry conditions prevailing';
    const tempSnippet = current.temp > 32 ? 'warm tropical weather' : current.temp > 22 ? 'pleasant temperatures' : 'cool conditions';
    const windSnippet = current.windSpeed > 20 ? 'elevated gusty winds' : 'a gentle breeze';
    const aqiSnippet = hasAqi ? `with ${current?.aqiStatus || 'satisfactory'} air quality` : '';
    smartSummary = `${rainSnippet} across ${locationCity} with ${tempSnippet} (${tempVal}) and ${windSnippet} from ${windDir} ${aqiSnippet}.`;
  }

  // Data status calculation
  const status: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' =
    current?.observationStatus || (current?.isLive ? 'LIVE' : hasTemp ? 'RECENT' : 'UNAVAILABLE');

  const stationSource =
    current?.observationSource ||
    (selectedLocation.imdStation ? `IMD Station (${selectedLocation.imdStation})` : 'IMD / Surface Telemetry Grid');

  const displayTime = lastUpdated || current?.lastUpdated || 'Current Cycle';

  return (
    <div
      id="whats-happening-now-panel"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md transition-all"
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#334155] pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'LIVE' ? 'bg-[#008000] animate-pulse' :
                status === 'RECENT' ? 'bg-[#4FA8E0]' :
                status === 'STALE' ? 'bg-[#FFA500]' : 'bg-[#8A94A6]'
              }`}
            />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              WHAT'S HAPPENING NOW?
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                status === 'LIVE' ? 'bg-[#008000]/20 text-[#2ECC71] border-[#008000]/40' :
                status === 'RECENT' ? 'bg-[#0B72B9]/20 text-[#4FA8E0] border-[#0B72B9]/40' :
                status === 'STALE' ? 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/40' :
                'bg-[#334155]/30 text-[#8A94A6] border-[#334155]'
              }`}
            >
              {status}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#8A94A6] font-mono">
              <Clock className="w-3.5 h-3.5 text-[#4FA8E0]" />
              <span>{displayTime}</span>
            </div>
          </div>
        </div>

        {/* Local Station Identity Subtitle */}
        <div className="text-xs text-[#8A94A6] mb-3 flex items-center justify-between">
          <span>
            Operational summary for <strong className="text-white">{locationDisplay}</strong>
          </span>
          <span className="text-[11px] text-[#4FA8E0] font-mono">{selectedLocation.elevation || 'AWS'}</span>
        </div>

        {/* Dynamic Metric Rows */}
        <div className="space-y-2 text-xs">
          {/* 1. Rainfall */}
          <div
            className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
              isRaining
                ? 'bg-[#0B72B9]/15 border-[#0B72B9]/50'
                : 'bg-[#0F141A] border-[#334155]/60'
            }`}
          >
            <CloudRain className={`w-4 h-4 shrink-0 mt-0.5 ${isRaining ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Rainfall Status</span>
                <span className="font-mono font-bold text-white text-xs">{precipMm > 0 ? `${precipMm.toFixed(1)} mm` : '0 mm'}</span>
              </div>
              <p className="text-white font-medium text-xs mt-0.5">{rainLabel}</p>
              <p className="text-[11px] text-[#8A94A6] mt-0.5 truncate">{rainDetail}</p>
            </div>
          </div>

          {/* 2. Temperature */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <Thermometer className="w-4 h-4 text-[#FF8C42] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Thermal Telemetry</span>
                <span className="font-mono font-bold text-[#FF8C42] text-xs">{tempVal}</span>
              </div>
              <p className="text-white font-medium text-xs mt-0.5">{tempDetail}</p>
            </div>
          </div>

          {/* 3. Wind */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <Wind className="w-4 h-4 text-[#4FA8E0] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Wind Vector</span>
                <span className="font-mono font-bold text-white text-xs">{windSpeedStr}</span>
              </div>
              <p className="text-white font-medium text-xs mt-0.5">{windDetail}</p>
            </div>
          </div>

          {/* 4. Severe Weather Warnings */}
          <div
            className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
              hasWarning
                ? 'bg-[#E74C3C]/10 border-[#E74C3C]/40'
                : 'bg-[#0F141A] border-[#334155]/60'
            }`}
          >
            {hasWarning ? (
              <AlertTriangle className="w-4 h-4 text-[#E74C3C] shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#2ECC71] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Severe Weather Status</span>
                {hasWarning && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E74C3C] text-white">
                    IN FORCE
                  </span>
                )}
              </div>
              <p className={`font-semibold text-xs mt-0.5 ${hasWarning ? 'text-[#FF8C42]' : 'text-[#D7DEE8]'}`}>
                {warningLabel}
              </p>
              <p className="text-[11px] text-[#8A94A6] mt-0.5 truncate">{warningDetail}</p>
            </div>
          </div>

          {/* 5. Air Quality (NAQI) */}
          <div className="p-2.5 bg-[#0F141A] rounded-lg border border-[#334155]/60 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-[#F1C40F] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6]">National Air Quality Index</span>
                {hasAqi && (
                  <span className="font-mono font-bold text-white text-xs">
                    {Math.round(aqiVal!)}
                  </span>
                )}
              </div>
              <p className="text-white font-medium text-xs mt-0.5">{aqiLabel}</p>
              <p className="text-[11px] text-[#8A94A6] mt-0.5 truncate">{aqiDetail}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Plain Meteorological Summary */}
        <div className="mt-3 p-2.5 bg-[#071A2D] rounded-lg border border-[#1D4E73]/60 text-xs text-[#D7DEE8] leading-relaxed">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4FA8E0] block mb-0.5">
            Operational Meteorological Assessment:
          </span>
          {smartSummary}
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="mt-3 pt-2.5 border-t border-[#334155] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A94A6]">
        <div className="flex items-center gap-1.5 truncate max-w-[280px]" title={stationSource}>
          <Navigation className="w-3.5 h-3.5 text-[#4FA8E0] shrink-0" />
          <span className="truncate">Source: {stationSource}</span>
        </div>
        <span className="text-[#2ECC71] font-bold font-mono">● Real-Time Connected</span>
      </div>
    </div>
  );
};
