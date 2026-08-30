import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { X, Printer, Download, Copy, Check, FileText, Sprout, ShieldCheck, MapPin, Calendar, University } from 'lucide-react';

interface BulletinReaderModalProps {
  bulletin: ExtendedAgrometBulletin;
  isOpen: boolean;
  onClose: () => void;
}

export const BulletinReaderModal: React.FC<BulletinReaderModalProps> = ({ bulletin, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [viewFormat, setViewFormat] = useState<'formatted' | 'raw'>('formatted');

  if (!isOpen) return null;

  const rawText = `
==================================================================
GOVERNMENT OF INDIA • INDIA METEOROLOGICAL DEPARTMENT
GRAMIN KRISHI MAUSAM SEWA (GKMS) • AGROMET ADVISORY BULLETIN
==================================================================
Issuing Unit: ${bulletin.amfuUnit}
Bulletin No: ${bulletin.bulletinNo}
Issue Date: ${bulletin.issueDate} (${bulletin.issueDay})
Validity Period: ${bulletin.validPeriod}
District: ${bulletin.district} | State: ${bulletin.state}

------------------------------------------------------------------
1. SYNOPTIC WEATHER SUMMARY & 5-DAY DISTRICT FORECAST:
------------------------------------------------------------------
${bulletin.weatherSummary}

Quantitative Precipitation Forecast (5-Day):
${bulletin.rainfallForecast5Days}

------------------------------------------------------------------
2. CROP-WISE ADVISORIES & PHENOLOGY PROTECTION:
------------------------------------------------------------------
${bulletin.crops
  .map(
    (c, i) => `
[CROP ${i + 1}: ${c.cropName.toUpperCase()}]
• Stage of Crop: ${c.stage}
• Sowing / Field Practice: ${c.sowingAdvice}
• Irrigation Management: ${c.irrigationAdvice}
• Nutrient / Fertilizer: ${c.fertilizerAdvice}
• Plant Protection & IPM: ${c.pestDiseaseAdvice}
• Harvesting / Post-Harvest: ${c.harvestingAdvice}
• Risk Level: ${c.riskLevel} (${c.riskAlert})
`
  )
  .join('\n')}

==================================================================
DISCLAIMER: Issued by Agromet Advisory Services (AAS) unit for farm management.
For real-time weather updates visit mausam.imd.gov.in
==================================================================
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `GKMS_Bulletin_${bulletin.district}_${bulletin.bulletinNo.replace(/\//g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0F1622] border border-[#1E2E40] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-[#131E2A] border-b border-[#1E2E40] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center text-[#2ECC71]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Official GKMS Agromet Advisory Bulletin
              </h2>
              <p className="text-xs text-[#93A4B8]">
                {bulletin.amfuUnit}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#182635] text-[#93A4B8] hover:text-white hover:bg-[#22354A] transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="px-5 py-2.5 bg-[#0D141F] border-b border-[#1E2E40] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewFormat('formatted')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewFormat === 'formatted'
                  ? 'bg-[#2ECC71] text-[#0A1017]'
                  : 'text-[#93A4B8] hover:text-white'
              }`}
            >
              Formatted Document
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('raw')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                viewFormat === 'raw'
                  ? 'bg-[#2ECC71] text-[#0A1017]'
                  : 'text-[#93A4B8] hover:text-white'
              }`}
            >
              Raw AAS Text
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182635] hover:bg-[#22354A] text-white border border-[#2A3E54] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2ECC71]" /> : <Copy className="w-3.5 h-3.5 text-[#38BDF8]" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182635] hover:bg-[#22354A] text-white border border-[#2A3E54] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>Download (.txt)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ECC71] text-[#0A1017] font-bold hover:bg-[#27AE60] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#CBD5E1]">
          {viewFormat === 'raw' ? (
            <pre className="font-mono text-xs text-[#2ECC71] bg-[#0A1017] p-4 rounded-xl border border-[#1E2E40] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {rawText}
            </pre>
          ) : (
            <div className="space-y-6">
              {/* Bulletin Header Seal */}
              <div className="text-center pb-4 border-b border-[#1E2E40]">
                <span className="text-[10px] text-[#2ECC71] uppercase font-mono tracking-widest font-bold block">
                  INDIA METEOROLOGICAL DEPARTMENT • MINISTRY OF EARTH SCIENCES
                </span>
                <h1 className="text-lg font-bold text-white mt-1">
                  GRAMIN KRISHI MAUSAM SEWA (GKMS) DISTRICT AGROMET BULLETIN
                </h1>
                <p className="text-xs text-[#93A4B8] mt-0.5">{bulletin.amfuUnit}</p>

                <div className="flex flex-wrap justify-center gap-4 mt-3 text-[11px] font-mono">
                  <span className="text-white">Bulletin No: <strong className="text-[#38BDF8]">{bulletin.bulletinNo}</strong></span>
                  <span className="text-[#334155]">|</span>
                  <span className="text-white">Issue Date: <strong>{bulletin.issueDate}</strong></span>
                  <span className="text-[#334155]">|</span>
                  <span className="text-white">Validity: <strong className="text-[#F59E0B]">{bulletin.validPeriod}</strong></span>
                </div>
              </div>

              {/* Weather Synopsis */}
              <div className="p-4 rounded-xl bg-[#131D28] border border-[#1E2E40]">
                <h3 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-1.5">
                  1. Meteorological Synopsis &amp; 5-Day Numerical Forecast
                </h3>
                <p className="text-xs text-white leading-relaxed mb-2">
                  {bulletin.weatherSummary}
                </p>
                <div className="text-[11px] text-[#93A4B8] font-mono bg-[#0F1622] p-2 rounded border border-[#1E2E40]">
                  Quantitative Rainfall Projection: <strong className="text-white">{bulletin.rainfallForecast5Days}</strong>
                </div>
              </div>

              {/* Crop-Specific Advisories */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider">
                  2. Crop Phenology &amp; Agronomic Advisories
                </h3>

                {bulletin.crops.map((crop, idx) => (
                  <div key={crop.cropName} className="p-4 rounded-xl bg-[#111A24] border border-[#1E2E40] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#182635] text-[#2ECC71] font-mono font-bold flex items-center justify-center text-[10px]">
                          0{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{crop.cropName}</h4>
                        <span className="text-[10px] text-[#38BDF8] font-mono">({crop.stage})</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-semibold">
                        {crop.riskLevel} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <strong className="text-[#38BDF8] block text-[11px] mb-0.5">Irrigation Guidance:</strong>
                        <p className="text-[#D7DEE8]">{crop.irrigationAdvice}</p>
                      </div>
                      <div>
                        <strong className="text-[#2ECC71] block text-[11px] mb-0.5">Nutrient &amp; Fertilizer:</strong>
                        <p className="text-[#D7DEE8]">{crop.fertilizerAdvice}</p>
                      </div>
                      <div>
                        <strong className="text-[#EF4444] block text-[11px] mb-0.5">Pest &amp; Disease IPM:</strong>
                        <p className="text-[#D7DEE8]">{crop.pestDiseaseAdvice}</p>
                      </div>
                      <div>
                        <strong className="text-[#A855F7] block text-[11px] mb-0.5">Cultural &amp; Harvesting:</strong>
                        <p className="text-[#D7DEE8]">{crop.harvestingAdvice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-[#0A1017] border border-[#1E2E40] text-[10px] text-[#64748B] text-center leading-relaxed">
                Gramin Krishi Mausam Sewa (GKMS) advisory issued by Agromet Field Unit (AMFU) under the aegis of IMD &amp; ICAR for agricultural planning.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
