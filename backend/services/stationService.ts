// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// IMD AWS / ARG Station Metadata Resolver Service
// ====================================================================

import imdStationsData from '../../src/data/imdStations.json';
import { GeoLocation } from '../normalization/types';

export interface StationMetadata {
  id: string;
  name: string;
  state: string;
  district?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  type: string;
  distanceKm: number;
}

export class StationService {
  private static instance: StationService;

  public static getInstance(): StationService {
    if (!StationService.instance) {
      StationService.instance = new StationService();
    }
    return StationService.instance;
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  public findNearestStations(lat: number, lon: number, limit = 5): StationMetadata[] {
    const stations: StationMetadata[] = [];
    const rawList = Array.isArray(imdStationsData) ? (imdStationsData as any[]) : [];

    for (const st of rawList) {
      const stLat = parseFloat(st.latitude || st.lat);
      const stLon = parseFloat(st.longitude || st.lon || st.lng);
      if (isNaN(stLat) || isNaN(stLon)) continue;

      const dist = this.calculateDistanceKm(lat, lon, stLat, stLon);
      stations.push({
        id: String(st.id || st.station_id || st.code),
        name: st.name || st.station_name || 'IMD Station',
        state: st.state || '',
        district: st.district || '',
        latitude: stLat,
        longitude: stLon,
        elevation: st.elevation ? parseFloat(st.elevation) : undefined,
        type: st.type || 'AWS',
        distanceKm: dist,
      });
    }

    stations.sort((a, b) => a.distanceKm - b.distanceKm);
    return stations.slice(0, limit);
  }
}

export const stationService = StationService.getInstance();
