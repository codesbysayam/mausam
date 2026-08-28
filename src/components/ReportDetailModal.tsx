import React, { useState } from 'react';
import { MeteorologicalPublication } from '../data/reportsAndArticles';

interface ReportDetailModalProps {
  publication: MeteorologicalPublication | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  publication,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'abstract' | 'data' | 'advisory'>('content');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen || !publication) return null;

  const handlePrint = () => {
    // Open a dedicated clean printable popup window formatted with official government document styling
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
              .rec-list {
                padding-left: 20px;
                margin: 6px 0;
              }
              .rec-list li {
                margin-bottom: 5px;
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
              <ul class="rec-list">
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
                India Meteorological Department, New Delhi<br/>
                <em>National Weather Forecasting Centre</em>
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
      // Fallback
      window.print();
    }
  };

  const handleDownloadHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${publication.title} - IMD Publication</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #1E293B; max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .header { text-align: center; border-bottom: 2px solid #0B72B9; padding-bottom: 20px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; text-transform: uppercase; margin: 0; color: #0A5A94; }
    .header h2 { font-size: 15px; color: #475569; margin: 4px 0 0 0; font-weight: normal; }
    .title-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .title-box h3 { margin: 0 0 10px 0; color: #0F172A; font-size: 20px; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 13px; color: #64748B; }
    .meta-grid strong { color: #1E293B; }
    .section { margin-bottom: 24px; }
    .section h4 { font-size: 16px; color: #0B72B9; border-bottom: 1px solid #CBD5E1; padding-bottom: 6px; margin: 20px 0 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #CBD5E1; padding: 8px 12px; text-align: left; }
    th { background: #F1F5F9; font-weight: bold; color: #334155; }
    tr:nth-child(even) { background: #F8FAFC; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Government of India • Ministry of Earth Sciences</h1>
    <h2>India Meteorological Department (IMD) • ${publication.issuingAuthority}</h2>
  </div>

  <div class="title-box">
    <h3>${publication.title}</h3>
    <div class="meta-grid">
      <div><strong>Document ID:</strong> ${publication.documentNumber}</div>
      <div><strong>Date:</strong> ${publication.date}</div>
      <div><strong>Category:</strong> ${publication.category}</div>
      <div><strong>Author:</strong> ${publication.author}</div>
    </div>
  </div>

  <div class="section">
    <h4>Executive Abstract</h4>
    <p>${publication.abstract}</p>
  </div>

  ${publication.synopticSummary ? `
    <div class="section">
      <h4>Synoptic Atmospheric Summary</h4>
      <p>${publication.synopticSummary}</p>
    </div>
  ` : ''}

  ${publication.sections.map(sec => `
    <div class="section">
      <h4>${sec.title}</h4>
      <p>${sec.content}</p>
      ${sec.tableData ? `
        <table>
          <thead>
            <tr>${sec.tableData.headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${sec.tableData.rows.map(row => `
              <tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
  `).join('')}

  ${publication.recommendations && publication.recommendations.length > 0 ? `
    <div class="section">
      <h4>Operational Recommendations</h4>
      <ul>
        ${publication.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  ` : ''}

  <div class="footer">
    <p>Official publication archived via MAUSAM National Meteorological Platform.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${publication.id}-official-bulletin.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice('Official HTML Document downloaded successfully.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleDownloadText = () => {
    let textDoc = `========================================================================\n`;
    textDoc += `GOVERNMENT OF INDIA - MINISTRY OF EARTH SCIENCES\n`;
    textDoc += `INDIA METEOROLOGICAL DEPARTMENT (IMD)\n`;
    textDoc += `${publication.issuingAuthority.toUpperCase()}\n`;
    textDoc += `========================================================================\n\n`;
    textDoc += `TITLE: ${publication.title}\n`;
    textDoc += `DOCUMENT NO: ${publication.documentNumber}\n`;
    textDoc += `DATE: ${publication.date}\n`;
    textDoc += `CATEGORY: ${publication.category}\n`;
    textDoc += `AUTHOR: ${publication.author}\n\n`;
    textDoc += `------------------------------------------------------------------------\n`;
    textDoc += `EXECUTIVE ABSTRACT:\n`;
    textDoc += `${publication.abstract}\n\n`;

    if (publication.synopticSummary) {
      textDoc += `------------------------------------------------------------------------\n`;
      textDoc += `SYNOPTIC SUMMARY:\n`;
      textDoc += `${publication.synopticSummary}\n\n`;
    }

    publication.sections.forEach(sec => {
      textDoc += `------------------------------------------------------------------------\n`;
      textDoc += `${sec.title.toUpperCase()}\n`;
      textDoc += `${sec.content}\n\n`;
      if (sec.tableData) {
        textDoc += `TABLE DATA:\n`;
        textDoc += sec.tableData.headers.join(' | ') + '\n';
        textDoc += sec.tableData.headers.map(() => '-----------').join(' | ') + '\n';
        sec.tableData.rows.forEach(r => {
          textDoc += r.join(' | ') + '\n';
        });
        textDoc += '\n';
      }
    });

    if (publication.recommendations && publication.recommendations.length > 0) {
      textDoc += `------------------------------------------------------------------------\n`;
      textDoc += `OPERATIONAL RECOMMENDATIONS:\n`;
      publication.recommendations.forEach((r, i) => {
        textDoc += `${i + 1}. ${r}\n`;
      });
      textDoc += '\n';
    }

    textDoc += `========================================================================\n`;
    textDoc += `END OF BULLETIN - MAUSAM ATMOSPHERIC INTELLIGENCE PLATFORM\n`;
    textDoc += `========================================================================\n`;

    const blob = new Blob([textDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${publication.id}-bulletin.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice('Telegraphic Text Bulletin downloaded successfully.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleCopyCitation = () => {
    const citation = `India Meteorological Department (${publication.date.slice(-4)}). "${publication.title}". ${publication.issuingAuthority}, Government of India. Doc Ref: ${publication.documentNumber}.`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17212B] border border-[#334155] rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0F141A] px-5 py-4 border-b border-[#334155] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                menu_book
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#0B72B9]/30 text-[#4FA8E0] border border-[#0B72B9]/50 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {publication.type}
                </span>
                <span className="text-[11px] text-[#8A94A6] font-mono">
                  Ref: {publication.documentNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug mt-1">
                {publication.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#8A94A6] hover:text-white hover:bg-[#1E2733] p-1.5 rounded transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Action Bar (Print, Download HTML, Download Text, Copy Citation) */}
        <div className="bg-[#1E2733] px-5 py-2.5 border-b border-[#334155] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'content'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#17212B]'
              }`}
            >
              Full Monograph
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('abstract')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'abstract'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#17212B]'
              }`}
            >
              Abstract &amp; Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'data'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#17212B]'
              }`}
            >
              Observation Data Tables
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('advisory')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                activeTab === 'advisory'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#17212B]'
              }`}
            >
              Advisory &amp; Directives
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-[#0B72B9] hover:bg-[#0B72B9]/80 text-white text-xs font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print Official Document with Government Header"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print Bulletin</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="bg-[#17212B] hover:bg-[#17212B]/80 text-[#4FA8E0] border border-[#0B72B9]/40 text-xs font-bold px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download standalone HTML document"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>.HTML / Word</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="bg-[#17212B] hover:bg-[#17212B]/80 text-[#8A94A6] hover:text-white border border-[#334155] text-xs font-bold px-2 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
              title="Download clean plain text bulletin"
            >
              <span className="material-symbols-outlined text-[14px]">text_snippet</span>
              <span>.TXT</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCitation}
              className="bg-[#17212B] hover:bg-[#17212B]/80 text-[#8A94A6] hover:text-white border border-[#334155] text-xs font-bold px-2 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
              title="Copy official academic citation"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copiedCitation ? 'check' : 'content_copy'}
              </span>
              <span>{copiedCitation ? 'Copied!' : 'Cite'}</span>
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="bg-[#2ECC71]/15 border-b border-[#2ECC71]/30 text-[#2ECC71] px-5 py-1.5 text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-[#D7DEE8] flex flex-col gap-5">
          {/* Official Issuance Banner */}
          <div className="bg-[#0F141A] p-4 rounded border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#4FA8E0] font-bold uppercase text-[10px] tracking-wider block">
                ISSUING METEOROLOGICAL AUTHORITY
              </span>
              <strong className="text-white text-sm block mt-0.5">
                {publication.issuingAuthority}
              </strong>
              <div className="text-[#8A94A6] mt-0.5">
                Lead Analyst / Directorate: <span className="text-[#D7DEE8]">{publication.author}</span>
              </div>
            </div>

            <div className="flex sm:flex-col sm:items-end gap-3 text-xs">
              <span className="text-[#8A94A6]">
                Date: <strong className="text-white">{publication.date}</strong>
              </span>
              <span className="text-[#8A94A6]">
                Archive Size: <strong className="text-[#D7DEE8] font-mono">{publication.size}</strong>
              </span>
            </div>
          </div>

          {/* Tab 1: Full Monograph / Content */}
          {activeTab === 'content' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                <h3 className="text-xs font-bold uppercase text-[#4FA8E0] tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">subject</span>
                  <span>Executive Abstract</span>
                </h3>
                <p className="text-xs text-[#D7DEE8] leading-relaxed italic">
                  "{publication.abstract}"
                </p>
              </div>

              {publication.synopticSummary && (
                <div className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                  <h3 className="text-xs font-bold uppercase text-[#1ABC9C] tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">cyclone</span>
                    <span>Synoptic Atmospheric Synopsis</span>
                  </h3>
                  <p className="text-xs text-[#D7DEE8] leading-relaxed">
                    {publication.synopticSummary}
                  </p>
                </div>
              )}

              {/* Sections list */}
              {publication.sections.map((sec, idx) => (
                <div key={idx} className="bg-[#1E2733] p-4 rounded border border-[#334155] flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white border-b border-[#334155] pb-2">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-[#D7DEE8] leading-relaxed">
                    {sec.content}
                  </p>

                  {sec.tableData && (
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0F141A] border-b border-[#334155] text-[#8A94A6]">
                            {sec.tableData.headers.map((h, hi) => (
                              <th key={hi} className="p-2 font-bold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.tableData.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-[#334155]/60 hover:bg-[#17212B]">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-2 font-mono text-[11px] text-white">
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

          {/* Tab 2: Abstract */}
          {activeTab === 'abstract' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                <h3 className="text-xs font-bold uppercase text-[#4FA8E0] tracking-wider mb-2">
                  Executive Scientific Summary
                </h3>
                <p className="text-sm text-[#D7DEE8] leading-relaxed">
                  {publication.abstract}
                </p>
              </div>

              {publication.synopticSummary && (
                <div className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                  <h3 className="text-xs font-bold uppercase text-[#1ABC9C] tracking-wider mb-2">
                    Atmospheric Flow Regimes
                  </h3>
                  <p className="text-sm text-[#D7DEE8] leading-relaxed">
                    {publication.synopticSummary}
                  </p>
                </div>
              )}

              <div className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                <h3 className="text-xs font-bold uppercase text-[#8A94A6] tracking-wider mb-2">
                  Keywords &amp; Atmospheric Descriptors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {publication.keywords.map((kw, ki) => (
                    <span
                      key={ki}
                      className="bg-[#0F141A] text-[#4FA8E0] border border-[#334155] text-xs px-2.5 py-1 rounded"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Observation Data Tables */}
          {activeTab === 'data' && (
            <div className="flex flex-col gap-4">
              {publication.sections.filter(s => s.tableData).length === 0 ? (
                <div className="p-8 text-center text-[#8A94A6] bg-[#1E2733] rounded border border-[#334155]">
                  No structured telemetry tables recorded in this specific monograph.
                </div>
              ) : (
                publication.sections.filter(s => s.tableData).map((sec, idx) => (
                  <div key={idx} className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                    <h3 className="text-sm font-bold text-white mb-2">
                      {sec.title}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0F141A] border-b border-[#334155] text-[#8A94A6]">
                            {sec.tableData!.headers.map((h, hi) => (
                              <th key={hi} className="p-2.5 font-bold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.tableData!.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-[#334155]/60 hover:bg-[#17212B]">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-2.5 font-mono text-xs text-white">
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

          {/* Tab 4: Advisory */}
          {activeTab === 'advisory' && (
            <div className="flex flex-col gap-4">
              {publication.recommendations && publication.recommendations.length > 0 ? (
                <div className="bg-[#1E2733] p-4 rounded border border-[#334155]">
                  <h3 className="text-xs font-bold uppercase text-[#FF8C42] tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Operational Actions &amp; Public Advisories</span>
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {publication.recommendations.map((rec, ri) => (
                      <li key={ri} className="flex items-start gap-2 text-xs text-[#D7DEE8]">
                        <span className="material-symbols-outlined text-[#FF8C42] text-[16px] shrink-0 mt-0.5">
                          arrow_right
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-8 text-center text-[#8A94A6] bg-[#1E2733] rounded border border-[#334155]">
                  No special advisories attached to this research monograph.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#0F141A] px-5 py-3 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A94A6]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
            <span>Document Status: Official Open Data Publication (Mausam Archive)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#0B72B9] hover:bg-[#0B72B9]/80 text-white font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Export / Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#1E2733] hover:bg-[#334155] text-[#D7DEE8] rounded transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
