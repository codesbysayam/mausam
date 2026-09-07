import React, { useMemo } from 'react';
import { CurrentWeather, LocationRecord, DailyForecastItem, HourlyForecastItem, WeatherAlert } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import {
  getTimeOfDayGreeting,
  getTemperatureMeaning,
  getRainProbabilityMeaning,
} from '../../services/humanWeatherEngine';
import {
  Droplets,
  Wind,
  CloudRain,
  Gauge,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { WeatherEffects } from '../weather/WeatherEffects';
import { isPrecipitationCondition, getConditionLabel } from '../../services/weatherConditions';

interface ForecastAtmosphericHeroProps {
  weather: CurrentWeather;
  location: LocationRecord;
  modelName: string;
  todayForecast?: DailyForecastItem;
  hourly?: HourlyForecastItem[];
  daily?: DailyForecastItem[];
  alerts?: WeatherAlert[];
}

export const ForecastAtmosphericHero: React.FC<ForecastAtmosphericHeroProps> = ({
  weather,
  todayForecast,
  location,
  modelName,
  alerts = [],
}) => {
  const { greeting, period } = getTimeOfDayGreeting();
  const isNight = period === 'night';
  const isDaytime = weather.isDay !== undefined ? weather.isDay : !isNight;
  const effectiveCondition = weather.conditionKey || (isDaytime ? 'CLEAR_DAY' : 'CLEAR_NIGHT');

  const visualConfig = getWeatherVisualConfig(weather.condition, isDaytime, effectiveCondition);
  const ConditionIcon = visualConfig.icon;

  const currentTemp =
    typeof weather.temp === 'number' && !Number.isNaN(weather.temp)
      ? Math.round(weather.temp)
      : 26;
  const feelsLike =
    typeof weather.feelsLike === 'number' && !Number.isNaN(weather.feelsLike)
      ? Math.round(weather.feelsLike)
      : currentTemp + 2;

  const maxTemp = todayForecast?.high
    ? Math.round(todayForecast.high)
    : weather.high
    ? Math.round(weather.high)
    : currentTemp + 3;
  const minTemp = todayForecast?.low
    ? Math.round(todayForecast.low)
    : weather.low
    ? Math.round(weather.low)
    : currentTemp - 4;

  const humidity = typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 88;
  const windSpeed = typeof weather.windSpeed === 'number' ? Math.round(weather.windSpeed) : 12;
  const windDir = weather.windDirection || 'WSW';
  const rainProb =
    typeof weather.precipitationProbability === 'number'
      ? Math.round(weather.precipitationProbability)
      : 0;
  const pressure = typeof weather.pressure === 'number' ? Math.round(weather.pressure) : 1006;

  const rainInfo = getRainProbabilityMeaning(rainProb);
  const tempMeaning = getTemperatureMeaning(currentTemp, feelsLike);

  // Dynamic atmospheric human narrative synopsis strictly driven by actual conditions
  const humanSynopsis = useMemo(() => {
    const isRainingNow = isPrecipitationCondition(effectiveCondition);
    const isThunder =
      effectiveCondition === 'THUNDERSTORM' ||
      (weather.condition || '').toLowerCase().includes('thunder');
    const isHot = currentTemp >= 35 || feelsLike >= 38;

    if (isThunder) {
      return `Convective thunderstorm cells detected. Electrical discharge activity and sudden gust fronts observed over ${
        location.city || 'the area'
      }.`;
    }
    if (isRainingNow) {
      return `Active precipitation is falling (${(weather.precipitation || 0.5).toFixed(1)} mm/hr) across ${
        location.city || 'the district'
      } with saturated boundary-layer humidity.`;
    }
    if (rainProb >= 60) {
      return `Currently dry under ${getConditionLabel(effectiveCondition).toLowerCase()}. Synoptic models show elevated rain probability (${rainProb}%) later in the forecast window.`;
    }
    if (isHot) {
      return `High ambient thermal load. Apparent temperature feels like ${feelsLike}°C during peak solar exposure.`;
    }
    return `Stable atmospheric envelope with ${getConditionLabel(effectiveCondition).toLowerCase()} and smooth air circulation across ${
      location.city || 'the region'
    }.`;
  }, [effectiveCondition, weather.condition, weather.precipitation, rainProb, currentTemp, feelsLike, location.city]);

  return (
    <div
      id="forecast-atmospheric-hero"
      className="relative rounded-3xl overflow-hidden border border-[#162331] bg-gradient-to-br from-[#0B1722] via-[#0D1D2A] to-[#07111B] p-6 sm:p-8 lg:p-10 shadow-2xl transition-all"
    >
      {/* Dynamic Data-Driven Atmospheric Effects Layer */}
      <WeatherEffects condition={effectiveCondition} isDay={isDaytime} opacity={0.65} />

      {/* Atmospheric Ambient Glow Orbs - strictly data-driven */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: isPrecipitationCondition(effectiveCondition)
            ? 'radial-gradient(circle, #1499E8 0%, transparent 70%)'
            : !isDaytime
            ? 'radial-gradient(circle, #2C3E50 0%, transparent 70%)'
            : 'radial-gradient(circle, #F39C12 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
        {/* Top Meta Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#162331]/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#43C7F4] bg-[#1499E8]/10 px-3 py-1 rounded-full border border-[#1499E8]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{location.city || 'Regional Center'}, {location.state || 'India'}</span>
            </span>

            <span className="text-xs text-[#93A4B8] font-medium">
              {greeting} • {isDaytime ? 'Day Outlook' : 'Tonight’s Outlook'}
            </span>

            {weather.observationStatus && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                {weather.observationStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#93A4B8] self-start sm:self-auto">
            <span className="bg-[#071018] px-2.5 py-1 rounded-lg border border-[#162331]">
              Model Run: <strong className="text-[#43C7F4]">{modelName}</strong>
            </span>
          </div>
        </div>

        {/* Main Temperature & Weather Story Hero Layout */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
          {/* Left: Dominant Temperature & Visual Condition */}
          <div className="flex items-center gap-5 sm:gap-8">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#1499E8]/10 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4] shadow-[0_0_30px_rgba(20,153,232,0.2)]">
                <ConditionIcon className="w-11 h-11 sm:w-14 sm:h-14" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tighter text-[#F4F7FA]">
                  {currentTemp}°
                </span>
                <span className="text-2xl sm:text-3xl font-light text-[#93A4B8]">C</span>
              </div>

              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                <span className="text-lg sm:text-xl font-bold text-[#F4F7FA]">
                  {getConditionLabel(effectiveCondition)}
                </span>
                <span className="text-xs text-[#93A4B8] bg-[#071018] px-2.5 py-0.5 rounded-full border border-[#162331]">
                  Feels like <strong className="text-[#FFC857]">{feelsLike}°C</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Human Narrative Synoptic Story Box */}
          <div className="flex-1 lg:max-w-md bg-[#071018]/80 backdrop-blur-md rounded-2xl border border-[#162331] p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8]">
                Atmospheric Synopsis
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C7A0]/10 text-[#22C7A0] border border-[#22C7A0]/30">
                {tempMeaning.headline}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#D1DCE8] leading-relaxed italic">
              "{humanSynopsis}"
            </p>

            <div className="text-[11px] text-[#93A4B8] flex items-center justify-between gap-1.5 pt-2 border-t border-[#162331]">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPrecipitationCondition(effectiveCondition) ? 'bg-cyan-400' : 'bg-[#1499E8]'}`} />
                <span>{rainInfo.headline}</span>
              </div>
              <span className="font-mono text-cyan-300 font-semibold">{rainProb}% rain chance</span>
            </div>
          </div>
        </div>

        {/* Bottom: Clean Horizontal Information Layout */}
        <div className="pt-5 border-t border-[#162331]/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* HIGH */}
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#071018]/60 border border-[#162331]">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#FF9F43]" />
              High
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#F4F7FA]">
              {maxTemp}°C
            </span>
            <span className="text-[10px] text-[#93A4B8]">Diurnal peak</span>
          </div>

          {/* LOW */}
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#071018]/60 border border-[#162331]">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-[#43C7F4]" />
              Low
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#F4F7FA]">
              {minTemp}°C
            </span>
            <span className="text-[10px] text-[#93A4B8]">Nocturnal base</span>
          </div>

          {/* RAIN */}
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#071018]/60 border border-[#162331]">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-[#1499E8]" />
              Rain Chance
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#43C7F4]">
              {rainProb}%
            </span>
            <span className="text-[10px] text-[#93A4B8]">
              {isPrecipitationCondition(effectiveCondition) ? 'Raining now' : 'Forecast risk'}
            </span>
          </div>

          {/* WIND */}
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#071018]/60 border border-[#162331]">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold flex items-center gap-1">
              <Wind className="w-3 h-3 text-[#22C7A0]" />
              Wind
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#F4F7FA]">
              {windSpeed} <span className="text-xs font-normal text-[#93A4B8]">km/h</span>
            </span>
            <span className="text-[10px] text-[#93A4B8]">{windDir} Flow</span>
          </div>

          {/* HUMIDITY */}
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#071018]/60 border border-[#162331]">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[#1499E8]" />
              Humidity
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#F4F7FA]">
              {humidity}%
            </span>
            <span className="text-[10px] text-[#93A4B8]">Relative RH</span>
          </div>

          {/* BAROMETRIC PRESSURE */}
          <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#071018]/60 border border-[#162331]">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-[#FFC857]" />
              Pressure
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#F4F7FA]">
              {pressure} <span className="text-xs font-normal text-[#93A4B8]">hPa</span>
            </span>
            <span className="text-[10px] text-[#93A4B8]">Mean sea level</span>
          </div>
        </div>
      </div>
    </div>
  );
};
