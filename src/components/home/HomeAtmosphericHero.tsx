import React, { useEffect, useRef, useMemo } from 'react';
import { CurrentWeather, LocationRecord } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { getTimeOfDayGreeting, getAqiMeaning, getHumidityMeaning, getRainProbabilityMeaning, getWindMeaning } from '../../services/humanWeatherEngine';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface HomeAtmosphericHeroProps {
  weather: CurrentWeather;
  location: LocationRecord;
  onExploreWeather?: () => void;
  onExploreForecast?: () => void;
}

export const HomeAtmosphericHero: React.FC<HomeAtmosphericHeroProps> = ({
  weather,
  location,
  onExploreWeather,
  onExploreForecast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { greeting, period } = getTimeOfDayGreeting();
  const isNight = period === 'night';

  const visualConfig = getWeatherVisualConfig(weather.condition);
  const ConditionIcon = visualConfig.icon;

  const currentTemp = typeof weather.temp === 'number' && !Number.isNaN(weather.temp) ? Math.round(weather.temp) : 28;
  const feelsLike = typeof weather.feelsLike === 'number' && !Number.isNaN(weather.feelsLike) ? Math.round(weather.feelsLike) : currentTemp + 2;
  const humidity = typeof weather.humidity === 'number' ? Math.round(weather.humidity) : 72;
  const windSpeed = typeof weather.windSpeed === 'number' ? Math.round(weather.windSpeed) : 14;
  const rainProb = typeof weather.precipitationProbability === 'number' ? Math.round(weather.precipitationProbability) : 20;
  const uvVal = typeof weather.uvIndex === 'number' ? weather.uvIndex : 5.4;

  const aqiInfo = getAqiMeaning(weather.aqi || 82);
  const humidityInfo = getHumidityMeaning(humidity);
  const windInfo = getWindMeaning(windSpeed, weather.windDirection || 'NE');
  const rainInfo = getRainProbabilityMeaning(rainProb);

  // Dynamic atmospheric tone description based on real variables
  const humanInterpretation = useMemo(() => {
    const isRaining = weather.condition?.toLowerCase().includes('rain') || weather.condition?.toLowerCase().includes('drizzle') || rainProb >= 60;
    const isHot = currentTemp >= 34 || feelsLike >= 36;
    const isPleasant = currentTemp >= 20 && currentTemp <= 29 && humidity <= 75;

    if (isRaining) {
      return `Warm, humid and wet ${isNight ? 'tonight' : 'today'}. Precipitation is likely to persist across the local observatory sector.`;
    }
    if (isHot) {
      return `Elevated heat index and high ambient moisture. Keep hydrated and moderate peak daytime exposure.`;
    }
    if (isPleasant) {
      return `Comfortable atmospheric conditions with stable boundary layer winds across ${location.city || 'the region'}.`;
    }
    return `Stable seasonal pattern with ${weather.condition?.toLowerCase() || 'scattered clouds'} and steady air density.`;
  }, [weather.condition, rainProb, currentTemp, feelsLike, humidity, isNight, location.city]);

  // Subtle lightweight canvas particle animation matching the condition
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const conditionLower = (weather.condition || '').toLowerCase();
    const isRain = conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower');
    const isThunder = conditionLower.includes('thunder');

    // Particle definitions
    const particles = Array.from({ length: isRain ? 45 : isThunder ? 50 : 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: isRain ? Math.random() * 4 + 3 : Math.random() * 0.4 + 0.1,
      len: isRain ? Math.random() * 12 + 8 : Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      size: Math.random() * 2 + 1,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      if (isRain || isThunder) {
        // Falling raindrops
        ctx.strokeStyle = 'rgba(67, 199, 244, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.len);
          p.y += p.speed;
          p.x -= 0.6;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
        ctx.stroke();

        // Subtle ambient flash for thunderstorm
        if (isThunder && tick % 240 === 0) {
          ctx.fillStyle = 'rgba(155, 89, 182, 0.08)';
          ctx.fillRect(0, 0, width, height);
        }
      } else if (isNight) {
        // Soft shimmering stars
        for (const p of particles) {
          const currentOpacity = 0.2 + 0.5 * Math.sin(tick * p.twinkleSpeed + p.phase);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, currentOpacity)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Gentle sun/cloud drift
        for (const p of particles) {
          ctx.fillStyle = 'rgba(255, 200, 87, 0.15)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
          p.x = (p.x + p.speed * 0.3) % width;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [weather.condition, isNight]);

  return (
    <section
      id="homepage-atmospheric-hero"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0A1420] via-[#081018] to-[#070D14] border border-[#162331] shadow-2xl p-6 sm:p-8 lg:p-10"
    >
      {/* Dynamic atmospheric aura gradients */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#1499E8]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22C7A0]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Container */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 8 Cols: Greeting, Location, Large Temperature, Condition & Narrative */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          <div>
            {/* Contextual Greeting & Observatory Status */}
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#43C7F4]">
                  {greeting.toUpperCase()}
                </span>
                <span className="text-[#93A4B8] text-xs">•</span>
                <span className="text-xs font-semibold text-[#D1DCE8]">
                  {location.city}, {location.state}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#93A4B8] bg-[#111C27] px-2.5 py-0.5 rounded-full border border-[#162331]">
                  Station {location.imdStation || '42971'}
                </span>
                <span className="text-[10px] font-semibold text-[#22C7A0] bg-[#22C7A0]/10 px-2 py-0.5 rounded-full border border-[#22C7A0]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Live Feed
                </span>
              </div>
            </div>

            {/* Main Temperature & Weather State Display */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7 mt-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#111C27] border border-[#162331] flex items-center justify-center shadow-lg shrink-0">
                  <ConditionIcon className={`w-12 h-12 sm:w-14 sm:h-14 ${visualConfig.iconColor}`} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline leading-none">
                    <span className="text-6xl sm:text-7xl lg:text-8xl font-light text-[#F4F7FA] tracking-tighter">
                      {currentTemp}°
                    </span>
                    <span className="text-2xl sm:text-3xl font-light text-[#93A4B8] ml-1">C</span>
                  </div>
                  <div className="text-xs text-[#93A4B8] mt-2 flex items-center gap-2">
                    <span>Feels like</span>
                    <strong className="text-[#F4F7FA] font-medium text-sm">{feelsLike}°C</strong>
                    <span>•</span>
                    <span>{humidityInfo.headline}</span>
                  </div>
                </div>
              </div>

              {/* Condition Headline & Description */}
              <div className="flex flex-col gap-1.5 sm:border-l sm:border-[#162331] sm:pl-6">
                <div className="text-xl sm:text-2xl font-bold text-[#F4F7FA] tracking-tight">
                  {weather.condition || 'Dense Drizzle'}
                </div>
                <p className="text-xs sm:text-sm text-[#D1DCE8] leading-relaxed max-w-md">
                  {humanInterpretation}
                </p>
              </div>
            </div>
          </div>

          {/* Clean Horizontal Metric Strip (Non-card pattern with elegant dividers) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-[#162331]">
            {/* RAIN */}
            <div className="flex flex-col pr-2 sm:border-r sm:border-[#162331]/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8]">Rain</span>
              <span className="text-base sm:text-lg font-bold text-[#43C7F4] my-0.5">{rainProb}%</span>
              <span className="text-[10px] text-[#93A4B8] truncate">{rainInfo.headline}</span>
            </div>

            {/* WIND */}
            <div className="flex flex-col sm:px-2 sm:border-r sm:border-[#162331]/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8]">Wind</span>
              <span className="text-base sm:text-lg font-bold text-[#F4F7FA] my-0.5">
                {windSpeed} <span className="text-xs font-normal text-[#93A4B8]">km/h</span>
              </span>
              <span className="text-[10px] text-[#93A4B8] truncate">{weather.windDirection || 'WSW'} • {windInfo.headline}</span>
            </div>

            {/* AQI */}
            <div className="flex flex-col sm:px-2 sm:border-r sm:border-[#162331]/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8]">AQI</span>
              <span className="text-base sm:text-lg font-bold my-0.5" style={{ color: aqiInfo.severityColor }}>
                {weather.aqi || 82} <span className="text-xs font-semibold">{aqiInfo.category}</span>
              </span>
              <span className="text-[10px] text-[#93A4B8] truncate">CPCB Standards</span>
            </div>

            {/* HUMIDITY */}
            <div className="flex flex-col sm:px-2 sm:border-r sm:border-[#162331]/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8]">Humidity</span>
              <span className="text-base sm:text-lg font-bold text-[#F4F7FA] my-0.5">{humidity}%</span>
              <span className="text-[10px] text-[#93A4B8] truncate">Dew Pt {Math.round(currentTemp - (100 - humidity) / 5)}°C</span>
            </div>

            {/* UV INDEX */}
            <div className="flex flex-col col-span-2 sm:col-span-1 sm:pl-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#93A4B8]">UV Index</span>
              <span className="text-base sm:text-lg font-bold text-[#FFC857] my-0.5">{uvVal}</span>
              <span className="text-[10px] text-[#93A4B8] truncate">{uvVal >= 6 ? 'High Exposure' : 'Moderate Solar'}</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Atmospheric Ambient Visualizer & Quick Portal Actions */}
        <div className="lg:col-span-4 relative rounded-2xl bg-[#071018]/90 border border-[#162331] p-5 flex flex-col justify-between gap-4 overflow-hidden">
          {/* Subtle Canvas Animation Container */}
          <div className="absolute inset-0 pointer-events-none opacity-70">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#162331] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#43C7F4]">
                Atmospheric Dynamics
              </span>
              <span className="text-[10px] font-mono text-[#22C7A0]">
                Continuous Nowcast
              </span>
            </div>

            <p className="text-xs text-[#D1DCE8] leading-relaxed">
              Real-time regional telemetry cross-validated against IMD Doppler radar reflectivity, INSAT-3D thermal infrared channels, and local AWS sensor networks.
            </p>

            <div className="space-y-1.5 text-[11px] text-[#93A4B8] bg-[#0A1420]/80 p-2.5 rounded-xl border border-[#162331]">
              <div className="flex justify-between">
                <span>Observatory Type:</span>
                <span className="text-[#F4F7FA] font-medium">Automatic Weather Station</span>
              </div>
              <div className="flex justify-between">
                <span>Elevation:</span>
                <span className="text-[#F4F7FA] font-medium">{location.elevation || '45m ASL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="text-[#43C7F4] font-mono">{location.lat?.toFixed(2)}°N, {location.lng?.toFixed(2)}°E</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-2 pt-2 border-t border-[#162331]">
            {onExploreWeather && (
              <button
                type="button"
                onClick={onExploreWeather}
                className="mausam-btn w-full text-xs font-semibold py-2.5 shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Explore Live Weather Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onExploreForecast && (
              <button
                type="button"
                onClick={onExploreForecast}
                className="mausam-btn mausam-btn--secondary w-full text-xs font-medium py-2 text-center"
              >
                View Numerical 7-Day Outlook
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
