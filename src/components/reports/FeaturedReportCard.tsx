import React from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import {
  FileText,
  Download,
  Printer,
  Bookmark,
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { getCategoryTheme, estimateReadingTime } from './reportUtils';

interface FeaturedReportCardProps {
  publication: MeteorologicalPublication;
  onOpenReport: (pub: MeteorologicalPublication) => void;
  onBookmark: (id: string) => void;
  isSaved: boolean;
}

export const FeaturedReportCard: React.FC<FeaturedReportCardProps> = ({
  publication,
  onOpenReport,
  onBookmark,
  isSaved,
}) => {
  const theme = getCategoryTheme(publication);
  const readingTime = estimateReadingTime(publication);

  return (
    <div
      id="featured-report-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#132235] via-[#0E1928] to-[#0A111A] border-2 border-[#38BDF8]/40 p-6 sm:p-8 lg:p-9 shadow-2xl transition-all duration-300 hover:border-[#38BDF8]/70 group"
    >
      {/* Decorative Monsoon / Atmospheric Contour Vector */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none hidden md:block">
        <svg
          className="w-full h-full"
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 50,0 Q 150,150 280,100 T 300,300"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="6,6"
          />
          <path
            d="M 0,100 Q 180,200 240,250 T 290,400"
            stroke="#2ECC71"
            strokeWidth="1.2"
          />
          <circle cx="200" cy="180" r="40" stroke="#818CF8" strokeWidth="1" strokeOpacity="0.6" fill="none" />
          <circle cx="200" cy="180" r="80" stroke="#818CF8" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
          <circle cx="200" cy="180" r="3" fill="#38BDF8" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Core Content */}
        <div className="max-w-3xl space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#38BDF8] text-[#0A1017] text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              FEATURED THIS MONTH
            </span>

            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold uppercase border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
              {publication.type}
            </span>

            <span className="text-xs text-[#94A3B8] font-mono">
              Doc ID: {publication.documentNumber}
            </span>
          </div>

          <h3
            onClick={() => onOpenReport(publication)}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-[#38BDF8] transition-colors cursor-pointer tracking-tight leading-tight"
          >
            {publication.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed line-clamp-3">
            {publication.abstract}
          </p>

          {/* Key Metadata Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#94A3B8] font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091119] border border-[#1E2E40]">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{publication.date}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091119] border border-[#1E2E40]">
              <BarChart2 className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>{publication.category}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091119] border border-[#1E2E40]">
              <span className="text-[#38BDF8] font-bold">Est:</span>
              <span>{readingTime}</span>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between sm:justify-start gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1E2E40]">
          <button
            type="button"
            onClick={() => onOpenReport(publication)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0B72B9] hover:from-[#38BDF8] hover:to-[#0284C7] text-white hover:text-[#0A1017] font-black text-xs font-mono transition-all flex items-center gap-2 shadow-xl shadow-[#0284C7]/30 hover:scale-105 cursor-pointer"
          >
            <span>READ FULL REPORT</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBookmark(publication.id)}
              className={`p-2.5 rounded-xl text-xs font-mono transition-colors border flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                  : 'bg-[#091119] text-[#94A3B8] hover:text-white border-[#1E2E40]'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Report'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
