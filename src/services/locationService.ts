import { LocationRecord, WeatherStation } from '../types';
import { ALL_INDIA_LOCATIONS } from '../data/allIndiaLocations';
import { PRIMARY_ODISHA_LOCATION } from '../data/odishaLocations';

class LocationService {
  private locations: LocationRecord[] = ALL_INDIA_LOCATIONS;
  private selectedLocationId: string = PRIMARY_ODISHA_LOCATION.id;

  getAllLocations(): LocationRecord[] {
    return this.locations;
  }

  getOdishaLocations(): LocationRecord[] {
    return this.locations.filter((l) => l.state === 'Odisha');
  }

  getNationalStations(): LocationRecord[] {
    return this.locations.filter((l) => l.state !== 'Odisha');
  }

  getPrimaryLocation(): LocationRecord {
    return PRIMARY_ODISHA_LOCATION;
  }

  findLocationById(id: string): LocationRecord | undefined {
    if (!id) return undefined;
    const cleanId = id.toLowerCase().trim();

    // 1. Direct ID match
    const direct = this.locations.find((l) => l.id.toLowerCase() === cleanId);
    if (direct) return direct;

    // 2. Partial ID match (e.g. 'delhi' matching 'delhi-safdarjung')
    const partialId = this.locations.find(
      (l) => l.id.toLowerCase().includes(cleanId) || cleanId.includes(l.id.toLowerCase())
    );
    if (partialId) return partialId;

    // 3. Match by aliases or city
    return this.findLocationByName(id);
  }

  getLocationById(id: string): LocationRecord {
    return this.findLocationById(id) || this.getPrimaryLocation();
  }

  findLocationByName(name: string): LocationRecord | undefined {
    if (!name) return undefined;
    const q = name.toLowerCase().trim();

    // 1. Exact city match
    const exactCity = this.locations.find((l) => l.city.toLowerCase() === q);
    if (exactCity) return exactCity;

    // 2. Exact district match
    const exactDistrict = this.locations.find((l) => l.district.toLowerCase() === q);
    if (exactDistrict) return exactDistrict;

    // 3. Exact alias match
    const exactAlias = this.locations.find(
      (l) => l.aliases && l.aliases.some((a) => a.toLowerCase() === q)
    );
    if (exactAlias) return exactAlias;

    // 4. Exact display name match
    const exactDisplay = this.locations.find((l) => l.displayName.toLowerCase() === q);
    if (exactDisplay) return exactDisplay;

    // 5. Partial city match (e.g. "delhi" matching "New Delhi" or "new delhi" matching "New Delhi")
    const partialCity = this.locations.find(
      (l) => l.city.toLowerCase().includes(q) || q.includes(l.city.toLowerCase())
    );
    if (partialCity) return partialCity;

    // 6. Partial alias match
    const partialAlias = this.locations.find(
      (l) => l.aliases && l.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
    );
    if (partialAlias) return partialAlias;

    // 7. State match
    const stateMatch = this.locations.find(
      (l) => l.state.toLowerCase() === q || l.state.toLowerCase().includes(q)
    );
    if (stateMatch) return stateMatch;

    return undefined;
  }

  findLocationsByState(state: string): LocationRecord[] {
    if (!state) return [];
    const q = state.toLowerCase().trim();
    return this.locations.filter((l) => l.state.toLowerCase() === q || l.state.toLowerCase().includes(q));
  }

  searchLocations(query: string): LocationRecord[] {
    if (!query.trim()) return this.locations;
    const q = query.toLowerCase().trim();

    const matches = this.locations.filter(
      (l) =>
        l.city.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.displayName.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        (l.pincode && l.pincode.includes(q)) ||
        (l.aliases && l.aliases.some((a) => a.toLowerCase().includes(q))) ||
        l.id.toLowerCase().includes(q)
    );

    // Sort matches for highest relevancy: exact city first, then city starting with query, etc.
    return matches.sort((a, b) => {
      const aCityExact = a.city.toLowerCase() === q;
      const bCityExact = b.city.toLowerCase() === q;
      if (aCityExact && !bCityExact) return -1;
      if (!aCityExact && bCityExact) return 1;

      const aCityStarts = a.city.toLowerCase().startsWith(q);
      const bCityStarts = b.city.toLowerCase().startsWith(q);
      if (aCityStarts && !bCityStarts) return -1;
      if (!aCityStarts && bCityStarts) return 1;

      const aNameStarts = a.displayName.toLowerCase().startsWith(q);
      const bNameStarts = b.displayName.toLowerCase().startsWith(q);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      return 0;
    });
  }

  getSelectedLocation(): LocationRecord {
    try {
      const storedId = localStorage.getItem('mausam_selected_location_id');
      if (storedId) {
        const found = this.findLocationById(storedId);
        if (found) {
          this.selectedLocationId = found.id;
          return found;
        }
      }
    } catch {
      // Ignore in restricted environments
    }
    return this.getLocationById(this.selectedLocationId);
  }

  setSelectedLocation(target: string | LocationRecord): LocationRecord {
    const loc = typeof target === 'string' ? this.getLocationById(target) : target;
    this.selectedLocationId = loc.id;
    try {
      localStorage.setItem('mausam_selected_location_id', loc.id);
    } catch {
      // Ignore in restricted iframe
    }
    return loc;
  }

  /**
   * Converts a LocationRecord into a WeatherStation interface compatible with legacy map components
   */
  locationToWeatherStation(
    loc: LocationRecord,
    temp = 31.0,
    condition = 'Clear',
    weatherType: 'sunny' | 'rain' | 'thunderstorm' | 'fog' | 'duststorm' = 'sunny',
    pm25 = 45
  ): WeatherStation {
    return {
      id: loc.id,
      name: loc.displayName,
      code: loc.imdStation || `AWS-${loc.district.substring(0, 3).toUpperCase()}`,
      state: loc.state,
      district: loc.district,
      lat: loc.lat,
      lng: loc.lng,
      elevation: loc.elevation || '35m ASL',
      status: 'active',
      pm25,
      temp,
      condition,
      weatherType,
      radarType: loc.radarCoverage || 'IMD Regional AWS',
      reflectivityDbz: weatherType === 'rain' ? 38 : weatherType === 'thunderstorm' ? 52 : 12,
      isCoastal: loc.coastalStatus === 'coastal',
    };
  }
}

export const locationService = new LocationService();
