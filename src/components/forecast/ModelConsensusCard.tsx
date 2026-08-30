import React from 'react';
import { ModelComparisonMetric } from '../../services/nwpModelService';
import { Layers, CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';

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
  return (
    <div
      id="forecast-model-consensus-section"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#314255]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Forecast Model Consensus &amp; Multi-Model Ensemble
            </h2>
            <p className="text-xs text-[#8A94A6]">
              Inter-comparison of operational numerical weather predictions (IMD WRF vs GEFS vs ECMWF)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#151D26] px-3 py-1.5 rounded-lg border border-[#314255] self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
          <span className="text-xs font-bold text-white">
            Model Agreement: <strong className="text-[#2ECC71] font-mono">{consensusAgreementPercent}%</strong>
          </span>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#151D26] border-b border-[#314255] text-[#8A94A6]">
              <th className="p-3 font-bold">Meteorological Parameter</th>
              <th className="p-3 font-bold text-[#4FA8E0]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0B72B9]" />
                  <span>IMD WRF (3km)</span>
                </div>
              </th>
              <th className="p-3 font-bold text-[#2ECC71]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                  <span>GEFS Ensemble (12km)</span>
                </div>
              </th>
              <th className="p-3 font-bold text-[#E67E22]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E67E22]" />
                  <span>ECMWF IFS (9km)</span>
                </div>
              </th>
              <th className="p-3 font-bold">Model Spread</th>
              <th className="p-3 font-bold">Consensus Verdict</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, idx) => {
              const isHighAgree = row.consensusStatus === 'High Agreement';
              const isModSpread = row.consensusStatus === 'Moderate Spread';

              return (
                <tr
                  key={idx}
                  className="border-b border-[#314255]/50 hover:bg-[#151D26] transition-colors"
                >
                  <td className="p-3 font-medium text-white">
                    {row.parameter}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#4FA8E0]">
                    {row.wrfValue}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#2ECC71]">
                    {row.gefsValue}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#E67E22]">
                    {row.ecmwfValue}
                  </td>
                  <td className="p-3 font-mono text-[#D7DEE8]">
                    <span className="px-1.5 py-0.5 rounded bg-[#151D26] border border-[#314255]">
                      {row.ensembleSpread}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHighAgree
                          ? 'bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30'
                          : isModSpread
                          ? 'bg-[#F1C40F]/15 text-[#F1C40F] border border-[#F1C40F]/30'
                          : 'bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30'
                      }`}
                    >
                      {row.consensusStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Spread Explanation Note & Synoptic Diagnostic */}
      <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col gap-2 text-xs">
        <div className="flex items-start gap-2 text-[#D7DEE8]">
          <CheckCircle2 className="w-4 h-4 text-[#4FA8E0] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Synoptic Consensus Diagnostic: </strong>
            <span>{synopticVerdict}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#8A94A6] pt-1 border-t border-[#314255]/60">
          <HelpCircle className="w-3.5 h-3.5 text-[#8A94A6]" />
          <span>
            Spread indicates disagreement between available model forecasts. It is not a probability of forecast accuracy.
          </span>
        </div>
      </div>
    </div>
  );
};
