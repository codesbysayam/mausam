import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  CurrentWeather,
  WeatherAlert,
  WeatherStation,
  NavigationTab,
  HistoricalTrendPoint,
} from '../types';
import { IstClock } from './IstClock';
import { resolveVisualState, tokens } from '../theme/tokens';

interface OverviewViewProps {
  weather: CurrentWeather;
  alerts: WeatherAlert[];
  trends?: HistoricalTrendPoint[];
  onOpenTelemetry?: (title: string, value: string | number, unit: string) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  onSelectStation?: (station: WeatherStation) => void;
  onRefreshWeather?: () => void;
  isRefreshing?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  weather,
  alerts,
  trends = [],
  onOpenTelemetry,
  onNavigateTab,
  onSelectStation,
  onRefreshWeather,
  isRefreshing = false,
}) => {
  const [hoverFeature, setHoverFeature] = useState<'crowdsource' | 'agromet' | null>(null);
  const [chartMode, setChartMode] = useState<'combined' | 'temp' | 'humidity'>('combined');
  const [selectedPersona, setSelectedPersona] = useState<string>('fitness');

  // Resolve centralized visual configuration
  const visualState = resolveVisualState(
    weather.condition,
    weather.weatherType,
    weather.temp,
    weather.isRainingNow
  );

  // Calculate quick summary metrics from trends
  const trendData =
    trends.length > 0
      ? trends
      : [
          { time: '00:00', temp: 24.2, humidity: 82, pressure: 1011.5, windSpeed: 10, rain: 0 },
          { time: '04:00', temp: 23.0, humidity: 88, pressure: 1011.2, windSpeed: 8, rain: 0 },
          { time: '08:00', temp: 27.5, humidity: 74, pressure: 1012.8, windSpeed: 12, rain: 0 },
          { time: '12:00', temp: 33.1, humidity: 58, pressure: 1010.4, windSpeed: 16, rain: 0 },
          { time: '16:00', temp: 31.8, humidity: 64, pressure: 1009.8, windSpeed: 14, rain: 0 },
          { time: '20:00', temp: 28.0, humidity: 76, pressure: 1011.0, windSpeed: 11, rain: 0 },
        ];

  const maxTemp = Math.max(...trendData.map((d) => d.temp));
  const minTemp = Math.min(...trendData.map((d) => d.temp));
  const avgHumidity = Math.round(
    trendData.reduce((acc, d) => acc + d.humidity, 0) / trendData.length
  );
  const totalRain24h = trendData.reduce((acc, d) => acc + (d.rain || 0), 0).toFixed(1);

  // AQI color logic
  const getAqiColor = (val: number) => {
    if (val <= 50) return tokens.colors.status.success;
    if (val <= 100) return tokens.colors.status.warning;
    return tokens.colors.status.danger;
  };

  const aqiColor = getAqiColor(weather.aqiPm25);

  const personas = [
    { id: 'fitness', label: 'Fitness & Running', icon: 'directions_run' },
    { id: 'commuting', label: 'Commute & Travel', icon: 'directions_car' },
    { id: 'family', label: 'Family & Outdoors', icon: 'family_restroom' },
    { id: 'agriculture', label: 'Farmer & Crops', icon: 'agriculture' },
    { id: 'health', label: 'Health & Air Quality', icon: 'health_and_safety' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto select-none font-sans">
      {/* 1. Real-Time IST System Clock & Synchronized Observation Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8">
          <IstClock showDate={true} showSeconds={true} allowAnalogToggle={true} />
        </div>

        <div className="md:col-span-4 bg-[#1E2733] card-border rounded-xl p-3.5 flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="text-[12px] text-[#4FA8E0] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
              {weather.isLive ? 'Live IMD Telemetry Feed' : 'Local Sensor Model'}
            </span>
            <span className="text-xs text-[#8A94A6] mt-0.5">
              {weather.lastUpdated}
            </span>
          </div>

          {onRefreshWeather && (
            <button
              onClick={onRefreshWeather}
              disabled={isRefreshing}
              title="Synchronize Live Surface Telemetry"
              className="p-2 rounded-lg bg-[#0B72B9]/15 border border-[#0B72B9]/30 hover:bg-[#0B72B9] hover:text-[#FFFFFF] text-[#4FA8E0] transition-all cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Active Severe Weather Alert Notification (Restrained styling) */}
      {alerts.length > 0 && (
        <div className="bg-[#1E2733] border-l-4 border-l-[#E74C3C] card-border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#E74C3C]/20 border border-[#E74C3C]/40 flex items-center justify-center text-[#E74C3C] shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                warning
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#E74C3C] uppercase tracking-wider">
                  {alerts[0].agency}
                </span>
                <span className="text-xs text-[#8A94A6]">
                  Valid until {alerts[0].validUntil}
                </span>
              </div>
              <h4 className="font-h4 text-sm font-semibold text-[#FFFFFF]">
                {alerts[0].title}: {alerts[0].description}
              </h4>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('radar')}
            className="px-3.5 py-1.5 rounded-lg bg-[#E74C3C] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C0392B] transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            View Radar &rarr;
          </button>
        </div>
      )}

      {/* 3. Hero Current Weather & Station Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Station Weather Reading (Span 7) */}
        <div className="lg:col-span-7 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <span className="text-xs text-[#4FA8E0] font-semibold block mb-1">
                  IMD Synoptic Surface Station • ID: {weather.stationCode}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                  {weather.stationName}
                </h2>
                <p className="text-xs text-[#8A94A6] mt-0.5">
                  Source: {weather.source}
                </p>
              </div>

              {/* Station Status Pill */}
              <span className="px-2.5 py-1 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-[11px] font-semibold border border-[#2ECC71]/30 shrink-0">
                {weather.isLive ? 'Active Transmission' : 'Synchronized'}
              </span>
            </div>

            {/* Main Temperature & Weather Condition Hero */}
            <div className="flex flex-wrap items-center gap-6 py-2">
              <div className="flex items-baseline gap-1">
                <span className="font-temp-hero text-6xl sm:text-7xl font-bold text-[#FFFFFF] tracking-tight">
                  {weather.temp}
                </span>
                <span className="text-3xl sm:text-4xl text-[#4FA8E0] font-light">
                  °C
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[30px]"
                    style={{ color: visualState.accentColor }}
                  >
                    {visualState.icon}
                  </span>
                  <span className="font-h3 text-xl font-bold text-[#FFFFFF]">
                    {weather.condition}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8A94A6]">
                  <span>Feels like <strong className="text-[#FFFFFF]">{Math.round(weather.temp + 1)}°C</strong></span>
                  <span>•</span>
                  <span>High: <strong className="text-[#FFFFFF]">{weather.high}°C</strong></span>
                  <span>•</span>
                  <span>Low: <strong className="text-[#FFFFFF]">{weather.low}°C</strong></span>
                </div>
              </div>
            </div>

            {/* Rain Status & Forecast Probability Resolver Banner (Strictly truthful) */}
            <div
              className={`mt-3 py-2.5 px-3.5 rounded-lg border flex items-center justify-between text-xs ${
                weather.isRainingNow
                  ? 'bg-[#3A6EA5]/25 border-[#3A6EA5]/50 text-[#FFFFFF]'
                  : 'bg-[#0F141A]/70 border-[rgba(225,230,235,0.12)] text-[#8A94A6]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    weather.isRainingNow ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'
                  }`}
                >
                  {weather.isRainingNow ? 'water_drop' : 'cloud_sync'}
                </span>
                <div>
                  <span className="font-semibold block text-[#FFFFFF]">
                    {weather.isRainingNow
                      ? `Active Rain: ${weather.precipitation.toFixed(1)} mm/hr`
                      : 'No Active Rain Currently'}
                  </span>
                  <span className="text-[11px] text-[#8A94A6]">
                    {weather.rainExpectedSummary ||
                      (weather.precipitationProbability > 0
                        ? `${weather.precipitationProbability}% rain chance in forecast`
                        : 'Dry conditions expected')}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase text-[#4FA8E0] font-semibold">
                  Rain Probability
                </span>
                <span className="block text-sm font-bold text-[#4FA8E0]">
                  {weather.precipitationProbability}%
                </span>
              </div>
            </div>

            {/* Contextual Solar & Day Cycle Indicators (Noto Sans & font-metadata styling from weather payload) */}
            <div className="mt-3 p-3.5 bg-[#0F141A]/90 rounded-lg border border-[rgba(225,230,235,0.12)] flex flex-col gap-2.5 font-metadata text-xs text-[#8A94A6]">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Sunrise Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#FFB703]/15 border border-[#FFB703]/30 flex items-center justify-center text-[#FFB703]">
                    <span className="material-symbols-outlined text-[17px]">wb_twilight</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block leading-none font-semibold">
                      Sunrise
                    </span>
                    <span className="font-semibold text-[#FFFFFF] text-xs leading-tight">
                      {weather.sunrise || '05:32 AM'} <span className="text-[10px] text-[#8A94A6]">IST</span>
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-6 w-px bg-[rgba(225,230,235,0.12)]"></div>

                {/* Solar Noon / Zenith */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#FF8C42]/15 border border-[#FF8C42]/30 flex items-center justify-center text-[#FF8C42]">
                    <span className="material-symbols-outlined text-[17px]">wb_sunny</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block leading-none font-semibold">
                      Solar Noon
                    </span>
                    <span className="font-semibold text-[#FFFFFF] text-xs leading-tight">
                      {weather.solarNoon || '12:15 PM'} <span className="text-[10px] text-[#8A94A6]">(Zenith)</span>
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-6 w-px bg-[rgba(225,230,235,0.12)]"></div>

                {/* Sunset Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#9B59B6]/15 border border-[#9B59B6]/30 flex items-center justify-center text-[#9B59B6]">
                    <span className="material-symbols-outlined text-[17px]">nights_stay</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block leading-none font-semibold">
                      Sunset
                    </span>
                    <span className="font-semibold text-[#FFFFFF] text-xs leading-tight">
                      {weather.sunset || '06:18 PM'} <span className="text-[10px] text-[#8A94A6]">IST</span>
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-6 w-px bg-[rgba(225,230,235,0.12)]"></div>

                {/* Daylight Duration */}
                <div className="flex items-center gap-1.5 bg-[#1E2733] px-2.5 py-1.5 rounded-md border border-[rgba(225,230,235,0.12)] text-[11px]">
                  <span className="material-symbols-outlined text-[#4FA8E0] text-[15px]">schedule</span>
                  <span>Daylight: <strong className="text-[#FFFFFF]">{weather.daylightDuration || '12h 46m'}</strong></span>
                </div>
              </div>

              {/* Daylight Progress Trajectory Bar */}
              <div className="pt-1.5 border-t border-[rgba(225,230,235,0.08)] flex items-center justify-between text-[11px] text-[#8A94A6]">
                <span className="flex items-center gap-1.5">
                  <span>Dawn: <strong className="text-[#F4F7FA]">{weather.dawnTime || '05:10 AM'}</strong></span>
                  <span>•</span>
                  <span>Dusk: <strong className="text-[#FFB703]">{weather.duskTime || '06:40 PM'}</strong></span>
                </span>
                <span className="text-[#4FA8E0] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">explore</span>
                  Solar Elevation: {weather.solarElevationDeg !== undefined ? `${weather.solarElevationDeg > 0 ? `+${weather.solarElevationDeg}` : weather.solarElevationDeg}°` : '+48°'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Atmospheric Metrics Strip (Clickable for diagnostic details) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 border-t border-[rgba(225,230,235,0.12)]">
            {/* 1. Real-time Temperature */}
            <div
              onClick={() =>
                onOpenTelemetry &&
                onOpenTelemetry('Temperature & Heat Index', `${weather.temp}°C`, '°C')
              }
              className="bg-[#0F141A] p-2.5 rounded-lg card-border hover:border-[#0B72B9] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[11px] text-[#8A94A6] block font-medium">Temperature</span>
              <span className="text-base font-bold text-[#FFFFFF] my-0.5">
                {weather.temp}°C
              </span>
              <span className="text-[10px] text-[#4FA8E0] block truncate">
                H: {weather.high}° | L: {weather.low}°
              </span>
            </div>

            {/* 2. Relative Humidity */}
            <div
              onClick={() =>
                onOpenTelemetry &&
                onOpenTelemetry('Relative Humidity', `${weather.humidity}%`, '%')
              }
              className="bg-[#0F141A] p-2.5 rounded-lg card-border hover:border-[#0B72B9] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[11px] text-[#8A94A6] block font-medium">Humidity</span>
              <span className="text-base font-bold text-[#FFFFFF] my-0.5">
                {weather.humidity}%
              </span>
              <span className="text-[10px] text-[#2ECC71] block truncate">
                Dew Pt: {weather.dewPoint}°C
              </span>
            </div>

            {/* 3. Real-time AQI */}
            <div
              onClick={() =>
                onOpenTelemetry &&
                onOpenTelemetry('Air Quality PM2.5', weather.aqiPm25, 'µg/m³')
              }
              className="bg-[#0F141A] p-2.5 rounded-lg card-border hover:border-[#0B72B9] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[11px] text-[#8A94A6] block font-medium">Air Quality</span>
              <span
                className="text-base font-bold my-0.5"
                style={{ color: aqiColor }}
              >
                {weather.aqiIndex ?? weather.aqiPm25} <span className="text-[10px] font-normal text-[#8A94A6]">AQI</span>
              </span>
              <span className="text-[10px] text-[#8A94A6] block truncate">
                PM2.5: {weather.aqiPm25} µg/m³
              </span>
            </div>

            {/* 4. Real-time Pollen Count */}
            <div
              onClick={() =>
                onOpenTelemetry &&
                onOpenTelemetry('Pollen Count & Allergens', `${weather.pollenCount ?? 8} grains/m³`, 'grains/m³')
              }
              className="bg-[#0F141A] p-2.5 rounded-lg card-border hover:border-[#0B72B9] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[11px] text-[#8A94A6] block font-medium">Pollen Count</span>
              <span className="text-base font-bold text-[#FFB703] my-0.5">
                {weather.pollenCount ?? 8} <span className="text-[10px] font-normal text-[#8A94A6]">grains/m³</span>
              </span>
              <span className="text-[10px] text-[#2ECC71] block truncate">
                Risk: {weather.pollen}
              </span>
            </div>

            {/* 5. Wind Velocity */}
            <div
              onClick={() =>
                onOpenTelemetry &&
                onOpenTelemetry('Wind Velocity', `${weather.windSpeed} km/h`, 'km/h')
              }
              className="bg-[#0F141A] p-2.5 rounded-lg card-border hover:border-[#0B72B9] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[11px] text-[#8A94A6] block font-medium">Wind Velocity</span>
              <span className="text-base font-bold text-[#FFFFFF] my-0.5">
                {weather.windSpeed} <span className="text-[10px] font-normal text-[#8A94A6]">km/h</span>
              </span>
              <span className="text-[10px] text-[#4FA8E0] block truncate">
                {weather.windDirection}
              </span>
            </div>

            {/* 6. Air Pressure */}
            <div
              onClick={() =>
                onOpenTelemetry &&
                onOpenTelemetry('Barometric Pressure', `${weather.pressure} hPa`, 'hPa')
              }
              className="bg-[#0F141A] p-2.5 rounded-lg card-border hover:border-[#0B72B9] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[11px] text-[#8A94A6] block font-medium">Air Pressure</span>
              <span className="text-base font-bold text-[#FFFFFF] my-0.5">
                {weather.pressure} <span className="text-[10px] font-normal text-[#8A94A6]">hPa</span>
              </span>
              <span className="text-[10px] text-[#8A94A6] block truncate">
                Mean Sea Level
              </span>
            </div>
          </div>
        </div>

        {/* 4. Personalized Weather & Actionable Intelligence (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Personalized Context Card ("What does the weather mean for me?") */}
          <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0B72B9] text-[20px]">
                    insights
                  </span>
                  <h3 className="font-h3 text-sm font-bold text-[#FFFFFF]">
                    Personalized Weather Insights
                  </h3>
                </div>
                <span className="text-[11px] text-[#8A94A6]">Contextual Guidance</span>
              </div>

              {/* Persona Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPersona === p.id
                        ? 'bg-[#0B72B9] text-[#FFFFFF]'
                        : 'bg-[#0F141A] text-[#8A94A6] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Context Content based on active persona */}
              <div className="bg-[#0F141A] p-3.5 rounded-lg border border-[rgba(225,230,235,0.12)]">
                {selectedPersona === 'fitness' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#2ECC71] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Good Conditions for Outdoor Running
                      </span>
                      <span className="text-[#8A94A6]">Best: 06:00 - 08:30 AM</span>
                    </div>
                    <p className="text-xs text-[#8A94A6] leading-relaxed">
                      Morning temperatures around 24°C with gentle 12 km/h breeze. UV Index peaks around 12:30 PM (7.4 UV); stay hydrated if exercising outdoors past 10:00 AM.
                    </p>
                  </div>
                )}

                {selectedPersona === 'commuting' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#4FA8E0] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">traffic</span>
                        Dry Asphalt &amp; Clear Visibility
                      </span>
                      <span className="text-[#8A94A6]">Visibility: 10 km</span>
                    </div>
                    <p className="text-xs text-[#8A94A6] leading-relaxed">
                      No active precipitation or fog affecting urban roads or highways. Low risk of hydroplaning or squall delays for local travel across coastal Odisha corridors.
                    </p>
                  </div>
                )}

                {selectedPersona === 'family' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#FFB703] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                        Suitable for Evening Park Outings
                      </span>
                      <span className="text-[#8A94A6]">Sunset: 06:18 PM</span>
                    </div>
                    <p className="text-xs text-[#8A94A6] leading-relaxed">
                      Afternoon heat index feels like 34°C. Optimal window for family walks and playgrounds is after 04:30 PM as solar radiation tapers off.
                    </p>
                  </div>
                )}

                {selectedPersona === 'agriculture' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#2ECC71] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">agriculture</span>
                        Favorable for Field Prep &amp; Sowing
                      </span>
                      <span className="text-[#8A94A6]">Meghdoot Advisory</span>
                    </div>
                    <p className="text-xs text-[#8A94A6] leading-relaxed">
                      Relative humidity at 68% with low immediate rainfall probability. Suitable for foliar spraying and top dressing in paddy and vegetable nurseries.
                    </p>
                  </div>
                )}

                {selectedPersona === 'health' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#2ECC71] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">air</span>
                        Air Quality: {weather.aqiPm25} (Good)
                      </span>
                      <span className="text-[#8A94A6]">Pollen: Low</span>
                    </div>
                    <p className="text-xs text-[#8A94A6] leading-relaxed">
                      Satisfactory air quality suitable for normal outdoor activities. No heightened risk for individuals with asthma or respiratory sensitivities today.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[rgba(225,230,235,0.12)] flex justify-between items-center text-xs">
              <span className="text-[#8A94A6]">Personalized via AI Logic</span>
              <button
                onClick={() => onNavigateTab && onNavigateTab('tools')}
                className="text-[#0B72B9] hover:text-[#4FA8E0] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Analysis &rarr;</span>
              </button>
            </div>
          </div>

          {/* Quick Feature Shortcut Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Crowdsource Shortcut */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('crowdsource')}
              className="p-4 rounded-xl card-border bg-[#1E2733] hover:border-[#0B72B9] shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
                  groups
                </span>
                <span className="text-xs font-bold text-[#FFFFFF]">Crowd Source</span>
              </div>
              <p className="text-[11px] text-[#8A94A6] leading-snug">
                Submit live local weather ground-truth to IMD.
              </p>
              <span className="text-[11px] text-[#4FA8E0] font-semibold mt-2 block">
                Report Weather &rarr;
              </span>
            </div>

            {/* Agromet Shortcut */}
            <div
              onClick={() => onNavigateTab && onNavigateTab('agromet')}
              className="p-4 rounded-xl card-border bg-[#1E2733] hover:border-[#2ECC71] shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-[#2ECC71] text-[20px]">
                  agriculture
                </span>
                <span className="text-xs font-bold text-[#FFFFFF]">Agromet Bulletins</span>
              </div>
              <p className="text-[11px] text-[#8A94A6] leading-snug">
                Crop-specific farming weather advisories.
              </p>
              <span className="text-[11px] text-[#2ECC71] font-semibold mt-2 block">
                Read Meghdoot &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 24-Hour Historical Trends Chart Card */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col gap-5">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[rgba(225,230,235,0.12)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#0B72B9] text-[22px]">
                show_chart
              </span>
              <h3 className="font-h3 text-lg font-semibold text-[#FFFFFF]">
                Past 24-Hour Historical Weather Trends
              </h3>
            </div>
            <p className="font-body-md text-xs text-[#8A94A6]">
              Continuous telemetry readings of temperature (°C) and relative humidity (%) from automated station sensors.
            </p>
          </div>

          {/* Toggle buttons for chart view mode */}
          <div className="flex items-center gap-1.5 bg-[#0F141A] p-1 rounded-lg border border-[rgba(225,230,235,0.12)] self-start sm:self-auto">
            <button
              onClick={() => setChartMode('combined')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                chartMode === 'combined'
                  ? 'bg-[#0B72B9] text-[#FFFFFF]'
                  : 'text-[#8A94A6] hover:text-[#FFFFFF]'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setChartMode('temp')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                chartMode === 'temp'
                  ? 'bg-[#FFB703] text-[#0F141A]'
                  : 'text-[#8A94A6] hover:text-[#FFFFFF]'
              }`}
            >
              Temperature (°C)
            </button>
            <button
              onClick={() => setChartMode('humidity')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                chartMode === 'humidity'
                  ? 'bg-[#2ECC71] text-[#0F141A]'
                  : 'text-[#8A94A6] hover:text-[#FFFFFF]'
              }`}
            >
              Humidity (%)
            </button>
          </div>
        </div>

        {/* 24-Hour Statistical Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0F141A] p-3 rounded-lg border border-[rgba(225,230,235,0.12)]">
            <span className="text-[11px] text-[#8A94A6] block">24h Max Temp</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-[#FFB703]">{maxTemp}°C</span>
              <span className="text-[10px] text-[#8A94A6]">(Peak IST)</span>
            </div>
          </div>

          <div className="bg-[#0F141A] p-3 rounded-lg border border-[rgba(225,230,235,0.12)]">
            <span className="text-[11px] text-[#8A94A6] block">24h Min Temp</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-[#4FA8E0]">{minTemp}°C</span>
              <span className="text-[10px] text-[#8A94A6]">(Dawn IST)</span>
            </div>
          </div>

          <div className="bg-[#0F141A] p-3 rounded-lg border border-[rgba(225,230,235,0.12)]">
            <span className="text-[11px] text-[#8A94A6] block">Mean Humidity</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-[#2ECC71]">{avgHumidity}%</span>
              <span className="text-[10px] text-[#8A94A6]">(Relative avg)</span>
            </div>
          </div>

          <div className="bg-[#0F141A] p-3 rounded-lg border border-[rgba(225,230,235,0.12)]">
            <span className="text-[11px] text-[#8A94A6] block">24h Cumulative Rain</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-[#9B59B6]">{totalRain24h} mm</span>
              <span className="text-[10px] text-[#8A94A6]">(Surface gauge)</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB703" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB703" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2ECC71" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(225,230,235,0.12)"
                opacity={0.6}
              />

              <XAxis
                dataKey="time"
                stroke="#8A94A6"
                tick={{ fill: '#8A94A6', fontSize: 11, fontFamily: 'Noto Sans, sans-serif' }}
                tickLine={{ stroke: 'rgba(225,230,235,0.12)' }}
                interval={2}
              />

              <YAxis
                yAxisId="left"
                domain={[15, 42]}
                stroke="#FFB703"
                tick={{ fill: '#FFB703', fontSize: 11, fontFamily: 'Noto Sans, sans-serif' }}
                tickLine={{ stroke: 'rgba(225,230,235,0.12)' }}
                unit="°"
                hide={chartMode === 'humidity'}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[30, 100]}
                stroke="#2ECC71"
                tick={{ fill: '#2ECC71', fontSize: 11, fontFamily: 'Noto Sans, sans-serif' }}
                tickLine={{ stroke: 'rgba(225,230,235,0.12)' }}
                unit="%"
                hide={chartMode === 'temp'}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0F141A] border border-[rgba(225,230,235,0.15)] p-3 rounded-lg shadow-2xl text-xs font-sans">
                        <div className="text-[#4FA8E0] font-semibold mb-1.5 pb-1 border-b border-[rgba(225,230,235,0.12)]">
                          {label} (IST)
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between gap-4 text-[#FFB703]">
                            <span>Temperature:</span>
                            <span className="font-bold">{data.temp} °C</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#2ECC71]">
                            <span>Relative Humidity:</span>
                            <span className="font-bold">{data.humidity} %</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#FFFFFF]">
                            <span>Air Pressure:</span>
                            <span className="font-bold">{data.pressure} hPa</span>
                          </div>
                          <div className="flex justify-between gap-4 text-[#4FA8E0]">
                            <span>Wind Speed:</span>
                            <span className="font-bold">{data.windSpeed} km/h</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: 10,
                  fontSize: 12,
                  fontFamily: 'Noto Sans, sans-serif',
                }}
              />

              {(chartMode === 'combined' || chartMode === 'temp') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  name="Temperature (°C)"
                  stroke="#FFB703"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              )}

              {(chartMode === 'combined' || chartMode === 'humidity') && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="Relative Humidity (%)"
                  stroke="#2ECC71"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#humidityGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
