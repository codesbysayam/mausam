import React, { useState } from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import { Clock, Calendar, ArrowRight, Eye, Sparkles, BookOpen } from 'lucide-react';
import { getCategoryTheme } from './reportUtils';

interface ResearchTimelineProps {
  publications: MeteorologicalPublication[];
  onOpenReport: (pub: MeteorologicalPublication) => void;
}

interface TimelineGroup {
  period: string;
  count: number;
  items: MeteorologicalPublication[];
}

export const ResearchTimeline: React.FC<ResearchTimelineProps> = ({
  publications,
  onOpenReport,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AUG 2026');

  // Group publications chronologically
  const timelineGroups: TimelineGroup[] = [
    {
      period: 'AUG 2026',
      count: publications.filter(p => p.date.toLowerCase().includes('august') || p.date.toLowerCase().includes('aug')).length,
      items: publications.filter(p => p.date.toLowerCase().includes('august') || p.date.toLowerCase().includes('aug')),
    },
    {
      period: 'JUL 2026',
      count: publications.filter(p => p.date.toLowerCase().includes('july') || p.date.toLowerCase().includes('jul')).length,
      items: publications.filter(p => p.date.toLowerCase().includes('july') || p.date.toLowerCase().includes('jul')),
    },
    {
      period: 'JUN 2026',
      count: publications.filter(p => p.date.toLowerCase().includes('june') || p.date.toLowerCase().includes('jun')).length,
      items: publications.filter(p => p.date.toLowerCase().includes('june') || p.date.toLowerCase().includes('jun')),
    },
    {
      period: 'MAY 2026',
      count: publications.filter(p => p.date.toLowerCase().includes('may')).length,
      items: publications.filter(p => p.date.toLowerCase().includes('may')),
    },
    {
      period: '2025-2026 REGISTRIES',
      count: publications.filter(p => p.date.includes('2025')).length,
      items: publications.filter(p => p.date.includes('2025')),
    },
  ].filter(g => g.items.length > 0);

  const activeGroup = timelineGroups.find(g => g.period === selectedPeriod) || timelineGroups[0];

  return (
    <div
      id="meteorological-research-timeline"
      className="rounded-3xl bg-[#0B141F] border border-[#1E2E40] p-5 sm:p-7 lg:p-8 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#1E2E40] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#818CF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#818CF8]">
              Chronological Index
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Meteorological Research Timeline
          </h3>
        </div>

        <div className="text-xs font-mono text-[#94A3B8] flex items-center gap-2">
          <span>Active Epoch:</span>
          <span className="px-2.5 py-1 rounded-md bg-[#162332] text-[#38BDF8] border border-[#24394E] font-bold">
            {activeGroup?.period} ({activeGroup?.items.length} publications)
          </span>
        </div>
      </div>

      {/* Horizontal Timeline Track (Desktop) / Period Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none border-b border-[#1E2E40]/60">
        {timelineGroups.map((group) => {
          const isSelected = selectedPeriod === group.period;
          return (
            <button
              key={group.period}
              type="button"
              onClick={() => setSelectedPeriod(group.period)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all duration-200 shrink-0 flex items-center gap-2.5 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#0284C7] text-white shadow-lg shadow-[#0284C7]/25 scale-[1.02] border border-[#38BDF8]'
                  : 'bg-[#101B27] text-[#94A3B8] hover:text-white hover:bg-[#162536] border border-[#1E2E40]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{group.period}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#1A293A] text-[#64748B]'
                }`}
              >
                {group.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Period Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {activeGroup?.items.map((pub) => {
          const theme = getCategoryTheme(pub);
          return (
            <div
              key={pub.id}
              onClick={() => onOpenReport(pub)}
              className="p-4 rounded-2xl bg-[#091119] border border-[#1E2E40] hover:border-[#38BDF8]/60 transition-all duration-200 flex flex-col justify-between cursor-pointer group shadow-sm hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                    {theme.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {pub.size}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors line-clamp-2 leading-snug">
                  {pub.title}
                </h4>

                <p className="text-xs text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                  {pub.abstract}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E2E40] flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="font-mono text-[11px] truncate max-w-[160px]">
                  {pub.author}
                </span>
                <span className="text-[#38BDF8] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-mono font-bold text-[11px]">
                  <span>READ</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
