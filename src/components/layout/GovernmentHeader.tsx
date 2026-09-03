import React, { useState, useEffect } from 'react';
import { LocationRecord } from '../../types';
import { locationService } from '../../services/locationService';
import { LocatingPhase } from '../../services/geolocationService';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MainNavTab } from './MainNavigation';
import { FooterView } from './FooterNavigation';
import { UseMyLocationButton } from '../location/UseMyLocationButton';
import { BrandLogo } from './BrandLogo';

interface GovernmentHeaderProps {
  selectedLocation: LocationRecord;
  onSelectLocation: (loc: LocationRecord) => void;
  onOpenAskMausam?: () => void;
  activeTab?: string;
  onNavigateTab?: (tab: MainNavTab | FooterView) => void;
  activeAlertCount?: number;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
  onOpenPrivacyModal?: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  onOpenAskMausam,
  activeTab = 'home',
  onNavigateTab,
  activeAlertCount = 0,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
  onOpenPrivacyModal,
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

  const handleMyLocationClick = async () => {
    if (onDetectLocation) {
      await onDetectLocation(true);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="w-full bg-[#071A2D] border-b border-[#1D4E73] sticky top-0 z-40 select-none">
        {/* Top Atmosphere Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#0B3D91] via-[#1565C0] to-[#E3F2FD]" />

        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="min-h-[72px] sm:min-h-[80px] md:min-h-[88px] py-1.5 flex items-center justify-between gap-3">
            {/* Left: MAUSAM Brand Identity */}
            <BrandLogo onClick={() => onNavigateTab && onNavigateTab('home')} />

            {/* Center: Search / Observatory Station Finder (Desktop/Tablet) */}
            <div className="relative hidden md:flex items-center gap-2 flex-1 max-w-md lg:max-w-2xl">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B8C7D9] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  id="station-search-input-desktop"
                  placeholder={t('searchPlaceholder', 'Search city, state or observatory...')}
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-[#0B2239] border border-[#1D4E73] hover:border-[#1565C0]/60 focus:border-[#1565C0] rounded-xl text-white text-xs pl-9 pr-8 focus:outline-none transition-colors"
                  aria-label={t('searchPlaceholder', 'Search city, state or observatory...')}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C7D9] hover:text-white"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Prominent 📍 Use My Location Button (Desktop) */}
              {onDetectLocation && (
                <UseMyLocationButton
                  onDetect={handleMyLocationClick}
                  isLocating={isLocating}
                  phase={locatePhase}
                  locationSource={locationSource}
                  variant="primary"
                  className="h-10 shrink-0 font-semibold px-3 shadow-md"
                />
              )}

              {/* Quick Location Badge & Switcher Button */}
              {onOpenLocationCenter && (
                <button
                  type="button"
                  id="header-location-center-btn"
                  onClick={onOpenLocationCenter}
                  className="hidden lg:flex items-center gap-1.5 h-10 px-3 bg-[#0B2239] hover:bg-[#102D47] border border-[#1D4E73] hover:border-[#1565C0]/60 rounded-xl text-xs text-[#D7DEE8] transition-colors shrink-0 group cursor-pointer"
                  title="Manage and switch station locations"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#E3F2FD]">
                    location_on
                  </span>
                  <span className="font-semibold text-white truncate max-w-[110px]">
                    {selectedLocation.city}
                  </span>
                  {locationSource === 'DEVICE_GPS' && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#008000]/20 text-[#008000] border border-[#008000]/40">
                      GPS
                    </span>
                  )}
                </button>
              )}

              {/* Desktop Search Dropdown */}
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute top-12 left-0 right-0 bg-[#0B2239] border border-[#1D4E73] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto scrollbar-thin">
                    {/* GPS Quick Action at top of search dropdown */}
                    {onDetectLocation && (
                      <div className="p-2 border-b border-[#1D4E73] bg-[#071A2D]">
                        <UseMyLocationButton
                          onDetect={handleMyLocationClick}
                          isLocating={isLocating}
                          phase={locatePhase}
                          variant="compact"
                          className="w-full justify-center"
                        />
                      </div>
                    )}

                    <div className="p-2.5 border-b border-[#1D4E73] text-[11px] text-[#B8C7D9] font-semibold flex justify-between">
                      <span>{t('selectStation', 'SELECT LOCATION')}</span>
                      <span className="text-[#E3F2FD] truncate max-w-[150px]">{selectedLocation.city}, {selectedLocation.state}</span>
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
                          className={`p-3 text-xs hover:bg-[#102D47] cursor-pointer flex justify-between items-center border-b border-[#1D4E73]/50 transition-colors ${
                            selectedLocation.id === loc.id ? 'bg-[#1565C0]/20 text-[#E3F2FD] font-semibold' : 'text-white'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{loc.city}</div>
                            <div className="text-[10px] text-[#B8C7D9]">{loc.district || loc.state}</div>
                          </div>
                          <div className="text-[11px] text-[#B8C7D9]">{loc.state}</div>
                        </div>
                      ))
                    ) : searchQuery ? (
                      <div className="p-4 text-xs text-[#B8C7D9] text-center">
                        {t('noStationsFound', 'No matching locations found.')}
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] text-[#E3F2FD] font-bold bg-[#102D47]/60 tracking-wider">
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
                            className="p-2.5 text-xs text-[#D7DEE8] hover:bg-[#102D47] cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <span className="font-medium">{hub.city}</span>
                            <span className="text-[#B8C7D9] text-[11px]">{hub.state}</span>
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
              <div className="hidden lg:flex flex-col text-right pr-3 border-r border-[#1D4E73]">
                <div className="text-white font-semibold text-xs font-mono tracking-wide">
                  {istTimeString} <span className="text-[#E3F2FD]">IST</span>
                </div>
                <div className="text-[#B8C7D9] text-[11px]">
                  {localizedDateString}
                </div>
              </div>

              {/* Ask MAUSAM Assistant Trigger */}
              {onOpenAskMausam && (
                <button
                  type="button"
                  id="header-ask-mausam-button"
                  onClick={onOpenAskMausam}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B2239] hover:bg-[#102D47] border border-[#1565C0]/50 hover:border-[#1565C0] text-white text-xs font-medium transition-all shadow-sm shadow-[#1565C0]/10"
                  title={t('askMausam', 'Ask MAUSAM AI')}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#E3F2FD]">
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
                className="hidden xl:flex items-center bg-[#0B2239] border border-[#1D4E73] rounded-lg px-1.5 h-[36px]"
                role="group"
                aria-label="Font size controls"
              >
                <button
                  type="button"
                  onClick={() => handleAdjustFontSize(-0.05)}
                  className="px-1.5 text-xs text-[#B8C7D9] hover:text-white font-semibold"
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <span className="text-[#1D4E73]" aria-hidden="true">|</span>
                <button
                  type="button"
                  onClick={handleResetFontSize}
                  className="px-1.5 text-xs text-[#B8C7D9] hover:text-white font-semibold"
                  title="Reset Font Size"
                >
                  A
                </button>
                <span className="text-[#1D4E73]" aria-hidden="true">|</span>
                <button
                  type="button"
                  onClick={() => handleAdjustFontSize(0.05)}
                  className="px-1.5 text-xs text-[#B8C7D9] hover:text-white font-semibold"
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
                className="md:hidden w-10 h-10 rounded-xl bg-[#0B2239] border border-[#1D4E73] text-white flex items-center justify-center cursor-pointer transition-colors relative"
                aria-label="Open Navigation Menu"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
                {activeAlertCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF0000] ring-2 ring-[#071A2D]" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Second Row Search & Location Trigger */}
          <div className="md:hidden pb-3 pt-1 relative">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B8C7D9] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  id="station-search-input-mobile"
                  placeholder={t('searchPlaceholder', 'Search city, state or station...')}
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-[#0B2239] border border-[#1D4E73] rounded-xl text-white text-xs pl-9 pr-8 focus:outline-none focus:border-[#1565C0]"
                  aria-label={t('searchPlaceholder', 'Search city, state or station...')}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C7D9] hover:text-white"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Mobile Quick Use My Location Button */}
              {onDetectLocation && (
                <UseMyLocationButton
                  onDetect={handleMyLocationClick}
                  isLocating={isLocating}
                  phase={locatePhase}
                  locationSource={locationSource}
                  compact
                  variant="primary"
                  className="h-10 shrink-0 px-2.5 shadow-sm"
                />
              )}
            </div>

            {/* Mobile Search Dropdown */}
            {isSearchOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSearchOpen(false)}
                />
                <div className="absolute top-12 left-0 right-0 bg-[#0B2239] border border-[#1D4E73] rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
                  {/* GPS Quick Action in mobile search dropdown */}
                  {onDetectLocation && (
                    <div className="p-2 border-b border-[#1D4E73] bg-[#071A2D]">
                      <UseMyLocationButton
                        onDetect={handleMyLocationClick}
                        isLocating={isLocating}
                        phase={locatePhase}
                        variant="compact"
                        className="w-full justify-center"
                      />
                    </div>
                  )}

                  <div className="p-2.5 border-b border-[#1D4E73] text-[11px] text-[#B8C7D9] font-semibold flex justify-between bg-[#071A2D]">
                    <span>{t('selectStation', 'SELECT LOCATION')}</span>
                    <span className="text-[#E3F2FD] truncate max-w-[140px]">{selectedLocation.city}</span>
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
                        className={`p-3 text-xs hover:bg-[#102D47] cursor-pointer flex justify-between items-center border-b border-[#1D4E73]/40 min-h-[44px] ${
                          selectedLocation.id === loc.id ? 'bg-[#1565C0]/20 text-[#E3F2FD] font-bold' : 'text-white'
                        }`}
                      >
                        <div className="font-semibold">{loc.city}</div>
                        <div className="text-[11px] text-[#B8C7D9]">{loc.state}</div>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="p-4 text-xs text-[#B8C7D9] text-center">
                      {t('noStationsFound', 'No matching locations found.')}
                    </div>
                  ) : (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] text-[#E3F2FD] font-bold bg-[#102D47]/70">
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
                          className="p-3 text-xs text-[#D7DEE8] hover:bg-[#102D47] cursor-pointer flex justify-between items-center border-b border-[#1D4E73]/30 min-h-[44px]"
                        >
                          <span className="font-medium">{hub.city}</span>
                          <span className="text-[#B8C7D9] text-[11px]">{hub.state}</span>
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
        onDetectLocation={onDetectLocation}
        isLocating={isLocating}
        locatePhase={locatePhase}
        locationSource={locationSource}
        onOpenLocationCenter={onOpenLocationCenter}
      />
    </>
  );
};
