import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  RefreshCw,
  Search,
  X,
  ShieldCheck,
  Radio,
  Clock,
  Crosshair,
  Building2,
  Navigation,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Pin,
  Sparkles,
  Wind,
  Droplets,
  Thermometer,
  Loader2,
} from 'lucide-react';
import { LocationRecord, WeatherPin } from '../../types';
import { locationService } from '../../services/locationService';
import { UseMyLocationButton } from './UseMyLocationButton';
import { LocatingPhase } from '../../hooks/useUserLocation';
import { GeolocationServiceError, NearestStationResult } from '../../services/geolocationService';

function formatWeatherCondition(code?: number): string {
  if (code === undefined || code === null) return 'Fair';
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Fair';
}

interface LocationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: LocationRecord;
  locationSource: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  isLocating: boolean;
  locatePhase: LocatingPhase;
  locateError: GeolocationServiceError | null;
  accuracyMeters: number | null;
  lastDetectedAt: Date | null;
  nearestStationInfo: NearestStationResult | null;
  onDetectLocation: (forceRefresh?: boolean) => Promise<any>;
  onSelectLocation: (loc: LocationRecord) => void;
  onClearSavedLocation: () => void;
  onOpenPrivacyModal: () => void;
}

const POPULAR_HUBS = [
  { name: 'New Delhi', id: 'delhi-safdarjung', state: 'Delhi NCR' },
  { name: 'Bhubaneswar', id: 'od-bhubaneswar', state: 'Odisha' },
  { name: 'Mumbai', id: 'mh-mumbai', state: 'Maharashtra' },
  { name: 'Kolkata', id: 'wb-kolkata', state: 'West Bengal' },
  { name: 'Bengaluru', id: 'ka-bengaluru', state: 'Karnataka' },
  { name: 'Chennai', id: 'tn-chennai', state: 'Tamil Nadu' },
  { name: 'Hyderabad', id: 'ts-hyderabad', state: 'Telangana' },
  { name: 'Guwahati', id: 'as-guwahati', state: 'Assam' },
  { name: 'Srinagar', id: 'jk-srinagar', state: 'Jammu & Kashmir' },
  { name: 'Jaipur', id: 'rj-jaipur', state: 'Rajasthan' },
  { name: 'Lucknow', id: 'up-lucknow', state: 'Uttar Pradesh' },
  { name: 'Ahmedabad', id: 'gj-ahmedabad', state: 'Gujarat' },
];

export const LocationCenterModal: React.FC<LocationCenterModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  locationSource,
  isLocating,
  locatePhase,
  locateError,
  accuracyMeters,
  lastDetectedAt,
  nearestStationInfo,
  onDetectLocation,
  onSelectLocation,
  onClearSavedLocation,
  onOpenPrivacyModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPins, setRecentPins] = useState<WeatherPin[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('mausam_recent_pins_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSnapping, setIsSnapping] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);

  const takeSnapshot = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setSnapshotError('Browser geolocation is not supported in this environment.');
      return;
    }

    setIsSnapping(true);
    setSnapshotError(null);
    setSnapshotSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        try {
          let temp = 25;
          let feelsLike = 26;
          let condition = 'Partly Cloudy';
          let humidity = 65;
          let windSpeed = 10;
          let city = '';
          let district = '';
          let state = '';

          try {
            const res = await fetch(`/api/weather?mode=current&lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`);
            if (res.ok) {
              const json = await res.json();
              const wData = json.data || json;
              if (wData) {
                temp = Math.round(wData.temperature ?? wData.temp ?? 25);
                feelsLike = Math.round(wData.feelsLike ?? temp);
                condition = wData.condition || formatWeatherCondition(wData.weatherCode);
                humidity = Math.round(wData.humidity ?? 65);
                windSpeed = Math.round(wData.windSpeed ?? 10);
                city = wData.location?.city || wData.location?.name || '';
                district = wData.location?.district || '';
                state = wData.location?.state || '';
              }
            } else {
              throw new Error('API returned status ' + res.status);
            }
          } catch {
            // Direct Open-Meteo fallback
            const omRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
            );
            if (omRes.ok) {
              const omJson = await omRes.json();
              const curr = omJson.current || {};
              temp = Math.round(curr.temperature_2m ?? 25);
              feelsLike = Math.round(curr.apparent_temperature ?? temp);
              condition = formatWeatherCondition(curr.weather_code);
              humidity = Math.round(curr.relative_humidity_2m ?? 65);
              windSpeed = Math.round(curr.wind_speed_10m ?? 10);
            }
          }

          const label = city || district || `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
          const formattedTime = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(new Date()) + ' IST';

          const newPin: WeatherPin = {
            id: `pin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            lat,
            lng,
            label,
            city: city || label,
            district: district || city || label,
            state: state || 'India',
            temperature: temp,
            feelsLike,
            condition,
            humidity,
            windSpeed,
            accuracyMeters: accuracy,
            timestamp: formattedTime,
            rawTimestamp: Date.now(),
          };

          setRecentPins((prev) => {
            const filtered = prev.filter((p) => Math.abs(p.lat - lat) > 0.005 || Math.abs(p.lng - lng) > 0.005);
            const updated = [newPin, ...filtered].slice(0, 10);
            try {
              localStorage.setItem('mausam_recent_pins_v1', JSON.stringify(updated));
            } catch {}
            return updated;
          });

          setSnapshotSuccess(`Pinned ${label} • ${temp}°C (${condition})`);
          setTimeout(() => setSnapshotSuccess(null), 4500);
        } catch (err: any) {
          setSnapshotError(err?.message || 'Failed to capture weather snapshot.');
        } finally {
          setIsSnapping(false);
        }
      },
      (err) => {
        setIsSnapping(false);
        if (err.code === err.PERMISSION_DENIED) {
          setSnapshotError('Geolocation permission was denied. Please allow location access in your browser.');
        } else if (err.code === err.TIMEOUT) {
          setSnapshotError('Location request timed out. Please retry.');
        } else {
          setSnapshotError('Could not acquire GPS position (' + err.message + ').');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSelectPin = (pin: WeatherPin) => {
    const loc: LocationRecord = {
      id: `pin-${pin.lat.toFixed(4)}-${pin.lng.toFixed(4)}`,
      displayName: `${pin.label} (Pinned Snapshot)`,
      name: pin.label,
      city: pin.city || pin.label,
      district: pin.district || pin.city || pin.label,
      state: pin.state || 'India',
      lat: pin.lat,
      lng: pin.lng,
      weatherStation: `${pin.label} Observation Point`,
      timezone: 'Asia/Kolkata',
    };
    onSelectLocation(loc);
    onClose();
  };

  const handleDeletePin = (pinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentPins((prev) => {
      const updated = prev.filter((p) => p.id !== pinId);
      try {
        localStorage.setItem('mausam_recent_pins_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllPins = () => {
    setRecentPins([]);
    try {
      localStorage.removeItem('mausam_recent_pins_v1');
    } catch {}
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return locationService.searchLocations(searchQuery).slice(0, 8);
  }, [searchQuery]);

  if (!isOpen) return null;

  const isGps = locationSource === 'DEVICE_GPS';

  const formatISTTime = (d: Date | null) => {
    if (!d) return 'Live Synced';
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-center-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        id="location-center-dialog"
        className="relative w-full max-w-2xl bg-[#0B131E] border border-[#1E2E42] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2E42] bg-[#070D15]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1499E8]/15 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4]">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 id="location-center-title" className="text-base font-bold text-white tracking-tight">
                Location &amp; Station Management
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                Configure Active Meteorological Observation Point
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111C27] hover:bg-[#1E2E42] border border-[#1E2E42] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close Location Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#CBD5E1]">
          {/* Active Location Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0F1926] to-[#152336] border border-[#1E2E42] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isGps
                        ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30'
                        : 'bg-[#1499E8]/15 text-[#43C7F4] border-[#1499E8]/30'
                    }`}
                  >
                    {isGps ? (
                      <>
                        <Crosshair className="w-3 h-3 animate-pulse" />
                        DEVICE GPS LOCATION
                      </>
                    ) : (
                      <>
                        <Search className="w-3 h-3" />
                        MANUAL STATION SELECTION
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-[#22C7A0] bg-[#22C7A0]/10 px-2 py-0.5 rounded border border-[#22C7A0]/30 font-mono">
                    ● ACTIVE
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {selectedLocation.city || selectedLocation.district}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {selectedLocation.district}, {selectedLocation.state}, India
                  {selectedLocation.pincode ? ` • PIN ${selectedLocation.pincode}` : ''}
                </p>
              </div>

              {/* Coordinates & Accuracy */}
              <div className="text-right sm:self-start bg-[#070D15]/80 p-2.5 rounded-lg border border-[#1E2E42] text-[11px] font-mono shrink-0">
                <div className="text-[#38BDF8]">
                  {typeof selectedLocation.lat === 'number' ? selectedLocation.lat.toFixed(4) : '--'}°N,{' '}
                  {typeof selectedLocation.lng === 'number' ? selectedLocation.lng.toFixed(4) : '--'}°E
                </div>
                {accuracyMeters !== null && (
                  <div className="text-[#34D399] text-[10px] mt-0.5">
                    Accuracy: ±{accuracyMeters} m
                  </div>
                )}
                <div className="text-[#94A3B8] text-[10px] mt-0.5">
                  Elev: {selectedLocation.elevation || '45m ASL'}
                </div>
              </div>
            </div>

            {/* Nearest Observation Telemetry Station Info */}
            <div className="mt-3.5 pt-3 border-t border-[#1E2E42]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Radio className="w-3.5 h-3.5 text-[#43C7F4]" />
                <span>
                  Nearest IMD Observatory:{' '}
                  <strong className="text-white">
                    {nearestStationInfo?.name || selectedLocation.weatherStation || selectedLocation.displayName}
                  </strong>
                </span>
              </div>
              {nearestStationInfo && (
                <span className="text-[#38BDF8] font-mono">
                  {nearestStationInfo.distanceKm} km from position
                </span>
              )}
            </div>

            {/* Observation Timestamp */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#64748B] font-mono">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Detection Time: {formatISTTime(lastDetectedAt)}</span>
              </div>
              <span>Data: IMD AWS Network / Open-Meteo Integration</span>
            </div>
          </div>

          {/* Action Row: Primary Use My Location CTA & Snapshot Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Automatic Location Detection */}
            <div className="p-4 rounded-xl bg-[#1499E8]/10 border border-[#1499E8]/30 flex flex-col justify-between gap-3">
              <div>
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Automatic Detection
                </span>
                <span className="text-[11px] text-[#94A3B8] mt-1 block">
                  Resolve device position to the nearest official IMD observatory.
                </span>
              </div>

              <UseMyLocationButton
                onDetectLocation={onDetectLocation}
                isLocating={isLocating}
                locatePhase={locatePhase}
                locateError={locateError}
                locationSource={locationSource}
                variant="primary"
              />
            </div>

            {/* Instant Weather Snapshot CTA */}
            <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex flex-col justify-between gap-3">
              <div>
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#34D399]" />
                  Coordinate Snapshot
                </span>
                <span className="text-[11px] text-[#94A3B8] mt-1 block">
                  Grab browser GPS coordinates, fetch live weather summary, and save to Recent Pins.
                </span>
              </div>

              <button
                id="location-center-snapshot-btn"
                type="button"
                onClick={takeSnapshot}
                disabled={isSnapping}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSnapping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Snapping Weather…</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-white" />
                    <span>Snapshot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Banners for Snapshot */}
          {snapshotError && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-between text-xs text-[#F87171]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{snapshotError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSnapshotError(null)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {snapshotSuccess && (
            <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between text-xs text-[#34D399]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{snapshotSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setSnapshotSuccess(null)}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Recent Pins Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="font-bold text-white text-xs">Recent Pins</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E2E42] text-[#38BDF8] border border-[#283C55]">
                  {recentPins.length}
                </span>
              </div>

              {recentPins.length > 0 && (
                <button
                  id="btn-clear-recent-pins"
                  type="button"
                  onClick={handleClearAllPins}
                  className="text-[11px] text-[#94A3B8] hover:text-[#EF4444] flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All Pins</span>
                </button>
              )}
            </div>

            {recentPins.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#1E2E42] bg-[#070D15]/60 text-center text-[#94A3B8]">
                <Pin className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-[#38BDF8]" />
                <p className="text-xs text-white/80 font-medium">No Pinned Weather Snapshots Yet</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Click the <strong className="text-[#34D399]">Snapshot</strong> button above to capture instant coordinate weather metrics and pin them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {recentPins.map((pin) => (
                  <div
                    key={pin.id}
                    id={`pin-card-${pin.id}`}
                    onClick={() => handleSelectPin(pin)}
                    className="p-3 rounded-xl bg-[#0F1926] hover:bg-[#152336] border border-[#1E2E42] hover:border-[#1499E8]/60 transition-all text-left flex flex-col justify-between gap-2.5 cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs truncate group-hover:text-[#38BDF8] transition-colors">
                            {pin.label}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-[#1E2E42] text-[#94A3B8]">
                            {pin.state}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                          {pin.lat.toFixed(3)}°N, {pin.lng.toFixed(3)}°E
                          {pin.accuracyMeters ? ` • ±${pin.accuracyMeters}m` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-bold text-white font-mono block">
                            {pin.temperature}°C
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePin(pin.id, e)}
                          title="Remove Pin"
                          className="w-6 h-6 rounded-md hover:bg-[#EF4444]/20 text-[#64748B] hover:text-[#EF4444] flex items-center justify-center transition-colors"
                          aria-label={`Remove pin for ${pin.label}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-t border-[#1E2E42]/80 pt-2 text-[#94A3B8]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#38BDF8] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded font-medium">
                          {pin.condition}
                        </span>
                        {pin.humidity !== undefined && (
                          <span className="flex items-center gap-0.5 text-[#64748B]">
                            <Droplets className="w-2.5 h-2.5 text-[#38BDF8]" />
                            {pin.humidity}%
                          </span>
                        )}
                        {pin.windSpeed !== undefined && (
                          <span className="flex items-center gap-0.5 text-[#64748B]">
                            <Wind className="w-2.5 h-2.5 text-[#34D399]" />
                            {pin.windSpeed} km/h
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-[#64748B]">
                        {pin.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Location Search Input */}
          <div className="space-y-2">
            <label htmlFor="modal-location-search" className="block font-bold text-white text-xs">
              Search City, District, or Weather Station Manually
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="modal-location-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 1,000+ national locations (e.g. Bhubaneswar, Safdarjung, Pune, Shimla)…"
                className="w-full bg-[#0F1926] border border-[#1E2E42] focus:border-[#1499E8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748B] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-[#1E2E42] rounded-xl bg-[#0F1926] divide-y divide-[#1E2E42] max-h-48 overflow-y-auto mt-1 shadow-lg">
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      setSearchQuery('');
                      onClose();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#152336] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white block">{loc.city}</span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {loc.district}, {loc.state}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                      {loc.state}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hub Switcher */}
          <div className="space-y-2">
            <span className="block font-bold text-white text-xs">
              Popular National Weather Hubs
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {POPULAR_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => {
                    const loc = locationService.getLocationById(hub.id);
                    if (loc) {
                      onSelectLocation(loc);
                      onClose();
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedLocation.id === hub.id
                      ? 'bg-[#1499E8]/20 border-[#1499E8] text-white shadow-sm'
                      : 'bg-[#0F1926] border-[#1E2E42] hover:border-[#1499E8]/50 text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-xs truncate">{hub.name}</span>
                  <span className="text-[10px] text-[#94A3B8] block truncate">{hub.state}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1E2E42] bg-[#070D15] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="text-[#43C7F4] hover:underline text-xs flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Location Privacy &amp; Data Transparency</span>
            </button>

            {isGps && (
              <button
                type="button"
                onClick={() => {
                  onClearSavedLocation();
                  onClose();
                }}
                className="text-[#EF4444] hover:underline text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1E2E42] hover:bg-[#283C55] text-white font-bold text-xs transition-colors self-end sm:self-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
