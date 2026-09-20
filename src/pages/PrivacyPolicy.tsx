import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigateHome?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigateHome }) => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined' && (window as any).MausamSEO?.updateMeta) {
      (window as any).MausamSEO.updateMeta('/privacy');
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
          id="privacy-back-btn"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] hover:text-white border border-[#334155] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
          <span>{t('returnToPortal', 'Return to Weather Portal')}</span>
        </button>

        <span className="text-xs font-mono text-[#94A3B8]">
          Doc Ref: MAUSAM-PRIVACY-2026-V1.4
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-[#0D1E33] p-6 sm:p-8 rounded-2xl mb-6 border border-[#1E3A5F] shadow-lg">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#0B72B9]/20 text-[#38BDF8] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#0B72B9]/40 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
              <span>National Open Data &amp; Citizen Privacy Framework</span>
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              Last Updated: October 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            MAUSAM Privacy Policy
          </h1>

          <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-3xl">
            Transparency, zero-key public architecture, and non-commercial citizen data handling across the MAUSAM atmospheric intelligence network.
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
            { id: 'sec-1', title: '1. What MAUSAM Is' },
            { id: 'sec-2', title: '2. Information We Collect' },
            { id: 'sec-3', title: '3. Location & Geolocation Handling' },
            { id: 'sec-4', title: '4. Weather Queries & Caching' },
            { id: 'sec-5', title: '5. Cookies & Browser Local Storage' },
            { id: 'sec-6', title: '6. Privacy-Conscious Analytics' },
            { id: 'sec-7', title: '7. Third-Party Services & Feeds' },
            { id: 'sec-8', title: '8. Maps & Interactive Imagery' },
            { id: 'sec-9', title: '9. Data Retention Policy' },
            { id: 'sec-10', title: '10. Data Security & Encryption' },
            { id: 'sec-11', title: '11. User Rights & Data Control' },
            { id: 'sec-12', title: "12. Children's Privacy" },
            { id: 'sec-13', title: '13. Changes to this Policy' },
            { id: 'sec-14', title: '14. Contact Information' },
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

      {/* Content */}
      <div className="bg-[#0D1E33] p-6 sm:p-8 rounded-2xl space-y-8 border border-[#1E3A5F] leading-relaxed text-sm shadow-md">
        {/* Section 1 */}
        <section id="sec-1" className="scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" aria-hidden="true" />
            <span>1. WHAT MAUSAM IS</span>
          </h2>
          <p className="text-[#CBD5E1]">
            MAUSAM is a public meteorological observation, disaster early-warning, and agrometeorological advisory platform engineered for India. Designed around an open, privacy-by-design model, MAUSAM delivers live weather telemetry without requiring citizen registration, account creation, or user tracking.
          </p>
        </section>

        {/* Section 2 */}
        <section id="sec-2" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            2. INFORMATION WE COLLECT
          </h2>
          <p className="text-[#CBD5E1]">
            We follow strict data minimization principles. MAUSAM does NOT collect:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#CBD5E1]">
            <li>Personal names, phone numbers, or residential addresses</li>
            <li>Government identification numbers or Aadhaar numbers</li>
            <li>Financial, credit card, or payment data</li>
            <li>Device biometric fingerprints or persistent advertising IDs</li>
          </ul>
          <p className="text-[#CBD5E1] mt-3">
            The only information processed is transient technical metadata required for HTTP delivery (IP addresses in web server logs rotated automatically) and preferences chosen directly by you (such as your preferred city or temperature units).
          </p>
        </section>

        {/* Section 3 */}
        <section id="sec-3" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            3. LOCATION &amp; GEOLOCATION HANDLING
          </h2>
          <p className="text-[#CBD5E1]">
            When you click "CHECK WEATHER FOR MY LOCATION", your browser prompts you for standard geolocation permission.
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#CBD5E1]">
            <li>Device coordinates are resolved client-side in your browser to match the nearest official IMD observatory.</li>
            <li>Your exact latitude and longitude are never permanently stored on our servers or linked to your identity.</li>
            <li>Geolocation is completely optional; you can search any of India's 36 States and 700+ districts manually without granting location permission.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="sec-4" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            4. WEATHER QUERIES &amp; CACHING
          </h2>
          <p className="text-[#CBD5E1]">
            When you view weather or radar for a city, an anonymous query is sent to our backend proxy. We cache meteorological results in edge memory to minimize strain on government servers (IMD/NDMA). Search queries are not associated with personal profiles.
          </p>
        </section>

        {/* Section 5 */}
        <section id="sec-5" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            5. COOKIES &amp; BROWSER LOCAL STORAGE
          </h2>
          <p className="text-[#CBD5E1]">
            MAUSAM uses HTML5 Local Storage instead of third-party tracking cookies. We store:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#CBD5E1]">
            <li><code>mausam_selected_location</code>: Your currently selected city/station so you don't have to re-search on reload.</li>
            <li><code>mausam_cookie_consent</code>: Your preference regarding optional anonymous analytics.</li>
            <li><code>mausam_recent_searches</code>: The last 5 locations you looked up, stored strictly inside your browser.</li>
          </ul>
          <p className="text-[#CBD5E1] mt-2">
            You can clear these anytime via your browser's "Clear Site Data" or via our Storage &amp; Privacy Preferences modal.
          </p>
        </section>

        {/* Section 6 */}
        <section id="sec-6" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            6. PRIVACY-CONSCIOUS ANALYTICS
          </h2>
          <p className="text-[#CBD5E1]">
            We operate an optional, anonymous telemetry system. Analytics are disabled by default until you grant consent. When enabled, it records coarse anonymous aggregate counts (such as page views or radar layer popularity) to help optimize server capacity. It never collects IP addresses, search terms, or device serials.
          </p>
        </section>

        {/* Section 7 */}
        <section id="sec-7" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            7. THIRD-PARTY SERVICES &amp; FEEDS
          </h2>
          <p className="text-[#CBD5E1]">
            MAUSAM connects to official public data sources:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#CBD5E1]">
            <li><strong>IMD (India Meteorological Department):</strong> Surface observations, Doppler radar scans, agromet bulletins.</li>
            <li><strong>NDMA SACHET:</strong> Common Alerting Protocol (CAP) disaster feeds.</li>
            <li><strong>CPCB (Central Pollution Control Board):</strong> National Air Quality Index (NAQI) monitoring stations.</li>
          </ul>
          <p className="text-[#CBD5E1] mt-2">
            All upstream requests are proxied through our edge functions; third parties do not see your client IP address.
          </p>
        </section>

        {/* Section 8 */}
        <section id="sec-8" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            8. MAPS &amp; INTERACTIVE IMAGERY
          </h2>
          <p className="text-[#CBD5E1]">
            Map background tiles are loaded from OpenStreetMap and CartoDB over encrypted HTTPS. No personally identifiable information is transmitted during tile downloads.
          </p>
        </section>

        {/* Section 9 */}
        <section id="sec-9" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            9. DATA RETENTION POLICY
          </h2>
          <p className="text-[#CBD5E1]">
            Server operational logs (used solely for debugging network errors and mitigating DDoS attacks) are retained for a maximum of 14 days before automated deletion. Local browser storage persists until you clear your cache.
          </p>
        </section>

        {/* Section 10 */}
        <section id="sec-10" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
            <span>10. DATA SECURITY &amp; ENCRYPTION</span>
          </h2>
          <p className="text-[#CBD5E1]">
            All communications between your device and MAUSAM are secured using modern Transport Layer Security (TLS 1.3 / HTTPS) with HTTP Strict Transport Security (HSTS) and preload enforcement. We implement strict Content-Security headers and cross-origin protections.
          </p>
        </section>

        {/* Section 11 */}
        <section id="sec-11" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            11. USER RIGHTS &amp; DATA CONTROL
          </h2>
          <p className="text-[#CBD5E1]">
            Because we do not maintain accounts or store personally identifiable citizen records, there are no profiles to delete. You have full autonomous control over local preferences through your browser settings or our preferences dialog.
          </p>
        </section>

        {/* Section 12 */}
        <section id="sec-12" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            12. CHILDREN'S PRIVACY
          </h2>
          <p className="text-[#CBD5E1]">
            MAUSAM is an educational and public meteorological service accessible to students and citizens of all ages. We do not knowingly collect personal data from anyone, including children under 13 years of age.
          </p>
        </section>

        {/* Section 13 */}
        <section id="sec-13" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            13. CHANGES TO THIS POLICY
          </h2>
          <p className="text-[#CBD5E1]">
            Any modifications to our privacy framework will be reflected on this page with an updated "Last Updated" timestamp. Substantive updates will be highlighted in our public changelog.
          </p>
        </section>

        {/* Section 14 */}
        <section id="sec-14" className="pt-6 border-t border-[#1E3A5F] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            14. CONTACT INFORMATION
          </h2>
          <p className="text-[#CBD5E1]">
            For questions regarding this Privacy Policy or open-data governance:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-[#132438] border border-[#1E3A5F] text-xs font-mono text-[#CBD5E1] space-y-1">
            <div>MAUSAM Open Data &amp; Privacy Office</div>
            <div>Smart India Hackathon 2026 Initiative</div>
            <div>Web: <a href="https://mausamgovt.vercel.app/privacy" className="text-[#38BDF8] underline">https://mausamgovt.vercel.app/privacy</a></div>
            <div>Inquiries: privacy@mausam.gov.in (Simulated / Prototype Inquiries)</div>
          </div>
        </section>
      </div>
    </div>
  );
};
