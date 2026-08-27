import React from 'react';
import { AuthoritativeAlert } from '../../../services/authoritativeService';

interface FamilyCommuteCardProps {
  morningCommuteStatus: 'Safe' | 'Caution' | 'Hazardous';
  eveningCommuteStatus: 'Safe' | 'Caution' | 'Hazardous';
  morningWindow: string;
  eveningWindow: string;
  rainExpectedDuringCommute: boolean;
  commuteRainSummary: string;
  schoolBusSafetyNote: string;
  severeWarnings: AuthoritativeAlert[];
  city: string;
}

export const FamilyCommuteCard: React.FC<FamilyCommuteCardProps> = ({
  morningCommuteStatus,
  eveningCommuteStatus,
  morningWindow,
  eveningWindow,
  rainExpectedDuringCommute,
  commuteRainSummary,
  schoolBusSafetyNote,
  severeWarnings,
  city,
}) => {
  const getStatusBadge = (status: 'Safe' | 'Caution' | 'Hazardous') => {
    switch (status) {
      case 'Safe':
        return 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40';
      case 'Caution':
        return 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40';
      case 'Hazardous':
        return 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';
    }
  };

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#E67E22]/15 text-[#E67E22] flex items-center justify-center border border-[#E67E22]/30">
              <span className="material-symbols-outlined text-[20px]">family_restroom</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Parents &amp; Family Commute
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                School Transit Safety &amp; Rain Bulletins • {city}
              </p>
            </div>
          </div>
          {rainExpectedDuringCommute ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">umbrella</span>
              Rain Alert
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/40">
              Clear Commute
            </span>
          )}
        </div>

        {/* Rain Alert Banner during Commute Hours */}
        {rainExpectedDuringCommute && (
          <div className="mt-3.5 p-3 rounded bg-[#0B72B9]/15 border border-[#0B72B9]/40 flex items-start gap-2.5 text-xs text-[#4FA8E0]">
            <span className="material-symbols-outlined text-[22px] shrink-0 text-[#4FA8E0] mt-0.5 animate-bounce">
              umbrella
            </span>
            <div>
              <strong className="block font-bold text-white">
                School Commute Rain Alert: Carry Umbrellas &amp; Raincoats
              </strong>
              <p className="text-[11px] text-[#D7DEE8] mt-0.5">
                {commuteRainSummary || 'Precipitation expected during school morning drop-off or afternoon pickup windows. Allow 10-15 minutes extra travel time.'}
              </p>
            </div>
          </div>
        )}

        {/* Morning & Afternoon Commute Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Morning Window */}
          <div className="p-3.5 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#F1C40F]">wb_twilight</span>
                Morning Commute
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(morningCommuteStatus)}`}>
                {morningCommuteStatus}
              </span>
            </div>
            <div className="mt-2 text-xs text-[#8A94A6]">
              <span className="font-mono text-[#D7DEE8] font-bold text-sm block">{morningWindow}</span>
              <p className="text-[11px] mt-1 text-[#8A94A6]">
                {morningCommuteStatus === 'Safe'
                  ? 'Favorable transit conditions for school buses, cycling, and walking.'
                  : 'Wet pavement & reduced visibility; exercise caution near school crossings.'}
              </p>
            </div>
          </div>

          {/* Evening Window */}
          <div className="p-3.5 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#FF8C42]">wb_sunny</span>
                Afternoon Commute
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(eveningCommuteStatus)}`}>
                {eveningCommuteStatus}
              </span>
            </div>
            <div className="mt-2 text-xs text-[#8A94A6]">
              <span className="font-mono text-[#D7DEE8] font-bold text-sm block">{eveningWindow}</span>
              <p className="text-[11px] mt-1 text-[#8A94A6]">
                {eveningCommuteStatus === 'Safe'
                  ? 'Normal return commute conditions across all student transport routes.'
                  : 'Elevated surface temperatures or localized showers expected.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bus and Child Transit Safety Advisory */}
        <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#E67E22] text-[18px] shrink-0 mt-0.5">
            directions_bus
          </span>
          <div className="text-xs">
            <p className="text-white font-semibold">
              School Bus &amp; Transit Safety Note:
            </p>
            <p className="text-[11px] text-[#8A94A6] mt-0.5 leading-relaxed">
              {schoolBusSafetyNote}
            </p>
          </div>
        </div>

        {/* Family Warnings if any */}
        {severeWarnings.length > 0 && (
          <div className="mt-3 p-2.5 bg-[#E74C3C]/10 rounded border border-[#E74C3C]/30 text-xs">
            <span className="font-bold text-[#E74C3C] block">Family Hazard Warning:</span>
            <p className="text-[11px] text-[#D7DEE8] mt-0.5">
              {severeWarnings[0].title}: {severeWarnings[0].actionItem}
            </p>
          </div>
        )}
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>IMD Nowcasting &amp; School Commute Met Telemetry</strong></span>
        <span>Safety Index: <strong>Child &amp; School Focus</strong></span>
      </div>
    </div>
  );
};
