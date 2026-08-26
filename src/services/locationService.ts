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

  getLocationById(id: string): LocationRecord {
    return this.locations.find((l) => l.id === id) || this.getPrimaryLocation();
  }

  findLocationByName(name: string): LocationRecord | undefined {
    if (!name) return undefined;
    const q = name.toLowerCase().trim();
    return this.locations.find(
      (l) =>
        l.city.toLowerCase() === q ||
        l.district.toLowerCase() === q ||
        l.displayName.toLowerCase() === q ||
        (l.aliases && l.aliases.some((a) => a.toLowerCase() === q))
    );
  }

  findLocationsByState(state: string): LocationRecord[] {
    if (!state) return [];
    const q = state.toLowerCase().trim();
    return this.locations.filter((l) => l.state.toLowerCase() === q);
  }

  searchLocations(query: string): LocationRecord[] {
    if (!query.trim()) return this.locations;
    const q = query.toLowerCase().trim();
    return this.locations.filter(
      (l) =>
        l.city.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.displayName.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        (l.pincode && l.pincode.includes(q)) ||
        (l.aliases && l.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  }

  getSelectedLocation(): LocationRecord {
    return this.getLocationById(this.selectedLocationId);
  }

  setSelectedLocation(target: string | LocationRecord): LocationRecord {
    const id = typeof target === 'string' ? target : target.id;
    const loc = this.getLocationById(id);
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
