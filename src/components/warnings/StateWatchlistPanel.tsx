import React, { useState, useMemo } from 'react';
import { StateWarningSummary, AlertSeverity } from '../../types/warningTypes';
import { STATE_ALERT_SEVERITIES } from '../../data/nationalWarningsData';

interface StateWatchlistPanelProps {
  selectedState: string | null;
  onSelectState: (stateName: string, stateCode: string) => void;
  onOpenStateDrawer?: (summary: StateWarningSummary) => void;
}

export const StateWatchlistPanel: React.FC<StateWatchlistPanelProps> = ({
  selectedState,
  onSelectState,
  onOpenStateDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  const statesList = useMemo(() => {
    return Object.values(STATE_ALERT_SEVERITIES).sort((a, b) => {
      const order: Record<AlertSeverity, number> = {
        red: 4,
        orange: 3,
        yellow: 2,
        purple: 1,
        green: 0,
      };
      const diff = order[b.highestSeverity] - order[a.highestSeverity];
      if (diff !== 0) return diff;
      return a.stateName.localeCompare(b.stateName);
    });
  }, []);

  const filteredStates = useMemo(() => {
    return statesList.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.primaryHazardLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSev = severityFilter === 'all' || s.highestSeverity === severityFilter;

      return matchSearch && matchSev;
    });
  }, [statesList, searchQuery, severityFilter]);

  const activeFocusedState = useMemo(() => {
    if (!selectedState || selectedState === 'all') return null;
    return (
      statesList.find(
        (s) =>
          s.stateName.toLowerCase() === selectedState.toLowerCase() ||
          s.stateCode.toLowerCase() === selectedState.toLowerCase()
      ) || null
    );
  }, [statesList, selectedState]);

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'red':
        return {
          bg: 'bg-[#FF0000]/20 text-[#FF4D4D] border-[#FF0000]/50',
          dot: 'bg-[#FF0000]',
          label: 'RED ALERT',
        };
      case 'orange':
        return {
          bg: 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/50',
          dot: 'bg-[#FFA500]',
          label: 'ORANGE ALERT',
        };
      case 'yellow':
        return {
          bg: 'bg-[#FFFF00]/20 text-[#FFFF00] border-[#FFFF00]/50',
          dot: 'bg-[#FFFF00]',
          label: 'YELLOW WATCH',
        };
      case 'purple':
        return {
          bg: 'bg-[#1565C0]/20 text-[#E3F2FD] border-[#1565C0]/50',
          dot: 'bg-[#1565C0]',
          label: 'ADVISORY',
        };
      default:
        return {
          bg: 'bg-[#008000]/20 text-[#008000] border-[#008000]/50',
          dot: 'bg-[#008000]',
          label: 'GREEN CODE',
        };
    }
  };

  const redCount = statesList.filter((s) => s.highestSeverity === 'red').length;
  const orangeCount = statesList.filter((s) => s.highestSeverity === 'orange').length;
  const yellowCount = statesList.filter((s) => s.highestSeverity === 'yellow').length;

  return (
    <div
      id="state-warning-watchlist-panel"
      className="bg-[#0B2239] border border-[#1D4E73] rounded-md p-4 sm:p-5 shadow-md flex flex-col justify-between gap-4 h-full"
    >
      {/* Panel Header */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-[#1D4E73]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#071A2D] border border-[#1D4E73] flex items-center justify-center text-[#E3F2FD]">
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                State Warning Watchlist
              </h3>
              <p className="text-[11px] text-[#B8C7D9]">
                Subdivision Early Warning Telemetry &amp; Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FF0000]/20 text-[#FF4D4D] border border-[#FF0000]/40">
              {redCount} Red
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/40">
              {orangeCount} Orange
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FFFF00]/20 text-[#FFFF00] border border-[#FFFF00]/40">
              {yellowCount} Yellow
            </span>
          </div>
        </div>

        {/* Search & Severity Filter Bar */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#B8C7D9]">
              search
            </span>
            <input
              id="input-watchlist-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state, UT, or capital..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#071A2D] border border-[#1D4E73] rounded text-xs text-white placeholder-[#B8C7D9] focus:outline-none focus:border-[#1565C0]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#B8C7D9] hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <select
            id="select-watchlist-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-[#071A2D] border border-[#1D4E73] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#1565C0] cursor-pointer"
          >
            <option value="all">All Alerts ({statesList.length})</option>
            <option value="red">Red Only ({redCount})</option>
            <option value="orange">Orange Only ({orangeCount})</option>
            <option value="yellow">Yellow Only ({yellowCount})</option>
            <option value="purple">Advisories</option>
            <option value="green">Green Code</option>
          </select>
        </div>
      </div>

      {/* Focused State Banner (if selected) */}
      {activeFocusedState && (
        <div
          id="watchlist-focused-state-card"
          className="p-3 rounded bg-[#071A2D] border border-[#1565C0] flex flex-col gap-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#E3F2FD] text-[16px]">
                pin_drop
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-tight">
                {activeFocusedState.stateName}
              </span>
            </div>
            {(() => {
              const badge = getSeverityBadge(activeFocusedState.highestSeverity);
              return (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badge.bg}`}
                >
                  {badge.label}
                </span>
              );
            })()}
          </div>

          <p className="text-[11px] text-[#D7DEE8] leading-tight line-clamp-2">
            {activeFocusedState.bulletinHeadline}
          </p>

          <div className="flex items-center justify-between text-[10px] text-[#B8C7D9] pt-1 border-t border-[#1D4E73]">
            <span>Station: {activeFocusedState.representativeStation}</span>
            <button
              type="button"
              onClick={() => onOpenStateDrawer && onOpenStateDrawer(activeFocusedState)}
              className="text-[#E3F2FD] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Full Advisory</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* State List Scrollable View */}
      <div
        id="watchlist-states-scroll"
        className="flex-1 overflow-y-auto max-h-[340px] sm:max-h-[380px] pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-[#1D4E73]"
      >
        {filteredStates.length === 0 ? (
          <div className="text-center py-8 text-[#B8C7D9] text-xs">
            No states match filter criteria.
          </div>
        ) : (
          filteredStates.map((st) => {
            const isSelected =
              selectedState &&
              (selectedState.toLowerCase() === st.stateName.toLowerCase() ||
                selectedState.toLowerCase() === st.stateCode.toLowerCase());
            const badge = getSeverityBadge(st.highestSeverity);

            return (
              <div
                key={st.stateCode}
                id={`watchlist-item-${st.stateCode}`}
                onClick={() => onSelectState(st.stateName, st.stateCode)}
                className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#102D47] border-[#1565C0] shadow-sm'
                    : 'bg-[#071A2D]/80 border-[#1D4E73]/60 hover:bg-[#071A2D] hover:border-[#1D4E73]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot}`}></span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{st.stateName}</span>
                      {st.activeCount > 0 && (
                        <span className="text-[10px] font-mono text-[#B8C7D9] font-normal">
                          ({st.activeCount} alert{st.activeCount > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#B8C7D9] truncate">
                      {st.primaryHazardLabel} • {st.capital}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#B8C7D9]">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Telemetry Status Footer */}
      <div className="pt-2.5 border-t border-[#1D4E73] flex items-center justify-between text-[10px] text-[#B8C7D9]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008000]"></span>
          <span>DWR Radar Network: 37/37 Active</span>
        </div>
        <span>All-India GKMS Grid</span>
      </div>
    </div>
  );
};
