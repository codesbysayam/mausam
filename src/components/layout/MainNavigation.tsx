import React from 'react';
import {
  Home,
  ThermometerSun,
  TrendingUp,
  AlertTriangle,
  Radio,
  Activity,
  Wheat,
  FileText,
  LucideIcon,
} from 'lucide-react';
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
  shortLabel: string;
  icon: LucideIcon;
  color: string;
  bgHover: string;
}

const NAV_CONFIG: NavItemConfig[] = [
  {
    id: 'home',
    labelKey: 'home',
    defaultLabel: 'HOME',
    shortLabel: 'HOME',
    icon: Home,
    color: 'text-[#38BDF8]',
    bgHover: 'hover:border-[#38BDF8]',
  },
  {
    id: 'weather',
    labelKey: 'weather',
    defaultLabel: 'WEATHER',
    shortLabel: 'WEATHER',
    icon: ThermometerSun,
    color: 'text-[#FB923C]',
    bgHover: 'hover:border-[#FB923C]',
  },
  {
    id: 'forecast',
    labelKey: 'forecast',
    defaultLabel: 'FORECAST',
    shortLabel: 'FORECAST',
    icon: TrendingUp,
    color: 'text-[#818CF8]',
    bgHover: 'hover:border-[#818CF8]',
  },
  {
    id: 'warnings',
    labelKey: 'warnings',
    defaultLabel: 'WARNINGS',
    shortLabel: 'WARNINGS',
    icon: AlertTriangle,
    color: 'text-[#E74C3C]',
    bgHover: 'hover:border-[#E74C3C]',
  },
  {
    id: 'radar',
    labelKey: 'radar',
    defaultLabel: 'RADAR & MAPS',
    shortLabel: 'RADAR',
    icon: Radio,
    color: 'text-[#2ECC71]',
    bgHover: 'hover:border-[#2ECC71]',
  },
  {
    id: 'aqi',
    labelKey: 'airQuality',
    defaultLabel: 'AQI & AIR',
    shortLabel: 'AQI',
    icon: Activity,
    color: 'text-[#F1C40F]',
    bgHover: 'hover:border-[#F1C40F]',
  },
  {
    id: 'agromet',
    labelKey: 'agromet',
    defaultLabel: 'AGROMET',
    shortLabel: 'AGROMET',
    icon: Wheat,
    color: 'text-[#1ABC9C]',
    bgHover: 'hover:border-[#1ABC9C]',
  },
  {
    id: 'reports',
    labelKey: 'reports',
    defaultLabel: 'REPORTS',
    shortLabel: 'REPORTS',
    icon: FileText,
    color: 'text-[#9B59B6]',
    bgHover: 'hover:border-[#9B59B6]',
  },
];

export const MainNavigation: React.FC<MainNavigationProps> = ({
  activeTab,
  onTabChange,
  activeAlertCount = 0,
}) => {
  const { t } = useLanguage();

  return (
    <nav
      id="primary-main-navigation"
      className="hidden md:block w-full bg-[#131B26] border-b border-[#223246] py-2 px-3 sm:px-4 lg:px-6 shadow-md select-none"
      aria-label="Primary Navigation"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5 md:gap-2 w-full">
          {NAV_CONFIG.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount = item.id === 'warnings' ? activeAlertCount : 0;
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
                className={`w-full min-w-0 flex items-center justify-center gap-1.5 py-2 px-1 sm:px-2 rounded-xl border text-[11px] xl:text-xs font-bold transition-all duration-150 cursor-pointer select-none relative ${
                  isActive
                    ? 'bg-[#0B72B9] text-white border-[#0B72B9] shadow-md shadow-[#0B72B9]/30 ring-1 ring-[#38BDF8]/40'
                    : `bg-[#1E2733] text-[#D7DEE8] border-[#334155] ${item.bgHover} hover:text-white hover:bg-[#253243]`
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : item.color
                  }`}
                />
                <span className="tracking-wide uppercase whitespace-nowrap font-bold truncate">
                  {item.shortLabel !== item.defaultLabel ? (
                    <>
                      <span className="hidden 2xl:inline">{displayLabel}</span>
                      <span className="2xl:hidden">{item.shortLabel}</span>
                    </>
                  ) : (
                    displayLabel
                  )}
                </span>

                {badgeCount > 0 && (
                  <span
                    className={`ml-0.5 px-1 py-0.2 rounded-full text-[9px] font-black leading-none shrink-0 ${
                      isActive
                        ? 'bg-white text-[#0B72B9]'
                        : 'bg-[#E74C3C] text-white shadow-xs animate-pulse'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

