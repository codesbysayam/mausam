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
} from 'lucide-react';
import { LocationRecord } from '../../types';
import { locationService } from '../../services/locationService';
import { UseMyLocationButton } from './UseMyLocationButton';
import { LocatingPhase } from '../../hooks/useUserLocation';
import { GeolocationServiceError, NearestStationResult } from '../../services/geolocationService';

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

          {/* Action Row: Primary Use My Location CTA */}
          <div className="p-4 rounded-xl bg-[#1499E8]/10 border border-[#1499E8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white text-xs block">
                Automatic Location Detection
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Acquire device coordinates and resolve nearest IMD weather station.
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
