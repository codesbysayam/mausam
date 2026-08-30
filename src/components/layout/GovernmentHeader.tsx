import React, { useState, useEffect } from 'react';
import { LocationRecord } from '../../types';
import { locationService } from '../../services/locationService';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MainNavTab } from './MainNavigation';
import { FooterView } from './FooterNavigation';

interface GovernmentHeaderProps {
  selectedLocation: LocationRecord;
  onSelectLocation: (loc: LocationRecord) => void;
  onOpenAskMausam?: () => void;
  activeTab?: string;
  onNavigateTab?: (tab: MainNavTab | FooterView) => void;
  activeAlertCount?: number;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  onOpenAskMausam,
  activeTab = 'home',
  onNavigateTab,
  activeAlertCount = 0,
}) => {
  const { t, formatDate } = useLanguage();
  const [now, setNow] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istTimeString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  const localizedDateString = formatDate(now);

  const searchResults = searchQuery.trim()
    ? locationService.searchLocations(searchQuery)
    : [];

  const handleAdjustFontSize = (delta: number) => {
    const next = Math.min(Math.max(fontSizeMultiplier + delta, 0.9), 1.2);
    setFontSizeMultiplier(next);
    document.documentElement.style.fontSize = `${16 * next}px`;
  };

  const handleResetFontSize = () => {
    setFontSizeMultiplier(1);
    document.documentElement.style.fontSize = '16px';
  };

  return (
    <>
      <header className="w-full bg-[#071018] border-b border-[#162331] sticky top-0 z-40 select-none">
        {/* Top Atmosphere Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#1499E8] via-[#43C7F4] to-[#22C7A0]" />

        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: MAUSAM Brand Identity */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onNavigateTab && onNavigateTab('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1499E8] to-[#0C78BA] flex items-center justify-center text-white shadow-sm shadow-[#1499E8]/20 transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[22px]">
                  water_drop
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#F4F7FA] font-bold text-lg tracking-tight">
                    MAUSAM
                  </span>
                  <span className="bg-[#1499E8]/15 text-[#43C7F4] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#1499E8]/30">
                    INDIA
                  </span>
                </div>
                <p className="text-[#93A4B8] text-[11px] font-normal leading-none mt-0.5 hidden sm:block">
                  Atmospheric Intelligence Platform
                </p>
              </div>
            </div>

            {/* Center: Search / Observatory Station Finder (Desktop/Tablet) */}
            <div className="relative hidden md:block flex-1 max-w-sm lg:max-w-md">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#93A4B8] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  id="station-search-input-desktop"
                  placeholder={t('searchPlaceholder', 'Search city, state or observatory...')}
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-[#111C27] border border-[#162331] hover:border-[#1499E8]/40 focus:border-[#1499E8] rounded-xl text-[#F4F7FA] text-xs pl-9 pr-8 focus:outline-none transition-colors"
                  aria-label={t('searchPlaceholder', 'Search city, state or observatory...')}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93A4B8] hover:text-white"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Desktop Search Dropdown */}
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute top-12 left-0 w-full bg-[#111C27] border border-[#162331] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto scrollbar-thin">
                    <div className="p-2.5 border-b border-[#162331] text-[11px] text-[#93A4B8] font-semibold flex justify-between">
                      <span>{t('selectStation', 'SELECT LOCATION')}</span>
                      <span className="text-[#43C7F4] truncate max-w-[150px]">{selectedLocation.city}, {selectedLocation.state}</span>
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.slice(0, 10).map((loc) => (
                        <div
                          key={loc.id}
                          onClick={() => {
                            onSelectLocation(loc);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className={`p-3 text-xs hover:bg-[#162331] cursor-pointer flex justify-between items-center border-b border-[#162331]/50 transition-colors ${
                            selectedLocation.id === loc.id ? 'bg-[#1499E8]/15 text-[#43C7F4] font-semibold' : 'text-[#F4F7FA]'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{loc.city}</div>
                            <div className="text-[10px] text-[#93A4B8]">{loc.district || loc.state}</div>
                          </div>
                          <div className="text-[11px] text-[#93A4B8]">{loc.state}</div>
                        </div>
                      ))
                    ) : searchQuery ? (
                      <div className="p-4 text-xs text-[#93A4B8] text-center">
                        {t('noStationsFound', 'No matching locations found.')}
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] text-[#43C7F4] font-bold bg-[#162331]/60 tracking-wider">
                          POPULAR CITIES
                        </div>
                        {[
                          { city: 'New Delhi', state: 'Delhi NCR', id: 'delhi-safdarjung' },
                          { city: 'Bhubaneswar', state: 'Odisha', id: 'odisha-bhubaneswar' },
                          { city: 'Mumbai', state: 'Maharashtra', id: 'mumbai-colaba' },
                          { city: 'Kolkata', state: 'West Bengal', id: 'kolkata-alipore' },
                          { city: 'Chennai', state: 'Tamil Nadu', id: 'chennai-meenambakkam' },
                          { city: 'Bengaluru', state: 'Karnataka', id: 'bengaluru-city' },
                        ].map((hub) => (
                          <div
                            key={hub.id}
                            onClick={() => {
                              const matched =
                                locationService.findLocationById(hub.id) ||
                                locationService.findLocationByName(hub.city) ||
                                locationService.getLocationById(hub.id);
                              if (matched) {
                                onSelectLocation(matched);
                              }
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="p-2.5 text-xs text-[#D1DCE8] hover:bg-[#162331] cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <span className="font-medium">{hub.city}</span>
                            <span className="text-[#93A4B8] text-[11px]">{hub.state}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Controls: IST Clock, Ask MAUSAM, Language, Accessibility */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* IST Clock */}
              <div className="hidden lg:flex flex-col text-right pr-3 border-r border-[#162331]">
                <div className="text-[#F4F7FA] font-semibold text-xs font-mono tracking-wide">
                  {istTimeString} <span className="text-[#43C7F4]">IST</span>
                </div>
                <div className="text-[#93A4B8] text-[11px]">
                  {localizedDateString}
                </div>
              </div>

              {/* Ask MAUSAM Assistant Trigger */}
              {onOpenAskMausam && (
                <button
                  type="button"
                  id="header-ask-mausam-button"
                  onClick={onOpenAskMausam}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111C27] hover:bg-[#162331] border border-[#1499E8]/40 hover:border-[#1499E8] text-[#F4F7FA] text-xs font-medium transition-all shadow-sm shadow-[#1499E8]/10"
                  title={t('askMausam', 'Ask MAUSAM AI')}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#43C7F4]">
                    auto_awesome
                  </span>
                  <span className="hidden sm:inline font-semibold">Ask MAUSAM</span>
                </button>
              )}

              {/* Language Selector */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Accessibility Font Size Controls */}
              <div
                className="hidden xl:flex items-center bg-[#111C27] border border-[#162331] rounded-lg px-1.5 h-[36px]"
                role="group"
                aria-label="Font size controls"
              >
                <button
                  type="button"
                  onClick={() => handleAdjustFontSize(-0.05)}
                  className="px-1.5 text-xs text-[#93A4B8] hover:text-white font-semibold"
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <span className="text-[#162331]" aria-hidden="true">|</span>
                <button
                  type="button"
                  onClick={handleResetFontSize}
                  className="px-1.5 text-xs text-[#93A4B8] hover:text-white font-semibold"
                  title="Reset Font Size"
                >
                  A
                </button>
                <span className="text-[#162331]" aria-hidden="true">|</span>
                <button
                  type="button"
                  onClick={() => handleAdjustFontSize(0.05)}
                  className="px-1.5 text-xs text-[#93A4B8] hover:text-white font-semibold"
                  title="Increase Font Size"
                >
                  A+
                </button>
              </div>

              {/* Mobile Drawer Button */}
              <button
                type="button"
                id="mobile-menu-toggle-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-[#111C27] border border-[#162331] text-[#F4F7FA] flex items-center justify-center cursor-pointer transition-colors relative"
                aria-label="Open Navigation Menu"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
                {activeAlertCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF5350] ring-2 ring-[#071018]" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Second Row Search */}
          <div className="md:hidden pb-3 pt-1 relative">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#93A4B8] text-[18px]">
                search
              </span>
              <input
                type="text"
                id="station-search-input-mobile"
                placeholder={t('searchPlaceholder', 'Search city, state or station...')}
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-[#111C27] border border-[#162331] rounded-xl text-[#F4F7FA] text-xs pl-9 pr-8 focus:outline-none focus:border-[#1499E8]"
                aria-label={t('searchPlaceholder', 'Search city, state or station...')}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93A4B8] hover:text-white"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Mobile Search Dropdown */}
            {isSearchOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSearchOpen(false)}
                />
                <div className="absolute top-12 left-0 right-0 bg-[#111C27] border border-[#162331] rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
                  <div className="p-2.5 border-b border-[#162331] text-[11px] text-[#93A4B8] font-semibold flex justify-between bg-[#0A1118]">
                    <span>{t('selectStation', 'SELECT LOCATION')}</span>
                    <span className="text-[#43C7F4] truncate max-w-[140px]">{selectedLocation.city}</span>
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`p-3 text-xs hover:bg-[#162331] cursor-pointer flex justify-between items-center border-b border-[#162331]/40 min-h-[44px] ${
                          selectedLocation.id === loc.id ? 'bg-[#1499E8]/15 text-[#43C7F4] font-bold' : 'text-[#F4F7FA]'
                        }`}
                      >
                        <div className="font-semibold">{loc.city}</div>
                        <div className="text-[11px] text-[#93A4B8]">{loc.state}</div>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="p-4 text-xs text-[#93A4B8] text-center">
                      {t('noStationsFound', 'No matching locations found.')}
                    </div>
                  ) : (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] text-[#43C7F4] font-bold bg-[#162331]/70">
                        POPULAR OBSERVATORIES
                      </div>
                      {[
                        { city: 'New Delhi', state: 'Delhi NCR', id: 'delhi-safdarjung' },
                        { city: 'Bhubaneswar', state: 'Odisha', id: 'odisha-bhubaneswar' },
                        { city: 'Mumbai', state: 'Maharashtra', id: 'mumbai-colaba' },
                        { city: 'Kolkata', state: 'West Bengal', id: 'kolkata-alipore' },
                        { city: 'Chennai', state: 'Tamil Nadu', id: 'chennai-meenambakkam' },
                        { city: 'Bengaluru', state: 'Karnataka', id: 'bengaluru-city' },
                      ].map((hub) => (
                        <div
                          key={hub.id}
                          onClick={() => {
                            const matched =
                              locationService.findLocationById(hub.id) ||
                              locationService.findLocationByName(hub.city) ||
                              locationService.getLocationById(hub.id);
                            if (matched) {
                              onSelectLocation(matched);
                            }
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="p-3 text-xs text-[#D1DCE8] hover:bg-[#162331] cursor-pointer flex justify-between items-center border-b border-[#162331]/30 min-h-[44px]"
                        >
                          <span className="font-medium">{hub.city}</span>
                          <span className="text-[#93A4B8] text-[11px]">{hub.state}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          if (onNavigateTab) onNavigateTab(tab);
          setIsMobileMenuOpen(false);
        }}
        activeAlertCount={activeAlertCount}
        selectedLocation={selectedLocation}
        onOpenAskMausam={onOpenAskMausam}
        fontSizeMultiplier={fontSizeMultiplier}
        onAdjustFontSize={handleAdjustFontSize}
        onResetFontSize={handleResetFontSize}
      />
    </>
  );
};
