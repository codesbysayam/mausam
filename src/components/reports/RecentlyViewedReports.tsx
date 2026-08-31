import React from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import { History, ArrowRight, X, BookOpen } from 'lucide-react';
import { getCategoryTheme } from './reportUtils';

interface RecentlyViewedReportsProps {
  recentIds: string[];
  allPublications: MeteorologicalPublication[];
  onOpenReport: (pub: MeteorologicalPublication) => void;
  onClear: () => void;
}

export const RecentlyViewedReports: React.FC<RecentlyViewedReportsProps> = ({
  recentIds,
  allPublications,
  onOpenReport,
  onClear,
}) => {
  const recentPubs = recentIds
    .map((id) => allPublications.find((p) => p.id === id))
    .filter((p): p is MeteorologicalPublication => Boolean(p));

  if (recentPubs.length === 0) return null;

  return (
    <div
      id="recently-viewed-reports-strip"
      className="rounded-2xl bg-[#091119] border border-[#1E2E40] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] shrink-0">
        <History className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span className="font-bold uppercase text-white">Recently Viewed:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-none">
        {recentPubs.map((pub) => {
          const theme = getCategoryTheme(pub);
          return (
            <button
              key={pub.id}
              type="button"
              onClick={() => onOpenReport(pub)}
              className="px-3 py-1.5 rounded-xl bg-[#0F1924] hover:bg-[#162536] border border-[#1E2E40] hover:border-[#38BDF8]/50 text-xs font-mono text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer max-w-[240px]"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
              <span className="truncate">{pub.title}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-[11px] font-mono text-[#64748B] hover:text-[#94A3B8] shrink-0 cursor-pointer hover:underline"
        title="Clear recent history"
      >
        Clear
      </button>
    </div>
  );
};
