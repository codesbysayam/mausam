// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// NDMA / SACHET Disaster Management Adapter (Official CAP Feed)
// ====================================================================

import { NormalizedWarningItem, GeoLocation } from '../normalization/types';
import { dataHealthService } from '../services/DataHealthService';

interface NDMACapAlert {
  identifier?: string | number;
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

export class NDMAAdapter {
  private static feedUrl = 'https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails';
  private static alertCache: { data: NDMACapAlert[]; timestamp: number } | null = null;
  private static CACHE_TTL_MS = 60 * 1000; // 1 minute feed cache

  public static async fetchAllAlerts(): Promise<NDMACapAlert[]> {
    const now = Date.now();
    if (this.alertCache && now - this.alertCache.timestamp < this.CACHE_TTL_MS) {
      return this.alertCache.data;
    }

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(this.feedUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MAUSAM-NDMA-Connector/2.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const latency = Date.now() - startTime;
      if (!res.ok) {
        dataHealthService.recordFailure('NDMA_SACHET', `HTTP ${res.status}`, res.status);
        return this.alertCache?.data || [];
      }

      const json = await res.json();
      const alerts = Array.isArray(json) ? json : [];
      this.alertCache = { data: alerts, timestamp: now };
      dataHealthService.recordSuccess('NDMA_SACHET', latency, alerts.length, res.status);
      return alerts;
    } catch (err: any) {
      dataHealthService.recordFailure('NDMA_SACHET', err.message, 500);
      return this.alertCache?.data || [];
    }
  }

  public static async matchAlertForLocation(loc: GeoLocation): Promise<NormalizedWarningItem | null> {
    const alerts = await this.fetchAllAlerts();
    if (!alerts || alerts.length === 0) return null;

    const district = (loc.district || loc.name || '').toLowerCase().trim();
    const city = (loc.city || '').toLowerCase().trim();
    const state = (loc.state || '').toLowerCase().trim();

    const matched = alerts.find((item) => {
      const area = (item.area_description || '').toLowerCase();
      const msg = (item.warning_message || '').toLowerCase();

      // Expired warnings check
      if (item.effective_end_time) {
        const endTime = new Date(item.effective_end_time).getTime();
        if (!isNaN(endTime) && endTime < Date.now()) {
          return false; // Expired
        }
      }

      if (district && (area.includes(district) || msg.includes(district))) return true;
      if (city && (area.includes(city) || msg.includes(city))) return true;
      if (state && area.includes(state) && area.includes(district)) return true;
      return false;
    });

    if (!matched) return null;

    const color = (matched.severity_color || matched.severity || 'yellow').toLowerCase();
    const severity: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' =
      color === 'red' ? 'RED' : color === 'orange' ? 'ORANGE' : 'YELLOW';

    return {
      id: String(matched.identifier || `ndma-${Date.now()}`),
      source: matched.alert_source || 'NDMA / SACHET',
      warningId: String(matched.identifier || ''),
      country: 'India',
      state: loc.state,
      district: loc.district || loc.city,
      hazard: matched.disaster_type || 'Severe Weather',
      severity,
      severityLabel: `${severity} ALERT`,
      issuedAt: matched.effective_start_time || new Date().toISOString(),
      validFrom: matched.effective_start_time,
      validUntil: matched.effective_end_time || 'Next 24 Hours',
      affectedArea: matched.area_description || `${loc.district || loc.name}, ${loc.state || ''}`,
      description: matched.warning_message || `Official disaster warning issued for ${loc.district || loc.name}.`,
      safetyGuidance: [
        'Stay indoors and avoid travel through flood-prone lowlands or exposed areas.',
        'Keep communication equipment charged and heed local SDMA disaster alerts.',
      ],
      isActive: true,
    };
  }
}
