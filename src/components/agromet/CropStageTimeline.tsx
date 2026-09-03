import React from 'react';
import {
  Sprout,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { PhenologicalStage, CROP_STAGES, CropType } from '../../services/agronomicEngine';

interface CropStageTimelineProps {
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  onStageSelect: (stage: PhenologicalStage) => void;
  sowingDate?: Date;
}

export const CropStageTimeline: React.FC<CropStageTimelineProps> = ({
  selectedCrop,
  selectedStage,
  onStageSelect,
  sowingDate,
}) => {
  const currentIdx = CROP_STAGES.indexOf(selectedStage);

  // Approximate days per stage based on standard 120-day crop cycle
  const stageDurations = [7, 14, 21, 28, 21, 14, 10, 5]; // Cumulative days offset

  return (
    <section
      id="agromet-stage-timeline"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              CROP PHENOLOGICAL LIFECYCLE TIMELINE
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Interactive developmental stages for {selectedCrop}. Click any stage to recalibrate agronomic intelligence.
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-3 py-1.5 rounded-lg w-fit">
          Active Stage: <strong className="text-white">{selectedStage}</strong>
        </div>
      </div>

      {/* 8-Stage Interactive Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {CROP_STAGES.map((stage, idx) => {
          const isSelected = stage === selectedStage;
          const isPassed = idx < currentIdx;

          // Estimate date for stage if sowingDate is provided
          let stageEstimatedDate = '';
          if (sowingDate) {
            let daysOffset = 0;
            for (let i = 0; i < idx; i++) {
              daysOffset += stageDurations[i] || 14;
            }
            const dateObj = new Date(sowingDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
            stageEstimatedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }

          return (
            <button
              key={stage}
              id={`stage-step-btn-${idx}`}
              onClick={() => onStageSelect(stage)}
              className={`rounded-xl p-3 text-left transition-all border flex flex-col justify-between space-y-2.5 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#1E293B] border-[#10B981] ring-1 ring-[#10B981]/50 shadow-lg'
                  : isPassed
                  ? 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155] opacity-80'
                  : 'bg-[#0F172A]/60 border-[#1E293B] hover:border-[#334155] opacity-60'
              }`}
            >
              {/* Top Step Number & Status Indicator */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#10B981] text-black'
                      : isPassed
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  {idx + 1}
                </span>
                {isSelected && (
                  <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                )}
                {isPassed && !isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                )}
              </div>

              {/* Stage Name */}
              <div>
                <div
                  className={`text-xs font-mono font-bold leading-tight ${
                    isSelected ? 'text-[#10B981]' : 'text-white group-hover:text-[#38BDF8]'
                  }`}
                >
                  {stage}
                </div>
                <div className="text-[9px] font-mono text-[#64748B] mt-0.5">
                  {stageEstimatedDate ? `Est: ${stageEstimatedDate}` : (idx === 0 ? 'Start Phase' : idx === 7 ? 'End Phase' : `Phase ${idx + 1}`)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
