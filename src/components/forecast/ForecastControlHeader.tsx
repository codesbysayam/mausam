import React, { useState } from 'react';
import { NWPModelType, NWP_MODELS } from '../../services/nwpModelService';
import { LocationRecord } from '../../types';
import {
  Cpu,
  Layers,
  Info,
  CheckCircle,
  Radio,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Activity,
} from 'lucide-react';

interface ForecastControlHeaderProps {
  selectedLocation: LocationRecord;
  modelType: NWPModelType;
  onSelectModel: (model: NWPModelType) => void;
  lastUpdated: string;
  isLive?: boolean;
  onExportCSV: () => void;
}

export const ForecastControlHeader: React.FC<ForecastControlHeaderProps> = ({
  selectedLocation,
  modelType,
  onSelectModel,
  lastUpdated,
  isLive = true,
  onExportCSV,
}) => {
  const [showModelSpecs, setShowModelSpecs] = useState(false);
  const activeModelMeta = NWP_MODELS[modelType];

  const lat = typeof selectedLocation.lat === 'number' ? selectedLocation.lat : 20.2961;
  const lng = typeof selectedLocation.lng === 'number' ? selectedLocation.lng : 85.8245;

  return (
    <div
      id="forecast-command-header"
      className="bg-[#151D26] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Top Section: Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-[#314255]/80">
        {/* Left: Meteorological NWP Title & Location Metadata */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Numerical Weather Prediction (NWP)
            </span>
            <span className="text-[11px] text-[#2ECC71] bg-[#2ECC71]/10 px-2 py-0.5 rounded border border-[#2ECC71]/30 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse"></span>
              {isLive ? 'OPERATIONAL RUN' : 'CACHED RUN'}
            </span>
          </div>

          <h1 className="text-white font-black text-xl sm:text-2xl tracking-tight mt-0.5">
            Atmospheric Model Forecast — {selectedLocation.city}, {selectedLocation.state}
          </h1>

          <div className="flex items-center gap-2 text-xs text-[#8A94A6] flex-wrap">
            <span>High-resolution numerical weather guidance</span>
            <span>•</span>
            <span className="text-[#D7DEE8] font-mono">
              {lat.toFixed(2)}°N, {lng.toFixed(2)}°E
            </span>
            <span>•</span>
            <span>Station ID: <strong className="text-[#4FA8E0] font-mono">{selectedLocation.id}</strong></span>
          </div>
        </div>

        {/* Right: Model Selector & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-1 bg-[#1E2733] p-1 rounded-lg border border-[#314255] shadow-inner">
            <span className="text-[10px] text-[#8A94A6] px-2 font-bold uppercase tracking-wider hidden sm:inline">
              MODEL:
            </span>
            {(['WRF', 'GEFS', 'ECMWF'] as const).map((m) => {
              const isSelected = modelType === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectModel(m)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? m === 'WRF'
                        ? 'bg-[#0B72B9] text-white shadow-md shadow-[#0B72B9]/30 ring-1 ring-white/20'
                        : m === 'GEFS'
                        ? 'bg-[#2ECC71] text-black shadow-md shadow-[#2ECC71]/30 ring-1 ring-white/20'
                        : 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/30 ring-1 ring-white/20'
                      : 'text-[#8A94A6] hover:text-white hover:bg-[#151D26]'
                  }`}
                  aria-pressed={isSelected}
                  title={`Switch to ${NWP_MODELS[m].fullName}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>{m}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowModelSpecs(!showModelSpecs)}
            className="p-2 bg-[#1E2733] hover:bg-[#314255] text-[#8A94A6] hover:text-white rounded-lg border border-[#314255] transition-colors flex items-center gap-1 text-xs"
            title="Toggle Model Physics Specifications"
          >
            <Info className="w-4 h-4 text-[#4FA8E0]" />
            <span className="hidden sm:inline font-semibold">Specs</span>
            {showModelSpecs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="p-2 bg-[#1E2733] hover:bg-[#314255] text-[#4FA8E0] hover:text-white rounded-lg border border-[#314255] transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Export full forecast timeseries to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Model Diagnostic Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#1E2733] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold">Active Model</span>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeModelMeta.badgeColor }}
            />
            <span className="text-sm font-bold text-white font-mono">{activeModelMeta.shortName}</span>
          </div>
          <span className="text-[11px] text-[#8A94A6] mt-1">{activeModelMeta.gridResolution}</span>
        </div>

        <div className="bg-[#1E2733] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold">Cycle &amp; Horizon</span>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-[#4FA8E0]" />
            <span className="text-sm font-bold text-white font-mono">{activeModelMeta.updateCycle.split(' ')[0]}</span>
          </div>
          <span className="text-[11px] text-[#8A94A6] mt-1">Horizon: 24h Nowcast to 7-Day Synoptic</span>
        </div>

        <div className="bg-[#1E2733] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold">Data Freshness / Updated</span>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span className="text-xs font-mono font-bold text-[#D7DEE8]">{lastUpdated}</span>
          </div>
          <span className="text-[11px] text-[#2ECC71] font-semibold">Latency: &lt; 5 min (Synchronized)</span>
        </div>

        <div className="bg-[#1E2733] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold">Application Certainty</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span className="text-sm font-bold font-mono text-[#2ECC71]">
              {activeModelMeta.confidenceScore}% High Certainty
            </span>
          </div>
          <span className="text-[10px] text-[#8A94A6]">Application-derived calibration</span>
        </div>
      </div>

      {/* Expandable Model Physics & Mathematical Details */}
      {showModelSpecs && (
        <div className="bg-[#1E2733] p-4 rounded-lg border border-[#314255] text-xs flex flex-col gap-3 transition-all">
          <div className="flex items-center justify-between border-b border-[#314255] pb-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#4FA8E0] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {activeModelMeta.id} Dynamical Core &amp; Microphysics Schemes
            </h4>
            <span className="text-[#8A94A6] text-[10px]">
              Operational Numerical Model Architecture
            </span>
          </div>
          <p className="text-[#D7DEE8] leading-relaxed">
            {activeModelMeta.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
            <div className="bg-[#151D26] p-2.5 rounded border border-[#314255]">
              <strong className="text-white block mb-0.5">Core Formulation:</strong>
              <span className="text-[#8A94A6]">{activeModelMeta.coreType}</span>
            </div>
            <div className="bg-[#151D26] p-2.5 rounded border border-[#314255]">
              <strong className="text-white block mb-0.5">Physics Parameterizations:</strong>
              <span className="text-[#8A94A6]">{activeModelMeta.physicsSchemes}</span>
            </div>
          </div>
          <div className="text-[11px] text-[#8A94A6]">
            <strong className="text-white">Primary Synoptic Application: </strong>
            {activeModelMeta.primaryApplication}
          </div>
        </div>
      )}
    </div>
  );
};
