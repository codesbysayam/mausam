import React, { useState, useMemo } from 'react';
import { StateWarningSummary, AlertSeverity, WarningRecord } from '../../types/warningTypes';
import { STATE_ALERT_SEVERITIES } from '../../data/nationalWarningsData';

interface StateWatchlistPanelProps {
  selectedState: string | null;
  onSelectState: (stateName: string, stateCode: string) => void;
  onOpenStateDrawer?: (summary: StateWarningSummary) => void;
  warnings?: WarningRecord[];
}

export const StateWatchlistPanel: React.FC<StateWatchlistPanelProps> = ({
  selectedState,
  onSelectState,
  onOpenStateDrawer,
  warnings = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  // Dynamic state list with overlay of active warnings
  const statesList = useMemo(() => {
    const baseList = Object.values(STATE_ALERT_SEVERITIES).map((s) => {
      const live = warnings.find(
        (w) =>
          w.state.toLowerCase() === s.stateName.toLowerCase() ||
          w.stateCode.toLowerCase() === s.stateCode.replace('in-', '').toLowerCase()
      );
      if (live) {
        return {
          ...s,
          highestSeverity: live.severity,
          activeCount: 1,
          primaryHazard: live.hazardCategory,
          primaryHazardLabel: live.hazardLabel,
          bulletinHeadline: live.title,
          validityRange: live.validUntil,
        };
      }
      return s;
    });

    // Sort states strictly by severity: Red -> Orange -> Yellow -> Purple -> Green, then alphabetical
    return baseList.sort((a, b) => {
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
  }, [warnings]);

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
          s.stateCode.toLowerCase() === selectedState.toLowerCase() ||
          selectedState.toLowerCase().includes(s.stateName.toLowerCase())
      ) || null
    );
  }, [statesList, selectedState]);

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'red':
        return {
          bg: 'bg-[#FF0000]/20 text-[#FF4D4D] border-[#FF0000]/60',
          dot: 'bg-[#FF0000]',
          label: 'RED ALERT',
        };
      case 'orange':
        return {
          bg: 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/60',
          dot: 'bg-[#FFA500]',
          label: 'ORANGE ALERT',
        };
      case 'yellow':
        return {
          bg: 'bg-[#FFFF00]/20 text-[#FFFF00] border-[#FFFF00]/60',
          dot: 'bg-[#FFFF00]',
          label: 'YELLOW WATCH',
        };
      case 'purple':
        return {
          bg: 'bg-[#1565C0]/20 text-[#E3F2FD] border-[#1565C0]/60',
          dot: 'bg-[#1565C0]',
          label: 'ADVISORY',
        };
      default:
        return {
          bg: 'bg-[#008000]/20 text-[#00E676] border-[#008000]/60',
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
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 sm:p-5 shadow-md flex flex-col justify-between gap-3.5 h-full"
    >
      {/* 1. Header Bar: Title, Tally Chips */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-[#1D5278]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#081F33] border border-[#1D5278] flex items-center justify-center text-[#E3F2FD]">
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F9FC] uppercase tracking-tight">
                State Warning Watchlist
              </h3>
              <p className="text-[11px] text-[#AFC4D8]">
                Subdivision Early Warning Telemetry &amp; Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FF0000]/20 text-[#FF4D4D] border border-[#FF0000]/50">
              {redCount} Red
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/50">
              {orangeCount} Orange
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FFFF00]/20 text-[#FFFF00] border border-[#FFFF00]/50">
              {yellowCount} Yellow
            </span>
          </div>
        </div>

        {/* Search & Severity Filter Bar */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#AFC4D8]">
              search
            </span>
            <input
              id="input-watchlist-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state or hazard..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#081F33] border border-[#1D5278] rounded text-xs text-white placeholder-[#AFC4D8] focus:outline-none focus:border-[#1565C0]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AFC4D8] hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <select
            id="select-watchlist-severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-[#081F33] border border-[#1D5278] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#1565C0] cursor-pointer"
          >
            <option value="all">All ({statesList.length})</option>
            <option value="red">Red ({redCount})</option>
            <option value="orange">Orange ({orangeCount})</option>
            <option value="yellow">Yellow ({yellowCount})</option>
            <option value="purple">Advisory</option>
            <option value="green">Green</option>
          </select>
        </div>
      </div>

      {/* 2. Focused State Summary Banner (When a state is active) */}
      {activeFocusedState && (
        <div
          id="watchlist-focused-state-card"
          className="p-3 rounded bg-[#081F33] border border-[#1565C0] flex flex-col gap-2 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#E3F2FD] text-[16px]">
                pin_drop
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-tight">
                {activeFocusedState.stateName}
              </span>
              <span className="text-[10px] text-[#AFC4D8] font-mono">
                ({activeFocusedState.capital})
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

          <p className="text-[11px] text-[#AFC4D8] leading-tight line-clamp-2">
            {activeFocusedState.bulletinHeadline}
          </p>

          <div className="flex items-center justify-between text-[10px] text-[#AFC4D8] pt-1 border-t border-[#1D5278]/80">
            <span className="truncate max-w-[180px]">Station: {activeFocusedState.representativeStation}</span>
            {onOpenStateDrawer && (
              <button
                type="button"
                onClick={() => onOpenStateDrawer(activeFocusedState)}
                className="text-[#E3F2FD] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>Full Advisory</span>
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. State List Scrollable View with Clean Scrollbar */}
      <div
        id="watchlist-states-scroll"
        className="flex-1 overflow-y-auto max-h-[380px] sm:max-h-[420px] pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-[#1D5278]"
      >
        {filteredStates.length === 0 ? (
          <div className="text-center py-8 text-[#AFC4D8] text-xs">
            No states match filter criteria.
          </div>
        ) : (
          filteredStates.map((st) => {
            const isSelected =
              selectedState &&
              (selectedState.toLowerCase() === st.stateName.toLowerCase() ||
                selectedState.toLowerCase() === st.stateCode.toLowerCase() ||
                selectedState.toLowerCase().includes(st.stateName.toLowerCase()));
            const badge = getSeverityBadge(st.highestSeverity);

            return (
              <div
                key={st.stateCode}
                id={`watchlist-item-${st.stateCode}`}
                onClick={() => onSelectState(st.stateName, st.stateCode)}
                className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#102D47] border-[#1565C0] shadow-sm'
                    : 'bg-[#081F33]/90 border-[#1D5278]/70 hover:bg-[#081F33] hover:border-[#1D5278]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${badge.dot}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{st.stateName}</span>
                      {st.activeCount > 0 && (
                        <span className="text-[10px] font-mono text-[#AFC4D8] font-normal">
                          ({st.activeCount} alert{st.activeCount > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#AFC4D8] truncate">
                      {st.primaryHazardLabel} • {st.capital}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#AFC4D8]">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer: Status Indication */}
      <div className="pt-2 border-t border-[#1D5278] flex items-center justify-between text-[10px] text-[#AFC4D8]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#008000]" />
          <span>IMD National Warning Database</span>
        </div>
        <span>36 States &amp; UTs</span>
      </div>
    </div>
  );
};
