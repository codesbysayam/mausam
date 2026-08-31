import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { ArrowRight, CloudRain, Sprout, Bug, Droplet, Tractor, Info, Sparkles } from 'lucide-react';

interface WeatherFarmImpactFlowProps {
  bulletin: ExtendedAgrometBulletin;
}

export const WeatherFarmImpactFlow: React.FC<WeatherFarmImpactFlowProps> = ({ bulletin }) => {
  const steps = bulletin.impactTimeline;

  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <CloudRain className="w-5 h-5 text-[#38BDF8]" />;
      case 1:
        return <Sprout className="w-5 h-5 text-[#2ECC71]" />;
      case 2:
        return <Bug className="w-5 h-5 text-[#EF4444]" />;
      case 3:
        return <Droplet className="w-5 h-5 text-[#38BDF8]" />;
      case 4:
      default:
        return <Tractor className="w-5 h-5 text-[#A855F7]" />;
    }
  };

  const getStatusBorder = (status: 'favorable' | 'caution' | 'action_needed') => {
    switch (status) {
      case 'caution':
        return 'border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'action_needed':
        return 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]';
      case 'favorable':
      default:
        return 'border-[#2ECC71]/50 bg-[#2ECC71]/10 text-[#2ECC71]';
    }
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#101A26] to-[#0A1017] border border-[#1E2E40] p-6 sm:p-8 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#38BDF8] animate-pulse" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Weather → Farm Impact Causal Pipeline
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Direct biometeorological cause-and-effect linkage from atmospheric drivers to final field action.
          </p>
        </div>

        <div className="text-xs text-[#64748B] flex items-center gap-1.5 font-mono self-start sm:self-auto px-3 py-1 rounded-lg bg-[#14202E] border border-[#22354A]">
          <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Mechanistic Diagnostic Model</span>
        </div>
      </div>

      {/* Connected 5-Step Causal Pipeline */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.step} className="flex flex-col">
              <div className="rounded-2xl bg-[#0B131C] border border-[#1E2E40] p-4 flex flex-col justify-between h-full hover:border-[#38BDF8]/60 transition-all shadow-inner group">
                <div>
                  {/* Step Number & Category Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-6 h-6 rounded-lg bg-[#14202E] border border-[#263C52] flex items-center justify-center text-xs font-mono font-bold text-[#38BDF8]">
                      0{step.step}
                    </span>
                    <div className="p-2 rounded-xl bg-[#142232] border border-[#22354A]">
                      {getStepIcon(idx)}
                    </div>
                  </div>

                  {/* Step Title & Primary Value Badge */}
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono block mb-1">
                    {step.label}
                  </span>

                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono inline-block mb-2.5 ${getStatusBorder(step.status)}`}>
                    {step.value}
                  </div>

                  {/* Plain Language Agronomic Rationale */}
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Micro Step Connector Indicator */}
                <div className="mt-4 pt-2.5 border-t border-[#1E2E40]/80 flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                  <span>Causal Link</span>
                  <span className="text-[#38BDF8] font-bold">Node {idx + 1}/5</span>
                </div>
              </div>

              {/* Mobile connecting arrow */}
              {idx < steps.length - 1 && (
                <div className="flex md:hidden justify-center my-1 text-[#38BDF8]">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
