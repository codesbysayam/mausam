import React from 'react';

interface AgriGardenCardProps {
  soilMoisturePercent: number;
  soilMoistureStatus: 'Dry' | 'Optimal' | 'Saturated';
  threeDayRainfallTotalMm: number;
  frostAlertActive: boolean;
  frostAlertMessage: string | null;
  currentCropSeason: 'Kharif' | 'Rabi' | 'Zaid';
  seasonalPlantingTip: string;
  irrigationRecommendation: string;
  city: string;
  state: string;
}

export const AgriGardenCard: React.FC<AgriGardenCardProps> = ({
  soilMoisturePercent,
  soilMoistureStatus,
  threeDayRainfallTotalMm,
  frostAlertActive,
  frostAlertMessage,
  currentCropSeason,
  seasonalPlantingTip,
  irrigationRecommendation,
  city,
  state,
}) => {
  const soilBadgeColor =
    soilMoistureStatus === 'Optimal'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : soilMoistureStatus === 'Dry'
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : 'bg-[#0B72B9]/15 text-[#4FA8E0] border-[#0B72B9]/40';

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#27AE60]/15 text-[#2ECC71] flex items-center justify-center border border-[#27AE60]/30">
              <span className="material-symbols-outlined text-[20px]">agriculture</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Agriculture &amp; Gardeners
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                Gramin Krishi Mausam Sewa (GKMS) • {city}, {state}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#27AE60]/15 text-[#2ECC71] border border-[#27AE60]/40">
            {currentCropSeason} Season
          </span>
        </div>

        {/* Frost Alert (if cold wave or ground frost danger active) */}
        {frostAlertActive && (
          <div className="mt-3.5 p-3 rounded bg-[#0B72B9]/20 border border-[#4FA8E0]/50 flex items-start gap-2 text-xs text-[#4FA8E0]">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-[#4FA8E0]">
              ac_unit
            </span>
            <div>
              <strong className="block font-bold text-white">Frost Alert: Ground Frost Risk Tonight</strong>
              <p className="text-[11px] text-[#D7DEE8] mt-0.5">
                {frostAlertMessage || 'Projected ground minimum below 4°C. Cover nursery seedlings and apply light sprinkler irrigation to mitigate frost injury.'}
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {/* Soil Moisture */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Soil Moisture</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${soilBadgeColor}`}>
                {soilMoistureStatus}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{soilMoisturePercent}</span>
              <span className="text-[10px] text-[#8A94A6]">% vol</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              Root-zone (0–30 cm depth)
            </span>
          </div>

          {/* 3-Day Rainfall Forecast */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              3-Day Rainfall
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-[#4FA8E0]">
                {threeDayRainfallTotalMm}
              </span>
              <span className="text-[10px] text-[#8A94A6]">mm</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              {threeDayRainfallTotalMm > 15 ? 'Significant rain expected' : 'Light / Dry conditions'}
            </span>
          </div>

          {/* Irrigation Schedule */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155] col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              Irrigation Plan
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-sm font-bold text-[#2ECC71] truncate">
                {threeDayRainfallTotalMm > 15 ? 'Hold Irrigation' : 'Normal Water'}
              </span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              Agromet Water Balance
            </span>
          </div>
        </div>

        {/* Seasonal Planting Guidance */}
        <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#2ECC71] text-[18px] shrink-0 mt-0.5">
            eco
          </span>
          <div className="text-xs space-y-1">
            <p className="text-[#D7DEE8]">
              <strong>Crop &amp; Garden Advice ({currentCropSeason}):</strong> {seasonalPlantingTip}
            </p>
            <p className="text-[11px] text-[#8A94A6]">
              <strong>Irrigation Guidance:</strong> {irrigationRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>Gramin Krishi Mausam Sewa (GKMS) &amp; IMD Meghdoot</strong></span>
        <span>Validation: <strong>ICAR Agro-Meteorological Standards</strong></span>
      </div>
    </div>
  );
};
