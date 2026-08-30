import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { locationService } from '../../services/locationService';
import {
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Globe2,
  Clock,
  Compass,
  X,
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
      id="forecast-location-status-bar"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
    >
      {/* Left: Location & Geo Coordinates */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Target Station:
              </span>
              <strong className="text-white text-sm">
                {selectedLocation.city}, {selectedLocation.state}
              </strong>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#8A94A6]">
              <span className="font-mono">{lat.toFixed(2)}°N, {lng.toFixed(2)}°E</span>
              <span>•</span>
              <span>Elevation: <strong className="text-[#D7DEE8]">45m MSL</strong></span>
              <span>•</span>
              <span className="text-[#2ECC71] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                NWP Model Guidance Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Search & Refresh Control */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Quick Search Dropdown */}
        <div ref={searchRef} className="relative flex-1 sm:w-60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Switch observatory station..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#151D26] border border-[#314255] rounded-md text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#4FA8E0] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Results */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#151D26] border border-[#314255] rounded-md shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-[#314255]/50">
              <div className="p-2 text-[10px] uppercase font-bold text-[#8A94A6] bg-[#1E2733]/50">
                Major IMD AWS &amp; Synoptic Stations
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((loc) => {
                  const isCur = loc.id === selectedLocation.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        if (onSelectLocation) onSelectLocation(loc);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        isCur
                          ? 'bg-[#0B72B9]/20 text-[#4FA8E0] font-bold'
                          : 'text-[#D7DEE8] hover:bg-[#1E2733] hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{loc.city}, {loc.state}</span>
                        <span className="text-[10px] text-[#8A94A6] font-mono">
                          ID: {loc.id} • {loc.lat?.toFixed(1)}°N, {loc.lng?.toFixed(1)}°E
                        </span>
                      </div>
                      {isCur && (
                        <span className="text-[10px] bg-[#0B72B9]/30 text-[#4FA8E0] px-1.5 py-0.5 rounded font-mono">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-xs text-[#8A94A6] text-center">
                  No matching weather stations found.
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
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all border shrink-0 ${
            isLoading
              ? 'bg-[#151D26] text-[#8A94A6] border-[#314255] cursor-not-allowed'
              : refreshSuccess
              ? 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40'
              : 'bg-[#151D26] hover:bg-[#314255] text-[#D7DEE8] hover:text-white border-[#314255]'
          }`}
          title="Refresh forecast model predictions"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4FA8E0]' : ''}`} />
          <span>{isLoading ? 'Updating forecast…' : refreshSuccess ? 'Updated' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
};
