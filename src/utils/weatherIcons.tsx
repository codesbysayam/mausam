import React from 'react';
import {
  Sun,
  Moon,
  CloudMoon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  CloudSnow,
  Wind,
  Haze,
} from 'lucide-react';
import { CentralWeatherCondition } from '../services/weatherConditions';

export type ConditionCategory =
  | 'clear_day'
  | 'clear_night'
  | 'partly_cloudy_day'
  | 'partly_cloudy_night'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'heavy_rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'fog'
  | 'mist'
  | 'snow'
  | 'heat'
  | 'dust';

export interface WeatherVisualConfig {
  category: ConditionCategory;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  iconColor: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

/**
 * Normalizes any condition and day/night state into an unambiguous visual category
 */
export function categorizeCondition(
  rawCondition?: string,
  isDay = true,
  conditionKey?: CentralWeatherCondition
): ConditionCategory {
  if (conditionKey) {
    switch (conditionKey) {
      case 'CLEAR_DAY':
        return 'clear_day';
      case 'CLEAR_NIGHT':
        return 'clear_night';
      case 'PARTLY_CLOUDY_DAY':
        return 'partly_cloudy_day';
      case 'PARTLY_CLOUDY_NIGHT':
        return 'partly_cloudy_night';
      case 'CLOUDY':
        return 'cloudy';
      case 'FOG':
        return 'fog';
      case 'DRIZZLE':
        return 'drizzle';
      case 'RAIN':
        return 'rain';
      case 'HEAVY_RAIN':
        return 'heavy_rain';
      case 'THUNDERSTORM':
        return 'thunderstorm';
      case 'SNOW':
        return 'snow';
      case 'SLEET':
      case 'FREEZING_RAIN':
        return 'rain';
      case 'UNKNOWN':
      default:
        break;
    }
  }

  if (!rawCondition) {
    return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
  }

  const c = rawCondition.toLowerCase();
  const nightDetected = !isDay || c.includes('night');

  if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) return 'thunderstorm';
  if (c.includes('heavy rain') || c.includes('downpour') || c.includes('torrential')) return 'heavy_rain';
  if (c.includes('drizzle') || c.includes('light rain') || c.includes('patchy rain')) return 'drizzle';
  if (c.includes('rain') || c.includes('shower') || c.includes('monsoon')) return 'rain';
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) return 'snow';
  if (c.includes('fog') || c.includes('dense fog')) return 'fog';
  if (c.includes('mist') || c.includes('haze') || c.includes('smoke')) return 'mist';
  if (c.includes('dust') || c.includes('sand')) return 'dust';
  if (c.includes('overcast') || c.includes('heavy cloud')) return 'overcast';
  if (c.includes('partly') || c.includes('scattered') || c.includes('few clouds')) {
    return nightDetected ? 'partly_cloudy_night' : 'partly_cloudy_day';
  }
  if (c.includes('cloud')) return 'cloudy';
  if (c.includes('clear') || c.includes('sunny') || c.includes('fair')) {
    return nightDetected ? 'clear_night' : 'clear_day';
  }
  if (c.includes('heat') || c.includes('hot')) return 'heat';

  return nightDetected ? 'clear_night' : 'clear_day';
}

/**
 * Returns complete visual styling configuration for a given condition and time-of-day
 */
export function getWeatherVisualConfig(
  condition?: string,
  isDay = true,
  conditionKey?: CentralWeatherCondition
): WeatherVisualConfig {
  const category = categorizeCondition(condition, isDay, conditionKey);

  switch (category) {
    case 'clear_night':
      return {
        category,
        icon: Moon,
        iconColor: 'text-[#F4D03F]',
        bgGradient: 'from-[#1B2A4A]/40 via-[#0B1528]/80 to-transparent',
        badgeBg: 'bg-[#1E3A8A]/30 border-[#3B82F6]/40',
        badgeText: 'text-[#93C5FD]',
        description: 'Clear Night & Unobstructed Celestial Visibility',
      };

    case 'clear_day':
      return {
        category,
        icon: Sun,
        iconColor: 'text-[#F1C40F]',
        bgGradient: 'from-[#F1C40F]/15 via-[#0B72B9]/10 to-transparent',
        badgeBg: 'bg-[#F1C40F]/15 border-[#F1C40F]/40',
        badgeText: 'text-[#F1C40F]',
        description: 'Clear Skies & Optimal Solar Radiation',
      };

    case 'partly_cloudy_night':
      return {
        category,
        icon: CloudMoon,
        iconColor: 'text-[#85C1E9]',
        bgGradient: 'from-[#1E293B]/60 via-[#0F172A]/70 to-transparent',
        badgeBg: 'bg-[#1E293B]/40 border-[#38BDF8]/30',
        badgeText: 'text-[#7DD3FC]',
        description: 'Scattered Cloud Cover at Night',
      };

    case 'partly_cloudy_day':
      return {
        category,
        icon: CloudSun,
        iconColor: 'text-[#4FA8E0]',
        bgGradient: 'from-[#4FA8E0]/15 via-[#1E2733]/50 to-transparent',
        badgeBg: 'bg-[#4FA8E0]/15 border-[#4FA8E0]/40',
        badgeText: 'text-[#4FA8E0]',
        description: 'Scattered Cloud Cover & Stable Boundary Layer',
      };

    case 'cloudy':
      return {
        category,
        icon: Cloud,
        iconColor: 'text-[#94A3B8]',
        bgGradient: 'from-[#334155]/30 via-[#1E293B]/50 to-transparent',
        badgeBg: 'bg-[#334155]/30 border-[#94A3B8]/30',
        badgeText: 'text-[#CBD5E1]',
        description: 'Broken Stratocumulus Deck',
      };

    case 'overcast':
      return {
        category,
        icon: Cloud,
        iconColor: 'text-[#8A94A6]',
        bgGradient: 'from-[#314255]/40 via-[#1E2733]/60 to-transparent',
        badgeBg: 'bg-[#314255]/40 border-[#4FA8E0]/40',
        badgeText: 'text-[#D7DEE8]',
        description: 'Overcast Stratus Deck',
      };

    case 'drizzle':
      return {
        category,
        icon: CloudDrizzle,
        iconColor: 'text-[#5DADE2]',
        bgGradient: 'from-[#0B72B9]/20 via-[#1E2733]/70 to-transparent',
        badgeBg: 'bg-[#0B72B9]/20 border-[#4FA8E0]/40',
        badgeText: 'text-[#4FA8E0]',
        description: 'Light Intermittent Drizzle',
      };

    case 'rain':
      return {
        category,
        icon: CloudRain,
        iconColor: 'text-[#38BDF8]',
        bgGradient: 'from-[#0369A1]/30 via-[#0B1528] to-transparent',
        badgeBg: 'bg-[#0369A1]/25 border-[#38BDF8]/40',
        badgeText: 'text-[#38BDF8]',
        description: 'Active Synoptic Precipitation',
      };

    case 'heavy_rain':
      return {
        category,
        icon: CloudRain,
        iconColor: 'text-[#0284C7]',
        bgGradient: 'from-[#075985]/40 via-[#032B43]/70 to-transparent',
        badgeBg: 'bg-[#075985]/30 border-[#0284C7]/50',
        badgeText: 'text-[#38BDF8]',
        description: 'Torrential Convective Downpour',
      };

    case 'thunderstorm':
      return {
        category,
        icon: CloudLightning,
        iconColor: 'text-[#F59E0B]',
        bgGradient: 'from-[#581C87]/35 via-[#F59E0B]/15 to-transparent',
        badgeBg: 'bg-[#7E22CE]/25 border-[#F59E0B]/50',
        badgeText: 'text-[#FCD34D]',
        description: 'Convective Mesoscale Thunderstorm Cells',
      };

    case 'fog':
      return {
        category,
        icon: CloudFog,
        iconColor: 'text-[#94A3B8]',
        bgGradient: 'from-[#334155]/30 via-[#1E293B]/60 to-transparent',
        badgeBg: 'bg-[#334155]/20 border-[#94A3B8]/40',
        badgeText: 'text-[#E2E8F0]',
        description: 'Surface Inversion & Reduced Horizontal Visibility',
      };

    case 'mist':
      return {
        category,
        icon: Haze,
        iconColor: 'text-[#8A94A6]',
        bgGradient: 'from-[#8A94A6]/15 via-[#1E2733]/50 to-transparent',
        badgeBg: 'bg-[#8A94A6]/15 border-[#8A94A6]/40',
        badgeText: 'text-[#D7DEE8]',
        description: 'Shallow Atmospheric Mist / Haze Layer',
      };

    case 'snow':
      return {
        category,
        icon: CloudSnow,
        iconColor: 'text-[#BAE6FD]',
        bgGradient: 'from-[#0284C7]/20 via-[#1E293B]/60 to-transparent',
        badgeBg: 'bg-[#0284C7]/20 border-[#BAE6FD]/40',
        badgeText: 'text-[#E0F2FE]',
        description: 'Cryospheric Frozen Precipitation',
      };

    case 'heat':
      return {
        category,
        icon: Sun,
        iconColor: 'text-[#EF4444]',
        bgGradient: 'from-[#EF4444]/20 via-[#F97316]/10 to-transparent',
        badgeBg: 'bg-[#EF4444]/20 border-[#EF4444]/50',
        badgeText: 'text-[#FCA5A5]',
        description: 'High Thermal Heatwave Conditions',
      };

    case 'dust':
      return {
        category,
        icon: Wind,
        iconColor: 'text-[#D97706]',
        bgGradient: 'from-[#D97706]/20 via-[#1E293B]/60 to-transparent',
        badgeBg: 'bg-[#D97706]/20 border-[#D97706]/40',
        badgeText: 'text-[#FCD34D]',
        description: 'Airborne Dust Suspension & Gusty Surface Winds',
      };

    default:
      return {
        category: 'partly_cloudy_day',
        icon: CloudSun,
        iconColor: 'text-[#4FA8E0]',
        bgGradient: 'from-[#0B72B9]/15 via-[#1E2733]/50 to-transparent',
        badgeBg: 'bg-[#0B72B9]/15 border-[#0B72B9]/40',
        badgeText: 'text-[#4FA8E0]',
        description: 'Normal Synoptic Conditions',
      };
  }
}
