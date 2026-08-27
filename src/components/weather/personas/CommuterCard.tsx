import React from 'react';

interface CommuterCardProps {
  roadCondition: 'Dry' | 'Wet' | 'Waterlogged' | 'Icy' | 'Foggy';
  roadSafetyIndex: 'Green' | 'Yellow' | 'Red';
  roadSafetyLabel: string;
  visibilityKm: number;
  visibilityStatus: 'Clear' | 'Moderate' | 'Poor (Fog)' | 'Dense Fog Danger';
  travelHazards: string[];
  city: string;
}

export const CommuterCard: React.FC<CommuterCardProps> = ({
  roadCondition,
  roadSafetyIndex,
  roadSafetyLabel,
  visibilityKm,
  visibilityStatus,
  travelHazards,
  city,
}) => {
  const safetyBadgeColor =
    roadSafetyIndex === 'Green'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : roadSafetyIndex === 'Yellow'
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  const conditionIcon =
    roadCondition === 'Wet'
      ? 'water_drop'
      : roadCondition === 'Foggy'
      ? 'foggy'
      : roadCondition === 'Waterlogged'
      ? 'flood'
      : roadCondition === 'Icy'
      ? 'ac_unit'
      : 'directions_car';

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#3498DB]/15 text-[#3498DB] flex items-center justify-center border border-[#3498DB]/30">
              <span className="material-symbols-outlined text-[20px]">{conditionIcon}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Commuters &amp; Highway Drivers
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                Xweather Road Conditions &amp; Visibility • {city}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${safetyBadgeColor}`}>
            Safety: {roadSafetyIndex === 'Green' ? 'Optimal' : roadSafetyIndex === 'Yellow' ? 'Caution' : 'Hazardous'}
          </span>
        </div>

        {/* Road Surface & Visibility Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {/* Road Surface Status */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              Road Surface
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-bold font-mono text-white">
                {roadCondition}
              </span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              {roadCondition === 'Wet' ? 'Reduced tire grip' : 'Normal friction coefficient'}
            </span>
          </div>

          {/* Visibility */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Visibility</span>
              <span className="text-[10px] text-[#4FA8E0] font-bold">
                {visibilityStatus}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-white">
                {visibilityKm}
              </span>
              <span className="text-[10px] text-[#8A94A6]">km</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              {visibilityKm >= 5 ? 'Unrestricted sight distance' : 'Fog/Mist warning active'}
            </span>
          </div>

          {/* Aquaplaning / Hydroplaning Risk */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155] col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              Hydroplane Risk
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-sm font-bold text-[#4FA8E0]">
                {roadCondition === 'Wet' ? 'Moderate Risk' : 'Minimal'}
              </span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              Highway drainage status
            </span>
          </div>
        </div>

        {/* Driving & Fog Advisory */}
        <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#3498DB] text-[18px] shrink-0 mt-0.5">
            traffic
          </span>
          <div className="text-xs space-y-1">
            <p className="text-[#D7DEE8]">
              <strong>Driver Assessment:</strong> {roadSafetyLabel}
            </p>
            {travelHazards.length > 0 && (
              <p className="text-[11px] text-[#8A94A6]">
                <strong>Highway Alert:</strong> {travelHazards.join(' • ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>Xweather Road Telemetry &amp; IMD Highway Visibility Grid</strong></span>
        <span>Standard: <strong>IRC Highway Safety Guidelines</strong></span>
      </div>
    </div>
  );
};
