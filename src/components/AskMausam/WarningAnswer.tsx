// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Official Meteorological Warning Component
// ====================================================================

import React from 'react';
import { WarningContextItem } from '../../types/askMausam';

interface WarningAnswerProps {
  warnings?: WarningContextItem[];
  locationName: string;
}

export const WarningAnswer: React.FC<WarningAnswerProps> = ({ warnings = [], locationName }) => {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl bg-[#081813] border border-[#12422C] text-[#D7DEE8] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
            Green Alert — Routine Synoptic Conditions
          </span>
        </div>
        <p className="text-xs text-[#A7F3D0] leading-relaxed">
          No severe weather warnings or cyclonic bulletins are currently active for <strong className="text-white">{locationName}</strong>. Atmospheric parameters remain within normal seasonal ranges.
        </p>
        <span className="text-[10px] text-[#059669]">
          Source: India Meteorological Department (IMD Synoptic Bulletin)
        </span>
      </div>
    );
  }

  const topWarning = warnings[0];
  const isRed = topWarning.severity === 'red';
  const isOrange = topWarning.severity === 'orange';
  const isYellow = topWarning.severity === 'yellow';

  const borderColor = isRed ? 'border-[#DC2626]' : isOrange ? 'border-[#EA580C]' : 'border-[#CA8A04]';
  const bgColor = isRed ? 'bg-[#2A0D0D]' : isOrange ? 'bg-[#2A150A]' : 'bg-[#261E0A]';
  const badgeColor = isRed ? 'bg-[#DC2626] text-white' : isOrange ? 'bg-[#EA580C] text-white' : 'bg-[#EAB308] text-black';
  const textColor = isRed ? 'text-[#FCA5A5]' : isOrange ? 'text-[#FDBA74]' : 'text-[#FDE047]';

  return (
    <div className={`mt-2.5 p-3.5 sm:p-4 rounded-xl border ${borderColor} ${bgColor} flex flex-col gap-3 text-[#D7DEE8]`}>
      {/* Alert Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${badgeColor}`}>
            {topWarning.severity.toUpperCase()} ALERT
          </span>
          <h3 className="text-sm font-bold text-white mt-1.5">{topWarning.headline}</h3>
        </div>
      </div>

      {/* Warning Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-black/40 border border-white/10">
          <span className="text-[10px] text-[#94A3B8] block">Affected Territory</span>
          <span className="font-semibold text-white mt-0.5 block">{topWarning.affectedArea}</span>
        </div>
        <div className="p-2 rounded-lg bg-black/40 border border-white/10">
          <span className="text-[10px] text-[#94A3B8] block">Hazard Classification</span>
          <span className="font-semibold text-white mt-0.5 block">{topWarning.hazard}</span>
        </div>
      </div>

      {topWarning.description && (
        <p className={`text-xs ${textColor} leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5`}>
          {topWarning.description}
        </p>
      )}

      {topWarning.actionAdvice && (
        <div className="text-xs p-2.5 rounded-lg bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white block mb-1">
            Safety & Precautionary Advice
          </span>
          <p className="text-[#CBD5E1] leading-relaxed">{topWarning.actionAdvice}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-2 border-t border-white/10">
        <span>Source: {topWarning.source || 'IMD Official Warning Bulletin'}</span>
        {topWarning.validUntil && <span>Valid Until: {topWarning.validUntil}</span>}
      </div>
    </div>
  );
};
