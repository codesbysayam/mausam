import React from 'react';
import {
  CloudRain,
  Wind,
  Waves,
  Zap,
  Ship,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { WeatherSystemEvent, ThreatLevel } from '../../types/cyclone';

interface CycloneThreatMatrixProps {
  activeSystem: WeatherSystemEvent;
}

export const CycloneThreatMatrix: React.FC<CycloneThreatMatrixProps> = ({
  activeSystem,
}) => {
  const getThreatBadge = (level: ThreatLevel) => {
    switch (level) {
      case 'RED':
        return {
          bg: 'bg-[#EF4444]/15 border-[#EF4444]/60 text-[#EF4444]',
          label: 'RED ALERT (Action)',
          dot: 'bg-[#EF4444] animate-pulse',
        };
      case 'ORANGE':
        return {
          bg: 'bg-[#F97316]/15 border-[#F97316]/60 text-[#FB923C]',
          label: 'ORANGE ALERT (Be Prepared)',
          dot: 'bg-[#F97316]',
        };
      case 'YELLOW':
        return {
          bg: 'bg-[#EAB308]/15 border-[#EAB308]/60 text-[#FDE047]',
          label: 'YELLOW WATCH (Be Updated)',
          dot: 'bg-[#EAB308]',
        };
      case 'WATCH':
        return {
          bg: 'bg-[#38BDF8]/15 border-[#38BDF8]/60 text-[#38BDF8]',
          label: 'MONITORING WATCH',
          dot: 'bg-[#38BDF8]',
        };
      default:
        return {
          bg: 'bg-[#10B981]/15 border-[#10B981]/60 text-[#34D399]',
          label: 'NO ADVERSE THREAT',
          dot: 'bg-[#10B981]',
        };
    }
  };

  const rainBadge = getThreatBadge(activeSystem.rainfallThreat);
  const windBadge = getThreatBadge(activeSystem.windThreat);
  const surgeBadge = getThreatBadge(activeSystem.stormSurgeThreat);
  const thunderBadge = getThreatBadge(activeSystem.thunderstormThreat);
  const marineBadge = getThreatBadge(activeSystem.coastalConditionsThreat || 'RED');

  const hasDamagePotential =
    Array.isArray(activeSystem.damagePotential) && activeSystem.damagePotential.length > 0;
  const hasSuggestedActions =
    Array.isArray(activeSystem.suggestedActions) && activeSystem.suggestedActions.length > 0;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 5-Card Threat Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Threat 1: Rainfall */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-[#60A5FA]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Rainfall Threat
              </span>
            </div>
          </div>
          <div className="my-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${rainBadge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${rainBadge.dot}`} />
              <span>{rainBadge.label}</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Isolated extremely heavy rainfall (&gt; 204.4 mm) over Coastal Andhra Pradesh, South Chhattisgarh, and South Odisha.
            </p>
          </div>
        </div>

        {/* Threat 2: Wind */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#FB923C]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Gale / Squall Wind
              </span>
            </div>
          </div>
          <div className="my-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${windBadge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${windBadge.dot}`} />
              <span>{windBadge.label}</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Squally wind speed reaching 55-65 kmph gusting to 75 kmph prevailing along &amp; off North AP and South Odisha coasts.
            </p>
          </div>
        </div>

        {/* Threat 3: Storm Surge */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Storm Surge / Tides
              </span>
            </div>
          </div>
          <div className="my-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${surgeBadge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${surgeBadge.dot}`} />
              <span>{surgeBadge.label}</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Storm surge of about 0.5 to 1.0 m above astronomical tide likely to inundate low lying coastal areas of Srikakulam &amp; Ganjam.
            </p>
          </div>
        </div>

        {/* Threat 4: Lightning & Squalls */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FACC15]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Thunderstorm
              </span>
            </div>
          </div>
          <div className="my-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${thunderBadge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${thunderBadge.dot}`} />
              <span>{thunderBadge.label}</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Frequent lightning strikes and severe cloud-to-ground discharges accompanied by high wind gusts up to 60 kmph.
            </p>
          </div>
        </div>

        {/* Threat 5: Marine / Fishermen */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-[#F87171]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Fishermen Warning
              </span>
            </div>
          </div>
          <div className="my-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${marineBadge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${marineBadge.dot}`} />
              <span>{marineBadge.label}</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
              Sea condition rough to very rough. Fishermen advised not to venture into Westcentral &amp; Northwest Bay of Bengal.
            </p>
          </div>
        </div>
      </div>

      {/* Official Expected Damage Potential & Suggested Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Expected Damage Potential */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FB923C]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                IMD Expected Damage Assessment
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#FB923C]/15 text-[#FB923C] text-[10px] font-mono font-bold">
              SOURCE: IMD
            </span>
          </div>

          {hasDamagePotential ? (
            <ul className="flex flex-col gap-2.5 mt-1">
              {activeSystem.damagePotential!.map((damage, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
                  <span>{damage}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#070C14] border border-[#1E2E40] text-xs text-[#94A3B8] font-mono">
              <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span>OFFICIAL DAMAGE ASSESSMENT NOT AVAILABLE FROM CURRENT BULLETIN</span>
            </div>
          )}
        </div>

        {/* Right: Suggested Action for Administration & Public */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {hasSuggestedActions ? 'Action Suggested by NDMA / IMD' : 'MAUSAM Safety Summary'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] text-[10px] font-mono font-bold">
              {hasSuggestedActions ? 'SOURCE: NDMA / IMD' : 'MAUSAM SUMMARY'}
            </span>
          </div>

          {hasSuggestedActions ? (
            <ul className="flex flex-col gap-2.5 mt-1">
              {activeSystem.suggestedActions!.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-2 text-xs text-[#CBD5E1]">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Total suspension of fishing operations over Westcentral and Northwest Bay of Bengal.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Judicious regulation of surface transport and waterborne movement along the Andhra-Odisha corridor.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>People in affected areas to remain indoors during peak squall and heavy downpour spells.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
