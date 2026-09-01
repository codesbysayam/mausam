import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Droplets,
  SprayCan,
  Sprout,
  Tractor,
  Wheat,
  Clock,
  Zap,
  Info,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import {
  CropType,
  PhenologicalStage,
  evaluateFarmOperations,
} from '../../services/agronomicEngine';

interface TodaysFarmActionCenterProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const TodaysFarmActionCenter: React.FC<TodaysFarmActionCenterProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const evaluation = evaluateFarmOperations(weather, selectedCrop, selectedStage);

  const iconMap: Record<string, React.ElementType> = {
    Droplets: Droplets,
    SprayCan: SprayCan,
    Sprout: Sprout,
    Tractor: Tractor,
    Wheat: Wheat,
  };

  const getStatusBadge = (status: string, color: string) => {
    switch (status) {
      case 'RECOMMENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            RECOMMENDED
          </span>
        );
      case 'CAUTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-mono font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            CAUTION
          </span>
        );
      case 'DEFER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            DEFER
          </span>
        );
      case 'NOT RECOMMENDED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono font-bold">
            <XCircle className="w-3.5 h-3.5" />
            NOT RECOMMENDED
          </span>
        );
    }
  };

  const getOverallBadge = (status: string) => {
    if (status === 'OPTIMAL') {
      return {
        bg: 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]',
        icon: CheckCircle2,
        title: 'FIELD OPERATIONS: OPTIMAL',
      };
    }
    if (status === 'CAUTION') {
      return {
        bg: 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]',
        icon: AlertTriangle,
        title: 'FIELD OPERATIONS: CAUTION',
      };
    }
    return {
      bg: 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]',
      icon: ShieldAlert,
      title: 'FIELD OPERATIONS: RESTRICTED',
    };
  };

  const overall = getOverallBadge(evaluation.overallStatus);
  const OverallIcon = overall.icon;

  return (
    <section
      id="agromet-action-center"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header & Overall Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              TODAY'S FARM ACTION CENTER
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Tactical field recommendations for <span className="text-[#10B981] font-bold">{selectedCrop}</span> ({selectedStage} stage) in <span className="text-[#38BDF8] font-bold">{district}</span>
          </p>
        </div>

        {/* Big Overall Recommendation Banner */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${overall.bg}`}>
          <OverallIcon className="w-5 h-5 shrink-0" />
          <div>
            <div className="text-xs font-mono font-black tracking-wider uppercase">
              {overall.title}
            </div>
            <div className="text-[11px] text-[#CBD5E1] font-sans">
              {evaluation.overallReason}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Actionable Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {evaluation.operations.map((op) => {
          const Icon = iconMap[op.icon] || Droplets;

          return (
            <div
              key={op.id}
              id={`farm-action-${op.id}`}
              className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 flex flex-col justify-between space-y-4 hover:border-[#334155] transition-all shadow-md"
            >
              {/* Header: Icon, Name & Badge */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-[#1E293B] text-[#38BDF8]">
                    <Icon className="w-4 h-4" />
                  </div>
                  {getStatusBadge(op.status, op.statusColor)}
                </div>

                <div>
                  <h3 className="text-sm font-bold font-mono text-white tracking-wide">
                    {op.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[#38BDF8] mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{op.recommendedWindow}</span>
                  </div>
                </div>
              </div>

              {/* Rationale and Weather Trigger */}
              <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs">
                <p className="text-[#CBD5E1] leading-relaxed text-[11px]">
                  {op.reason}
                </p>

                <div className="bg-[#090D16] border border-[#1E293B] rounded-lg p-2 text-[10px] font-mono text-[#94A3B8] flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Trigger:</strong> {op.weatherTrigger}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
