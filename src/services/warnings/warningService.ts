// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Meteorological Warning Service
// Filters expired warnings, checks state/district/region, avoids fake status
// ====================================================================

import { WarningContextItem, AlertSeverityLevel } from '../../types/askMausam';
import { NATIONAL_WARNINGS_DATABASE } from '../../data/nationalWarningsData';

export interface WarningLookupResult {
  status: 'ACTIVE_WARNINGS' | 'NO_ACTIVE_WARNINGS' | 'UNAVAILABLE';
  warnings: WarningContextItem[];
  highestSeverity?: AlertSeverityLevel;
  source: string;
  summaryText: string;
}

export function getActiveWarningsForLocation(
  stateName?: string,
  districtName?: string,
  cityName?: string
): WarningLookupResult {
  const now = Date.now();

  try {
    // 1. Filter out expired warnings
    const nonExpired = NATIONAL_WARNINGS_DATABASE.filter((w) => {
      if (!w.validityTimestamp) return true;
      return w.validityTimestamp > now;
    });

    if (!stateName && !districtName && !cityName) {
      // Return national active warnings
      const items: WarningContextItem[] = nonExpired.map((w) => ({
        id: w.id,
        severity: (w.severity as AlertSeverityLevel) || 'yellow',
        hazard: w.hazardLabel,
        headline: w.title,
        affectedArea: w.affectedAreaText || w.state,
        validUntil: w.validUntil,
        issuedAt: w.issuedAt,
        source: 'India Meteorological Department (IMD Bulletin)',
        description: w.description,
        actionAdvice: w.recommendedActions?.join('; '),
      }));

      const highest = getHighestSeverity(items);
      return {
        status: items.length > 0 ? 'ACTIVE_WARNINGS' : 'NO_ACTIVE_WARNINGS',
        warnings: items,
        highestSeverity: highest,
        source: 'India Meteorological Department (IMD)',
        summaryText: items.length > 0
          ? `IMD currently maintains ${items.length} active meteorological warning bulletins across India sub-divisions.`
          : 'No severe weather alerts currently active across national sub-divisions.',
      };
    }

    const stateTarget = (stateName || '').toLowerCase().trim();
    const districtTarget = (districtName || '').toLowerCase().trim();
    const cityTarget = (cityName || '').toLowerCase().trim();

    const matches = nonExpired.filter((w) => {
      const wState = w.state.toLowerCase();
      const wSubdiv = w.subdivision.toLowerCase();
      const stateMatch = stateTarget && (wState.includes(stateTarget) || stateTarget.includes(wState) || wSubdiv.includes(stateTarget));

      let districtMatch = false;
      if (districtTarget) {
        districtMatch = w.affectedDistricts?.some((d) => d.toLowerCase().includes(districtTarget) || districtTarget.includes(d.toLowerCase())) || false;
      }
      if (!districtMatch && cityTarget) {
        districtMatch = w.affectedDistricts?.some((d) => d.toLowerCase().includes(cityTarget) || cityTarget.includes(d.toLowerCase())) || false;
      }

      return stateMatch || districtMatch;
    });

    const items: WarningContextItem[] = matches.map((w) => ({
      id: w.id,
      severity: (w.severity as AlertSeverityLevel) || 'yellow',
      hazard: w.hazardLabel,
      headline: w.title,
      affectedArea: w.affectedAreaText || w.state,
      validUntil: w.validUntil,
      issuedAt: w.issuedAt,
      source: 'India Meteorological Department (IMD Bulletin)',
      description: w.description,
      actionAdvice: w.recommendedActions?.join('; '),
    }));

    const highest = getHighestSeverity(items);

    return {
      status: items.length > 0 ? 'ACTIVE_WARNINGS' : 'NO_ACTIVE_WARNINGS',
      warnings: items,
      highestSeverity: highest,
      source: 'India Meteorological Department (IMD)',
      summaryText: items.length > 0
        ? `Official IMD Advisory in effect: ${items[0].headline} (${items[0].severity.toUpperCase()} ALERT). Valid until: ${items[0].validUntil || 'further notice'}.`
        : `No severe weather warnings currently active for ${districtName || stateName || 'this region'}. Routine seasonal conditions prevailing.`,
    };
  } catch {
    return {
      status: 'UNAVAILABLE',
      warnings: [],
      source: 'India Meteorological Department (IMD)',
      summaryText: 'Official warning bulletin feed is currently unavailable for this location. Please check regional IMD advisories.',
    };
  }
}

function getHighestSeverity(items: WarningContextItem[]): AlertSeverityLevel | undefined {
  if (items.some((w) => w.severity === 'red')) return 'red';
  if (items.some((w) => w.severity === 'orange')) return 'orange';
  if (items.some((w) => w.severity === 'yellow')) return 'yellow';
  if (items.some((w) => w.severity === 'green')) return 'green';
  if (items.some((w) => w.severity === 'info')) return 'info';
  return undefined;
}
