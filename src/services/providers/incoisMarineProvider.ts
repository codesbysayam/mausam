// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// INCOIS & Coastal Oceanography Provider
// Provides verified ocean state, wave height, sea conditions & marine alerts
// Never fabricates marine data with LLM; returns UNAVAILABLE when unverified
// ====================================================================

import { OpenMeteoProvider } from './openMeteoProvider';

export interface NormalizedMarineData {
  isCoastal: boolean;
  waveHeightM?: number;
  wavePeriodSec?: number;
  waveDirectionDegrees?: number;
  seaCondition?: 'Calm' | 'Moderate' | 'Rough' | 'Very Rough' | 'High' | 'Phenomenal';
  tides?: Array<{ time: string; heightM: number; type: 'High' | 'Low' }>;
  coastalWarning?: string;
  observedAt: string;
  retrievedAt: string;
  provider: string;
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE' | 'NOT_APPLICABLE_INLAND';
}

const COASTAL_STATES = [
  'odisha',
  'west bengal',
  'andhra pradesh',
  'tamil nadu',
  'kerala',
  'karnataka',
  'goa',
  'maharashtra',
  'gujarat',
  'puducherry',
  'andaman and nicobar',
  'lakshadweep',
  'dadra and nagar haveli and daman and diu',
];

export function isRegionCoastal(stateName?: string, districtName?: string, cityName?: string): boolean {
  const s = (stateName || '').toLowerCase();
  const d = (districtName || '').toLowerCase();
  const c = (cityName || '').toLowerCase();

  const isCoastalState = COASTAL_STATES.some((cs) => s.includes(cs) || cs.includes(s));
  if (!isCoastalState) return false;

  const coastalKeywords = [
    'puri', 'paradip', 'gopalpur', 'chandipur', 'balasore', 'digha', 'chennai', 'mumbai', 'kochi',
    'cochin', 'visakhapatnam', 'vizag', 'mangaluru', 'mangalore', 'panaji', 'kavaratti', 'port blair',
    'kollam', 'alappuzha', 'trivandrum', 'thiruvananthapuram', 'thoothukudi', 'tuticorin', 'nagapattinam',
    'veraval', 'kandla', 'porbandar', 'bhavnagar', 'ratnagiri', 'karwar', 'havelock', 'machilipatnam',
  ];

  if (coastalKeywords.some((kw) => d.includes(kw) || c.includes(kw) || s.includes(kw))) {
    return true;
  }

  // If in a known coastal state, allow marine lookup for coastal context
  return true;
}

export function evaluateSeaCondition(waveHeightM?: number): 'Calm' | 'Moderate' | 'Rough' | 'Very Rough' | 'High' | 'Phenomenal' {
  if (!waveHeightM || waveHeightM < 0.5) return 'Calm';
  if (waveHeightM < 1.25) return 'Moderate';
  if (waveHeightM < 2.5) return 'Rough';
  if (waveHeightM < 4.0) return 'Very Rough';
  if (waveHeightM < 6.0) return 'High';
  return 'Phenomenal';
}

export class IncoisMarineProvider {
  public static async getMarineData(
    lat: number,
    lng: number,
    stateName?: string,
    districtName?: string,
    cityName?: string
  ): Promise<NormalizedMarineData> {
    const nowIso = new Date().toISOString();
    const coastal = isRegionCoastal(stateName, districtName, cityName);

    if (!coastal) {
      return {
        isCoastal: false,
        observedAt: nowIso,
        retrievedAt: nowIso,
        provider: 'INCOIS Oceanography Gateway',
        status: 'NOT_APPLICABLE_INLAND',
      };
    }

    // 1. Try INCOIS verified backend endpoint if configured
    try {
      if (typeof window !== 'undefined') {
        const url = `/api/authoritative?service=marine&lat=${lat}&lng=${lng}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeout);

        if (res && res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.source === 'INCOIS' && json.waveHeight !== undefined) {
            return {
              isCoastal: true,
              waveHeightM: json.waveHeight,
              wavePeriodSec: json.wavePeriod,
              waveDirectionDegrees: json.waveDirection,
              seaCondition: evaluateSeaCondition(json.waveHeight),
              tides: json.tides || [],
              coastalWarning: json.warning,
              observedAt: json.observedAt || nowIso,
              retrievedAt: nowIso,
              provider: 'Indian National Centre for Ocean Information Services (INCOIS)',
              status: 'LIVE',
            };
          }
        }
      }
    } catch {
      // Fall through to marine provider
    }

    // 2. Open-Meteo Marine verified telemetry
    const omMarine = await OpenMeteoProvider.getMarine(lat, lng);
    if (omMarine && omMarine.waveHeightM !== undefined) {
      return {
        isCoastal: true,
        waveHeightM: omMarine.waveHeightM,
        wavePeriodSec: omMarine.wavePeriodSec,
        waveDirectionDegrees: omMarine.waveDirectionDegrees,
        seaCondition: evaluateSeaCondition(omMarine.waveHeightM),
        observedAt: omMarine.observedAt,
        retrievedAt: omMarine.retrievedAt,
        provider: 'Open-Meteo Marine Oceanography',
        status: omMarine.status,
      };
    }

    return {
      isCoastal: true,
      observedAt: nowIso,
      retrievedAt: nowIso,
      provider: 'INCOIS Ocean Services / Marine Telemetry',
      status: 'UNAVAILABLE',
    };
  }
}
