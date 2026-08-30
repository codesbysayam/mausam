import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { Bug, AlertTriangle, ShieldCheck, Leaf, Eye, Info, Activity } from 'lucide-react';
import { AgrometTooltip } from './AgrometTooltip';

interface PestDiseaseWatchProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const PestDiseaseWatch: React.FC<PestDiseaseWatchProps> = ({ bulletin, selectedCrop }) => {
  const watch = bulletin.pestDiseaseWatch;

  const getMeterColor = (level: string) => {
    switch (level) {
      case 'Severe':
        return 'bg-[#EF4444] text-[#EF4444]';
      case 'High':
        return 'bg-[#F97316] text-[#F97316]';
      case 'Moderate':
        return 'bg-[#F59E0B] text-[#F59E0B]';
      case 'Low':
      default:
        return 'bg-[#2ECC71] text-[#2ECC71]';
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-[#EF4444]" />
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
              Pest &amp; Disease Surveillance • Biometeorological Watch
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Atmosphere-driven epidemiology risk modeling for <strong className="text-white">{selectedCrop}</strong> in {bulletin.district}.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5" />
          <span>Active Risk: {watch.overallRisk}</span>
        </div>
      </div>

      {/* Visual Risk Meter & Risk Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Left (5 Cols): Visual Risk Meter */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#131D28] border border-[#1E2E40] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Pathogen Conduciveness Index
            </span>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-black font-mono text-white">
                {watch.overallRisk} Threat Level
              </span>
            </div>

            {/* 4-Step Stepped Risk Gauge */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <div className={`h-2.5 rounded-sm ${watch.overallRisk === 'Low' || watch.overallRisk === 'Moderate' || watch.overallRisk === 'High' || watch.overallRisk === 'Severe' ? 'bg-[#2ECC71]' : 'bg-[#1E293B]'}`} />
              <div className={`h-2.5 rounded-sm ${watch.overallRisk === 'Moderate' || watch.overallRisk === 'High' || watch.overallRisk === 'Severe' ? 'bg-[#F59E0B]' : 'bg-[#1E293B]'}`} />
              <div className={`h-2.5 rounded-sm ${watch.overallRisk === 'High' || watch.overallRisk === 'Severe' ? 'bg-[#F97316]' : 'bg-[#1E293B]'}`} />
              <div className={`h-2.5 rounded-sm ${watch.overallRisk === 'Severe' ? 'bg-[#EF4444]' : 'bg-[#1E293B]'}`} />
            </div>

            <div className="flex justify-between text-[9px] text-[#64748B] font-mono uppercase">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Primary Biotic Threat Card */}
          <div className="mt-4 pt-3 border-t border-[#1E2E40]">
            <span className="text-[10px] text-[#EF4444] uppercase font-bold tracking-wider block">
              Primary Threat Under Surveillance
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {watch.primaryConcern}
            </h4>
            {watch.scientificName && (
              <span className="text-xs text-[#38BDF8] italic font-mono block">
                {watch.scientificName}
              </span>
            )}
          </div>
        </div>

        {/* Right (7 Cols): Risk Drivers & Etiology */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#131D28] border border-[#1E2E40] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Microclimate Risk Drivers
            </span>

            {/* Drivers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
              {watch.riskDrivers.map((driver) => (
                <div key={driver.name} className="p-2.5 rounded-lg bg-[#0F1622] border border-[#1E2E40]">
                  <span className="text-[10px] text-[#64748B] block truncate">{driver.name}</span>
                  <span className="font-bold text-white font-mono text-sm block mt-0.5">{driver.value}</span>
                  <span className={`text-[9px] uppercase font-semibold ${driver.impact === 'high' ? 'text-[#EF4444]' : driver.impact === 'medium' ? 'text-[#F59E0B]' : 'text-[#2ECC71]'}`}>
                    {driver.impact} impact
                  </span>
                </div>
              ))}
            </div>

            {/* Etiology Description */}
            <p className="text-xs text-[#CBD5E1] leading-relaxed bg-[#0F1622] p-2.5 rounded-lg border border-[#1E2E40]">
              <strong className="text-white">Weather Etiology: </strong>
              {watch.etiology}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1E2E40] flex items-center justify-between text-xs">
            <span className="text-[#64748B] flex items-center gap-1">
              <AgrometTooltip term="Economic Threshold Level (ETL)" explanation="The population density or symptom incidence at which control measures should be initiated to prevent economic crop damage.">
                <span>Economic Threshold (ETL):</span>
              </AgrometTooltip>
            </span>
            <span className="font-semibold text-[#F59E0B] font-mono text-[11px]">{watch.etlThreshold}</span>
          </div>
        </div>
      </div>

      {/* Integrated Pest Management (IPM) Action Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {/* 1. Immediate Cultural Action */}
        <div className="p-3.5 rounded-xl bg-[#111A24] border border-[#1E2E40]">
          <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold text-[11px] uppercase mb-1">
            <Eye className="w-3.5 h-3.5" />
            1. Field Action &amp; Scouting
          </div>
          <p className="text-[#CBD5E1] leading-relaxed">
            {watch.immediateAction}
          </p>
        </div>

        {/* 2. Organic Biological Remedy */}
        <div className="p-3.5 rounded-xl bg-[#111A24] border border-[#1E2E40]">
          <div className="flex items-center gap-1.5 text-[#2ECC71] font-bold text-[11px] uppercase mb-1">
            <Leaf className="w-3.5 h-3.5" />
            2. Bio-Agent / Organic Control
          </div>
          <p className="text-[#CBD5E1] leading-relaxed">
            {watch.organicRemedy}
          </p>
        </div>

        {/* 3. Recommended Chemical Formulation */}
        <div className="p-3.5 rounded-xl bg-[#111A24] border border-[#1E2E40]">
          <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold text-[11px] uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            3. Chemical Intervention (If Above ETL)
          </div>
          <p className="text-[#CBD5E1] leading-relaxed">
            {watch.chemicalControl}
          </p>
        </div>
      </div>
    </div>
  );
};
