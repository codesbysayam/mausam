import React from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import {
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
  Printer,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { getCategoryTheme, estimateReadingTime } from './reportUtils';

interface PublicationItemProps {
  publication: MeteorologicalPublication;
  viewMode: 'list' | 'grid';
  onOpenReport: (pub: MeteorologicalPublication) => void;
  onBookmark: (id: string) => void;
  isSaved: boolean;
}

export const PublicationItem: React.FC<PublicationItemProps> = ({
  publication,
  viewMode,
  onOpenReport,
  onBookmark,
  isSaved,
}) => {
  const theme = getCategoryTheme(publication);
  const readingTime = estimateReadingTime(publication);
  const Icon = theme.icon;

  if (viewMode === 'grid') {
    return (
      <div
        className="rounded-3xl bg-[#0C1521] border border-[#1E2E40] hover:border-[#38BDF8]/60 p-5 flex flex-col justify-between transition-all duration-200 group shadow-md hover:shadow-xl hover:scale-[1.01]"
      >
        <div>
          {/* Header metadata */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
              >
                <Icon className="w-3 h-3" />
                {theme.label}
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">
                {publication.type}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(publication.id);
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                  : 'bg-[#101A26] text-[#64748B] hover:text-white border-[#1E2E40]'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save publication'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
            </button>
          </div>

          <h3
            onClick={() => onOpenReport(publication)}
            className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors cursor-pointer leading-snug tracking-tight"
          >
            {publication.title}
          </h3>

          <p className="text-xs text-[#94A3B8] mt-2.5 line-clamp-3 leading-relaxed">
            {publication.abstract}
          </p>
        </div>

        {/* Footer Meta & Actions */}
        <div className="mt-5 pt-3.5 border-t border-[#1E2E40] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <div className="flex items-center gap-1 text-[#94A3B8]">
              <Calendar className="w-3 h-3 text-[#38BDF8]" />
              <span>{publication.date}</span>
            </div>
            <span className="text-[#38BDF8]">{readingTime}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#94A3B8] truncate max-w-[140px]">
              {publication.issuingAuthority}
            </span>

            <button
              type="button"
              onClick={() => onOpenReport(publication)}
              className="px-3 py-1.5 rounded-xl bg-[#142232] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#0A1017] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>EXPLORE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Row / List View (Premium scientific row)
  return (
    <div
      className="rounded-2xl bg-[#0C1521] border border-[#1E2E40] hover:border-[#38BDF8]/60 p-4 sm:p-5 transition-all duration-200 group shadow-md hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Left Icon & Core Info */}
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5"
          style={{
            backgroundColor: `${theme.accentColor}15`,
            borderColor: `${theme.accentColor}35`,
            color: theme.accentColor,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
            >
              {theme.label}
            </span>

            <span className="text-[10px] font-mono text-[#64748B] px-2 py-0.5 rounded bg-[#080E16] border border-[#1E2E40]">
              REF: {publication.documentNumber}
            </span>

            <span className="text-[11px] font-mono text-[#94A3B8]">
              {publication.date}
            </span>

            <span className="text-[11px] font-mono text-[#38BDF8]">
              • {readingTime}
            </span>
          </div>

          <h3
            onClick={() => onOpenReport(publication)}
            className="text-base sm:text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors cursor-pointer leading-snug tracking-tight"
          >
            {publication.title}
          </h3>

          <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
            {publication.abstract}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#64748B] pt-1">
            <span>Author / Directorate: <strong className="text-[#CBD5E1]">{publication.author}</strong></span>
            <span>•</span>
            <span>Issuing Authority: <strong className="text-[#CBD5E1]">{publication.issuingAuthority}</strong></span>
          </div>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end border-[#1E2E40]">
        <button
          type="button"
          onClick={() => onBookmark(publication.id)}
          className={`p-2.5 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
            isSaved
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
              : 'bg-[#101A26] text-[#64748B] hover:text-white border-[#1E2E40]'
          }`}
          title={isSaved ? 'Remove bookmark' : 'Bookmark publication'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenReport(publication)}
          className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A1017] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#38BDF8]/20 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>READ REPORT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
