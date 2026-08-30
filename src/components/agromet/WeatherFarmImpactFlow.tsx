import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { ArrowRight, CloudRain, Sprout, Bug, Droplet, Tractor, Info } from 'lucide-react';

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
        return 'border-[#F59E0B]/50 bg-[#F59E0B]/5 text-[#F59E0B]';
      case 'action_needed':
        return 'border-[#EF4444]/50 bg-[#EF4444]/5 text-[#EF4444]';
      case 'favorable':
      default:
        return 'border-[#2ECC71]/50 bg-[#2ECC71]/5 text-[#2ECC71]';
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#1E2E40] gap-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              Weather Impact On Your Farm • Agronomic Causal Flow
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Direct causal linkage from atmospheric triggers to soil dynamics, biotic stress, and management decisions.
          </p>
        </div>

        <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-mono">
          <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Biometeorological Model</span>
        </div>
      </div>

      {/* Interactive Horizontal Flow Pipeline */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.step} className="flex flex-col">
              <div className="rounded-xl bg-[#131D28] border border-[#1E2E40] p-4 flex flex-col justify-between h-full hover:border-[#38BDF8]/50 transition-all group">
                <div>
                  {/* Step Number & Category Icon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A2838] border border-[#2A3E54] flex items-center justify-center text-[10px] font-bold text-[#38BDF8] font-mono">
                      0{step.step}
                    </span>
                    <div className="p-1 rounded-lg bg-[#182635]">
                      {getStepIcon(idx)}
                    </div>
                  </div>

                  {/* Step Title & Primary Value Badge */}
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    {step.label}
                  </span>

                  <div className={`px-2 py-1 rounded-md border text-xs font-bold font-mono inline-block mb-2 ${getStatusBorder(step.status)}`}>
                    {step.value}
                  </div>

                  {/* Plain Language Agronomic Rationale */}
                  <p className="text-[11px] text-[#93A4B8] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Micro Indicator */}
                <div className="mt-3 pt-2 border-t border-[#1E2E40]/60 flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>Phase Impact</span>
                  <span className="text-[#38BDF8] font-mono">Stage {idx + 1}/5</span>
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
    </div>
  );
};
