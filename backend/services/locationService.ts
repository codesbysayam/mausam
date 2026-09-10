// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Centralized Location & Geocoding Engine
// Open-Meteo Geocoding / Nominatim Integration & Database Registry
// ====================================================================

import { GeoLocation } from '../normalization/types';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';

export interface GeocodedLocation extends GeoLocation {
  id: string;
  population?: number;
  admin1?: string; // State / Province
  admin2?: string; // District / County
}

export class LocationService {
  private static instance: LocationService;
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async searchLocations(query: string, count = 10): Promise<GeocodedLocation[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase();
    const cacheKey = cacheService.generateKey('STATION_METADATA', { q: cleanQuery, count });

    const cached = await cacheService.get<GeocodedLocation[]>(cacheKey);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    try {
      const url = `${this.geocodingUrl}?name=${encodeURIComponent(cleanQuery)}&count=${count}&language=en&format=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MAUSAM-Geocoding-Engine/3.0' },
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) {
        return [];
      }

      const json = await res.json();
      const results: any[] = json.results || [];

      const locations: GeocodedLocation[] = results.map((r) => {
        const id = `${r.latitude.toFixed(3)}_${r.longitude.toFixed(3)}`;
        const loc: GeocodedLocation = {
          id,
          name: r.name,
          city: r.name,
          district: r.admin2 || r.admin1,
          state: r.admin1 || r.country,
          country: r.country || 'India',
          latitude: r.latitude,
          longitude: r.longitude,
          elevation: r.elevation,
          timezone: r.timezone || 'Asia/Kolkata',
          population: r.population,
          admin1: r.admin1,
          admin2: r.admin2,
        };

        // Cache in DB if available
        dbService.upsertLocation(loc).catch(() => {});

        return loc;
      });

      await cacheService.set(cacheKey, locations, 'STATION_METADATA', 'Open-Meteo Geocoding');
      return locations;
    } catch (err: any) {
      console.warn('[LocationService] Geocoding search error:', err.message);
      return [];
    }
  }
}

export const locationService = LocationService.getInstance();
