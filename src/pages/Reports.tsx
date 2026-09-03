import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { OFFICIAL_PUBLICATIONS, MeteorologicalPublication } from '../data/reportsAndArticles';
import { ReportsHero } from '../components/reports/ReportsHero';
import { ReportIntelligenceStrip } from '../components/reports/ReportIntelligenceStrip';
import { ReportOfTheDay } from '../components/reports/ReportOfTheDay';
import { FeaturedReportCard } from '../components/reports/FeaturedReportCard';
import { ResearchTimeline } from '../components/reports/ResearchTimeline';
import { ExploreByTopic } from '../components/reports/ExploreByTopic';
import { PublicationAnalytics } from '../components/reports/PublicationAnalytics';
import {
  ReportsSearchFilterBar,
  FilterCategory,
  SortOption,
  ViewMode,
} from '../components/reports/ReportsSearchFilterBar';
import { PublicationItem } from '../components/reports/PublicationItem';
import { RecentlyViewedReports } from '../components/reports/RecentlyViewedReports';
import { ReportPreviewDrawer } from '../components/reports/ReportPreviewDrawer';
import { ResearchSourcesSection } from '../components/reports/ResearchSourcesSection';
import { useSavedReports } from '../hooks/useSavedReports';
import { Sparkles, FileText, Search, BookOpen, Layers } from 'lucide-react';

interface ReportsPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedPublication, setSelectedPublication] = useState<MeteorologicalPublication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    savedReportIds,
    toggleSaveReport,
    isReportSaved,
    recentlyViewedIds,
    addRecentlyViewed,
    clearRecentlyViewed,
  } = useSavedReports();

  // Dynamically generate a live district bulletin customized for the current selected location
  const dynamicDistrictBulletin: MeteorologicalPublication = useMemo(() => {
    const temp = weatherBundle?.current?.temp ?? 28;
    const humidity = weatherBundle?.current?.humidity ?? 78;
    const condition = weatherBundle?.current?.condition ?? 'Partly Cloudy with Humid Atmospheric Flow';
    const pressure = weatherBundle?.current?.pressure ?? 1008;
    const windSpeed = weatherBundle?.current?.windSpeed ?? 14;

    return {
      id: `district-bulletin-${selectedLocation.id || 'live'}`,
      title: `District Meteorological Bulletin — ${selectedLocation.city}, ${selectedLocation.state}`,
      category: 'Sub-Divisional Report',
      type: 'PDF Bulletin',
      date: '31 August 2026',
      size: '1.1 MB',
      issuingAuthority: `Regional Meteorological Centre (${selectedLocation.state})`,
      documentNumber: `IMD-RMC-${selectedLocation.state.slice(0, 3).toUpperCase()}-${new Date().toISOString().slice(0, 10)}`,
      author: 'State Meteorological & Aviation Services Division',
      abstract: `Official sub-divisional observation and automated telemetry report for ${selectedLocation.city} (${selectedLocation.state}). Includes real-time AWS readings, boundary layer thermodynamics, convective index calculation, and 7-day numerical weather prediction guidance.`,
      keywords: [selectedLocation.city, selectedLocation.state, 'AWS Telemetry', 'Surface Observation', 'Local Nowcast', 'Monsoon'],
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
    const staticItems = OFFICIAL_PUBLICATIONS.filter((p) => p.id !== 'district-bulletin-regional');
    return [dynamicDistrictBulletin, ...staticItems];
  }, [dynamicDistrictBulletin]);

  // Featured flagship report (Monsoon report or dynamic bulletin)
  const featuredReport = useMemo(() => {
    return (
      allPublications.find((p) => p.id === 'monsoon-seasonal-rainfall-2026') ||
      allPublications[0]
    );
  }, [allPublications]);

  // Report of the Day editorial highlight
  const reportOfTheDay = useMemo(() => {
    return (
      allPublications.find((p) => p.id === 'dwr-nowcasting-thunderstorm-dynamics') ||
      allPublications[1] ||
      allPublications[0]
    );
  }, [allPublications]);

  // Filter & Sort Logic
  const filteredPublications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = allPublications.filter((pub) => {
      // 1. Search Query
      const matchesSearch =
        q === '' ||
        pub.title.toLowerCase().includes(q) ||
        pub.category.toLowerCase().includes(q) ||
        pub.type.toLowerCase().includes(q) ||
        pub.abstract.toLowerCase().includes(q) ||
        pub.author.toLowerCase().includes(q) ||
        pub.documentNumber.toLowerCase().includes(q) ||
        pub.keywords.some((k) => k.toLowerCase().includes(q));

      // 2. Category Filter
      let matchesCategory = true;
      if (selectedCategory === 'SAVED') {
        matchesCategory = savedReportIds.includes(pub.id);
      } else if (selectedCategory === 'OFFICIAL') {
        matchesCategory =
          pub.type === 'PDF Bulletin' ||
          pub.type === 'GKMS Bulletin' ||
          pub.type === 'Government Publication' ||
          pub.category === 'National Weather Observation' ||
          pub.category === 'Sub-Divisional Report';
      } else if (selectedCategory === 'RESEARCH') {
        matchesCategory =
          pub.type === 'Research Article' ||
          pub.type === 'Technical Monograph' ||
          pub.category === 'Scientific Monograph' ||
          pub.category === 'Climatological Study';
      } else if (selectedCategory === 'WEATHER') {
        matchesCategory =
          pub.category === 'National Weather Observation' ||
          pub.category === 'Sub-Divisional Report' ||
          pub.keywords.some((k) => k.toLowerCase().includes('weather') || k.toLowerCase().includes('telemetry'));
      } else if (selectedCategory === 'CLIMATOLOGY') {
        matchesCategory =
          pub.category === 'Climatological Study' ||
          pub.keywords.some((k) => k.toLowerCase().includes('climat') || k.toLowerCase().includes('heat'));
      } else if (selectedCategory === 'AGROMET') {
        matchesCategory =
          pub.category === 'Agricultural Meteorology' ||
          pub.type === 'GKMS Bulletin' ||
          pub.keywords.some((k) => k.toLowerCase().includes('agromet') || k.toLowerCase().includes('crop'));
      } else if (selectedCategory === 'AIR QUALITY') {
        matchesCategory =
          pub.category === 'Environmental Registry' ||
          pub.keywords.some((k) => k.toLowerCase().includes('air') || k.toLowerCase().includes('aqi') || k.toLowerCase().includes('pollen'));
      } else if (selectedCategory === 'RADAR') {
        matchesCategory =
          pub.id.includes('radar') ||
          pub.keywords.some((k) => k.toLowerCase().includes('radar') || k.toLowerCase().includes('nowcast'));
      } else if (selectedCategory === 'SATELLITE') {
        matchesCategory =
          pub.id.includes('satellite') ||
          pub.keywords.some((k) => k.toLowerCase().includes('satellite') || k.toLowerCase().includes('isro'));
      }

      // 3. Date Range Filter
      let matchesDateRange = true;
      if (dateRange[0] || dateRange[1]) {
        const pubDate = new Date(pub.date);
        if (!isNaN(pubDate.getTime())) {
          if (dateRange[0]) {
            const start = new Date(dateRange[0]);
            start.setHours(0, 0, 0, 0);
            if (pubDate < start) matchesDateRange = false;
          }
          if (dateRange[1]) {
            const end = new Date(dateRange[1]);
            end.setHours(23, 59, 59, 999);
            if (pubDate > end) matchesDateRange = false;
          }
        }
      }

      return matchesSearch && matchesCategory && matchesDateRange;
    });

    // Sort order
    return [...filtered].sort((a, b) => {
      if (sortOption === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'CATEGORY') {
        return a.category.localeCompare(b.category);
      }
      if (sortOption === 'OLDEST') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      // NEWEST default
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [allPublications, searchQuery, selectedCategory, sortOption, savedReportIds, dateRange]);

  const handleOpenPublication = (pub: MeteorologicalPublication) => {
    setSelectedPublication(pub);
    addRecentlyViewed(pub.id);
    setIsDrawerOpen(true);
  };

  const handleSelectTopic = (topicQuery: string) => {
    setSearchQuery(topicQuery);
    setSelectedCategory('ALL');
    // Smooth scroll to the library listing
    const el = document.getElementById('reports-search-filter-system');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="mausam-reports-library-page" className="space-y-8 pb-12">
      {/* 1. Hero Introduction & Publication Intelligence Stats */}
      <ReportsHero publications={allPublications} />

      {/* 2. Horizontal Intelligence Summary Strip */}
      <ReportIntelligenceStrip />

      {/* 3. Report of the Day (Editorial Spotlight) */}
      <ReportOfTheDay
        publication={reportOfTheDay}
        onOpenReport={handleOpenPublication}
        onBookmark={toggleSaveReport}
        isSaved={isReportSaved(reportOfTheDay.id)}
      />

      {/* 4. Flagship Featured Report Showcase */}
      <FeaturedReportCard
        publication={featuredReport}
        onOpenReport={handleOpenPublication}
        onBookmark={toggleSaveReport}
        isSaved={isReportSaved(featuredReport.id)}
      />

      {/* 5. Chronological Meteorological Research Timeline */}
      <ResearchTimeline
        publications={allPublications}
        onOpenReport={handleOpenPublication}
      />

      {/* 6. Explore by Domain Taxonomy */}
      <ExploreByTopic
        publications={allPublications}
        onSelectTopic={handleSelectTopic}
        activeQuery={searchQuery}
      />

      {/* 7. Bibliometric Intelligence & Research Distribution */}
      <PublicationAnalytics publications={allPublications} />

      {/* 8. Research Library Control System (Search, Filters, Sort, View Toggle) */}
      <div className="space-y-4">
        <ReportsSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredPublications.length}
          totalAvailableCount={allPublications.length}
          savedCount={savedReportIds.length}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Recently Viewed Strip */}
        <RecentlyViewedReports
          recentIds={recentlyViewedIds}
          allPublications={allPublications}
          onOpenReport={handleOpenPublication}
          onClear={clearRecentlyViewed}
        />

        {/* Publication Results (List / Grid View) */}
        {filteredPublications.length === 0 ? (
          <div className="rounded-3xl bg-[#0B141F] border border-[#1E2E40] text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              No matching meteorological publications found
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Try adjusting your search terms, exploring a different domain topic, or resetting your filter category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-[#38BDF8] text-[#0A1017] text-xs font-mono font-bold hover:bg-[#0284C7] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Reset Library Filters</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPublications.map((pub) => (
              <PublicationItem
                key={pub.id}
                publication={pub}
                viewMode="grid"
                onOpenReport={handleOpenPublication}
                onBookmark={toggleSaveReport}
                isSaved={isReportSaved(pub.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPublications.map((pub) => (
              <PublicationItem
                key={pub.id}
                publication={pub}
                viewMode="list"
                onOpenReport={handleOpenPublication}
                onBookmark={toggleSaveReport}
                isSaved={isReportSaved(pub.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 9. Institutional Authorities & Data Provenance */}
      <ResearchSourcesSection />

      {/* 10. Slide-in Document Reader Drawer */}
      <ReportPreviewDrawer
        publication={selectedPublication}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onBookmark={toggleSaveReport}
        isSaved={selectedPublication ? isReportSaved(selectedPublication.id) : false}
      />
    </div>
  );
};
