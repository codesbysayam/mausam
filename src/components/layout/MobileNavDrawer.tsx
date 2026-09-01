import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MainNavTab } from './MainNavigation';
import { FooterView } from './FooterNavigation';
import { LocationRecord } from '../../types';
import { LocatingPhase } from '../../services/geolocationService';
import { LanguageSelector } from './LanguageSelector';
import { UseMyLocationButton } from '../location/UseMyLocationButton';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigateTab: (tab: MainNavTab | FooterView) => void;
  activeAlertCount?: number;
  selectedLocation: LocationRecord;
  onOpenAskMausam?: () => void;
  fontSizeMultiplier: number;
  onAdjustFontSize: (delta: number) => void;
  onResetFontSize: () => void;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

interface MobileNavItem {
  id: MainNavTab;
  labelKey: string;
  defaultLabel: string;
  icon: string;
  badge?: number;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { id: 'home', labelKey: 'home', defaultLabel: 'HOME', icon: 'home' },
  { id: 'weather', labelKey: 'weather', defaultLabel: 'WEATHER', icon: 'thermostat' },
  { id: 'forecast', labelKey: 'forecast', defaultLabel: 'FORECAST', icon: 'calendar_month' },
  { id: 'warnings', labelKey: 'warnings', defaultLabel: 'WARNINGS', icon: 'warning' },
  { id: 'radar', labelKey: 'radar', defaultLabel: 'RADAR & MAPS', icon: 'radar' },
  { id: 'aqi', labelKey: 'airQuality', defaultLabel: 'AQI & AIR', icon: 'air' },
  { id: 'agromet', labelKey: 'agromet', defaultLabel: 'AGROMET', icon: 'agriculture' },
  { id: 'reports', labelKey: 'reports', defaultLabel: 'REPORTS', icon: 'description' },
];

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
  activeAlertCount = 0,
  selectedLocation,
  onOpenAskMausam,
  fontSizeMultiplier,
  onAdjustFontSize,
  onResetFontSize,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock background scroll when open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDetect = async () => {
    if (onDetectLocation) {
      await onDetectLocation(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop click area */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div
        ref={drawerRef}
        className="relative z-10 w-[85%] max-w-[340px] h-full bg-[#0F141A] border-l border-[#334155] shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        {/* Top Header */}
        <div>
          <div className="p-4 border-b border-[#334155] flex items-center justify-between bg-[#17212B]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img
                  src="/assets/imd-logo.svg"
                  alt="IMD Logo"
                  className="max-h-9 max-w-9 object-contain drop-shadow"
                  loading="eager"
                />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-none flex items-center gap-1.5">
                  <span>MAUSAM</span>
                  <span className="bg-[#1499E8]/20 text-[#43C7F4] text-[9px] font-semibold px-1.5 py-0.2 rounded-full border border-[#1499E8]/30">INDIA</span>
                </div>
                <div className="text-[#8A94A6] text-[10px] mt-0.5">Atmospheric Intelligence</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#1E2733] border border-[#334155] text-[#8A94A6] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Active Station & Location Pill */}
          <div className="p-3 bg-[#17212B]/70 border-b border-[#334155]/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#4FA8E0] text-[16px] shrink-0">
                location_on
              </span>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white truncate">
                    {selectedLocation.city}, {selectedLocation.state}
                  </span>
                  {locationSource === 'DEVICE_GPS' && (
                    <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-[#22C7A0]/20 text-[#22C7A0] border border-[#22C7A0]/40">
                      GPS
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#8A94A6] block truncate">
                  {selectedLocation.imdStation || 'AWS Observatory'}
                </span>
              </div>
            </div>
            {onOpenLocationCenter ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLocationCenter();
                }}
                className="text-[11px] text-[#4FA8E0] font-semibold hover:underline shrink-0 pl-2 cursor-pointer"
              >
                Manage
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('weather');
                  onClose();
                }}
                className="text-[11px] text-[#4FA8E0] font-semibold hover:underline shrink-0 pl-2"
              >
                Change
              </button>
            )}
          </div>

          {/* GPS Use My Location Quick Trigger */}
          {onDetectLocation && (
            <div className="p-3 border-b border-[#334155]/60 bg-[#0D1520]">
              <UseMyLocationButton
                onDetect={handleDetect}
                isLocating={isLocating}
                phase={locatePhase}
                variant="compact"
                className="w-full justify-center"
              />
            </div>
          )}

          {/* Ask MAUSAM Quick Action Banner */}
          {onOpenAskMausam && (
            <div className="p-3 border-b border-[#334155]/60">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAskMausam();
                }}
                className="w-full py-2 px-3 rounded bg-gradient-to-r from-[#0B72B9]/30 to-[#4FA8E0]/20 border border-[#0B72B9]/60 hover:border-[#4FA8E0] text-white flex items-center justify-between text-xs font-semibold cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4FA8E0] text-[18px] animate-pulse">
                    psychology
                  </span>
                  <span>Ask MAUSAM AI Assistant</span>
                </div>
                <span className="text-[10px] font-mono text-[#4FA8E0] uppercase font-bold">Open →</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-2 flex flex-col gap-1">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const badgeCount = item.id === 'warnings' ? activeAlertCount : item.badge;
              const label = t(item.labelKey as any, item.defaultLabel);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigateTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-[#0B72B9] text-white font-bold'
                      : 'text-[#D7DEE8] hover:bg-[#17212B] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span>{label}</span>
                  </div>

                  {badgeCount && badgeCount > 0 ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-[#0B72B9]' : 'bg-[#E74C3C] text-white'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  ) : (
                    <span className="text-[#8A94A6] text-[14px]">›</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Preferences: Language, Font Adjuster, Legal */}
        <div className="p-4 border-t border-[#334155] bg-[#17212B] flex flex-col gap-3">
          {/* Language Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold tracking-wider">
              Language / भाषा / ଭାଷା
            </span>
            <LanguageSelector />
          </div>

          {/* Accessibility Font Size */}
          <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60 text-xs">
            <span className="text-[11px] text-[#8A94A6]">Text Size:</span>
            <div className="flex items-center gap-1 bg-[#1E2733] border border-[#334155] rounded px-1 h-[32px]">
              <button
                type="button"
                onClick={() => onAdjustFontSize(-0.05)}
                className="px-2 text-xs text-[#8A94A6] hover:text-white font-bold h-full"
                title="Decrease font size"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <span className="text-[#334155]">|</span>
              <button
                type="button"
                onClick={onResetFontSize}
                className="px-2 text-xs text-[#8A94A6] hover:text-white font-bold h-full"
                title="Reset font size"
                aria-label="Reset font size"
              >
                A
              </button>
              <span className="text-[#334155]">|</span>
              <button
                type="button"
                onClick={() => onAdjustFontSize(0.05)}
                className="px-2 text-xs text-[#8A94A6] hover:text-white font-bold h-full"
                title="Increase font size"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Quick Legal & Service Links */}
          <div className="pt-2 border-t border-[#334155]/60 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#8A94A6]">
            <button
              type="button"
              onClick={() => {
                onNavigateTab('terms');
                onClose();
              }}
              className="hover:text-[#4FA8E0] hover:underline"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onNavigateTab('privacy');
                onClose();
              }}
              className="hover:text-[#4FA8E0] hover:underline"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onNavigateTab('api');
                onClose();
              }}
              className="hover:text-[#4FA8E0] hover:underline"
            >
              Open Data API
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                onNavigateTab('debug');
                onClose();
              }}
              className="hover:text-[#4FA8E0] hover:underline"
            >
              Diagnostics
            </button>
          </div>

          <div className="text-[10px] text-[#8A94A6] text-center pt-1 font-mono">
            MAUSAM • IMD National Meteorological Platform
          </div>
        </div>
      </div>
    </div>
  );
};
