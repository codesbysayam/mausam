import React, { useState } from 'react';
import { CurrentWeather, HourlyForecastItem, DailyForecastItem, WeatherAlert } from '../../types';
import {
  UserPersona,
  PERSONA_CONFIGS,
  buildHumanWeatherStory,
} from '../../services/humanWeatherEngine';
import {
  HeartPulse,
  Activity,
  Car,
  Users,
  Wheat,
  Briefcase,
  PartyPopper,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ForecastPersonalizedSectionProps {
  weather: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts?: WeatherAlert[];
}

export const ForecastPersonalizedSection: React.FC<ForecastPersonalizedSectionProps> = ({
  weather,
  hourly,
  daily,
  alerts = [],
}) => {
  const [activePersona, setActivePersona] = useState<UserPersona>('fitness');

  const story = buildHumanWeatherStory(weather, hourly, daily, alerts, activePersona);

  const personas: Array<{ id: UserPersona; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'fitness', label: 'Fitness & Sports', icon: Activity },
    { id: 'health', label: 'Health & Respiratory', icon: HeartPulse },
    { id: 'travel', label: 'Travel & Highways', icon: Car },
    { id: 'family', label: 'Family & Seniors', icon: Users },
    { id: 'agriculture', label: 'Agriculture & Crops', icon: Wheat },
    { id: 'commuting', label: 'Daily Commute', icon: Briefcase },
    { id: 'events', label: 'Events & Outdoors', icon: PartyPopper },
  ];

  return (
    <div
      id="forecast-personalized-intelligence"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col gap-4"
    >
      {/* Header & Persona Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center border border-[#22C7A0]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F4F7FA] tracking-tight">
              Personalized Weather Interpretation
            </h3>
            <p className="text-[11px] text-[#93A4B8]">
              Context-tailored atmospheric intelligence configured to your daily lifestyle
            </p>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {personas.map((p) => {
            const isSelected = activePersona === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePersona(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1499E8] text-white border-[#1499E8] shadow-md shadow-[#1499E8]/30 font-bold'
                    : 'bg-[#071018] text-[#93A4B8] border-[#162331] hover:text-[#F4F7FA] hover:bg-[#111F30]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Persona Adaptive Interpretation Panel */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fade-in">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${story.personaAdvice.badgeColor}`}>
              {story.personaAdvice.badge}
            </span>
            <span className="text-xs font-bold font-mono text-[#F4F7FA]">
              {story.personaAdvice.highlight}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#D1DCE8] leading-relaxed mt-1">
            {story.personaAdvice.advice}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-[#93A4B8] mt-1">
            <Info className="w-3.5 h-3.5 text-[#1499E8] shrink-0" />
            <span>{story.recommendedAction}</span>
          </div>
        </div>

        {/* Tailored Metric Highlights for this persona */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {activePersona === 'fitness' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Heat Stress</span>
              <span className="text-sm font-bold font-mono text-[#22C7A0] mt-0.5">
                {(weather.feelsLike || 28) >= 36 ? 'Elevated' : 'Optimal'}
              </span>
            </div>
          )}

          {activePersona === 'health' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Air Index</span>
              <span className="text-sm font-bold font-mono text-[#22C7A0] mt-0.5">
                AQI {weather.aqi || 68}
              </span>
            </div>
          )}

          {activePersona === 'travel' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Road Spray</span>
              <span className="text-sm font-bold font-mono text-[#43C7F4] mt-0.5">
                {(weather.precipitationProbability || 20) >= 50 ? 'Moderate' : 'Low'}
              </span>
            </div>
          )}

          {activePersona === 'agriculture' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Irrigation</span>
              <span className="text-sm font-bold font-mono text-[#22C7A0] mt-0.5">
                {(weather.precipitationProbability || 20) >= 60 ? 'Pause' : 'Regular'}
              </span>
            </div>
          )}

          {activePersona === 'commuting' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Rain Gear</span>
              <span className="text-sm font-bold font-mono text-[#FFC857] mt-0.5">
                {(weather.precipitationProbability || 20) >= 40 ? 'Advised' : 'Optional'}
              </span>
            </div>
          )}

          {activePersona === 'family' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Sun Safety</span>
              <span className="text-sm font-bold font-mono text-[#FFC857] mt-0.5">
                {(weather.uvIndex || 6) >= 6 ? 'SPF 30+' : 'Standard'}
              </span>
            </div>
          )}

          {activePersona === 'events' && (
            <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col text-center min-w-[90px]">
              <span className="text-[9px] uppercase font-bold text-[#93A4B8]">Canopy Need</span>
              <span className="text-sm font-bold font-mono text-[#43C7F4] mt-0.5">
                {(weather.precipitationProbability || 20) >= 45 ? 'Recommended' : 'Low Risk'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
