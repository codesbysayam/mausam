import { NormalizedWeatherCondition, WeatherConditionType } from '../types';

export interface WeatherInput {
  wmoCode?: number;
  precipitationMm?: number;
  precipitationProbability?: number;
  cloudCover?: number;
  windSpeedKmH?: number;
  visibilityKm?: number;
  humidity?: number;
  rawConditionText?: string;
  isDaytime?: boolean;
}

export interface ResolvedWeatherCondition {
  normalizedCondition: NormalizedWeatherCondition;
  conditionLabel: string;
  weatherType: WeatherConditionType;
  icon: string;
  isRainingNow: boolean;
  rainExpectedSummary: string;
  atmosphericDescription: string;
  particleAnimationType: 'none' | 'rain' | 'thunderstorm' | 'fog' | 'dust' | 'clear_shimmer';
}

/**
 * Maps WMO weather interpretation codes to standardized normalized conditions.
 * WMO Weather interpretation codes:
 * 0: Clear sky
 * 1, 2, 3: Mainly clear, partly cloudy, and overcast
 * 45, 48: Fog and depositing rime fog
 * 51, 53, 55: Drizzle: Light, moderate, and dense intensity
 * 56, 57: Freezing Drizzle: Light and dense intensity
 * 61, 63, 65: Rain: Slight, moderate and heavy intensity
 * 66, 67: Freezing Rain: Light and heavy intensity
 * 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
 * 77: Snow grains
 * 80, 81, 82: Rain showers: Slight, moderate, and violent
 * 85, 86: Snow showers slight and heavy
 * 95: Thunderstorm: Slight or moderate
 * 96, 99: Thunderstorm with slight and heavy hail
 */
export function resolveWeatherFromWmoCode(
  code: number,
  isDaytime = true
): {
  normalizedCondition: NormalizedWeatherCondition;
  conditionLabel: string;
  weatherType: WeatherConditionType;
  icon: string;
  isRainingNow: boolean;
} {
  switch (code) {
    case 0:
      return {
        normalizedCondition: 'CLEAR',
        conditionLabel: isDaytime ? 'Clear Sky' : 'Clear Night',
        weatherType: 'sunny',
        icon: isDaytime ? 'sunny' : 'bedtime',
        isRainingNow: false,
      };
    case 1:
      return {
        normalizedCondition: 'CLEAR',
        conditionLabel: isDaytime ? 'Mainly Clear' : 'Mostly Clear Night',
        weatherType: 'sunny',
        icon: isDaytime ? 'wb_sunny' : 'nightlight',
        isRainingNow: false,
      };
    case 2:
      return {
        normalizedCondition: 'PARTLY_CLOUDY',
        conditionLabel: 'Partly Cloudy',
        weatherType: 'sunny',
        icon: isDaytime ? 'partly_cloudy_day' : 'partly_cloudy_night',
        isRainingNow: false,
      };
    case 3:
      return {
        normalizedCondition: 'OVERCAST',
        conditionLabel: 'Overcast Skies',
        weatherType: 'sunny', // Not raining
        icon: 'cloud',
        isRainingNow: false,
      };
    case 45:
    case 48:
      return {
        normalizedCondition: 'FOG',
        conditionLabel: 'Dense Fog & Mist',
        weatherType: 'fog',
        icon: 'foggy',
        isRainingNow: false,
      };
    case 51:
    case 53:
      return {
        normalizedCondition: 'DRIZZLE',
        conditionLabel: 'Light Drizzle',
        weatherType: 'rain',
        icon: 'grain',
        isRainingNow: true,
      };
    case 55:
      return {
        normalizedCondition: 'DRIZZLE',
        conditionLabel: 'Dense Drizzle',
        weatherType: 'rain',
        icon: 'grain',
        isRainingNow: true,
      };
    case 56:
    case 57:
      return {
        normalizedCondition: 'DRIZZLE',
        conditionLabel: 'Freezing Drizzle',
        weatherType: 'rain',
        icon: 'grain',
        isRainingNow: true,
      };
    case 61:
      return {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Light Rain',
        weatherType: 'rain',
        icon: 'rainy',
        isRainingNow: true,
      };
    case 63:
      return {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Moderate Rain',
        weatherType: 'rain',
        icon: 'rainy',
        isRainingNow: true,
      };
    case 65:
      return {
        normalizedCondition: 'HEAVY_RAIN',
        conditionLabel: 'Heavy Rain Showers',
        weatherType: 'rain',
        icon: 'thunderstorm',
        isRainingNow: true,
      };
    case 66:
    case 67:
      return {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Freezing Rain',
        weatherType: 'rain',
        icon: 'rainy',
        isRainingNow: true,
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        normalizedCondition: 'SNOW',
        conditionLabel: 'Snowfall',
        weatherType: 'fog',
        icon: 'ac_unit',
        isRainingNow: false,
      };
    case 80:
      return {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Passing Light Showers',
        weatherType: 'rain',
        icon: 'rainy_light',
        isRainingNow: true,
      };
    case 81:
      return {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Moderate Rain Showers',
        weatherType: 'rain',
        icon: 'rainy',
        isRainingNow: true,
      };
    case 82:
      return {
        normalizedCondition: 'HEAVY_RAIN',
        conditionLabel: 'Violent Rain Showers',
        weatherType: 'rain',
        icon: 'thunderstorm',
        isRainingNow: true,
      };
    case 95:
      return {
        normalizedCondition: 'THUNDERSTORM',
        conditionLabel: 'Scattered Thunderstorm',
        weatherType: 'thunderstorm',
        icon: 'thunderstorm',
        isRainingNow: true,
      };
    case 96:
    case 99:
      return {
        normalizedCondition: 'THUNDERSTORM',
        conditionLabel: 'Severe Thunderstorm & Hail',
        weatherType: 'thunderstorm',
        icon: 'thunderstorm',
        isRainingNow: true,
      };
    default:
      return {
        normalizedCondition: 'UNKNOWN',
        conditionLabel: 'Moderate Ambient',
        weatherType: 'sunny',
        icon: 'wb_cloudy',
        isRainingNow: false,
      };
  }
}

/**
 * Authoritative Centralized Weather Condition Resolver
 *
 * CRITICAL RULE:
 * Rain is ONLY active when current precipitation > 0 mm/hr OR current WMO condition is Rain/Drizzle/Thunderstorm.
 * High humidity, cloud cover, or future rain probability NEVER triggers 'Raining now' or active rain animation!
 */
export function resolveWeatherCondition(input: WeatherInput): ResolvedWeatherCondition {
  const isDaytime = input.isDaytime ?? true;
  const currentPrecip = input.precipitationMm ?? 0;
  const rainProb = input.precipitationProbability ?? 0;

  // 1. If WMO code is provided, use international standard mapping
  let baseResolved: {
    normalizedCondition: NormalizedWeatherCondition;
    conditionLabel: string;
    weatherType: WeatherConditionType;
    icon: string;
    isRainingNow: boolean;
  };

  if (typeof input.wmoCode === 'number') {
    baseResolved = resolveWeatherFromWmoCode(input.wmoCode, isDaytime);
  } else if (input.rawConditionText) {
    // Parse from textual description if WMO code is absent
    const text = input.rawConditionText.toLowerCase();
    if (text.includes('thunder') || text.includes('lightning') || text.includes('squall')) {
      baseResolved = {
        normalizedCondition: 'THUNDERSTORM',
        conditionLabel: 'Thunderstorm',
        weatherType: 'thunderstorm',
        icon: 'thunderstorm',
        isRainingNow: currentPrecip > 0.1 || text.includes('rain'),
      };
    } else if (text.includes('heavy rain') || text.includes('downpour')) {
      baseResolved = {
        normalizedCondition: 'HEAVY_RAIN',
        conditionLabel: 'Heavy Rain',
        weatherType: 'rain',
        icon: 'thunderstorm',
        isRainingNow: true,
      };
    } else if (text.includes('rain') || text.includes('shower')) {
      baseResolved = {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Rain Showers',
        weatherType: 'rain',
        icon: 'rainy',
        isRainingNow: true,
      };
    } else if (text.includes('drizzle')) {
      baseResolved = {
        normalizedCondition: 'DRIZZLE',
        conditionLabel: 'Light Drizzle',
        weatherType: 'rain',
        icon: 'grain',
        isRainingNow: true,
      };
    } else if (text.includes('fog') || text.includes('mist')) {
      baseResolved = {
        normalizedCondition: 'FOG',
        conditionLabel: 'Fog / Mist',
        weatherType: 'fog',
        icon: 'foggy',
        isRainingNow: false,
      };
    } else if (text.includes('dust') || text.includes('sand')) {
      baseResolved = {
        normalizedCondition: 'DUST',
        conditionLabel: 'Dust Storm',
        weatherType: 'duststorm',
        icon: 'air',
        isRainingNow: false,
      };
    } else if (text.includes('overcast') || (input.cloudCover && input.cloudCover > 75)) {
      baseResolved = {
        normalizedCondition: 'OVERCAST',
        conditionLabel: 'Overcast',
        weatherType: 'sunny',
        icon: 'cloud',
        isRainingNow: false,
      };
    } else if (text.includes('partly') || (input.cloudCover && input.cloudCover > 25)) {
      baseResolved = {
        normalizedCondition: 'PARTLY_CLOUDY',
        conditionLabel: 'Partly Cloudy',
        weatherType: 'sunny',
        icon: isDaytime ? 'partly_cloudy_day' : 'partly_cloudy_night',
        isRainingNow: false,
      };
    } else {
      baseResolved = {
        normalizedCondition: 'CLEAR',
        conditionLabel: isDaytime ? 'Clear Sky' : 'Clear Night',
        weatherType: 'sunny',
        icon: isDaytime ? 'sunny' : 'bedtime',
        isRainingNow: false,
      };
    }
  } else {
    // Fallback based on numerical parameters
    if (currentPrecip > 2.0) {
      baseResolved = {
        normalizedCondition: 'RAIN',
        conditionLabel: 'Rain',
        weatherType: 'rain',
        icon: 'rainy',
        isRainingNow: true,
      };
    } else if (currentPrecip > 0.1) {
      baseResolved = {
        normalizedCondition: 'DRIZZLE',
        conditionLabel: 'Light Drizzle',
        weatherType: 'rain',
        icon: 'grain',
        isRainingNow: true,
      };
    } else if ((input.cloudCover ?? 0) > 70) {
      baseResolved = {
        normalizedCondition: 'OVERCAST',
        conditionLabel: 'Overcast',
        weatherType: 'sunny',
        icon: 'cloud',
        isRainingNow: false,
      };
    } else if ((input.cloudCover ?? 0) > 20) {
      baseResolved = {
        normalizedCondition: 'PARTLY_CLOUDY',
        conditionLabel: 'Partly Cloudy',
        weatherType: 'sunny',
        icon: isDaytime ? 'partly_cloudy_day' : 'partly_cloudy_night',
        isRainingNow: false,
      };
    } else {
      baseResolved = {
        normalizedCondition: 'CLEAR',
        conditionLabel: isDaytime ? 'Clear Sky' : 'Clear Night',
        weatherType: 'sunny',
        icon: isDaytime ? 'sunny' : 'bedtime',
        isRainingNow: false,
      };
    }
  }

  // 2. Strict Precipitation Verification:
  // If current measured precipitation is 0 and condition is not intrinsically active rain, enforce NO RAIN NOW.
  const isRainingNow =
    (baseResolved.isRainingNow || currentPrecip > 0.1) &&
    baseResolved.normalizedCondition !== 'CLEAR' &&
    baseResolved.normalizedCondition !== 'PARTLY_CLOUDY' &&
    baseResolved.normalizedCondition !== 'OVERCAST' &&
    baseResolved.normalizedCondition !== 'FOG' &&
    baseResolved.normalizedCondition !== 'DUST';

  // 3. Clear Forecast vs Current distinction
  let rainExpectedSummary = 'No rain expected in immediate window';
  if (isRainingNow) {
    rainExpectedSummary = `Active precipitation (${currentPrecip.toFixed(1)} mm/hr)`;
  } else if (rainProb > 60) {
    rainExpectedSummary = `${rainProb}% chance of rain later in the forecast`;
  } else if (rainProb > 25) {
    rainExpectedSummary = `${rainProb}% slight chance of isolated showers later`;
  } else if (rainProb > 0) {
    rainExpectedSummary = `Low rain chance (${rainProb}%)`;
  }

  // 4. Determine particle animation type
  let particleAnimationType: 'none' | 'rain' | 'thunderstorm' | 'fog' | 'dust' | 'clear_shimmer' = 'none';
  if (isRainingNow) {
    particleAnimationType = baseResolved.normalizedCondition === 'THUNDERSTORM' ? 'thunderstorm' : 'rain';
  } else if (baseResolved.normalizedCondition === 'THUNDERSTORM') {
    particleAnimationType = 'thunderstorm';
  } else if (baseResolved.normalizedCondition === 'FOG') {
    particleAnimationType = 'fog';
  } else if (baseResolved.normalizedCondition === 'DUST') {
    particleAnimationType = 'dust';
  } else if (baseResolved.normalizedCondition === 'CLEAR') {
    particleAnimationType = 'clear_shimmer';
  }

  // 5. Build atmospheric description
  let atmosphericDescription = `${baseResolved.conditionLabel}. Wind ${input.windSpeedKmH || 12} km/h.`;
  if (!isRainingNow && rainProb > 30) {
    atmosphericDescription += ` (${rainProb}% rain probability later today).`;
  }

  return {
    normalizedCondition: baseResolved.normalizedCondition,
    conditionLabel: baseResolved.conditionLabel,
    weatherType: isRainingNow ? baseResolved.weatherType : baseResolved.weatherType === 'rain' ? 'sunny' : baseResolved.weatherType,
    icon: baseResolved.icon,
    isRainingNow,
    rainExpectedSummary,
    atmosphericDescription,
    particleAnimationType,
  };
}
