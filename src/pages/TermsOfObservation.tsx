import React, { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface TermsOfObservationProps {
  onNavigateHome?: () => void;
}

export const TermsOfObservation: React.FC<TermsOfObservationProps> = ({ onNavigateHome }) => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-[900px] mx-auto py-4 text-[#D7DEE8]">
      {/* Breadcrumb / Back Navigation */}
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
          Doc Ref: MAUSAM-TERMS-OBS-2026
        </span>
      </div>

      {/* Header Banner */}
      <div className="mausam-panel bg-[#17212B] p-6 mb-6 border border-[#334155]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[11px] font-bold px-2 py-0.5 rounded border border-[#0B72B9]/40">
              National Meteorological Observation
            </span>
            <span className="text-xs text-[#8A94A6] font-mono">
              Effective Date: 26 August 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Terms of Observation &amp; Telemetry Usage
          </h1>

          <p className="text-sm text-[#8A94A6]">
            MAUSAM — Atmospheric Intelligence &amp; Citizen Weather Platform
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mausam-panel bg-[#17212B] p-6 sm:p-8 space-y-6 border border-[#334155] leading-[1.75] text-sm">
        <section>
          <h2 className="text-base font-bold text-white mb-2">
            1. SCOPE AND PROTOTYPE NATURE
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            The MAUSAM platform is an academic and technical prototype engineered for the Smart India Hackathon 2026. The observational values, automated forecasts, radar interpretations, and nowcasts presented herein are syntheses of multi-source meteorological feeds for demonstration, research, and citizen awareness purposes.
          </p>
        </section>

        <section className="pt-4 border-t border-[#334155]">
          <h2 className="text-base font-bold text-white mb-2">
            2. OBSERVATIONAL TELEMETRY &amp; SENSOR NETWORKS
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            Surface observations are collected from automatic weather stations (AWS), public environmental monitors (CPCB/CAAQMS), and simulated sensor telemetry feeds. While calibrated to standard meteorological protocols, telemetry latency or localized station variances may occur.
          </p>
        </section>

        <section className="pt-4 border-t border-[#334155]">
          <h2 className="text-base font-bold text-white mb-2">
            3. CITIZEN NOWCASTING &amp; CONTRIBUTIONS
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            Users submitting ground-truth weather observations (e.g. localized rainfall, visibility conditions, or storm damage reports) agree that submissions are public, non-confidential, and subject to automated validation filtering.
          </p>
        </section>

        <section className="pt-4 border-t border-[#334155]">
          <h2 className="text-base font-bold text-white mb-2">
            4. OFFICIAL EMERGENCY ADVISORIES
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            This platform does not replace official emergency broadcast systems. In the event of severe cyclones, floods, or natural disasters, citizens must heed official bulletins issued by the National Disaster Management Authority (NDMA), State Disaster Management Authorities (SDMAs), and the India Meteorological Department (IMD).
          </p>
        </section>
      </div>
    </div>
  );
};
