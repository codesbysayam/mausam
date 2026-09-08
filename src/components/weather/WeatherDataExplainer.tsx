import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Droplets,
  Gauge,
  Thermometer,
  CloudRain,
  HeartPulse,
  Radar,
  Sun,
  Wind,
} from 'lucide-react';

interface ExplainerItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  practicalTip: string;
  icon: React.ReactNode;
}

const EXPLAINER_ITEMS: ExplainerItem[] = [
  {
    id: 'dew_point',
    title: 'Dew Point (°C)',
    shortDesc: 'The exact temperature to which air must cool for water vapor to condense.',
    fullDesc:
      'Unlike relative humidity (which changes with temperature), dew point is an absolute measure of moisture in the air. A dew point above 24°C feels oppressively muggy and sticky; below 15°C feels crisp and comfortable.',
    practicalTip:
      'If dew point is within 2°C of the ambient temperature, expect fog, heavy dew, or low clouds to form.',
    icon: <Droplets className="w-4 h-4 text-[#38BDF8]" />,
  },
  {
    id: 'pressure_tendency',
    title: 'Atmospheric Pressure & Tendency (hPa)',
    shortDesc: 'The weight of the atmosphere pressing down on the Earth’s surface.',
    fullDesc:
      'Standard sea-level pressure is 1013.25 hPa. A falling pressure tendency (> 1.0 hPa drop in 3 hours) indicates approaching low-pressure troughs, squall lines, or cyclonic depressions. Rising pressure signals clearing skies.',
    practicalTip:
      'A sharp, rapid drop in barometric pressure is the primary early warning sign of severe convective squalls or cyclones.',
    icon: <Gauge className="w-4 h-4 text-[#60A5FA]" />,
  },
  {
    id: 'rain_probability',
    title: '60% Rain Probability (PoP)',
    shortDesc: 'Statistical chance of rain falling at any specific spot in the area.',
    fullDesc:
      'Probability of Precipitation (PoP) = Confidence × Areal Coverage. A 60% probability means that at any specific point within the forecast district, there is a 60% chance of measurable rain (≥ 0.1 mm) occurring during that hour.',
    practicalTip:
      'PoP does NOT mean it will rain for 60% of the time, nor over 60% of the land. It means 6 in 10 chances for your exact location.',
    icon: <CloudRain className="w-4 h-4 text-[#818CF8]" />,
  },
  {
    id: 'heat_index',
    title: 'Heat Index & Feels-Like (°C)',
    shortDesc: 'How hot the weather actually feels when moisture hinders sweat evaporation.',
    fullDesc:
      'When relative humidity is high, sweat cannot evaporate efficiently from the skin, preventing natural evaporative cooling. A dry temperature of 34°C with 75% humidity feels like a scorching 44°C to the human body.',
    practicalTip:
      'Above 40°C Heat Index, strenuous physical activity should be restricted to early mornings to prevent heat exhaustion.',
    icon: <Thermometer className="w-4 h-4 text-[#F87171]" />,
  },
  {
    id: 'aqi',
    title: 'National Air Quality Index (CPCB AQI)',
    shortDesc: 'A standardized 24-hour composite rating of inhalable atmospheric particulates.',
    fullDesc:
      'India’s Central Pollution Control Board (CPCB) evaluates 8 key pollutants: PM2.5, PM10, NO2, SO2, CO, O3, NH3, and Pb. The overall AQI is dictated by whichever pollutant has the worst sub-index score (the "dominant pollutant").',
    practicalTip:
      'AQI 0–50 is Good; 51–100 Satisfactory; 101–200 Moderate; 201–300 Poor; 301–400 Very Poor; > 400 Severe.',
    icon: <HeartPulse className="w-4 h-4 text-[#34D399]" />,
  },
  {
    id: 'radar_dbz',
    title: 'Doppler Radar Reflectivity (dBZ)',
    shortDesc: 'Decibels of reflectivity measuring echo energy bounced back from hydrometeors.',
    fullDesc:
      'Doppler Weather Radar (DWR) beams microwave pulses. Raindrops, hail, and snow bounce energy back to the receiver. Low dBZ (15–25) means light drizzle; moderate (30–45) means steady rain; high (> 50 dBZ) indicates hail and severe thunderstorms.',
    practicalTip:
      'Echoes exceeding 45 dBZ on IMD radar maps represent active downbursts and gust fronts.',
    icon: <Radar className="w-4 h-4 text-[#FBBF24]" />,
  },
  {
    id: 'uv_index',
    title: 'Solar Ultraviolet (UV) Index',
    shortDesc: 'International standard measurement of sunburn-producing ultraviolet radiation.',
    fullDesc:
      'Ranging from 0 to 12+, UV index indicates risk of skin erythema and retinal damage from midday solar exposure. UV 0–2 is Low, 3–5 Moderate, 6–7 High, 8–10 Very High, 11+ Extreme.',
    practicalTip:
      'When UV exceeds 8 (typical midday in Indian tropics), unprotected skin will sustain erythemal damage in under 15 minutes.',
    icon: <Sun className="w-4 h-4 text-[#F59E0B]" />,
  },
  {
    id: 'relative_humidity',
    title: 'Relative Humidity (%)',
    shortDesc: 'Percentage of moisture present relative to maximum saturation at that temperature.',
    fullDesc:
      'Warm air holds exponentially more moisture than cold air. At 100% relative humidity, air is completely saturated and cannot absorb additional moisture, creating clouds, fog, or dew.',
    practicalTip:
      'Indoor humidity between 40% and 60% provides optimal respiratory comfort and inhibits viral aerosol persistence.',
    icon: <Droplets className="w-4 h-4 text-[#38BDF8]" />,
  },
];

export const WeatherDataExplainer: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div
      id="weather-data-explainer"
      className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2.5 border-b border-[#1F2937] pb-3">
        <div className="p-1.5 rounded-lg bg-[#0F172A] border border-[#38BDF8]/30 text-[#38BDF8]">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
            METEOROLOGICAL DATA EXPLAINER & TECHNICAL GUIDE
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Authoritative explanations of atmospheric parameters and operational calculation standards
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {EXPLAINER_ITEMS.map((item) => {
          const isOpen = openItem === item.id;
          return (
            <div
              key={item.id}
              className="bg-[#0B1320] border border-[#1E293B] hover:border-[#334155] rounded-lg transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">{item.icon}</div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[11px] text-[#94A3B8] truncate">{item.shortDesc}</div>
                  </div>
                </div>
                <div className="shrink-0 text-[#94A3B8]">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-[#1E293B] space-y-2 text-xs text-[#CBD5E1]">
                  <p className="leading-relaxed">{item.fullDesc}</p>
                  <div className="p-2 bg-[#111827] rounded border border-[#1F2937] text-[11px] text-[#94A3B8]">
                    <strong className="text-[#38BDF8]">Practical Rule: </strong>
                    {item.practicalTip}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
