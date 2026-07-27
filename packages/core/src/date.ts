import type { CalendarDate, Time } from "./types.js";

/** Construct a `CalendarDate`. Values are stored as-is (no calendar validation). */
export function calendarDate(year: number, month: number, day: number): CalendarDate {
  return { year, month, day };
}

/** Construct a `Time`, defaulting missing units to 0. */
export function time(hour = 0, minute = 0, second = 0, millisecond = 0): Time {
  return { hour, minute, second, millisecond };
}

/** Type guard for a `CalendarDate`-shaped value. */
export function isCalendarDate(value: unknown): value is CalendarDate {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["year"] === "number" &&
    typeof v["month"] === "number" &&
    typeof v["day"] === "number"
  );
}

/**
 * Compare two calendar dates by (year, month, day). Calendar-independent because
 * both operands are assumed to be in the same calendar system.
 * Returns <0, 0, or >0.
 */
export function compareCalendarDate(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/** True when two calendar dates refer to the same day. */
export function isSameCalendarDay(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** True when two calendar dates share year + month. */
export function isSameCalendarMonth(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Clamp `date` into the inclusive `[min, max]` window (either bound optional). */
export function clampCalendarDate(
  date: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
): CalendarDate {
  if (min && compareCalendarDate(date, min) < 0) return min;
  if (max && compareCalendarDate(date, max) > 0) return max;
  return date;
}

/** Smallest of the given dates (ignores nullish). */
export function minCalendarDate(...dates: (CalendarDate | null | undefined)[]): CalendarDate | null {
  return dates.reduce<CalendarDate | null>((acc, d) => {
    if (!d) return acc;
    if (!acc) return d;
    return compareCalendarDate(d, acc) < 0 ? d : acc;
  }, null);
}

/** Largest of the given dates (ignores nullish). */
export function maxCalendarDate(...dates: (CalendarDate | null | undefined)[]): CalendarDate | null {
  return dates.reduce<CalendarDate | null>((acc, d) => {
    if (!d) return acc;
    if (!acc) return d;
    return compareCalendarDate(d, acc) > 0 ? d : acc;
  }, null);
}

/** True when `date` is within the inclusive `[start, end]` window. */
export function isWithinRange(date: CalendarDate, start: CalendarDate, end: CalendarDate): boolean {
  return compareCalendarDate(date, start) >= 0 && compareCalendarDate(date, end) <= 0;
}

/** A stable string key for a calendar date (useful for maps/sets). */
export function dateKey(date: CalendarDate): string {
  return `${date.year}-${date.month}-${date.day}`;
}
