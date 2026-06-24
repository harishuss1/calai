// Pure helpers for building a month grid. `month` is 0-indexed (Jan = 0).

import { toDayString } from "@/utils/date";

export interface CalendarMonth {
  year: number;
  /** 0-indexed month (January = 0). */
  month: number;
}

/** Single-letter weekday headers, starting Sunday. */
export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/** This month, as a CalendarMonth. */
export function currentMonth(): CalendarMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

/** "June 2026" */
export function monthTitle({ year, month }: CalendarMonth): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Shift a month by `delta` months, wrapping the year as needed. */
export function addMonths({ year, month }: CalendarMonth, delta: number): CalendarMonth {
  const shifted = new Date(year, month + delta, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}

/**
 * Grid cells for the month, padded to whole weeks. Each cell is a day string
 * ("YYYY-MM-DD") or null for leading/trailing blanks.
 */
export function buildMonthGrid({ year, month }: CalendarMonth): (string | null)[] {
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(toDayString(new Date(year, month, day)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Day-of-month number from a "YYYY-MM-DD" string, e.g. "2026-06-09" → 9. */
export function dayOfMonth(dayString: string): number {
  return Number.parseInt(dayString.slice(8), 10);
}
