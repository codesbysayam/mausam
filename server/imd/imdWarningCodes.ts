/**
 * IMD Warning Codes, Warning Color Codes, Rainfall Categories, and Wind Direction Conversions
 */

export interface IMDWarningColorInfo {
  code: number;
  name: 'NORMAL' | 'WATCH' | 'WARNING' | 'SEVERE';
  colorHex: string;
  badgeClass: string;
  description: string;
  actionText: string;
}

export const IMD_WARNING_COLORS: Record<number, IMDWarningColorInfo> = {
  1: {
    code: 1,
    name: 'NORMAL',
    colorHex: '#10B981',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'No Warning / Green',
    actionText: 'No specific action required. Standard conditions prevailing.',
  },
  2: {
    code: 2,
    name: 'WATCH',
    colorHex: '#F59E0B',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Be Updated / Yellow Watch',
    actionText: 'Be updated. Keep tracking atmospheric conditions and local updates.',
  },
  3: {
    code: 3,
    name: 'WARNING',
    colorHex: '#F97316',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
    description: 'Be Prepared / Orange Warning',
    actionText: 'Be prepared. Potential for disruption of transport, power, or agriculture.',
  },
  4: {
    code: 4,
    name: 'SEVERE',
    colorHex: '#EF4444',
    badgeClass: 'bg-red-100 text-red-900 border-red-400 animate-pulse',
    description: 'Take Action / Red Alert',
    actionText: 'Take action. Severe hazardous weather conditions imminent or active.',
  },
};

export function getIMDWarningColor(colorCode: number | string | undefined | null): IMDWarningColorInfo {
  const code = typeof colorCode === 'string' ? parseInt(colorCode, 10) : (colorCode ?? 1);
  return IMD_WARNING_COLORS[code] || IMD_WARNING_COLORS[1];
}

export const IMD_WARNING_HAZARD_CODES: Record<number, { code: number; label: string; severity: 'low' | 'moderate' | 'high' | 'extreme' }> = {
  1: { code: 1, label: 'No Warning', severity: 'low' },
  2: { code: 2, label: 'Heavy Rain', severity: 'high' },
  3: { code: 3, label: 'Heavy Snow', severity: 'high' },
  4: { code: 4, label: 'Thunderstorm & Lightning / Squall', severity: 'moderate' },
  5: { code: 5, label: 'Hailstorm', severity: 'high' },
  6: { code: 6, label: 'Dust Storm', severity: 'moderate' },
  7: { code: 7, label: 'Dust Raising Winds', severity: 'moderate' },
  8: { code: 8, label: 'Strong Surface Winds', severity: 'moderate' },
  9: { code: 9, label: 'Heat Wave', severity: 'high' },
  10: { code: 10, label: 'Hot Day', severity: 'moderate' },
  11: { code: 11, label: 'Warm Night', severity: 'moderate' },
  12: { code: 12, label: 'Cold Wave', severity: 'high' },
  13: { code: 13, label: 'Cold Day', severity: 'moderate' },
  14: { code: 14, label: 'Ground Frost', severity: 'moderate' },
  15: { code: 15, label: 'Dense Fog', severity: 'moderate' },
  16: { code: 16, label: 'Very Heavy Rain', severity: 'high' },
  17: { code: 17, label: 'Extremely Heavy Rain', severity: 'extreme' },
};

export function getIMDHazardCode(code: number | string | undefined | null) {
  const numeric = typeof code === 'string' ? parseInt(code, 10) : (code ?? 1);
  return IMD_WARNING_HAZARD_CODES[numeric] || { code: numeric, label: `Warning Code ${numeric}`, severity: 'moderate' as const };
}

export const IMD_RAINFALL_CATEGORIES: Record<string, { code: string; label: string; description: string; color: string }> = {
  LE: { code: 'LE', label: 'Large Excess', description: 'Rainfall departure +60% or more', color: '#0284C7' },
  E: { code: 'E', label: 'Excess', description: 'Rainfall departure +20% to +59%', color: '#38BDF8' },
  N: { code: 'N', label: 'Normal', description: 'Rainfall departure -19% to +19%', color: '#10B981' },
  D: { code: 'D', label: 'Deficient', description: 'Rainfall departure -59% to -20%', color: '#F59E0B' },
  LD: { code: 'LD', label: 'Large Deficient', description: 'Rainfall departure -99% to -60%', color: '#EF4444' },
  NR: { code: 'NR', label: 'No Rain', description: 'Rainfall departure -100%', color: '#9CA3AF' },
  ND: { code: 'ND', label: 'No Data', description: 'Data not available from observatory', color: '#6B7280' },
};

export function getIMDRainfallCategory(code: string | undefined | null) {
  const clean = (code || '').toUpperCase().trim();
  return IMD_RAINFALL_CATEGORIES[clean] || IMD_RAINFALL_CATEGORIES['ND'];
}

export function degreesToWindDirection(degrees: number | string | undefined | null): { degrees: number; label: string } {
  const deg = typeof degrees === 'string' ? parseFloat(degrees) : (degrees ?? 0);
  if (isNaN(deg) || deg === 0) {
    return { degrees: 0, label: 'Calm' };
  }
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5);
  return {
    degrees: normalized,
    label: directions[index % 16],
  };
}
