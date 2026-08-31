import React from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import { Sparkles, ArrowRight, Bookmark, Printer, Download, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { getCategoryTheme, estimateReadingTime } from './reportUtils';

interface ReportOfTheDayProps {
  publication: MeteorologicalPublication;
  onOpenReport: (pub: MeteorologicalPublication) => void;
  onBookmark: (id: string) => void;
  isSaved: boolean;
}

export const ReportOfTheDay: React.FC<ReportOfTheDayProps> = ({
  publication,
  onOpenReport,
  onBookmark,
  isSaved,
}) => {
  const theme = getCategoryTheme(publication);
  const readingTime = estimateReadingTime(publication);

  return (
    <div
      id="report-of-the-day"
      className="rounded-3xl bg-gradient-to-r from-[#111E2E] via-[#0E1724] to-[#0A111A] border border-[#22354A] p-5 sm:p-6 lg:p-7 shadow-xl relative overflow-hidden"
    >
      {/* Background soft spotlight glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              REPORT OF THE DAY • EDITORIAL SPOTLIGHT
            </span>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              {publication.date}
            </span>
            <span className="text-[11px] font-mono text-[#38BDF8]">
              • {readingTime}
            </span>
          </div>

          <h2
            onClick={() => onOpenReport(publication)}
            className="text-xl sm:text-2xl font-black text-white hover:text-[#38BDF8] transition-colors cursor-pointer tracking-tight leading-snug"
          >
            {publication.title}
          </h2>

          {/* Why it matters editorial excerpt based directly on report description */}
          <div className="p-3 rounded-xl bg-[#091119] border border-[#1E2E40] text-xs leading-relaxed text-[#CBD5E1]">
            <span className="text-[#38BDF8] font-bold font-mono uppercase text-[10px] block mb-0.5">
              Why it matters for research &amp; operations:
            </span>
            <p className="italic">
              &quot;{publication.abstract.slice(0, 220)}...&quot;
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#94A3B8] pt-1">
            <span>Issuing Authority: <strong className="text-white">{publication.issuingAuthority}</strong></span>
            <span>•</span>
            <span>Ref: <strong className="text-[#38BDF8]">{publication.documentNumber}</strong></span>
          </div>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between sm:justify-start gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#1E2E40]">
          <button
            type="button"
            onClick={() => onOpenReport(publication)}
            className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A1017] font-black text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#38BDF8]/20 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>EXPLORE REPORT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onBookmark(publication.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border cursor-pointer ${
              isSaved
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                : 'bg-[#14202E] text-[#94A3B8] hover:text-white border-[#1E2E40]'
            }`}
            title="Bookmark Report"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
            <span>{isSaved ? 'Saved in Library' : 'Save to Library'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
