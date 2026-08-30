import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  Wind,
  Droplets,
  Moon,
  CloudMoon,
} from 'lucide-react';

interface WeatherConditionIconProps {
  condition?: string;
  className?: string;
  isNight?: boolean;
}

export const WeatherConditionIcon: React.FC<WeatherConditionIconProps> = ({
  condition = 'Clear',
  className = 'w-5 h-5',
  isNight = false,
}) => {
  const condLower = condition.toLowerCase();

  if (condLower.includes('thunder') || condLower.includes('lightning') || condLower.includes('storm') || condLower.includes('squall')) {
    return <CloudLightning className={`${className} text-[#F1C40F]`} aria-label={condition} />;
  }

  if (condLower.includes('heavy rain') || condLower.includes('downpour') || condLower.includes('shower')) {
    return <CloudRain className={`${className} text-[#4FA8E0]`} aria-label={condition} />;
  }

  if (condLower.includes('drizzle') || condLower.includes('light rain') || condLower.includes('patchy rain')) {
    return <CloudDrizzle className={`${className} text-[#5DADE2]`} aria-label={condition} />;
  }

  if (condLower.includes('rain') || condLower.includes('monsoon')) {
    return <CloudRain className={`${className} text-[#4FA8E0]`} aria-label={condition} />;
  }

  if (condLower.includes('snow') || condLower.includes('sleet') || condLower.includes('blizzard')) {
    return <CloudSnow className={`${className} text-[#E8F8F5]`} aria-label={condition} />;
  }

  if (condLower.includes('fog') || condLower.includes('mist') || condLower.includes('haze') || condLower.includes('smoke')) {
    return <CloudFog className={`${className} text-[#95A5A6]`} aria-label={condition} />;
  }

  if (condLower.includes('wind') || condLower.includes('gale') || condLower.includes('breeze')) {
    return <Wind className={`${className} text-[#2ECC71]`} aria-label={condition} />;
  }

  if (condLower.includes('overcast') || condLower.includes('cloudy') && !condLower.includes('partly')) {
    return <Cloud className={`${className} text-[#BDC3C7]`} aria-label={condition} />;
  }

  if (condLower.includes('partly') || condLower.includes('scattered') || condLower.includes('few clouds')) {
    if (isNight) {
      return <CloudMoon className={`${className} text-[#85C1E9]`} aria-label={condition} />;
    }
    return <CloudSun className={`${className} text-[#F39C12]`} aria-label={condition} />;
  }

  // Clear / Sunny
  if (isNight) {
    return <Moon className={`${className} text-[#F4D03F]`} aria-label={condition} />;
  }
  return <Sun className={`${className} text-[#F1C40F]`} aria-label={condition} />;
};
