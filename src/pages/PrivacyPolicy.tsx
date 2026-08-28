import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface PrivacyPolicyProps {
  onNavigateHome?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigateHome }) => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto py-4 text-[#D7DEE8]">
      {/* Breadcrumb / Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="mausam-button mausam-button-outline inline-flex items-center gap-2 text-xs py-1.5 px-3 hover:text-white"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>{t('returnToPortal', 'Return to Weather Portal')}</span>
        </button>

        <span className="text-xs font-mono text-[#8A94A6]">
          Doc Ref: MAUSAM-DOC-PRIVACY-2026
        </span>
      </div>

      {/* Document Header */}
      <div className="mausam-panel bg-[#17212B] p-6 mb-6 border border-[#334155]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[11px] font-bold px-2 py-0.5 rounded border border-[#0B72B9]/40">
              Official Open Data Standards
            </span>
            <span className="text-xs text-[#8A94A6] font-mono">
              Last Updated: 26 August 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Privacy Policy
          </h1>

          <p className="text-sm text-[#8A94A6]">
            MAUSAM — Atmospheric Intelligence &amp; Citizen Weather Platform
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[#334155] text-xs text-[#D7DEE8] leading-relaxed bg-[#1E2733]/50 p-3 rounded">
          <strong className="text-white">Notice:</strong> MAUSAM is an experimental weather and environmental information platform developed as part of the Smart India Hackathon 2026. This is a technical hackathon prototype and not an official website of the Government of India or the India Meteorological Department.
        </div>
      </div>

      {/* Table of Contents */}
      <div className="mausam-panel bg-[#17212B] p-5 mb-6 border border-[#334155]">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
            toc
          </span>
          <span>Table of Contents</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { id: 'section-1', title: '1. Information We Collect' },
            { id: 'section-2', title: '2. Location Information' },
            { id: 'section-3', title: '3. Weather and Environmental Data' },
            { id: 'section-4', title: '4. Citizen-Generated Information' },
            { id: 'section-5', title: '5. Cookies and Local Storage' },
            { id: 'section-6', title: '6. Third-Party Services' },
            { id: 'section-7', title: '7. Data Security' },
            { id: 'section-8', title: "8. Children's Privacy" },
            { id: 'section-9', title: '9. Changes to this Policy' },
            { id: 'section-10', title: '10. Contact' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-left py-1 px-2 rounded hover:bg-[#1E2733] text-[#4FA8E0] hover:text-white transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Document Content */}
      <div className="mausam-panel bg-[#17212B] p-6 sm:p-8 space-y-8 border border-[#334155] leading-[1.75] text-sm">
        <div>
          <p className="text-[#D7DEE8] leading-relaxed">
            MAUSAM is an experimental weather and environmental information platform developed as part of the Smart India Hackathon 2026.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            This Privacy Policy explains how information may be handled when users interact with the MAUSAM platform.
          </p>
        </div>

        {/* Section 1 */}
        <section id="section-1" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            1. INFORMATION WE COLLECT
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            MAUSAM may process information required to provide location-based weather and environmental services.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            This may include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#D7DEE8]">
            <li>Selected city or location</li>
            <li>Weather preferences</li>
            <li>Forecast preferences</li>
            <li>Application settings</li>
            <li>Information voluntarily submitted through citizen reporting or feedback features</li>
          </ul>
          <p className="text-[#D7DEE8] leading-relaxed mt-3">
            Where technically required, approximate location information may be used to provide relevant weather information.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            MAUSAM should avoid collecting personally identifiable information unless it is specifically required for a feature and voluntarily provided by the user.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            2. LOCATION INFORMATION
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            Location information may be used to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#D7DEE8]">
            <li>Display weather conditions for the selected location</li>
            <li>Provide forecasts</li>
            <li>Generate weather-related recommendations</li>
            <li>Display AQI, humidity, pollen and other environmental information</li>
          </ul>
          <p className="text-[#D7DEE8] leading-relaxed mt-3">
            Users should be able to manually select a city instead of providing precise device location.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            MAUSAM should not retain precise location information longer than necessary for the operation of the relevant feature.
          </p>
        </section>

        {/* Section 3 */}
        <section id="section-3" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            3. WEATHER AND ENVIRONMENTAL DATA
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            Weather, AQI, pollen, rainfall and related information may be obtained from external data providers and public/open data sources.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            The platform may display source attribution alongside data where applicable.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            MAUSAM does not guarantee that third-party data is error-free, complete or continuously available.
          </p>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            4. CITIZEN-GENERATED INFORMATION
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            If the platform provides citizen weather reporting, users may voluntarily submit local observations.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            Such information may include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#D7DEE8]">
            <li>Weather observations</li>
            <li>Local conditions</li>
            <li>Rain reports</li>
            <li>Visibility reports</li>
            <li>Other environmental observations</li>
          </ul>
          <p className="text-[#D7DEE8] leading-relaxed mt-3">
            Users should not submit sensitive personal information through public reporting features.
          </p>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            5. COOKIES AND LOCAL STORAGE
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            The application may use browser storage or similar technologies to remember:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2 text-[#D7DEE8]">
            <li>Selected location</li>
            <li>Display preferences</li>
            <li>Theme preferences</li>
            <li>Application settings</li>
          </ul>
          <p className="text-[#D7DEE8] leading-relaxed mt-3">
            These technologies are intended to improve the user experience.
          </p>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            6. THIRD-PARTY SERVICES
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            MAUSAM may communicate with external services or APIs to retrieve weather and environmental information.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            The privacy practices of those external services may be different from those of MAUSAM.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            Users should consult the applicable policies of the respective data providers.
          </p>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            7. DATA SECURITY
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            Reasonable technical measures should be used to protect information processed by the platform.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            However, no internet-based application can guarantee absolute security.
          </p>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            8. CHILDREN'S PRIVACY
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            MAUSAM is not specifically designed to collect personal information from children.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            Users should not submit unnecessary personal or sensitive information through the platform.
          </p>
        </section>

        {/* Section 9 */}
        <section id="section-9" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            9. CHANGES TO THIS POLICY
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            This Privacy Policy may be updated as the MAUSAM platform develops.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            The "Last Updated" date will indicate when the policy was most recently revised.
          </p>
        </section>

        {/* Section 10 */}
        <section id="section-10" className="pt-4 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-3">
            10. CONTACT
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            For questions regarding this prototype or its data practices, users may contact the development team through the contact information provided on the MAUSAM platform.
          </p>
        </section>
      </div>
    </div>
  );
};
