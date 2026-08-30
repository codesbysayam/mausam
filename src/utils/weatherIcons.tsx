import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  CloudSnow,
  Wind,
  Tornado,
  Haze,
  Sparkles,
} from 'lucide-react';

export type ConditionCategory =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'rain'
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
 * Normalizes any string weather condition into a standard category
 */
export function categorizeCondition(rawCondition?: string): ConditionCategory {
  if (!rawCondition) return 'partly_cloudy';
  const c = rawCondition.toLowerCase();

  if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) return 'thunderstorm';
  if (c.includes('drizzle') || c.includes('light rain') || c.includes('patchy rain')) return 'drizzle';
  if (c.includes('rain') || c.includes('shower') || c.includes('downpour') || c.includes('monsoon')) return 'rain';
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) return 'snow';
  if (c.includes('fog') || c.includes('dense fog')) return 'fog';
  if (c.includes('mist') || c.includes('haze') || c.includes('smoke')) return 'mist';
  if (c.includes('dust') || c.includes('sand')) return 'dust';
  if (c.includes('overcast') || c.includes('heavy cloud')) return 'overcast';
  if (c.includes('cloud') || c.includes('partly')) return 'partly_cloudy';
  if (c.includes('clear') || c.includes('sunny') || c.includes('fair')) return 'clear';
  if (c.includes('heat') || c.includes('hot')) return 'heat';

  return 'partly_cloudy';
}

/**
 * Returns complete visual styling configuration for a given condition
 */
export function getWeatherVisualConfig(condition?: string): WeatherVisualConfig {
  const category = categorizeCondition(condition);

  switch (category) {
    case 'clear':
      return {
        category,
        icon: Sun,
        iconColor: 'text-[#F1C40F]',
        bgGradient: 'from-[#F1C40F]/10 via-[#0B72B9]/10 to-transparent',
        badgeBg: 'bg-[#F1C40F]/15 border-[#F1C40F]/40',
        badgeText: 'text-[#F1C40F]',
        description: 'Clear Skies & Optimal Solar Radiation',
      };
    case 'partly_cloudy':
      return {
        category,
        icon: CloudSun,
        iconColor: 'text-[#4FA8E0]',
        bgGradient: 'from-[#4FA8E0]/10 via-[#1E2733]/50 to-transparent',
        badgeBg: 'bg-[#4FA8E0]/15 border-[#4FA8E0]/40',
        badgeText: 'text-[#4FA8E0]',
        description: 'Scattered Cloud Cover & Stable Boundary Layer',
      };
    case 'cloudy':
      return {
        category,
        icon: Cloud,
        iconColor: 'text-[#8A94A6]',
        bgGradient: 'from-[#8A94A6]/10 via-[#1E2733]/50 to-transparent',
        badgeBg: 'bg-[#8A94A6]/15 border-[#8A94A6]/40',
        badgeText: 'text-[#D7DEE8]',
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
        iconColor: 'text-[#4FA8E0]',
        bgGradient: 'from-[#0B72B9]/20 via-[#1E2733]/70 to-transparent',
        badgeBg: 'bg-[#0B72B9]/20 border-[#4FA8E0]/40',
        badgeText: 'text-[#4FA8E0]',
        description: 'Light Intermittent Drizzle',
      };
    case 'rain':
      return {
        category,
        icon: CloudRain,
        iconColor: 'text-[#0B72B9]',
        bgGradient: 'from-[#0B72B9]/25 via-[#131A22] to-transparent',
        badgeBg: 'bg-[#0B72B9]/20 border-[#0B72B9]/50',
        badgeText: 'text-[#4FA8E0]',
        description: 'Active Synoptic Precipitation',
      };
    case 'thunderstorm':
      return {
        category,
        icon: CloudLightning,
        iconColor: 'text-[#FF8C42]',
        bgGradient: 'from-[#9B59B6]/25 via-[#FF8C42]/10 to-transparent',
        badgeBg: 'bg-[#FF8C42]/20 border-[#FF8C42]/50',
        badgeText: 'text-[#FFA066]',
        description: 'Convective Mesoscale Thunderstorm Cells',
      };
    case 'fog':
      return {
        category,
        icon: CloudFog,
        iconColor: 'text-[#95A5A6]',
        bgGradient: 'from-[#34495E]/30 via-[#1E2733]/60 to-transparent',
        badgeBg: 'bg-[#95A5A6]/15 border-[#95A5A6]/40',
        badgeText: 'text-[#D7DEE8]',
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
        iconColor: 'text-[#AED6F1]',
        bgGradient: 'from-[#AED6F1]/20 via-[#1E2733]/60 to-transparent',
        badgeBg: 'bg-[#AED6F1]/20 border-[#AED6F1]/40',
        badgeText: 'text-[#AED6F1]',
        description: 'Cryospheric Frozen Precipitation',
      };
    case 'heat':
      return {
        category,
        icon: Sun,
        iconColor: 'text-[#E74C3C]',
        bgGradient: 'from-[#E74C3C]/20 via-[#FF8C42]/10 to-transparent',
        badgeBg: 'bg-[#E74C3C]/20 border-[#E74C3C]/50',
        badgeText: 'text-[#FF7675]',
        description: 'High Thermal Heatwave Conditions',
      };
    case 'dust':
      return {
        category,
        icon: Wind,
        iconColor: 'text-[#D35400]',
        bgGradient: 'from-[#D35400]/20 via-[#1E2733]/60 to-transparent',
        badgeBg: 'bg-[#D35400]/20 border-[#D35400]/40',
        badgeText: 'text-[#F39C12]',
        description: 'Airborne Dust Suspension & Gusty Surface Winds',
      };
    default:
      return {
        category: 'partly_cloudy',
        icon: CloudSun,
        iconColor: 'text-[#4FA8E0]',
        bgGradient: 'from-[#0B72B9]/15 via-[#1E2733]/50 to-transparent',
        badgeBg: 'bg-[#0B72B9]/15 border-[#0B72B9]/40',
        badgeText: 'text-[#4FA8E0]',
        description: 'Normal Synoptic Conditions',
      };
  }
}
