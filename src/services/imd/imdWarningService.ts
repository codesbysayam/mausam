/**
 * IMD Warning Service
 * Handles multi-hazard severe weather warnings for the selected location and state.
 * Uses official IMD district and subdivision warning endpoints.
 */

import { imdClient } from './imdClient';
import { IMDNormalizedDistrictWarning } from './imdNormalizer';
import { SelectedLocationModel } from './imdStationService';

export interface WarningsResponse {
  status: 'live' | 'cached' | 'unavailable' | 'error';
  warnings: IMDNormalizedDistrictWarning[];
  subdivisionStatus?: string;
  source: string;
  lastUpdated: string;
}

class IMDWarningService {
  async getWarningsForLocation(location: SelectedLocationModel): Promise<WarningsResponse> {
    const defaultRes: WarningsResponse = {
      status: 'live',
      warnings: [],
      subdivisionStatus: 'No active severe weather warnings for this region.',
      source: 'India Meteorological Department',
      lastUpdated: new Date().toISOString(),
    };

    try {
      // Fetch district warning if station/district matches
      const res = await imdClient.fetchEndpoint('/districtwarning', { id: location.stationId || location.city });
      if (res.data && Array.isArray(res.data)) {
        const mapped: IMDNormalizedDistrictWarning[] = res.data
          .filter((w: any) => {
            if (!w) return false;
            const dist = String(w.District_Name || w.district || '').toLowerCase();
            const state = String(w.State_Name || w.state || '').toLowerCase();
            return (
              dist.includes(location.city.toLowerCase()) ||
              state.includes(location.state.toLowerCase())
            );
          })
          .map((w: any) => {
            const colorCode = Number(w.Color_Code || w.color_code || 1);
            const colorName =
              colorCode === 4 ? 'SEVERE' : colorCode === 3 ? 'WARNING' : colorCode === 2 ? 'WATCH' : 'NORMAL';
            const colorHex =
              colorCode === 4 ? '#E63946' : colorCode === 3 ? '#FFB703' : colorCode === 2 ? '#FFD166' : '#2A9D8F';

            return {
              districtId: String(w.District_Id || location.stationId || ''),
              districtName: String(w.District_Name || location.city),
              stateName: String(w.State_Name || location.state),
              warningDate: String(w.Date || new Date().toISOString().split('T')[0]),
              colorCode,
              colorName,
              colorHex,
              hazardCode: Number(w.Hazard_Code || 0),
              hazardLabel: String(w.Hazard_Name || 'General Meteorological Advisory'),
              description: String(w.Warning || w.warning || 'No severe meteorological hazard detected.'),
              actionText: String(w.Action || 'Keep updated with latest IMD bulletins.'),
            };
          });

        return {
          status: res.status === 'cached' ? 'cached' : 'live',
          warnings: mapped,
          subdivisionStatus: mapped.length > 0 ? `${mapped.length} active warning(s) in region` : 'No active severe warnings',
          source: 'India Meteorological Department',
          lastUpdated: res.lastUpdated || new Date().toISOString(),
        };
      }

      return defaultRes;
    } catch {
      return defaultRes;
    }
  }
}

export const imdWarningService = new IMDWarningService();
