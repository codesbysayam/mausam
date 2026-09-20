import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, ArrowLeft, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface TermsOfObservationProps {
  onNavigateHome?: () => void;
}

export const TermsOfObservation: React.FC<TermsOfObservationProps> = ({ onNavigateHome }) => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined' && (window as any).MausamSEO?.updateMeta) {
      (window as any).MausamSEO.updateMeta('/terms');
    }
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[960px] mx-auto py-6 px-4 sm:px-6 text-[#E2E8F0]">
      {/* Breadcrumb / Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          id="terms-back-btn"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] hover:text-white border border-[#334155] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
          <span>{t('returnToPortal', 'Return to Weather Portal')}</span>
        </button>

        <span className="text-xs font-mono text-[#94A3B8]">
          Doc Ref: MAUSAM-TERMS-2026-V1.4
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-[#0D1E33] p-6 sm:p-8 rounded-2xl mb-6 border border-[#1E3A5F] shadow-lg">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#0B72B9]/20 text-[#38BDF8] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#0B72B9]/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
              <span>Official Terms &amp; Meteorological Disclaimers</span>
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              Last Updated: October 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Terms &amp; Conditions of Observation &amp; Service
          </h1>

          <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-3xl">
            Please read these terms carefully before accessing or using the MAUSAM National Atmospheric Intelligence &amp; Agromet Advisory Platform.
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-[#0D1E33] p-5 rounded-xl border border-[#1E3A5F] mb-6">
        <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
          <span>Table of Contents</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { id: 'sec-1', title: '1. Acceptance of Terms' },
            { id: 'sec-2', title: '2. Description of MAUSAM Platform' },
            { id: 'sec-3', title: '3. Weather & Forecast Disclaimer' },
            { id: 'sec-4', title: '4. Official Warning & Feed Limitations' },
            { id: 'sec-5', title: '5. Emergency & Life-Safety Disclaimer' },
            { id: 'sec-6', title: '6. Third-Party Services & Radar Feeds' },
            { id: 'sec-7', title: '7. User Responsibilities & Acceptable Use' },
            { id: 'sec-8', title: '8. Intellectual Property & Open Data' },
            { id: 'sec-9', title: '9. Availability & Service Interruptions' },
            { id: 'sec-10', title: '10. Limitation of Liability' },
            { id: 'sec-11', title: '11. Changes to Terms' },
            { id: 'sec-12', title: '12. Contact Information' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-left py-1.5 px-2.5 rounded hover:bg-[#1E293B] text-[#38BDF8] hover:text-white transition-colors cursor-pointer"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Legal Clauses */}
      <div className="bg-[#0D1E33] p-6 sm:p-8 rounded-2xl space-y-8 border border-[#1E3A5F] leading-relaxed text-sm shadow-md">
        {/* Section 1 */}
        <section id="sec-1" className="scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
            <span>1. ACCEPTANCE OF TERMS</span>
          </h2>
          <p className="text-[#CBD5E1]">
            By accessing, browsing, or utilizing the MAUSAM platform ("MAUSAM", "we", "us", or "our"), you confirm that you have read, understood, and agreed to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must refrain from using the platform.
          </p>
        </section>

        {/* Section 2 */}
        <section id="sec-2" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            2. DESCRIPTION OF MAUSAM PLATFORM
          </h2>
          <p className="text-[#CBD5E1]">
            MAUSAM is a public atmospheric intelligence, meteorological visualization, and agrometeorological advisory system engineered for high-precision observation across India. The platform aggregates public feeds from the India Meteorological Department (IMD), National Disaster Management Authority (NDMA SACHET), Central Pollution Control Board (CPCB), and international open earth-observation sensors into a unified zero-key citizen interface.
          </p>
        </section>

        {/* Section 3 */}
        <section id="sec-3" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            3. WEATHER AND FORECAST INFORMATION DISCLAIMER
          </h2>
          <p className="text-[#CBD5E1]">
            Atmospheric conditions are inherently dynamic and chaotic. While observational and numerical forecast calculations are produced using calibrated models and official station feeds, all forecasts, radar interpretations, air quality values, and precipitation projections are provided on an <strong>"AS IS" and "AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied.
          </p>
          <p className="text-[#CBD5E1] mt-2">
            Forecast models cannot guarantee 100% temporal or spatial accuracy. Localized microclimates, thermal inversions, convective thunderstorm cells, and rapid pressure changes may cause actual conditions to differ from model output.
          </p>
        </section>

        {/* Section 4 */}
        <section id="sec-4" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            4. OFFICIAL WARNING &amp; DATA-SOURCE LIMITATIONS
          </h2>
          <p className="text-[#CBD5E1]">
            Disaster advisories and CAP alerts rendered in the Weather Alert Center originate from the NDMA SACHET feeds and IMD warnings. While MAUSAM parses and verifies these feeds in real-time, delivery may experience latency due to telecommunication interruptions, upstream feed changes, or satellite connectivity issues. MAUSAM does not generate independent governmental emergency declarations.
          </p>
        </section>

        {/* Section 5: Emergency Disclaimer */}
        <section id="sec-5" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <div className="bg-[#1C160C] border border-[#B45309] rounded-xl p-4 sm:p-5">
            <h2 className="text-base font-bold text-[#F59E0B] mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" aria-hidden="true" />
              <span>5. EMERGENCY &amp; LIFE-SAFETY DISCLAIMER</span>
            </h2>
            <p className="text-[#FDE68A] font-medium text-sm">
              WEATHER INFORMATION FROM MAUSAM MUST NOT BE TREATED AS THE SOLE BASIS FOR EMERGENCY, EVACUATION, LIFE-SAFETY, MARITIME NAVIGATION, OR AVIATION DECISIONS.
            </p>
            <p className="text-[#CBD5E1] text-xs mt-2 leading-relaxed">
              During cyclones, storm surges, cloudbursts, severe flash flooding, or extreme heat events, citizens must strictly follow instructions broadcasted by the National Disaster Management Authority (NDMA), State Disaster Management Authorities (SDMAs), District Collectors, and local civil defense authorities.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="sec-6" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            6. THIRD-PARTY SERVICES &amp; RADAR FEEDS
          </h2>
          <p className="text-[#CBD5E1]">
            The platform incorporates mapping tiles (OpenStreetMap, CartoDB), radar animations, and air quality telemetry. Third-party services operate under their respective terms of service and availability policies. We are not responsible for the availability, uptime, or content of third-party networks.
          </p>
        </section>

        {/* Section 7 */}
        <section id="sec-7" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            7. USER RESPONSIBILITIES &amp; ACCEPTABLE USE
          </h2>
          <p className="text-[#CBD5E1]">
            You agree to use MAUSAM only for lawful, non-commercial purposes. You must not:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#CBD5E1]">
            <li>Engage in denial-of-service (DoS) attacks or automated scraping that exceeds rate limits.</li>
            <li>Attempt to bypass security headers, reverse engineer API proxies, or inject malicious payloads.</li>
            <li>Submit fraudulent citizen reports or false weather observations.</li>
            <li>Misrepresent MAUSAM data as formal government-issued disaster evacuation orders.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section id="sec-8" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            8. INTELLECTUAL PROPERTY &amp; OPEN DATA
          </h2>
          <p className="text-[#CBD5E1]">
            Meteorological observation data from government entities is subject to the National Data Sharing and Accessibility Policy (NDSAP). The MAUSAM interface, design system, telemetry algorithms, and visualizations are protected by intellectual property laws. Non-commercial civic re-use with proper attribution is welcomed under standard open-access principles.
          </p>
        </section>

        {/* Section 9 */}
        <section id="sec-9" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            9. AVAILABILITY AND SERVICE INTERRUPTIONS
          </h2>
          <p className="text-[#CBD5E1]">
            While we strive for continuous 24/7 availability across our edge network, we make no guarantee of uninterrupted, error-free operation. Scheduled maintenance, cloud infrastructure outages, or sensor telecommunication failures may temporarily disrupt access to live feeds.
          </p>
        </section>

        {/* Section 10 */}
        <section id="sec-10" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            10. LIMITATION OF LIABILITY
          </h2>
          <p className="text-[#CBD5E1]">
            To the maximum extent permitted by applicable law, the developers, contributors, and affiliated institutions of MAUSAM shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary damages, including but not limited to loss of profits, agricultural losses, crop damage, property damage, or personal injury resulting from the use or inability to use this platform.
          </p>
        </section>

        {/* Section 11 */}
        <section id="sec-11" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            11. CHANGES TO THESE TERMS
          </h2>
          <p className="text-[#CBD5E1]">
            We reserve the right to revise or update these Terms &amp; Conditions at any time. Any changes will be posted on this page with an updated "Last Updated" date. Continued use of the platform following the posting of modifications constitutes acceptance of the revised terms.
          </p>
        </section>

        {/* Section 12 */}
        <section id="sec-12" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            12. CONTACT INFORMATION
          </h2>
          <p className="text-[#CBD5E1]">
            For inquiries regarding these Terms of Observation, platform data practices, or academic collaboration:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-[#132438] border border-[#1E3A5F] text-xs font-mono text-[#CBD5E1] space-y-1">
            <div>MAUSAM Meteorological Technical Platform Group</div>
            <div>Smart India Hackathon 2026 Initiative</div>
            <div>Web Portal: <a href="https://mausamgovt.vercel.app" className="text-[#38BDF8] underline">https://mausamgovt.vercel.app</a></div>
            <div>Email: telemetry@mausam.gov.in (Simulated / Prototype Inquiries)</div>
          </div>
        </section>
      </div>
    </div>
  );
};
