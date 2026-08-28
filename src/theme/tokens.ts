/**
 * MAUSAM DESIGN SYSTEM TOKENS
 * Product: MAUSAM - Atmospheric Intelligence & Citizen Weather Platform
 */

export const MAUSAM_BRAND = {
  name: 'MAUSAM',
  team: 'ALGNITE',
  tagline: 'Atmospheric Intelligence & Citizen Weather Platform',
  descriptor: 'Personalized Weather & Environmental Intelligence for India',
} as const;

export const tokens = {
  colors: {
    // 1. Primary Brand Colors
    primary: '#0B72B9',
    primaryDark: '#0A5A94',
    primaryLight: '#4FA8E0',

    // 2. Secondary Colors
    sunshine: '#FFB703',
    sunset: '#FF8C42',

    // 3. Weather-State Semantic Colors
    weather: {
      clear: '#FFC93C',
      sunny: '#FFC93C',
      cloudy: '#8D9CB8',
      rain: '#3A6EA5',
      rainy: '#3A6EA5',
      storm: '#4B4453',
      stormSecondary: '#2C2A38',
      snow: '#DCEEFB',
      fog: '#B8C2CC',
      mist: '#B8C2CC',
      heat: '#E85D4C',
      cold: '#5AC8E0',
      duststorm: '#FFB703',
      unknown: '#8D9CB8',
    },

    // 4. Status Colors
    status: {
      success: '#2ECC71', // Good AQI, Normal conditions
      warning: '#F1C40F', // Moderate AQI, Watch advisories
      danger: '#E74C3C',  // Severe AQI, Red alerts, Danger
      info: '#9B59B6',    // Special bulletins, Meteorological notes
    },

    // 5. Theme Surfaces - Dark Theme
    dark: {
      background: '#0F141A',
      surface: '#1E2733',
      surfaceRaised: '#242F3D',
      stormSurface: '#2C2A38',
      textPrimary: '#FFFFFF',
      textSecondary: '#F4F7FA',
      textMuted: '#8A94A6',
      slate: '#4A5568',
      border: 'rgba(225, 230, 235, 0.12)',
      borderSolid: '#2D3748',
    },

    // 6. Theme Surfaces - Light Theme
    light: {
      background: '#F4F7FA',
      surface: '#FFFFFF',
      surfaceRaised: '#F0F4F8',
      textPrimary: '#0F141A',
      textSecondary: '#4A5568',
      textMuted: '#8A94A6',
      border: '#E1E6EB',
      primaryBlue: '#0B72B9',
    },

    // 7. Atmospheric Gradients
    gradients: {
      daySky: 'linear-gradient(135deg, #4FA8E0 0%, #0B72B9 100%)',
      sunset: 'linear-gradient(135deg, #FF8C42 0%, #FFB703 100%)',
      night: 'linear-gradient(135deg, #1E2733 0%, #0A0F1C 100%)',
      storm: 'linear-gradient(135deg, #4B4453 0%, #2C2A38 100%)',
    },
  },

  typography: {
    fontFamily: "'Noto Sans', system-ui, -apple-system, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    desktop: {
      display: '56px',
      h1: '36px',
      h2: '28px',
      h3: '22px',
      h4: '18px',
      sectionLabel: '14px',
      body: '16px',
      bodyCompact: '14px',
      metadata: '12px',
      buttons: '14px',
      navigation: '14px',
      temp: '64px',
    },
    mobile: {
      display: '40px',
      h1: '28px',
      h2: '22px',
      h3: '18px',
      body: '14px',
      metadata: '12px',
      temp: '48px',
    },
  },

  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    cardPadding: '20px',
    sectionSpacing: '36px',
  },

  radii: {
    button: '8px',
    card: '12px',
    tag: '6px',
    pill: '9999px',
  },
} as const;

/**
 * Weather Visual State Types & Resolver
 */
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
    label: 'Clear Sky',
    icon: 'sunny',
    accentColor: tokens.colors.weather.clear,
    badgeBg: 'rgba(255, 201, 60, 0.15)',
    badgeText: '#FFC93C',
    gradient: tokens.colors.gradients.daySky,
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(255, 183, 3, 0.12)',
  },
  cloudy: {
    state: 'cloudy',
    label: 'Partly Cloudy',
    icon: 'partly_cloudy_day',
    accentColor: tokens.colors.weather.cloudy,
    badgeBg: 'rgba(141, 156, 184, 0.18)',
    badgeText: '#CBD5E1',
    gradient: 'linear-gradient(135deg, #4A5568 0%, #1E2733 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(141, 156, 184, 0.10)',
  },
  rainy: {
    state: 'rainy',
    label: 'Active Rain',
    icon: 'rainy',
    accentColor: tokens.colors.weather.rainy,
    badgeBg: 'rgba(58, 110, 165, 0.25)',
    badgeText: '#7DD3FC',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0F141A 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(58, 110, 165, 0.18)',
  },
  storm: {
    state: 'storm',
    label: 'Thunderstorm & Squall',
    icon: 'thunderstorm',
    accentColor: tokens.colors.weather.storm,
    badgeBg: 'rgba(75, 68, 83, 0.40)',
    badgeText: '#E2E8F0',
    gradient: tokens.colors.gradients.storm,
    surfaceBg: tokens.colors.dark.stormSurface,
    ambientGlow: 'rgba(155, 89, 182, 0.15)',
  },
  snow: {
    state: 'snow',
    label: 'Snow / Flurries',
    icon: 'ac_unit',
    accentColor: tokens.colors.weather.snow,
    badgeBg: 'rgba(220, 238, 251, 0.20)',
    badgeText: '#E0F2FE',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #1E2733 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(220, 238, 251, 0.15)',
  },
  fog: {
    state: 'fog',
    label: 'Dense Fog & Mist',
    icon: 'foggy',
    accentColor: tokens.colors.weather.fog,
    badgeBg: 'rgba(184, 194, 204, 0.20)',
    badgeText: '#E2E8F0',
    gradient: 'linear-gradient(135deg, #334155 0%, #0F141A 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(184, 194, 204, 0.12)',
  },
  heat: {
    state: 'heat',
    label: 'Heatwave Alert',
    icon: 'local_fire_department',
    accentColor: tokens.colors.weather.heat,
    badgeBg: 'rgba(232, 93, 76, 0.20)',
    badgeText: '#FCA5A5',
    gradient: 'linear-gradient(135deg, #E85D4C 0%, #1E2733 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(232, 93, 76, 0.18)',
  },
  cold: {
    state: 'cold',
    label: 'Coldwave Wave',
    icon: 'severe_cold',
    accentColor: tokens.colors.weather.cold,
    badgeBg: 'rgba(90, 200, 224, 0.20)',
    badgeText: '#7DD3FC',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #0F141A 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(90, 200, 224, 0.15)',
  },
  unknown: {
    state: 'unknown',
    label: 'Observational',
    icon: 'thermostat',
    accentColor: tokens.colors.weather.unknown,
    badgeBg: 'rgba(141, 156, 184, 0.15)',
    badgeText: '#CBD5E1',
    gradient: 'linear-gradient(135deg, #1E2733 0%, #0F141A 100%)',
    surfaceBg: '#1E2733',
    ambientGlow: 'rgba(141, 156, 184, 0.10)',
  },
};

/**
 * Resolves WeatherVisualState from normalized conditions or raw types
 */
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
