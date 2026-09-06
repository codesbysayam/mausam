import React, { useState, useMemo } from 'react';
import { RadarStation } from '../../types/radar';
import { OFFICIAL_RADAR_STATIONS } from '../../services/radarService';

export interface RadarStationNetworkProps {
  selectedStationId?: string;
  onSelectStation: (station: RadarStation) => void;
}

export const RadarStationNetwork: React.FC<RadarStationNetworkProps> = ({
  selectedStationId,
  onSelectStation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'coastal' | 'inland'>('all');

  const filteredStations = useMemo(() => {
    return OFFICIAL_RADAR_STATIONS.filter((station) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        station.name.toLowerCase().includes(term) ||
        station.id.toLowerCase().includes(term) ||
        (station.state && station.state.toLowerCase().includes(term));

      if (!matchesSearch) return false;
      if (filterType === 'coastal') return station.isCoastal === true;
      if (filterType === 'inland') return !station.isCoastal;
      return true;
    });
  }, [searchTerm, filterType]);

  return (
    <section className="bg-[#0B263D] border border-[#1D5278] rounded-lg p-5 shadow-md">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1D5278] mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#F5F9FC] tracking-wide uppercase">
              RADAR STATION NETWORK
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1565C0]/20 text-[#38BDF8] border border-[#1565C0]/40">
              {filteredStations.length} STATIONS
            </span>
          </div>
          <p className="text-xs text-[#AFC4D8] mt-0.5">
            Operational Doppler Weather Radar (DWR) installations across coastal and interior territories
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search stations, cities, states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#102D44] border border-[#1D5278] rounded-md px-3 py-1.5 pl-8 text-xs text-[#F5F9FC] placeholder-[#8A94A6] focus:outline-none focus:border-[#38BDF8]"
            />
            <span className="material-symbols-outlined text-[16px] text-[#8A94A6] absolute left-2.5 top-2 pointer-events-none">
              search
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-[#8A94A6] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center bg-[#102D44] border border-[#1D5278] rounded-md p-0.5 text-xs">
            {(['all', 'coastal', 'inland'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                  filterType === f
                    ? 'bg-[#1565C0] text-white shadow-sm'
                    : 'text-[#AFC4D8] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Column Responsive Station Grid */}
      {filteredStations.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#8A94A6]">
          No Doppler weather radar station matched your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => {
            const isSelected = selectedStationId === station.id;
            return (
              <div
                key={station.id}
                className={`bg-[#102D44] border rounded-lg p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#38BDF8] ring-1 ring-[#38BDF8] bg-[#102D44]/90 shadow-md'
                    : 'border-[#1D5278] hover:border-[#1565C0]'
                }`}
              >
                {/* Station Card Top */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#F5F9FC] leading-snug">
                        {station.name}
                      </h3>
                      <div className="text-xs text-[#AFC4D8] mt-0.5">
                        {station.state} • {station.isCoastal ? 'Coastal Sector' : 'Inland Sector'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1565C0]/20 text-[#38BDF8] border border-[#1565C0]/30 whitespace-nowrap">
                      {station.id}
                    </span>
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-1.5 text-xs text-[#AFC4D8] my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6]">Radar Band:</span>
                      <span className="font-mono text-[#F5F9FC]">{station.band}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6]">Coordinates:</span>
                      <span className="font-mono text-[#F5F9FC]">
                        {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6]">Surveillance Range:</span>
                      <span className="font-mono text-[#F5F9FC]">{station.maxRangeKm} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6]">Operational Status:</span>
                      <span className="flex items-center gap-1 text-[#00C897] font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C897]"></span>
                        {station.status || 'Operational'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-3 border-t border-[#1D5278]/60 mt-1">
                  <button
                    type="button"
                    onClick={() => onSelectStation(station)}
                    className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1565C0] text-white shadow'
                        : 'bg-[#0B263D] text-[#38BDF8] border border-[#1D5278] hover:bg-[#1565C0] hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">radar</span>
                    <span>{isSelected ? 'Currently Focused on Map' : 'View on Map'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RadarStationNetwork;
