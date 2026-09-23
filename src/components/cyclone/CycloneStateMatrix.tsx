import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { RegionalWarningStatus, WarningLevel } from '../../types/cyclone';

interface CycloneStateMatrixProps {
  regionalWarnings: RegionalWarningStatus[];
}

export const CycloneStateMatrix: React.FC<CycloneStateMatrixProps> = ({
  regionalWarnings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | WarningLevel | 'NO_WARNING' | 'DATA_UNAVAILABLE'>('ALL');
  const [expandedRegionCode, setExpandedRegionCode] = useState<string | null>(null);

  // Compute counts
  const counts = useMemo(() => {
    const res = {
      total: regionalWarnings.length,
      red: 0,
      orange: 0,
      yellow: 0,
      watch: 0,
      noWarning: 0,
      unavailable: 0,
    };
    regionalWarnings.forEach((r) => {
      if (r.status === 'DATA_UNAVAILABLE') res.unavailable++;
      else if (r.warningLevel === 'RED') res.red++;
      else if (r.warningLevel === 'ORANGE') res.orange++;
      else if (r.warningLevel === 'YELLOW') res.yellow++;
      else if (r.warningLevel === 'WATCH') res.watch++;
      else if (r.warningLevel === 'NO_WARNING') res.noWarning++;
    });
    return res;
  }, [regionalWarnings]);

  // Filter regions
  const filteredRegions = useMemo(() => {
    return regionalWarnings.filter((region) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        region.regionName.toLowerCase().includes(query) ||
        region.regionCode.toLowerCase().includes(query) ||
        region.affectedDistricts.some((d) => d.toLowerCase().includes(query)) ||
        region.hazards.some((h) => h.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Severity match
      if (severityFilter === 'ALL') return true;
      if (severityFilter === 'DATA_UNAVAILABLE') return region.status === 'DATA_UNAVAILABLE';
      if (severityFilter === 'NO_WARNING') return region.warningLevel === 'NO_WARNING' && region.status !== 'DATA_UNAVAILABLE';
      return region.warningLevel === severityFilter;
    });
  }, [regionalWarnings, searchQuery, severityFilter]);

  const getSeverityBadge = (region: RegionalWarningStatus) => {
    if (region.status === 'DATA_UNAVAILABLE') {
      return (
        <span className="px-2.5 py-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#FCA5A5] text-[11px] font-mono font-bold">
          DATA UNAVAILABLE
        </span>
      );
    }

    switch (region.warningLevel) {
      case 'RED':
        return (
          <span className="px-2.5 py-1 rounded bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] text-[11px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            RED ALERT (ACTION)
          </span>
        );
      case 'ORANGE':
        return (
          <span className="px-2.5 py-1 rounded bg-[#F97316]/20 border border-[#F97316] text-[#FB923C] text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            ORANGE (BE PREPARED)
          </span>
        );
      case 'YELLOW':
        return (
          <span className="px-2.5 py-1 rounded bg-[#EAB308]/20 border border-[#EAB308] text-[#FDE047] text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            YELLOW WATCH (BE UPDATED)
          </span>
        );
      case 'WATCH':
        return (
          <span className="px-2.5 py-1 rounded bg-[#0284C7]/20 border border-[#0284C7] text-[#38BDF8] text-[11px] font-mono font-bold">
            MONITORING WATCH
          </span>
        );
      case 'NO_WARNING':
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/30 text-[#34D399] text-[11px] font-mono font-semibold">
            NO ACTIVE OFFICIAL WARNING
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#0B1523] border border-[#1E3A5F] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2E40]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <ShieldAlert className="w-5 h-5 text-[#38BDF8]" />
            <span>State &amp; UT Meteorological Warning Engine</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Independent evaluation for all 28 States &amp; 8 Union Territories derived from official IMD &amp; SACHET feeds.
          </p>
        </div>

        {/* Region Count Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#132337] border border-[#25486F] text-xs font-mono text-[#93C5FD]">
            <strong>{regionalWarnings.length}</strong> Regions Evaluated
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state, UT, district (e.g. Odisha, Srikakulam, Ganjam)..."
            className="w-full bg-[#09111C] border border-[#1E2E40] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] font-mono"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <button
            type="button"
            onClick={() => setSeverityFilter('ALL')}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              severityFilter === 'ALL'
                ? 'bg-[#0284C7] border-[#0284C7] text-white font-bold'
                : 'bg-[#09111C] border-[#1E2E40] text-[#94A3B8] hover:text-white'
            }`}
          >
            All ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('RED')}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              severityFilter === 'RED'
                ? 'bg-[#EF4444] border-[#EF4444] text-white font-bold'
                : 'bg-[#09111C] border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10'
            }`}
          >
            Red ({counts.red})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('ORANGE')}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              severityFilter === 'ORANGE'
                ? 'bg-[#F97316] border-[#F97316] text-white font-bold'
                : 'bg-[#09111C] border-[#F97316]/40 text-[#FB923C] hover:bg-[#F97316]/10'
            }`}
          >
            Orange ({counts.orange})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('YELLOW')}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              severityFilter === 'YELLOW'
                ? 'bg-[#EAB308] border-[#EAB308] text-black font-bold'
                : 'bg-[#09111C] border-[#EAB308]/40 text-[#FDE047] hover:bg-[#EAB308]/10'
            }`}
          >
            Yellow ({counts.yellow})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('NO_WARNING')}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              severityFilter === 'NO_WARNING'
                ? 'bg-[#10B981] border-[#10B981] text-white font-bold'
                : 'bg-[#09111C] border-[#10B981]/40 text-[#34D399] hover:bg-[#10B981]/10'
            }`}
          >
            No Warning ({counts.noWarning})
          </button>
        </div>
      </div>

      {/* 36 Regions Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#1E2E40]">
        <table className="w-full text-left text-xs text-[#E2E8F0] border-collapse">
          <thead className="bg-[#09111C] text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] border-b border-[#1E2E40]">
            <tr>
              <th className="py-3 px-4">Region / State</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Official Status</th>
              <th className="py-3 px-4">Active Hazards</th>
              <th className="py-3 px-4">Alerted Districts</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2E40]/60">
            {filteredRegions.map((region) => {
              const isExpanded = expandedRegionCode === region.regionCode;
              const hasAlerts = region.status === 'ACTIVE_WARNING';

              return (
                <React.Fragment key={region.regionCode}>
                  <tr
                    onClick={() => setExpandedRegionCode(isExpanded ? null : region.regionCode)}
                    className={`hover:bg-[#132337]/50 transition-colors cursor-pointer ${
                      region.warningLevel === 'RED'
                        ? 'bg-[#EF4444]/5'
                        : region.warningLevel === 'ORANGE'
                        ? 'bg-[#F97316]/5'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#1A2E44] border border-[#25486F] text-[#93C5FD] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {region.regionCode}
                      </span>
                      <span className="font-bold text-white text-xs">{region.regionName}</span>
                    </td>

                    <td className="py-3 px-4 text-[#94A3B8] font-mono text-[11px]">
                      {region.regionType === 'STATE' ? 'State' : 'UT'}
                    </td>

                    <td className="py-3 px-4">{getSeverityBadge(region)}</td>

                    <td className="py-3 px-4">
                      {region.hazards.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {region.hazards.map((h, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-[#1E2E40] text-[#93C5FD] text-[10px] font-mono"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#64748B] italic">None active</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {region.affectedDistricts.length > 0 ? (
                        <span className="text-amber-300 font-mono">
                          {region.affectedDistricts.slice(0, 3).join(', ')}
                          {region.affectedDistricts.length > 3
                            ? ` +${region.affectedDistricts.length - 3} more`
                            : ''}
                        </span>
                      ) : (
                        <span className="text-[#64748B] italic">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className="p-1 rounded text-[#38BDF8] hover:bg-[#1E3A5F] transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable row */}
                  {isExpanded && (
                    <tr className="bg-[#09111C]/90">
                      <td colSpan={6} className="py-4 px-6 border-b border-[#1E2E40]">
                        <div className="flex flex-col gap-3 font-mono text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E2E40]/80">
                            <span className="font-bold text-white">
                              {region.regionName} ({region.regionCode}) — Official Meteorological Assessment
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Valid Until: {region.validUntil}</span>
                            </div>
                          </div>

                          {/* Districts breakdown */}
                          {region.affectedDistricts.length > 0 && (
                            <div>
                              <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                                Alerted Districts ({region.affectedDistricts.length}):
                              </span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {region.affectedDistricts.map((d) => (
                                  <span
                                    key={d}
                                    className="px-2 py-0.5 rounded bg-[#132337] border border-[#25486F] text-[#93C5FD] text-[11px]"
                                  >
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bulletins & Source Records */}
                          <div>
                            <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                              Official Source Records:
                            </span>
                            {region.sourceWarnings.length > 0 ? (
                              <div className="flex flex-col gap-2 mt-1">
                                {region.sourceWarnings.map((w, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col gap-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <strong className="text-white font-bold">{w.headline || w.event}</strong>
                                      <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[10px] text-[#38BDF8]">
                                        {w.source}
                                      </span>
                                    </div>
                                    <span className="text-[#94A3B8] text-[11px]">
                                      Identifier: {w.id} • Valid until: {w.validUntil}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[#64748B] italic mt-1">
                                No active official bulletin for {region.regionName} in the current synoptic period.
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
