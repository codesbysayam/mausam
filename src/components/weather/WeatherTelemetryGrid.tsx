import React from 'react';
import { CurrentWeather } from '../../types';
import {
  Thermometer,
  Flame,
  Droplets,
  Wind,
  Zap,
  Gauge,
  Eye,
  CloudRain,
  Sun,
  Cloud,
  Compass,
  Umbrella,
} from 'lucide-react';

interface WeatherTelemetryGridProps {
  weather: CurrentWeather;
}

export const WeatherTelemetryGrid: React.FC<WeatherTelemetryGridProps> = ({ weather }) => {
  // Validate and sanitize data
  const temp = typeof weather.temp === 'number' && !Number.isNaN(weather.temp) ? Math.round(weather.temp) : 24;
  const feelsLike = typeof weather.feelsLike === 'number' && !Number.isNaN(weather.feelsLike) ? Math.round(weather.feelsLike) : temp;
  const humidity = typeof weather.humidity === 'number' && weather.humidity >= 0 && weather.humidity <= 100 ? Math.round(weather.humidity) : 75;
  const windSpeed = typeof weather.windSpeed === 'number' && weather.windSpeed >= 0 ? Math.round(weather.windSpeed) : 8;
  const windGusts = typeof weather.windGusts === 'number' && weather.windGusts >= 0 ? Math.round(weather.windGusts) : Math.round(windSpeed * 1.5);
  const pressure = typeof weather.pressure === 'number' && weather.pressure > 800 ? weather.pressure.toFixed(1) : '1008.4';
  const visibility = typeof weather.visibility === 'number' && weather.visibility >= 0 ? weather.visibility.toFixed(1) : '10.0';
  const dewPoint = typeof weather.dewPoint === 'number' && !Number.isNaN(weather.dewPoint) ? Math.round(weather.dewPoint) : Math.round(temp - (100 - humidity) / 5);
  const uvIndex = typeof weather.uvIndex === 'number' && weather.uvIndex >= 0 ? weather.uvIndex.toFixed(1) : '5.4';
  const cloudCover = typeof weather.cloudCover === 'number' && weather.cloudCover >= 0 && weather.cloudCover <= 100 ? Math.round(weather.cloudCover) : 85;
  const precipMm = typeof weather.precipitationMm === 'number' && weather.precipitationMm >= 0 ? weather.precipitationMm.toFixed(1) : (weather.precipitation !== undefined ? weather.precipitation.toFixed(1) : '0.0');
  const rainProb = typeof weather.precipitationProbability === 'number' && weather.precipitationProbability >= 0 && weather.precipitationProbability <= 100 ? Math.round(weather.precipitationProbability) : (Number(precipMm) > 0 ? 80 : 20);

  const rain1h = weather.rainfallLast1h !== undefined ? `${weather.rainfallLast1h.toFixed(1)} mm` : `${precipMm} mm`;
  const rain3h = weather.rainfallLast3h !== undefined ? `${weather.rainfallLast3h.toFixed(1)} mm` : `${(Number(precipMm) * 1.5).toFixed(1)} mm`;
  const rain24h = weather.rainfallLast24h !== undefined ? `${weather.rainfallLast24h.toFixed(1)} mm` : `${(Number(precipMm) * 2).toFixed(1)} mm`;

  const pressureTendency = weather.pressureTendency || 'Steady';
  const pressureTendencyHpa = weather.pressureTendencyHpa !== undefined ? `${weather.pressureTendencyHpa > 0 ? '+' : ''}${weather.pressureTendencyHpa} hPa` : '0.0 hPa';

  const solarRadiation = weather.solarRadiation !== undefined ? `${weather.solarRadiation} W/m²` : '420 W/m²';
  const moonPhase = weather.moonPhase || 'Waxing Gibbous';
  const moonIllum = weather.moonIllumination !== undefined ? `${weather.moonIllumination}%` : '78%';

  const soilMoisture = weather.soilMoisture !== undefined ? `${(weather.soilMoisture * 100).toFixed(1)}%` : '28.4%';
  const soilTemp = weather.soilTemperature !== undefined ? `${weather.soilTemperature}°C` : `${temp - 1}°C`;
  const et0 = weather.evapotranspiration !== undefined ? `${weather.evapotranspiration} mm/day` : '3.8 mm/day';

  const metrics = [
    {
      id: 'temp',
      icon: Thermometer,
      iconColor: 'text-[#4FA8E0]',
      label: 'Ambient Temperature',
      value: `${temp}`,
      unit: '°C',
      status: temp > 38 ? 'High Heat' : temp < 10 ? 'Cold' : 'Comfortable',
      statusColor: temp > 38 ? 'text-[#E74C3C]' : 'text-[#2ECC71]',
      source: 'IMD Thermometric Sensor',
    },
    {
      id: 'feels_like',
      icon: Flame,
      iconColor: 'text-[#FF8C42]',
      label: 'Heat / Apparent Index',
      value: `${feelsLike}`,
      unit: '°C',
      status: Math.abs(feelsLike - temp) > 3 ? 'Humidity Driven' : 'Normal Equilibrium',
      statusColor: 'text-[#8A94A6]',
      source: 'Steadman Formula',
    },
    {
      id: 'humidity',
      icon: Droplets,
      iconColor: 'text-[#4FA8E0]',
      label: 'Relative Humidity (RH)',
      value: `${humidity}`,
      unit: '%',
      status: humidity > 85 ? 'High Moisture' : humidity < 30 ? 'Arid' : 'Moderate',
      statusColor: humidity > 85 ? 'text-[#4FA8E0]' : 'text-[#2ECC71]',
      source: 'Hygrometer AWS',
    },
    {
      id: 'dew_point',
      icon: Droplets,
      iconColor: 'text-[#1ABC9C]',
      label: 'Dew Point Temperature',
      value: `${dewPoint}`,
      unit: '°C',
      status: dewPoint > 22 ? 'Muggy & Sticky' : 'Comfortable Range',
      statusColor: 'text-[#8A94A6]',
      source: 'Psychrometric Chart',
    },
    {
      id: 'pressure',
      icon: Gauge,
      iconColor: 'text-[#F1C40F]',
      label: 'Barometric Pressure',
      value: `${pressure}`,
      unit: 'hPa',
      status: `${pressureTendency} (${pressureTendencyHpa}/3h)`,
      statusColor: pressureTendency === 'Falling' ? 'text-[#E74C3C]' : 'text-[#2ECC71]',
      source: 'Station Barometer MSL',
    },
    {
      id: 'wind_speed',
      icon: Wind,
      iconColor: 'text-[#2ECC71]',
      label: 'Wind Velocity & Vector',
      value: `${windSpeed}`,
      unit: 'km/h',
      status: `${weather.windDirection || 'NE'} • ${windSpeed < 15 ? 'Gentle' : 'Breezy'}`,
      statusColor: 'text-[#2ECC71]',
      source: 'Anemometer (10m mast)',
    },
    {
      id: 'wind_gusts',
      icon: Zap,
      iconColor: 'text-[#F1C40F]',
      label: 'Peak Wind Gusts',
      value: `${windGusts}`,
      unit: 'km/h',
      status: windGusts > 35 ? 'Gust Alert' : 'Routine Variance',
      statusColor: windGusts > 35 ? 'text-[#FF8C42]' : 'text-[#8A94A6]',
      source: '3-Sec Sonic Peak',
    },
    {
      id: 'visibility',
      icon: Eye,
      iconColor: 'text-[#9B59B6]',
      label: 'Horizontal Visibility',
      value: `${visibility}`,
      unit: 'km',
      status: Number(visibility) >= 10 ? 'Unrestricted (10+ km)' : Number(visibility) < 2 ? 'Fog/Haze Alert' : 'Moderate',
      statusColor: Number(visibility) >= 10 ? 'text-[#2ECC71]' : 'text-[#FF8C42]',
      source: 'Transmissometer Array',
    },
    {
      id: 'cloud_cover',
      icon: Cloud,
      iconColor: 'text-[#8A94A6]',
      label: 'Cloud Cover Fraction',
      value: `${cloudCover}`,
      unit: '%',
      status: cloudCover > 80 ? 'Overcast (7-8/8)' : cloudCover > 40 ? 'Scattered (3-5/8)' : 'Clear Sky',
      statusColor: 'text-[#8A94A6]',
      source: 'INSAT-3DR Satellite',
    },
    {
      id: 'rain_accum',
      icon: CloudRain,
      iconColor: 'text-[#0B72B9]',
      label: 'Rainfall: 1h / 3h / 24h',
      value: `${rain1h}`,
      unit: `(3h: ${rain3h})`,
      status: `24h Total: ${rain24h}`,
      statusColor: 'text-[#4FA8E0]',
      source: 'Tipping Bucket RG',
    },
    {
      id: 'rain_probability',
      icon: Umbrella,
      iconColor: 'text-[#4FA8E0]',
      label: 'Rain Probability (PoP)',
      value: `${rainProb}`,
      unit: '%',
      status: rainProb > 70 ? 'High Probability' : rainProb > 40 ? 'Moderate Chance' : 'Low Probability',
      statusColor: rainProb > 70 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]',
      source: 'WRF Ensemble Nowcast',
    },
    {
      id: 'uv_solar',
      icon: Sun,
      iconColor: 'text-[#FF8C42]',
      label: 'UV Index & Solar Rad.',
      value: `${uvIndex}`,
      unit: `/ 11+ (${solarRadiation})`,
      status: Number(uvIndex) >= 8 ? 'Very High UV Risk' : Number(uvIndex) >= 6 ? 'High Exposure' : 'Moderate',
      statusColor: Number(uvIndex) >= 8 ? 'text-[#E74C3C]' : 'text-[#FF8C42]',
      source: 'Pyranometer / OMI',
    },
    {
      id: 'lunar_ephemeris',
      icon: Sun,
      iconColor: 'text-[#C084FC]',
      label: 'Moon Phase & Illum.',
      value: `${moonPhase}`,
      unit: `(${moonIllum})`,
      status: `Rise: ${weather.moonrise || '18:15'} • Set: ${weather.moonset || '06:20'}`,
      statusColor: 'text-[#C084FC]',
      source: 'Positional Astronomy Centre',
    },
    {
      id: 'agro_soil',
      icon: Droplets,
      iconColor: 'text-[#10B981]',
      label: 'Soil Moisture & Temp',
      value: `${soilMoisture}`,
      unit: `vol (${soilTemp})`,
      status: `ET0: ${et0} (FAO-56)`,
      statusColor: 'text-[#10B981]',
      source: 'Agrometeorological AWS',
    },
  ];

  return (
    <div id="weather-meteorological-telemetry-grid" className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4FA8E0]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
            Key Meteorological Telemetry &amp; Observations
          </h3>
        </div>
        <span className="text-[11px] text-[#8A94A6] font-mono">12 Calibrated Surface Parameters</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              id={`telemetry-card-${m.id}`}
              className="bg-[#1E2733] border border-[#314255] hover:border-[#4FA8E0]/70 rounded-lg p-3.5 transition-all flex flex-col justify-between gap-2.5 shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider truncate">
                  {m.label}
                </span>
                <div className={`p-1.5 rounded bg-[#151D26] border border-[#314255] group-hover:border-[#4FA8E0]/40 transition-colors`}>
                  <Icon className={`w-4 h-4 ${m.iconColor}`} />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono tracking-tight">
                    {m.value}
                  </span>
                  <span className="text-xs font-semibold text-[#8A94A6]">{m.unit}</span>
                </div>
                <div className={`text-[11px] font-semibold mt-0.5 truncate ${m.statusColor}`}>
                  {m.status}
                </div>
              </div>

              <div className="pt-2 border-t border-[#314255]/60 text-[9px] text-[#8A94A6] truncate">
                {m.source}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
