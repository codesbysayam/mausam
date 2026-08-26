import React from 'react';
import { CurrentWeather } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface PersonalizedAdvisoryProps {
  weather: CurrentWeather;
}

export const PersonalizedAdvisory: React.FC<PersonalizedAdvisoryProps> = ({ weather }) => {
  const isRain = weather.precipitationMm > 0 || weather.precipitationProbability > 50;
  const isHighTemp = weather.temp >= 35;
  const isPoorAqi = weather.aqi > 150;

  const advisories = [
    {
      domain: 'Fitness & Running',
      icon: 'directions_run',
      status: isPoorAqi
        ? { label: 'Caution (Poor AQI)', variant: 'alert' as const }
        : isHighTemp
        ? { label: 'Early Morning Preferred', variant: 'warning' as const }
        : { label: 'Optimal Conditions', variant: 'good' as const },
      guidance: isPoorAqi
        ? 'Avoid intense outdoor cardio during midday; opt for indoor treadmills or gym workouts.'
        : isHighTemp
        ? 'Schedule jogs before 07:00 AM or after 06:30 PM. Maintain adequate hydration with electrolytes.'
        : 'Weather conditions are favorable for jogging, cycling, and outdoor workouts.',
      metrics: `Temp: ${Math.round(weather.temp)}°C • AQI: ${weather.aqi}`,
    },
    {
      domain: 'Commute & Road Safety',
      icon: 'commute',
      status: isRain
        ? { label: 'Wet Roads / Caution', variant: 'warning' as const }
        : weather.visibility < 3
        ? { label: 'Low Visibility', variant: 'alert' as const }
        : { label: 'Smooth Transit', variant: 'good' as const },
      guidance: isRain
        ? 'Expect reduced traction and surface water logging in low-lying intersections. Maintain buffer distance.'
        : weather.visibility < 3
        ? 'Use low-beam fog lamps and reduce highway cruising speeds.'
        : 'Clear road visibility and dry track conditions on state and national highways.',
      metrics: `Visibility: ${weather.visibility} km • Wind: ${weather.windSpeed} km/h`,
    },
    {
      domain: 'Family & Outdoor Activities',
      icon: 'family_restroom',
      status: isRain
        ? { label: 'Carry Umbrella', variant: 'warning' as const }
        : isHighTemp
        ? { label: 'Sun Protection Needed', variant: 'warning' as const }
        : { label: 'Pleasant & Suitable', variant: 'good' as const },
      guidance: isRain
        ? 'Intermittent precipitation expected. Carry rain gear and plan indoor alternatives for children.'
        : isHighTemp
        ? 'Apply broad-spectrum sunscreen (SPF 30+) and wear lightweight cotton clothing.'
        : 'Ideal atmospheric conditions for public parks, visits, and recreational outings.',
      metrics: `UV Index: ${weather.uvIndex} • Humidity: ${weather.humidity}%`,
    },
    {
      domain: 'Agricultural (Agromet)',
      icon: 'agriculture',
      status: isRain
        ? { label: 'Hold Chemical Sprays', variant: 'warning' as const }
        : { label: 'Favorable Field Operations', variant: 'good' as const },
      guidance: isRain
        ? 'Suspend pesticide and foliar fertilizer sprays to avoid rain wash-off. Ensure field drainage channels.'
        : 'Proceed with scheduled sowing, weeding, and drip irrigation operations in paddy and horticulture plots.',
      metrics: `Soil Temp: ${Math.round(weather.temp - 2)}°C • Evapotranspiration: 4.2 mm/day`,
    },
  ];

  return (
    <div className="mausam-card">
      <SectionHeader
        title="Personalized Sectoral &amp; Citizen Advisories"
        subtitle="Operational meteorological recommendations tailored for daily citizen workflows"
        icon="tips_and_updates"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {advisories.map((adv, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#4FA8E0]">
                    {adv.icon}
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {adv.domain}
                  </span>
                </div>
                <StatusBadge label={adv.status.label} variant={adv.status.variant} />
              </div>

              <p className="text-xs text-[#D7DEE8] my-2.5 leading-relaxed">
                {adv.guidance}
              </p>
            </div>

            <div className="pt-2 border-t border-[#334155] text-[11px] text-[#8A94A6] font-mono">
              {adv.metrics}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
