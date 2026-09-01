import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from 'lucide-react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';

interface OfficialAgrometAdvisoriesProps {
  bulletin: ExtendedAgrometBulletin;
}

export const OfficialAgrometAdvisories: React.FC<OfficialAgrometAdvisoriesProps> = ({
  bulletin,
}) => {
  const [expandedCrop, setExpandedCrop] = useState<string | null>(bulletin.crops[0]?.cropName || null);

  return (
    <section
      id="agromet-official-advisories"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              OFFICIAL GRAMIN KRISHI MAUSAM SEWA (GKMS) BULLETINS
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            State Agricultural University &amp; India Meteorological Department (IMD) Agromet Advisory Node
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            VALIDATED AMFU BULLETIN
          </span>
        </div>
      </div>

      {/* Bulletin Metadata Bar */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-[#94A3B8] block text-[10px] uppercase">Bulletin Number:</span>
          <span className="text-white font-bold">{bulletin.bulletinNo}</span>
        </div>
        <div>
          <span className="text-[#94A3B8] block text-[10px] uppercase">Agromet Field Unit:</span>
          <span className="text-white font-bold truncate block">{bulletin.amfuUnit}</span>
        </div>
        <div>
          <span className="text-[#94A3B8] block text-[10px] uppercase">Issue Date:</span>
          <span className="text-white font-bold">{bulletin.issueDate} ({bulletin.issueDay})</span>
        </div>
        <div>
          <span className="text-[#94A3B8] block text-[10px] uppercase">Validity Period:</span>
          <span className="text-[#10B981] font-bold">{bulletin.validPeriod}</span>
        </div>
      </div>

      {/* Synoptic Weather Synopsis */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-2">
        <h3 className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
          Official Weather Synopsis &amp; Synoptic Overview
        </h3>
        <p className="text-xs text-[#CBD5E1] leading-relaxed">
          {bulletin.weatherSummary}
        </p>
      </div>

      {/* Crop-by-Crop Advisory Accordion */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-[#94A3B8] uppercase tracking-wider px-1">
          Crop-Wise Stage Specific Directives ({bulletin.crops.length} Monitored Crops)
        </h3>

        <div className="space-y-3">
          {bulletin.crops.map((crop) => {
            const isExpanded = expandedCrop === crop.cropName;

            return (
              <div
                key={crop.cropName}
                className="rounded-xl bg-[#0F172A] border border-[#1E293B] overflow-hidden transition-all"
              >
                {/* Header button */}
                <button
                  onClick={() => setExpandedCrop(isExpanded ? null : crop.cropName)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1E293B]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-white">
                      {crop.cropName}
                    </span>
                    <span className="text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
                      Stage: {crop.stage}
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${crop.riskLevel === 'High' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'}`}>
                      Risk: {crop.riskLevel}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#1E293B] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1 bg-[#090D16] p-3 rounded-lg border border-[#1E293B]">
                      <strong className="text-[#10B981] font-mono text-[11px] block uppercase">
                        Sowing &amp; Field Prep:
                      </strong>
                      <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                        {crop.sowingAdvice}
                      </p>
                    </div>

                    <div className="space-y-1 bg-[#090D16] p-3 rounded-lg border border-[#1E293B]">
                      <strong className="text-[#06B6D4] font-mono text-[11px] block uppercase">
                        Irrigation Management:
                      </strong>
                      <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                        {crop.irrigationAdvice}
                      </p>
                    </div>

                    <div className="space-y-1 bg-[#090D16] p-3 rounded-lg border border-[#1E293B]">
                      <strong className="text-[#F59E0B] font-mono text-[11px] block uppercase">
                        Nutrient &amp; Fertilizer:
                      </strong>
                      <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                        {crop.fertilizerAdvice}
                      </p>
                    </div>

                    <div className="space-y-1 bg-[#090D16] p-3 rounded-lg border border-[#1E293B]">
                      <strong className="text-[#EF4444] font-mono text-[11px] block uppercase">
                        Pest &amp; Disease Defense:
                      </strong>
                      <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                        {crop.pestDiseaseAdvice}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
