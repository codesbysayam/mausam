/**
 * MAUSAM DESIGN SYSTEM TOKENS
 * Product: MAUSAM - Atmospheric Intelligence & Citizen Weather Platform
 * Human-designed, Indian atmospheric aesthetic with refined information hierarchy.
 */

export const MAUSAM_BRAND = {
  name: 'MAUSAM',
  tagline: 'Atmospheric Intelligence & Citizen Weather Platform',
  descriptor: 'Personalized Atmospheric & Environmental Intelligence for India',
} as const;

export const tokens = {
  colors: {
    // 1. Core Brand Colors
    primary: '#1499E8', // MAUSAM Blue
    primaryDark: '#0C78BA',
    primaryLight: '#43C7F4', // Cyan
    teal: '#22C7A0', // Teal

    // 2. Warm Highlights & Signals
    warm: '#FFC857',
    warning: '#FF9F43',
    severe: '#EF5350',

    // 3. Atmospheric States
    weather: {
      clear: '#FFC857',
      sunny: '#FFC857',
      cloudy: '#93A4B8',
      rain: '#1499E8',
      rainy: '#1499E8',
      storm: '#43C7F4',
      snow: '#DCEEFB',
      fog: '#93A4B8',
      mist: '#93A4B8',
      heat: '#EF5350',
      cold: '#43C7F4',
      duststorm: '#FF9F43',
      unknown: '#93A4B8',
    },

    // 4. Semantic Status System
    status: {
      good: '#22C7A0',     // Normal / Good AQI / Routine (Green)
      warning: '#FFC857',  // Watch / Moderate / Yellow
      prepare: '#FF9F43',  // Alert / Poor AQI / Orange
      danger: '#EF5350',   // Severe / Red Alert / Action Required
      info: '#1499E8',     // Advisory / Blue
    },

    // 5. Sophisticated Surfaces
    dark: {
      background: '#071018',
      backgroundAlt: '#0A1118',
      surface: '#111C27',
      surfaceSecondary: '#162331',
      surfaceHover: '#1C2C3E',
      textPrimary: '#F4F7FA',
      textSecondary: '#93A4B8',
      textMuted: '#62758D',
      border: 'rgba(147, 164, 184, 0.12)',
      borderSubtle: 'rgba(147, 164, 184, 0.08)',
      borderHover: 'rgba(20, 153, 232, 0.4)',
    },

    // 6. Light Surfaces (if toggled)
    light: {
      background: '#F4F7FA',
      surface: '#FFFFFF',
      surfaceRaised: '#E8EEF5',
      textPrimary: '#071018',
      textSecondary: '#4A5D78',
      textMuted: '#8092A8',
      border: '#DDE4ED',
    },

    // 7. Atmospheric Gradients
    gradients: {
      daySky: 'linear-gradient(135deg, rgba(20, 153, 232, 0.15) 0%, rgba(67, 199, 244, 0.05) 100%)',
      sunset: 'linear-gradient(135deg, rgba(255, 159, 67, 0.18) 0%, rgba(255, 200, 87, 0.06) 100%)',
      night: 'linear-gradient(135deg, #111C27 0%, #071018 100%)',
      storm: 'linear-gradient(135deg, rgba(239, 83, 80, 0.15) 0%, #111C27 100%)',
    },
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: 'font-display',
  },

  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
  },

  radii: {
    button: '8px',
    card: '12px',
    panel: '14px',
    pill: '9999px',
  },
} as const;

export type WeatherVisualState = 
  | 'clear'
  | 'cloudy'
  | 'rainy'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'heat'
  | 'cold'
  | 'unknown';

export interface VisualStateConfig {
  state: WeatherVisualState;
  label: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  surfaceBg: string;
  ambientGlow: string;
}

export const WEATHER_VISUAL_CONFIGS: Record<WeatherVisualState, VisualStateConfig> = {
  clear: {
    state: 'clear',
    label: 'Clear Skies',
    icon: 'sunny',
    accentColor: tokens.colors.weather.clear,
    badgeBg: 'rgba(255, 200, 87, 0.12)',
    badgeText: '#FFC857',
    gradient: tokens.colors.gradients.daySky,
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(255, 200, 87, 0.08)',
  },
  cloudy: {
    state: 'cloudy',
    label: 'Partly Cloudy',
    icon: 'partly_cloudy_day',
    accentColor: tokens.colors.weather.cloudy,
    badgeBg: 'rgba(147, 164, 184, 0.14)',
    badgeText: '#CBD5E1',
    gradient: 'linear-gradient(135deg, rgba(22, 35, 49, 0.8) 0%, #111C27 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(147, 164, 184, 0.06)',
  },
  rainy: {
    state: 'rainy',
    label: 'Rain Showers',
    icon: 'rainy',
    accentColor: tokens.colors.weather.rainy,
    badgeBg: 'rgba(20, 153, 232, 0.18)',
    badgeText: '#43C7F4',
    gradient: 'linear-gradient(135deg, rgba(20, 153, 232, 0.15) 0%, #111C27 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(20, 153, 232, 0.12)',
  },
  storm: {
    state: 'storm',
    label: 'Thunderstorm',
    icon: 'thunderstorm',
    accentColor: tokens.colors.weather.storm,
    badgeBg: 'rgba(239, 83, 80, 0.18)',
    badgeText: '#FF9F43',
    gradient: tokens.colors.gradients.storm,
    surfaceBg: '#162331',
    ambientGlow: 'rgba(239, 83, 80, 0.14)',
  },
  snow: {
    state: 'snow',
    label: 'Snow / Flurries',
    icon: 'ac_unit',
    accentColor: tokens.colors.weather.snow,
    badgeBg: 'rgba(67, 199, 244, 0.15)',
    badgeText: '#DCEEFB',
    gradient: 'linear-gradient(135deg, rgba(67, 199, 244, 0.15) 0%, #111C27 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(67, 199, 244, 0.10)',
  },
  fog: {
    state: 'fog',
    label: 'Dense Fog & Mist',
    icon: 'foggy',
    accentColor: tokens.colors.weather.fog,
    badgeBg: 'rgba(147, 164, 184, 0.16)',
    badgeText: '#E2E8F0',
    gradient: 'linear-gradient(135deg, rgba(22, 35, 49, 0.7) 0%, #111C27 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(147, 164, 184, 0.08)',
  },
  heat: {
    state: 'heat',
    label: 'Heatwave Alert',
    icon: 'local_fire_department',
    accentColor: tokens.colors.weather.heat,
    badgeBg: 'rgba(239, 83, 80, 0.18)',
    badgeText: '#EF5350',
    gradient: 'linear-gradient(135deg, rgba(239, 83, 80, 0.16) 0%, #111C27 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(239, 83, 80, 0.12)',
  },
  cold: {
    state: 'cold',
    label: 'Coldwave Advisory',
    icon: 'severe_cold',
    accentColor: tokens.colors.weather.cold,
    badgeBg: 'rgba(67, 199, 244, 0.16)',
    badgeText: '#43C7F4',
    gradient: 'linear-gradient(135deg, rgba(67, 199, 244, 0.14) 0%, #111C27 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(67, 199, 244, 0.10)',
  },
  unknown: {
    state: 'unknown',
    label: 'Observational',
    icon: 'thermostat',
    accentColor: tokens.colors.weather.unknown,
    badgeBg: 'rgba(147, 164, 184, 0.12)',
    badgeText: '#93A4B8',
    gradient: 'linear-gradient(135deg, #162331 0%, #071018 100%)',
    surfaceBg: '#111C27',
    ambientGlow: 'rgba(147, 164, 184, 0.05)',
  },
};

export function resolveVisualState(
  condition: string,
  weatherType: string,
  temp?: number,
  isRainingNow?: boolean
): VisualStateConfig {
  const c = (condition || '').toLowerCase();
  const t = (weatherType || '').toLowerCase();

  if (isRainingNow || t === 'rain' || c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    if (t === 'thunderstorm' || c.includes('thunder') || c.includes('lightning') || c.includes('squall')) {
      return WEATHER_VISUAL_CONFIGS.storm;
    }
    return WEATHER_VISUAL_CONFIGS.rainy;
  }

  if (t === 'thunderstorm' || c.includes('thunder') || c.includes('storm')) {
    return WEATHER_VISUAL_CONFIGS.storm;
  }

  if (t === 'fog' || c.includes('fog') || c.includes('mist') || c.includes('haze')) {
    return WEATHER_VISUAL_CONFIGS.fog;
  }

  if (c.includes('snow') || c.includes('blizzard') || c.includes('ice')) {
    return WEATHER_VISUAL_CONFIGS.snow;
  }

  if (typeof temp === 'number' && temp >= 40) {
    return WEATHER_VISUAL_CONFIGS.heat;
  }

  if (typeof temp === 'number' && temp <= 5) {
    return WEATHER_VISUAL_CONFIGS.cold;
  }

  if (c.includes('cloud') || c.includes('overcast')) {
    return WEATHER_VISUAL_CONFIGS.cloudy;
  }

  if (t === 'sunny' || c.includes('clear') || c.includes('sun')) {
    return WEATHER_VISUAL_CONFIGS.clear;
  }

  return WEATHER_VISUAL_CONFIGS.cloudy;
}
