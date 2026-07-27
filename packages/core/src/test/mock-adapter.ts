import { generateMonthGrid } from "../grid.js";
import type { CalendarAdapter, CalendarDate, Weekday } from "../types.js";

/**
 * A minimal Gregorian-style adapter backed by JS `Date`, used to exercise the
 * calendar-agnostic core in unit tests without depending on a real adapter
 * package. It intentionally mirrors the algorithm the real Gregorian adapter
 * uses, so tests here also validate that shared logic.
 */
const toJs = (d: CalendarDate) => new Date(d.year, d.month - 1, d.day);
const fromJs = (d: Date): CalendarDate => ({
  year: d.getFullYear(),
  month: d.getMonth() + 1,
  day: d.getDate(),
});

export const mockAdapter: CalendarAdapter = {
  id: "mock",
  defaultLocale: "en-US",
  today: () => ({ year: 2026, month: 7, day: 27 }),
  toDate: (d) => toJs(d),
  fromDate: fromJs,
  addDays: (d, n) => fromJs(new Date(d.year, d.month - 1, d.day + n)),
  addMonths: (d, n) => fromJs(new Date(d.year, d.month - 1 + n, d.day)),
  addYears: (d, n) => fromJs(new Date(d.year + n, d.month - 1, d.day)),
  startOfMonth: (d) => ({ year: d.year, month: d.month, day: 1 }),
  endOfMonth: (d) => fromJs(new Date(d.year, d.month, 0)),
  daysInMonth: (y, m) => new Date(y, m, 0).getDate(),
  monthsInYear: () => 12,
  isLeapYear: (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0,
  getWeekday: (d) => toJs(d).getDay() as Weekday,
  getMonthGrid: (v, o) => generateMonthGrid(mockAdapter, v, o),
  getYearRange: (a, s) => Array.from({ length: s }, (_, i) => a - Math.floor(s / 2) + i),
  getWeek: () => 1,
  compare: (a, b) => a.year - b.year || a.month - b.month || a.day - b.day,
  isSameDay: (a, b) => a.year === b.year && a.month === b.month && a.day === b.day,
  isSameMonth: (a, b) => a.year === b.year && a.month === b.month,
  isSameYear: (a, b) => a.year === b.year,
  format: () => "",
  parse: () => null,
  getMonthNames: () => [],
  getWeekdayNames: () => [],
  getEraNames: () => [],
  isRTL: () => false,
};
