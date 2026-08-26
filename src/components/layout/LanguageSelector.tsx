import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language, LanguageInfo } from '../../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { language, currentLanguageInfo, setLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter languages by English name, native name, or code
  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableLanguages;

    return availableLanguages.filter((lang) => {
      const matchName = lang.name.toLowerCase().includes(query);
      const matchNative = lang.nativeName.toLowerCase().includes(query);
      const matchCode = lang.code.toLowerCase().includes(query);
      return matchName || matchNative || matchCode;
    });
  }, [searchQuery, availableLanguages]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="language-selector-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLanguageInfo.name}. Click to change language.`}
        className="flex items-center justify-between gap-1.5 h-[38px] px-3 bg-[#17212B] hover:bg-[#1E2733] border border-[#334155] rounded-[5px] text-white text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-[#0B72B9]"
      >
        <span className="material-symbols-outlined text-[16px] text-[#4FA8E0]">
          translate
        </span>
        
        {/* Desktop Label: Native name or English */}
        <span className="hidden sm:inline">
          {currentLanguageInfo.nativeName !== currentLanguageInfo.name
            ? `${currentLanguageInfo.nativeName}`
            : currentLanguageInfo.name}
        </span>

        {/* Mobile Label: 2-3 char code */}
        <span className="sm:hidden uppercase font-mono text-[11px]">
          {currentLanguageInfo.code}
        </span>

        <span
          className={`material-symbols-outlined text-[16px] text-[#8A94A6] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        >
          arrow_drop_down
        </span>
      </button>

      {/* Searchable Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select platform language"
          className="absolute right-0 mt-1.5 w-64 sm:w-72 bg-[#17212B] border border-[#334155] rounded-[5px] shadow-2xl z-50 overflow-hidden flex flex-col"
          style={{ maxHeight: '380px' }}
        >
          {/* Search Header */}
          <div className="p-2 border-b border-[#334155] bg-[#0F141A]/70 sticky top-0 z-10">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#8A94A6] text-[16px]">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchLanguage', 'Search language...')}
                className="w-full h-8 bg-[#17212B] border border-[#334155] rounded text-white text-xs pl-7 pr-7 focus:outline-none focus:border-[#0B72B9]"
                aria-label={t('searchLanguage', 'Search language...')}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white text-xs"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
            <div className="flex justify-between items-center px-1 mt-1 text-[10px] text-[#8A94A6]">
              <span>22 Scheduled Languages + English</span>
              <span>{filteredLanguages.length} available</span>
            </div>
          </div>

          {/* Languages Scrollable List */}
          <div className="overflow-y-auto py-1 max-h-[280px] scrollbar-thin">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((item: LanguageInfo) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    id={`lang-option-${item.code}`}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelect(item.code)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors border-b border-[#334155]/20 last:border-0 ${
                      isSelected
                        ? 'bg-[#0B72B9] text-white font-bold'
                        : 'text-[#D7DEE8] hover:bg-[#1E2733] hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[13px] leading-tight font-medium">
                        {item.nativeName}
                      </span>
                      {item.nativeName !== item.name && (
                        <span
                          className={`text-[11px] leading-tight ${
                            isSelected ? 'text-white/80' : 'text-[#8A94A6]'
                          }`}
                        >
                          {item.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                          isSelected
                            ? 'bg-white/20 border-white/40 text-white'
                            : 'bg-[#0F141A] border-[#334155] text-[#8A94A6]'
                        }`}
                      >
                        {item.code.toUpperCase()}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-white">
                          check
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#8A94A6]">
                No language found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
