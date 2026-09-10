// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Government Warning & CAP Alert Normalizer
// ====================================================================

import { NormalizedWarningItem, GeoLocation } from './types';

export interface RawCapAlert {
  identifier?: string | number;
  alert_id?: string;
  sender?: string;
  sent?: string;
  status?: string;
  msgType?: string;
  scope?: string;
  event?: string;
  disaster_type?: string;
  urgency?: string;
  severity?: string;
  severity_color?: string;
  certainty?: string;
  headline?: string;
  description?: string;
  warning_message?: string;
  instruction?: string;
  area_description?: string;
  effective?: string;
  onset?: string;
  expires?: string;
  effective_start_time?: string;
  effective_end_time?: string;
  source?: string;
  alert_source?: string;
  centroid?: string;
  coordinates?: string;
}

export class WarningNormalizer {
  /**
   * Determine if an alert is currently active (not expired)
   */
  public static isAlertValidAndActive(alert: RawCapAlert): boolean {
    const expiresStr = alert.expires || alert.effective_end_time;
    if (!expiresStr) return true; // If no explicit expiry, treat as active for 24h from issue

    const expiryTime = new Date(expiresStr).getTime();
    if (isNaN(expiryTime)) return true;

    return expiryTime > Date.now();
  }

  /**
   * Check if alert applies to requested location
   */
  public static matchesLocation(alert: RawCapAlert, loc: GeoLocation): boolean {
    const area = (alert.area_description || '').toLowerCase();
    const desc = (alert.description || alert.warning_message || alert.headline || '').toLowerCase();

    const district = (loc.district || loc.name || '').toLowerCase().trim();
    const city = (loc.city || '').toLowerCase().trim();
    const state = (loc.state || '').toLowerCase().trim();

    if (district && (area.includes(district) || desc.includes(district))) return true;
    if (city && (area.includes(city) || desc.includes(city))) return true;
    if (state && area.includes(state)) {
      // If state matches and district is mentioned, or all-state alert
      if (area.includes('all districts') || area.includes('statewide') || !district) return true;
    }

    return false;
  }

  /**
   * Normalize raw CAP object into NormalizedWarningItem
   */
  public static normalizeCapAlert(raw: RawCapAlert, loc: GeoLocation): NormalizedWarningItem {
    const rawSev = (raw.severity_color || raw.severity || 'yellow').toLowerCase();
    let severity: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' = 'YELLOW';

    if (rawSev.includes('red') || rawSev.includes('extreme') || rawSev.includes('severe')) {
      severity = 'RED';
    } else if (rawSev.includes('orange') || rawSev.includes('amber') || rawSev.includes('moderate')) {
      severity = 'ORANGE';
    } else if (rawSev.includes('green') || rawSev.includes('clear')) {
      severity = 'GREEN';
    }

    const hazard = raw.event || raw.disaster_type || 'Severe Weather Warning';
    const headline = raw.headline || `${severity} Alert: ${hazard} in ${loc.district || loc.name}`;
    const description = raw.description || raw.warning_message || `Official disaster warning issued for ${loc.district || loc.name}, ${loc.state || 'India'}.`;
    const instruction = raw.instruction || 'Follow directives issued by State & District Disaster Management Authorities (SDMA/DDMA). Stay in secure shelter.';

    return {
      id: String(raw.identifier || raw.alert_id || `sachet-${Date.now()}`),
      source: raw.source || raw.alert_source || 'NDMA / SACHET',
      warningId: String(raw.identifier || raw.alert_id || ''),
      country: 'India',
      state: loc.state,
      district: loc.district || loc.city,
      hazard,
      severity,
      severityLabel: `${severity} ALERT`,
      urgency: raw.urgency || 'Expected',
      certainty: raw.certainty || 'Likely',
      headline,
      issuedAt: raw.sent || raw.effective || raw.effective_start_time || new Date().toISOString(),
      validFrom: raw.effective || raw.effective_start_time || raw.onset,
      validUntil: raw.expires || raw.effective_end_time || 'Next 24 Hours',
      affectedArea: raw.area_description || `${loc.district || loc.name}, ${loc.state || ''}`,
      description,
      instruction,
      safetyGuidance: [
        'Stay indoors and avoid crossing swollen watercourses or flooded underpasses.',
        'Keep mobile devices charged and monitor local SDMA / IMD emergency advisories.',
        'Unplug sensitive electrical appliances during severe lightning activity.'
      ],
      isActive: true,
    };
  }
}
