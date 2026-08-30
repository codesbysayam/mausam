import React from 'react';
import { ModelComparisonMetric } from '../../services/nwpModelService';
import { Layers, ShieldCheck, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ModelConsensusCardProps {
  metrics: ModelComparisonMetric[];
  consensusAgreementPercent: number;
  synopticVerdict: string;
}

export const ModelConsensusCard: React.FC<ModelConsensusCardProps> = ({
  metrics,
  consensusAgreementPercent,
  synopticVerdict,
}) => {
  const confidenceLabel =
    consensusAgreementPercent >= 85
      ? 'High Confidence'
      : consensusAgreementPercent >= 70
      ? 'Moderate Confidence'
      : 'Low Consensus / Model Divergence';

  const confidenceColor =
    consensusAgreementPercent >= 85
      ? 'text-[#22C7A0] bg-[#22C7A0]/15 border-[#22C7A0]/40'
      : consensusAgreementPercent >= 70
      ? 'text-[#FFC857] bg-[#FFC857]/15 border-[#FFC857]/40'
      : 'text-[#EF5350] bg-[#EF5350]/15 border-[#EF5350]/40';

  return (
    <div
      id="forecast-intelligence-consensus-section"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9B51E0]/15 text-[#BB6BD9] flex items-center justify-center shrink-0 border border-[#9B51E0]/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#F4F7FA] tracking-tight">
                Forecast Model Intelligence &amp; Consensus
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9B51E0]/15 text-[#BB6BD9] border border-[#9B51E0]/30">
                Multi-Model Ensemble
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Inter-comparison of operational numerical weather predictions (IMD WRF 3km vs GEFS 12km vs ECMWF 9km)
            </p>
          </div>
        </div>

        {/* Global Confidence Indicator */}
        <div className="flex items-center gap-3 bg-[#071018] px-4 py-2 rounded-xl border border-[#162331] self-start sm:self-auto">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8]">Model Agreement</span>
            <span className="text-xs font-bold text-[#F4F7FA]">{confidenceLabel}</span>
          </div>
          <span className="text-2xl font-black font-mono text-[#22C7A0]">{consensusAgreementPercent}%</span>
        </div>
      </div>

      {/* Clean Visual Model Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => {
          const isHigh = metric.consensusStatus === 'High Agreement';
          const isMod = metric.consensusStatus === 'Moderate Spread';

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex flex-col justify-between gap-3.5"
            >
              {/* Card Header: Parameter & Consensus Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                  {metric.parameter}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isHigh
                      ? 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/30'
                      : isMod
                      ? 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30'
                      : 'bg-[#EF5350]/15 text-[#EF5350] border-[#EF5350]/30'
                  }`}
                >
                  {metric.consensusStatus}
                </span>
              </div>

              {/* 3 Model Readouts Side-by-Side */}
              <div className="grid grid-cols-3 gap-2">
                {/* WRF */}
                <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1499E8]" />
                    <span className="text-[9px] uppercase font-bold text-[#93A4B8]">IMD WRF</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold font-mono text-[#43C7F4] mt-1">
                    {metric.wrfValue}
                  </span>
                </div>

                {/* GEFS */}
                <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#22C7A0]" />
                    <span className="text-[9px] uppercase font-bold text-[#93A4B8]">GEFS Ens</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold font-mono text-[#22C7A0] mt-1">
                    {metric.gefsValue}
                  </span>
                </div>

                {/* ECMWF */}
                <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331] flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
                    <span className="text-[9px] uppercase font-bold text-[#93A4B8]">ECMWF</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold font-mono text-[#FF9F43] mt-1">
                    {metric.ecmwfValue}
                  </span>
                </div>
              </div>

              {/* Spread & Agreement Visual Bar */}
              <div className="flex items-center justify-between text-[11px] text-[#93A4B8] pt-2 border-t border-[#162331]">
                <span>
                  Model Spread: <strong className="text-[#F4F7FA] font-mono">{metric.ensembleSpread}</strong>
                </span>
                <span className="text-[10px] text-[#D1DCE8]">
                  {isHigh ? 'High Model Consensus' : 'Ensemble Variance Observed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consensus Diagnostic Footer Box */}
      <div className="p-4 rounded-xl bg-[#071018] border border-[#162331] flex items-start gap-3 text-xs">
        <CheckCircle2 className="w-4 h-4 text-[#22C7A0] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#F4F7FA]">Synoptic Consensus Diagnostic</span>
          <p className="text-xs text-[#D1DCE8] leading-relaxed">
            {synopticVerdict}
          </p>
          <span className="text-[10px] text-[#93A4B8] mt-1">
            Ensemble spread measures disagreement between distinct physical parameterization schemes across regional grid cells.
          </span>
        </div>
      </div>
    </div>
  );
};
