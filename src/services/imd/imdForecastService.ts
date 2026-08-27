/**
 * IMD Forecast Service
 * Handles official city forecasts for the selected station / location.
 * Strictly binds to selectedLocation.stationId.
 */

import { imdClient } from './imdClient';
import { IMDNormalizedCityForecast } from './imdNormalizer';
import { SelectedLocationModel } from './imdStationService';

export interface ForecastResponse {
  status: 'live' | 'cached' | 'unavailable' | 'error';
  data: IMDNormalizedCityForecast | null;
  message?: string;
  source: string;
  lastUpdated: string;
}

class IMDForecastService {
  async getForecastForLocation(location: SelectedLocationModel): Promise<ForecastResponse> {
    if (!location.stationId || !location.verified) {
      return {
        status: 'unavailable',
        data: null,
        message: 'Official IMD city forecast is not available for this location.',
        source: 'India Meteorological Department',
        lastUpdated: new Date().toISOString(),
      };
    }

    try {
      const res = await imdClient.getCityForecast(location.stationId);
      if (res.data) {
        return {
          status: res.status === 'cached' ? 'cached' : 'live',
          data: {
            ...res.data,
            cityName: location.city,
            state: location.state,
          },
          source: 'India Meteorological Department',
          lastUpdated: res.lastUpdated || new Date().toISOString(),
        };
      }

      return {
        status: 'unavailable',
        data: null,
        message: 'Official IMD city forecast is temporarily unavailable from server.',
        source: 'India Meteorological Department',
        lastUpdated: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: 'error',
        data: null,
        message: err.message || 'Failed to retrieve forecast.',
        source: 'India Meteorological Department',
        lastUpdated: new Date().toISOString(),
      };
    }
  }
}

export const imdForecastService = new IMDForecastService();
