import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  DAY_NAMES,
  DAY_NAMES_FULL,
  generateCalendarGrid,
  isSameDay,
  formatDateISO,
  formatDateFull,
} from '../utils/dateUtils';
import { triggerHaptic } from '../utils/haptics';

export interface WeatherDayMarker {
  temp?: number;
  condition?: string;
  alertLevel?: 'green' | 'yellow' | 'orange' | 'red';
  hasData?: boolean;
}

export interface DateCalendarProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showToday?: boolean;
  className?: string;
  weatherMarkers?: Record<string, WeatherDayMarker>;
  onClose?: () => void;
  ariaLabel?: string;
}

export const DateCalendar: React.FC<DateCalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  showToday = true,
  className = '',
  weatherMarkers = {},
  onClose,
  ariaLabel = 'Interactive Weather Calendar',
}) => {
  const initialDate = value || new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState<boolean>(false);
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // Keep view aligned when value changes externally
  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  const handlePrevMonth = () => {
    triggerHaptic('tap');
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic('tap');
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrevYear = () => {
    triggerHaptic('tap');
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    triggerHaptic('tap');
    setViewYear((y) => y + 1);
  };

  const handleGoToToday = () => {
    triggerHaptic('selection');
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(today);
  };

  const handleSelectDate = (date: Date) => {
    triggerHaptic('selection');
    onChange(date);
  };

  // Keyboard navigation handler for calendar accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isMonthYearPickerOpen) return;

      const currentDate = value || new Date();
      let targetDate: Date | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          targetDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'ArrowRight':
          targetDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'ArrowUp':
          targetDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'ArrowDown':
          targetDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'PageUp':
          if (e.shiftKey) {
            handlePrevYear();
          } else {
            handlePrevMonth();
          }
          e.preventDefault();
          return;
        case 'PageDown':
          if (e.shiftKey) {
            handleNextYear();
          } else {
            handleNextMonth();
          }
          e.preventDefault();
          return;
        case 'Escape':
          if (onClose) {
            onClose();
            e.preventDefault();
          }
          return;
        default:
          return;
      }

      if (targetDate) {
        e.preventDefault();
        // Check min/max bounds
        if (minDate && targetDate < minDate) return;
        if (maxDate && targetDate > maxDate) return;
        handleSelectDate(targetDate);
      }
    },
    [value, minDate, maxDate, isMonthYearPickerOpen, onClose]
  );

  const calendarDays = generateCalendarGrid(
    viewYear,
    viewMonth,
    value,
    null,
    null,
    minDate,
    maxDate,
    disabledDates
  );

  // Available years for quick selector (current year ± 10 years)
  const currentRealYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentRealYear - 10 + i);

  return (
    <div
      className={`date-calendar-root select-none w-full max-w-[340px] bg-[#0B141E] border border-[#1E2D3D] rounded-2xl p-4 shadow-2xl text-slate-100 ${className}`}
      role="region"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 1. HEADER: Month, Year, and Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#162331]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevYear}
            className="p-1.5 rounded-lg text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer"
            title="Previous Year"
            aria-label="Previous Year"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Month & Year Quick Selector toggle */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            setIsMonthYearPickerOpen(!isMonthYearPickerOpen);
          }}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#F4F7FA] px-2.5 py-1 rounded-lg hover:bg-[#111F30] border border-transparent hover:border-[#1E2D3D] transition-colors cursor-pointer"
          aria-expanded={isMonthYearPickerOpen}
          aria-label="Select month and year directly"
        >
          <span className="text-[#38BDF8]">{MONTH_NAMES[viewMonth]}</span>
          <span className="text-white">{viewYear}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextYear}
            className="p-1.5 rounded-lg text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer"
            title="Next Year"
            aria-label="Next Year"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH / YEAR QUICK SELECT POPUP */}
      {isMonthYearPickerOpen ? (
        <div className="py-2 space-y-3 animate-fade-in">
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider px-1">
            Choose Month
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {MONTH_NAMES_SHORT.map((mShort, idx) => (
              <button
                key={mShort}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setViewMonth(idx);
                  setIsMonthYearPickerOpen(false);
                }}
                className={`py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer ${
                  viewMonth === idx
                    ? 'bg-[#1499E8] text-white font-bold'
                    : 'bg-[#071018] text-[#93A4B8] hover:bg-[#111F30] hover:text-white border border-[#162331]'
                }`}
              >
                {mShort}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider px-1 pt-1">
            Choose Year
          </div>
          <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {yearOptions.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setViewYear(y);
                  setIsMonthYearPickerOpen(false);
                }}
                className={`py-1 text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer ${
                  viewYear === y
                    ? 'bg-[#1499E8] text-white font-bold'
                    : 'bg-[#071018] text-[#93A4B8] hover:bg-[#111F30] hover:text-white border border-[#162331]'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 2. WEEKDAY LABELS */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((day, idx) => (
              <span
                key={day}
                className={`text-[10px] font-mono font-semibold uppercase tracking-wider py-1 ${
                  idx === 0 || idx === 6 ? 'text-[#F59E0B]' : 'text-[#64748B]'
                }`}
                title={DAY_NAMES_FULL[idx]}
              >
                {day}
              </span>
            ))}
          </div>

          {/* 3. DAYS GRID */}
          <div className="grid grid-cols-7 gap-1" ref={calendarGridRef}>
            {calendarDays.map((cell, idx) => {
              const isoKey = formatDateISO(cell.date);
              const marker = weatherMarkers[isoKey];

              let cellClass =
                'relative h-8 sm:h-9 rounded-xl text-xs font-mono font-semibold flex flex-col items-center justify-center transition-all cursor-pointer';

              if (cell.isDisabled) {
                cellClass += ' text-[#334155] opacity-40 cursor-not-allowed bg-transparent';
              } else if (cell.isSelected) {
                cellClass +=
                  ' bg-[#1499E8] text-white font-bold shadow-[0_0_12px_rgba(20,153,232,0.5)] scale-[1.03] z-10';
              } else if (cell.isToday) {
                cellClass +=
                  ' text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/40 hover:bg-[#38BDF8]/20';
              } else if (!cell.isCurrentMonth) {
                cellClass += ' text-[#475569] hover:bg-[#111F30] hover:text-[#94A3B8]';
              } else {
                cellClass += ' text-[#D1DCE8] hover:bg-[#111F30] hover:text-white';
              }

              return (
                <button
                  key={`${cell.dayNumber}-${idx}`}
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() => !cell.isDisabled && handleSelectDate(cell.date)}
                  className={cellClass}
                  aria-label={formatDateFull(cell.date)}
                  aria-selected={cell.isSelected}
                  title={formatDateFull(cell.date)}
                >
                  <span>{cell.dayNumber}</span>

                  {/* Weather Marker indicator dot if provided */}
                  {marker && (
                    <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                      <span
                        className={`w-1 h-1 rounded-full ${
                          marker.alertLevel === 'red'
                            ? 'bg-[#EF4444]'
                            : marker.alertLevel === 'orange'
                            ? 'bg-[#F97316]'
                            : marker.alertLevel === 'yellow'
                            ? 'bg-[#FBBF24]'
                            : 'bg-[#22C7A0]'
                        }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 4. FOOTER: Today Action & Quick Context */}
      {showToday && !isMonthYearPickerOpen && (
        <div className="mt-3 pt-2.5 border-t border-[#162331] flex items-center justify-between text-[11px] font-mono">
          <button
            type="button"
            onClick={handleGoToToday}
            className="flex items-center gap-1 text-[#38BDF8] hover:text-[#7DD3FC] transition-colors py-0.5 px-2 rounded-lg hover:bg-[#38BDF8]/10 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Today</span>
          </button>
          <span className="text-[#64748B] text-[10px]">
            {value ? formatDateFull(value) : 'No date selected'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DateCalendar;
