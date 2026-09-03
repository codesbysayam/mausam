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
    primary: '#0B3D91', // Deep Government Blue
    primaryDark: '#062A63',
    primaryLight: '#E3F2FD', // Ice/Sky Blue
    secondary: '#1565C0', // Royal Blue

    // 2. Weather Severity Colors
    severity: {
      normal: '#008000', // Green - Normal / No Warning
      watch: '#FFFF00',  // Yellow - Watch
      alert: '#FFA500',  // Orange - Alert
      warning: '#FF0000',// Red - Warning
    },

    // 3. Atmospheric States
    weather: {
      clear: '#FFA500',
      sunny: '#FFA500',
      cloudy: '#607D8B',
      rain: '#1565C0',
      rainy: '#1565C0',
      storm: '#0B3D91',
      snow: '#E3F2FD',
      fog: '#607D8B',
      mist: '#607D8B',
      heat: '#FF0000',
      cold: '#1565C0',
      duststorm: '#FFA500',
      unknown: '#607D8B',
    },

    // 4. Semantic Status System
    status: {
      good: '#008000',     // Normal / Good AQI / Routine (Green)
      warning: '#FFFF00',  // Watch / Moderate / Yellow
      prepare: '#FFA500',  // Alert / Poor AQI / Orange
      danger: '#FF0000',   // Warning / Red Alert / Action Required
      info: '#1565C0',     // Advisory / Royal Blue
    },

    // 5. Sophisticated Government Dark Surfaces
    dark: {
      background: '#071A2D',
      backgroundAlt: '#0B2239',
      surface: '#0B2239',
      surfaceSecondary: '#102D47',
      surfaceHover: '#153658',
      textPrimary: '#FFFFFF',
      textSecondary: '#D7DEE8',
      textMuted: '#B8C7D9',
      border: '#1D4E73',
      borderSubtle: 'rgba(29, 78, 115, 0.4)',
      borderHover: '#1565C0',
    },

    // 6. Light Surfaces (Government Palette)
    light: {
      background: '#F5F9FC',
      surface: '#FFFFFF',
      surfaceRaised: '#EEF4F9',
      textPrimary: '#172B4D',
      textSecondary: '#607D8B',
      textMuted: '#8A94A6',
      border: '#D9E2EC',
    },

    // 7. Atmospheric Gradients
    gradients: {
      daySky: 'linear-gradient(135deg, rgba(21, 101, 192, 0.15) 0%, rgba(227, 242, 253, 0.05) 100%)',
      sunset: 'linear-gradient(135deg, rgba(255, 165, 0, 0.18) 0%, rgba(255, 255, 0, 0.06) 100%)',
      night: 'linear-gradient(135deg, #0B2239 0%, #071A2D 100%)',
      storm: 'linear-gradient(135deg, rgba(255, 0, 0, 0.15) 0%, #0B2239 100%)',
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
