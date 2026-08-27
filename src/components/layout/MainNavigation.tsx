import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TranslationDictionary } from '../../i18n/translations';

export type MainNavTab =
  | 'home'
  | 'weather'
  | 'forecast'
  | 'warnings'
  | 'radar'
  | 'aqi'
  | 'agromet'
  | 'reports';

interface MainNavigationProps {
  activeTab: MainNavTab | string;
  onTabChange: (tab: MainNavTab) => void;
  activeAlertCount?: number;
}

interface NavItemConfig {
  id: MainNavTab;
  labelKey: keyof TranslationDictionary;
  defaultLabel: string;
  icon: string;
  badge?: number;
}

const NAV_CONFIG: NavItemConfig[] = [
  { id: 'home', labelKey: 'home', defaultLabel: 'HOME', icon: 'home' },
  { id: 'weather', labelKey: 'weather', defaultLabel: 'WEATHER', icon: 'thermostat' },
  { id: 'forecast', labelKey: 'forecast', defaultLabel: 'FORECAST', icon: 'calendar_month' },
  { id: 'warnings', labelKey: 'warnings', defaultLabel: 'WARNINGS', icon: 'warning' },
  { id: 'radar', labelKey: 'radar', defaultLabel: 'RADAR & MAPS', icon: 'radar' },
  { id: 'aqi', labelKey: 'airQuality', defaultLabel: 'AQI & AIR', icon: 'air' },
  { id: 'agromet', labelKey: 'agromet', defaultLabel: 'AGROMET', icon: 'agriculture' },
  { id: 'reports', labelKey: 'reports', defaultLabel: 'REPORTS', icon: 'description' },
];

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activeTab,
  onTabChange,
  activeAlertCount = 0,
}) => {
  const { t } = useLanguage();

  return (
    <nav className="hidden md:block w-full bg-[#17212B] border-b border-[#334155] select-none" aria-label="Main Navigation">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-0">
          {NAV_CONFIG.map((item) => {
            const isActive = activeTab === item.id;
            const badgeCount = item.id === 'warnings' ? activeAlertCount : item.badge;
            const displayLabel = t(item.labelKey, item.defaultLabel);

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 h-12 px-3 lg:px-4 text-xs font-bold tracking-wider relative transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#4FA8E0] bg-[#1E2733]/60'
                    : 'text-[#D7DEE8] hover:text-[#4FA8E0] hover:bg-[#1E2733]/30'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {item.icon}
                </span>
                <span>{displayLabel}</span>

                {badgeCount && badgeCount > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E74C3C] text-white">
                    {badgeCount}
                  </span>
                ) : null}

                {/* Thin active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0B72B9]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
