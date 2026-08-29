import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CurrentWeather, WeatherStation } from '../types';
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  ALL_INDIA_STATES_MET_PROFILES,
  matchMausamQuery,
  GroundingLink,
  MausamContext,
} from '../services/mausamAiService';
import {
  SUPPORTED_MAUSAM_AI_LANGUAGES,
  resolveLanguageKey,
  getLocalizedInitialGreeting,
  getDrawerUiStrings,
} from '../data/mausamAiLanguages';
import { MausamMarkdown } from './MausamMarkdown';

interface AskMausamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeather;
  currentStation: WeatherStation;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  groundingSources?: GroundingLink[];
  suggestedFollowUps?: string[];
  modeUsed?: string;
}

export const AskMausamDrawer: React.FC<AskMausamDrawerProps> = ({
  isOpen,
  onClose,
  weather,
  currentStation,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'states'>('chat');
  const [groundingMode] = useState<'auto' | 'search' | 'maps'>('auto');
  const [language, setLanguage] = useState<string>('English');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [stateSearchQuery, setStateSearchQuery] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Clean station display string to prevent duplicate state names
  const stationDisplayName = useMemo(() => {
    const rawName = currentStation?.name || 'Observatory';
    const stateName = currentStation?.state || 'India';
    const matchParen = rawName.match(/\(([^)]+)\)/);
    if (matchParen && matchParen[1]) {
      const inside = matchParen[1].replace(/\s*-\s*[A-Z]{2}$/i, '').trim();
      return `${inside} (${stateName})`;
    }
    if (rawName.toLowerCase().includes(stateName.toLowerCase())) {
      return `${rawName}`;
    }
    return `${rawName} (${stateName})`;
  }, [currentStation]);

  const langKey = useMemo(() => resolveLanguageKey(language), [language]);
  const uiStrings = useMemo(() => getDrawerUiStrings(langKey), [langKey]);

  const createInitialMessage = useCallback((k: string): Message => {
    const greeting = getLocalizedInitialGreeting(stationDisplayName, currentStation, weather, k);
    return {
      id: 'init-1',
      role: 'assistant',
      content: greeting.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'India Meteorological Department (IMD) Grounded Core',
      suggestedFollowUps: greeting.suggestedFollowUps,
    };
  }, [stationDisplayName, currentStation, weather]);

  const [messages, setMessages] = useState<Message[]>(() => [createInitialMessage(resolveLanguageKey(language))]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When language is changed, update initial message if only initial message is present
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const newLangKey = resolveLanguageKey(newLanguage);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [createInitialMessage(newLangKey)];
      }
      return prev;
    });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Filtered FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchSearch =
        !faqSearchQuery.trim() ||
        item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.shortQuestion.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(faqSearchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, faqSearchQuery]);

  // Filtered States and UTs
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery.trim()) return ALL_INDIA_STATES_MET_PROFILES;
    const q = stateSearchQuery.toLowerCase();
    return ALL_INDIA_STATES_MET_PROFILES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.representativeStation.toLowerCase().includes(q) ||
        s.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [stateSearchQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setActiveTab('chat');

    const context: MausamContext = {
      station: currentStation,
      weather: weather,
      preferredLanguage: language,
    };

    try {
      // 1. First attempt to call the backend API with the preferred language
      const response = await fetch('/api/ask-mausam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          station: currentStation,
          mode: groundingMode,
          lat: currentStation.lat,
          lng: currentStation.lng,
          preferredLanguage: language,
          location: {
            country: 'India',
            state: currentStation.state,
            city: currentStation.district || currentStation.name,
            station: currentStation.name,
            stationId: currentStation.code || currentStation.id || '42971',
            latitude: currentStation.lat,
            longitude: currentStation.lng,
          },
          observation: {
            temperatureC: weather.temp,
            feelsLikeC: weather.feelsLike ?? weather.temp,
            condition: weather.condition,
            relativeHumidity: weather.humidity,
            windSpeedKmh: weather.windSpeed,
            windDirection: weather.windDirection,
            windDirectionDegrees: weather.windDirectionDeg ?? 247,
            pressureHpa: weather.pressure,
            visibilityKm: weather.visibilityKm ?? 7,
            dewPointC: weather.dewPoint,
            rainfall24hMm: weather.precipitation,
            rainProbability: weather.precipitationProbability,
            uvIndex: weather.uvIndex,
          },
          airQuality: {
            aqi: weather.aqiIndex ?? 63,
            pm25: weather.aqiPm25,
            pm10: weather.aqiPm10 ?? 58,
            category: weather.aqiStatus,
          },
          pollen: {
            index: weather.pollenCount ?? 8,
            category: weather.pollen,
          },
          astronomy: {
            sunrise: weather.sunrise ?? '05:29',
            sunset: weather.sunset ?? '18:07',
          },
          metadata: {
            observedAt: weather.lastUpdated || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: weather.source || 'India Meteorological Department (IMD)',
            status: weather.isLive ? 'LIVE' : 'OBSERVED',
          },
          weatherContext: {
            temp: weather.temp,
            high: weather.high,
            low: weather.low,
            condition: weather.condition,
            aqi: weather.aqiPm25,
            uv: weather.uvIndex,
            humidity: weather.humidity,
            pollen: weather.pollen,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // If backend gave an empty or generic error response, use client-side knowledge matcher
      if (!data.response || data.response.includes('temporarily unavailable')) {
        const clientAiMatch = matchMausamQuery(query, context, language);
        const assistantMsg: Message = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: clientAiMatch.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: clientAiMatch.source,
          groundingSources: clientAiMatch.groundingSources,
          suggestedFollowUps: clientAiMatch.suggestedFollowUps,
          modeUsed: clientAiMatch.modeUsed,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // Check for follow-up suggestions from client knowledge engine
      const clientLookup = matchMausamQuery(query, context, language);

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'India Meteorological Department (IMD)',
        groundingSources:
          data.groundingSources && data.groundingSources.length > 0
            ? data.groundingSources
            : clientLookup.groundingSources,
        suggestedFollowUps: clientLookup.suggestedFollowUps,
        modeUsed: data.modeUsed || 'online-grounded',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Backend /api/ask-mausam unavailable or offline, activating localized atmospheric engine:', err);
      // High-precision offline / static deployment fallback
      const localResult = matchMausamQuery(query, context, language);

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: localResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: localResult.source,
        groundingSources: localResult.groundingSources,
        suggestedFollowUps: localResult.suggestedFollowUps,
        modeUsed: localResult.modeUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([createInitialMessage(langKey)]);
  };

  // Lock body scroll and listen for Escape key
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

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs transition-opacity select-none font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Ask MAUSAM AI Weather & Atmospheric Intelligence Assistant"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full sm:max-w-xl bg-[#0B1017] border-l border-[#202B3B] h-full max-h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-[#D7DEE8]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#202B3B] flex justify-between items-center bg-[#111923] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#0B72B9]/15 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                  Ask MAUSAM AI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#0B72B9]/20 text-[#4FA8E0] text-[10px] font-bold border border-[#0B72B9]/40 shrink-0">
                  IMD Telemetry
                </span>
              </div>
              <p className="text-[11px] text-[#8A94A6] truncate mt-0.5">
                Observatory: <span className="text-[#4FA8E0] font-medium">{stationDisplayName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 rounded-lg bg-[#17212B] border border-[#202B3B] text-[#8A94A6] hover:text-white hover:border-[#334155] cursor-pointer transition-colors"
              aria-label="Clear chat"
            >
              <span className="material-symbols-outlined text-[17px]">restart_alt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#17212B] border border-[#202B3B] text-[#8A94A6] hover:text-white hover:border-[#334155] cursor-pointer transition-colors"
              aria-label="Close assistant"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Selector & Controls */}
        <div className="px-3 sm:px-4 py-2 bg-[#0E1520] border-b border-[#202B3B] flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
          {/* Main Tabs */}
          <div className="flex items-center bg-[#17212B] p-0.5 rounded-lg border border-[#202B3B]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">chat</span>
              {uiStrings.chatStream}
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              {uiStrings.faqLibrary} ({FAQ_ITEMS.length})
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`px-2.5 sm:px-3 py-1 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'states'
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">map</span>
              {uiStrings.statesDirectory}
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8A94A6] text-[14px]">translate</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-[#17212B] text-[#4FA8E0] text-[11px] font-medium rounded-md border border-[#202B3B] px-2 py-1 focus:outline-none focus:border-[#0B72B9]"
              aria-label="Select Assistant Language"
            >
              {SUPPORTED_MAUSAM_AI_LANGUAGES.map((lang) => (
                <option key={lang.key} value={lang.label} className="bg-[#17212B] text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: Chat Stream */}
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3.5 sm:gap-4 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 sm:p-4 rounded-xl max-w-[94%] sm:max-w-[92%] text-xs sm:text-[13px] leading-relaxed break-words [overflow-wrap:anywhere] shadow-md ${
                    m.role === 'user'
                      ? 'bg-[#0B72B9] text-white font-medium rounded-tr-none'
                      : 'bg-[#131C28] border border-[#202B3B] text-[#D7DEE8] rounded-tl-none'
                  }`}
                >
                  {m.role === 'user' ? (
                    <div className="text-white font-medium whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <MausamMarkdown content={m.content} />
                  )}

                  {/* Grounding Source Citations & Maps links */}
                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-[#202B3B] flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-[#4FA8E0] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        {uiStrings.officialReferences}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.groundingSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#0B72B9]/15 text-[#4FA8E0] hover:bg-[#0B72B9]/25 border border-[#0B72B9]/30 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {source.type === 'maps' ? 'place' : 'link'}
                            </span>
                            <span className="truncate max-w-[160px] sm:max-w-[220px]">
                              {source.title}
                            </span>
                            <span className="material-symbols-outlined text-[10px] opacity-70">
                              open_in_new
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Suggested Follow-Up Chips inside Message */}
                  {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-[#202B3B] flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A94A6] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lightbulb</span>
                        {uiStrings.suggestedInquiries}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestedFollowUps.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSendMessage(chip)}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-[#1B2737] hover:bg-[#0B72B9]/30 hover:border-[#4FA8E0] border border-[#2B3B50] text-[#CBD5E1] transition-all text-left cursor-pointer flex items-center gap-1"
                          >
                            <span className="text-[#4FA8E0]">›</span>
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata & copy action */}
                  {m.role === 'assistant' && (
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8A94A6] pt-1.5 border-t border-[#202B3B]/60">
                      <span className="truncate max-w-[200px] sm:max-w-[260px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-[#2ECC71]">
                          check_circle
                        </span>
                        {m.source || 'IMD Grounded Core'}
                      </span>
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#202B3B] transition-colors cursor-pointer"
                        title={uiStrings.copy}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {copiedMessageId === m.id ? 'done' : 'content_copy'}
                        </span>
                        <span>{copiedMessageId === m.id ? uiStrings.copied : uiStrings.copy}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#64748B] mt-1 px-1 font-mono">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-[#4FA8E0] text-xs p-3.5 bg-[#131C28] rounded-xl border border-[#202B3B] w-fit shadow-md animate-pulse">
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                <span>{uiStrings.loadingText} {stationDisplayName}...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* TAB 2: Comprehensive FAQ Library */}
        {activeTab === 'faqs' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 scrollbar-thin">
            {/* Search within FAQs */}
            <div className="relative shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8A94A6] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder={uiStrings.faqSearchPlaceholder}
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full bg-[#131C28] border border-[#202B3B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#0B72B9]"
              />
              {faqSearchQuery && (
                <button
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#8A94A6] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0B72B9] text-white shadow-sm'
                      : 'bg-[#131C28] text-[#8A94A6] hover:text-white border border-[#202B3B]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* FAQ List Cards */}
            <div className="flex flex-col gap-2">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-[#8A94A6] text-xs">
                  <span className="material-symbols-outlined text-[32px] mb-2 block text-[#4FA8E0]">
                    quiz
                  </span>
                  No FAQs matching &quot;{faqSearchQuery}&quot;. Try asking in the chat stream!
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    onClick={() => handleSendMessage(faq.question)}
                    className="p-3 rounded-xl bg-[#131C28] border border-[#202B3B] hover:border-[#0B72B9] hover:bg-[#172332] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs sm:text-[13px] group-hover:text-[#4FA8E0] transition-colors">
                          {faq.question}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A94A6] line-clamp-2">
                        {faq.shortQuestion}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B72B9]/15 text-[#4FA8E0] font-medium">
                          {faq.categoryId.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#8A94A6]">
                          {faq.keywords.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#1B2737] flex items-center justify-center text-[#8A94A6] group-hover:text-white group-hover:bg-[#0B72B9] shrink-0 transition-colors mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: All 28 States & 8 UTs Meteorological Directory */}
        {activeTab === 'states' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 scrollbar-thin">
            {/* Search States & UTs */}
            <div className="relative shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8A94A6] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder={uiStrings.statesSearchPlaceholder}
                value={stateSearchQuery}
                onChange={(e) => setStateSearchQuery(e.target.value)}
                className="w-full bg-[#131C28] border border-[#202B3B] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#0B72B9]"
              />
              {stateSearchQuery && (
                <button
                  onClick={() => setStateSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#8A94A6] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-[#8A94A6] flex items-center justify-between">
              <span>Showing {filteredStates.length} Indian States & Union Territories</span>
              <span className="text-[#4FA8E0] font-medium">Click any region to query IMD AI</span>
            </div>

            {/* State Cards */}
            <div className="grid grid-cols-1 gap-2">
              {filteredStates.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSendMessage(`What is the meteorological profile and weather forecast for ${st.name}?`)}
                  className="p-3 rounded-xl bg-[#131C28] border border-[#202B3B] hover:border-[#0B72B9] hover:bg-[#172332] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs sm:text-[13px] group-hover:text-[#4FA8E0] transition-colors">
                        {st.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#202B3B] text-[#94A3B8]">
                        {st.code}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#0B72B9]/20 text-[#4FA8E0]">
                        {st.type === 'UNION_TERRITORY' ? 'UT' : 'State'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#CBD5E1]">
                      Capital / Observatory: <strong className="text-white">{st.capital}</strong> ({st.representativeStation})
                    </p>
                    <p className="text-[10px] text-[#8A94A6] line-clamp-1">
                      Radar: {st.primaryRadar} | Zone: {st.agroZone}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-[#4FA8E0]">
                      {st.normalTemp.min}° - {st.normalTemp.max}°C
                    </span>
                    <span className="text-[10px] text-[#2ECC71]">
                      AQI {st.typicalAqi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips (Available on Chat Tab) */}
        {activeTab === 'chat' && (
          <div className="p-2.5 sm:p-3 border-t border-[#202B3B] bg-[#0E1520] flex flex-wrap gap-1.5 max-h-28 overflow-y-auto shrink-0">
            {FAQ_ITEMS.slice(0, 8).map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleSendMessage(faq.question)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#131C28] border border-[#202B3B] text-[#D7DEE8] hover:text-[#4FA8E0] hover:border-[#4FA8E0] transition-all text-left cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[13px] text-[#4FA8E0]">
                  contact_support
                </span>
                <span className="truncate max-w-[200px]">{faq.shortQuestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-3.5 border-t border-[#202B3B] bg-[#111923] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={uiStrings.inputPlaceholder}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#0B1017] border border-[#202B3B] rounded-lg px-3.5 py-2.5 text-xs sm:text-[13px] text-white placeholder-[#64748B] focus:outline-none focus:border-[#0B72B9] transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            className="px-3.5 py-2.5 rounded-lg bg-[#0B72B9] hover:bg-[#0B72B9]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
