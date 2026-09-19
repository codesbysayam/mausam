import { Router, Request, Response } from 'express';
import { getIMDWarningColor, getIMDHazardCode } from '../imd/imdWarningCodes';
import { sachetService, WeatherWarning } from '../services/sachetService';

export const warningsRouter = Router();

// ==========================================
// Types & Interfaces
// ==========================================

export type WarningUIState =
  | 'NO_ACTIVE_WARNING'
  | 'WATCH_ADVISORY'
  | 'ORANGE_ALERT'
  | 'RED_ALERT'
  | 'DATA_UNAVAILABLE'
  | 'NOT_APPLICABLE';

export interface StandardizedWarningResponse {
  state: WarningUIState;
  severity: 'green' | 'yellow' | 'orange' | 'red' | 'neutral';
  severityLabel: string;
  hazardHeadline: string;
  hazardCode?: number;
  hazardLabel?: string;
  affectedAreasHeadline: string;
  affectedDistricts: string[];
  description: string;
  validUntil: string;
  issuedAt: string;
  source: 'IMD' | 'NDMA/SACHET' | 'None';
  updatedAt: string;
  lastAttemptAt?: string | null;
  lastSuccessfulFetchAt?: string | null;
  lastSuccessfulParsedAt?: string | null;
  status: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'Routine';
  isLocal: boolean;
  recommendedActions?: string[];
  emergencyContact?: {
    title: string;
    number: string;
  };
  additionalActiveCount?: number;
  diagnostics?: any;
  metadata?: {
    lat?: number;
    lng?: number;
    resolvedDistrict?: string;
    resolvedState?: string;
    subdivision?: string;
    isInternational?: boolean;
    isCached?: boolean;
    [key: string]: any;
  };
}

// ==========================================
// In-Memory Cache & Request Deduplication
// ==========================================

interface CacheEntry {
  data: StandardizedWarningResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const warningsCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<StandardizedWarningResponse>>();

// Clean up stale cache periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of warningsCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS * 5) {
      warningsCache.delete(key);
    }
  }
}, 120 * 1000);
if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

// ==========================================
// Administrative Area Resolution
// ==========================================

interface ResolvedArea {
  district: string;
  state: string;
  subdivision?: string;
  isIndia: boolean;
}

// Map of common cities / towns / locations to official IMD district & state
const LOCATION_DISTRICT_MAP: Record<string, { district: string; state: string; subdivision?: string }> = {
  // Odisha
  chandaka: { district: 'Khordha', state: 'Odisha', subdivision: 'Odisha' },
  bhubaneswar: { district: 'Khordha', state: 'Odisha', subdivision: 'Odisha' },
  khordha: { district: 'Khordha', state: 'Odisha', subdivision: 'Odisha' },
  cuttack: { district: 'Cuttack', state: 'Odisha', subdivision: 'Odisha' },
  puri: { district: 'Puri', state: 'Odisha', subdivision: 'Odisha' },
  paradip: { district: 'Jagatsinghpur', state: 'Odisha', subdivision: 'Odisha' },
  jagatsinghpur: { district: 'Jagatsinghpur', state: 'Odisha', subdivision: 'Odisha' },
  balasore: { district: 'Balasore', state: 'Odisha', subdivision: 'Odisha' },
  kendrapara: { district: 'Kendrapara', state: 'Odisha', subdivision: 'Odisha' },
  bhadrak: { district: 'Bhadrak', state: 'Odisha', subdivision: 'Odisha' },
  ganjam: { district: 'Ganjam', state: 'Odisha', subdivision: 'Odisha' },
  sambalpur: { district: 'Sambalpur', state: 'Odisha', subdivision: 'Odisha' },
  rourkela: { district: 'Sundargarh', state: 'Odisha', subdivision: 'Odisha' },

  // Delhi NCR
  delhi: { district: 'New Delhi', state: 'Delhi', subdivision: 'Delhi' },
  'new delhi': { district: 'New Delhi', state: 'Delhi', subdivision: 'Delhi' },
  safdarjung: { district: 'New Delhi', state: 'Delhi', subdivision: 'Delhi' },
  noida: { district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', subdivision: 'West Uttar Pradesh' },
  gurugram: { district: 'Gurugram', state: 'Haryana', subdivision: 'Haryana, Chandigarh & Delhi' },
  gurgaon: { district: 'Gurugram', state: 'Haryana', subdivision: 'Haryana, Chandigarh & Delhi' },
  faridabad: { district: 'Faridabad', state: 'Haryana', subdivision: 'Haryana, Chandigarh & Delhi' },

  // Maharashtra
  mumbai: { district: 'Mumbai City', state: 'Maharashtra', subdivision: 'Konkan & Goa' },
  'mumbai suburban': { district: 'Mumbai Suburban', state: 'Maharashtra', subdivision: 'Konkan & Goa' },
  thane: { district: 'Thane', state: 'Maharashtra', subdivision: 'Konkan & Goa' },
  pune: { district: 'Pune', state: 'Maharashtra', subdivision: 'Madhya Maharashtra' },
  nagpur: { district: 'Nagpur', state: 'Maharashtra', subdivision: 'Vidarbha' },
  nashik: { district: 'Nashik', state: 'Maharashtra', subdivision: 'Madhya Maharashtra' },

  // West Bengal
  kolkata: { district: 'Kolkata', state: 'West Bengal', subdivision: 'Gangetic West Bengal' },
  howrah: { district: 'Howrah', state: 'West Bengal', subdivision: 'Gangetic West Bengal' },
  siliguri: { district: 'Darjeeling', state: 'West Bengal', subdivision: 'Sub-Himalayan West Bengal & Sikkim' },

  // Tamil Nadu
  chennai: { district: 'Chennai', state: 'Tamil Nadu', subdivision: 'Tamil Nadu, Puducherry & Karaikal' },
  coimbatore: { district: 'Coimbatore', state: 'Tamil Nadu', subdivision: 'Tamil Nadu, Puducherry & Karaikal' },
  madurai: { district: 'Madurai', state: 'Tamil Nadu', subdivision: 'Tamil Nadu, Puducherry & Karaikal' },

  // Karnataka
  bengaluru: { district: 'Bengaluru Urban', state: 'Karnataka', subdivision: 'South Interior Karnataka' },
  bangalore: { district: 'Bengaluru Urban', state: 'Karnataka', subdivision: 'South Interior Karnataka' },
  mysuru: { district: 'Mysuru', state: 'Karnataka', subdivision: 'South Interior Karnataka' },

  // Telangana & AP
  hyderabad: { district: 'Hyderabad', state: 'Telangana', subdivision: 'Telangana' },
  visakhapatnam: { district: 'Visakhapatnam', state: 'Andhra Pradesh', subdivision: 'Coastal Andhra Pradesh & Yanam' },
  vijayawada: { district: 'NTR', state: 'Andhra Pradesh', subdivision: 'Coastal Andhra Pradesh & Yanam' },

  // North & Central
  jaipur: { district: 'Jaipur', state: 'Rajasthan', subdivision: 'East Rajasthan' },
  ahmedabad: { district: 'Ahmedabad', state: 'Gujarat', subdivision: 'Gujarat Region' },
  lucknow: { district: 'Lucknow', state: 'Uttar Pradesh', subdivision: 'East Uttar Pradesh' },
  bhopal: { district: 'Bhopal', state: 'Madhya Pradesh', subdivision: 'West Madhya Pradesh' },
  patna: { district: 'Patna', state: 'Bihar', subdivision: 'Bihar' },
  guwahati: { district: 'Kamrup Metropolitan', state: 'Assam', subdivision: 'Assam & Meghalaya' },
  chandigarh: { district: 'Chandigarh', state: 'Chandigarh', subdivision: 'Haryana, Chandigarh & Delhi' },
  srinagar: { district: 'Srinagar', state: 'Jammu and Kashmir', subdivision: 'Jammu & Kashmir and Ladakh' },
  shimla: { district: 'Shimla', state: 'Himachal Pradesh', subdivision: 'Himachal Pradesh' },
  dehradun: { district: 'Dehradun', state: 'Uttarakhand', subdivision: 'Uttarakhand' },
  thiruvananthapuram: { district: 'Thiruvananthapuram', state: 'Kerala', subdivision: 'Kerala & Mahe' },
  kochi: { district: 'Ernakulam', state: 'Kerala', subdivision: 'Kerala & Mahe' },
  panaji: { district: 'North Goa', state: 'Goa', subdivision: 'Konkan & Goa' },
  goa: { district: 'North Goa', state: 'Goa', subdivision: 'Konkan & Goa' },
};

function formatCleanTime(date = new Date()): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm} IST`;
}

export function resolveAdministrativeArea(
  city?: string,
  district?: string,
  state?: string,
  country?: string,
  lat?: number,
  lng?: number
): ResolvedArea {
  // Check international coordinates or country
  const normalizedCountry = (country || '').trim().toLowerCase();
  const isExplicitForeign =
    normalizedCountry !== '' &&
    normalizedCountry !== 'india' &&
    normalizedCountry !== 'in' &&
    normalizedCountry !== 'bharat';

  // Check geo coordinates bounding box for India:
  // Lat: ~6.5 to ~37.5, Lng: ~68.0 to ~97.5
  const isGeoOutsideIndia =
    lat !== undefined &&
    lng !== undefined &&
    (lat < 6.0 || lat > 38.0 || lng < 68.0 || lng > 98.0);

  if (isExplicitForeign || isGeoOutsideIndia) {
    return {
      district: district || city || 'International Area',
      state: state || country || 'International',
      isIndia: false,
    };
  }

  // Priority 1: Match city or district key
  const cityKey = (city || '').toLowerCase().trim();
  const districtKey = (district || '').toLowerCase().trim();

  if (LOCATION_DISTRICT_MAP[cityKey]) {
    const found = LOCATION_DISTRICT_MAP[cityKey];
    return {
      district: district || found.district,
      state: state || found.state,
      subdivision: found.subdivision,
      isIndia: true,
    };
  }

  if (LOCATION_DISTRICT_MAP[districtKey]) {
    const found = LOCATION_DISTRICT_MAP[districtKey];
    return {
      district: found.district,
      state: state || found.state,
      subdivision: found.subdivision,
      isIndia: true,
    };
  }

  // Priority 2: Fallback to provided strings
  return {
    district: district || city || 'Met District',
    state: state || 'India',
    subdivision: state,
    isIndia: true,
  };
}

// ==========================================
// Official IMD Warning Service Integration
// ==========================================

interface IMDDistrictRawItem {
  district?: string;
  District?: string;
  District_Name?: string;
  Date?: string;
  date?: string;
  Day_1?: number | string;
  Day1?: number | string;
  Day1_Color?: number | string;
  Day_1_Color?: number | string;
  Day_2?: number | string;
  Day2_Color?: number | string;
  [key: string]: any;
}

// In-memory cache for NDMA Sachet alerts
interface NDMASachetAlertItem {
  identifier?: number | string;
  disaster_type?: string;
  severity?: string;
  severity_color?: string;
  area_description?: string;
  warning_message?: string;
  effective_start_time?: string;
  effective_end_time?: string;
  alert_source?: string;
  centroid?: string;
  [key: string]: any;
}

let ndmaCache: { data: NDMASachetAlertItem[]; timestamp: number } | null = null;
const NDMA_CACHE_TTL = 60 * 1000;

async function fetchFromNDMASachet(
  districtName: string,
  stateName?: string
): Promise<{
  success: boolean;
  matchedAlert?: NDMASachetAlertItem | null;
  totalAlertsCount: number;
  error?: string;
}> {
  try {
    const now = Date.now();
    let alertList: NDMASachetAlertItem[] = [];

    if (ndmaCache && now - ndmaCache.timestamp < NDMA_CACHE_TTL) {
      alertList = ndmaCache.data;
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails', {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mausam-NDMA-Connector/1.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          success: false,
          totalAlertsCount: 0,
          error: `NDMA returned HTTP ${res.status}`,
        };
      }

      const rawText = await res.text();
      if (rawText && rawText.trim()) {
        try {
          const json = JSON.parse(rawText);
          alertList = Array.isArray(json) ? json : [];
        } catch {
          const trimmed = rawText.trim();
          const lastObj = trimmed.lastIndexOf('}');
          if (trimmed.startsWith('[') && lastObj > 0) {
            try {
              const repaired = JSON.parse(trimmed.slice(0, lastObj + 1) + ']');
              if (Array.isArray(repaired)) alertList = repaired;
            } catch {
              alertList = [];
            }
          }
        }
      } else {
        alertList = [];
      }
      ndmaCache = { data: alertList, timestamp: now };
    }

    const distTarget = districtName.toLowerCase().trim();
    const stateTarget = (stateName || '').toLowerCase().trim();

    // Match alert by district or state in area_description or warning_message
    const matched = alertList.find((item) => {
      const areaDesc = (item.area_description || '').toLowerCase();
      const msg = (item.warning_message || '').toLowerCase();
      const matchDistrict = areaDesc.includes(distTarget) || msg.includes(distTarget);
      if (matchDistrict) return true;
      return false;
    });

    return {
      success: true,
      matchedAlert: matched || null,
      totalAlertsCount: alertList.length,
    };
  } catch (err: any) {
    return {
      success: false,
      totalAlertsCount: 0,
      error: err?.message || 'Failed to connect to NDMA SACHET feed',
    };
  }
}

async function fetchFromOfficialIMD(districtName: string): Promise<{
  success: boolean;
  status: 'LIVE' | 'UNAVAILABLE';
  warningItem?: IMDDistrictRawItem | null;
  error?: string;
}> {
  const baseUrl = process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in/api/v1';
  const apiKey = process.env.IMD_API_KEY;
  const apiToken = process.env.IMD_API_TOKEN;

  // If credentials are not present, do not attempt failing call
  if (!apiKey && !apiToken) {
    return {
      success: false,
      status: 'UNAVAILABLE',
      error: 'IMD API credentials not configured',
    };
  }

  const url = `${baseUrl.replace(/\/$/, '')}/districtwarning`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'Mausam-Government-Connector/1.0',
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  if (apiToken) {
    headers['Authorization'] = `Bearer ${apiToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        error: `IMD API returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();

    // Check if the response is an error object
    if (data && typeof data === 'object' && !Array.isArray(data) && data.error) {
      return {
        success: false,
        status: 'UNAVAILABLE',
        error: String(data.error),
      };
    }

    const list: IMDDistrictRawItem[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [data];

    const target = districtName.toLowerCase().trim();

    // Match district in response
    const matched = list.find((item) => {
      const dName = String(
        item.district || item.District || item.District_Name || ''
      ).toLowerCase().trim();
      return (
        dName === target ||
        dName.includes(target) ||
        target.includes(dName)
      );
    });

    return {
      success: true,
      status: 'LIVE',
      warningItem: matched || null,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      status: 'UNAVAILABLE',
      error: err?.message || 'Network error connecting to IMD API',
    };
  }
}

// ==========================================
// Core Warning Resolver Pipeline
// ==========================================

export async function resolveLocationWarning(params: {
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
}): Promise<StandardizedWarningResponse> {
  const { city, district, state, country, lat, lng } = params;
  const now = new Date();
  const updatedTimestamp = formatCleanTime(now);

  // 1. Resolve Administrative Area
  const area = resolveAdministrativeArea(city, district, state, country, lat, lng);
  const locationLabel = `${area.district}, ${area.state}`;

  // 2. International Check: IMD warnings not applicable outside India
  if (!area.isIndia) {
    return {
      state: 'NOT_APPLICABLE',
      severity: 'green',
      severityLabel: 'NOT APPLICABLE',
      hazardHeadline: 'OFFICIAL IMD WARNINGS NOT APPLICABLE',
      affectedAreasHeadline: locationLabel,
      affectedDistricts: [],
      description: 'Official Indian IMD meteorological warnings are not applicable to this international location.',
      validUntil: 'N/A',
      issuedAt: updatedTimestamp,
      source: 'IMD',
      updatedAt: updatedTimestamp,
      status: 'Routine',
      isLocal: false,
      metadata: {
        lat,
        lng,
        resolvedDistrict: area.district,
        resolvedState: area.state,
        isInternational: true,
      },
    };
  }

  // 3. Query Official NDMA SACHET CAP Warning Service (Primary zero-key provider)
  const sachetResult = await sachetService.getWarningsForLocation({
    city,
    district: area.district,
    state: area.state,
    lat,
    lng,
  });

  if (sachetResult.status === 'SUCCESS') {
    const isCachedFeed = !!(sachetResult as any).isCached;
    const parsedTime = sachetResult.lastSuccessfulParsedAt
      ? formatCleanTime(new Date(sachetResult.lastSuccessfulParsedAt))
      : updatedTimestamp;

    if (sachetResult.matchedWarnings.length > 0) {
      const highest = sachetResult.matchedWarnings[0];
      const sev = (highest.severity || 'ORANGE').toLowerCase() as 'yellow' | 'orange' | 'red';
      const isRed = sev === 'red';
      const isOrange = sev === 'orange';

      const uiState: WarningUIState = isRed ? 'RED_ALERT' : isOrange ? 'ORANGE_ALERT' : 'WATCH_ADVISORY';
      const severityLabel = isRed ? 'RED ALERT' : isOrange ? 'ORANGE ALERT' : 'YELLOW WATCH';

      return {
        state: uiState,
        severity: sev,
        severityLabel: isCachedFeed ? `CACHED / ${severityLabel}` : severityLabel,
        hazardHeadline: (highest.headline || highest.event || 'SEVERE WEATHER ALERT').toUpperCase(),
        hazardLabel: highest.event || 'Severe Weather',
        affectedAreasHeadline: highest.areas.join(', ') || locationLabel,
        affectedDistricts: [area.district],
        description: highest.description || `Official ${severityLabel.toLowerCase()} active for ${area.district}.`,
        validUntil: highest.expires || 'Next 24 Hours',
        issuedAt: highest.issuedAt || parsedTime,
        source: 'NDMA/SACHET',
        updatedAt: parsedTime,
        lastAttemptAt: sachetResult.lastAttemptAt,
        lastSuccessfulFetchAt: sachetResult.lastSuccessfulFetchAt,
        lastSuccessfulParsedAt: sachetResult.lastSuccessfulParsedAt,
        status: isCachedFeed ? 'STALE' : 'LIVE',
        isLocal: true,
        recommendedActions: [
          highest.instruction || 'Stay indoors and avoid travel through inundation zones or exposed terrain.',
          'Keep communication devices charged and monitor district bulletins.',
        ],
        emergencyContact: {
          title: highest.sender || 'State Disaster Management Authority',
          number: '1070',
        },
        additionalActiveCount: sachetResult.matchedWarnings.length - 1,
        diagnostics: sachetService.getDiagnostics(),
        metadata: {
          lat,
          lng,
          resolvedDistrict: area.district,
          resolvedState: area.state,
          subdivision: area.subdivision,
          isInternational: false,
          isCached: isCachedFeed,
        },
      };
    }

    // NDMA SACHET feed is live and verified, but this location has ZERO active official warnings!
    return {
      state: 'NO_ACTIVE_WARNING',
      severity: 'green',
      severityLabel: 'ALL CLEAR',
      hazardHeadline: 'NO ACTIVE OFFICIAL WARNINGS',
      affectedAreasHeadline: locationLabel,
      affectedDistricts: [],
      description: `Verified official NDMA / SACHET disaster bulletin reports 0 active severe weather warnings for ${locationLabel}. Atmospheric conditions and synoptic parameters are within seasonal routine limits across this division.`,
      validUntil: 'Next 24 Hours',
      issuedAt: parsedTime,
      source: 'NDMA/SACHET',
      updatedAt: parsedTime,
      lastAttemptAt: sachetResult.lastAttemptAt,
      lastSuccessfulFetchAt: sachetResult.lastSuccessfulFetchAt,
      lastSuccessfulParsedAt: sachetResult.lastSuccessfulParsedAt,
      status: isCachedFeed ? 'STALE' : 'LIVE',
      isLocal: true,
      diagnostics: sachetService.getDiagnostics(),
      metadata: {
        lat,
        lng,
        resolvedDistrict: area.district,
        resolvedState: area.state,
        subdivision: area.subdivision,
        isInternational: false,
        isCached: isCachedFeed,
      },
    };
  }

  // Official feed unreachable: Return truthful PROVIDER_UNAVAILABLE state (NEVER GREEN, NEVER CLAIM NO WARNINGS)
  const lastSyncDisplay = sachetResult.lastSuccessfulParsedAt
    ? formatCleanTime(new Date(sachetResult.lastSuccessfulParsedAt))
    : 'Never successfully synced';

  return {
    state: 'DATA_UNAVAILABLE',
    severity: 'neutral',
    severityLabel: 'OFFICIAL WARNING FEED UNAVAILABLE',
    hazardHeadline: 'OFFICIAL WARNING FEED UNAVAILABLE',
    affectedAreasHeadline: locationLabel,
    affectedDistricts: [area.district],
    description: 'Weather telemetry remains operational. Official real-time warning feed from NDMA / SACHET is temporarily unreachable.',
    validUntil: 'N/A',
    issuedAt: 'Unavailable',
    source: 'NDMA/SACHET',
    updatedAt: lastSyncDisplay,
    lastAttemptAt: sachetResult.lastAttemptAt,
    lastSuccessfulFetchAt: sachetResult.lastSuccessfulFetchAt,
    lastSuccessfulParsedAt: sachetResult.lastSuccessfulParsedAt,
    status: 'UNAVAILABLE',
    isLocal: true,
    diagnostics: sachetService.getDiagnostics(),
    metadata: {
      lat,
      lng,
      resolvedDistrict: area.district,
      resolvedState: area.state,
      subdivision: area.subdivision,
      isInternational: false,
    },
  };
}

// ==========================================
// Express Route Handler with Deduplication & Cache
// ==========================================

const handleWarningRequest = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const city = (req.query.city as string) || '';
    const district = (req.query.district as string) || '';
    const state = (req.query.state as string) || '';
    const country = (req.query.country as string) || '';
    const forceRefresh = req.query.refresh === 'true';

    // Support safe diagnostics debug mode
    if (req.query.mode === 'debug' || req.query.debug === 'true') {
      return res.json({
        diagnostics: sachetService.getDiagnostics(),
        timestamp: new Date().toISOString(),
      });
    }

    // Build unique cache key for this location
    const cacheKey = `${city}|${district}|${state}|${country}|${lat?.toFixed(2) || ''}|${lng?.toFixed(2) || ''}`.toLowerCase();

    // Check cache
    if (!forceRefresh) {
      const cached = warningsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.json(cached.data);
      }
    }

    // Request Deduplication: Reuse pending promise if identical request is in-flight
    let requestPromise = inFlightRequests.get(cacheKey);

    if (!requestPromise) {
      requestPromise = resolveLocationWarning({ city, district, state, country, lat, lng })
        .then((result) => {
          warningsCache.set(cacheKey, { data: result, timestamp: Date.now() });
          inFlightRequests.delete(cacheKey);
          return result;
        })
        .catch((err) => {
          inFlightRequests.delete(cacheKey);
          throw err;
        });

      inFlightRequests.set(cacheKey, requestPromise);
    }

    const warningResult = await requestPromise;
    return res.json(warningResult);
  } catch (error: any) {
    console.error('[Warnings API Error]', error);
    // Even on server error, return a valid DATA_UNAVAILABLE response rather than crashing or returning fake red alert
    const fallback: StandardizedWarningResponse = {
      state: 'DATA_UNAVAILABLE',
      severity: 'neutral',
      severityLabel: 'DATA UNAVAILABLE',
      hazardHeadline: 'WARNING DATA TEMPORARILY UNAVAILABLE',
      affectedAreasHeadline: 'Selected Area',
      affectedDistricts: [],
      description: 'Unable to communicate with the meteorological warning service at this moment.',
      validUntil: 'N/A',
      issuedAt: formatCleanTime(new Date()),
      source: 'NDMA/SACHET',
      updatedAt: formatCleanTime(new Date()),
      status: 'UNAVAILABLE',
      isLocal: false,
    };
    return res.status(200).json(fallback);
  }
};

warningsRouter.get('/current', handleWarningRequest);
warningsRouter.get('/', handleWarningRequest);

warningsRouter.get('/national', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    const national = await sachetService.getNationalRegionWarnings();
    return res.json(national);
  } catch (error: any) {
    console.error('[Warnings National API Error]', error);
    return res.status(200).json({
      status: 'UNAVAILABLE',
      timestamp: new Date().toISOString(),
      regions: [],
      error: error?.message || 'National feed unavailable',
    });
  }
});
