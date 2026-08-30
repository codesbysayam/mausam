import React, { useEffect, useRef, useMemo } from 'react';
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
  Compass,
  Thermometer,
  CloudRain,
  Gauge,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

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
  hourly = [],
  daily = [],
  alerts = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { greeting, period } = getTimeOfDayGreeting();
  const isNight = period === 'night';

  const visualConfig = getWeatherVisualConfig(weather.condition);
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
      : 74;
  const pressure = typeof weather.pressure === 'number' ? Math.round(weather.pressure) : 1006;

  const rainInfo = getRainProbabilityMeaning(rainProb);
  const tempMeaning = getTemperatureMeaning(currentTemp, feelsLike);

  // Dynamic atmospheric human narrative synopsis
  const humanSynopsis = useMemo(() => {
    const isRaining =
      weather.condition?.toLowerCase().includes('rain') ||
      weather.condition?.toLowerCase().includes('drizzle') ||
      rainProb >= 60;
    const isThunder =
      weather.condition?.toLowerCase().includes('thunder') ||
      weather.condition?.toLowerCase().includes('storm');
    const isHot = currentTemp >= 35 || feelsLike >= 38;

    if (isThunder) {
      return `Convective thunderstorm activity active. Rain and electrical discharges expected with gusty boundary layer winds.`;
    }
    if (isRaining) {
      return `Precipitation is likely to continue through ${
        isNight ? 'the night' : 'the day'
      }, with high relative humidity and light to moderate winds.`;
    }
    if (isHot) {
      return `High ambient thermal load and intense solar radiation. Apparent temperatures may exceed ${feelsLike}°C during peak hours.`;
    }
    return `Stable atmospheric envelope with ${weather.condition?.toLowerCase()} skies and comfortable wind circulation across ${
      location.city || 'the district'
    }.`;
  }, [weather.condition, rainProb, currentTemp, feelsLike, isNight, location.city]);

  // Subtle lightweight canvas particle / atmosphere animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const condLower = (weather.condition || '').toLowerCase();
    const isRain = condLower.includes('rain') || condLower.includes('drizzle') || rainProb >= 60;
    const isCloud = condLower.includes('cloud') || condLower.includes('overcast') || condLower.includes('haze');

    const particles: Array<{
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      size: number;
      opacity: number;
    }> = [];

    const particleCount = isRain ? 45 : isCloud ? 16 : 14;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: isRain ? 2.5 + Math.random() * 3.5 : (Math.random() - 0.5) * 0.4,
        speedX: isRain ? -0.8 + Math.random() * 0.4 : (Math.random() - 0.5) * 0.4,
        size: isRain ? 1.5 + Math.random() * 1.5 : 2 + Math.random() * 3,
        opacity: isRain ? 0.2 + Math.random() * 0.35 : 0.08 + Math.random() * 0.18,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (isRain) {
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 3, p.y + p.speedY * 3);
          ctx.strokeStyle = `rgba(67, 199, 244, ${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.stroke();
        } else {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = isNight
            ? `rgba(215, 235, 255, ${p.opacity})`
            : `rgba(255, 200, 87, ${p.opacity})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [weather.condition, rainProb, isNight]);

  return (
    <div
      id="forecast-atmospheric-hero"
      className="relative rounded-3xl overflow-hidden border border-[#162331] bg-gradient-to-br from-[#0B1722] via-[#0D1D2A] to-[#07111B] p-6 sm:p-8 lg:p-10 shadow-2xl transition-all"
    >
      {/* Background Subtle Canvas Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-60 z-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Atmospheric Ambient Glow Orbs */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: rainProb > 50
            ? 'radial-gradient(circle, #1499E8 0%, transparent 70%)'
            : isNight
            ? 'radial-gradient(circle, #3867D6 0%, transparent 70%)'
            : 'radial-gradient(circle, #FFC857 0%, transparent 70%)',
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
              {greeting} • {isNight ? 'Tonight’s Outlook' : 'Day Outlook'}
            </span>
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
                  {weather.condition || 'Partly Cloudy'}
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

            <div className="text-[11px] text-[#93A4B8] flex items-center gap-1.5 pt-2 border-t border-[#162331]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1499E8]" />
              <span>{rainInfo.headline} • {rainProb}% probability over horizon</span>
            </div>
          </div>
        </div>

        {/* Bottom: Clean Horizontal Information Layout (Not 5 identical boxes!) */}
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
            <span className="text-[10px] text-[#93A4B8]">Precip Risk</span>
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
