import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertSeverity, StateWarningSummary, WarningRecord } from '../../types/warningTypes';
import { STATE_ALERT_SEVERITIES } from '../../data/nationalWarningsData';
import { ALL_INDIA_STATES_MET_PROFILES, StateMeteorologicalProfile } from '../../data/allIndiaStatesProfiles';

interface NationalWarningMapProps {
  selectedState: string | null;
  onSelectState: (stateName: string, stateCode: string) => void;
  onOpenStateDrawer?: (summary: StateWarningSummary) => void;
  warnings: WarningRecord[];
}

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { fill: string; border: string; label: string; text: string; action: string }
> = {
  red: {
    fill: '#FF0000',
    border: '#B30000',
    label: 'Red Alert',
    text: 'Take Action',
    action: 'Extremely Heavy Rain / Cyclone / Severe Squall',
  },
  orange: {
    fill: '#FFA500',
    border: '#CC8400',
    label: 'Orange Alert',
    text: 'Be Prepared',
    action: 'Very Heavy Rain / Thunderstorm & Squall',
  },
  yellow: {
    fill: '#FFFF00',
    border: '#CCCC00',
    label: 'Yellow Watch',
    text: 'Be Updated',
    action: 'Heavy Rain / Lightning / Dense Fog / Wind',
  },
  purple: {
    fill: '#1565C0',
    border: '#0B3D91',
    label: 'Agromet Advisory',
    text: 'Advisory Bulletin',
    action: 'Agromet & GKMS Specialized Agricultural Bulletin',
  },
  green: {
    fill: '#008000',
    border: '#006600',
    label: 'Green Code',
    text: 'No Warning',
    action: 'Normal Atmospheric & Seasonal Conditions',
  },
};

/**
 * Reusable map resize observer requested by IMD operations specification
 */
function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({
        pan: false,
        animate: false,
      });
    });

    resizeObserver.observe(container);

    const timer = setTimeout(() => {
      map.invalidateSize({
        pan: false,
        animate: false,
      });
    }, 200);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [map]);

  return null;
}

/**
 * Programmatic map centering controller
 */
function MapCenterController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

export const NationalWarningMap: React.FC<NationalWarningMapProps> = ({
  selectedState,
  onSelectState,
  onOpenStateDrawer,
  warnings = [],
}) => {
  const INDIA_CENTER: [number, number] = [22.8, 80.5];
  const DEFAULT_ZOOM = 4.5;

  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM);

  // Map state codes/names to state summaries
  const stateSummaryMap = useMemo(() => {
    const map = new Map<string, StateWarningSummary>();
    Object.values(STATE_ALERT_SEVERITIES).forEach((summary) => {
      map.set(summary.stateCode.toLowerCase(), summary);
      map.set(summary.stateName.toLowerCase(), summary);
      const clean = summary.stateCode.replace('in-', '').toLowerCase();
      map.set(clean, summary);
    });
    return map;
  }, []);

  const resolveStateSummary = useCallback(
    (profile: StateMeteorologicalProfile): StateWarningSummary => {
      const sId = profile.id.toLowerCase();
      const sName = profile.name.toLowerCase();
      const sCode = profile.code.toLowerCase();

      // Check if there is an active warning for this state from verified API
      const live = warnings.find(
        (w) =>
          w.state.toLowerCase() === sName ||
          w.stateCode.toLowerCase() === sCode ||
          w.state.toLowerCase().includes(sName) ||
          sName.includes(w.state.toLowerCase())
      );
      if (live) {
        return {
          stateCode: `in-${profile.code.toLowerCase()}`,
          stateName: profile.name,
          capital: profile.capital,
          highestSeverity: live.severity,
          activeCount: 1,
          primaryHazard: live.hazardCategory,
          primaryHazardLabel: live.hazardLabel,
          representativeStation: profile.representativeStation,
          bulletinHeadline: live.title,
          validityRange: live.validUntil,
        };
      }

      if (stateSummaryMap.has(`in-${sCode}`)) return stateSummaryMap.get(`in-${sCode}`)!;
      if (stateSummaryMap.has(sName)) return stateSummaryMap.get(sName)!;
      if (stateSummaryMap.has(sId)) return stateSummaryMap.get(sId)!;

      // Partial lookup
      for (const [k, v] of stateSummaryMap.entries()) {
        if (sName.includes(k) || k.includes(sName)) {
          return v;
        }
      }

      return {
        stateCode: `in-${profile.code.toLowerCase()}`,
        stateName: profile.name,
        capital: profile.capital,
        highestSeverity: 'green',
        activeCount: 0,
        primaryHazard: 'heavy_rain',
        primaryHazardLabel: 'Normal Seasonal Weather',
        representativeStation: profile.representativeStation,
        bulletinHeadline: 'Green Code • Normal atmospheric conditions',
        validityRange: 'Routine Synoptic Observation',
      };
    },
    [stateSummaryMap]
  );

  // If a state is selected externally, center the map on it
  useEffect(() => {
    if (selectedState && selectedState !== 'all') {
      const match = ALL_INDIA_STATES_MET_PROFILES.find(
        (p) =>
          p.name.toLowerCase() === selectedState.toLowerCase() ||
          p.code.toLowerCase() === selectedState.toLowerCase() ||
          selectedState.toLowerCase().includes(p.name.toLowerCase())
      );
      if (match) {
        setMapCenter([match.lat, match.lng]);
        setMapZoom(6);
      }
    }
  }, [selectedState]);

  const handleResetView = () => {
    setMapCenter(INDIA_CENTER);
    setMapZoom(DEFAULT_ZOOM);
    if (selectedState && selectedState !== 'all') {
      onSelectState('All India', 'all');
    }
  };

  // Create custom marker icons for each state based on severity
  const createSeverityMarker = (
    severity: AlertSeverity,
    isSelected: boolean,
    code: string,
    count: number
  ) => {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.green;
    const isRed = severity === 'red';
    const isOrange = severity === 'orange';
    const isYellow = severity === 'yellow';

    const textFill = isYellow ? '#0B263D' : '#FFFFFF';
    const size = isSelected ? 34 : 28;

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-150 ${
        isSelected ? 'scale-115 z-50' : 'hover:scale-110 z-20'
      }" style="width: ${size}px; height: ${size}px;">
        ${
          isRed
            ? `<div class="absolute inset-0 rounded-full animate-ping opacity-60" style="background-color: ${config.fill};"></div>`
            : ''
        }
        <div class="relative flex items-center justify-center rounded-full font-mono font-bold text-[10px] shadow-md border" style="width: ${size}px; height: ${size}px; background-color: ${
      config.fill
    }; border-color: ${isSelected ? '#FFFFFF' : config.border}; color: ${textFill}; ${
      isSelected ? 'box-shadow: 0 0 0 3px #FFFFFF, 0 0 12px rgba(255,255,255,0.7);' : ''
    }">
          <span>${code}</span>
        </div>
        ${
          count > 1
            ? `<span class="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs" style="width: 15px; height: 15px; background: #0B263D; border: 1px solid ${config.fill};">${count}</span>`
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-state-alert-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4],
    });
  };

  // Severity tallies for map header
  const stateCounts = useMemo(() => {
    let red = 0;
    let orange = 0;
    let yellow = 0;
    let green = 0;

    ALL_INDIA_STATES_MET_PROFILES.forEach((p) => {
      const summary = resolveStateSummary(p);
      if (summary.highestSeverity === 'red') red++;
      else if (summary.highestSeverity === 'orange') orange++;
      else if (summary.highestSeverity === 'yellow') yellow++;
      else green++;
    });

    return { red, orange, yellow, green, total: ALL_INDIA_STATES_MET_PROFILES.length };
  }, [resolveStateSummary]);

  return (
    <div
      id="national-weather-alert-map-card"
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 sm:p-5 shadow-md flex flex-col justify-between gap-3.5 h-full"
    >
      {/* 1. Header Bar: Title, Synoptic Status, Reset View Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1D5278] gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#4FA8E0]">
              public
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#F5F9FC] uppercase tracking-tight">
              National Weather Alert Map
            </h3>
          </div>
          <p className="text-[11px] text-[#AFC4D8] mt-0.5">
            Geographic Warning Classification Across Indian States &amp; Union Territories
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedState && selectedState !== 'all' && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#102D47] border border-[#1565C0] text-[#E3F2FD] flex items-center gap-1">
              <span>Focus: {selectedState}</span>
            </span>
          )}

          <button
            id="btn-reset-map-view"
            type="button"
            onClick={handleResetView}
            className="px-2.5 py-1 rounded bg-[#081F33] hover:bg-[#102D47] text-[#AFC4D8] hover:text-[#F5F9FC] border border-[#1D5278] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Reset to All-India Synoptic Overview"
          >
            <span className="material-symbols-outlined text-[15px]">crop_free</span>
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* 2. Map Container with Strict Container Height & ResizeObserver */}
      <div
        id="map-container-wrapper"
        className="w-full h-[460px] sm:h-[500px] lg:h-[540px] rounded overflow-hidden relative border border-[#1D5278] bg-[#061A2B]"
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          minZoom={4}
          maxZoom={9}
          scrollWheelZoom={false}
          attributionControl={true}
          zoomControl={true}
          style={{ width: '100%', height: '100%', backgroundColor: '#061A2B' }}
        >
          {/* Map Resize Observer Fix */}
          <MapResizeFix />

          {/* Programmatic Center Controller */}
          <MapCenterController center={mapCenter} zoom={mapZoom} />

          {/* Standard OpenStreetMap TileLayer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          {/* Interactive State Markers with Official Coordinates */}
          {ALL_INDIA_STATES_MET_PROFILES.map((profile) => {
            const summary = resolveStateSummary(profile);
            const severity = summary.highestSeverity;
            const isSelected =
              selectedState &&
              (selectedState.toLowerCase() === profile.name.toLowerCase() ||
                selectedState.toLowerCase() === profile.code.toLowerCase() ||
                selectedState.toLowerCase() === summary.stateCode.toLowerCase());

            const icon = createSeverityMarker(
              severity,
              Boolean(isSelected),
              profile.code,
              summary.activeCount
            );

            const badgeConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.green;

            return (
              <Marker
                key={profile.id}
                position={[profile.lat, profile.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onSelectState(profile.name, summary.stateCode);
                  },
                }}
              >
                {/* Clean Hover Tooltip */}
                <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
                  <div className="font-sans text-xs">
                    <strong className="text-white block">{profile.name}</strong>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider block mt-0.5"
                      style={{ color: badgeConfig.fill }}
                    >
                      {badgeConfig.label} ({summary.activeCount} Alert{summary.activeCount === 1 ? '' : 's'})
                    </span>
                  </div>
                </Tooltip>

                {/* Detailed Interactive Popup */}
                <Popup className="mausam-dark-popup">
                  <div className="p-1 min-w-[230px] max-w-[280px] text-xs font-sans">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#1D5278] mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">
                          {profile.name}
                        </h4>
                        <span className="text-[10px] text-[#AFC4D8]">
                          Capital: {profile.capital}
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                        style={{
                          backgroundColor: `${badgeConfig.fill}22`,
                          borderColor: badgeConfig.fill,
                          color: badgeConfig.fill,
                        }}
                      >
                        {badgeConfig.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[#F5F9FC]">
                      <div className="text-[11px] text-[#AFC4D8]">
                        <strong className="text-[#F5F9FC]">Primary Hazard:</strong>{' '}
                        {summary.primaryHazardLabel}
                      </div>

                      <div className="text-[11px] leading-snug bg-[#081F33] p-1.5 rounded border border-[#1D5278]/60">
                        {summary.bulletinHeadline}
                      </div>

                      <div className="text-[10px] text-[#AFC4D8]">
                        <span>Station: </span>
                        <strong className="text-white font-mono">{summary.representativeStation}</strong>
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-[#1D5278] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectState(profile.name, summary.stateCode);
                        }}
                        className="w-full py-1.5 px-2 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white font-bold text-[11px] transition-colors cursor-pointer text-center"
                      >
                        Filter Warnings ({profile.name})
                      </button>

                      {onOpenStateDrawer && (
                        <button
                          type="button"
                          onClick={() => onOpenStateDrawer(summary)}
                          className="py-1.5 px-2 rounded bg-[#081F33] hover:bg-[#102D47] text-[#AFC4D8] hover:text-white border border-[#1D5278] font-semibold text-[11px] transition-colors cursor-pointer"
                          title="View Full State Advisory"
                        >
                          Advisory
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 3. Official Legend Directly Below the Map */}
      <div
        id="warning-map-legend"
        className="pt-2 border-t border-[#1D5278] flex flex-col gap-2"
      >
        <div className="flex items-center justify-between text-[11px] text-[#AFC4D8]">
          <span className="font-semibold text-white uppercase tracking-wider text-[10px]">
            Official IMD Warning Classifications
          </span>
          <span className="font-mono text-[10px]">
            {stateCounts.red} Red • {stateCounts.orange} Orange • {stateCounts.yellow} Yellow • {stateCounts.green} Normal
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Red Alert */}
          <div className="flex items-center gap-2 p-1.5 rounded bg-[#081F33] border border-[#1D5278]/80">
            <span className="w-3 h-3 rounded-full bg-[#FF0000] shrink-0 shadow-xs" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#FF4D4D] leading-tight truncate">
                Red Alert
              </div>
              <div className="text-[10px] text-[#AFC4D8] leading-tight truncate">
                Take Action
              </div>
            </div>
          </div>

          {/* Orange Alert */}
          <div className="flex items-center gap-2 p-1.5 rounded bg-[#081F33] border border-[#1D5278]/80">
            <span className="w-3 h-3 rounded-full bg-[#FFA500] shrink-0 shadow-xs" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#FFA500] leading-tight truncate">
                Orange Alert
              </div>
              <div className="text-[10px] text-[#AFC4D8] leading-tight truncate">
                Be Prepared
              </div>
            </div>
          </div>

          {/* Yellow Watch */}
          <div className="flex items-center gap-2 p-1.5 rounded bg-[#081F33] border border-[#1D5278]/80">
            <span className="w-3 h-3 rounded-full bg-[#FFFF00] shrink-0 shadow-xs" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#FFFF00] leading-tight truncate">
                Yellow Watch
              </div>
              <div className="text-[10px] text-[#AFC4D8] leading-tight truncate">
                Be Updated
              </div>
            </div>
          </div>

          {/* Green Code */}
          <div className="flex items-center gap-2 p-1.5 rounded bg-[#081F33] border border-[#1D5278]/80">
            <span className="w-3 h-3 rounded-full bg-[#008000] shrink-0 shadow-xs" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#00E676] leading-tight truncate">
                Green Code
              </div>
              <div className="text-[10px] text-[#AFC4D8] leading-tight truncate">
                No Severe Warning
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
