import React from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Bookmark,
  X,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';
import { DateRangePicker } from '../DateRangePicker';

export type FilterCategory =
  | 'ALL'
  | 'WEATHER'
  | 'CLIMATOLOGY'
  | 'AGROMET'
  | 'AIR QUALITY'
  | 'RADAR'
  | 'SATELLITE'
  | 'RESEARCH'
  | 'OFFICIAL'
  | 'SAVED';

export type SortOption = 'NEWEST' | 'OLDEST' | 'TITLE' | 'CATEGORY';

export type ViewMode = 'list' | 'grid';

interface ReportsSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: FilterCategory;
  onCategoryChange: (cat: FilterCategory) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFilteredCount: number;
  totalAvailableCount: number;
  savedCount: number;
  dateRange?: [Date | null, Date | null];
  onDateRangeChange?: (range: [Date | null, Date | null]) => void;
}

export const ReportsSearchFilterBar: React.FC<ReportsSearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalAvailableCount,
  savedCount,
  dateRange = [null, null],
  onDateRangeChange,
}) => {
  const categories: { id: FilterCategory; label: string; countSuffix?: number }[] = [
    { id: 'ALL', label: 'All Publications' },
    { id: 'OFFICIAL', label: 'Official Bulletins' },
    { id: 'RESEARCH', label: 'Research Articles' },
    { id: 'WEATHER', label: 'Weather Synoptics' },
    { id: 'CLIMATOLOGY', label: 'Climatology' },
    { id: 'AGROMET', label: 'Agromet' },
    { id: 'AIR QUALITY', label: 'Air Quality' },
    { id: 'RADAR', label: 'Radar & Nowcasting' },
    { id: 'SATELLITE', label: 'Satellite' },
    { id: 'SAVED', label: 'Saved Library', countSuffix: savedCount },
  ];

  const isDateFilterActive = dateRange[0] !== null || dateRange[1] !== null;

  return (
    <div
      id="reports-search-filter-system"
      className="space-y-4 rounded-3xl bg-[#0C1521] border border-[#1E2E40] p-4 sm:p-6 shadow-xl"
    >
      {/* Top Search Input & Controls */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="reports-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search publications by title, keywords, division, ref ID or author..."
            className="w-full bg-[#080E16] border border-[#1E2E40] focus:border-[#38BDF8] rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 transition-all font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white p-1 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Date Range Picker, Sort & View Mode Controls */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 justify-between lg:justify-end flex-wrap sm:flex-nowrap">
          {/* Interactive Date Range Filter */}
          {onDateRangeChange && (
            <div className="shrink-0">
              <DateRangePicker
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={onDateRangeChange}
                placeholder="Filter by Date Range"
                align="right"
              />
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#080E16] border border-[#1E2E40] rounded-2xl px-3 py-2 text-xs font-mono text-[#94A3B8] shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#38BDF8]" />
            <label htmlFor="reports-sort-select" className="sr-only">Sort Publications</label>
            <select
              id="reports-sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="NEWEST" className="bg-[#0F172A] text-white">Newest First</option>
              <option value="OLDEST" className="bg-[#0F172A] text-white">Oldest First</option>
              <option value="TITLE" className="bg-[#0F172A] text-white">Title (A–Z)</option>
              <option value="CATEGORY" className="bg-[#0F172A] text-white">By Category</option>
            </select>
          </div>

          {/* View Toggle (List vs Grid) */}
          <div className="flex items-center bg-[#080E16] border border-[#1E2E40] rounded-2xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#38BDF8] text-[#0A1017] shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
              title="Row List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#38BDF8] text-[#0A1017] shadow-sm'
                  : 'text-[#64748B] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Category Chips with Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#38BDF8] text-[#0A1017] shadow-md shadow-[#38BDF8]/20 scale-[1.02]'
                  : 'bg-[#080E16] text-[#94A3B8] hover:text-white hover:bg-[#14202E] border border-[#1E2E40]'
              }`}
            >
              {cat.id === 'SAVED' && (
                <Bookmark className={`w-3.5 h-3.5 ${isSelected ? 'fill-[#0A1017]' : 'text-[#F59E0B]'}`} />
              )}
              <span>{cat.label}</span>
              {typeof cat.countSuffix === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-black/20 text-[#0A1017]' : 'bg-[#1E2E40] text-[#94A3B8]'
                  }`}
                >
                  {cat.countSuffix}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Status Indicator & Active Reset */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1E2E40] text-xs font-mono text-[#94A3B8] flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Displaying:</span>
          <strong className="text-white">
            {totalFilteredCount} of {totalAvailableCount} publications
          </strong>
          {(searchQuery || selectedCategory !== 'ALL' || isDateFilterActive) && (
            <span className="text-[#38BDF8]">• Filter Active</span>
          )}
          {isDateFilterActive && (
            <span className="bg-[#38BDF8]/15 text-[#38BDF8] px-2 py-0.5 rounded-full text-[10px] border border-[#38BDF8]/30">
              Date Filtered
            </span>
          )}
        </div>

        {(searchQuery || selectedCategory !== 'ALL' || isDateFilterActive) && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onCategoryChange('ALL');
              if (onDateRangeChange) onDateRangeChange([null, null]);
            }}
            className="text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Reset all filters</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
