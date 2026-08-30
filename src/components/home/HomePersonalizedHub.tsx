import React, { useState } from 'react';
import { CurrentWeather, DailyForecastItem, HourlyForecastItem, WeatherAlert } from '../../types';
import { UserPersona, PERSONA_CONFIGS, buildHumanWeatherStory } from '../../services/humanWeatherEngine';
import {
  Users,
  Activity,
  Bike,
  Plane,
  Heart,
  Sprout,
  Car,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Waves,
} from 'lucide-react';

interface HomePersonalizedHubProps {
  weather: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: WeatherAlert[];
  onNavigateToWeather?: () => void;
}

const PERSONA_ICONS: Record<UserPersona, React.FC<{ className?: string }>> = {
  general: Users,
  health: Heart,
  fitness: Bike,
  travel: Plane,
  family: Users,
  agriculture: Sprout,
  commuting: Car,
  events: CalendarDays,
  beach: Waves,
};

export const HomePersonalizedHub: React.FC<HomePersonalizedHubProps> = ({
  weather,
  hourly,
  daily,
  alerts,
  onNavigateToWeather,
}) => {
  const [activePersona, setActivePersona] = useState<UserPersona>('general');

  const story = buildHumanWeatherStory(weather, hourly, daily, alerts, activePersona);
  const activeConfig = PERSONA_CONFIGS[activePersona];
  const IconComponent = PERSONA_ICONS[activePersona] || Users;

  return (
    <section id="homepage-personalized-hub" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              Personalized Weather Intelligence
            </h2>
            <p className="text-xs text-[#93A4B8]">
              Switch focus to calibrate alerts and daily recommendations to your lifestyle
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Persona Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(PERSONA_CONFIGS) as UserPersona[]).map((pKey) => {
          const cfg = PERSONA_CONFIGS[pKey];
          const isSelected = activePersona === pKey;
          const PIcon = PERSONA_ICONS[pKey] || Users;

          return (
            <button
              key={pKey}
              type="button"
              onClick={() => setActivePersona(pKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#1499E8] text-white shadow-md shadow-[#1499E8]/20'
                  : 'bg-[#071018] text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111C27] border border-[#162331]'
              }`}
            >
              <PIcon className="w-3.5 h-3.5" />
              <span>{cfg.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Active Persona Advice Card */}
      <div className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#111F30] border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4] shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-[#F4F7FA]">
                {activeConfig.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${story.personaAdvice.badgeColor}`}>
                {story.personaAdvice.badge}
              </span>
            </div>

            <div className="text-xs font-semibold text-[#43C7F4] mb-1">
              {story.personaAdvice.highlight}
            </div>

            <p className="text-xs text-[#D1DCE8] leading-relaxed max-w-3xl">
              {story.personaAdvice.advice}
            </p>
          </div>
        </div>

        {onNavigateToWeather && (
          <button
            type="button"
            onClick={onNavigateToWeather}
            className="text-xs text-[#43C7F4] hover:text-white font-semibold flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <span>Open in Weather Hub</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
};
