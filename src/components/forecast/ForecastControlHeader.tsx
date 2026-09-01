import React, { useState } from 'react';
import { NWPModelType, NWP_MODELS, StructuredModelForecast } from '../../services/nwpModelService';
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
  Database,
  CloudRain,
  Thermometer,
  Wind,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface ForecastControlHeaderProps {
  selectedLocation: LocationRecord;
  modelType: NWPModelType;
  onSelectModel: (model: NWPModelType) => void;
  lastUpdated: string;
  isLive?: boolean;
  onExportCSV: () => void;
  structuredForecast?: StructuredModelForecast | null;
  isLoadingModel?: boolean;
}

export const ForecastControlHeader: React.FC<ForecastControlHeaderProps> = ({
  selectedLocation,
  modelType,
  onSelectModel,
  lastUpdated,
  isLive = true,
  onExportCSV,
  structuredForecast,
  isLoadingModel = false,
}) => {
  const [showModelSpecs, setShowModelSpecs] = useState(false);
  const activeModelMeta = NWP_MODELS[modelType];

  const lat = typeof selectedLocation.lat === 'number' ? selectedLocation.lat : 20.2961;
  const lng = typeof selectedLocation.lng === 'number' ? selectedLocation.lng : 85.8245;

  const totalQpf = structuredForecast?.metadata?.totalQpf24h !== undefined
    ? `${structuredForecast.metadata.totalQpf24h} mm`
    : 'N/A';
  const maxTemp = structuredForecast?.metadata?.maxTemp24h !== undefined
    ? `${structuredForecast.metadata.maxTemp24h}°C`
    : 'N/A';
  const maxGust = structuredForecast?.metadata?.maxWindGust24h !== undefined
    ? `${structuredForecast.metadata.maxWindGust24h} km/h`
    : 'N/A';

  return (
    <div
      id="forecast-command-header"
      className="bg-[#0B141E] border border-[#162331] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-5 relative overflow-hidden"
    >
      {/* Top Section: Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#162331]">
        {/* Left: Meteorological NWP Title & Location Metadata */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#1499E8]/15 text-[#43C7F4] border border-[#1499E8]/30 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1.5 shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
              Numerical Weather Prediction (NWP)
            </span>
            <span className="text-[11px] text-[#22C7A0] bg-[#22C7A0]/10 px-2.5 py-0.5 rounded-full border border-[#22C7A0]/30 font-mono font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C7A0] animate-pulse"></span>
              {isLoadingModel ? 'INITIALIZING NWP RUN...' : isLive ? 'OPERATIONAL GRID RUN' : 'CACHED MODEL RUN'}
            </span>
          </div>

          <h1 className="text-[#F4F7FA] font-black text-xl sm:text-2xl tracking-tight mt-0.5">
            Atmospheric Model Forecast — {selectedLocation.city}, {selectedLocation.state}
          </h1>

          <div className="flex items-center gap-2 text-xs text-[#93A4B8] flex-wrap">
            <span>High-resolution grid simulation</span>
            <span>•</span>
            <span className="text-[#D1DCE8] font-mono">
              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </span>
            <span>•</span>
            <span>Station ID: <strong className="text-[#43C7F4] font-mono">{selectedLocation.id}</strong></span>
          </div>
        </div>

        {/* Right: Model Selector & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-1 bg-[#071018] p-1.5 rounded-xl border border-[#162331] shadow-inner">
            <span className="text-[10px] text-[#93A4B8] px-2 font-bold uppercase tracking-wider hidden sm:inline">
              MODEL:
            </span>
            {(['WRF', 'GEFS', 'ECMWF'] as const).map((m) => {
              const isSelected = modelType === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectModel(m)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? m === 'WRF'
                        ? 'bg-[#1499E8] text-white shadow-lg shadow-[#1499E8]/30 ring-1 ring-white/20'
                        : m === 'GEFS'
                        ? 'bg-[#22C7A0] text-black shadow-lg shadow-[#22C7A0]/30 ring-1 ring-black/20'
                        : 'bg-[#FF9F43] text-white shadow-lg shadow-[#FF9F43]/30 ring-1 ring-white/20'
                      : 'text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111F30]'
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
            className="p-2.5 bg-[#071018] hover:bg-[#111F30] text-[#93A4B8] hover:text-[#F4F7FA] rounded-xl border border-[#162331] transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            title="Toggle Model Physics Specifications"
          >
            <Info className="w-4 h-4 text-[#43C7F4]" />
            <span className="hidden sm:inline font-semibold">Specs</span>
            {showModelSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="p-2.5 bg-[#071018] hover:bg-[#111F30] text-[#43C7F4] hover:text-[#F4F7FA] rounded-xl border border-[#162331] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Export full forecast timeseries to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Model Diagnostic Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#071018] p-3.5 rounded-xl border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] text-[#93A4B8] uppercase font-bold">Active Model &amp; Grid</span>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeModelMeta.badgeColor }}
            />
            <span className="text-sm font-bold text-[#F4F7FA] font-mono">{activeModelMeta.shortName}</span>
          </div>
          <span className="text-[11px] text-[#93A4B8] mt-1">{activeModelMeta.gridResolution}</span>
        </div>

        <div className="bg-[#071018] p-3.5 rounded-xl border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] text-[#93A4B8] uppercase font-bold">Cycle &amp; Horizon</span>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-[#43C7F4]" />
            <span className="text-sm font-bold text-[#F4F7FA] font-mono">{activeModelMeta.updateCycle.split(' ')[0]} Run</span>
          </div>
          <span className="text-[11px] text-[#93A4B8] mt-1">Horizon: 24h Nowcast to 7-Day Synoptic</span>
        </div>

        <div className="bg-[#071018] p-3.5 rounded-xl border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] text-[#93A4B8] uppercase font-bold">Data Freshness / Updated</span>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="w-3.5 h-3.5 text-[#22C7A0]" />
            <span className="text-xs font-mono font-bold text-[#D1DCE8]">{lastUpdated}</span>
          </div>
          <span className="text-[11px] text-[#22C7A0] font-semibold">Latency: &lt; 5 min (Synchronized)</span>
        </div>

        <div className="bg-[#071018] p-3.5 rounded-xl border border-[#162331] flex flex-col justify-between">
          <span className="text-[10px] text-[#93A4B8] uppercase font-bold">Model 24h Summary</span>
          <div className="flex items-center justify-between mt-1 font-mono">
            <span className="text-xs text-[#43C7F4] flex items-center gap-1">
              <CloudRain className="w-3 h-3" /> {totalQpf}
            </span>
            <span className="text-xs text-[#FFC857] flex items-center gap-1">
              <Thermometer className="w-3 h-3" /> {maxTemp}
            </span>
            <span className="text-xs text-[#22C7A0] flex items-center gap-1">
              <Wind className="w-3 h-3" /> {maxGust}
            </span>
          </div>
          <span className="text-[10px] text-[#93A4B8] truncate mt-1">
            {structuredForecast?.metadata?.convectiveRisk || `${activeModelMeta.confidenceScore}% Confidence`}
          </span>
        </div>
      </div>

      {/* Expandable Model Physics & Mathematical Details */}
      {showModelSpecs && (
        <div className="bg-[#071018] p-4 sm:p-5 rounded-xl border border-[#162331] text-xs flex flex-col gap-3.5 transition-all animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#162331] pb-2.5">
            <h4 className="font-bold text-[#F4F7FA] uppercase text-xs tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#43C7F4]" />
              {activeModelMeta.id} Dynamical Formulation &amp; Physical Schemes
            </h4>
            <span className="text-[#93A4B8] text-[10px] font-mono">
              Vertical Levels: {activeModelMeta.verticalLevels}
            </span>
          </div>
          
          <p className="text-[#D1DCE8] leading-relaxed">
            {activeModelMeta.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B141E] p-3 rounded-lg border border-[#162331]">
              <strong className="text-[#F4F7FA] block mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#1499E8]" /> Core Formulation:
              </strong>
              <span className="text-[#93A4B8]">{activeModelMeta.coreType}</span>
            </div>
            <div className="bg-[#0B141E] p-3 rounded-lg border border-[#162331]">
              <strong className="text-[#F4F7FA] block mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#22C7A0]" /> Physics Parameterizations:
              </strong>
              <span className="text-[#93A4B8]">{activeModelMeta.physicsSchemes}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B141E] p-3 rounded-lg border border-[#162331]">
              <strong className="text-[#F4F7FA] block mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#FF9F43]" /> Source Grid Provider:
              </strong>
              <span className="text-[#93A4B8] font-mono text-[11px]">{activeModelMeta.sourceProvider}</span>
            </div>
            <div className="bg-[#0B141E] p-3 rounded-lg border border-[#162331]">
              <strong className="text-[#F4F7FA] block mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C7A0]" /> Output Variables Streamed:
              </strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeModelMeta.rawVariablesAvailable.map((v, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#162331] text-[#D1DCE8]">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
