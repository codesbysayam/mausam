import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { OFFICIAL_PUBLICATIONS, MeteorologicalPublication } from '../data/reportsAndArticles';
import { ReportDetailModal } from '../components/ReportDetailModal';

interface ReportsPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPublication, setSelectedPublication] = useState<MeteorologicalPublication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'all' | 'bulletins' | 'articles'>('all');

  // Dynamically generate a live district bulletin customized for the current selected location
  const dynamicDistrictBulletin: MeteorologicalPublication = useMemo(() => {
    const temp = weatherBundle?.currentWeather?.temperature ?? 28;
    const humidity = weatherBundle?.currentWeather?.humidity ?? 78;
    const condition = weatherBundle?.currentWeather?.condition ?? 'Partly Cloudy with Humid Atmospheric Flow';
    const pressure = weatherBundle?.currentWeather?.pressure ?? 1008;
    const windSpeed = weatherBundle?.currentWeather?.windSpeed ?? 14;

    return {
      id: `district-bulletin-${selectedLocation.id || 'live'}`,
      title: `District Meteorological Bulletin — ${selectedLocation.city}, ${selectedLocation.state}`,
      category: 'Sub-Divisional Report',
      type: 'PDF Bulletin',
      date: '26 August 2026',
      size: '1.1 MB',
      issuingAuthority: `Regional Meteorological Observatory (${selectedLocation.state})`,
      documentNumber: `IMD-RMC-${selectedLocation.state.slice(0, 3).toUpperCase()}-${new Date().toISOString().slice(0, 10)}`,
      author: 'State Meteorological & Aviation Services Division',
      abstract: `Official sub-divisional observation and automated telemetry report for ${selectedLocation.city} (${selectedLocation.state}). Includes real-time AWS readings, boundary layer thermodynamics, convective index calculation, and 7-day numerical weather prediction guidance.`,
      keywords: [selectedLocation.city, selectedLocation.state, 'AWS Telemetry', 'Surface Observation', 'Local Nowcast'],
      synopticSummary: `Current synoptic observations at ${selectedLocation.city} station indicate surface temperature of ${temp}°C with relative humidity at ${humidity}% and mean sea-level pressure of ${pressure} hPa. Prevailing surface winds are ${windSpeed} km/h with general sky condition characterized as ${condition}.`,
      recommendations: [
        `Public and district administration in ${selectedLocation.city} should monitor localized radar nowcast updates for convective thunder cell passage.`,
        'Agricultural workers in adjoining taluks should adjust field irrigation in accordance with 3-day precipitation probabilities.',
        'Transport and municipal authorities should keep drainage pathways free of debris during convective downpours.'
      ],
      sections: [
        {
          title: `1. Live Surface Telemetry at ${selectedLocation.city} Observatory`,
          content: `Real-time sensor values recorded at the primary Automatic Weather Station (Station ID: ${selectedLocation.stationId || '42971'}):`,
          tableData: {
            headers: ['Atmospheric Metric', 'Observed Value', 'Historical Normal', 'Status'],
            rows: [
              ['Surface Temperature', `${temp} °C`, '29.5 °C', 'Within Normal Range'],
              ['Relative Humidity', `${humidity} %`, '72 %', 'Moist / Convective'],
              ['Atmospheric Pressure', `${pressure} hPa`, '1009.2 hPa', 'Normal MSLP'],
              ['Wind Velocity', `${windSpeed} km/h`, '12 km/h', 'Gentle Breeze'],
              ['General Condition', condition, 'Seasonal Normal', 'Observed']
            ]
          }
        },
        {
          title: '2. Sub-Divisional Quantitative Precipitation & Alert Status',
          content: `Evaluation of regional convective potential index and 72-hour quantitative precipitation forecast (QPF) across ${selectedLocation.district || selectedLocation.city} district.`
        }
      ]
    };
  }, [weatherBundle, selectedLocation]);

  // Combine dynamic bulletin with official archive
  const allPublications: MeteorologicalPublication[] = useMemo(() => {
    // Replace the default district item with the dynamically customized one
    const staticItems = OFFICIAL_PUBLICATIONS.filter(p => p.id !== 'district-bulletin-regional');
    return [dynamicDistrictBulletin, ...staticItems];
  }, [dynamicDistrictBulletin]);

  // Categories list
  const categories = [
    'All',
    'National Weather Observation',
    'Sub-Divisional Report',
    'Climatological Study',
    'Environmental Registry',
    'Agricultural Meteorology',
    'Scientific Monograph'
  ];

  // Filtered publications based on real-time search (title, category, keywords, etc.) and category selector
  const filteredPublications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPublications.filter(pub => {
      const matchesSearch =
        q === '' ||
        pub.title.toLowerCase().includes(q) ||
        pub.category.toLowerCase().includes(q) ||
        pub.type.toLowerCase().includes(q) ||
        pub.abstract.toLowerCase().includes(q) ||
        pub.author.toLowerCase().includes(q) ||
        pub.documentNumber.toLowerCase().includes(q) ||
        pub.keywords.some(k => k.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || pub.category === selectedCategory;

      const matchesViewMode =
        activeViewMode === 'all' ||
        (activeViewMode === 'bulletins' && (pub.type === 'PDF Bulletin' || pub.type === 'GKMS Bulletin' || pub.type === 'Government Publication')) ||
        (activeViewMode === 'articles' && (pub.type === 'Research Article' || pub.type === 'Technical Monograph' || pub.category === 'Scientific Monograph' || pub.category === 'Climatological Study'));

      return matchesSearch && matchesCategory && matchesViewMode;
    });
  }, [allPublications, searchQuery, selectedCategory, activeViewMode]);

  const handleOpenPublication = (pub: MeteorologicalPublication) => {
    setSelectedPublication(pub);
    setIsModalOpen(true);
  };

  const handleQuickPrint = (e: React.MouseEvent, pub: MeteorologicalPublication) => {
    e.stopPropagation();
    setSelectedPublication(pub);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="mausam-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <SectionHeader
              title="Official Meteorological Reports, Bulletins & Scientific Articles"
              subtitle="Archive of national synoptic summaries, agromet bulletins, climatological monographs, and peer-reviewed atmospheric research"
              icon="menu_book"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveViewMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activeViewMode === 'all'
                  ? 'bg-[#0B72B9] text-white'
                  : 'bg-[#1E2733] text-[#8A94A6] hover:text-white border border-[#334155]'
              }`}
            >
              All Publications ({allPublications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('bulletins')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activeViewMode === 'bulletins'
                  ? 'bg-[#0B72B9] text-white'
                  : 'bg-[#1E2733] text-[#8A94A6] hover:text-white border border-[#334155]'
              }`}
            >
              Official Bulletins
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('articles')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activeViewMode === 'articles'
                  ? 'bg-[#0B72B9] text-white'
                  : 'bg-[#1E2733] text-[#8A94A6] hover:text-white border border-[#334155]'
              }`}
            >
              Research Articles &amp; Monographs
            </button>
          </div>
        </div>

        {/* Real-time Search & Category Filter Bar */}
        <div className="mt-5 pt-4 border-t border-[#334155] flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Real-Time Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles and bulletins by title or report category (e.g., Daily Weather, Agrometeorology, Climatological, Monsoon)..."
                className="w-full bg-[#0F141A] border border-[#334155] text-white text-xs pl-9 pr-8 py-2.5 rounded focus:outline-none focus:border-[#0B72B9] placeholder:text-[#8A94A6] transition-colors"
                id="reports-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#8A94A6] whitespace-nowrap">Filter Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0F141A] border border-[#334155] text-white text-xs px-3 py-2.5 rounded focus:outline-none focus:border-[#0B72B9] cursor-pointer"
                id="reports-category-select"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Chips for One-Click Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-[#8A94A6] font-medium shrink-0 mr-1">Quick Filter:</span>
            {categories.map((cat, idx) => {
              const count = cat === 'All'
                ? allPublications.length
                : allPublications.filter(p => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0B72B9] text-white border-[#0B72B9]'
                      : 'bg-[#1E2733] text-[#8A94A6] hover:text-white hover:bg-[#2A3749] border-[#334155]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Live Search Status Bar */}
          <div className="flex items-center justify-between text-[11px] text-[#8A94A6] pt-1">
            <div className="flex items-center gap-2">
              <span>Showing <strong className="text-white">{filteredPublications.length}</strong> of {allPublications.length} publications</span>
              {(searchQuery.trim() !== '' || selectedCategory !== 'All' || activeViewMode !== 'all') && (
                <span className="inline-flex items-center gap-1 text-[#4FA8E0] bg-[#0B72B9]/15 px-2 py-0.5 rounded border border-[#0B72B9]/30">
                  <span>Filtered</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setActiveViewMode('all');
                    }}
                    className="hover:text-white underline text-[10px] ml-1 cursor-pointer"
                  >
                    Reset all
                  </button>
                </span>
              )}
            </div>
            {searchQuery && (
              <span className="text-xs text-[#8A94A6] truncate max-w-[200px] sm:max-w-none">
                Matching: <span className="text-[#F1C40F] font-mono">"{searchQuery}"</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Publications Listing Grid */}
      <div className="flex flex-col gap-3">
        {filteredPublications.length === 0 ? (
          <div className="mausam-card text-center py-12">
            <span className="material-symbols-outlined text-[#8A94A6] text-[40px] mb-2">
              find_in_page
            </span>
            <h3 className="text-sm font-bold text-white mb-1">No matching meteorological publications found</h3>
            <p className="text-xs text-[#8A94A6]">
              Try adjusting your search keywords or switching category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setActiveViewMode('all');
              }}
              className="mausam-btn mausam-btn--secondary mausam-btn--sm mt-3 inline-flex items-center gap-1"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPublications.map((pub) => {
            const isArticle = pub.type === 'Research Article' || pub.type === 'Technical Monograph';
            return (
              <div
                key={pub.id}
                onClick={() => handleOpenPublication(pub)}
                className="mausam-card hover:border-[#0B72B9] transition-all cursor-pointer p-4 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Icon & Details */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      isArticle
                        ? 'bg-[#1ABC9C]/15 border border-[#1ABC9C]/40 text-[#1ABC9C]'
                        : 'bg-[#0B72B9]/15 border border-[#0B72B9]/40 text-[#4FA8E0]'
                    }`}>
                      <span className="material-symbols-outlined text-[22px]">
                        {isArticle ? 'article' : 'picture_as_pdf'}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          isArticle
                            ? 'bg-[#1ABC9C]/10 text-[#1ABC9C] border-[#1ABC9C]/30'
                            : 'bg-[#0B72B9]/10 text-[#4FA8E0] border-[#0B72B9]/30'
                        }`}>
                          {pub.type}
                        </span>
                        <span className="text-[11px] text-[#8A94A6] font-mono">
                          {pub.documentNumber}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#4FA8E0] transition-colors leading-snug">
                        {pub.title}
                      </h3>

                      <p className="text-xs text-[#8A94A6] mt-1 line-clamp-2 leading-relaxed">
                        {pub.abstract}
                      </p>

                      <div className="text-xs text-[#8A94A6] mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Category: <strong className="text-[#D7DEE8]">{pub.category}</strong></span>
                        <span>•</span>
                        <span>Date: <strong className="text-[#D7DEE8]">{pub.date}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-[#D7DEE8] font-mono">{pub.size}</strong></span>
                        <span>•</span>
                        <span>Author: <strong className="text-[#D7DEE8]">{pub.author}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleQuickPrint(e, pub)}
                      className="mausam-btn mausam-btn--primary mausam-btn--sm shrink-0 flex items-center gap-1.5"
                      title="Open full interactive viewer, export PDF, print, or download document"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        print
                      </span>
                      <span>Export / Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPublication(pub);
                      }}
                      className="text-xs text-[#4FA8E0] hover:text-white flex items-center gap-1 py-1 px-2 rounded hover:bg-[#1E2733] transition-colors"
                    >
                      <span>Read Full Text</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <ReportDetailModal
        publication={selectedPublication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
