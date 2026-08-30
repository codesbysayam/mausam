import React, { useMemo } from 'react';
import { CurrentWeather, WeatherAlert } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sun,
  Droplets,
  Wind,
  ShieldAlert,
} from 'lucide-react';

interface WeatherStatusStripProps {
  weather: CurrentWeather;
  alerts?: WeatherAlert[];
}

export const WeatherStatusStrip: React.FC<WeatherStatusStripProps> = ({
  weather,
  alerts = [],
}) => {
  const statusItems = useMemo(() => {
    const items: Array<{
      id: string;
      icon: React.ComponentType<{ className?: string }>;
      text: string;
      severity: 'safe' | 'warning' | 'info';
    }> = [];

    // 1. Severe Weather / Alerts Status
    const severeAlerts = alerts.filter(
      (a) => a.severity === 'red' || a.severity === 'orange' || a.severity === 'Severe' || a.severity === 'Moderate'
    );

    if (severeAlerts.length > 0) {
      items.push({
        id: 'severe-alert',
        icon: ShieldAlert,
        text: `Active Warning: ${severeAlerts[0].title || 'Weather Bulletin Active'}`,
        severity: 'warning',
      });
    } else {
      items.push({
        id: 'no-severe',
        icon: CheckCircle2,
        text: 'No severe atmospheric hazards detected in this subdivision',
        severity: 'safe',
      });
    }

    // 2. Visibility
    const vis = weather.visibility ?? 10;
    if (vis < 1) {
      items.push({
        id: 'vis',
        icon: Eye,
        text: `Dense Fog / Poor Visibility (${vis} km) – Exercise caution when commuting`,
        severity: 'warning',
      });
    } else if (vis < 4) {
      items.push({
        id: 'vis',
        icon: Eye,
        text: `Moderate Visibility (${vis} km) due to surface haze / mist`,
        severity: 'info',
      });
    } else {
      items.push({
        id: 'vis',
        icon: Eye,
        text: `Visibility Unrestricted (${vis >= 10 ? '10+ km' : `${vis} km`})`,
        severity: 'safe',
      });
    }

    // 3. UV Exposure
    const uv = weather.uvIndex ?? 5;
    if (uv >= 8) {
      items.push({
        id: 'uv',
        icon: Sun,
        text: `Very High UV Index (${uv}) – Sun protection required during solar noon`,
        severity: 'warning',
      });
    } else if (uv >= 6) {
      items.push({
        id: 'uv',
        icon: Sun,
        text: `High UV Radiation (${uv}) – Moderate protection recommended`,
        severity: 'info',
      });
    } else {
      items.push({
        id: 'uv',
        icon: Sun,
        text: `Safe UV Exposure Index (${uv})`,
        severity: 'safe',
      });
    }

    // 4. Humidity & Moisture
    const hum = weather.humidity ?? 70;
    if (hum >= 90) {
      items.push({
        id: 'humidity',
        icon: Droplets,
        text: `Elevated Relative Humidity (${hum}%) – High boundary layer moisture`,
        severity: 'info',
      });
    } else if (hum <= 25) {
      items.push({
        id: 'humidity',
        icon: Droplets,
        text: `Low Humidity (${hum}%) – Dry synoptic air mass`,
        severity: 'info',
      });
    } else {
      items.push({
        id: 'humidity',
        icon: Droplets,
        text: `Comfortable Ambient Humidity (${hum}%)`,
        severity: 'safe',
      });
    }

    // 5. Wind
    const wind = weather.windSpeed ?? 5;
    if (wind > 40) {
      items.push({
        id: 'wind',
        icon: Wind,
        text: `Strong Gusty Surface Winds (${wind} km/h ${weather.windDirection || ''})`,
        severity: 'warning',
      });
    } else if (wind > 20) {
      items.push({
        id: 'wind',
        icon: Wind,
        text: `Moderate Breeze (${wind} km/h ${weather.windDirection || ''})`,
        severity: 'info',
      });
    } else {
      items.push({
        id: 'wind',
        icon: Wind,
        text: `Gentle Surface Wind (${wind} km/h ${weather.windDirection || ''})`,
        severity: 'safe',
      });
    }

    return items;
  }, [weather, alerts]);

  return (
    <div
      id="weather-operational-status-strip"
      className="bg-[#151D26] border border-[#314255] rounded-lg p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider bg-[#1E2733] px-2.5 py-1 rounded border border-[#314255]">
          SYNOPTIC STATUS
        </span>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap flex-1 text-xs">
        {statusItems.map((item) => {
          const Icon = item.icon;
          const badgeClass =
            item.severity === 'warning'
              ? 'bg-[#E74C3C]/15 text-[#FF7675] border-[#E74C3C]/40'
              : item.severity === 'info'
              ? 'bg-[#F1C40F]/10 text-[#F7DC6F] border-[#F1C40F]/30'
              : 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30';

          return (
            <div
              key={item.id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-medium ${badgeClass}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
