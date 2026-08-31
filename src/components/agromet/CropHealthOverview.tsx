import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Sprout,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Droplets,
  Bug,
  Sun,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface CropHealthOverviewProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
  onViewDetailedAdvisory: (crop: string) => void;
}

export const CropHealthOverview: React.FC<CropHealthOverviewProps> = ({
  bulletin,
  selectedCrop,
  onSelectCrop,
  onViewDetailedAdvisory,
}) => {
  const cropList = bulletin.crops || [];

  return (
    <section id="crop-health-overview-section" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E2E40]">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#10B981]">
              District Phenology &amp; Biotic Status
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Crop Health Overview
          </h2>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">
          Stage-specific biological monitoring across {bulletin.district}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cropList.map((crop) => {
          const isSelected = crop.cropName === selectedCrop;
          const isHighRisk = crop.riskLevel === 'High';
          const isModerateRisk = crop.riskLevel === 'Moderate';

          const healthStatus = isHighRisk ? 'Vulnerable' : isModerateRisk ? 'Fair / Stable' : 'Good Vigour';
          const healthColor = isHighRisk ? '#EF4444' : isModerateRisk ? '#F59E0B' : '#10B981';

          return (
            <div
              key={crop.cropName}
              className={`p-5 rounded-3xl transition-all flex flex-col justify-between space-y-4 border ${
                isSelected
                  ? 'bg-[#0E1B29] border-[#10B981] shadow-2xl ring-1 ring-[#10B981]/50'
                  : 'bg-[#0B131D] border-[#1E2E40] hover:border-[#38BDF8]/50'
              }`}
            >
              {/* Card Header: Crop Name & Stage */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {crop.cropName}
                    </h3>
                    <span className="text-xs font-mono text-[#38BDF8] block">
                      Stage: {crop.stage}
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{
                      color: healthColor,
                      backgroundColor: `${healthColor}15`,
                      borderColor: `${healthColor}35`,
                    }}
                  >
                    {healthStatus}
                  </span>
                </div>

                {crop.riskAlert && (
                  <p className="text-xs text-[#94A3B8] mt-2 italic bg-[#080E16] p-2.5 rounded-xl border border-[#1E2E40]">
                    &quot;{crop.riskAlert}&quot;
                  </p>
                )}
              </div>

              {/* Status Grid: Water, Pest, Weather Suitability */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-[#080E16] border border-[#1E2E40]">
                  <span className="text-[#64748B] block mb-0.5">Water Need</span>
                  <span className="font-bold text-[#38BDF8]">Moderate</span>
                </div>
                <div className="p-2 rounded-xl bg-[#080E16] border border-[#1E2E40]">
                  <span className="text-[#64748B] block mb-0.5">Pest Pressure</span>
                  <span
                    className="font-bold"
                    style={{ color: healthColor }}
                  >
                    {crop.riskLevel}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#080E16] border border-[#1E2E40]">
                  <span className="text-[#64748B] block mb-0.5">Suitability</span>
                  <span className="font-bold text-[#10B981]">
                    {isHighRisk ? 'Caution' : 'Optimal'}
                  </span>
                </div>
              </div>

              {/* View Crop Advisory Trigger */}
              <button
                type="button"
                onClick={() => {
                  onSelectCrop(crop.cropName);
                  onViewDetailedAdvisory(crop.cropName);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#10B981] text-[#07130E] hover:bg-[#0EA271]'
                    : 'bg-[#131E2B] text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8] hover:text-[#0A1017]'
                }`}
              >
                <span>View {crop.cropName.split(' ')[0]} Advisory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
