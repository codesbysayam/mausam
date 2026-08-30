import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { locationService } from '../../services/locationService';
import {
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  X,
  Sparkles,
} from 'lucide-react';

interface ForecastStatusBarProps {
  selectedLocation: LocationRecord;
  lastUpdated: string;
  isLive?: boolean;
  isLoading?: boolean;
  onRefresh: () => void;
  onSelectLocation?: (location: LocationRecord) => void;
}

export const ForecastStatusBar: React.FC<ForecastStatusBarProps> = ({
  selectedLocation,
  lastUpdated,
  isLive = true,
  isLoading = false,
  onRefresh,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const lat = typeof selectedLocation.lat === 'number' ? selectedLocation.lat : 20.2961;
  const lng = typeof selectedLocation.lng === 'number' ? selectedLocation.lng : 85.8245;

  const searchResults = useMemo(() => {
    const allLocations = locationService.getAllLocations();
    if (!searchQuery.trim()) {
      return allLocations.slice(0, 8);
    }
    const q = searchQuery.toLowerCase();
    return allLocations.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q) ||
        loc.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualRefresh = () => {
    if (isLoading) return;
    onRefresh();
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2000);
  };

  return (
    <div
      id="forecast-location-metadata-strip"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Left: Location & Observatory Metadata */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center shrink-0 border border-[#1499E8]/30">
          <MapPin className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-[#F4F7FA] tracking-tight">
              {selectedLocation.city}, {selectedLocation.state}
            </h1>
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-[#22C7A0]/15 text-[#22C7A0] border border-[#22C7A0]/30">
              Observatory #{selectedLocation.id || '42971'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#93A4B8] flex-wrap">
            <span>Detailed atmospheric outlook for the next 7 days</span>
            <span>•</span>
            <span className="font-mono text-[#D1DCE8]">
              {lat.toFixed(2)}°N, {lng.toFixed(2)}°E
            </span>
            <span>•</span>
            <span>Elevation: 45m MSL</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Search & Refresh Control */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Search Observatory Input */}
        <div ref={searchRef} className="relative flex-1 sm:w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#93A4B8]" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Change location or district..."
              className="w-full pl-8 pr-7 py-2 bg-[#071018] border border-[#162331] rounded-xl text-xs text-[#F4F7FA] placeholder-[#93A4B8] focus:outline-none focus:border-[#1499E8] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#93A4B8] hover:text-[#F4F7FA] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0B141E] border border-[#162331] rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y divide-[#162331]">
              <div className="p-2 text-[10px] uppercase font-bold text-[#93A4B8] bg-[#071018]">
                Observatory Stations in India
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      if (onSelectLocation) onSelectLocation(loc);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#1499E8]/15 flex items-center justify-between text-[#F4F7FA] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#43C7F4]" />
                      <span>{loc.city}, <span className="text-[#93A4B8]">{loc.state}</span></span>
                    </div>
                    <span className="text-[10px] font-mono text-[#93A4B8]">{loc.id}</span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-[#93A4B8] text-center">
                  No matching station found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isLoading}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
            refreshSuccess
              ? 'bg-[#22C7A0]/20 text-[#22C7A0] border-[#22C7A0]/40'
              : 'bg-[#071018] text-[#93A4B8] hover:text-[#F4F7FA] border-[#162331] hover:bg-[#111F30]'
          }`}
          title="Refresh forecast model simulation"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isLoading ? 'animate-spin text-[#1499E8]' : refreshSuccess ? 'text-[#22C7A0]' : ''
            }`}
          />
          <span className="hidden sm:inline">
            {refreshSuccess ? 'Updated' : isLoading ? 'Updating…' : 'Refresh'}
          </span>
        </button>
      </div>
    </div>
  );
};
