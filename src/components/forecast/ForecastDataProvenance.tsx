import React from 'react';
import { Database, ShieldCheck, Cpu, Globe2, Activity } from 'lucide-react';

interface ForecastDataProvenanceProps {
  lastUpdated: string;
  isLive?: boolean;
  stationId?: string;
  modelName: string;
}

export const ForecastDataProvenance: React.FC<ForecastDataProvenanceProps> = ({
  lastUpdated,
  isLive = true,
  stationId = '42971',
  modelName,
}) => {
  return (
    <div
      id="forecast-data-provenance-footer"
      className="rounded-2xl bg-[#071018] border border-[#162331] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#93A4B8]"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-medium text-[#D1DCE8]">
          <Database className="w-3.5 h-3.5 text-[#1499E8]" />
          <span>Provenance Architecture:</span>
        </div>

        <span className="bg-[#0B141E] px-2 py-0.5 rounded border border-[#162331] text-[11px] font-mono text-[#F4F7FA]">
          OBSERVATION: AWS #{stationId}
        </span>

        <span className="bg-[#0B141E] px-2 py-0.5 rounded border border-[#162331] text-[11px] font-mono text-[#43C7F4]">
          MODEL: {modelName}
        </span>

        <span className="bg-[#0B141E] px-2 py-0.5 rounded border border-[#162331] text-[11px] font-mono text-[#22C7A0]">
          SYNTHESIS: MAUSAM Engine
        </span>
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="w-2 h-2 rounded-full bg-[#22C7A0] animate-pulse" />
        <span>Updated: <strong className="text-[#F4F7FA]">{lastUpdated}</strong></span>
      </div>
    </div>
  );
};
