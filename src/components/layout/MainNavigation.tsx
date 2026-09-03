import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { TranslationDictionary } from '../../i18n/translations';
import { triggerHaptic } from '../../utils/haptics';

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
  { id: 'home', labelKey: 'home', defaultLabel: 'Overview', icon: 'space_dashboard' },
  { id: 'weather', labelKey: 'weather', defaultLabel: 'Weather', icon: 'wb_sunny' },
  { id: 'forecast', labelKey: 'forecast', defaultLabel: 'Forecast', icon: 'timeline' },
  { id: 'warnings', labelKey: 'warnings', defaultLabel: 'Warnings', icon: 'warning_amber' },
  { id: 'radar', labelKey: 'radar', defaultLabel: 'Radar & Maps', icon: 'radar' },
  { id: 'aqi', labelKey: 'airQuality', defaultLabel: 'Air Quality', icon: 'air' },
  { id: 'agromet', labelKey: 'agromet', defaultLabel: 'Agromet', icon: 'potted_plant' },
  { id: 'reports', labelKey: 'reports', defaultLabel: 'Reports', icon: 'summarize' },
];

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activeTab,
  onTabChange,
  activeAlertCount = 0,
}) => {
  const { t } = useLanguage();

  return (
    <nav className="hidden md:block w-full bg-[#071A2D] border-b border-[#1D4E73] select-none" aria-label="Primary Navigation">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
        <div className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto scrollbar-none py-1.5">
          {NAV_CONFIG.map((item) => {
            const isActive = activeTab === item.id;
            const badgeCount = item.id === 'warnings' ? activeAlertCount : item.badge;
            const displayLabel = t(item.labelKey, item.defaultLabel);

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-2 h-10 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'text-white bg-[#102D47] shadow-xs'
                    : 'text-[#B8C7D9] hover:text-white hover:bg-[#0B2239]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-[#E3F2FD]' : 'text-[#B8C7D9]'}`}>
                  {item.icon}
                </span>
                <span>{displayLabel}</span>

                {badgeCount && badgeCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF0000] text-white animate-pulse">
                    {badgeCount}
                  </span>
                ) : null}

                {/* Subtle active pill indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#1565C0] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
