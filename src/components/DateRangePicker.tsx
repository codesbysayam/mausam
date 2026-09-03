import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  MONTH_NAMES,
  DAY_NAMES,
  generateCalendarGrid,
  isSameDay,
  formatDateShort,
} from '../utils/dateUtils';
import { triggerHaptic } from '../utils/haptics';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DateRangePreset {
  label: string;
  getRange: () => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  startDate?: Date | null;
  endDate?: Date | null;
  onChange: (range: any) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: DateRangePreset[];
  className?: string;
  onApply?: () => void;
  placeholder?: string;
  align?: 'left' | 'right';
  inline?: boolean;
}

export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    getRange: () => {
      const now = new Date();
      return { startDate: now, endDate: now };
    },
  },
  {
    label: 'Yesterday',
    getRange: () => {
      const yest = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return { startDate: yest, endDate: yest };
    },
  },
  {
    label: 'Last 7 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: 'Last 14 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: 'Last 30 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: 'Previous Month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: 'Custom Range',
    getRange: () => ({
      startDate: null,
      endDate: null,
    }),
  },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  className = '',
  onApply,
  placeholder = 'Select Date Range',
  align = 'left',
  inline = false,
}) => {
  // Normalize incoming range
  const normalizedStart = value?.startDate ?? startDate ?? null;
  const normalizedEnd = value?.endDate ?? endDate ?? null;

  const initialDate = normalizedStart || new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectingStart, setSelectingStart] = useState<boolean>(true);
  const [tempRange, setTempRange] = useState<DateRange>({
    startDate: normalizedStart,
    endDate: normalizedEnd,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempRange({
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });
  }, [normalizedStart, normalizedEnd]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

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

  const triggerChange = (finalRange: DateRange) => {
    // Check if parent expects array [Date, Date] or DateRange object
    if (startDate !== undefined && endDate !== undefined) {
      (onChange as any)([finalRange.startDate, finalRange.endDate]);
    } else if (Array.isArray(value)) {
      (onChange as any)([finalRange.startDate, finalRange.endDate]);
    } else {
      onChange(finalRange);
    }
  };

  const handleCellClick = (clickedDate: Date) => {
    triggerHaptic('selection');
    if (selectingStart || !tempRange.startDate) {
      const newRange = { startDate: clickedDate, endDate: null };
      setTempRange(newRange);
      setSelectingStart(false);
    } else {
      let start = tempRange.startDate;
      let end = clickedDate;
      if (end.getTime() < start.getTime()) {
        const swap = start;
        start = end;
        end = swap;
      }
      const finalRange = { startDate: start, endDate: end };
      setTempRange(finalRange);
      setSelectingStart(true);
      triggerChange(finalRange);
    }
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    triggerHaptic('selection');
    const range = preset.getRange();
    setTempRange(range);
    setSelectingStart(true);
    if (range.startDate) {
      setViewYear(range.startDate.getFullYear());
      setViewMonth(range.startDate.getMonth());
    }
    triggerChange(range);
  };

  const calendarDays = generateCalendarGrid(
    viewYear,
    viewMonth,
    null,
    tempRange.startDate,
    tempRange.endDate,
    minDate,
    maxDate
  );

  const displayLabel =
    normalizedStart && normalizedEnd
      ? `${formatDateShort(normalizedStart)} - ${formatDateShort(normalizedEnd)}`
      : normalizedStart
      ? `${formatDateShort(normalizedStart)} - ...`
      : placeholder;

  const calendarContent = (
    <div
      className={`date-range-picker-content flex flex-col md:flex-row bg-[#0B141E] border border-[#1E2D3D] rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-w-[95vw] sm:max-w-none ${className}`}
      role="region"
      aria-label="Date Range Calendar"
    >
      {/* PRESETS SIDEBAR */}
      {presets.length > 0 && (
        <div className="w-full md:w-40 bg-[#071018] border-b md:border-b-0 md:border-r border-[#162331] p-3 flex flex-row md:flex-col gap-1 overflow-x-auto">
          <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider px-2 py-1 hidden md:block">
            Quick Presets
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className="whitespace-nowrap text-left px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* CALENDAR BODY */}
      <div className="p-4 w-full sm:w-[320px] select-none">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#162331]">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-xs font-mono font-bold text-[#F4F7FA]">
            <span className="text-[#38BDF8] mr-1">{MONTH_NAMES[viewMonth]}</span>
            <span>{viewYear}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-[#93A4B8] hover:text-white hover:bg-[#111F30] transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAY_NAMES.map((day, idx) => (
            <span
              key={day}
              className={`text-[10px] font-mono font-semibold uppercase ${
                idx === 0 || idx === 6 ? 'text-[#F59E0B]' : 'text-[#64748B]'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
          {calendarDays.map((cell, idx) => {
            let cellStyle =
              'relative h-8 rounded-lg text-xs font-mono font-semibold flex items-center justify-center transition-all cursor-pointer';

            if (cell.isDisabled) {
              cellStyle += ' text-[#334155] opacity-40 cursor-not-allowed';
            } else if (cell.isRangeStart || cell.isRangeEnd) {
              cellStyle +=
                ' bg-[#1499E8] text-white font-bold shadow-[0_0_10px_rgba(20,153,232,0.6)] z-10';
            } else if (cell.isInRange) {
              cellStyle += ' bg-[#1499E8]/20 text-[#38BDF8] rounded-none';
            } else if (cell.isToday) {
              cellStyle +=
                ' text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20';
            } else if (!cell.isCurrentMonth) {
              cellStyle += ' text-[#475569] hover:bg-[#111F30]';
            } else {
              cellStyle += ' text-[#D1DCE8] hover:bg-[#111F30] hover:text-white';
            }

            return (
              <button
                key={`${cell.dayNumber}-${idx}`}
                type="button"
                disabled={cell.isDisabled}
                onClick={() => !cell.isDisabled && handleCellClick(cell.date)}
                className={cellStyle}
                aria-label={cell.date.toDateString()}
              >
                <span>{cell.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Range Display & Controls */}
        <div className="mt-3 pt-2.5 border-t border-[#162331] flex items-center justify-between text-[11px] font-mono">
          <div className="text-[#93A4B8] truncate mr-2">
            {tempRange.startDate ? (
              <span>
                <span className="text-[#38BDF8]">{formatDateShort(tempRange.startDate)}</span>
                {tempRange.endDate && (
                  <>
                    {' → '}
                    <span className="text-[#38BDF8]">{formatDateShort(tempRange.endDate)}</span>
                  </>
                )}
              </span>
            ) : (
              <span className="text-[#64748B]">Select start & end date</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                const fresh = { startDate: null, endDate: null };
                setTempRange(fresh);
                triggerChange(fresh);
              }}
              className="px-2 py-1 text-[#93A4B8] hover:text-white hover:bg-[#111F30] rounded-lg transition-colors cursor-pointer text-[10px]"
            >
              Reset
            </button>
            {onApply && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  onApply();
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 bg-[#1499E8] hover:bg-[#0B72B9] text-white rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Apply</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return calendarContent;
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          triggerHaptic('tap');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 bg-[#080E16] hover:bg-[#111F30] border border-[#1E2E40] hover:border-[#38BDF8]/50 text-[#D1DCE8] hover:text-white rounded-2xl px-3.5 py-2.5 text-xs font-mono transition-all cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span className="font-medium truncate max-w-[180px]">{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${
            isOpen ? 'rotate-180 text-[#38BDF8]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          } animate-fade-in shadow-2xl`}
        >
          {calendarContent}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
