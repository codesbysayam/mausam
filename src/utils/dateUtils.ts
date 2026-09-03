/**
 * MAUSAM Date & Calendar Utilities
 * Provides comprehensive date formatting, comparison, parsing, and calendar grid calculation.
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_NAMES_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Safely parse any date representation into a valid Date object.
 */
export function parseDateSafe(input: any): Date {
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input;
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

/**
 * Format date in short human format: "01 Sep 2026"
 */
export function formatDateShort(dateInput: Date | string | number): string {
  const d = parseDateSafe(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date in standard display: "1 Sep" or "Today, 1 Sep"
 */
export function formatDateCompact(dateInput: Date | string | number, includeYear = false): string {
  const d = parseDateSafe(dateInput);
  const day = d.getDate();
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  if (includeYear) {
    return `${day} ${month} ${d.getFullYear()}`;
  }
  return `${day} ${month}`;
}

/**
 * Format date in full format: "Tuesday, 01 September 2026"
 */
export function formatDateFull(dateInput: Date | string | number): string {
  const d = parseDateSafe(dateInput);
  const weekday = DAY_NAMES_FULL[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Format date as ISO YYYY-MM-DD
 */
export function formatDateISO(dateInput: Date | string | number): string {
  const d = parseDateSafe(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates represent the same calendar day
 */
export function isSameDay(d1: Date | null | undefined, d2: Date | null | undefined): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if a date falls strictly within a [startDate, endDate] range (inclusive)
 */
export function isDateInRange(
  date: Date,
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): boolean {
  if (!startDate || !endDate) return false;
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
  const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  return t >= Math.min(s, e) && t <= Math.max(s, e);
}

/**
 * Check if a date is disabled based on min/max bounds and explicit disabled list
 */
export function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates: Date[] = []
): boolean {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    if (target < min) return true;
  }

  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    if (target > max) return true;
  }

  for (const d of disabledDates) {
    if (isSameDay(date, d)) return true;
  }

  return false;
}

/**
 * Generate 35 or 42 grid cells representing the full calendar month view
 * including padding days from previous and next months.
 */
export interface CalendarGridDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
}

export function generateCalendarGrid(
  year: number,
  month: number,
  selectedDate?: Date | null,
  rangeStart?: Date | null,
  rangeEnd?: Date | null,
  minDate?: Date,
  maxDate?: Date,
  disabledDates: Date[] = []
): CalendarGridDay[] {
  const today = new Date();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = lastDayOfMonth.getDate();

  const days: CalendarGridDay[] = [];

  // Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      isInRange: isDateInRange(date, rangeStart, rangeEnd),
      isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
      isRangeEnd: rangeEnd ? isSameDay(date, rangeEnd) : false,
      isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      isInRange: isDateInRange(date, rangeStart, rangeEnd),
      isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
      isRangeEnd: rangeEnd ? isSameDay(date, rangeEnd) : false,
      isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
    });
  }

  // Next month padding days to complete row (multiple of 7)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      isInRange: isDateInRange(date, rangeStart, rangeEnd),
      isRangeStart: rangeStart ? isSameDay(date, rangeStart) : false,
      isRangeEnd: rangeEnd ? isSameDay(date, rangeEnd) : false,
      isDisabled: isDateDisabled(date, minDate, maxDate, disabledDates),
    });
  }

  return days;
}
