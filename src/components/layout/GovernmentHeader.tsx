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
import { AudioAlertToggle } from '../common/AudioAlertToggle';

interface GovernmentHeaderProps {
  selectedLocation: LocationRecord;
  onSelectLocation: (loc: LocationRecord) => void;
  onOpenAskMausam?: () => void;
  activeTab?: string;
  onNavigateTab?: (tab: MainNavTab | FooterView) => void;
  activeAlertCount?: number;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  onRefreshAll?: () => Promise<void> | void;
  isRefreshing?: boolean;
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
  onRefreshAll,
  isRefreshing = false,
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

  const smartResults = searchQuery.trim()
    ? locationService.smartSearch(searchQuery)
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

  // Search submit handler (on Enter key or explicit search execution)
  const handleSearchSubmit = () => {
    if (smartResults.length > 0) {
      const top = smartResults[0];
      onSelectLocation(top.location);
      if (onNavigateTab && top.intentTab) {
        onNavigateTab(top.intentTab);
      }
      setIsSearchOpen(false);
      setSearchQuery('');
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
            <div className="relative hidden md:flex items-center flex-1 max-w-lg lg:max-w-xl mx-2 lg:mx-4 min-w-0">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B8C7D9] text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  id="station-search-input-desktop"
                  placeholder={t('searchPlaceholder', "Search city, state, or PIN code...")}
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  className="w-full h-10 bg-[#0B2239] border border-[#1D4E73] hover:border-[#1565C0]/60 focus:border-[#1565C0] rounded-xl text-white text-xs pl-9 pr-16 focus:outline-none transition-colors shadow-inner"
                  aria-label={t('searchPlaceholder', "Search city, state, or PIN code...")}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-[#B8C7D9] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                      aria-label="Clear search"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                  {onDetectLocation && (
                    <button
                      type="button"
                      id="search-gps-locate-btn"
                      onClick={handleMyLocationClick}
                      disabled={isLocating}
                      title={locationSource === 'DEVICE_GPS' ? 'GPS Active • Click to Refresh' : 'Detect My Location (GPS)'}
                      className="p-1 rounded-lg text-[#38BDF8] hover:text-white hover:bg-[#1499E8]/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                      aria-label="Detect GPS Location"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isLocating ? 'animate-spin text-[#38BDF8]' : ''}`}>
                        {isLocating ? 'progress_activity' : 'my_location'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

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
                    {smartResults.length > 0 ? (
                      smartResults.slice(0, 10).map((res, idx) => (
                        <div
                          key={`${res.location.id}-${idx}`}
                          onClick={() => {
                            onSelectLocation(res.location);
                            if (onNavigateTab && res.intentTab) {
                              onNavigateTab(res.intentTab);
                            }
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className={`p-3 text-xs hover:bg-[#102D47] cursor-pointer flex justify-between items-center border-b border-[#1D4E73]/50 transition-colors ${
                            selectedLocation.id === res.location.id ? 'bg-[#1565C0]/20 text-[#E3F2FD] font-semibold' : 'text-white'
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">{res.displayTitle}</span>
                              {res.matchedParameter && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1499E8]/25 text-[#4FA8E0] border border-[#1499E8]/40 font-bold uppercase">
                                  {res.matchedParameter}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#B8C7D9]">{res.displaySubtitle}</div>
                          </div>
                          <div className="text-[11px] text-[#B8C7D9] shrink-0 font-medium">{res.location.state}</div>
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

            {/* Right Controls: Ask MAUSAM, Audio Alert, Language Selector, Mobile Drawer */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* IST Clock (Large Screens Only) */}
              <div className="hidden 2xl:flex flex-col text-right pr-3 border-r border-[#1D4E73]">
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B2239] hover:bg-[#102D47] border border-[#1565C0]/50 hover:border-[#1565C0] text-white text-xs font-semibold transition-all shadow-sm shadow-[#1565C0]/10 shrink-0 cursor-pointer"
                  title={t('askMausam', 'Ask MAUSAM AI Assistant')}
                >
                  <span className="material-symbols-outlined text-[17px] text-[#38BDF8]">
                    auto_awesome
                  </span>
                  <span className="whitespace-nowrap">Ask MAUSAM</span>
                </button>
              )}

              {/* Optional Severe Audio Alert Toggle */}
              <div className="hidden sm:flex items-center shrink-0">
                <AudioAlertToggle variant="pill" showLabel={false} />
              </div>

              {/* Language Selector */}
              <div className="hidden sm:flex items-center shrink-0">
                <LanguageSelector />
              </div>

              {/* Accessibility Font Size Controls (2XL only) */}
              <div
                className="hidden 2xl:flex items-center bg-[#0B2239] border border-[#1D4E73] rounded-lg px-1.5 h-[36px]"
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
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B8C7D9] text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                id="station-search-input-mobile"
                placeholder={t('searchPlaceholder', "Search city, state, or PIN code...")}
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="w-full h-10 bg-[#0B2239] border border-[#1D4E73] rounded-xl text-white text-xs pl-9 pr-16 focus:outline-none focus:border-[#1565C0] shadow-inner"
                aria-label={t('searchPlaceholder', "Search city, state, or PIN code...")}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[#B8C7D9] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
                {onDetectLocation && (
                  <button
                    type="button"
                    id="search-gps-locate-btn-mobile"
                    onClick={handleMyLocationClick}
                    disabled={isLocating}
                    title={locationSource === 'DEVICE_GPS' ? 'GPS Active • Click to Refresh' : 'Detect My Location (GPS)'}
                    className="p-1 rounded-lg text-[#38BDF8] hover:text-white hover:bg-[#1499E8]/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    aria-label="Detect GPS Location"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isLocating ? 'animate-spin text-[#38BDF8]' : ''}`}>
                      {isLocating ? 'progress_activity' : 'my_location'}
                    </span>
                  </button>
                )}
              </div>
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
                  {smartResults.length > 0 ? (
                    smartResults.map((res, idx) => (
                      <div
                        key={`${res.location.id}-${idx}`}
                        onClick={() => {
                          onSelectLocation(res.location);
                          if (onNavigateTab && res.intentTab) {
                            onNavigateTab(res.intentTab);
                          }
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`p-3 text-xs hover:bg-[#102D47] cursor-pointer flex justify-between items-center border-b border-[#1D4E73]/40 min-h-[44px] ${
                          selectedLocation.id === res.location.id ? 'bg-[#1565C0]/20 text-[#E3F2FD] font-bold' : 'text-white'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{res.displayTitle}</span>
                            {res.matchedParameter && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1499E8]/25 text-[#4FA8E0] border border-[#1499E8]/40 font-bold uppercase">
                                {res.matchedParameter}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#B8C7D9]">{res.displaySubtitle}</div>
                        </div>
                        <div className="text-[11px] text-[#B8C7D9] shrink-0 font-medium">{res.location.state}</div>
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
