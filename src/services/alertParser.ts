import { LocationRecord } from '../types';
import { StandardizedWarningResponse, warningService } from './warningService';

export type AlertCenterUIState =
  | 'NO_ACTIVE_WARNING'
  | 'WATCH_ADVISORY'
  | 'ORANGE_ALERT'
  | 'RED_ALERT'
  | 'DATA_UNAVAILABLE'
  | 'NOT_APPLICABLE';

export type HazardType =
  | 'heavy_rain'
  | 'thunderstorm'
  | 'cyclone'
  | 'heatwave'
  | 'cold_wave'
  | 'dense_fog'
  | 'flood'
  | 'strong_wind'
  | 'coastal'
  | 'routine'
  | 'general';

export interface AlertTimeline {
  isValid: boolean;
  issuedTimestamp?: number;
  validUntilTimestamp?: number;
  nowTimestamp: number;
  progressPercent: number; // 0 to 100
  issuedFormatted?: string;
  validUntilFormatted?: string;
}

export interface ParsedAlertCenterData {
  uiState: AlertCenterUIState;
  statusBadge: {
    label: 'NORMAL' | 'WATCH' | 'ALERT' | 'SEVERE' | 'DATA UNAVAILABLE' | 'NOT APPLICABLE';
    color: 'green' | 'yellow' | 'orange' | 'red' | 'neutral' | 'blue';
    pulse: boolean;
  };
  severity: 'green' | 'yellow' | 'orange' | 'red' | 'neutral' | 'blue';
  severityText: string;
  scope: 'LOCAL' | 'STATE' | 'NATIONAL';
  scopeLabel: string;
  hazardType: HazardType;
  hazardHeadline: string;
  regionSubdivision: string;
  affectedDistricts: string[];
  affectedCount: number;
  summary: string;
  metrics: {
    affectedText: string;
    severityText: string;
    validUntilText: string;
    issuedAtText: string;
  };
  timeline: AlertTimeline | null;
  actions: {
    canViewFullWarning: boolean;
    hasSafetyGuidance: boolean;
    recommendedActions: string[];
    emergencyHelpline?: {
      title: string;
      number: string;
    };
  };
  trust: {
    source: string;
    updatedAt: string;
    status: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'Routine';
    isLiveTelemetry: boolean;
  };
  additionalActiveCount: number;
  isExpired: boolean;
  rawResponse: StandardizedWarningResponse | null;
}

/**
 * Deduce standardized hazard type from headline and label strings
 */
export function detectHazardType(rawHeadline?: string, rawLabel?: string, hazardCode?: number): HazardType {
  const text = `${rawHeadline || ''} ${rawLabel || ''}`.toLowerCase();

  if (hazardCode === 6 || text.includes('cyclone') || text.includes('depression') || text.includes('storm')) {
    return 'cyclone';
  }
  if (hazardCode === 3 || text.includes('thunder') || text.includes('lightning') || text.includes('squall') || text.includes('hail')) {
    return 'thunderstorm';
  }
  if (hazardCode === 2 || text.includes('heavy rain') || text.includes('rainfall') || text.includes('downpour')) {
    return 'heavy_rain';
  }
  if (hazardCode === 7 || text.includes('heat') || text.includes('warm night') || text.includes('hot day')) {
    return 'heatwave';
  }
  if (hazardCode === 8 || text.includes('cold') || text.includes('frost') || text.includes('chill')) {
    return 'cold_wave';
  }
  if (hazardCode === 5 || text.includes('fog') || text.includes('mist') || text.includes('smog')) {
    return 'dense_fog';
  }
  if (text.includes('flood') || text.includes('inundation') || text.includes('flash flood')) {
    return 'flood';
  }
  if (hazardCode === 4 || text.includes('strong wind') || text.includes('gale') || text.includes('gusty wind')) {
    return 'strong_wind';
  }
  if (text.includes('coastal') || text.includes('sea') || text.includes('wave') || text.includes('swell')) {
    return 'coastal';
  }
  if (text.includes('no warning') || text.includes('routine') || text.includes('clear')) {
    return 'routine';
  }
  return 'general';
}

/**
 * Parse timestamp strings to numeric epoch milliseconds
 */
function parseTimestampToMs(dateOrTimeString?: string): number | null {
  if (!dateOrTimeString || dateOrTimeString === 'N/A' || dateOrTimeString.toLowerCase().includes('unavailable')) {
    return null;
  }

  // Check if it's direct ISO or parseable by new Date()
  const parsed = Date.parse(dateOrTimeString);
  if (!isNaN(parsed) && parsed > 1000000000000) {
    return parsed;
  }

  // Check HH:mm IST format (e.g. "14:30 IST" or "20:00 IST • 09 Sep")
  const istMatch = dateOrTimeString.match(/(\d{1,2}):(\d{2})/);
  if (istMatch) {
    const hours = parseInt(istMatch[1], 10);
    const mins = parseInt(istMatch[2], 10);
    const now = new Date();
    // Use today's date with parsed time
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
    return target.getTime();
  }

  return null;
}

/**
 * Check whether the warning timestamp or validUntil date has already passed.
 * Returns true if the warning is strictly expired.
 */
export function isWarningExpired(raw: StandardizedWarningResponse): boolean {
  if (!raw || raw.state === 'NO_ACTIVE_WARNING' || raw.state === 'DATA_UNAVAILABLE') {
    return false;
  }

  const nowMs = Date.now();

  // If metadata provides validity timestamp
  if (raw.metadata && (raw.metadata as any).validityTimestamp) {
    const ts = (raw.metadata as any).validityTimestamp;
    if (typeof ts === 'number' && ts < nowMs) {
      return true;
    }
  }

  // Parse validUntil if it represents a past date or time
  const validUntilMs = parseTimestampToMs(raw.validUntil);
  if (validUntilMs && validUntilMs < nowMs - 30 * 60 * 1000) {
    // 30 min buffer for synoptic handover
    return true;
  }

  return false;
}

/**
 * Determine scope badge based on metadata and district mapping
 */
function determineScope(raw: StandardizedWarningResponse, location?: LocationRecord): {
  scope: 'LOCAL' | 'STATE' | 'NATIONAL';
  scopeLabel: string;
} {
  if (raw.metadata?.isInternational) {
    return { scope: 'NATIONAL', scopeLabel: 'INTERNATIONAL' };
  }

  const district = raw.metadata?.resolvedDistrict || location?.district || location?.city;
  const state = raw.metadata?.resolvedState || location?.state;

  if (district && raw.affectedDistricts && raw.affectedDistricts.length > 0) {
    const isInDistricts = raw.affectedDistricts.some(
      (d) => d.toLowerCase() === district.toLowerCase() || district.toLowerCase().includes(d.toLowerCase())
    );
    if (isInDistricts) {
      return { scope: 'LOCAL', scopeLabel: 'LOCAL DISTRICT WARNING' };
    }
  }

  if (state) {
    return { scope: 'STATE', scopeLabel: 'STATE SUBDIVISION ALERT' };
  }

  return { scope: 'NATIONAL', scopeLabel: 'NATIONAL WEATHER SYSTEM' };
}

/**
 * Construct the timeline progress object if timestamps are verifiable.
 * Hides if invalid or fabricated.
 */
function buildTimeline(issuedAtStr: string, validUntilStr: string): AlertTimeline | null {
  const issuedMs = parseTimestampToMs(issuedAtStr);
  const validMs = parseTimestampToMs(validUntilStr);
  const nowMs = Date.now();

  if (!issuedMs || !validMs || validMs <= issuedMs) {
    return null;
  }

  const totalDuration = validMs - issuedMs;
  const elapsed = Math.max(0, Math.min(totalDuration, nowMs - issuedMs));
  const progressPercent = Math.round((elapsed / totalDuration) * 100);

  return {
    isValid: true,
    issuedTimestamp: issuedMs,
    validUntilTimestamp: validMs,
    nowTimestamp: nowMs,
    progressPercent,
    issuedFormatted: issuedAtStr,
    validUntilFormatted: validUntilStr,
  };
}

/**
 * Takes the raw JSON response from /api/warnings and maps it to the frontend's
 * required UI states and command-center presentation model.
 * Strictly validates expiration and prioritizes official IMD data.
 */
export function mapWarningResponseToAlertCenter(
  raw: StandardizedWarningResponse | null,
  location?: LocationRecord
): ParsedAlertCenterData {
  const locName = location?.city
    ? `${location.city}${location.state ? `, ${location.state}` : ''}`
    : location?.state || 'Selected Location';

  // Fallback for null or missing response
  if (!raw) {
    return {
      uiState: 'DATA_UNAVAILABLE',
      statusBadge: {
        label: 'DATA UNAVAILABLE',
        color: 'neutral',
        pulse: false,
      },
      severity: 'neutral',
      severityText: 'Unavailable',
      scope: 'LOCAL',
      scopeLabel: 'STATION FEED',
      hazardType: 'general',
      hazardHeadline: 'METEOROLOGICAL WARNING FEED UNAVAILABLE',
      regionSubdivision: locName,
      affectedDistricts: [],
      affectedCount: 0,
      summary: 'Official real-time warning feed is currently unreachable. Surface observations remain active.',
      metrics: {
        affectedText: 'Unavailable',
        severityText: 'Unavailable',
        validUntilText: 'Unavailable',
        issuedAtText: 'Unavailable',
      },
      timeline: null,
      actions: {
        canViewFullWarning: true,
        hasSafetyGuidance: false,
        recommendedActions: [],
      },
      trust: {
        source: 'IMD Warning Service',
        updatedAt: 'Live',
        status: 'UNAVAILABLE',
        isLiveTelemetry: false,
      },
      additionalActiveCount: 0,
      isExpired: false,
      rawResponse: null,
    };
  }

  // 1. Check International Not Applicable
  if (raw.state === 'NOT_APPLICABLE' || raw.metadata?.isInternational) {
    return {
      uiState: 'NOT_APPLICABLE',
      statusBadge: {
        label: 'NOT APPLICABLE',
        color: 'blue',
        pulse: false,
      },
      severity: 'blue',
      severityText: 'IMD Out of Domain',
      scope: 'NATIONAL',
      scopeLabel: 'INTERNATIONAL SECTOR',
      hazardType: 'routine',
      hazardHeadline: 'IMD WARNING SERVICE NOT APPLICABLE',
      regionSubdivision: location?.country ? `${location.city || ''}, ${location.country}` : locName,
      affectedDistricts: [],
      affectedCount: 0,
      summary: `Official India Meteorological Department (IMD) warning alerts cover Indian sovereign territory and exclusive economic zones. Standard global weather observations remain operational for ${locName}.`,
      metrics: {
        affectedText: 'Not Applicable',
        severityText: 'Standard',
        validUntilText: 'Ongoing',
        issuedAtText: raw.issuedAt || 'Synoptic Cycle',
      },
      timeline: null,
      actions: {
        canViewFullWarning: true,
        hasSafetyGuidance: false,
        recommendedActions: [],
      },
      trust: {
        source: 'IMD Synoptic System',
        updatedAt: raw.updatedAt || 'Routine',
        status: 'Routine',
        isLiveTelemetry: false,
      },
      additionalActiveCount: 0,
      isExpired: false,
      rawResponse: raw,
    };
  }

  // 2. Check Data Unavailable / Network Failure
  if (raw.state === 'DATA_UNAVAILABLE') {
    return {
      uiState: 'DATA_UNAVAILABLE',
      statusBadge: {
        label: 'DATA UNAVAILABLE',
        color: 'neutral',
        pulse: false,
      },
      severity: 'neutral',
      severityText: 'Unavailable',
      scope: 'LOCAL',
      scopeLabel: 'DATA FEED',
      hazardType: 'general',
      hazardHeadline: 'WARNING DATA TEMPORARILY UNAVAILABLE',
      regionSubdivision: locName,
      affectedDistricts: [],
      affectedCount: 0,
      summary: 'Official real-time warning server is currently unreachable. Surface AWS telemetry and satellite radar remain operational.',
      metrics: {
        affectedText: 'Unavailable',
        severityText: 'Unavailable',
        validUntilText: 'Unavailable',
        issuedAtText: raw.issuedAt || 'Unavailable',
      },
      timeline: null,
      actions: {
        canViewFullWarning: true,
        hasSafetyGuidance: false,
        recommendedActions: [],
      },
      trust: {
        source: raw.source && raw.source !== 'None' ? raw.source : 'IMD Warning Service',
        updatedAt: raw.updatedAt || 'Recent',
        status: 'UNAVAILABLE',
        isLiveTelemetry: false,
      },
      additionalActiveCount: 0,
      isExpired: false,
      rawResponse: raw,
    };
  }

  // 3. Expiration Check - If expired, downgrade to NO_ACTIVE_WARNING
  const expired = isWarningExpired(raw);
  if (expired) {
    return {
      uiState: 'NO_ACTIVE_WARNING',
      statusBadge: {
        label: 'NORMAL',
        color: 'green',
        pulse: false,
      },
      severity: 'green',
      severityText: 'NORMAL',
      scope: 'LOCAL',
      scopeLabel: 'LOCAL STATUS',
      hazardType: 'routine',
      hazardHeadline: 'NO ACTIVE SEVERE WEATHER WARNING',
      regionSubdivision: locName,
      affectedDistricts: [],
      affectedCount: 0,
      summary: `Previous bulletins for ${locName} have concluded. No active severe weather warning is currently in effect for the current synoptic cycle.`,
      metrics: {
        affectedText: '0 districts',
        severityText: 'NORMAL',
        validUntilText: 'Next Synoptic Cycle',
        issuedAtText: raw.issuedAt || 'Current',
      },
      timeline: null,
      actions: {
        canViewFullWarning: true,
        hasSafetyGuidance: false,
        recommendedActions: [],
      },
      trust: {
        source: raw.source && raw.source !== 'None' ? raw.source : 'IMD',
        updatedAt: raw.updatedAt || 'Routine',
        status: 'Routine',
        isLiveTelemetry: false,
      },
      additionalActiveCount: 0,
      isExpired: true,
      rawResponse: raw,
    };
  }

  // 4. Check Routine / No Active Warning (Green)
  if (
    raw.state === 'NO_ACTIVE_WARNING' ||
    raw.severity === 'green' ||
    !raw.hazardHeadline ||
    raw.hazardHeadline.includes('NO ACTIVE')
  ) {
    return {
      uiState: 'NO_ACTIVE_WARNING',
      statusBadge: {
        label: 'NORMAL',
        color: 'green',
        pulse: false,
      },
      severity: 'green',
      severityText: 'NORMAL',
      scope: 'LOCAL',
      scopeLabel: 'ROUTINE SYNOPTIC CYCLE',
      hazardType: 'routine',
      hazardHeadline: 'NO ACTIVE SEVERE WEATHER WARNING',
      regionSubdivision: locName,
      affectedDistricts: [],
      affectedCount: 0,
      summary: `No official severe weather warning is currently reported for ${locName}. Atmospheric and meteorological parameters are within seasonal limits.`,
      metrics: {
        affectedText: 'None',
        severityText: 'NORMAL',
        validUntilText: raw.validUntil && raw.validUntil !== 'N/A' ? raw.validUntil : 'Next 24 Hours',
        issuedAtText: raw.issuedAt || 'Routine',
      },
      timeline: null,
      actions: {
        canViewFullWarning: true,
        hasSafetyGuidance: false,
        recommendedActions: [],
      },
      trust: {
        source: raw.source && raw.source !== 'None' ? raw.source : 'IMD',
        updatedAt: raw.updatedAt || 'Routine',
        status: 'Routine',
        isLiveTelemetry: false,
      },
      additionalActiveCount: raw.additionalActiveCount || 0,
      isExpired: false,
      rawResponse: raw,
    };
  }

  // 5. Active Warning: WATCH (Yellow), ALERT (Orange), or SEVERE (Red)
  const isRed = raw.severity === 'red' || raw.state === 'RED_ALERT';
  const isOrange = raw.severity === 'orange' || raw.state === 'ORANGE_ALERT';
  const isYellow = raw.severity === 'yellow' || raw.state === 'WATCH_ADVISORY';

  let uiState: AlertCenterUIState = 'WATCH_ADVISORY';
  let statusBadgeLabel: 'WATCH' | 'ALERT' | 'SEVERE' = 'WATCH';
  let badgeColor: 'yellow' | 'orange' | 'red' = 'yellow';
  let severityDisplay = 'YELLOW WATCH';

  if (isRed) {
    uiState = 'RED_ALERT';
    statusBadgeLabel = 'SEVERE';
    badgeColor = 'red';
    severityDisplay = 'RED ALERT';
  } else if (isOrange) {
    uiState = 'ORANGE_ALERT';
    statusBadgeLabel = 'ALERT';
    badgeColor = 'orange';
    severityDisplay = 'ORANGE ALERT';
  } else {
    uiState = 'WATCH_ADVISORY';
    statusBadgeLabel = 'WATCH';
    badgeColor = 'yellow';
    severityDisplay = 'YELLOW WATCH';
  }

  const { scope, scopeLabel } = determineScope(raw, location);
  const hazardType = detectHazardType(raw.hazardHeadline, raw.hazardLabel, raw.hazardCode);
  const headline = (raw.hazardHeadline || raw.hazardLabel || 'SEVERE WEATHER ALERT').toUpperCase();
  const regionSubdivision =
    raw.metadata?.subdivision ||
    raw.affectedAreasHeadline ||
    (location?.district ? `${location.district}, ${location.state || ''}` : locName);

  const affectedDistricts = Array.isArray(raw.affectedDistricts) ? raw.affectedDistricts : [];
  const districtCount = affectedDistricts.length || 1;
  const affectedText = districtCount === 1 && affectedDistricts[0] ? affectedDistricts[0] : `${districtCount} districts`;

  const timeline = buildTimeline(raw.issuedAt, raw.validUntil);

  return {
    uiState,
    statusBadge: {
      label: statusBadgeLabel,
      color: badgeColor,
      pulse: isRed || isOrange, // subtle animated pulse ONLY for actual active warning
    },
    severity: badgeColor,
    severityText: severityDisplay,
    scope,
    scopeLabel,
    hazardType,
    hazardHeadline: headline,
    regionSubdivision,
    affectedDistricts,
    affectedCount: districtCount,
    summary: raw.description,
    metrics: {
      affectedText,
      severityText: isRed ? 'RED' : isOrange ? 'ORANGE' : 'YELLOW',
      validUntilText: raw.validUntil && raw.validUntil !== 'N/A' ? raw.validUntil : 'Next 24 Hours',
      issuedAtText: raw.issuedAt && raw.issuedAt !== 'N/A' ? raw.issuedAt : 'Current Cycle',
    },
    timeline,
    actions: {
      canViewFullWarning: true,
      hasSafetyGuidance: isRed || isOrange || (raw.recommendedActions && raw.recommendedActions.length > 0) || false,
      recommendedActions: raw.recommendedActions || [],
      emergencyHelpline: raw.emergencyContact || {
        title: 'National Disaster Helpline',
        number: '112',
      },
    },
    trust: {
      source: raw.source && raw.source !== 'None' ? raw.source : 'IMD',
      updatedAt: raw.updatedAt || 'Recent',
      status: raw.status || (isRed || isOrange ? 'LIVE' : 'RECENT'),
      isLiveTelemetry: false,
    },
    additionalActiveCount: raw.additionalActiveCount || 0,
    isExpired: false,
    rawResponse: raw,
  };
}

/**
 * Complete official warning pipeline:
 * getApplicableWarning(location)
 * → resolve district/state/subdivision
 * → fetch verified warning data
 * → filter by current date
 * → filter expired warnings
 * → determine applicable severity
 * → select highest valid warning
 * → return parsed warning data
 *
 * If nothing applies: returns NO_ACTIVE_WARNING
 * If request fails: returns DATA_UNAVAILABLE (NEVER RED ALERT)
 */
export async function getApplicableWarning(
  location?: LocationRecord,
  forceRefresh = false
): Promise<ParsedAlertCenterData> {
  try {
    const raw = await warningService.fetchLocationWarning(location, forceRefresh);
    return mapWarningResponseToAlertCenter(raw, location);
  } catch (error) {
    // Strict safety constraint: Request failure NEVER results in Red or Orange alert!
    return mapWarningResponseToAlertCenter(
      {
        state: 'DATA_UNAVAILABLE',
        severity: 'neutral',
        severityLabel: 'DATA UNAVAILABLE',
        hazardHeadline: 'WARNING DATA TEMPORARILY UNAVAILABLE',
        affectedAreasHeadline: location?.city || location?.district || 'Selected Location',
        affectedDistricts: [],
        description: 'Real-time warning service is unreachable.',
        validUntil: 'Unavailable',
        issuedAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
        source: 'IMD',
        updatedAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'UNAVAILABLE',
        isLocal: false,
      },
      location
    );
  }
}
