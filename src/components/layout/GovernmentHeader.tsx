import React, { useState, useEffect } from 'react';
import { LocationRecord } from '../../types';
import { locationService } from '../../services/locationService';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface GovernmentHeaderProps {
  selectedLocation: LocationRecord;
  onSelectLocation: (loc: LocationRecord) => void;
  onOpenAskMausam?: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  selectedLocation,
  onSelectLocation,
  onOpenAskMausam,
}) => {
  const { t, formatDate } = useLanguage();
  const [now, setNow] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

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

  return (
    <header className="w-full bg-[#0F141A] border-b border-[#334155] sticky top-0 z-50 select-none">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Emblem & National Meteorological Platform Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-[#17212B] border border-[#334155] flex items-center justify-center text-[#4FA8E0] shrink-0">
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">
              cloud
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-white font-bold text-base sm:text-lg leading-tight tracking-tight">
                {t('portalTitle', 'MAUSAM')}
              </h1>
              <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#0B72B9]/40">
                SIH 2026
              </span>
            </div>
            <p className="text-[#8A94A6] text-[11px] sm:text-xs font-normal leading-none mt-0.5 hidden sm:block">
              {t('portalSubtitle', 'Atmospheric Intelligence & Citizen Weather Platform')}
            </p>
          </div>
        </div>

        {/* Center: Search / Location Selector */}
        <div className="relative flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] text-[18px]">
              location_on
            </span>
            <input
              type="text"
              id="station-search-input"
              placeholder={t('searchPlaceholder', 'Search station, city or state...')}
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-[#17212B] border border-[#334155] rounded text-white text-xs pl-8 pr-8 focus:outline-none focus:border-[#4FA8E0] truncate"
              aria-label={t('searchPlaceholder', 'Search station, city or state...')}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="absolute top-10 left-0 w-full bg-[#17212B] border border-[#334155] rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2 border-b border-[#334155] text-[11px] text-[#8A94A6] font-semibold flex justify-between">
                  <span>{t('selectStation', 'SELECT REGIONAL MET STATION')}</span>
                  <span>{selectedLocation.city}, {selectedLocation.state}</span>
                </div>
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 8).map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className={`p-2.5 text-xs hover:bg-[#1E2733] cursor-pointer flex justify-between items-center border-b border-[#334155]/40 ${
                        selectedLocation.id === loc.id ? 'bg-[#0B72B9]/20 text-[#4FA8E0]' : 'text-[#D7DEE8]'
                      }`}
                    >
                      <div className="font-semibold">{loc.city}</div>
                      <div className="text-[11px] text-[#8A94A6]">{loc.state}</div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="p-3 text-xs text-[#8A94A6] text-center">
                    {t('noStationsFound', 'No matching stations found.')}
                  </div>
                ) : (
                  <div>
                    <div className="px-2 py-1 text-[10px] text-[#4FA8E0] font-bold bg-[#1E2733]/50">
                      {t('popularObservatories', 'POPULAR OBSERVATORIES')}
                    </div>
                    {[
                      { city: 'Bhubaneswar', state: 'Odisha', id: 'od-bhubaneswar' },
                      { city: 'New Delhi', state: 'Delhi', id: 'dl-delhi' },
                      { city: 'Mumbai', state: 'Maharashtra', id: 'mh-mumbai' },
                      { city: 'Kolkata', state: 'West Bengal', id: 'wb-kolkata' },
                      { city: 'Chennai', state: 'Tamil Nadu', id: 'tn-chennai' },
                      { city: 'Bengaluru', state: 'Karnataka', id: 'ka-bengaluru' },
                    ].map((hub) => (
                      <div
                        key={hub.id}
                        onClick={() => {
                          const matched = locationService.getLocationById(hub.id) || locationService.findLocationByName(hub.city);
                          if (matched) onSelectLocation(matched);
                          setIsSearchOpen(false);
                        }}
                        className="p-2 text-xs text-[#D7DEE8] hover:bg-[#1E2733] cursor-pointer flex justify-between"
                      >
                        <span>{hub.city}</span>
                        <span className="text-[#8A94A6]">{hub.state}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: IST Clock, Ask MAUSAM, Font Adjuster, Searchable Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* IST Time */}
          <div className="hidden lg:flex flex-col text-right pr-3 border-r border-[#334155]">
            <div className="text-white font-bold text-xs font-mono tracking-wide">
              {istTimeString} <span className="text-[#4FA8E0]">{t('istLabel', 'IST')}</span>
            </div>
            <div className="text-[#8A94A6] text-[11px]">
              {localizedDateString}
            </div>
          </div>

          {/* AI Assistant Button */}
          {onOpenAskMausam && (
            <button
              type="button"
              id="header-ask-mausam-button"
              onClick={onOpenAskMausam}
              className="mausam-btn mausam-btn--secondary mausam-btn--sm"
              title={t('askMausam', 'Ask MAUSAM')}
            >
              <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">
                psychology
              </span>
              <span className="hidden sm:inline">{t('askMausam', 'Ask MAUSAM')}</span>
            </button>
          )}

          {/* Accessibility Font Size Controls */}
          <div
            className="hidden md:flex items-center bg-[#17212B] border border-[#334155] rounded px-1 h-[38px]"
            role="group"
            aria-label="Font size controls"
          >
            <button
              type="button"
              onClick={() => handleAdjustFontSize(-0.05)}
              className="px-1.5 text-xs text-[#8A94A6] hover:text-white font-bold"
              title={t('decreaseFont', 'Decrease Font Size')}
              aria-label={t('decreaseFont', 'Decrease Font Size')}
            >
              A-
            </button>
            <span className="text-[#334155]" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => {
                setFontSizeMultiplier(1);
                document.documentElement.style.fontSize = '16px';
              }}
              className="px-1.5 text-xs text-[#8A94A6] hover:text-white font-bold"
              title={t('resetFont', 'Reset Font Size')}
              aria-label={t('resetFont', 'Reset Font Size')}
            >
              A
            </button>
            <span className="text-[#334155]" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => handleAdjustFontSize(0.05)}
              className="px-1.5 text-xs text-[#8A94A6] hover:text-white font-bold"
              title={t('increaseFont', 'Increase Font Size')}
              aria-label={t('increaseFont', 'Increase Font Size')}
            >
              A+
            </button>
          </div>

          {/* Searchable Multilingual Language Selector supporting 22 Scheduled Languages + English */}
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};
