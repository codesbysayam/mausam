import React from 'react';
import { ExtendedAgrometBulletin, FarmActionItem } from '../../services/agrometService';
import {
  Droplet,
  Sprout,
  Bug,
  Tractor,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface FarmActionPlanProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const FarmActionPlan: React.FC<FarmActionPlanProps> = ({ bulletin, selectedCrop }) => {
  const actions = bulletin.actionPlan;

  const getCardTheme = (category: FarmActionItem['category'], priority: FarmActionItem['priority']) => {
    switch (category) {
      case 'irrigation':
        return {
          icon: <Droplet className="w-6 h-6 text-[#38BDF8]" />,
          statusColor: 'text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/40',
          accentBorder: 'border-l-4 border-l-[#38BDF8]',
          badgeText: 'WAIT / POSTPONE',
          categoryTitle: 'IRRIGATION DECISION',
        };
      case 'operations':
        return {
          icon: <Tractor className="w-6 h-6 text-[#2ECC71]" />,
          statusColor: 'text-[#2ECC71] bg-[#2ECC71]/15 border-[#2ECC71]/40',
          accentBorder: 'border-l-4 border-l-[#2ECC71]',
          badgeText: 'GOOD AFTER 10 AM',
          categoryTitle: 'FIELD WORK & MACHINERY',
        };
      case 'pest':
        return {
          icon: <Bug className="w-6 h-6 text-[#EF4444]" />,
          statusColor: 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/40',
          accentBorder: 'border-l-4 border-l-[#EF4444]',
          badgeText: 'WATCH & SCOUT',
          categoryTitle: 'CROP MONITORING & IPM',
        };
      case 'nutrients':
      default:
        return {
          icon: <Sprout className="w-6 h-6 text-[#F59E0B]" />,
          statusColor: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40',
          accentBorder: 'border-l-4 border-l-[#F59E0B]',
          badgeText: 'DELAY NPK SPLIT',
          categoryTitle: 'FERTILIZER & SPRAYS',
        };
    }
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#142130] via-[#0E1724] to-[#0A1017] border-2 border-[#2A405A] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2ECC71]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#2A405A] gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2ECC71] flex items-center justify-center text-[#0A1017] shadow-lg shadow-[#2ECC71]/25">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase">
              What Should I Do Today?
            </h2>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1 font-normal">
            Direct, prioritized agricultural recommendations for <strong className="text-white font-semibold">{selectedCrop}</strong> in {bulletin.district}.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#182736] border border-[#2F4763] text-xs text-[#38BDF8] font-mono font-semibold self-start sm:self-auto shadow-sm">
          <Clock className="w-4 h-4" />
          <span>Execution Window: Next 24 Hours</span>
        </div>
      </div>

      {/* 4 Large High-Contrast Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {actions.slice(0, 4).map((item, idx) => {
          const theme = getCardTheme(item.category, item.priority);

          return (
            <div
              key={item.id || idx}
              className={`rounded-2xl bg-[#0F1722] border border-[#1E2E40] hover:border-[#38BDF8]/60 p-5 flex flex-col justify-between transition-all duration-200 shadow-xl group hover:scale-[1.01]`}
            >
              <div>
                {/* Card Top Category & Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#162434] border border-[#23384E]">
                      {theme.icon}
                    </div>
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
                      {theme.categoryTitle}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Pill (Dominant) */}
                <div className="my-3">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block mb-1 font-semibold">
                    Status
                  </span>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-black font-mono tracking-tight flex items-center justify-between ${theme.statusColor}`}>
                    <span>{theme.badgeText}</span>
                    <span className="text-[10px] font-normal uppercase opacity-80">{item.priority}</span>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="my-3">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block mb-1 font-semibold">
                    Action
                  </span>
                  <p className="text-sm font-bold text-white leading-snug">
                    {item.action}
                  </p>
                </div>

                {/* Agronomic Reason */}
                <div className="my-3 bg-[#131F2E] p-3 rounded-xl border border-[#1E2E40]/80">
                  <span className="text-[10px] uppercase font-mono text-[#38BDF8] block mb-1 font-bold">
                    Agronomic Reason
                  </span>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              </div>

              {/* Time Execution Window */}
              <div className="pt-3 mt-2 border-t border-[#1E2E40] flex items-center justify-between text-xs">
                <span className="text-[#64748B] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Best Window:
                </span>
                <span className="font-bold text-[#38BDF8] font-mono bg-[#162434] px-2 py-0.5 rounded-md border border-[#23384E]">
                  {item.when}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
