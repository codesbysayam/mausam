import React, { useState } from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import {
  X,
  Printer,
  Download,
  FileText,
  Bookmark,
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { getCategoryTheme, estimateReadingTime } from './reportUtils';

interface ReportPreviewDrawerProps {
  publication: MeteorologicalPublication | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmark: (id: string) => void;
  isSaved: boolean;
}

export const ReportPreviewDrawer: React.FC<ReportPreviewDrawerProps> = ({
  publication,
  isOpen,
  onClose,
  onBookmark,
  isSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'abstract' | 'data' | 'advisory'>('content');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen || !publication) return null;

  const theme = getCategoryTheme(publication);
  const readingTime = estimateReadingTime(publication);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${publication.title} - Government of India Official Report</title>
            <style>
              @page { size: A4 portrait; margin: 20mm; }
              body {
                font-family: "Times New Roman", Times, Georgia, serif;
                color: #111;
                background: #FFF;
                line-height: 1.5;
                font-size: 13px;
                margin: 0;
                padding: 20px;
              }
              .gov-header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 12px;
                margin-bottom: 16px;
              }
              .gov-emblem {
                font-size: 15px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .gov-sub {
                font-size: 13px;
                color: #333;
              }
              .doc-title {
                font-size: 18px;
                font-weight: bold;
                margin: 14px 0 6px 0;
                text-align: center;
                text-transform: uppercase;
              }
              .meta-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
                font-size: 12px;
              }
              .meta-table td {
                padding: 4px 8px;
                border: 1px solid #999;
              }
              .meta-table td.label {
                font-weight: bold;
                background-color: #F3F4F6;
                width: 25%;
              }
              .section-heading {
                font-size: 14px;
                font-weight: bold;
                border-bottom: 1px solid #333;
                padding-bottom: 3px;
                margin-top: 18px;
                margin-bottom: 8px;
                text-transform: uppercase;
              }
              p { margin: 6px 0 10px 0; text-align: justify; }
              .table-custom {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0;
                font-size: 11px;
              }
              .table-custom th, .table-custom td {
                border: 1px solid #333;
                padding: 6px 8px;
                text-align: left;
              }
              .table-custom th {
                background: #E5E7EB;
                font-weight: bold;
              }
              .signature-block {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                border-top: 1px dashed #777;
                padding-top: 12px;
              }
              .official-stamp {
                display: inline-block;
                border: 2px solid #002B49;
                color: #002B49;
                font-weight: bold;
                padding: 4px 10px;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
            </style>
          </head>
          <body>
            <div class="gov-header">
              <div class="gov-emblem">भारत सरकार / Government of India</div>
              <div class="gov-sub">पृथ्वी विज्ञान मंत्रालय / Ministry of Earth Sciences</div>
              <div class="gov-sub" style="font-weight: bold;">भारत मौसम विज्ञान विभाग / India Meteorological Department</div>
              <div class="gov-sub">${publication.issuingAuthority}</div>
            </div>

            <div class="doc-title">${publication.title}</div>

            <table class="meta-table">
              <tr>
                <td class="label">Document Ref. No.:</td>
                <td><strong>${publication.documentNumber}</strong></td>
                <td class="label">Date of Issue:</td>
                <td><strong>${publication.date}</strong></td>
              </tr>
              <tr>
                <td class="label">Classification:</td>
                <td>Official Public Publication / Monograph</td>
                <td class="label">Author / Division:</td>
                <td>${publication.author}</td>
              </tr>
              <tr>
                <td class="label">Category:</td>
                <td>${publication.category}</td>
                <td class="label">Archive Size:</td>
                <td>${publication.size}</td>
              </tr>
            </table>

            <div class="section-heading">Executive Synoptic Abstract</div>
            <p><em>${publication.abstract}</em></p>

            ${publication.synopticSummary ? `
              <div class="section-heading">Synoptic Meteorology &amp; Boundary Conditions</div>
              <p>${publication.synopticSummary}</p>
            ` : ''}

            ${publication.sections.map(sec => `
              <div class="section-heading">${sec.title}</div>
              <p>${sec.content}</p>
              ${sec.tableData ? `
                <table class="table-custom">
                  <thead>
                    <tr>
                      ${sec.tableData.headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${sec.tableData.rows.map(row => `
                      <tr>
                        ${row.map(c => `<td>${c}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
            `).join('')}

            ${publication.recommendations && publication.recommendations.length > 0 ? `
              <div class="section-heading">Operational Advisory &amp; Action Directives</div>
              <ul style="padding-left: 20px;">
                ${publication.recommendations.map(r => `<li>${r}</li>`).join('')}
              </ul>
            ` : ''}

            <div class="signature-block">
              <div>
                <div class="official-stamp">MAUSAM OFFICIAL ARCHIVE VERIFIED</div>
                <div style="margin-top: 4px; color: #555;">Document Digitally Signed &amp; Authenticated</div>
              </div>
              <div style="text-align: right;">
                <strong>Director General of Meteorology</strong><br/>
                India Meteorological Department, New Delhi
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    } else {
      window.print();
    }
  };

  const handleDownloadHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${publication.title} - Official IMD Publication</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #1E293B; max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .header { text-align: center; border-bottom: 2px solid #0B72B9; padding-bottom: 20px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; text-transform: uppercase; margin: 0; color: #0A5A94; }
    .title-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
    th { background: #F1F5F9; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Government of India • Ministry of Earth Sciences</h1>
    <h2>India Meteorological Department (IMD) • ${publication.issuingAuthority}</h2>
  </div>
  <div class="title-box">
    <h2>${publication.title}</h2>
    <p><strong>Ref:</strong> ${publication.documentNumber} | <strong>Date:</strong> ${publication.date} | <strong>Author:</strong> ${publication.author}</p>
  </div>
  <h3>Executive Abstract</h3>
  <p>${publication.abstract}</p>
  ${publication.synopticSummary ? `<h3>Synoptic Summary</h3><p>${publication.synopticSummary}</p>` : ''}
  ${publication.sections.map(s => `<h3>${s.title}</h3><p>${s.content}</p>`).join('')}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${publication.id}-official-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice('Official HTML report downloaded.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCopyCitation = () => {
    const citation = `India Meteorological Department (${publication.date.slice(-4)}). "${publication.title}". ${publication.issuingAuthority}, Government of India. Doc Ref: ${publication.documentNumber}.`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Body */}
      <div className="relative z-10 w-full max-w-4xl h-full bg-[#0D1520] border-l border-[#1E2E40] shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
        {/* Top Sticky Header */}
        <div className="p-5 bg-[#080E16] border-b border-[#1E2E40] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
              >
                {theme.label}
              </span>
              <span className="text-xs font-mono text-[#64748B]">
                REF: {publication.documentNumber}
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">
                • {readingTime}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {publication.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#14202E] text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
            title="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Quick Action Bar */}
        <div className="px-5 py-2.5 bg-[#0C1521] border-b border-[#1E2E40] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#38BDF8] text-[#0A1017]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#14202E]'
              }`}
            >
              Full Monograph
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('abstract')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'abstract'
                  ? 'bg-[#38BDF8] text-[#0A1017]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#14202E]'
              }`}
            >
              Abstract &amp; Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-[#38BDF8] text-[#0A1017]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#14202E]'
              }`}
            >
              Observation Tables
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                activeTab === 'advisory'
                  ? 'bg-[#38BDF8] text-[#0A1017]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#14202E]'
              }`}
            >
              Directives
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A1017] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print official report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 rounded-xl bg-[#14202E] hover:bg-[#1E2E40] border border-[#1E2E40] text-xs font-mono text-[#CBD5E1] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download HTML"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCitation}
              className="px-3 py-1.5 rounded-xl bg-[#14202E] hover:bg-[#1E2E40] border border-[#1E2E40] text-xs font-mono text-[#CBD5E1] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy academic citation"
            >
              <FileText className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>{copiedCitation ? 'Copied!' : 'Cite'}</span>
            </button>

            <button
              type="button"
              onClick={() => onBookmark(publication.id)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                  : 'bg-[#14202E] text-[#94A3B8] hover:text-white border-[#1E2E40]'
              }`}
              title="Bookmark Report"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-[#2ECC71]/15 text-[#2ECC71] px-5 py-1.5 text-xs font-mono border-b border-[#2ECC71]/30 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{notice}</span>
          </div>
        )}

        {/* Scrollable Reader Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-[#CBD5E1]">
          {/* Institutional Header Banner */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#1E2E40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[#38BDF8] uppercase font-bold text-[10px] tracking-wider block">
                ISSUING METEOROLOGICAL AUTHORITY
              </span>
              <strong className="text-white text-sm block mt-0.5 font-sans">
                {publication.issuingAuthority}
              </strong>
              <div className="text-[#94A3B8] mt-0.5">
                Lead Analyst / Directorate: <span className="text-white">{publication.author}</span>
              </div>
            </div>

            <div className="flex sm:flex-col sm:items-end gap-3 text-xs">
              <span className="text-[#94A3B8]">
                Date: <strong className="text-white">{publication.date}</strong>
              </span>
              <span className="text-[#94A3B8]">
                Archive Size: <strong className="text-[#38BDF8]">{publication.size}</strong>
              </span>
            </div>
          </div>

          {/* Full Monograph Tab */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#0F1925] border border-[#1E2E40]">
                <h4 className="text-xs font-mono font-bold uppercase text-[#38BDF8] tracking-wider mb-2">
                  Executive Abstract
                </h4>
                <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed italic">
                  &quot;{publication.abstract}&quot;
                </p>
              </div>

              {publication.synopticSummary && (
                <div className="p-4 rounded-2xl bg-[#0F1925] border border-[#1E2E40]">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#2ECC71] tracking-wider mb-2">
                    Synoptic Atmospheric Boundary Synopsis
                  </h4>
                  <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                    {publication.synopticSummary}
                  </p>
                </div>
              )}

              {publication.sections.map((sec, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#0F1925] border border-[#1E2E40] space-y-3">
                  <h4 className="text-base font-bold text-white border-b border-[#1E2E40] pb-2">
                    {sec.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                    {sec.content}
                  </p>

                  {sec.tableData && (
                    <div className="overflow-x-auto mt-3 pt-2">
                      <table className="w-full text-xs text-left border-collapse font-mono">
                        <thead>
                          <tr className="bg-[#080E16] border-b border-[#1E2E40] text-[#94A3B8]">
                            {sec.tableData.headers.map((h, hi) => (
                              <th key={hi} className="p-2.5 font-bold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.tableData.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-[#1E2E40]/60 hover:bg-[#142232]">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-2.5 text-white">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Abstract Tab */}
          {activeTab === 'abstract' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#0F1925] border border-[#1E2E40]">
                <h4 className="text-xs font-mono font-bold uppercase text-[#38BDF8] mb-2">
                  Executive Scientific Summary
                </h4>
                <p className="text-sm leading-relaxed text-[#E2E8F0]">
                  {publication.abstract}
                </p>
              </div>

              {publication.synopticSummary && (
                <div className="p-5 rounded-2xl bg-[#0F1925] border border-[#1E2E40]">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#2ECC71] mb-2">
                    Atmospheric Flow Synopsis
                  </h4>
                  <p className="text-sm leading-relaxed text-[#E2E8F0]">
                    {publication.synopticSummary}
                  </p>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-[#0F1925] border border-[#1E2E40]">
                <h4 className="text-xs font-mono font-bold uppercase text-[#94A3B8] mb-3">
                  Keywords &amp; Atmospheric Descriptors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {publication.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#080E16] text-[#38BDF8] border border-[#1E2E40] text-xs font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Observation Tables Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {publication.sections.filter(s => s.tableData).length === 0 ? (
                <div className="p-8 text-center text-[#94A3B8] bg-[#0F1925] rounded-2xl border border-[#1E2E40] font-mono text-xs">
                  No structured telemetry tables recorded in this specific monograph.
                </div>
              ) : (
                publication.sections.filter(s => s.tableData).map((sec, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#0F1925] border border-[#1E2E40] space-y-3">
                    <h4 className="text-sm font-bold text-white font-mono">
                      {sec.title}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse font-mono">
                        <thead>
                          <tr className="bg-[#080E16] border-b border-[#1E2E40] text-[#94A3B8]">
                            {sec.tableData!.headers.map((h, hi) => (
                              <th key={hi} className="p-2.5 font-bold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.tableData!.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-[#1E2E40]/60 hover:bg-[#142232]">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-2.5 text-white">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Directives Tab */}
          {activeTab === 'advisory' && (
            <div className="space-y-4">
              {publication.recommendations && publication.recommendations.length > 0 ? (
                <div className="p-5 rounded-2xl bg-[#0F1925] border border-[#1E2E40] space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-[#F59E0B] tracking-wider mb-2 flex items-center gap-2">
                    <span>Operational Actions &amp; Public Directives</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {publication.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#E2E8F0]">
                        <span className="text-[#38BDF8] font-mono font-bold">{i + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-8 text-center text-[#94A3B8] bg-[#0F1925] rounded-2xl border border-[#1E2E40] font-mono text-xs">
                  No operational advisories attached to this research monograph.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Verification Footer */}
        <div className="p-4 bg-[#080E16] border-t border-[#1E2E40] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            <span>MAUSAM Verified Open Research Document</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14202E] hover:bg-[#1E2E40] text-white transition-colors cursor-pointer"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
