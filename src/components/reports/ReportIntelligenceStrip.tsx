import React from 'react';
import { Sparkles, Calendar, TrendingUp, Radio, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const ReportIntelligenceStrip: React.FC = () => {
  return (
    <div
      id="reports-intelligence-strip"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {/* 1. LATEST RELEASE */}
      <div className="p-3.5 rounded-2xl bg-[#0C1520] border border-[#1E2E40] flex items-center gap-3 shadow-sm hover:border-[#38BDF8]/40 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/25 flex items-center justify-center text-[#38BDF8] shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block tracking-wider">
            LATEST CYCLE
          </span>
          <strong className="text-xs font-bold text-white block truncate">
            August 2026
          </strong>
        </div>
      </div>

      {/* 2. MOST ACTIVE DOMAIN */}
      <div className="p-3.5 rounded-2xl bg-[#0C1520] border border-[#1E2E40] flex items-center gap-3 shadow-sm hover:border-[#818CF8]/40 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#818CF8]/10 border border-[#818CF8]/25 flex items-center justify-center text-[#818CF8] shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block tracking-wider">
            MOST ACTIVE DOMAIN
          </span>
          <strong className="text-xs font-bold text-white block truncate">
            Scientific Monographs
          </strong>
        </div>
      </div>

      {/* 3. LATEST OFFICIAL BULLETIN */}
      <div className="p-3.5 rounded-2xl bg-[#0C1520] border border-[#1E2E40] flex items-center gap-3 shadow-sm hover:border-[#2ECC71]/40 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#2ECC71]/10 border border-[#2ECC71]/25 flex items-center justify-center text-[#2ECC71] shrink-0">
          <Radio className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block tracking-wider">
            LATEST BULLETIN
          </span>
          <strong className="text-xs font-bold text-white block truncate">
            All-India Synoptic
          </strong>
        </div>
      </div>

      {/* 4. PRIMARY TOPIC */}
      <div className="p-3.5 rounded-2xl bg-[#0C1520] border border-[#1E2E40] flex items-center gap-3 shadow-sm hover:border-[#F59E0B]/40 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 flex items-center justify-center text-[#F59E0B] shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block tracking-wider">
            CORE RESEARCH FOCUS
          </span>
          <strong className="text-xs font-bold text-white block truncate">
            Monsoon &amp; Convection
          </strong>
        </div>
      </div>

      {/* 5. DATA PROVIDERS */}
      <div className="col-span-2 md:col-span-1 lg:col-span-1 p-3.5 rounded-2xl bg-[#0C1520] border border-[#1E2E40] flex items-center gap-3 shadow-sm hover:border-[#38BDF8]/40 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/25 flex items-center justify-center text-[#38BDF8] shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block tracking-wider">
            DATA SOURCES
          </span>
          <strong className="text-xs font-bold text-[#38BDF8] block truncate font-mono">
            IMD • CPCB • ISRO • NCMRWF
          </strong>
        </div>
      </div>
    </div>
  );
};
