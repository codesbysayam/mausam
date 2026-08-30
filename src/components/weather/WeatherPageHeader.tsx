import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { ALL_INDIA_LOCATIONS } from '../../data/allIndiaLocations';
import {
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  Radio,
  Clock,
  Compass,
  X,
  Sun,
  Globe2,
} from 'lucide-react';

interface WeatherPageHeaderProps {
  selectedLocation: LocationRecord;
  lastUpdated: string;
  isLive: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectLocation?: (location: LocationRecord) => void;
}

export const WeatherPageHeader: React.FC<WeatherPageHeaderProps> = ({
  selectedLocation,
  lastUpdated,
  isLive,
  isLoading,
  onRefresh,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic live clock running every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute station local timezone & solar astronomical time based on geographic coordinates
  const stationTimeDetails = useMemo(() => {
    const lat = typeof selectedLocation.lat === 'number' ? selectedLocation.lat : 20.29;
    const lng = typeof selectedLocation.lng === 'number' ? selectedLocation.lng : 85.82;

    // Detect if within Indian subcontinent coordinates (approx lat: 6-38°N, lng: 68-98°E)
    const isIndia = lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98;
    const timeZone = isIndia ? 'Asia/Kolkata' : 'UTC';

    // Standard IST meridian is 82.5° East
    // Every 1 degree of longitude corresponds to 4 minutes of solar time difference
    const standardMeridianLng = 82.5;
    const solarOffsetMinutes = Math.round((lng - standardMeridianLng) * 4);

    // Format local civil clock time for the station's IANA timezone
    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: isIndia ? 'Asia/Kolkata' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: isIndia ? 'Asia/Kolkata' : undefined,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const formattedClockTime = timeFormatter.format(currentTime);
    const formattedDate = dateFormatter.format(currentTime);

    // Calculate Apparent Local Solar Mean Time (LMT)
    const nowUtcMs = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    // IST offset is +5.5 hours = +330 mins
    const baseOffsetMinutes = isIndia ? 330 : Math.round((lng / 15) * 60);
    const stationSolarTimeMs = nowUtcMs + (baseOffsetMinutes + solarOffsetMinutes) * 60000;
    const solarDate = new Date(stationSolarTimeMs);
    const solarHours = solarDate.getUTCHours();
    const solarMins = solarDate.getUTCMinutes();
    const solarAmPm = solarHours >= 12 ? 'PM' : 'AM';
    const solarHours12 = solarHours % 12 || 12;
    const formattedSolarTime = `${String(solarHours12).padStart(2, '0')}:${String(solarMins).padStart(2, '0')} ${solarAmPm}`;

    return {
      clockTime: formattedClockTime,
      dateStr: formattedDate,
      timeZoneLabel: isIndia ? 'IST (UTC+05:30)' : `UTC${baseOffsetMinutes >= 0 ? '+' : ''}${(baseOffsetMinutes / 60).toFixed(1)}`,
      solarOffsetMinutes,
      solarOffsetLabel:
        solarOffsetMinutes === 0
          ? 'On 82.5°E Standard Meridian'
          : solarOffsetMinutes > 0
          ? `+${solarOffsetMinutes}m Solar Lead`
          : `${solarOffsetMinutes}m Solar Lag`,
      formattedSolarTime,
      lat,
      lng,
    };
  }, [selectedLocation, currentTime]);

  // Filter locations based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_INDIA_LOCATIONS.slice(0, 8);
    }
    const q = searchQuery.toLowerCase().trim();
    return ALL_INDIA_LOCATIONS.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q) ||
        (loc.district && loc.district.toLowerCase().includes(q)) ||
        (loc.imdStation && loc.imdStation.toLowerCase().includes(q)) ||
        (loc.id && loc.id.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationPick = (loc: LocationRecord) => {
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleTriggerRefresh = () => {
    if (isLoading) return;
    onRefresh();
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2000);
  };

  return (
    <div
      id="weather-page-header-banner"
      className="bg-[#151D26] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Top Bar: Title, Dynamic Station Time Display, Search & Refresh Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3 border-b border-[#314255]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
                Weather &amp; Synoptic Observation
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded font-bold bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-ping" />
                {isLive ? 'LIVE TELEMETRY' : 'VERIFIED OBSERVATION'}
              </span>
            </div>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              Official Indian Meteorological Department (IMD) Ground Station Telemetry Grid
            </p>
          </div>
        </div>

        {/* Dynamic Station Time & Action Controls */}
        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
          {/* Dynamic Station Local Time & Solar Meridian Widget */}
          <div
            id="station-dynamic-time-widget"
            className="flex items-center gap-2.5 bg-[#1E2733] border border-[#314255] hover:border-[#4FA8E0]/60 px-3 py-1.5 rounded-md transition-colors shadow-inner"
            title={`Station Coordinates: ${stationTimeDetails.lat.toFixed(2)}°N, ${stationTimeDetails.lng.toFixed(2)}°E • Local Solar Time: ${stationTimeDetails.formattedSolarTime}`}
          >
            <div className="p-1.5 rounded bg-[#151D26] border border-[#314255] text-[#4FA8E0] shrink-0">
              <Clock className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black font-mono text-white tracking-tight">
                  {stationTimeDetails.clockTime}
                </span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40">
                  {stationTimeDetails.timeZoneLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#8A94A6]">
                <span>{stationTimeDetails.dateStr}</span>
                <span className="text-[#314255]">•</span>
                <span className="text-[#F1C40F] font-mono font-medium flex items-center gap-0.5">
                  <Sun className="w-2.5 h-2.5" />
                  {stationTimeDetails.solarOffsetLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Location Search Bar */}
          <div ref={searchRef} className="relative flex-1 sm:w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
              <input
                id="weather-quick-station-search"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search station or city..."
                className="w-full pl-9 pr-8 py-1.5 bg-[#1E2733] border border-[#314255] rounded-md text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#4FA8E0] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#1E2733] border border-[#4FA8E0]/60 rounded-md shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-[#314255]/60">
                <div className="p-2 text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider bg-[#151D26]">
                  {searchQuery ? `Matching Stations (${searchResults.length})` : 'Popular Weather Stations'}
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#8A94A6]">
                    No weather stations found. Try another city or district.
                  </div>
                ) : (
                  searchResults.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleLocationPick(loc)}
                      className={`w-full p-2.5 text-left hover:bg-[#151D26] transition-colors flex items-center justify-between gap-2 text-xs ${
                        loc.id === selectedLocation.id ? 'bg-[#0B72B9]/15 border-l-2 border-[#4FA8E0]' : ''
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{loc.city}</span>
                          <span className="text-[11px] text-[#8A94A6] font-normal">({loc.state})</span>
                        </div>
                        <div className="text-[10px] text-[#8A94A6]">
                          Station: {loc.imdStation || loc.id} • {loc.elevation || 'ASL'}
                        </div>
                      </div>
                      {loc.coastalStatus === 'coastal' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1ABC9C]/15 text-[#1ABC9C] border border-[#1ABC9C]/40">
                          Coastal
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            id="weather-page-refresh-btn"
            type="button"
            onClick={handleTriggerRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[#1E2733] hover:bg-[#314255] border border-[#314255] hover:border-[#4FA8E0] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
            title="Fetch real-time calibrated observation data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4FA8E0] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : refreshSuccess ? 'Updated' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Active Observatory Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8A94A6]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-white font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#4FA8E0]" />
            <span>
              {selectedLocation.city}, {selectedLocation.state}
            </span>
            {selectedLocation.district && selectedLocation.district !== selectedLocation.city && (
              <span className="text-[#8A94A6] font-normal">({selectedLocation.district} Dist.)</span>
            )}
          </div>

          <span className="text-[#314255]">|</span>

          <span className="font-mono bg-[#1E2733] px-2 py-0.5 rounded border border-[#314255] text-[11px] text-[#DCE3EB]">
            Station: <strong className="text-[#4FA8E0]">{selectedLocation.imdStation || 'AWS-IND-01'}</strong>
          </span>

          <span className="text-[#314255]">|</span>

          <span className="text-[11px] flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#8A94A6]" />
            {typeof selectedLocation.lat === 'number' ? selectedLocation.lat.toFixed(2) : '20.29'}°N,{' '}
            {typeof selectedLocation.lng === 'number' ? selectedLocation.lng.toFixed(2) : '85.82'}°E
          </span>

          <span className="text-[#314255]">|</span>

          <span className="text-[11px]">
            Elev: <strong className="text-[#DCE3EB]">{selectedLocation.elevation || '45m ASL'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#8A94A6]" />
          <span className="text-[11px]">
            Observation: <strong className="text-white font-mono">{lastUpdated}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
