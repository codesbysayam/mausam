/**
 * Central Weather Condition Engine for MAUSAM
 *
 * Provides a single, authoritative, data-driven mapping from real weather telemetry
 * (WMO weather code, precipitation, snowfall, cloud cover, day/night state)
 * to standardized weather condition keys, user-facing labels, icons, and visual effects.
 *
 * CRITICAL RULE:
 * 98% rain probability in the forecast ≠ currently raining.
 * Current weather visual effects are strictly driven by CURRENT precipitation and WMO codes.
 * If current condition is CLEAR (Day or Night), rain animation is 100% OFF.
 */

export type CentralWeatherCondition =
  | 'CLEAR_DAY'
  | 'CLEAR_NIGHT'
  | 'PARTLY_CLOUDY_DAY'
  | 'PARTLY_CLOUDY_NIGHT'
  | 'CLOUDY'
  | 'FOG'
  | 'DRIZZLE'
  | 'RAIN'
  | 'HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'SNOW'
  | 'SLEET'
  | 'FREEZING_RAIN'
  | 'UNKNOWN';

export interface WeatherConditionInput {
  wmoCode?: number | null;
  precipitation?: number | null;
  precipitationMm?: number | null;
  rain?: number | null;
  showers?: number | null;
  snowfall?: number | null;
  cloudCover?: number | null;
  visibility?: number | null;
  isDay?: boolean | number | null;
  rawConditionText?: string | null;
}

/**
 * Standard WMO Weather Code Table:
 * 0: Clear sky
 * 1, 2: Mainly clear, partly cloudy
 * 3: Overcast / Cloudy
 * 45, 48: Fog and depositing rime fog
 * 51, 53, 55: Drizzle: Light, moderate, and dense intensity
 * 56, 57: Freezing Drizzle: Light and dense intensity
 * 61, 63: Rain: Slight and moderate intensity
 * 65: Rain: Heavy intensity
 * 66, 67: Freezing Rain: Light and heavy intensity
 * 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
 * 77: Snow grains
 * 80, 81: Rain showers: Slight and moderate
 * 82: Rain showers: Violent
 * 85, 86: Snow showers: Slight and heavy
 * 95: Thunderstorm: Slight or moderate
 * 96, 99: Thunderstorm with slight and heavy hail
 */

/**
 * Central function to derive the exact visual condition from real weather data.
 * NEVER infers rain from temperature, high humidity, or future forecast probabilities alone.
 */
export function getWeatherCondition(
  data: WeatherConditionInput | null | undefined
): CentralWeatherCondition {
  if (!data) {
    return 'UNKNOWN';
  }

  // Normalize day/night flag
  let isDay = true;
  if (typeof data.isDay === 'boolean') {
    isDay = data.isDay;
  } else if (typeof data.isDay === 'number') {
    isDay = data.isDay === 1;
  } else {
    // Fallback: estimate from current Indian Standard Time (IST UTC+5:30)
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const istHours = (utcHours + 5.5) % 24;
    isDay = istHours >= 5.75 && istHours < 18.5; // ~5:45 AM to 6:30 PM IST
  }

  const wmo = typeof data.wmoCode === 'number' ? data.wmoCode : null;
  const currentPrecip = Math.max(
    0,
    data.precipitation ?? data.precipitationMm ?? data.rain ?? 0
  );
  const currentSnow = Math.max(0, data.snowfall ?? 0);
  const cloudCover = typeof data.cloudCover === 'number' ? data.cloudCover : null;

  // 1. Direct WMO Weather Code mapping (highest meteorological authority)
  if (wmo !== null) {
    // Clear Sky: WMO 0 MUST NEVER SHOW RAIN
    if (wmo === 0) {
      return isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
    }

    // Mainly clear or partly cloudy: WMO 1, 2
    if (wmo === 1 || wmo === 2) {
      if (currentPrecip >= 1.0) return 'RAIN';
      if (currentPrecip > 0.1) return 'DRIZZLE';
      return isDay ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
    }

    // Overcast / Cloudy: WMO 3
    if (wmo === 3) {
      if (currentPrecip >= 2.0) return 'RAIN';
      if (currentPrecip > 0.1) return 'DRIZZLE';
      return 'CLOUDY';
    }

    // Fog: WMO 45, 48
    if (wmo === 45 || wmo === 48) {
      return 'FOG';
    }

    // Drizzle: WMO 51, 53, 55
    if (wmo === 51 || wmo === 53 || wmo === 55) {
      return 'DRIZZLE';
    }

    // Freezing Drizzle: WMO 56, 57
    if (wmo === 56 || wmo === 57) {
      return 'FREEZING_RAIN';
    }

    // Rain: WMO 61, 63
    if (wmo === 61 || wmo === 63) {
      return 'RAIN';
    }

    // Heavy Rain: WMO 65
    if (wmo === 65) {
      return 'HEAVY_RAIN';
    }

    // Freezing Rain: WMO 66, 67
    if (wmo === 66 || wmo === 67) {
      return 'FREEZING_RAIN';
    }

    // Snow: WMO 71, 73, 75, 77
    if (wmo === 71 || wmo === 73 || wmo === 75 || wmo === 77) {
      return 'SNOW';
    }

    // Rain showers: WMO 80, 81
    if (wmo === 80 || wmo === 81) {
      return 'RAIN';
    }

    // Violent rain showers: WMO 82
    if (wmo === 82) {
      return 'HEAVY_RAIN';
    }

    // Snow showers: WMO 85, 86
    if (wmo === 85 || wmo === 86) {
      return 'SNOW';
    }

    // Thunderstorm: WMO 95, 96, 99
    if (wmo === 95 || wmo === 96 || wmo === 99) {
      return 'THUNDERSTORM';
    }
  }

  // 2. If WMO code is missing, parse textual condition string if available
  if (data.rawConditionText) {
    const txt = data.rawConditionText.toLowerCase();

    if (txt.includes('thunder') || txt.includes('lightning') || txt.includes('squall')) {
      return 'THUNDERSTORM';
    }
    if (txt.includes('heavy rain') || txt.includes('downpour') || txt.includes('torrential')) {
      return 'HEAVY_RAIN';
    }
    if (txt.includes('drizzle') || txt.includes('light rain') || txt.includes('misty rain')) {
      return 'DRIZZLE';
    }
    if (txt.includes('rain') || txt.includes('shower')) {
      return currentPrecip >= 4.0 ? 'HEAVY_RAIN' : 'RAIN';
    }
    if (txt.includes('snow') || txt.includes('blizzard') || txt.includes('flurry')) {
      return 'SNOW';
    }
    if (txt.includes('sleet') || txt.includes('freezing rain')) {
      return 'SLEET';
    }
    if (txt.includes('fog') || txt.includes('mist') || txt.includes('smog')) {
      return 'FOG';
    }
    if (txt.includes('overcast') || (txt.includes('cloudy') && !txt.includes('partly'))) {
      return 'CLOUDY';
    }
    if (txt.includes('partly') || txt.includes('scattered') || txt.includes('broken clouds')) {
      return isDay ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
    }
    if (txt.includes('clear') || txt.includes('sunny') || txt.includes('fair')) {
      return isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
    }
  }

  // 3. Physical telemetry fallback based on measured precipitation and cloud cover
  if (currentSnow > 0.1) {
    return 'SNOW';
  }

  if (currentPrecip >= 5.0) {
    return 'HEAVY_RAIN';
  }

  if (currentPrecip >= 0.8) {
    return 'RAIN';
  }

  if (currentPrecip > 0.1) {
    return 'DRIZZLE';
  }

  // Zero precipitation: strictly non-rain atmospheric states
  if (cloudCover !== null) {
    if (cloudCover > 80) return 'CLOUDY';
    if (cloudCover > 20) return isDay ? 'PARTLY_CLOUDY_DAY' : 'PARTLY_CLOUDY_NIGHT';
    return isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
  }

  // Default to day/night clear if nothing else indicates clouds or rain
  return isDay ? 'CLEAR_DAY' : 'CLEAR_NIGHT';
}

/**
 * Standardized human-readable label for each condition
 */
export function getConditionLabel(condition: CentralWeatherCondition): string {
  switch (condition) {
    case 'CLEAR_DAY':
      return 'Clear Sky';
    case 'CLEAR_NIGHT':
      return 'Clear Night';
    case 'PARTLY_CLOUDY_DAY':
      return 'Partly Cloudy';
    case 'PARTLY_CLOUDY_NIGHT':
      return 'Partly Cloudy Night';
    case 'CLOUDY':
      return 'Overcast Skies';
    case 'FOG':
      return 'Fog & Mist';
    case 'DRIZZLE':
      return 'Light Drizzle';
    case 'RAIN':
      return 'Rain';
    case 'HEAVY_RAIN':
      return 'Heavy Downpour';
    case 'THUNDERSTORM':
      return 'Thunderstorm';
    case 'SNOW':
      return 'Snowfall';
    case 'SLEET':
      return 'Sleet';
    case 'FREEZING_RAIN':
      return 'Freezing Rain';
    case 'UNKNOWN':
    default:
      return 'Atmospheric Telemetry';
  }
}

/**
 * Type of visual effect needed by the animation component
 */
export type WeatherVisualEffectType =
  | 'none'
  | 'stars'
  | 'sun_glow'
  | 'clouds'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'sleet';

/**
 * Maps condition to its visual particle/atmosphere effect.
 * Notice: CLEAR conditions yield ZERO rain!
 */
export function getConditionEffectType(condition: CentralWeatherCondition): WeatherVisualEffectType {
  switch (condition) {
    case 'CLEAR_DAY':
      return 'sun_glow'; // Subtle daylight atmosphere, 0 rain
    case 'CLEAR_NIGHT':
      return 'stars'; // Subtle twinkling night stars, 0 rain
    case 'PARTLY_CLOUDY_DAY':
    case 'PARTLY_CLOUDY_NIGHT':
    case 'CLOUDY':
      return 'clouds'; // Slow moving clouds, 0 rain
    case 'FOG':
      return 'fog'; // Low-opacity fog layer, 0 rain
    case 'DRIZZLE':
      return 'drizzle'; // Light misty rain
    case 'RAIN':
      return 'rain'; // Visible rain streaks
    case 'HEAVY_RAIN':
      return 'heavy_rain'; // Dense rain streaks
    case 'THUNDERSTORM':
      return 'thunderstorm'; // Dense rain + lightning flash
    case 'SNOW':
      return 'snow'; // Falling white snow particles
    case 'SLEET':
    case 'FREEZING_RAIN':
      return 'sleet'; // Mixed icy precipitation
    case 'UNKNOWN':
    default:
      return 'none'; // Neutral, 0 animation
  }
}

/**
 * Returns true if the condition is actively precipitating (rain, snow, drizzle, hail)
 */
export function isPrecipitationCondition(condition: CentralWeatherCondition): boolean {
  return (
    condition === 'DRIZZLE' ||
    condition === 'RAIN' ||
    condition === 'HEAVY_RAIN' ||
    condition === 'THUNDERSTORM' ||
    condition === 'SNOW' ||
    condition === 'SLEET' ||
    condition === 'FREEZING_RAIN'
  );
}

/**
 * Comprehensive test conditions for developer verification
 */
export const ALL_TEST_CONDITIONS: CentralWeatherCondition[] = [
  'CLEAR_DAY',
  'CLEAR_NIGHT',
  'PARTLY_CLOUDY_DAY',
  'PARTLY_CLOUDY_NIGHT',
  'CLOUDY',
  'FOG',
  'DRIZZLE',
  'RAIN',
  'HEAVY_RAIN',
  'THUNDERSTORM',
  'SNOW',
  'SLEET',
  'UNKNOWN',
];
