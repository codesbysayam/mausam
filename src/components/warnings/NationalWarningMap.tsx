import React, { useState, useMemo, useRef } from 'react';
import India from '@svg-maps/india';
import { AlertSeverity, StateWarningSummary, WarningRecord } from '../../types/warningTypes';
import { STATE_ALERT_SEVERITIES } from '../../data/nationalWarningsData';

interface NationalWarningMapProps {
  selectedState: string | null;
  onSelectState: (stateName: string, stateCode: string) => void;
  onOpenStateDrawer?: (summary: StateWarningSummary) => void;
  warnings: WarningRecord[];
}

const SEVERITY_COLORS: Record<AlertSeverity, { fill: string; stroke: string; label: string; text: string }> = {
  red: { fill: '#E74C3C', stroke: '#FF7675', label: 'Red Alert (Take Action)', text: 'Severe / Heavy Inundation' },
  orange: { fill: '#FF8C42', stroke: '#FFA066', label: 'Orange Alert (Be Prepared)', text: 'Moderate / Squally Weather' },
  yellow: { fill: '#F1C40F', stroke: '#F7DC6F', label: 'Yellow Watch (Be Updated)', text: 'Watch / Advisory' },
  purple: { fill: '#9B59B6', stroke: '#BB8FCE', label: 'Advisory Bulletin (Agromet)', text: 'GKMS / Research Advisory' },
  green: { fill: '#1E2733', stroke: '#314255', label: 'Green Code (No Severe Warning)', text: 'Normal Seasonal Weather' },
};

export const NationalWarningMap: React.FC<NationalWarningMapProps> = ({
  selectedState,
  onSelectState,
  onOpenStateDrawer,
  warnings,
}) => {
  const [hoveredLocation, setHoveredLocation] = useState<{
    id: string;
    name: string;
    summary: StateWarningSummary;
    x: number;
    y: number;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapMode, setMapMode] = useState<'severity' | 'hazards'>('severity');

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

  const resolveStateSummary = (loc: { id: string; name: string }): StateWarningSummary => {
    const sId = (loc.id || '').toLowerCase();
    const sName = (loc.name || '').toLowerCase();
    const cleanId = sId.replace('in-', '');

    if (stateSummaryMap.has(sId)) return stateSummaryMap.get(sId)!;
    if (stateSummaryMap.has(sName)) return stateSummaryMap.get(sName)!;
    if (stateSummaryMap.has(cleanId)) return stateSummaryMap.get(cleanId)!;

    // Partial search
    for (const [k, v] of stateSummaryMap.entries()) {
      if (sName.includes(k) || k.includes(sName)) {
        return v;
      }
    }

    return {
      stateCode: loc.id,
      stateName: loc.name,
      capital: 'Regional Center',
      highestSeverity: 'green',
      activeCount: 0,
      primaryHazard: 'heavy_rain',
      primaryHazardLabel: 'Normal Weather',
      representativeStation: `${loc.name} AWS`,
      bulletinHeadline: 'Green Code • Normal atmospheric conditions',
      validityRange: 'Routine Synoptic Observation',
    };
  };

  const getStateFillColor = (loc: { id: string; name: string }) => {
    const summary = resolveStateSummary(loc);
    const sev = summary.highestSeverity;
    const isSelected =
      selectedState &&
      (selectedState.toLowerCase() === summary.stateName.toLowerCase() ||
        selectedState.toLowerCase() === summary.stateCode.toLowerCase() ||
        selectedState.toLowerCase() === loc.name.toLowerCase());

    if (isSelected) {
      return '#0B72B9';
    }

    return SEVERITY_COLORS[sev]?.fill || '#1E2733';
  };

  const handleStateClick = (loc: { id: string; name: string }) => {
    const summary = resolveStateSummary(loc);
    onSelectState(summary.stateName, summary.stateCode);
    if (onOpenStateDrawer) {
      onOpenStateDrawer(summary);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, loc: { id: string; name: string }) => {
    const summary = resolveStateSummary(loc);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredLocation({
      id: loc.id,
      name: loc.name,
      summary,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      id="national-weather-alert-map-card"
      className="bg-[#1E2733] border border-[#314255] rounded-md p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#314255] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#151D26] border border-[#314255] flex items-center justify-center text-[#4FA8E0]">
            <span className="material-symbols-outlined text-[20px]">map</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              National Weather Alert Map
            </h3>
            <p className="text-[11px] text-[#8A94A6]">
              All-India Meteorological Subdivisions &amp; State Early Warning Severity
            </p>
          </div>
        </div>

        {/* Legend & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#151D26] border border-[#314255] rounded p-0.5">
            <button
              id="btn-map-zoom-in"
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              title="Zoom In"
              aria-label="Zoom in map"
              className="w-7 h-7 flex items-center justify-center text-[#8A94A6] hover:text-white hover:bg-[#1E2733] rounded cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button
              id="btn-map-zoom-out"
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.9, z - 0.15))}
              title="Zoom Out"
              aria-label="Zoom out map"
              className="w-7 h-7 flex items-center justify-center text-[#8A94A6] hover:text-white hover:bg-[#1E2733] rounded cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <button
              id="btn-map-zoom-reset"
              type="button"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              aria-label="Reset map zoom"
              className="w-7 h-7 flex items-center justify-center text-[#8A94A6] hover:text-white hover:bg-[#1E2733] rounded cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full bg-[#151D26] border border-[#314255] rounded-md overflow-hidden min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-2">
        {/* Interactive Map SVG */}
        <div
          className="w-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={India.viewBox}
            className="w-full max-h-[480px] select-none"
            aria-label="Geographical Warning Map of India"
          >
            {India.locations.map((loc: any) => {
              const fill = getStateFillColor(loc);
              const summary = resolveStateSummary(loc);
              const isHovered = hoveredLocation?.id === loc.id;
              const isSelected =
                selectedState &&
                (selectedState.toLowerCase() === summary.stateName.toLowerCase() ||
                  selectedState.toLowerCase() === summary.stateCode.toLowerCase());

              return (
                <path
                  key={loc.id}
                  id={`warning-state-path-${loc.id}`}
                  name={loc.name}
                  d={loc.path}
                  fill={fill}
                  stroke={
                    isSelected
                      ? '#FFFFFF'
                      : isHovered
                      ? '#4FA8E0'
                      : '#314255'
                  }
                  strokeWidth={isSelected ? '2.5' : isHovered ? '1.8' : '0.8'}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => handleStateClick(loc)}
                  onMouseMove={(e) => handleMouseMove(e, loc)}
                  onMouseLeave={() => setHoveredLocation(null)}
                />
              );
            })}
          </svg>
        </div>

        {/* Floating Tooltip */}
        {hoveredLocation && (
          <div
            className="fixed z-50 pointer-events-none bg-[#1E2733] border border-[#314255] rounded shadow-2xl p-3 text-xs w-64 transform -translate-x-1/2 -translate-y-full -mt-3"
            style={{
              left: `${hoveredLocation.x}px`,
              top: `${hoveredLocation.y}px`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#314255] gap-2">
              <span className="font-bold text-white text-sm">
                {hoveredLocation.summary.stateName}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  hoveredLocation.summary.highestSeverity === 'red'
                    ? 'bg-[#E74C3C] text-white'
                    : hoveredLocation.summary.highestSeverity === 'orange'
                    ? 'bg-[#FF8C42] text-white'
                    : hoveredLocation.summary.highestSeverity === 'yellow'
                    ? 'bg-[#F1C40F] text-[#0F141A]'
                    : hoveredLocation.summary.highestSeverity === 'purple'
                    ? 'bg-[#9B59B6] text-white'
                    : 'bg-[#2ECC71]/20 text-[#2ECC71]'
                }`}
              >
                {hoveredLocation.summary.highestSeverity.toUpperCase()} ALERT
              </span>
            </div>

            <div className="pt-2 space-y-1.5">
              <div className="text-[11px] text-[#DCE3EB]">
                <strong>Primary Hazard:</strong>{' '}
                <span className="text-white font-semibold">
                  {hoveredLocation.summary.primaryHazardLabel}
                </span>
              </div>

              <div className="text-[11px] text-[#8A94A6] leading-tight">
                {hoveredLocation.summary.bulletinHeadline}
              </div>

              <div className="pt-1.5 border-t border-[#314255]/70 flex items-center justify-between text-[10px] text-[#8A94A6]">
                <span>{hoveredLocation.summary.validityRange}</span>
                <span className="text-[#4FA8E0] font-semibold">Click to filter</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected State Marker Banner on top left of map */}
        {selectedState && selectedState !== 'all' && (
          <div className="absolute top-3 left-3 bg-[#1E2733]/90 backdrop-blur-sm border border-[#4FA8E0] px-3 py-1.5 rounded text-xs text-white flex items-center gap-2 shadow-lg">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[16px]">
              location_on
            </span>
            <span>
              Focused State: <strong className="text-[#4FA8E0]">{selectedState}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Official Early Warning Color Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-[#314255]">
        <div className="flex items-center gap-2 p-2 rounded bg-[#151D26] border border-[#314255]">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#E74C3C] shrink-0"></span>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white">Red Alert</div>
            <div className="text-[10px] text-[#8A94A6]">Take Action / Emergency</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-[#151D26] border border-[#314255]">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#FF8C42] shrink-0"></span>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white">Orange Alert</div>
            <div className="text-[10px] text-[#8A94A6]">Be Prepared / High Vigil</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-[#151D26] border border-[#314255]">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#F1C40F] shrink-0"></span>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white">Yellow Watch</div>
            <div className="text-[10px] text-[#8A94A6]">Be Updated / Advisory</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-[#151D26] border border-[#314255]">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#9B59B6] shrink-0"></span>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white">Advisory Bulletin</div>
            <div className="text-[10px] text-[#8A94A6]">Agromet / GKMS Field</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded bg-[#151D26] border border-[#314255] col-span-2 sm:col-span-1">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#1E2733] border border-[#314255] shrink-0"></span>
          <div className="leading-tight">
            <div className="text-xs font-bold text-[#DCE3EB]">Green Code</div>
            <div className="text-[10px] text-[#8A94A6]">No Warning / Normal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
