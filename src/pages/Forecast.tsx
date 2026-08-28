import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord, HourlyForecastItem } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { DailyForecast } from '../components/weather/DailyForecast';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import {
  NWPModelType,
  NWP_MODELS,
  getModelHourlyForecast,
  getModelDailyForecast,
  calculateModelComparison,
} from '../services/nwpModelService';

interface ForecastPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const [modelType, setModelType] = useState<NWPModelType>('WRF');
  const [showModelSpecs, setShowModelSpecs] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const rawHourly = weatherBundle?.hourly || [];
  const rawDaily = weatherBundle?.daily || [];

  // Compute model-specific hourly and daily forecasts
  const modelHourly = useMemo(() => {
    return getModelHourlyForecast(rawHourly, modelType);
  }, [rawHourly, modelType]);

  const modelDaily = useMemo(() => {
    return getModelDailyForecast(rawDaily, modelType);
  }, [rawDaily, modelType]);

  // Compute comparative consensus metrics across all 3 models
  const comparison = useMemo(() => {
    return calculateModelComparison(rawHourly, rawDaily);
  }, [rawHourly, rawDaily]);

  const activeModelMeta = NWP_MODELS[modelType];

  const handleExportCSV = () => {
    let csv = `Time (IST),Temperature (°C),Weather Condition,Precipitation Probability (%),Wind Speed (km/h),Cloud Cover (%)\n`;
    modelHourly.forEach((h) => {
      csv += `"${h.time}","${h.temp}","${h.condition}","${h.precipitationProbability || 0}","${h.windSpeed || 10}","${h.cloudCover || 40}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IMD_NWP_${modelType}_${selectedLocation.city}_forecast.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedNotification(`Exported ${modelType} Forecast CSV for ${selectedLocation.city}`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const hourlyColumns: ColumnDef<HourlyForecastItem>[] = [
    {
      header: 'Time (IST)',
      render: (item) => (
        <span className="font-bold text-white font-mono">{item.time}</span>
      ),
      width: '100px',
    },
    {
      header: 'Temp (°C)',
      render: (item) => (
        <span className="font-mono text-white font-bold">{Math.round(item.temp)}°C</span>
      ),
      width: '100px',
    },
    {
      header: 'Weather Condition',
      render: (item) => (
        <span className="text-xs text-[#D7DEE8]">{item.condition}</span>
      ),
    },
    {
      header: 'Precipitation Prob',
      render: (item) => (
        <span className="font-mono text-[#4FA8E0] font-bold">
          {item.precipitationProbability || 0}%
        </span>
      ),
      width: '150px',
    },
    {
      header: 'Wind Speed & Dir',
      render: (item) => (
        <span className="font-mono text-xs text-[#D7DEE8]">
          {item.windSpeed || 10} km/h {item.windDirection || 'ESE'}
        </span>
      ),
    },
    {
      header: 'Cloud Cover',
      render: (item) => (
        <span className="font-mono text-xs text-[#8A94A6]">
          {item.cloudCover || 40}%
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Model & Header banner */}
      <div className="mausam-card flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Numerical Weather Prediction (NWP)
              </span>
              <span className="text-xs text-[#8A94A6] font-mono">
                Cycle: 00Z / 12Z Operational Run
              </span>
            </div>
            <h2 className="text-white font-bold text-lg mt-1">
              Atmospheric Model Forecast — {selectedLocation.city}, {selectedLocation.state}
            </h2>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              High-resolution dynamical model simulations with MOS statistical bias correction.
            </p>
          </div>

          {/* NWP Model Toggle Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0F141A] p-1 rounded-lg border border-[#334155] shadow-inner">
              <span className="text-[10px] text-[#8A94A6] px-2 font-bold uppercase tracking-wider">
                MODEL:
              </span>
              {(['WRF', 'GEFS', 'ECMWF'] as const).map((m) => {
                const isSelected = modelType === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModelType(m)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? m === 'WRF'
                          ? 'bg-[#0B72B9] text-white shadow-md shadow-[#0B72B9]/30 ring-1 ring-white/20'
                          : m === 'GEFS'
                          ? 'bg-[#2ECC71] text-black shadow-md shadow-[#2ECC71]/30 ring-1 ring-white/20'
                          : 'bg-[#E67E22] text-white shadow-md shadow-[#E67E22]/30 ring-1 ring-white/20'
                        : 'text-[#8A94A6] hover:text-white hover:bg-[#1E2733]'
                    }`}
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
              className="p-1.5 bg-[#1E2733] hover:bg-[#334155] text-[#8A94A6] hover:text-white rounded-lg border border-[#334155] transition-colors"
              title="Toggle Model Physics Specifications"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>
          </div>
        </div>

        {/* Active Model Meta Badge & Diagnostic Header */}
        <div className="bg-[#0F141A] p-3.5 rounded-lg border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start md:items-center gap-3">
            <div
              className="w-2.5 h-10 rounded-full shrink-0"
              style={{ backgroundColor: activeModelMeta.badgeColor }}
            ></div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-white text-sm">
                  {activeModelMeta.fullName}
                </strong>
                <span className="bg-[#1E2733] text-[#D7DEE8] px-2 py-0.5 rounded text-[11px] font-mono border border-[#334155]">
                  {activeModelMeta.gridResolution}
                </span>
              </div>
              <div className="text-[#8A94A6] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                <span>Agency: <span className="text-[#D7DEE8]">{activeModelMeta.agency}</span></span>
                <span>•</span>
                <span>Levels: <span className="text-[#D7DEE8]">{activeModelMeta.verticalLevels}</span></span>
                <span>•</span>
                <span>Cycle: <span className="text-[#D7DEE8] font-mono">{activeModelMeta.updateCycle}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <div className="text-right">
              <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block">
                Model Confidence Index
              </span>
              <span className="text-sm font-bold font-mono text-[#2ECC71]">
                {activeModelMeta.confidenceScore}% High Certainty
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-[#1E2733] hover:bg-[#334155] text-[#4FA8E0] hover:text-white px-2.5 py-1.5 rounded border border-[#334155] transition-colors flex items-center gap-1 cursor-pointer"
              title="Export numerical weather prediction timeseries"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>CSV</span>
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 px-3 py-1.5 rounded text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Expandable Model Physics & Mathematical Details */}
        {showModelSpecs && (
          <div className="bg-[#1E2733] p-4 rounded-lg border border-[#334155] text-xs flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-[#4FA8E0]">
                {activeModelMeta.id} Dynamical Core &amp; Microphysics Schemes
              </h4>
              <span className="text-[#8A94A6] text-[10px]">
                Operational Numerical Model Architecture
              </span>
            </div>
            <p className="text-[#D7DEE8] leading-relaxed">
              {activeModelMeta.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#0F141A] p-2.5 rounded border border-[#334155]">
                <strong className="text-white block mb-0.5">Core Formulation:</strong>
                <span className="text-[#8A94A6]">{activeModelMeta.coreType}</span>
              </div>
              <div className="bg-[#0F141A] p-2.5 rounded border border-[#334155]">
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

      {/* Hourly Strip (Directly driven by active model) */}
      <HourlyForecast
        hourly={modelHourly}
        modelType={modelType}
        modelSubtitle={`24-Hour continuous time-series calculated via ${activeModelMeta.shortName}`}
      />

      {/* 7-Day Medium Range Forecast (Driven by active model) */}
      <DailyForecast daily={modelDaily} />

      {/* Multi-Model Consensus & Comparison Matrix */}
      <div className="mausam-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionHeader
            title="Multi-Model Consensus & Ensemble Comparison Matrix"
            subtitle="Cross-model verification (IMD WRF 3km vs NCEP/IMD GEFS 12km vs ECMWF IFS 9km)"
            icon="compare_arrows"
          />
          <div className="flex items-center gap-2 shrink-0 bg-[#0F141A] px-3 py-1.5 rounded border border-[#334155]">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
            <span className="text-xs font-bold text-white">
              Consensus Agreement: <strong className="text-[#2ECC71] font-mono">{comparison.consensusAgreementPercent}%</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#0F141A] border-b border-[#334155] text-[#8A94A6]">
                <th className="p-3 font-bold">Meteorological Metric</th>
                <th className="p-3 font-bold text-[#4FA8E0]">IMD WRF (3km)</th>
                <th className="p-3 font-bold text-[#2ECC71]">GEFS Ensemble (12km)</th>
                <th className="p-3 font-bold text-[#E67E22]">ECMWF IFS (9km)</th>
                <th className="p-3 font-bold">Ensemble Spread</th>
                <th className="p-3 font-bold">Consensus Status</th>
              </tr>
            </thead>
            <tbody>
              {comparison.metrics.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#334155]/60 hover:bg-[#1E2733] transition-colors"
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
                  <td className="p-3 font-mono text-[#8A94A6]">
                    {row.ensembleSpread}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.consensusStatus === 'High Agreement'
                        ? 'bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30'
                        : 'bg-[#FF8C42]/15 text-[#FF8C42] border border-[#FF8C42]/30'
                    }`}>
                      {row.consensusStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0F141A] p-3 rounded mt-3 border border-[#334155] text-xs text-[#8A94A6] leading-relaxed flex items-start gap-2">
          <span className="material-symbols-outlined text-[#4FA8E0] text-[18px] shrink-0 mt-0.5">
            psychology
          </span>
          <div>
            <strong className="text-white">Synoptic Consensus Diagnostic: </strong>
            <span>{comparison.synopticVerdict}</span>
          </div>
        </div>
      </div>

      {/* Full Detailed Tabular Hourly Output */}
      <div className="mausam-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <SectionHeader
            title={`Complete 24-Hour Synoptic Time-Series Matrix (${modelType})`}
            subtitle={`Point-wise meteorological parameter projections simulated via ${activeModelMeta.shortName}`}
            icon="table_chart"
          />
          <button
            type="button"
            onClick={handleExportCSV}
            className="mausam-btn mausam-btn--secondary mausam-btn--sm self-start sm:self-auto flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            <span>Export Timeseries</span>
          </button>
        </div>

        <DataTable
          data={modelHourly}
          columns={hourlyColumns}
          keyExtractor={(item, idx) => item.time || String(idx)}
        />
      </div>
    </div>
  );
};
