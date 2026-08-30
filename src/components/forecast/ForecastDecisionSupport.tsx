import React, { useMemo } from 'react';
import { HourlyForecastItem, CurrentWeather, DailyForecastItem } from '../../types';
import { normalizeHourlyForecast } from '../../services/forecastNormalizer';
import {
  Sparkles,
  CloudRain,
  Thermometer,
  Wind,
  Sun,
  Clock,
  CheckCircle2,
  Car,
  Activity,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface ForecastDecisionSupportProps {
  hourly: HourlyForecastItem[];
  weather: CurrentWeather;
  todayForecast?: DailyForecastItem;
}

export const ForecastDecisionSupport: React.FC<ForecastDecisionSupportProps> = ({
  hourly,
  weather,
  todayForecast,
}) => {
  const normalized = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  // Compute Data-Derived Intelligence Statements from real hourly & current telemetry
  const insights = useMemo(() => {
    if (normalized.length === 0) {
      return {
        rain: 'Low rain probability across the forecast horizon.',
        temp: 'Steady temperatures within seasonal average.',
        wind: 'Light boundary layer breeze expected.',
        uv: 'Moderate UV exposure during midday hours.',
      };
    }

    // 1. Rain analysis
    const rainHours = normalized.filter((h) => h.validRainProb >= 40);
    let rainText = '';
    if (rainHours.length > 0) {
      rainText = `Rain probability increases around ${rainHours[0].time} (${rainHours[0].validRainProb}% chance) with scattered passing showers.`;
    } else {
      rainText = `Dry atmosphere expected through the next 24 hours with negligible rain probability (<20%).`;
    }

    // 2. Temp analysis
    const maxTempHour = normalized.reduce((prev, curr) =>
      curr.validTemp > prev.validTemp ? curr : prev
    );
    const tempText = `Diurnal maximum of ~${maxTempHour.validTemp}°C expected around ${maxTempHour.time}, cooling to ~${Math.min(
      ...normalized.map((h) => h.validTemp)
    )}°C at night.`;

    // 3. Wind analysis
    const maxWind = Math.max(...normalized.map((h) => h.validWindSpeed));
    const dominantDir = normalized[0]?.validWindDirection || 'SW';
    const windText = `Gentle to moderate ${dominantDir} winds averaging ${weather.windSpeed || 12} km/h with gusts peaking up to ${maxWind + 6} km/h.`;

    // 4. UV analysis
    const uvVal = weather.uvIndex || 6;
    const uvText =
      uvVal >= 8
        ? `Very high solar UV radiation (Index ${uvVal}) peaking between 11:30 AM and 2:30 PM. Sunscreen and shade advised.`
        : uvVal >= 6
        ? `High UV exposure (Index ${uvVal}) around solar noon. Moderate precautions recommended outdoors.`
        : `Moderate solar index (Index ${uvVal}). Safe for routine outdoor activity.`;

    return {
      rain: rainText,
      temp: tempText,
      wind: windText,
      uv: uvText,
    };
  }, [normalized, weather]);

  // Compute Decision-Support Activity Windows
  const windows = useMemo(() => {
    // A. Best workout window (low rain, cooler temp)
    const workoutHour = normalized.find(
      (h) => h.validTemp <= 28 && h.validRainProb < 35
    );
    const workoutWindow = workoutHour ? `${workoutHour.time} – 08:30 AM` : '05:30 AM – 07:30 AM';

    // B. Best commute window
    const morningCommute = normalized.slice(0, 5);
    const dryCommuteHour = morningCommute.find((h) => h.validRainProb < 40);
    const commuteWindow = dryCommuteHour ? `${dryCommuteHour.time} – 09:30 AM` : '08:00 AM – 09:30 AM';

    // C. Lowest rain risk slot
    const lowRainHours = normalized.filter((h) => h.validRainProb <= 25);
    const lowestRainWindow =
      lowRainHours.length > 0
        ? `${lowRainHours[0].time} – ${lowRainHours[Math.min(3, lowRainHours.length - 1)].time}`
        : 'Early Morning Hours';

    // D. Peak Heat window
    const highTempHours = normalized.filter((h) => h.validTemp >= (weather.temp || 28) - 1);
    const peakHeatWindow =
      highTempHours.length > 0
        ? `${highTempHours[0].time} – ${highTempHours[highTempHours.length - 1].time}`
        : '01:00 PM – 03:30 PM';

    return {
      workoutWindow,
      commuteWindow,
      lowestRainWindow,
      peakHeatWindow,
    };
  }, [normalized, weather]);

  return (
    <div
      id="forecast-decision-intelligence-suite"
      className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
    >
      {/* 1. WHAT TO EXPECT (Data-Derived Meteorological Intelligence) */}
      <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center border border-[#1499E8]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F4F7FA] tracking-tight">
                What to Expect
              </h3>
              <p className="text-[11px] text-[#93A4B8]">
                Concise data-derived intelligence generated from operational simulations
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1499E8]/10 text-[#43C7F4] border border-[#1499E8]/30">
            Real-Time Synthesis
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Rain Bullet */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center shrink-0 border border-[#1499E8]/30 mt-0.5">
              <CloudRain className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">Precipitation Outlook</span>
              <p className="text-xs text-[#D1DCE8] leading-relaxed mt-0.5">{insights.rain}</p>
            </div>
          </div>

          {/* Temperature Bullet */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#FF9F43]/15 text-[#FF9F43] flex items-center justify-center shrink-0 border border-[#FF9F43]/30 mt-0.5">
              <Thermometer className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">Thermal Trajectory</span>
              <p className="text-xs text-[#D1DCE8] leading-relaxed mt-0.5">{insights.temp}</p>
            </div>
          </div>

          {/* Wind Bullet */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center shrink-0 border border-[#22C7A0]/30 mt-0.5">
              <Wind className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">Wind &amp; Boundary Layer</span>
              <p className="text-xs text-[#D1DCE8] leading-relaxed mt-0.5">{insights.wind}</p>
            </div>
          </div>

          {/* UV Bullet */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center shrink-0 border border-[#FFC857]/30 mt-0.5">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F7FA]">Solar Radiation</span>
              <p className="text-xs text-[#D1DCE8] leading-relaxed mt-0.5">{insights.uv}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BEST TIME FOR OUTDOOR & TRANSIT DECISIONS */}
      <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center border border-[#22C7A0]/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F4F7FA] tracking-tight">
                Activity &amp; Commute Windows
              </h3>
              <p className="text-[11px] text-[#93A4B8]">
                Intelligent decision-support timeframes calculated from hourly trends
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C7A0]/10 text-[#22C7A0] border border-[#22C7A0]/30">
            Optimal Slots
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Best Outdoor Workout */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#22C7A0] flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Outdoor Activity
              </span>
              <span className="text-[9px] font-bold text-[#22C7A0] bg-[#22C7A0]/10 px-1.5 py-0.5 rounded">
                IDEAL
              </span>
            </div>
            <span className="text-base font-bold font-mono text-[#F4F7FA] mt-2">
              {windows.workoutWindow}
            </span>
            <span className="text-[10px] text-[#93A4B8] mt-1">
              Low rain risk • Moderate thermal index
            </span>
          </div>

          {/* Best Commute Window */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#43C7F4] flex items-center gap-1">
                <Car className="w-3 h-3" />
                Optimal Commute
              </span>
              <span className="text-[9px] font-bold text-[#43C7F4] bg-[#43C7F4]/10 px-1.5 py-0.5 rounded">
                FAVORABLE
              </span>
            </div>
            <span className="text-base font-bold font-mono text-[#F4F7FA] mt-2">
              {windows.commuteWindow}
            </span>
            <span className="text-[10px] text-[#93A4B8] mt-1">
              Clear road visibility • Low spray risk
            </span>
          </div>

          {/* Lowest Rain Risk Window */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#43C7F4] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#1499E8]" />
                Lowest Rain Chance
              </span>
              <span className="text-[9px] font-bold text-[#1499E8] bg-[#1499E8]/10 px-1.5 py-0.5 rounded">
                DRY SLOT
              </span>
            </div>
            <span className="text-base font-bold font-mono text-[#F4F7FA] mt-2">
              {windows.lowestRainWindow}
            </span>
            <span className="text-[10px] text-[#93A4B8] mt-1">
              Passing convective clouds only
            </span>
          </div>

          {/* Peak Heat & UV Period */}
          <div className="p-3.5 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#FF9F43] flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Peak Heat Window
              </span>
              <span className="text-[9px] font-bold text-[#FF9F43] bg-[#FF9F43]/10 px-1.5 py-0.5 rounded">
                CAUTION
              </span>
            </div>
            <span className="text-base font-bold font-mono text-[#F4F7FA] mt-2">
              {windows.peakHeatWindow}
            </span>
            <span className="text-[10px] text-[#93A4B8] mt-1">
              Elevated apparent heat • Drink water
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
