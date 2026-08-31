import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Building,
  Eye,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
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
      <section className="rounded-3xl bg-gradient-to-br from-[#121E2C] via-[#0E1622] to-[#0A1017] border-2 border-[#243B52] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        {/* Official Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 mb-6 border-b border-[#1E2E40] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                Official AAS Publication
              </span>
              <span className="text-xs text-[#64748B] font-mono">
                No. {bulletin.bulletinNo}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Agromet Field Brief
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono mt-1">
              <span className="text-[#38BDF8] font-bold uppercase">
                {bulletin.district.toUpperCase()} • {bulletin.state.toUpperCase()}
              </span>
              <span>•</span>
              <span>VALID: {bulletin.validPeriod}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2ECC71] text-[#0A1017] font-black text-xs hover:bg-[#27AE60] transition-all shadow-lg shadow-[#2ECC71]/20 cursor-pointer focus:outline-none"
            >
              <Eye className="w-4 h-4" />
              <span>Read Full Bulletin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#142232] text-white border border-[#22354A] font-bold text-xs hover:bg-[#1A2C40] transition-all cursor-pointer focus:outline-none"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Download (.txt)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#142232] text-white border border-[#22354A] font-bold text-xs hover:bg-[#1A2C40] transition-all cursor-pointer focus:outline-none"
            >
              <Printer className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 4 Brief Weather Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="p-3.5 rounded-xl bg-[#0B131C] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">WEATHER</span>
            <span className="text-base font-bold font-mono text-white block mt-0.5">31–33°C</span>
            <span className="text-[10px] text-[#94A3B8]">Partly Cloudy</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B131C] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">RAIN</span>
            <span className="text-base font-bold font-mono text-[#38BDF8] block mt-0.5">10–25 mm</span>
            <span className="text-[10px] text-[#38BDF8]">Convective Showers</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B131C] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">HUMIDITY</span>
            <span className="text-base font-bold font-mono text-[#F59E0B] block mt-0.5">75–85%</span>
            <span className="text-[10px] text-[#F59E0B]">Morning High</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B131C] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">WIND</span>
            <span className="text-base font-bold font-mono text-[#2ECC71] block mt-0.5">Moderate</span>
            <span className="text-[10px] text-[#2ECC71]">10–14 km/h ESE</span>
          </div>
        </div>

        {/* Farm Impact Synopsis Box */}
        <div className="p-5 rounded-2xl bg-[#0B131C] border border-[#1E2E40] space-y-2">
          <span className="text-[10px] text-[#2ECC71] font-mono uppercase font-bold tracking-wider block">
            FARM IMPACT SUMMARY
          </span>
          <p className="text-sm text-[#F4F7FA] font-medium leading-relaxed">
            &ldquo;Precipitation across the 5-day cycle will reduce supplemental irrigation demand while maintaining high topsoil moisture. Farmers should withhold chemical pesticide sprays during overcast shower windows and focus on early weed eradication.&rdquo;
          </p>
          <div className="pt-3 mt-3 border-t border-[#1E2E40] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#64748B] font-mono gap-2">
            <span>Issuing Node: {bulletin.amfuUnit}</span>
            <span>Authored: {bulletin.issueDate} • Next scheduled update: Tuesday</span>
          </div>
        </div>
      </section>

      {/* Full Modal Reader */}
      <BulletinReaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bulletin={bulletin}
      />
    </>
  );
};
