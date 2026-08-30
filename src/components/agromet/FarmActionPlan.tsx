import React from 'react';
import { ExtendedAgrometBulletin, FarmActionItem } from '../../services/agrometService';
import { Droplet, Sprout, Bug, Tractor, ShieldAlert, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface FarmActionPlanProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const FarmActionPlan: React.FC<FarmActionPlanProps> = ({ bulletin, selectedCrop }) => {
  const actions = bulletin.actionPlan;

  const getIcon = (category: FarmActionItem['category']) => {
    switch (category) {
      case 'irrigation':
        return <Droplet className="w-5 h-5 text-[#38BDF8]" />;
      case 'nutrients':
        return <Sprout className="w-5 h-5 text-[#2ECC71]" />;
      case 'pest':
        return <Bug className="w-5 h-5 text-[#EF4444]" />;
      case 'operations':
        return <Tractor className="w-5 h-5 text-[#A855F7]" />;
      case 'harvest':
      default:
        return <ShieldAlert className="w-5 h-5 text-[#F59E0B]" />;
    }
  };

  const getPriorityBadge = (priority: FarmActionItem['priority']) => {
    switch (priority) {
      case 'High Priority':
        return 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]';
      case 'Caution':
        return 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]';
      case 'Favorable':
        return 'bg-[#2ECC71]/15 border-[#2ECC71]/40 text-[#2ECC71]';
      case 'Actionable':
        return 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8]';
      case 'Moderate':
      default:
        return 'bg-[#A855F7]/15 border-[#A855F7]/40 text-[#A855F7]';
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#131D28] to-[#0D151E] border border-[#1E2E40] p-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-[#2ECC71]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
              Farm Action Plan • What Should I Do Today?
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8] mt-0.5">
            Prioritized advisory actions tailored for <strong className="text-white">{selectedCrop}</strong> in {bulletin.district}.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182635] text-[11px] text-[#38BDF8] border border-[#2A3E54] self-start sm:self-auto font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Validity: Next 24–48 Hours</span>
        </div>
      </div>

      {/* Grid of Actionable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl bg-[#0F1622] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#2ECC71]/40 hover:bg-[#121B2A] transition-all shadow-md group"
          >
            {/* Top Row: Category Title & Priority Pill */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#182635] border border-[#2A3E54]">
                    {getIcon(item.category)}
                  </div>
                  <span className="text-[11px] font-bold text-[#93A4B8] uppercase tracking-wider">
                    {item.title}
                  </span>
                </div>
              </div>

              {/* Priority & Direct Action Banner */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#64748B] uppercase font-mono font-medium">Recommendation</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPriorityBadge(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{item.action}</span>
                </div>
              </div>

              {/* Reason Explanation */}
              <p className="text-xs text-[#CBD5E1] leading-relaxed mb-3 bg-[#141F2D] p-2.5 rounded-lg border border-[#1E2E40]/60">
                {item.reason}
              </p>
            </div>

            {/* Bottom Row: Suitable Window */}
            <div className="pt-2 border-t border-[#1E2E40]/80 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#38BDF8]" />
                Optimal Window:
              </span>
              <span className="font-semibold text-[#38BDF8] font-mono">{item.when}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
