import React, { useState } from 'react';
import {
  CurrentWeather,
  HourlyForecastItem,
  WeatherAlert,
} from '../../types';
import {
  WeatherDecisionEngine,
  DecisionItem,
} from '../../services/weatherDecisionEngine';
import {
  CheckCircle2,
  AlertTriangle,
  Umbrella,
  Flame,
  Activity,
  Car,
  Bike,
  Footprints,
  CloudLightning,
  Wind,
  Shield,
  HeartPulse,
  Compass,
  Clock,
  Eye,
  Sun,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface WeatherDecisionCenterProps {
  weather: CurrentWeather;
  hourly?: HourlyForecastItem[];
  alerts?: WeatherAlert[];
}

export const WeatherDecisionCenter: React.FC<WeatherDecisionCenterProps> = ({
  weather,
  hourly = [],
  alerts = [],
}) => {
  const [activeTab, setActiveTab] = useState<'decision' | 'travel' | 'health'>('decision');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const decisions = WeatherDecisionEngine.generateWhatShouldIDoNow(weather, hourly, alerts);
  const travel = WeatherDecisionEngine.generateTravelConditions(weather, hourly);
  const health = WeatherDecisionEngine.generateHealthWeather(weather);

  const getIconForCategory = (key: string) => {
    switch (key) {
      case 'outdoor_activity':
        return <Activity className="w-4 h-4 text-[#38BDF8]" />;
      case 'running_walking':
        return <Footprints className="w-4 h-4 text-[#10B981]" />;
      case 'travel_commuting':
        return <Compass className="w-4 h-4 text-[#F59E0B]" />;
      case 'driving_conditions':
        return <Car className="w-4 h-4 text-[#60A5FA]" />;
      case 'rain_protection':
        return <Umbrella className="w-4 h-4 text-[#818CF8]" />;
      case 'heat_exposure':
        return <Flame className="w-4 h-4 text-[#F87171]" />;
      case 'uv_exposure':
        return <Sun className="w-4 h-4 text-[#FBBF24]" />;
      case 'thunderstorm_safety':
        return <CloudLightning className="w-4 h-4 text-[#EF4444]" />;
      case 'visibility_risk':
        return <Eye className="w-4 h-4 text-[#A78BFA]" />;
      case 'flood_waterlogging':
        return <Shield className="w-4 h-4 text-[#06B6D4]" />;
      case 'air_quality_exposure':
        return <HeartPulse className="w-4 h-4 text-[#34D399]" />;
      default:
        return <Info className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  return (
    <div
      id="weather-decision-center"
      className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Header with Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1F2937] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#0F172A] border border-[#38BDF8]/30 text-[#38BDF8]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
              WEATHER DECISION & ADVISORY CENTER
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                FACTUAL GUIDANCE
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Automated operational advisories computed strictly from real-time surface parameters
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#0B1320] p-1 rounded-lg border border-[#1F2937] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('decision')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'decision'
                ? 'bg-[#1E293B] text-white shadow-xs border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            What Should I Do Now?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('travel')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'travel'
                ? 'bg-[#1E293B] text-white shadow-xs border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Travel & Roads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'health'
                ? 'bg-[#1E293B] text-white shadow-xs border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            Health & Exposure
          </button>
        </div>
      </div>

      {/* TAB 1: What Should I Do Now? */}
      {activeTab === 'decision' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {decisions.map((item) => {
              const isExpanded = expandedCard === item.key;
              return (
                <div
                  key={item.key}
                  id={`decision-card-${item.key}`}
                  className="bg-[#0B1320] border border-[#1E293B] hover:border-[#334155] rounded-lg p-3.5 flex flex-col justify-between gap-2.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getIconForCategory(item.key)}
                      <span className="text-xs font-bold text-[#E2E8F0] tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${item.badgeColor}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {item.recommendation}
                  </p>

                  <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span className="truncate">Basis: <strong className="text-[#E2E8F0]">{item.basisValue}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Travel & Commuter Center */}
      {activeTab === 'travel' && (
        <div className="space-y-3">
          <div className="bg-[#0B1320] border border-[#1E293B] rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-2.5">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#60A5FA]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  HIGHWAY & COMMUTER CONDITIONS MONITOR
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
                <Clock className="w-3.5 h-3.5" />
                <span>Best Window: <strong>{travel.bestTravelWindow}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="bg-[#111827] p-2.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Road Surface</div>
                <div className="text-xs font-bold text-white mt-0.5">{travel.roadCondition}</div>
              </div>
              <div className="bg-[#111827] p-2.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Atmospheric Visibility</div>
                <div className="text-xs font-bold text-white mt-0.5">{travel.visibilityStatus}</div>
              </div>
              <div className="bg-[#111827] p-2.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Fog Status</div>
                <div className="text-xs font-bold text-white mt-0.5">{travel.fogStatus}</div>
              </div>
              <div className="bg-[#111827] p-2.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Wind Crosswinds</div>
                <div className="text-xs font-bold text-white mt-0.5">{travel.windStatus}</div>
              </div>
              <div className="bg-[#111827] p-2.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Waterlogging / Flood</div>
                <div className="text-xs font-bold text-white mt-0.5">{travel.floodRisk}</div>
              </div>
              <div className="bg-[#111827] p-2.5 rounded border border-[#1F2937]">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Convective Storms</div>
                <div className="text-xs font-bold text-white mt-0.5">{travel.thunderstormRisk}</div>
              </div>
            </div>

            <div className="p-3 bg-[#111827]/80 rounded border border-[#334155] text-xs text-[#CBD5E1] flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Official Commuter Directive: </strong>
                {travel.advisoryNote}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Health & Physiological Weather */}
      {activeTab === 'health' && (
        <div className="space-y-3">
          <div className="bg-[#0B1320] border border-[#1E293B] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2.5">
              <HeartPulse className="w-4 h-4 text-[#F43F5E]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                HEALTH & PHYSIOLOGICAL STRESS INDEX
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#111827] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div className="text-[10px] text-[#94A3B8] font-bold uppercase">Heat Index / Wet-Bulb</div>
                <div className="text-base font-extrabold text-[#F87171]">
                  {health.heatIndexC}°C
                  <span className="text-xs font-normal text-[#94A3B8] ml-1.5">({health.heatStressCategory})</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-tight">
                  Perceived body heating combining dry-bulb ambient temperature and relative humidity.
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div className="text-[10px] text-[#94A3B8] font-bold uppercase">Humidex Discomfort</div>
                <div className="text-base font-extrabold text-[#FBBF24]">
                  {health.humidexValue}
                  <span className="text-xs font-normal text-[#94A3B8] ml-1.5">({health.humidityDiscomfort})</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-tight">
                  Evaluates difficulty of sweat evaporation and metabolic cooling efficiency.
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div className="text-[10px] text-[#94A3B8] font-bold uppercase">UV Solar Radiation</div>
                <div className="text-base font-extrabold text-[#C084FC]">
                  {weather.uvIndex}
                  <span className="text-xs font-normal text-[#94A3B8] ml-1.5">({health.uvRiskLevel})</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-tight">
                  Solar erythemal index. Peak ultraviolet intensity occurs around 11:30 - 14:00 IST.
                </p>
              </div>

              <div className="bg-[#111827] p-3 rounded-lg border border-[#1F2937] space-y-1">
                <div className="text-[10px] text-[#94A3B8] font-bold uppercase">Respiratory & Particulate Risk</div>
                <div className="text-base font-extrabold text-[#34D399]">
                  AQI {weather.aqi || weather.aqiIndex || 50}
                  <span className="text-xs font-normal text-[#94A3B8] ml-1.5">({health.airQualityExposure})</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-tight">
                  Fine inhalable particulate PM2.5 at {weather.aqiPm25} µg/m³.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-[#94A3B8] bg-[#0F172A] p-2.5 rounded border border-[#1E293B] flex items-center justify-between">
              <span>Guidance based on WHO and IMD physiological thresholds. Consult medical professionals for clinical conditions.</span>
              <span className="text-[#38BDF8] font-semibold shrink-0">Source: Open-Meteo & CPCB Ground Sensors</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
