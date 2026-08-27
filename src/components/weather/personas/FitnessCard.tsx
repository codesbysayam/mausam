import React from 'react';

interface FitnessCardProps {
  sunrise: string;
  sunset: string;
  bestRunningHours: string;
  workoutSuitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  heatAlertActive: boolean;
  heatAlertMessage: string | null;
  windSpeedKmh: number;
  windDirection: string;
  hydrationRateMlHour: number;
  thermalStressLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  city: string;
}

export const FitnessCard: React.FC<FitnessCardProps> = ({
  sunrise,
  sunset,
  bestRunningHours,
  workoutSuitability,
  heatAlertActive,
  heatAlertMessage,
  windSpeedKmh,
  windDirection,
  hydrationRateMlHour,
  thermalStressLevel,
  city,
}) => {
  const suitabilityColor =
    workoutSuitability === 'Excellent'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : workoutSuitability === 'Good'
      ? 'bg-[#27AE60]/15 text-[#27AE60] border-[#27AE60]/40'
      : workoutSuitability === 'Fair'
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#F1C40F]/15 text-[#F1C40F] flex items-center justify-center border border-[#F1C40F]/30">
              <span className="material-symbols-outlined text-[20px]">directions_run</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Outdoor Fitness &amp; Running
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                Astronomical Sun Times &amp; Biometeorology • {city}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${suitabilityColor}`}>
            {workoutSuitability} Workout
          </span>
        </div>

        {/* Heat Alert Banner (if heatwave or high heat active) */}
        {heatAlertActive && (
          <div className="mt-3.5 p-3 rounded bg-[#E74C3C]/15 border border-[#E74C3C]/40 flex items-start gap-2 text-xs text-[#E74C3C] animate-pulse">
            <span className="material-symbols-outlined text-[20px] shrink-0">
              warning
            </span>
            <div>
              <strong className="block font-bold">Heat Alert: Extreme Thermal Stress</strong>
              <p className="text-[11px] text-[#D7DEE8] mt-0.5">
                {heatAlertMessage || 'High heat index active. Avoid intense outdoor exertion between 11 AM - 4 PM. Hydrate frequently.'}
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {/* Sunrise / Sunset */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              Sun Schedule
            </span>
            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="flex items-center gap-1 text-[#F1C40F]">
                <span className="material-symbols-outlined text-[14px]">wb_twilight</span>
                <span className="font-mono text-white font-bold">{sunrise}</span>
              </div>
              <div className="flex items-center gap-1 text-[#FF8C42]">
                <span className="material-symbols-outlined text-[14px]">bedtime</span>
                <span className="font-mono text-white font-bold">{sunset}</span>
              </div>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1.5">
              Sunrise &amp; Sunset Ephemeris
            </span>
          </div>

          {/* Wind Speed & Direction */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              Surface Wind
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold font-mono text-white">{windSpeedKmh}</span>
              <span className="text-[10px] text-[#8A94A6]">km/h</span>
              <span className="text-xs font-mono text-[#4FA8E0] ml-1 font-bold">{windDirection}</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1">
              {windSpeedKmh > 20 ? 'Breezy (Headwind on track)' : 'Light running breeze'}
            </span>
          </div>

          {/* Hydration & Thermal Stress */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155] col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
              Fluid Intake Target
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold font-mono text-[#4FA8E0]">{hydrationRateMlHour}</span>
              <span className="text-[10px] text-[#8A94A6]">mL/hr</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1">
              Thermal Stress: <strong className="text-[#D7DEE8]">{thermalStressLevel}</strong>
            </span>
          </div>
        </div>

        {/* Best Running Hours Recommendation */}
        <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#F1C40F] text-[18px] shrink-0 mt-0.5">
            schedule
          </span>
          <div className="text-xs">
            <p className="text-white font-semibold">
              Optimal Outdoor Window: <span className="text-[#2ECC71] font-mono">{bestRunningHours}</span>
            </p>
            <p className="text-[11px] text-[#8A94A6] mt-0.5">
              Calculated when temperatures, solar UV index, and ground ozone concentrations are lowest.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>IMD Sun/Moon Ephemeris &amp; NOAA Biometeorology Model</strong></span>
        <span>Status: <strong>Grounded Telemetry</strong></span>
      </div>
    </div>
  );
};
