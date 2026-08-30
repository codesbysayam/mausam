import { CurrentWeather, HourlyForecastItem, DailyForecastItem, WeatherAlert } from '../types';

export type UserPersona =
  | 'general'
  | 'health'
  | 'fitness'
  | 'travel'
  | 'family'
  | 'agriculture'
  | 'commuting'
  | 'events'
  | 'beach';

export interface PersonaConfig {
  id: UserPersona;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  priorityMetrics: string[];
}

export const PERSONA_CONFIGS: Record<UserPersona, PersonaConfig> = {
  general: {
    id: 'general',
    label: 'Daily Life & Overview',
    shortLabel: 'Overview',
    icon: 'home',
    description: 'Standard balanced atmospheric overview for daily planning',
    priorityMetrics: ['temperature', 'rain', 'humidity', 'aqi', 'wind'],
  },
  health: {
    id: 'health',
    label: 'Health & Respiratory',
    shortLabel: 'Health',
    icon: 'heart_pulse',
    description: 'Air quality, PM2.5, UV index, and respiratory health guidance',
    priorityMetrics: ['aqi', 'uv', 'humidity', 'temperature'],
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness & Outdoor Sports',
    shortLabel: 'Fitness',
    icon: 'directions_run',
    description: 'Ideal outdoor workout windows, heat stress index, and rain likelihood',
    priorityMetrics: ['workoutWindow', 'temperature', 'wind', 'uv', 'rain'],
  },
  travel: {
    id: 'travel',
    label: 'Travel & Highways',
    shortLabel: 'Travel',
    icon: 'directions_car',
    description: 'Visibility, highway rain hazards, wind gusts, and travel warnings',
    priorityMetrics: ['visibility', 'rain', 'wind', 'warnings'],
  },
  family: {
    id: 'family',
    label: 'Family & Children',
    shortLabel: 'Family',
    icon: 'family_restroom',
    description: 'Safe outdoor windows for children and elderly, afternoon comfort',
    priorityMetrics: ['temperature', 'uv', 'aqi', 'rain'],
  },
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture & Farming',
    shortLabel: 'Farming',
    icon: 'agriculture',
    description: 'Expected rain QPF, soil moisture, irrigation needs, and spraying conditions',
    priorityMetrics: ['rain', 'humidity', 'wind', 'temperature'],
  },
  commuting: {
    id: 'commuting',
    label: 'Daily Commute',
    shortLabel: 'Commute',
    icon: 'commute',
    description: 'Morning and evening rush hour rainfall, road conditions, and gusts',
    priorityMetrics: ['rain', 'visibility', 'temperature', 'wind'],
  },
  events: {
    id: 'events',
    label: 'Events & Gatherings',
    shortLabel: 'Events',
    icon: 'celebration',
    description: 'Rain risk for outdoor functions, afternoon peak heat, and evening comfort',
    priorityMetrics: ['rain', 'temperature', 'wind', 'humidity'],
  },
  beach: {
    id: 'beach',
    label: 'Coastal & Beach',
    shortLabel: 'Coastal',
    icon: 'beach_access',
    description: 'Coastal winds, UV exposure, afternoon sea breeze, and storm surge alert',
    priorityMetrics: ['wind', 'uv', 'temperature', 'rain'],
  },
};

export interface HumanDataStory {
  greeting: string;
  timeContext: string;
  headline: string;
  summary: string;
  whatIsHappening: string;
  whatWillHappen: string;
  whatShouldIKnow: string;
  recommendedAction: string;
  personaAdvice: {
    persona: UserPersona;
    highlight: string;
    advice: string;
    badge: string;
    badgeColor: string;
  };
}

export function getTimeOfDayGreeting(date: Date = new Date()): {
  greeting: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  timeContext: string;
} {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return {
      greeting: 'Good Morning',
      period: 'morning',
      timeContext: 'Early day atmosphere',
    };
  }
  if (hours >= 12 && hours < 17) {
    return {
      greeting: 'Good Afternoon',
      period: 'afternoon',
      timeContext: 'Peak daylight atmosphere',
    };
  }
  if (hours >= 17 && hours < 21) {
    return {
      greeting: 'Good Evening',
      period: 'evening',
      timeContext: 'Dusk atmospheric transition',
    };
  }
  return {
    greeting: 'Good Night',
    period: 'night',
    timeContext: 'Nighttime nocturnal atmosphere',
  };
}

export function getTemperatureMeaning(temp: number, feelsLike?: number): {
  headline: string;
  description: string;
  comfortLevel: 'comfortable' | 'warm' | 'hot' | 'very_hot' | 'cool' | 'cold';
} {
  const effective = typeof feelsLike === 'number' ? feelsLike : temp;
  if (effective >= 42) {
    return {
      headline: 'Extreme Heat Stress',
      description: 'Severe heat load outdoors. Stay hydrated and avoid prolonged direct sun exposure.',
      comfortLevel: 'very_hot',
    };
  }
  if (effective >= 36) {
    return {
      headline: 'Hot & Humid Heat Load',
      description: 'Air feels notably warm and muggy. Outdoor physical exertion may feel taxing in afternoon.',
      comfortLevel: 'hot',
    };
  }
  if (effective >= 30) {
    return {
      headline: 'Warm Tropical Comfort',
      description: 'Typical warm conditions. Light cotton clothing recommended for outdoor comfort.',
      comfortLevel: 'warm',
    };
  }
  if (effective >= 20) {
    return {
      headline: 'Pleasant & Moderate',
      description: 'Comfortable thermal envelope ideal for all outdoor activities and walking.',
      comfortLevel: 'comfortable',
    };
  }
  if (effective >= 12) {
    return {
      headline: 'Mild & Crisp',
      description: 'Cool refreshing air. A light layer is recommended during early mornings and evenings.',
      comfortLevel: 'cool',
    };
  }
  return {
    headline: 'Cold Conditions',
    description: 'Chilly boundary layer temperatures. Warm winter wear advised.',
    comfortLevel: 'cold',
  };
}

export function getHumidityMeaning(humidity: number): {
  headline: string;
  description: string;
  moistureLevel: 'dry' | 'optimal' | 'humid' | 'very_humid';
} {
  if (humidity >= 85) {
    return {
      headline: 'High Atmospheric Moisture',
      description: 'Sweat evaporates slowly, making the air feel heavier and warmer than actual temperature.',
      moistureLevel: 'very_humid',
    };
  }
  if (humidity >= 65) {
    return {
      headline: 'Humid Tropical Envelope',
      description: 'Noticeable moisture in the air, typical for coastal and monsoon plains.',
      moistureLevel: 'humid',
    };
  }
  if (humidity >= 35) {
    return {
      headline: 'Balanced Comfort',
      description: 'Comfortable relative humidity with easy thermal dissipation.',
      moistureLevel: 'optimal',
    };
  }
  return {
    headline: 'Dry Air',
    description: 'Low moisture level may cause dry skin and throat. Keep water handy.',
    moistureLevel: 'dry',
  };
}

export function getRainProbabilityMeaning(rainProb: number, precipMm: number = 0): {
  headline: string;
  description: string;
  riskCategory: 'dry' | 'low' | 'moderate' | 'high' | 'imminent';
} {
  if (rainProb >= 75 || precipMm > 10) {
    return {
      headline: 'Rain Very Likely',
      description: 'Precipitation is expected. Carry an umbrella and plan outdoor transit with rain gear.',
      riskCategory: 'imminent',
    };
  }
  if (rainProb >= 45 || precipMm > 2) {
    return {
      headline: 'Scattered Showers Probable',
      description: 'Passing rain showers are possible during convective peak windows.',
      riskCategory: 'moderate',
    };
  }
  if (rainProb >= 20) {
    return {
      headline: 'Isolated Rain Chance',
      description: 'Mainly dry with a minor chance of brief localized cloudburst or light drizzle.',
      riskCategory: 'low',
    };
  }
  return {
    headline: 'Dry Weather Expected',
    description: 'No significant precipitation expected in the near forecast.',
    riskCategory: 'dry',
  };
}

export function getWindMeaning(speedKmH: number, direction: string = '', gusts?: number): {
  headline: string;
  description: string;
  windFeel: 'calm' | 'gentle' | 'moderate' | 'breezy' | 'gusty' | 'gale';
} {
  const dirText = direction ? ` from the ${direction}` : '';
  if (speedKmH >= 45 || (gusts && gusts >= 60)) {
    return {
      headline: 'Strong Gusty Winds',
      description: `High wind velocities${dirText}. Secure loose outdoor items and exercise caution on bridges.`,
      windFeel: 'gale',
    };
  }
  if (speedKmH >= 25 || (gusts && gusts >= 35)) {
    return {
      headline: 'Fresh & Breezy',
      description: `Steady brisk breeze${dirText}. Noticeable movement in trees and flags.`,
      windFeel: 'breezy',
    };
  }
  if (speedKmH >= 12) {
    return {
      headline: 'Gentle Airflow',
      description: `Moderate comfortable breeze${dirText}. Leaves rustle gently.`,
      windFeel: 'gentle',
    };
  }
  return {
    headline: 'Light Air & Calm',
    description: `Smoke rises almost vertically${dirText}. Stagnant surface layer.`,
    windFeel: 'calm',
  };
}

export function getAqiMeaning(aqi: number): {
  headline: string;
  category: string;
  description: string;
  healthImpact: string;
  badgeBg: string;
  badgeText: string;
  severityColor: string;
} {
  if (aqi <= 50) {
    return {
      headline: 'Clean & Pristine Air',
      category: 'Good',
      description: 'Air quality is satisfactory and poses little or no health risk.',
      healthImpact: 'Ideal for all outdoor activities and exercise.',
      badgeBg: 'bg-[#22C7A0]/15 border-[#22C7A0]/40',
      badgeText: 'text-[#22C7A0]',
      severityColor: '#22C7A0',
    };
  }
  if (aqi <= 100) {
    return {
      headline: 'Satisfactory Air Quality',
      category: 'Satisfactory',
      description: 'Minor breathing discomfort possible for sensitive individuals.',
      healthImpact: 'Safe for the vast majority of citizens.',
      badgeBg: 'bg-[#22C7A0]/15 border-[#22C7A0]/40',
      badgeText: 'text-[#22C7A0]',
      severityColor: '#22C7A0',
    };
  }
  if (aqi <= 200) {
    return {
      headline: 'Moderate Pollution Level',
      category: 'Moderate',
      description: 'May cause breathing discomfort to people with lung/heart diseases and children.',
      healthImpact: 'Sensitive groups should reduce prolonged outdoor exertion.',
      badgeBg: 'bg-[#FFC857]/15 border-[#FFC857]/40',
      badgeText: 'text-[#FFC857]',
      severityColor: '#FFC857',
    };
  }
  if (aqi <= 300) {
    return {
      headline: 'Poor Air Quality',
      category: 'Poor',
      description: 'Breathing discomfort to most people on prolonged exposure.',
      healthImpact: 'Avoid vigorous outdoor workouts during morning peak.',
      badgeBg: 'bg-[#FF9F43]/15 border-[#FF9F43]/40',
      badgeText: 'text-[#FF9F43]',
      severityColor: '#FF9F43',
    };
  }
  if (aqi <= 400) {
    return {
      headline: 'Very Poor Air Quality',
      category: 'Very Poor',
      description: 'Can cause respiratory illness on prolonged exposure.',
      healthImpact: 'Wear N95 masks outdoors and use air filtration indoors.',
      badgeBg: 'bg-[#EF5350]/15 border-[#EF5350]/40',
      badgeText: 'text-[#EF5350]',
      severityColor: '#EF5350',
    };
  }
  return {
    headline: 'Severe Air Emergency',
    category: 'Severe',
    description: 'Affects healthy people and seriously impacts those with existing diseases.',
    healthImpact: 'Strictly avoid outdoor activity. Keep windows closed.',
    badgeBg: 'bg-[#EF5350]/25 border-[#EF5350]/60',
    badgeText: 'text-[#EF5350]',
    severityColor: '#EF5350',
  };
}

export function getUvMeaning(uvIndex: number): {
  headline: string;
  category: string;
  description: string;
  protectionAdvice: string;
} {
  if (uvIndex >= 11) {
    return {
      headline: 'Extreme UV Radiation',
      category: 'Extreme',
      description: 'Unprotected skin and eyes can burn in minutes.',
      protectionAdvice: 'Stay indoors between 11 AM and 4 PM. SPF 50+ essential.',
    };
  }
  if (uvIndex >= 8) {
    return {
      headline: 'Very High Solar UV',
      category: 'Very High',
      description: 'Extra protection needed. Rapid sun damage possible.',
      protectionAdvice: 'Seek shade during midday. Wear sunglasses and wide-brim hat.',
    };
  }
  if (uvIndex >= 6) {
    return {
      headline: 'High UV Radiation',
      category: 'High',
      description: 'Protection required during peak afternoon sun.',
      protectionAdvice: 'Apply sunscreen and wear UV-protective clothing.',
    };
  }
  if (uvIndex >= 3) {
    return {
      headline: 'Moderate Solar Index',
      category: 'Moderate',
      description: 'Low to moderate risk of sun exposure.',
      protectionAdvice: 'Wear sunglasses on bright sunny days.',
    };
  }
  return {
    headline: 'Low UV Exposure',
    category: 'Low',
    description: 'Minimal sun hazard.',
    protectionAdvice: 'Safe for all outdoor activities without special protection.',
  };
}

/**
 * Builds a complete human-centered weather narrative story
 */
export function buildHumanWeatherStory(
  weather: CurrentWeather,
  hourly: HourlyForecastItem[] = [],
  daily: DailyForecastItem[] = [],
  alerts: WeatherAlert[] = [],
  persona: UserPersona = 'general'
): HumanDataStory {
  const { greeting, timeContext } = getTimeOfDayGreeting();
  const temp = weather.temp || 28;
  const feelsLike = weather.feelsLike || temp + 3;
  const condition = weather.condition || 'Partly Cloudy';
  const humidity = weather.humidity || 75;
  const rainProb = weather.precipitationProbability || 20;
  const windSpeed = weather.windSpeed || 14;
  const windDir = weather.windDirection || 'NE';
  const aqi = weather.aqi || 82;

  const tempInfo = getTemperatureMeaning(temp, feelsLike);
  const rainInfo = getRainProbabilityMeaning(rainProb);
  const windInfo = getWindMeaning(windSpeed, windDir);
  const aqiInfo = getAqiMeaning(aqi);

  // Look ahead in next 6-8 hours for rain or temp peak
  const nextHours = hourly.slice(0, 8);
  const peakRainHour = nextHours.find((h) => (h.precipitationProbability || h.rainProb || 0) >= 50);
  const maxUpcomingTemp = nextHours.length > 0 ? Math.max(...nextHours.map((h) => h.temp)) : temp;

  let whatIsHappening = `${condition} at ${temp}°C (feels like ${feelsLike}°C). ${tempInfo.description}`;
  let whatWillHappen = '';
  if (peakRainHour) {
    whatWillHappen = `Rain probability peaks around ${peakRainHour.time} (${peakRainHour.precipitationProbability || peakRainHour.rainProb}% chance). Highs will reach ~${maxUpcomingTemp}°C.`;
  } else {
    whatWillHappen = `Atmosphere will remain predominantly dry and ${condition.toLowerCase()} through the next 8 hours with stable temperatures around ${maxUpcomingTemp}°C.`;
  }

  let whatShouldIKnow = `${aqiInfo.headline} (AQI ${aqi}, ${aqiInfo.category}). ${humidity >= 75 ? 'High relative humidity will increase apparent warmth.' : 'Humidity levels remain manageable.'}`;
  let recommendedAction = '';

  if (alerts.length > 0) {
    const topAlert = alerts[0];
    whatShouldIKnow = `Active Alert: ${topAlert.title || 'Weather Bulletin Active'}. ${whatShouldIKnow}`;
    recommendedAction = topAlert.actionItem || topAlert.description || 'Monitor local weather updates and avoid open areas if thunder develops.';
  } else if (rainProb >= 60) {
    recommendedAction = 'Keep rain protection accessible when stepping out today.';
  } else if (feelsLike >= 38) {
    recommendedAction = 'Schedule demanding outdoor tasks before noon or after 5 PM to avoid peak heat.';
  } else {
    recommendedAction = 'Favorable conditions for routine outdoor commuting and everyday activities.';
  }

  // Persona-specific tailored guidance
  let personaAdvice = {
    persona,
    highlight: 'Standard Daily View',
    advice: 'Normal meteorological profile across your area.',
    badge: 'General',
    badgeColor: 'bg-[#1499E8]/15 text-[#1499E8] border-[#1499E8]/30',
  };

  switch (persona) {
    case 'health':
      personaAdvice = {
        persona: 'health',
        highlight: `AQI ${aqi} (${aqiInfo.category}) • Humidity ${humidity}%`,
        advice: aqi <= 100
          ? 'Air quality is favorable for breathing. Great day for walks and outdoor ventilation.'
          : 'Sensitive respiratory individuals should limit intense cardio outdoors today.',
        badge: 'Health Focus',
        badgeColor: aqiInfo.badgeBg + ' ' + aqiInfo.badgeText,
      };
      break;

    case 'fitness':
      const bestWindow = nextHours.find((h) => h.temp <= 28 && (h.precipitationProbability || 0) < 30);
      personaAdvice = {
        persona: 'fitness',
        highlight: bestWindow ? `Optimal Workout Window: ~${bestWindow.time}` : 'Early morning is best for running',
        advice: feelsLike >= 35
          ? 'High apparent temperature. Hydrate well and schedule workouts in the early morning.'
          : 'Good outdoor running conditions. Keep hydration steady.',
        badge: 'Fitness Priority',
        badgeColor: 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/30',
      };
      break;

    case 'travel':
      personaAdvice = {
        persona: 'travel',
        highlight: `Visibility: ${weather.visibility || '8 km'} • Road Rain Risk: ${rainProb}%`,
        advice: rainProb >= 50
          ? 'Wet roads and occasional spray expected on highways. Allow extra travel buffer time.'
          : 'Clear highway visibility with good driving conditions throughout the route.',
        badge: 'Travel Safe',
        badgeColor: 'bg-[#43C7F4]/15 text-[#43C7F4] border-[#43C7F4]/30',
      };
      break;

    case 'family':
      personaAdvice = {
        persona: 'family',
        highlight: `Comfort: ${tempInfo.headline} • UV Index: ${weather.uvIndex || 6}`,
        advice: feelsLike >= 36
          ? 'Afternoons may be uncomfortably warm for small children and seniors. Prefer indoor play midday.'
          : 'Comfortable family weather for parks and evening outings.',
        badge: 'Family Care',
        badgeColor: 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30',
      };
      break;

    case 'agriculture':
      personaAdvice = {
        persona: 'agriculture',
        highlight: `Rain Chance: ${rainProb}% • Wind: ${windSpeed} km/h ${windDir}`,
        advice: rainProb >= 60
          ? 'Rain expected. You can pause non-urgent irrigation and postpone foliar chemical spraying.'
          : 'Dry conditions favor regular irrigation and field tillage activities.',
        badge: 'Agro Guidance',
        badgeColor: 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/30',
      };
      break;

    case 'commuting':
      personaAdvice = {
        persona: 'commuting',
        highlight: `Rush Hour Rain: ${rainProb}% • Wind: ${windSpeed} km/h`,
        advice: rainProb >= 40
          ? 'Possible wet transit during evening commute. Keep rain covers ready for two-wheelers.'
          : 'Smooth commute conditions expected with dry roads.',
        badge: 'Commute Pulse',
        badgeColor: 'bg-[#1499E8]/15 text-[#1499E8] border-[#1499E8]/30',
      };
      break;

    case 'events':
      personaAdvice = {
        persona: 'events',
        highlight: `Outdoor Event Risk: ${rainProb > 40 ? 'Moderate' : 'Low'} (${rainProb}%)`,
        advice: rainProb >= 40
          ? 'Consider canopy covers for open-air stage or dining areas as a contingency.'
          : 'Favorable stable conditions for evening outdoor gatherings.',
        badge: 'Event Ready',
        badgeColor: 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30',
      };
      break;

    case 'beach':
      personaAdvice = {
        persona: 'beach',
        highlight: `Coastal Wind: ${windSpeed} km/h • UV Index: ${weather.uvIndex || 7}`,
        advice: windSpeed >= 30
          ? 'Choppy coastal surf and strong onshore breeze. Obey lifeguard flags.'
          : 'Pleasant sea breeze in the late afternoon. High UV during midday requires sunscreen.',
        badge: 'Coastal Watch',
        badgeColor: 'bg-[#43C7F4]/15 text-[#43C7F4] border-[#43C7F4]/30',
      };
      break;
  }

  return {
    greeting,
    timeContext,
    headline: `${condition} across your area`,
    summary: `${temp}°C · Feels like ${feelsLike}°C · ${rainInfo.headline}`,
    whatIsHappening,
    whatWillHappen,
    whatShouldIKnow,
    recommendedAction,
    personaAdvice,
  };
}
