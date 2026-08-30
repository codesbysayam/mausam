import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { FileText, Download, Printer, ExternalLink, ShieldCheck, Calendar, MapPin, Building, Eye } from 'lucide-react';
import { BulletinReaderModal } from './BulletinReaderModal';

interface DistrictAgrometBulletinProps {
  bulletin: ExtendedAgrometBulletin;
}

export const DistrictAgrometBulletin: React.FC<DistrictAgrometBulletinProps> = ({ bulletin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = () => {
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
    <>
      <div className="rounded-2xl bg-gradient-to-br from-[#121D2A] via-[#0F1722] to-[#0A1017] border border-[#1E2E40] p-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-[#2ECC71]/15 border border-[#2ECC71]/30 text-[#2ECC71] shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2ECC71]/20 text-[#2ECC71] font-bold uppercase tracking-wider font-mono">
                  Official AAS Bulletin
                </span>
                <span className="text-xs text-[#93A4B8] font-mono">
                  Ref: <strong className="text-white">{bulletin.bulletinNo}</strong>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
                Gramin Krishi Mausam Sewa (GKMS) District Bulletin
              </h3>
              <p className="text-xs text-[#93A4B8] flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{bulletin.amfuUnit}</span>
              </p>
            </div>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2ECC71] text-[#0A1017] font-bold text-xs hover:bg-[#27AE60] transition-all shadow-md cursor-pointer focus:outline-none"
            >
              <Eye className="w-4 h-4" />
              <span>Read Full Bulletin</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#182635] text-white border border-[#2A3E54] font-medium text-xs hover:bg-[#22354A] transition-all cursor-pointer focus:outline-none"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Download (.txt)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#182635] text-white border border-[#2A3E54] font-medium text-xs hover:bg-[#22354A] transition-all cursor-pointer focus:outline-none"
            >
              <Printer className="w-3.5 h-3.5 text-[#93A4B8]" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Synopsis & Key Weather Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left (8 Cols): Weather Summary Text */}
          <div className="lg:col-span-8 p-4 rounded-xl bg-[#131D28] border border-[#1E2E40] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider block mb-1.5">
                Official Meteorological Synopsis
              </span>
              <p className="text-xs sm:text-sm text-[#D7DEE8] leading-relaxed font-normal">
                {bulletin.weatherSummary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2E40] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#93A4B8]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                Issued: {bulletin.issueDate} ({bulletin.issueDay})
              </span>
              <span className="text-[#38BDF8] font-semibold">
                Valid: {bulletin.validPeriod}
              </span>
            </div>
          </div>

          {/* Right (4 Cols): Rainfall Distribution Matrix */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#131D28] border border-[#1E2E40] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#2ECC71] uppercase font-bold tracking-wider block mb-1.5">
                5-Day Quantitative Rain Projection
              </span>
              <div className="text-xs font-mono text-[#F4F7FA] leading-relaxed bg-[#0F1622] p-2.5 rounded-lg border border-[#1E2E40]">
                {bulletin.rainfallForecast5Days}
              </div>
            </div>

            <div className="mt-3 text-[10px] text-[#64748B] flex items-center justify-between">
              <span>Nodal Center: AMFU IMD</span>
              <span className="text-[#2ECC71] font-mono">Verified AAS Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Modal Viewer */}
      <BulletinReaderModal
        bulletin={bulletin}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
