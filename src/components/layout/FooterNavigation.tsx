import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export type FooterView = 'terms' | 'privacy' | 'api' | 'debug';

interface FooterNavigationProps {
  activeTab: string;
  onNavigate: (view: FooterView) => void;
}

interface FooterLinkItem {
  id: FooterView;
  labelKey: 'termsOfObservation' | 'privacyPolicy' | 'openDataApi' | 'apiDebug';
  defaultLabel: string;
}

const FOOTER_LINKS: FooterLinkItem[] = [
  { id: 'terms', labelKey: 'termsOfObservation', defaultLabel: 'Terms of Observation' },
  { id: 'privacy', labelKey: 'privacyPolicy', defaultLabel: 'Privacy Policy' },
  { id: 'api', labelKey: 'openDataApi', defaultLabel: 'Open Data API' },
  { id: 'debug', labelKey: 'apiDebug', defaultLabel: 'IMD API Diagnostics' },
];

export const FooterNavigation: React.FC<FooterNavigationProps> = ({
  activeTab,
  onNavigate,
}) => {
  const { t } = useLanguage();

  return (
    <nav aria-label="Legal and API Links" className="flex items-center gap-3 sm:gap-4 flex-wrap">
      {FOOTER_LINKS.map((link, index) => {
        const isActive = activeTab === link.id;
        const translatedLabel = t(link.labelKey, link.defaultLabel);

        return (
          <React.Fragment key={link.id}>
            {index > 0 && <span className="text-[#334155] select-none" aria-hidden="true">•</span>}
            <button
              type="button"
              id={`footer-link-${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(link.id);
              }}
              className={`transition-colors cursor-pointer text-xs py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#4FA8E0] ${
                isActive
                  ? 'text-[#4FA8E0] font-bold underline underline-offset-2'
                  : 'text-[#8A94A6] hover:text-[#D7DEE8] hover:underline'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {translatedLabel}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
