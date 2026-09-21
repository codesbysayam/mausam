import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  FileText,
  Cpu,
  ShieldCheck,
  Palette,
  CheckSquare,
  Bookmark,
  Search,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Terminal,
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

type DocSection = 'prd' | 'architecture' | 'rules' | 'design' | 'tasks' | 'memory';

interface DocsPageProps {
  onNavigateHome?: () => void;
  initialDoc?: DocSection;
}

interface NavItem {
  id: DocSection;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  filePath: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'prd',
    title: 'PRD & Overview',
    subtitle: 'Product vision, personas & requirements',
    icon: FileText,
    filePath: 'docs/PRD.md',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    subtitle: 'System topology, pipelines & data flow',
    icon: Cpu,
    filePath: 'docs/ARCHITECTURE.md',
  },
  {
    id: 'rules',
    title: 'Engineering Rules',
    subtitle: 'Anti-fabrication, security & conventions',
    icon: ShieldCheck,
    filePath: 'docs/RULES.md',
  },
  {
    id: 'design',
    title: 'Design System',
    subtitle: 'Tokens, typography & UI console specs',
    icon: Palette,
    filePath: 'docs/DESIGN.md',
  },
  {
    id: 'tasks',
    title: 'Tasks & Roadmap',
    subtitle: 'Implemented work & active checklist',
    icon: CheckSquare,
    filePath: 'docs/TASKS.md',
  },
  {
    id: 'memory',
    title: 'Project Memory',
    subtitle: 'Key ADRs, limitations & knowledge',
    icon: Bookmark,
    filePath: 'docs/MEMORY.md',
  },
];

export const DocsPage: React.FC<DocsPageProps> = ({ onNavigateHome, initialDoc = 'prd' }) => {
  const { t } = useLanguage();
  const [activeDoc, setActiveDoc] = useState<DocSection>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const docParam = params.get('doc');
      if (docParam && NAV_ITEMS.some((item) => item.id === docParam)) {
        return docParam as DocSection;
      }
    }
    return initialDoc;
  });

  const [copiedDoc, setCopiedDoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeDoc]);

  const handleSelectDoc = (id: DocSection) => {
    setActiveDoc(id);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const newUrl = `${window.location.pathname}?doc=${id}`;
      window.history.pushState({ doc: id }, '', newUrl);
    }
  };

  const handleCopyMarkdownNotice = () => {
    const activeItem = NAV_ITEMS.find((n) => n.id === activeDoc);
    if (!activeItem) return;
    navigator.clipboard.writeText(`Refer to repository file: ${activeItem.filePath}`);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const activeItem = NAV_ITEMS.find((item) => item.id === activeDoc) || NAV_ITEMS[0];

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-4 text-[#D7DEE8]">
      {/* Top Header & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1D5278]/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="mausam-button mausam-button-outline inline-flex items-center gap-2 text-xs py-1.5 px-3 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('returnToPortal', 'Return to Weather Portal')}</span>
          </button>
          <span className="text-[#1D5278]">/</span>
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
            MAUSAM Project Documentation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#081F33] border border-[#1D5278] text-[11px] font-mono text-[#AFC4D8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Version 2.4.0 (Verified)
          </span>
          <button
            type="button"
            onClick={handleCopyMarkdownNotice}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B263D] hover:bg-[#123652] border border-[#1D5278] text-xs text-[#AFC4D8] hover:text-white transition-colors"
            title="Copy path of canonical documentation file"
          >
            {copiedDoc ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 text-xs">Copied Path</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="text-xs font-mono">{activeItem.filePath}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Document Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 flex flex-col gap-2">
          <div className="p-3 bg-[#0B263D] border border-[#1D5278] rounded-lg">
            <h2 className="text-xs font-mono uppercase text-[#8EA3B8] tracking-wider mb-2 px-1">
              Documentation Suite
            </h2>
            <nav className="flex flex-col gap-1.5" aria-label="Documentation sections">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeDoc === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectDoc(item.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-md text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0B72B9]/20 border border-[#38BDF8] text-white'
                        : 'hover:bg-[#123652]/60 border border-transparent text-[#AFC4D8] hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isActive ? 'text-[#38BDF8]' : 'text-[#8EA3B8]'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                        <span>{item.title}</span>
                        {isActive && <ChevronRight className="w-3 h-3 text-[#38BDF8]" />}
                      </div>
                      <div className="text-[11px] text-[#8EA3B8] truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 bg-[#081F33] border border-[#1D5278]/60 rounded-lg text-xs">
            <div className="text-[#38BDF8] font-semibold flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Canonical Source
            </div>
            <p className="text-[#8EA3B8] leading-relaxed text-[11px]">
              All content is synchronized with the six primary markdown files in{' '}
              <code className="bg-[#0B263D] px-1 py-0.5 rounded text-[#AFC4D8]">docs/</code>. Zero synthetic data policy is strictly enforced.
            </p>
          </div>
        </aside>

        {/* Right Main Document Viewer */}
        <main className="lg:col-span-9">
          <div className="bg-[#0B263D] border border-[#1D5278] rounded-lg p-6">
            {activeDoc === 'prd' && <PrdSection />}
            {activeDoc === 'architecture' && <ArchitectureSection />}
            {activeDoc === 'rules' && <RulesSection />}
            {activeDoc === 'design' && <DesignSection />}
            {activeDoc === 'tasks' && <TasksSection />}
            {activeDoc === 'memory' && <MemorySection />}
          </div>
        </main>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Section 1: PRD                                                             */
/* -------------------------------------------------------------------------- */
const PrdSection: React.FC = () => (
  <article className="space-y-6">
    <div className="border-b border-[#1D5278]/80 pb-4">
      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
        <span>DOCUMENT 1 OF 6</span>
        <span>•</span>
        <span>docs/PRD.md</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        Product Requirements Document (PRD)
      </h1>
      <p className="text-sm text-[#AFC4D8] mt-1">
        High-precision meteorological observation, Doppler radar nowcasting, and environmental intelligence for India.
      </p>
    </div>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        1. Purpose &amp; Problem Statement
      </h2>
      <p className="text-xs text-[#D7DEE8] leading-relaxed">
        India spans 3.287 million km² with extreme geographical diversity—from Himalayan glaciers to tropical peninsulas. Weather events directly dictate public safety and agricultural output for 1.4 billion people.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <div className="p-3 rounded bg-[#081F33] border border-[#1D5278]">
          <div className="text-xs font-bold text-[#E74C3C] mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Existing Industry Failures
          </div>
          <ul className="list-disc list-inside text-[11px] text-[#AFC4D8] space-y-1">
            <li>Fragmented data scattered across uncoordinated government portals.</li>
            <li>Synthetic/fake numbers displayed when sensors experience downtime.</li>
            <li>Commercial weather paywalls restricting public access.</li>
            <li>Lack of actionable agrometeorological guidance for rural farmers.</li>
          </ul>
        </div>

        <div className="p-3 rounded bg-[#081F33] border border-[#1D5278]">
          <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            The MAUSAM Solution
          </div>
          <ul className="list-disc list-inside text-[11px] text-[#AFC4D8] space-y-1">
            <li>Coordinates-first precision for every point across India.</li>
            <li>Strict zero-fabrication mandate with transparent attribution.</li>
            <li>Free-first open access baseline (Open-Meteo, ECMWF, GFS, ICON).</li>
            <li>Integration with official IMD, NDMA SACHET, and CPCB protocols.</li>
          </ul>
        </div>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        2. Target User Personas
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-[#1D5278] rounded">
          <thead className="bg-[#081F33] text-[#AFC4D8] font-mono text-[11px]">
            <tr>
              <th className="p-2.5 border-b border-[#1D5278]">Persona</th>
              <th className="p-2.5 border-b border-[#1D5278]">Context &amp; Needs</th>
              <th className="p-2.5 border-b border-[#1D5278]">Key Features Used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D5278]/60 text-[11px]">
            <tr>
              <td className="p-2.5 font-bold text-white">Urban Commuter</td>
              <td className="p-2.5 text-[#AFC4D8]">Daily transit, precipitation timing, NAQI air quality.</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">Hourly Forecast, AQI, Ask MAUSAM</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-white">Agricultural Producer</td>
              <td className="p-2.5 text-[#AFC4D8]">Soil moisture, spray windows, monsoon arrival, heat stress.</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">AGROMET Portal, Crop Advisories</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-white">Coastal / Fisherfolk</td>
              <td className="p-2.5 text-[#AFC4D8]">Wave heights, swell, cyclonic storm tracks, port signals.</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">Marine Intel, Cyclone Radar, Port Warnings</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-white">Disaster Manager (SDMA)</td>
              <td className="p-2.5 text-[#AFC4D8]">Severe weather bulletins, flash floods, radar nowcasting.</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">SACHET Alerts, DWR Radar, Audio Chime</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        3. Core Functional Capabilities
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { title: 'Surface Observations', desc: 'Temperature, humidity, pressure, dew point, wind vectors, and UV index.' },
          { title: '7-Day Synoptic Forecast', desc: 'Ensemble consensus across ECMWF IFS, GFS, ICON, and IMD models.' },
          { title: 'SACHET Disaster Warnings', desc: 'NDMA CAP protocol with official 4-tier warning color coding.' },
          { title: 'Doppler Radar Network', desc: 'Interactive reflectivity nowcasting across 37 IMD radar stations.' },
          { title: 'National AQI (CPCB)', desc: '6-tier breakpoint air quality index tracking PM2.5, PM10, NO2, and ozone.' },
          { title: 'Agrometeorology Engine', desc: 'Evapotranspiration, soil moisture index, and crop spraying windows.' },
        ].map((feat, idx) => (
          <div key={idx} className="p-3 bg-[#081F33] border border-[#1D5278] rounded">
            <h3 className="text-xs font-bold text-[#38BDF8] mb-1">{feat.title}</h3>
            <p className="text-[11px] text-[#8EA3B8] leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </article>
);

/* -------------------------------------------------------------------------- */
/* Section 2: ARCHITECTURE                                                    */
/* -------------------------------------------------------------------------- */
const ArchitectureSection: React.FC = () => (
  <article className="space-y-6">
    <div className="border-b border-[#1D5278]/80 pb-4">
      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
        <span>DOCUMENT 2 OF 6</span>
        <span>•</span>
        <span>docs/ARCHITECTURE.md</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        System Architecture &amp; Data Pipeline
      </h1>
      <p className="text-sm text-[#AFC4D8] mt-1">
        Hybrid full-stack architecture running on Node.js (Express + Vite) and Vercel serverless edge functions.
      </p>
    </div>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        1. Architectural Topology
      </h2>
      <div className="bg-[#071A2D] p-3 rounded border border-[#1D5278] font-mono text-[11px] text-[#38BDF8] overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────┐
│                    MAUSAM React 19 Client                   │
│   (Vite 6 • Tailwind v4 • Leaflet Maps • LocationContext)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / HTTP (/api/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            HYBRID ROUTING & SERVERLESS GATEWAYS             │
│   [ Express 4.21 on Port 3000 ]   [ Vercel Edge Functions ] │
│   • server.ts                     • /api/weather.ts         │
│   • /api/warnings (NDMA / IMD)    • /api/warnings.ts        │
│   • /api/imd/* (Direct Proxy)     • /api/radar.ts           │
│   • /api/ask-mausam (Gemini AI)   • /api/system.ts          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      RESILIENCE LAYER        │ │   UPSTREAM DATA SOURCES    │
│ • In-Memory LRU Cache        │ │ • IMD (api.imd.gov.in)     │
│ • Request Deduplication      │ │ • NDMA SACHET CAP Alerts   │
│ • Upstash Redis REST Support │ │ • Open-Meteo Global NWP    │
│ • Stale-While-Revalidate     │ │ • CPCB National AQI        │
│ • AbortController Timeouts   │ │ • RainViewer Radar Tiles   │
└──────────────────────────────┘ └────────────────────────────┘`}
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        2. External Data Sources &amp; Failover Matrix
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-[#1D5278] rounded">
          <thead className="bg-[#081F33] text-[#AFC4D8] font-mono text-[11px]">
            <tr>
              <th className="p-2.5 border-b border-[#1D5278]">Provider</th>
              <th className="p-2.5 border-b border-[#1D5278]">Protocol / Feed</th>
              <th className="p-2.5 border-b border-[#1D5278]">Auth Mechanism</th>
              <th className="p-2.5 border-b border-[#1D5278]">Role &amp; Fallback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D5278]/60 text-[11px]">
            <tr>
              <td className="p-2.5 font-bold text-white">India Met Department (IMD)</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">/current_wx, /cityforecast</td>
              <td className="p-2.5 font-mono text-[#F1C40F]">IMD_API_KEY</td>
              <td className="p-2.5 text-[#AFC4D8]">Primary Source. Falls back to Open-Meteo.</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-white">NDMA SACHET</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">CAP v1.2 XML / JSON</td>
              <td className="p-2.5 text-emerald-400">Public Protocol</td>
              <td className="p-2.5 text-[#AFC4D8]">Official Disaster Alerts (Floods, Storms).</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-white">Open-Meteo</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">/v1/forecast</td>
              <td className="p-2.5 text-emerald-400">Open Access</td>
              <td className="p-2.5 text-[#AFC4D8]">High-Resolution Numerical Forecast Baseline.</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold text-white">CPCB Central Registry</td>
              <td className="p-2.5 font-mono text-[#38BDF8]">CAAQMS Stations</td>
              <td className="p-2.5 text-emerald-400">Public Open Data</td>
              <td className="p-2.5 text-[#AFC4D8]">Official Ground NAQI Station Telemetry.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        3. Production Build &amp; Deployment Pipeline
      </h2>
      <p className="text-xs text-[#AFC4D8] leading-relaxed">
        Container cold-start latency and Node.js runtime ES Module compatibility are managed through an automated <code className="text-[#38BDF8] font-mono">esbuild</code> bundle pipeline:
      </p>
      <div className="bg-[#071A2D] p-3 rounded border border-[#1D5278] font-mono text-xs text-white">
        <span className="text-[#8EA3B8] select-none">$ </span>
        <span className="text-emerald-400">npm run build</span>
        <div className="text-[11px] text-[#8EA3B8] mt-1 break-all whitespace-pre-wrap">
          &gt; vite build &amp;&amp; esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
        </div>
      </div>
    </section>
  </article>
);

/* -------------------------------------------------------------------------- */
/* Section 3: RULES                                                           */
/* -------------------------------------------------------------------------- */
const RulesSection: React.FC = () => (
  <article className="space-y-6">
    <div className="border-b border-[#1D5278]/80 pb-4">
      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
        <span>DOCUMENT 3 OF 6</span>
        <span>•</span>
        <span>docs/RULES.md</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        Engineering Standards &amp; Anti-Fabrication Rules
      </h1>
      <p className="text-sm text-[#AFC4D8] mt-1">
        Strict operational standards enforced across all engineering and AI agent modifications.
      </p>
    </div>

    <section className="space-y-3">
      <div className="p-4 rounded-lg bg-[#E74C3C]/10 border border-[#E74C3C]/40 text-[#D7DEE8]">
        <div className="flex items-center gap-2 text-sm font-bold text-[#E74C3C] mb-1">
          <AlertTriangle className="w-4 h-4" />
          Rule 1: Non-Negotiable Zero-Fabrication Mandate
        </div>
        <p className="text-xs leading-relaxed">
          Never output synthetic, fake, or mocked numbers under the guise of real meteorological telemetry. If an upstream sensor fails or an API token is missing, the system <strong>MUST</strong> explicitly return <code className="bg-[#081F33] px-1 py-0.5 rounded text-white font-mono">UNAVAILABLE</code> or <code className="bg-[#081F33] px-1 py-0.5 rounded text-white font-mono">NOT CONFIGURED</code>. Never claim a feature is <code className="text-emerald-400 font-mono">LIVE / OPERATIONAL</code> unless actively verified by an HTTP 200 health check.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-[#081F33] border border-[#1D5278] rounded">
          <h3 className="text-xs font-bold text-[#38BDF8] mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Client-Side Secrets
          </h3>
          <p className="text-[11px] text-[#AFC4D8] leading-relaxed">
            All private credentials (<code className="text-white font-mono">GEMINI_API_KEY</code>, <code className="text-white font-mono">IMD_API_KEY</code>, <code className="text-white font-mono">DATABASE_URL</code>) must remain strictly on the backend. Never prefix secrets with <code className="text-white font-mono">VITE_</code>.
          </p>
        </div>

        <div className="p-3 bg-[#081F33] border border-[#1D5278] rounded">
          <h3 className="text-xs font-bold text-[#38BDF8] mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Defensive Network AbortControllers
          </h3>
          <p className="text-[11px] text-[#AFC4D8] leading-relaxed">
            All outbound network requests must be wrapped with a 10-second <code className="text-white font-mono">AbortController</code> timeout and robust error boundaries to prevent process hangs.
          </p>
        </div>

        <div className="p-3 bg-[#081F33] border border-[#1D5278] rounded">
          <h3 className="text-xs font-bold text-[#38BDF8] mb-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Tailwind CSS Exclusivity
          </h3>
          <p className="text-[11px] text-[#AFC4D8] leading-relaxed">
            All styling must use Tailwind utility classes. Do not create ad-hoc component-level CSS files or inline style attributes for design parameters.
          </p>
        </div>

        <div className="p-3 bg-[#081F33] border border-[#1D5278] rounded">
          <h3 className="text-xs font-bold text-[#38BDF8] mb-1 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            20-Point Launch Audit Integrity
          </h3>
          <p className="text-[11px] text-[#AFC4D8] leading-relaxed">
            Every update must preserve the legal requirements: Terms of Observation, Privacy Policy, Cookie Consent, OpenAPI specifications, and 404 boundaries.
          </p>
        </div>
      </div>
    </section>
  </article>
);

/* -------------------------------------------------------------------------- */
/* Section 4: DESIGN                                                          */
/* -------------------------------------------------------------------------- */
const DesignSection: React.FC = () => (
  <article className="space-y-6">
    <div className="border-b border-[#1D5278]/80 pb-4">
      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
        <span>DOCUMENT 4 OF 6</span>
        <span>•</span>
        <span>docs/DESIGN.md</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        Design System &amp; Visual Specification
      </h1>
      <p className="text-sm text-[#AFC4D8] mt-1">
        The Government Meteorological Operational Console design archetype.
      </p>
    </div>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        1. Core Color Swatches
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: 'Canvas Deep', hex: '#071A2D', role: 'Main background canvas' },
          { name: 'Surface Card', hex: '#0B263D', role: 'Panels & weather cards' },
          { name: 'Subtle Border', hex: '#1D5278', role: '1px panel dividers' },
          { name: 'Sky Accent', hex: '#38BDF8', role: 'Active focus & highlights' },
        ].map((color, idx) => (
          <div key={idx} className="p-2.5 rounded bg-[#081F33] border border-[#1D5278]">
            <div
              className="w-full h-8 rounded mb-2 border border-white/10"
              style={{ backgroundColor: color.hex }}
            />
            <div className="text-xs font-bold text-white">{color.name}</div>
            <div className="text-[11px] font-mono text-[#38BDF8]">{color.hex}</div>
            <div className="text-[10px] text-[#8EA3B8] mt-0.5">{color.role}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        2. National Warning Severity Matrix
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { level: 'Green (Normal)', hex: '#00E676', label: 'No warning. Normal atmospheric conditions prevailing.' },
          { level: 'Yellow (Watch)', hex: '#F1C40F', label: 'Be updated. Keep tracking atmospheric progression.' },
          { level: 'Orange (Alert)', hex: '#E67E22', label: 'Be prepared. Potential disruption to infrastructure.' },
          { level: 'Red (Warning)', hex: '#E74C3C', label: 'Take action. Severe hazardous meteorological event.' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded bg-[#081F33] border"
            style={{ borderColor: `${item.hex}60` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.hex }} />
              <span className="text-xs font-bold" style={{ color: item.hex }}>
                {item.level}
              </span>
            </div>
            <p className="text-[11px] text-[#AFC4D8] leading-relaxed">{item.label}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        3. Typography Scale
      </h2>
      <p className="text-xs text-[#AFC4D8] leading-relaxed">
        Inter / System sans-serif for UI labels paired with tabular Monospace for numerical meteorological observations:
      </p>
      <div className="p-3 bg-[#081F33] border border-[#1D5278] rounded space-y-2">
        <div className="flex items-baseline justify-between border-b border-[#1D5278]/60 pb-1">
          <span className="text-xl font-bold text-white">Bhubaneswar Observatory</span>
          <span className="text-[11px] font-mono text-[#8EA3B8]">Station Title (20px / Bold)</span>
        </div>
        <div className="flex items-baseline justify-between border-b border-[#1D5278]/60 pb-1">
          <span className="text-3xl font-extrabold text-[#38BDF8] font-mono">31.4°C</span>
          <span className="text-[11px] font-mono text-[#8EA3B8]">Hero Telemetry (36px / ExtraBold)</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-[#D7DEE8]">Wind: 14 km/h WSW • Pressure: 1008.2 hPa</span>
          <span className="text-[11px] font-mono text-[#8EA3B8]">Scientific Parameters (12px / Regular)</span>
        </div>
      </div>
    </section>
  </article>
);

/* -------------------------------------------------------------------------- */
/* Section 5: TASKS                                                           */
/* -------------------------------------------------------------------------- */
const TasksSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const tasks = [
    { title: 'Coordinates-first geocoding engine', cat: 'Weather', done: true },
    { title: 'Open-Meteo multi-model ingestion baseline (ECMWF/GFS/ICON)', cat: 'Weather', done: true },
    { title: 'Official IMD REST API proxy connectors with in-flight deduplication', cat: 'Weather', done: true },
    { title: 'NDMA SACHET CAP XML/JSON warning parser', cat: 'Alerts', done: true },
    { title: 'Official emergency broadcast alert audio engine (/audio/mausam-alert.mp3)', cat: 'Alerts', done: true },
    { title: '37-station IMD Doppler Weather Radar directory & RainViewer tiles', cat: 'Radar', done: true },
    { title: 'CPCB National Air Quality Index (NAQI) 6-category engine', cat: 'AQI', done: true },
    { title: 'Agrometeorology (AGROMET) agronomic advisory engine', cat: 'Agromet', done: true },
    { title: 'Fluid draggable Ask MAUSAM button with edge-snapping physics', cat: 'UI/UX', done: true },
    { title: 'Full-stack Express + Vite hybrid deployment architecture', cat: 'Architecture', done: true },
    { title: 'MAUSAM 20-Point Launch Readiness Audit compliance', cat: 'Compliance', done: true },
    { title: 'Repository canonical documentation system (docs/*.md)', cat: 'Documentation', done: true },
    { title: 'Website interactive documentation portal (/docs)', cat: 'Documentation', done: true },
    { title: 'Direct INSAT-3D/3DR satellite thermal cloud-top raster processing', cat: 'Satellite', done: false },
    { title: 'WebPush notifications for district-level red alerts', cat: 'Alerts', done: false },
    { title: 'Offline PWA service worker asset caching for critical warnings', cat: 'Offline', done: false },
    { title: 'PostgreSQL historical telemetry archive automation', cat: 'Database', done: false },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.done;
    if (filter === 'pending') return !t.done;
    return true;
  });

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <article className="space-y-6">
      <div className="border-b border-[#1D5278]/80 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
          <span>DOCUMENT 5 OF 6</span>
          <span>•</span>
          <span>docs/TASKS.md</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Implementation Checklist &amp; Engineering Roadmap
        </h1>
        <p className="text-sm text-[#AFC4D8] mt-1">
          Verified implementation milestones and active roadmap tracking.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#081F33] border border-[#1D5278] rounded-lg">
        <div className="text-xs">
          <span className="text-[#AFC4D8]">Completion Status: </span>
          <span className="font-mono font-bold text-emerald-400">
            {completedCount} / {tasks.length} Completed ({Math.round((completedCount / tasks.length) * 100)}%)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'completed', 'pending'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                filter === mode
                  ? 'bg-[#0B72B9] text-white font-semibold'
                  : 'text-[#AFC4D8] hover:bg-[#123652]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredTasks.map((task, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-2.5 rounded border text-xs ${
              task.done
                ? 'bg-[#081F33]/80 border-[#1D5278]/80 text-[#D7DEE8]'
                : 'bg-[#0B263D] border-[#F1C40F]/40 text-[#F1C40F]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                  task.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'border border-[#8EA3B8]'
                }`}
              >
                {task.done ? '✓' : ''}
              </span>
              <span className={task.done ? 'text-white' : 'text-[#D7DEE8]'}>{task.title}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#071A2D] text-[#8EA3B8] border border-[#1D5278]">
              {task.cat}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* Section 6: MEMORY                                                          */
/* -------------------------------------------------------------------------- */
const MemorySection: React.FC = () => (
  <article className="space-y-6">
    <div className="border-b border-[#1D5278]/80 pb-4">
      <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1">
        <span>DOCUMENT 6 OF 6</span>
        <span>•</span>
        <span>docs/MEMORY.md</span>
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        Architectural Memory &amp; Context
      </h1>
      <p className="text-sm text-[#AFC4D8] mt-1">
        Persistent knowledge base, Architectural Decision Records (ADRs), and critical historical resolutions.
      </p>
    </div>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        1. Key Architectural Decisions (ADRs)
      </h2>
      <div className="space-y-3">
        {[
          {
            adr: 'ADR-001: Hybrid Runtime',
            desc: 'Supports dual-mode execution: full-stack Express in local/Cloud Run containers and serverless functions in Vercel.',
          },
          {
            adr: 'ADR-002: Free-First Ingestion Hierarchy',
            desc: 'Defaults to Open-Meteo high-resolution models when governmental IMD tokens are unconfigured, ensuring 100% operational availability out of the box.',
          },
          {
            adr: 'ADR-003: Emergency Alert Audio Standard',
            desc: 'Replaced temporary test sound with official meteorological broadcast frequency dual tone (853Hz + 960Hz) with deduplication hashing.',
          },
          {
            adr: 'ADR-004: Fluid Edge-Snapping Floating Button',
            desc: 'Employs requestAnimationFrame and cubic-bezier(0.16, 1, 0.3, 1) transition to smoothly dock to screen edges without abrupt jumps.',
          },
        ].map((item, idx) => (
          <div key={idx} className="p-3 bg-[#081F33] border border-[#1D5278] rounded">
            <h3 className="text-xs font-bold text-[#38BDF8] mb-0.5">{item.adr}</h3>
            <p className="text-[11px] text-[#AFC4D8] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="text-base font-bold text-white flex items-center gap-2 border-l-2 border-[#38BDF8] pl-2.5">
        2. Non-Negotiable Directives for Future Developers
      </h2>
      <ul className="list-disc list-inside text-xs text-[#AFC4D8] space-y-1.5 p-3 rounded bg-[#081F33] border border-[#1D5278]">
        <li>
          <strong className="text-white">Preserve the 20-Point Launch Audit:</strong> Never remove Terms of Observation, Privacy Policy, Cookie Consent, or OpenAPI specs.
        </li>
        <li>
          <strong className="text-white">Zero Fake Data:</strong> Never fabricate weather values or simulate warnings under the guise of real sensors.
        </li>
        <li>
          <strong className="text-white">Zero Client Keys:</strong> Keep all API keys on the server backend.
        </li>
      </ul>
    </section>
  </article>
);
