import { LocationRecord } from '../types';
import { ALL_INDIA_LOCATIONS } from '../data/allIndiaLocations';
import { INDIA_STATES_UTS, IndiaRegion } from '../data/indiaRegions';
import { ODISHA_LOCATIONS } from '../data/odishaLocations';

export interface GeolocationPositionResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

export type LocatingPhase =
  | 'idle'
  | 'prompting'
  | 'locating'
  | 'geocoding'
  | 'success'
  | 'error';

export interface GeocodedAddress {
  country: string;
  countryCode: string;
  state: string;
  stateCode?: string;
  district: string;
  city: string;
  locality?: string;
  pincode?: string;
  formattedAddress: string;
}

export interface NearestStationResult {
  station: LocationRecord;
  distanceKm: number;
  bearingDeg?: number;
  type: string;
  code: string;
  name: string;
}

export interface ResolvedUserLocation {
  record: LocationRecord;
  rawCoordinates: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  address: GeocodedAddress;
  nearestStation: NearestStationResult;
  detectedAt: Date;
  source: 'DEVICE_GPS' | 'MANUAL_SEARCH';
}

export interface GeolocationServiceError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' | 'GEOCODING_FAILED' | 'UNKNOWN';
  message: string;
  instruction?: string;
}

/**
 * Calculates the Haversine great-circle distance between two geographic points in kilometers
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

/**
 * Normalizes Indian state and UT names into standard canonical formats
 */
export function normalizeIndianState(rawState: string): string {
  if (!rawState) return 'Odisha';
  const clean = rawState.trim().toLowerCase();

  if (clean.includes('odisha') || clean.includes('orissa')) return 'Odisha';
  if (clean.includes('delhi') || clean.includes('ncr')) return 'Delhi';
  if (clean.includes('maharashtra')) return 'Maharashtra';
  if (clean.includes('west bengal') || clean.includes('bengal')) return 'West Bengal';
  if (clean.includes('karnataka')) return 'Karnataka';
  if (clean.includes('tamil nadu') || clean.includes('tamilnadu')) return 'Tamil Nadu';
  if (clean.includes('telangana')) return 'Telangana';
  if (clean.includes('andhra')) return 'Andhra Pradesh';
  if (clean.includes('uttar pradesh') || clean === 'up') return 'Uttar Pradesh';
  if (clean.includes('madhya pradesh') || clean === 'mp') return 'Madhya Pradesh';
  if (clean.includes('rajasthan')) return 'Rajasthan';
  if (clean.includes('gujarat')) return 'Gujarat';
  if (clean.includes('bihar')) return 'Bihar';
  if (clean.includes('punjab')) return 'Punjab';
  if (clean.includes('haryana')) return 'Haryana';
  if (clean.includes('kerala')) return 'Kerala';
  if (clean.includes('assam')) return 'Assam';
  if (clean.includes('jharkhand')) return 'Jharkhand';
  if (clean.includes('chhattisgarh') || clean.includes('chattisgarh')) return 'Chhattisgarh';
  if (clean.includes('uttarakhand') || clean.includes('uttaranchal')) return 'Uttarakhand';
  if (clean.includes('himachal')) return 'Himachal Pradesh';
  if (clean.includes('goa')) return 'Goa';
  if (clean.includes('jammu') || clean.includes('kashmir')) return 'Jammu and Kashmir';
  if (clean.includes('ladakh')) return 'Ladakh';
  if (clean.includes('tripura')) return 'Tripura';
  if (clean.includes('meghalaya')) return 'Meghalaya';
  if (clean.includes('manipur')) return 'Manipur';
  if (clean.includes('nagaland')) return 'Nagaland';
  if (clean.includes('mizoram')) return 'Mizoram';
  if (clean.includes('sikkim')) return 'Sikkim';
  if (clean.includes('arunachal')) return 'Arunachal Pradesh';
  if (clean.includes('chandigarh')) return 'Chandigarh';
  if (clean.includes('puducherry') || clean.includes('pondicherry')) return 'Puducherry';
  if (clean.includes('andaman') || clean.includes('nicobar')) return 'Andaman and Nicobar Islands';
  if (clean.includes('lakshadweep')) return 'Lakshadweep';
  if (clean.includes('daman') || clean.includes('diu') || clean.includes('dadra') || clean.includes('nagar haveli'))
    return 'Dadra and Nagar Haveli and Daman and Diu';

  // Check matching against INDIA_STATES_UTS
  const match = INDIA_STATES_UTS.find((s) => s.name.toLowerCase() === clean || clean.includes(s.name.toLowerCase()));
  if (match) return match.name;

  return rawState;
}

class GeolocationService {
  private lastResolvedLocation: ResolvedUserLocation | null = null;
  private pendingRequest: Promise<ResolvedUserLocation> | null = null;
  private abortController: AbortController | null = null;

  /**
   * Check if Geolocation API is available in current browser environment
   */
  isGeolocationSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator;
  }

  /**
   * Queries permission state where supported (Chrome/Edge/Firefox)
   */
  async getPermissionStatus(): Promise<PermissionState | 'unsupported'> {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
      return 'unsupported';
    }
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return result.state;
    } catch {
      return 'unsupported';
    }
  }

  /**
   * Acquires coordinates directly from browser Geolocation API
   * Options: enableHighAccuracy: true, timeout: 12000, maximumAge: 60000
   */
  async getCurrentCoordinates(): Promise<GeolocationPositionResult> {
    if (!this.isGeolocationSupported()) {
      throw {
        code: 'UNSUPPORTED',
        message: 'Browser Geolocation is not supported on this device or context.',
        instruction: 'Please search your city or station manually.',
      } as GeolocationServiceError;
    }

    return new Promise((resolve, reject) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          let errorResult: GeolocationServiceError;
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorResult = {
                code: 'PERMISSION_DENIED',
                message: 'Location permission was denied.',
                instruction:
                  'You can enable location access in your browser settings (Site Settings → Location) and try again.',
              };
              break;
            case err.POSITION_UNAVAILABLE:
              errorResult = {
                code: 'POSITION_UNAVAILABLE',
                message: 'Unable to acquire satellite/network position.',
                instruction: 'Please ensure location services are turned on on your device, or search manually.',
              };
              break;
            case err.TIMEOUT:
              errorResult = {
                code: 'TIMEOUT',
                message: 'Location detection timed out.',
                instruction: 'The device took too long to return coordinates. Please try again.',
              };
              break;
            default:
              errorResult = {
                code: 'UNKNOWN',
                message: err.message || 'Unable to determine your current location.',
                instruction: 'Please search your city or district manually.',
              };
          }
          reject(errorResult);
        },
        options
      );
    });
  }

  /**
   * Performs reverse geocoding to resolve Country, State, District, City, and Locality
   * Uses BigDataCloud client reverse geocode + OSM fallback with local Indian station dataset fallback
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
    // 1. Try BigDataCloud reverse geocode client API (fast, free, CORS-friendly client endpoint)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawState = data.principalSubdivision || data.region || '';
        const state = normalizeIndianState(rawState);
        const district =
          data.localityInfo?.administrative?.[2]?.name?.replace(/\b(district|division)\b/gi, '').trim() ||
          data.locality ||
          data.city ||
          '';
        const city = data.city || data.locality || district || 'Local Station';
        const country = data.countryName || 'India';
        const countryCode = data.countryCode || 'IN';
        const pincode = data.postcode || '';

        const formattedAddress = [city, district !== city ? district : '', state, country]
          .filter(Boolean)
          .join(', ');

        return {
          country,
          countryCode,
          state,
          stateCode: data.principalSubdivisionCode || '',
          district: district || city,
          city,
          locality: data.locality || city,
          pincode,
          formattedAddress,
        };
      }
    } catch (err) {
      console.warn('[GeolocationService] BigDataCloud geocoding failed, trying OpenStreetMap Nominatim:', err);
    }

    // 2. Try OpenStreetMap Nominatim reverse geocode
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const state = normalizeIndianState(addr.state || addr.region || '');
        const district = (addr.state_district || addr.county || addr.district || addr.city || '')
          .replace(/\b(district|division)\b/gi, '')
          .trim();
        const city = addr.city || addr.town || addr.village || addr.suburb || district || 'Local Station';
        const country = addr.country || 'India';
        const pincode = addr.postcode || '';

        const formattedAddress = [city, district !== city ? district : '', state, country]
          .filter(Boolean)
          .join(', ');

        return {
          country,
          countryCode: addr.country_code?.toUpperCase() || 'IN',
          state,
          district: district || city,
          city,
          locality: addr.suburb || addr.neighbourhood || city,
          pincode,
          formattedAddress,
        };
      }
    } catch (err) {
      console.warn('[GeolocationService] Nominatim geocoding failed, falling back to local station spatial database:', err);
    }

    // 3. Fallback: Find nearest station in comprehensive allIndiaLocations database
    const nearest = this.findNearestStation(lat, lng);
    return {
      country: 'India',
      countryCode: 'IN',
      state: nearest.station.state,
      district: nearest.station.district,
      city: nearest.station.city,
      pincode: nearest.station.pincode || '',
      formattedAddress: `${nearest.station.city}, ${nearest.station.district}, ${nearest.station.state}, India`,
    };
  }

  /**
   * Finds the nearest meteorological observation station from the curated IMD AWS network
   */
  findNearestStation(lat: number, lng: number): NearestStationResult {
    const allStations = [...ALL_INDIA_LOCATIONS, ...ODISHA_LOCATIONS];
    let nearest: LocationRecord = allStations[0];
    let minDistance = Infinity;

    for (const st of allStations) {
      if (typeof st.lat === 'number' && typeof st.lng === 'number') {
        const dist = calculateDistanceKm(lat, lng, st.lat, st.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = st;
        }
      }
    }

    const stationCode = nearest.imdStation || `AWS-${nearest.district.substring(0, 3).toUpperCase()}-01`;
    const type = nearest.radarCoverage ? 'IMD Doppler Radar & AWS Observatory' : 'IMD Automatic Weather Station (AWS)';

    return {
      station: nearest,
      distanceKm: minDistance,
      code: stationCode,
      name: nearest.displayName,
      type,
    };
  }

  /**
   * Full end-to-end detection pipeline:
   * 1. Acquire GPS coordinates
   * 2. Reverse-geocode to administrative hierarchy (State/UT, District, City)
   * 3. Calculate nearest valid IMD AWS observation station
   * 4. Build unified LocationRecord for downstream weather pipelines
   */
  async detectUserLocation(forceRefresh = false): Promise<ResolvedUserLocation> {
    // If request already in progress, reuse promise (request deduplication)
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // If cached recently and not forceRefresh, return memory cache
    if (!forceRefresh && this.lastResolvedLocation) {
      const ageMs = Date.now() - this.lastResolvedLocation.detectedAt.getTime();
      if (ageMs < 120000) { // 2 minutes cache
        return this.lastResolvedLocation;
      }
    }

    this.pendingRequest = (async () => {
      try {
        const coords = await this.getCurrentCoordinates();
        const address = await this.reverseGeocode(coords.latitude, coords.longitude);
        const nearest = this.findNearestStation(coords.latitude, coords.longitude);

        // Determine coastal status based on distance to nearest coastal station or state
        const isCoastal =
          nearest.station.coastalStatus === 'coastal' ||
          ['Odisha', 'Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Maharashtra', 'Gujarat', 'West Bengal'].includes(
            address.state
          );

        // Build exact location record
        const locationId = `gps-${coords.latitude.toFixed(3)}-${coords.longitude.toFixed(3)}`;
        const record: LocationRecord = {
          id: locationId,
          city: address.city,
          district: address.district,
          state: address.state,
          lat: coords.latitude,
          lng: coords.longitude,
          pincode: address.pincode,
          timezone: 'Asia/Kolkata',
          displayName: `${address.city}, ${address.district} (${address.state})`,
          elevation: nearest.station.elevation || '45m ASL',
          weatherStation: nearest.name,
          imdStation: nearest.code,
          radarCoverage: nearest.station.radarCoverage,
          coastalStatus: isCoastal ? 'coastal' : 'inland',
          isPrimary: true,
        };

        const result: ResolvedUserLocation = {
          record,
          rawCoordinates: {
            lat: coords.latitude,
            lng: coords.longitude,
            accuracy: coords.accuracy,
          },
          address,
          nearestStation: nearest,
          detectedAt: new Date(),
          source: 'DEVICE_GPS',
        };

        this.lastResolvedLocation = result;
        this.saveLocationLocally(result);
        return result;
      } finally {
        this.pendingRequest = null;
      }
    })();

    return this.pendingRequest;
  }

  /**
   * Save detected location to localStorage for convenience
   */
  private saveLocationLocally(resolved: ResolvedUserLocation): void {
    try {
      localStorage.setItem('mausam_detected_location', JSON.stringify({
        record: resolved.record,
        rawCoordinates: resolved.rawCoordinates,
        address: resolved.address,
        nearestStation: resolved.nearestStation,
        detectedAt: resolved.detectedAt.toISOString(),
        source: resolved.source,
      }));
      localStorage.setItem('mausam_selected_location_id', resolved.record.id);
      localStorage.setItem('mausam_location_source', 'DEVICE_GPS');
    } catch {
      // Ignore in restricted iframe
    }
  }

  /**
   * Get previously detected location if available
   */
  getSavedDetectedLocation(): ResolvedUserLocation | null {
    try {
      const data = localStorage.getItem('mausam_detected_location');
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...parsed,
          detectedAt: new Date(parsed.detectedAt),
        };
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Clears saved location from browser storage
   */
  clearSavedLocation(): void {
    this.lastResolvedLocation = null;
    try {
      localStorage.removeItem('mausam_detected_location');
      localStorage.removeItem('mausam_location_source');
    } catch {
      // Ignore
    }
  }
}

export const geolocationService = new GeolocationService();
