import React from 'react';
import { CurrentWeather, DailyForecastItem } from '../../types';
import { Sparkles, Car, Bike, HeartPulse, SunMedium } from 'lucide-react';
import { getAqiMeaning } from '../../services/humanWeatherEngine';

interface HomeWeatherInsightProps {
  weather: CurrentWeather;
  todayForecast?: DailyForecastItem;
}

export const HomeWeatherInsight: React.FC<HomeWeatherInsightProps> = ({
  weather,
  todayForecast,
}) => {
  const currentTemp = typeof weather.temp === 'number' ? Math.round(weather.temp) : 28;
  const humidity = typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 72;
  const rainProb = typeof weather.precipitationProbability === 'number' ? Math.round(weather.precipitationProbability) : 20;
  const aqi = weather.aqi || 82;
  const aqiInfo = getAqiMeaning(aqi);

  // Derive human meaning statements
  const commuteInsight = rainProb >= 60
    ? 'Wet tarmac and reduced braking traction likely. Allow 10–15 min extra travel time during peak hours.'
    : currentTemp >= 36
    ? 'Air conditioning load will be elevated. Guard against high in-cabin heat buildup.'
    : 'Road surfaces clear and visibility optimal for normal urban movement.';

  const fitnessInsight = aqi > 150
    ? 'Air pollution levels unfavorable for heavy cardio. Prefer indoor exercise with filtration.'
    : rainProb >= 70
    ? 'Intermittent showers will disrupt outdoor sessions. Best window is during early morning dry breaks.'
    : currentTemp >= 32
    ? 'Hydrate thoroughly; optimum outdoor workout hours are before 7:30 AM or after 6:00 PM.'
    : 'Ideal conditions for cycling, jogging, and outdoor sports.';

  const healthInsight = aqiInfo.healthImpact || (humidity >= 80
    ? 'High moisture may aggravate joint stiffness and allergen mold count. Keep living spaces well ventilated.'
    : 'Atmospheric pressure and humidity in healthy equilibrium.');

  const solarInsight = (weather.uvIndex || 5.4) >= 7
    ? 'High UV radiation index. Sunscreen (SPF 30+) and eye protection advised between 11:00 AM and 3:00 PM.'
    : 'Moderate solar intensity. Standard sun awareness is adequate for short exposure.';

  return (
    <section id="homepage-weather-insights" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              What This Means For You
            </h2>
            <p className="text-xs text-[#93A4B8]">
              Automated atmospheric interpretation for daily decisions
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#43C7F4] bg-[#1499E8]/10 px-2.5 py-0.5 rounded-full border border-[#1499E8]/30">
          Synthesized Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Commute */}
        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#43C7F4]">
            <Car className="w-4 h-4" />
            <span>Commute &amp; Travel</span>
          </div>
          <p className="text-xs text-[#D1DCE8] leading-relaxed">
            {commuteInsight}
          </p>
          <span className="text-[10px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            Road Surface Index: {rainProb >= 50 ? 'Damp / Wet' : 'Dry & Clear'}
          </span>
        </div>

        {/* Fitness */}
        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#22C7A0]">
            <Bike className="w-4 h-4" />
            <span>Fitness &amp; Outdoors</span>
          </div>
          <p className="text-xs text-[#D1DCE8] leading-relaxed">
            {fitnessInsight}
          </p>
          <span className="text-[10px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            Outdoor Exertion Rating: {currentTemp >= 35 ? 'Moderate' : 'Favorable'}
          </span>
        </div>

        {/* Health & AQI */}
        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: aqiInfo.severityColor }}>
            <HeartPulse className="w-4 h-4" />
            <span>Respiratory Health</span>
          </div>
          <p className="text-xs text-[#D1DCE8] leading-relaxed">
            {healthInsight}
          </p>
          <span className="text-[10px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            AQI {aqi} • {aqiInfo.category}
          </span>
        </div>

        {/* Solar UV */}
        <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FFC857]">
            <SunMedium className="w-4 h-4" />
            <span>Solar Protection</span>
          </div>
          <p className="text-xs text-[#D1DCE8] leading-relaxed">
            {solarInsight}
          </p>
          <span className="text-[10px] text-[#93A4B8] pt-2 border-t border-[#162331]">
            Peak Window: 11:30 AM – 2:30 PM
          </span>
        </div>
      </div>
    </section>
  );
};
